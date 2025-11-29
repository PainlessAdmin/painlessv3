/**
 * STEP 8: FROM ADDRESS
 *
 * Google Places autocomplete for origin address.
 * Also offers "Use my current location" option.
 * Enhanced with white card container styling.
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { StepNavigation } from '@/components/calculator/progress-bar-react';

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
      types: ['address'],
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

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

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
  };

  // Handle continue
  const handleContinue = () => {
    if (!address) {
      setError('Please enter your address');
      return;
    }

    if (!address.postcode) {
      setError('Please enter a complete address with postcode');
      return;
    }

    setFromAddress(address);
    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  // Handle manual postcode entry
  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          Where are you moving from?
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter your current address
        </p>
      </div>

      {/* Address Input - White Card Container */}
      {!useManualEntry ? (
        <Card className="p-6 md:p-8 bg-white shadow-lg max-w-lg mx-auto">
          <div className="space-y-5">
            {/* Autocomplete Input */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Start typing your address
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
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

            {/* Current Location Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full py-4 text-base"
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
                  <span className="mr-2">📍</span>
                  Use my current location
                </>
              )}
            </Button>

            {/* Manual Entry Link */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary underline transition-colors"
                onClick={handleManualEntryToggle}
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
            <div className="space-y-2">
              <Label htmlFor="line1" className="text-sm font-medium">
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="line1"
                name="line1"
                placeholder="House number and street"
                required
                className="py-4 input-enhanced"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="line2" className="text-sm font-medium">
                Address Line 2
              </Label>
              <Input
                id="line2"
                name="line2"
                placeholder="Apartment, unit, etc. (optional)"
                className="py-4 input-enhanced"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  City/Town <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Bristol"
                  required
                  className="py-4 input-enhanced"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode" className="text-sm font-medium">
                  Postcode <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="postcode"
                  name="postcode"
                  placeholder="BS8 1RE"
                  required
                  className="py-4 uppercase input-enhanced"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-4"
                onClick={handleManualEntryToggle}
              >
                ← Back to search
              </Button>
              <Button type="submit" className="flex-1 py-4">
                Use this address
              </Button>
            </div>
          </form>
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
        continueDisabled={!address}
        continueLabel="Continue"
      />
    </div>
  );
}

export default Step8FromAddress;
