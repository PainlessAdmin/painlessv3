/**
 * STEP 8: FROM ADDRESS
 *
 * Google Places autocomplete for origin address.
 * Also offers "Use my current location" option.
 */

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setFromAddress,
  nextStep,
  prevStep,
  type AddressData,
} from '@/lib/calculator-store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

// Declare google maps types
declare global {
  interface Window {
    google?: typeof google;
  }
}

export function Step8FromAddress() {
  const state = useStore(calculatorStore);

  const [address, setAddress] = useState<AddressData | null>(state.fromAddress);
  const [inputValue, setInputValue] = useState(state.fromAddress?.formatted || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [accuracyWarning, setAccuracyWarning] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

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

    // Poll for Google Maps to load
    const interval = setInterval(() => {
      if (checkGoogle()) {
        clearInterval(interval);
      }
    }, 100);

    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!googleLoaded) {
        console.warn('Google Maps not loaded after timeout');
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!inputRef.current || useManualEntry || !googleLoaded) return;

    // Create autocomplete instance
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'gb' },
      types: ['geocode'], // Allows addresses, postcodes, and places
      fields: ['formatted_address', 'geometry', 'address_components'],
    });

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (!place || !place.formatted_address) {
        setError('Please select an address from the dropdown');
        return;
      }

      // Extract postcode
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
      setAccuracyWarning(null); // Clear accuracy warning when selecting from autocomplete
    });

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [useManualEntry, googleLoaded]);

  // Handle "Use my current location"
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    if (!googleLoaded) {
      setError('Maps service not available. Please enter your address manually.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAccuracyWarning(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Don't use cached position
        });
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Warn if accuracy is poor (> 1km - common on desktop without GPS)
      if (accuracy > 1000) {
        setAccuracyWarning(
          `Location accuracy is ${Math.round(accuracy / 1000)}km. Please verify your address or enter it manually for accurate pricing.`
        );
      } else if (accuracy > 500) {
        setAccuracyWarning(
          `Location accuracy is ${Math.round(accuracy)}m. Please verify your address is correct.`
        );
      }

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({
        location: { lat: latitude, lng: longitude },
      });

      if (response.results[0]) {
        const result = response.results[0];
        const postcodeComponent = result.address_components?.find(
          c => c.types.includes('postal_code')
        );

        const addressData: AddressData = {
          formatted: result.formatted_address,
          postcode: postcodeComponent?.long_name || '',
          lat: latitude,
          lng: longitude,
        };

        setAddress(addressData);
        setInputValue(result.formatted_address);
      } else {
        setError('Could not determine your address');
      }
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enter your address manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Please enter your address manually.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please enter your address manually.');
            break;
        }
      } else {
        setError('Could not get your location. Please enter your address manually.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual entry toggle
  const handleManualEntryToggle = () => {
    setUseManualEntry(!useManualEntry);
    setError(null);
    setAccuracyWarning(null);
  };

  // Handle continue
  const handleContinue = () => {
    if (!address) {
      setError('Please enter your address');
      return;
    }

    setFromAddress(address);
    nextStep();
  };

  // Handle manual postcode entry
  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    const addressData: AddressData = {
      formatted,
      postcode: postcode.toUpperCase(),
    };

    setAddress(addressData);
    setInputValue(formatted);
    setUseManualEntry(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Where are you moving from?
        </h2>
        <p className="text-muted-foreground mt-2">
          Enter your current address
        </p>
      </div>

      {/* Address Input */}
      {!useManualEntry ? (
        <Card className="p-6 space-y-4">
          {/* Autocomplete Input */}
          <div className="space-y-2">
            <Label htmlFor="address">Start typing your address</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                📍
              </span>
              <Input
                ref={inputRef}
                id="address"
                type="text"
                placeholder="e.g., 42 Queen's Road, Bristol"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (address) setAddress(null); // Clear if editing
                }}
                className="pl-10"
                autoComplete="off"
              />
            </div>
            {!googleLoaded && (
              <p className="text-xs text-muted-foreground">
                Loading address search...
              </p>
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

          {/* Accuracy Warning */}
          {accuracyWarning && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-amber-800">{accuracyWarning}</p>
                <button
                  type="button"
                  className="text-xs text-amber-700 hover:text-amber-900 underline mt-1"
                  onClick={handleManualEntryToggle}
                >
                  Enter address manually instead
                </button>
              </div>
            </div>
          )}

          {/* Current Location Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Getting location...
              </>
            ) : (
              <>
                📍 Use my current location
              </>
            )}
          </Button>

          {/* Manual Entry Link */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline"
              onClick={handleManualEntryToggle}
            >
              Can't find your address? Enter manually
            </button>
          </div>
        </Card>
      ) : (
        /* Manual Entry Form */
        <Card className="p-6">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input
                id="line1"
                name="line1"
                placeholder="House number and street"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                name="line2"
                placeholder="Apartment, unit, etc. (optional)"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City/Town *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Bristol"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  name="postcode"
                  placeholder="BS8 1RE"
                  required
                  className="uppercase"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleManualEntryToggle}
              >
                Back to search
              </Button>
              <Button type="submit" className="flex-1">
                Use this address
              </Button>
            </div>
          </form>
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
        canGoNext={!!address}
        nextLabel="Continue"
      />
    </div>
  );
}

export default Step8FromAddress;
