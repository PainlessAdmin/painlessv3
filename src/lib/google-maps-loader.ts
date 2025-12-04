/**
 * GOOGLE MAPS LOADER
 *
 * Utility for async loading of Google Maps API.
 * - Loads the script only once globally
 * - Can be triggered to preload after step 2
 * - Steps that need Maps wait for this loader
 */

let loadingPromise: Promise<void> | null = null;
let isLoaded = false;

/**
 * Check if Google Maps is already loaded
 */
export function isGoogleMapsLoaded(): boolean {
  return isLoaded || (typeof window !== 'undefined' && typeof (window as any).google !== 'undefined' && (window as any).google.maps?.places);
}

/**
 * Load Google Maps API asynchronously
 * Returns a promise that resolves when Maps is ready
 */
export function loadGoogleMaps(): Promise<void> {
  // Already loaded
  if (isGoogleMapsLoaded()) {
    isLoaded = true;
    return Promise.resolve();
  }

  // Already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load Google Maps on server'));
      return;
    }

    // Get API key from meta tag (injected by Astro)
    const apiKeyMeta = document.querySelector('meta[name="google-maps-api-key"]');
    const apiKey = apiKeyMeta?.getAttribute('content');

    if (!apiKey) {
      reject(new Error('Google Maps API key not found'));
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Script exists, wait for it to load
      const checkLoaded = setInterval(() => {
        if (isGoogleMapsLoaded()) {
          clearInterval(checkLoaded);
          isLoaded = true;
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!isGoogleMapsLoaded()) {
          reject(new Error('Google Maps failed to load'));
        }
      }, 10000);
      return;
    }

    // Create and append script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Wait for the API to be fully initialized
      const checkReady = setInterval(() => {
        if (isGoogleMapsLoaded()) {
          clearInterval(checkReady);
          isLoaded = true;
          resolve();
        }
      }, 50);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if (!isGoogleMapsLoaded()) {
          reject(new Error('Google Maps API not ready after load'));
        }
      }, 5000);
    };

    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
}

/**
 * Preload Google Maps in the background (doesn't wait for it to complete)
 */
export function preloadGoogleMaps(): void {
  loadGoogleMaps().catch(() => {
    // Silently ignore preload errors
  });
}
