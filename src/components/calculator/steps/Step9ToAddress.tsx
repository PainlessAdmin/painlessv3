/**
 * STEP 9: TO ADDRESS
 *
 * Google Places autocomplete for destination.
 * After selection:
 * - Calculate distance and drive time
 * - Display route on map
 * - Show both addresses
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

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
      types: ['geocode'], // Allows addresses, postcodes, and places
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

  // Store pending route result to display after map initializes
  const pendingRouteRef = useRef<google.maps.DirectionsResult | null>(null);

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

      // If we have a pending route, display it now
      if (pendingRouteRef.current && directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(pendingRouteRef.current);
        if (mapInstanceRef.current && pendingRouteRef.current.routes[0]?.bounds) {
          mapInstanceRef.current.fitBounds(pendingRouteRef.current.routes[0].bounds);
        }
        pendingRouteRef.current = null;
      }
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

      // Display route on map (or store for later if map not ready)
      if (routeResult.routes[0]?.legs[0]) {
        if (directionsRendererRef.current && mapInstanceRef.current) {
          directionsRendererRef.current.setDirections(routeResult);
          if (routeResult.routes[0].bounds) {
            mapInstanceRef.current.fitBounds(routeResult.routes[0].bounds);
          }
        } else {
          // Map not ready yet, store route for later
          pendingRouteRef.current = routeResult;
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

    if (!line1 || !city) {
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

    setToAddress(address);
    if (distanceInfo) {
      setDistances(distanceInfo);
    }
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Where are you moving to?
        </h2>
        <p className="text-muted-foreground mt-2">
          Enter your new address
        </p>
      </div>

      {/* From Address Summary */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium">
            A
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Moving from</p>
            <p className="text-sm font-medium text-foreground">
              {state.fromAddress?.formatted || 'Not set'}
            </p>
          </div>
          <span className="text-xl">🏠</span>
        </div>
      </Card>

      {/* To Address Input */}
      {!useManualEntry ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
              B
            </div>
            <span className="font-medium text-foreground">Destination</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-address">Start typing your new address</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                className="pl-10"
                autoComplete="off"
              />
            </div>
            {!googleLoaded && (
              <p className="text-xs text-muted-foreground">Loading address search...</p>
            )}
          </div>

          {/* Selected Address Display */}
          {address && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-emerald-600">✓</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">
                  {address.formatted}
                </p>
                {address.postcode && (
                  <p className="text-xs text-emerald-600">
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
              className="text-sm text-muted-foreground hover:text-foreground underline"
              onClick={() => setUseManualEntry(true)}
            >
              Can't find your address? Enter manually
            </button>
          </div>
        </Card>
      ) : (
        /* Manual Entry Form */
        <Card className="p-6">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
                B
              </div>
              <span className="font-medium text-foreground">Enter destination manually</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input id="line1" name="line1" placeholder="House number and street" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input id="line2" name="line2" placeholder="Apartment, unit, etc. (optional)" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City/Town *</Label>
                <Input id="city" name="city" placeholder="London" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input id="postcode" name="postcode" placeholder="SW1A 2AA" required className="uppercase" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setUseManualEntry(false)}>
                Back to search
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? <><Spinner className="mr-2 h-4 w-4" /> Verifying...</> : 'Use this address'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Route Map & Distance Info */}
      {address && state.fromAddress && (
        <Card className="overflow-hidden">
          {/* Map */}
          <div className="relative w-full h-[300px]">
            <div ref={mapRef} className="absolute inset-0 w-full h-full" style={{ minHeight: '300px' }} />
            {isCalculatingRoute && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
                <Spinner className="h-8 w-8" />
                <span className="ml-2 text-muted-foreground">Calculating route...</span>
              </div>
            )}
          </div>

          {/* Distance Info */}
          {distanceInfo && (
            <div className="p-4 bg-muted/30">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(distanceInfo.customerDistance)} mi
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Distance
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatDuration(distanceInfo.customerDriveMinutes)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Drive time
                  </div>
                </div>
              </div>

              {/* Long distance warning */}
              {distanceInfo.customerDistance > 100 && (
                <Alert className="mt-4 border-amber-500 bg-amber-50">
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
        <Card className="p-4">
          <h3 className="font-medium text-foreground text-sm mb-3">Your journey</h3>
          <div className="space-y-3">
            {/* From */}
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-medium">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{state.fromAddress.formatted}</p>
              </div>
            </div>

            {/* Connector */}
            <div className="flex items-center gap-3 pl-3">
              <div className="w-0.5 h-6 bg-muted-foreground/30 ml-2.5"></div>
              <div className="text-xs text-muted-foreground">
                {Math.round(distanceInfo.customerDistance)} miles • {formatDuration(distanceInfo.customerDriveMinutes)}
              </div>
            </div>

            {/* To */}
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-medium">
                B
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{address.formatted}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleContinue}
        canGoNext={!!address && !isCalculatingRoute}
        nextLabel="Continue"
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
