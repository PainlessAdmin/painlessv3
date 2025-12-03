/**
 * STEP 8: ADDRESS SELECTION (COMBINED)
 *
 * Combined from/to address selection with:
 * - Map at the top showing route
 * - From and To address fields below
 * - Real-time route display
 * - Distance and drive time shown under map
 */

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setFromAddress,
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
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import { Select } from '@/components/ui/select';

// Floor level options
const FLOOR_LEVELS = [
  { value: '-1', label: 'Basement (-1)' },
  { value: '0', label: 'Ground floor (0)' },
  { value: '1', label: '1st floor' },
  { value: '2', label: '2nd floor' },
  { value: '3', label: '3rd floor' },
  { value: '4', label: '4th floor' },
  { value: '5', label: '5th floor' },
  { value: '6', label: '6th floor' },
  { value: '7', label: '7th floor' },
  { value: '8', label: '8th floor' },
  { value: '9', label: '9th floor' },
  { value: '10', label: '10th floor' },
];

// Google Maps is loaded globally via script tag
// Using any types to avoid TS errors for the global Google object
declare const google: any;

// Depot location (Bristol BS10 5PN)
const DEPOT_LOCATION = {
  lat: 51.5074,
  lng: -2.6051,
  address: CALCULATOR_CONFIG.company.depot,
};

