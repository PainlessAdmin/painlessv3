/**
 * STEP 9: TO ADDRESS
 *
 * Google Places autocomplete for destination.
 * After selection:
 * - Calculate distance and drive time
 * - Display route on map
 * - Show both addresses
 * Enhanced with white card container styling.
 */

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setToAddress,
  setDistances,
  nextStep,
  prevStep,
  type AddressData,
  type DistanceData,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { StepNavigation } from '@/components/calculator/progress-bar-react';

// Depot location (Bristol BS10 5PN)
const DEPOT_LOCATION = {
  lat: 51.5074,
  lng: -2.6051,
  address: CALCULATOR_CONFIG.company.depot,
};

export function Step9ToAddress() {
  const state = useStore(calculatorStore);

  const [address, setAddress] = useState<AddressData | null>(state.toAddress);
  const [inputValue, setInputValue] = useState(state.toAddress?.formatted || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<DistanceData | null>(state.distances);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogle = () => {
      if (typeof google !== 'undefined' && google.maps?.places) {
        setGoogleLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogle()) return;

    const interval = setInterval(() => {
      if (checkGoogle()) {
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!inputRef.current || useManualEntry || !googleLoaded) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'gb' },
      types: ['address'],
      fields: ['formatted_address', 'geometry', 'address_components'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (!place || !place.formatted_address) {
        setError('Please select an address from the dropdown');
        return;
      }

      const postcodeComponent = place.address_components?.find(
        c => c.types.includes('postal_code')
      );

      const addressData: AddressData = {
        formatted: place.formatted_address,
        postcode: postcodeComponent?.long_name || '',
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
      };

      setAddress(addressData);
      setInputValue(place.formatted_address);
      setError(null);

      // Calculate route after address selection
      calculateRoute(addressData);
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [useManualEntry, googleLoaded]);

  // Initialize map when we have both addresses
  useEffect(() => {
    if (!mapRef.current || !state.fromAddress || !address || !googleLoaded) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 51.4545, lng: -2.5879 },
        disableDefaultUI: true,
        zoomControl: true,
      });

      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 4,
        },
      });
    }
  }, [state.fromAddress, address, googleLoaded]);

  // Calculate route and all distances
  const calculateRoute = async (toAddress: AddressData) => {
    if (!state.fromAddress || !googleLoaded) return;

    setIsCalculatingRoute(true);
    setError(null);

    try {
      const directionsService = new google.maps.DirectionsService();
      const distanceService = new google.maps.DistanceMatrixService();

      // Get customer route (from → to) for display
      const origin = state.fromAddress.lat && state.fromAddress.lng
        ? { lat: state.fromAddress.lat, lng: state.fromAddress.lng }
        : state.fromAddress.formatted;

      const destination = toAddress.lat && toAddress.lng
        ? { lat: toAddress.lat, lng: toAddress.lng }
        : toAddress.formatted;

      const routeResult = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      // Display route on map
      if (routeResult.routes[0]?.legs[0] && directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(routeResult);
        if (mapInstanceRef.current && routeResult.routes[0].bounds) {
          mapInstanceRef.current.fitBounds(routeResult.routes[0].bounds);
        }
      }

      // Calculate all three legs: depot→from, from→to, to→depot
      const distanceResult = await distanceService.getDistanceMatrix({
        origins: [
          DEPOT_LOCATION,
          state.fromAddress.formatted,
          toAddress.formatted,
        ],
        destinations: [
          state.fromAddress.formatted,
          toAddress.formatted,
          DEPOT_LOCATION,
        ],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      });

      if (distanceResult.rows) {
        // depot → from
        const depotToFrom = distanceResult.rows[0]?.elements[0];
        // from → to
        const fromToTo = distanceResult.rows[1]?.elements[1];
        // to → depot
        const toToDepot = distanceResult.rows[2]?.elements[2];

        const depotToFromMiles = metersToMiles(depotToFrom?.distance?.value || 0);
        const fromToToMiles = metersToMiles(fromToTo?.distance?.value || 0);
        const toToDepotMiles = metersToMiles(toToDepot?.distance?.value || 0);

        const depotToFromMinutes = (depotToFrom?.duration?.value || 0) / 60;
        const fromToToMinutes = (fromToTo?.duration?.value || 0) / 60;
        const toToDepotMinutes = (toToDepot?.duration?.value || 0) / 60;

        const totalDriveTimeHours = (depotToFromMinutes + fromToToMinutes + toToDepotMinutes) / 60;

        const distances: DistanceData = {
          depotToFrom: depotToFromMiles,
          fromToTo: fromToToMiles,
          toToDepot: toToDepotMiles,
          driveTimeHours: totalDriveTimeHours,
          customerDistance: fromToToMiles,
          customerDriveMinutes: fromToToMinutes,
        };

        setDistanceInfo(distances);
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      setError('Could not calculate route. Please check both addresses.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Handle manual entry
  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const line1 = formData.get('line1') as string;
    const line2 = formData.get('line2') as string;
    const city = formData.get('city') as string;
    const postcode = formData.get('postcode') as string;

    if (!line1 || !city || !postcode) {
      setError('Please fill in all required fields');
      return;
    }

    const formatted = [line1, line2, city, postcode].filter(Boolean).join(', ');

    setIsLoading(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ address: formatted + ', UK' });

      if (response.results[0]) {
        const location = response.results[0].geometry.location;
        const addressData: AddressData = {
          formatted,
          postcode: postcode.toUpperCase(),
          lat: location.lat(),
          lng: location.lng(),
        };

        setAddress(addressData);
        setInputValue(formatted);
        setUseManualEntry(false);

        await calculateRoute(addressData);
      } else {
        setError('Could not find this address. Please check and try again.');
      }
    } catch {
      setError('Could not verify this address. Please try the search instead.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue
  const handleContinue = () => {
    if (!address) {
      setError('Please enter your destination address');
      return;
    }

    if (!address.postcode) {
      setError('Please enter a complete address with postcode');
      return;
    }

    setToAddress(address);
    if (distanceInfo) {
      setDistances(distanceInfo);
    }
    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  return (
    <div className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          Where are you moving to?
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter your new address
        </p>
      </div>

      {/* From Address Summary */}
      <Card className="p-4 bg-emerald-50 border-emerald-200 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-semibold">
            A
          </div>
          <div className="flex-1">
            <p className="text-xs text-emerald-600 font-medium">Moving from</p>
            <p className="text-sm font-semibold text-emerald-800">
              {state.fromAddress?.formatted || 'Not set'}
            </p>
          </div>
          <span className="text-2xl">🏠</span>
        </div>
      </Card>

      {/* To Address Input */}
      {!useManualEntry ? (
        <Card className="p-6 md:p-8 bg-white shadow-lg max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              B
            </div>
            <span className="font-semibold text-foreground">Destination</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to-address" className="text-sm font-medium">
                Start typing your new address
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                  📍
                </span>
                <Input
                  ref={inputRef}
                  id="to-address"
                  type="text"
                  placeholder="e.g., 10 Downing Street, London"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (address) {
                      setAddress(null);
                      setDistanceInfo(null);
                    }
                  }}
                  className="pl-12 py-6 text-base input-enhanced"
                  autoComplete="off"
                />
              </div>
              {!googleLoaded && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Spinner className="h-3 w-3" />
                  Loading address search...
                </p>
              )}
            </div>

            {/* Selected Address Display */}
            {address && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  ✓
                </div>
                <div className="flex-1">
                  <p className="font-medium text-emerald-800">
                    {address.formatted}
                  </p>
                  {address.postcode && (
                    <p className="text-sm text-emerald-600">
                      Postcode: {address.postcode}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Manual Entry Link */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary underline transition-colors"
                onClick={() => setUseManualEntry(true)}
              >
                Can't find your address? Enter manually
              </button>
            </div>
          </div>
        </Card>
      ) : (
        /* Manual Entry Form */
        <Card className="p-6 md:p-8 bg-white shadow-lg max-w-lg mx-auto">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                B
              </div>
              <span className="font-semibold text-foreground">Enter destination manually</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="line1" className="text-sm font-medium">
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Input id="line1" name="line1" placeholder="House number and street" required className="py-4 input-enhanced" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="line2" className="text-sm font-medium">
                Address Line 2
              </Label>
              <Input id="line2" name="line2" placeholder="Apartment, unit, etc. (optional)" className="py-4 input-enhanced" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  City/Town <span className="text-destructive">*</span>
                </Label>
                <Input id="city" name="city" placeholder="London" required className="py-4 input-enhanced" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode" className="text-sm font-medium">
                  Postcode <span className="text-destructive">*</span>
                </Label>
                <Input id="postcode" name="postcode" placeholder="SW1A 2AA" required className="py-4 uppercase input-enhanced" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 py-4" onClick={() => setUseManualEntry(false)}>
                ← Back to search
              </Button>
              <Button type="submit" className="flex-1 py-4" disabled={isLoading}>
                {isLoading ? <><Spinner className="mr-2 h-4 w-4" /> Verifying...</> : 'Use this address'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Route Map & Distance Info */}
      {address && state.fromAddress && (
        <Card className="overflow-hidden max-w-lg mx-auto shadow-lg">
          {/* Map */}
          <div ref={mapRef} className="w-full h-[200px] md:h-[250px] bg-muted">
            {isCalculatingRoute && (
              <div className="flex items-center justify-center h-full">
                <Spinner className="h-8 w-8" />
                <span className="ml-2 text-muted-foreground">Calculating route...</span>
              </div>
            )}
          </div>

          {/* Distance Info */}
          {distanceInfo && (
            <div className="p-5 bg-gradient-to-b from-primary/10 to-transparent">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {Math.round(distanceInfo.customerDistance)} mi
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Distance
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {formatDuration(distanceInfo.customerDriveMinutes)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Drive time
                  </div>
                </div>
              </div>

              {/* Long distance warning */}
              {distanceInfo.customerDistance > 100 && (
                <Alert className="mt-4 border-amber-400 bg-amber-50">
                  <AlertDescription className="text-amber-800 text-sm">
                    <strong>Long distance move</strong> - This may require an overnight stay for our team.
                    This is included in your quote.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Journey Summary */}
      {address && state.fromAddress && distanceInfo && (
        <Card className="p-5 max-w-lg mx-auto bg-white shadow-lg">
          <h3 className="font-semibold text-foreground text-sm mb-4">Your journey</h3>
          <div className="space-y-3">
            {/* From */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-sm font-semibold">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{state.fromAddress.formatted}</p>
              </div>
            </div>

            {/* Connector */}
            <div className="flex items-center gap-3 pl-4">
              <div className="w-0.5 h-8 bg-primary/30 ml-3"></div>
              <div className="text-xs text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                {Math.round(distanceInfo.customerDistance)} miles • {formatDuration(distanceInfo.customerDriveMinutes)}
              </div>
            </div>

            {/* To */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                B
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{address.formatted}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <StepNavigation
        showBack={true}
        onBack={handleBack}
        onContinue={handleContinue}
        continueDisabled={!address || isCalculatingRoute}
        continueLabel="Continue"
      />
    </div>
  );
}

// ===================
// HELPER FUNCTIONS
// ===================

function metersToMiles(meters: number): number {
  return meters / 1609.34;
}

function formatDuration(minutes: number): string {
  const mins = Math.round(minutes);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins}m`;
}

export default Step9ToAddress;