export function Step8AddressSelection() {
  const state = useStore(calculatorStore);

  const [fromAddress, setFromAddressLocal] = useState<AddressData | null>(state.fromAddress);
  const [toAddress, setToAddressLocal] = useState<AddressData | null>(state.toAddress);
  const [fromInputValue, setFromInputValue] = useState(state.fromAddress?.formatted || '');
  const [toInputValue, setToInputValue] = useState(state.toAddress?.formatted || '');
  const [fromFloorLevel, setFromFloorLevel] = useState<string>(
    state.fromAddress?.floorLevel?.toString() ?? '0'
  );
  const [toFloorLevel, setToFloorLevel] = useState<string>(
    state.toAddress?.floorLevel?.toString() ?? '0'
  );
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<DistanceData | null>(state.distances);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const fromAutocompleteRef = useRef<any>(null);
  const toAutocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !googleLoaded) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        zoom: 8,
        center: { lat: 51.4545, lng: -2.5879 }, // Bristol
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
  }, [googleLoaded]);

  // Initialize From autocomplete
  useEffect(() => {
    if (!fromInputRef.current || !googleLoaded) return;

    fromAutocompleteRef.current = new google.maps.places.Autocomplete(fromInputRef.current, {
      componentRestrictions: { country: 'gb' },
      types: ['geocode'],
      fields: ['formatted_address', 'geometry', 'address_components'],
    });

    fromAutocompleteRef.current.addListener('place_changed', () => {
      const place = fromAutocompleteRef.current?.getPlace();

      if (!place || !place.formatted_address) {
        toast.warning('Please select an address from the dropdown');
        return;
      }

      const postcodeComponent = place.address_components?.find(
        (c: any) => c.types.includes('postal_code')
      );

      const addressData: AddressData = {
        formatted: place.formatted_address,
        postcode: postcodeComponent?.long_name || '',
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
      };

      setFromAddressLocal(addressData);
      setFromInputValue(place.formatted_address);

      // If we have both addresses, calculate route
      if (toAddress) {
        calculateRoute(addressData, toAddress);
      }
    });

    return () => {
      if (fromAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(fromAutocompleteRef.current);
      }
    };
  }, [googleLoaded, toAddress]);

  // Initialize To autocomplete
  useEffect(() => {
    if (!toInputRef.current || !googleLoaded) return;

    toAutocompleteRef.current = new google.maps.places.Autocomplete(toInputRef.current, {
      componentRestrictions: { country: 'gb' },
      types: ['geocode'],
      fields: ['formatted_address', 'geometry', 'address_components'],
    });

    toAutocompleteRef.current.addListener('place_changed', () => {
      const place = toAutocompleteRef.current?.getPlace();

      if (!place || !place.formatted_address) {
        toast.warning('Please select an address from the dropdown');
        return;
      }

      const postcodeComponent = place.address_components?.find(
        (c: any) => c.types.includes('postal_code')
      );

      const addressData: AddressData = {
        formatted: place.formatted_address,
        postcode: postcodeComponent?.long_name || '',
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
      };

      setToAddressLocal(addressData);
      setToInputValue(place.formatted_address);

      // If we have both addresses, calculate route
      if (fromAddress) {
        calculateRoute(fromAddress, addressData);
      }
    });

    return () => {
      if (toAutocompleteRef.current) {
        google.maps.event.clearInstanceListeners(toAutocompleteRef.current);
      }
    };
  }, [googleLoaded, fromAddress]);

  // Calculate route
  const calculateRoute = async (from: AddressData, to: AddressData) => {
    if (!googleLoaded) return;

    setIsCalculatingRoute(true);

    try {
      const directionsService = new google.maps.DirectionsService();
      const distanceService = new google.maps.DistanceMatrixService();

      const origin = from.lat && from.lng
        ? { lat: from.lat, lng: from.lng }
        : from.formatted;

      const destination = to.lat && to.lng
        ? { lat: to.lat, lng: to.lng }
        : to.formatted;

      // Get route for display
      const routeResult = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      // Display on map
      if (routeResult.routes[0]?.legs[0] && directionsRendererRef.current && mapInstanceRef.current) {
        directionsRendererRef.current.setDirections(routeResult);
        if (routeResult.routes[0].bounds) {
          mapInstanceRef.current.fitBounds(routeResult.routes[0].bounds);
        }
      }

      // Calculate all three legs
      const distanceResult = await distanceService.getDistanceMatrix({
        origins: [DEPOT_LOCATION, from.formatted, to.formatted],
        destinations: [from.formatted, to.formatted, DEPOT_LOCATION],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      });

      if (distanceResult.rows) {
        const depotToFrom = distanceResult.rows[0]?.elements[0];
        const fromToTo = distanceResult.rows[1]?.elements[1];
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
      toast.error('Could not calculate route. Please check both addresses.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Handle continue
  const handleContinue = () => {
    if (!fromAddress || !toAddress) {
      toast.warning('Please enter both addresses');
      return;
    }

    // Include floor levels in address data
    setFromAddress({
      ...fromAddress,
      floorLevel: parseInt(fromFloorLevel, 10),
    });
    setToAddress({
      ...toAddress,
      floorLevel: parseInt(toFloorLevel, 10),
    });
    if (distanceInfo) {
      setDistances(distanceInfo);
    }
    nextStep();
  };

  // Can continue? Require both addresses AND calculated distances
  const canContinue = fromAddress && toAddress && distanceInfo && !isCalculatingRoute;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Where are you moving from and to?
        </h2>
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className="relative w-full h-[250px] bg-muted">
          <div ref={mapRef} className="absolute inset-0 w-full h-full" style={{ minHeight: '250px' }} />
          {!googleLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Spinner className="h-8 w-8" />
              <span className="ml-2 text-muted-foreground">Loading map...</span>
            </div>
          )}
          {isCalculatingRoute && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
              <Spinner className="h-8 w-8" />
              <span className="ml-2 text-muted-foreground">Calculating route...</span>
            </div>
          )}
        </div>

        {/* Distance info - shown under map */}
        {distanceInfo && (
          <div className="p-4 bg-muted/30 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(distanceInfo.customerDistance)} mi
                </div>
                <div className="text-sm text-muted-foreground">Distance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {formatDuration(distanceInfo.customerDriveMinutes)}
                </div>
                <div className="text-sm text-muted-foreground">Drive time</div>
              </div>
            </div>

            {/* Long distance warning */}
            {distanceInfo.customerDistance > 100 && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm text-center">
                <strong>Long distance move</strong> - This may require an overnight stay for our team (included in quote).
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Address Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* From Address */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium">
              A
            </div>
            <Label htmlFor="from-address" className="font-medium">Moving from</Label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              📍
            </span>
            <Input
              ref={fromInputRef}
              id="from-address"
              type="text"
              placeholder="Enter current address"
              value={fromInputValue}
              onChange={(e) => {
                setFromInputValue(e.target.value);
                if (fromAddress) {
                  setFromAddressLocal(null);
                  setDistanceInfo(null);
                }
              }}
              className="pl-10"
              autoComplete="off"
            />
          </div>
          {fromAddress && (
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
              <span>✓</span>
              <span className="truncate">{fromAddress.postcode || 'Address selected'}</span>
            </div>
          )}
          {/* Floor level dropdown */}
          <div className="mt-3">
            <Label htmlFor="from-floor" className="text-sm text-muted-foreground">
              Which floor?
            </Label>
            <Select
              id="from-floor"
              value={fromFloorLevel}
              onChange={(e) => setFromFloorLevel(e.target.value)}
              className="mt-1"
            >
              {FLOOR_LEVELS.map((floor) => (
                <option key={floor.value} value={floor.value}>
                  {floor.label}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {/* To Address */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
              B
            </div>
            <Label htmlFor="to-address" className="font-medium">Moving to</Label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              📍
            </span>
            <Input
              ref={toInputRef}
              id="to-address"
              type="text"
              placeholder="Enter new address"
              value={toInputValue}
              onChange={(e) => {
                setToInputValue(e.target.value);
                if (toAddress) {
                  setToAddressLocal(null);
                  setDistanceInfo(null);
                }
              }}
              className="pl-10"
              autoComplete="off"
            />
          </div>
          {toAddress && (
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
              <span>✓</span>
              <span className="truncate">{toAddress.postcode || 'Address selected'}</span>
            </div>
          )}
          {/* Floor level dropdown */}
          <div className="mt-3">
            <Label htmlFor="to-floor" className="text-sm text-muted-foreground">
              Which floor?
            </Label>
            <Select
              id="to-floor"
              value={toFloorLevel}
              onChange={(e) => setToFloorLevel(e.target.value)}
              className="mt-1"
            >
              {FLOOR_LEVELS.map((floor) => (
                <option key={floor.value} value={floor.value}>
                  {floor.label}
                </option>
              ))}
            </Select>
          </div>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleContinue}
        canGoNext={!!canContinue}
        nextLabel="Continue"
      />
    </div>
  );
}

// Helper functions
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

export default Step8AddressSelection;
