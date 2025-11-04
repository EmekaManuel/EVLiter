import type { LocationData } from "@/types/ev";

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Default fallback location (Lagos, Nigeria - Victoria Island)
 * Used when user's location cannot be determined
 */
export const FALLBACK_LOCATION: LocationData = {
  latitude: 6.4281, // Victoria Island, Lagos
  longitude: 3.4219,
};

/**
 * Gets a fallback location when user location is unavailable
 * @returns Default location (Lagos, Nigeria)
 */
export function getFallbackLocation(): LocationData {
  return FALLBACK_LOCATION;
}

/**
 * Gets the user's current location using the browser's Geolocation API
 * @param options - Optional configuration for geolocation
 * @param useFallback - If true, returns fallback location instead of throwing error when location is unavailable
 * @returns Promise with LocationData containing latitude and longitude
 * @throws Error if geolocation is not supported or permission is denied (unless useFallback is true)
 */
export async function getUserLocation(
  options: GeolocationOptions = {},
  useFallback: boolean = false
): Promise<LocationData> {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    if (useFallback) {
      console.warn("Geolocation not supported, using fallback location");
      return FALLBACK_LOCATION;
    }
    throw new Error("Geolocation is not supported by your browser");
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: false, // Set to false for better compatibility, especially on macOS
    timeout: 15000, // Increased to 15 seconds to give more time
    maximumAge: 60000, // Allow cached position up to 1 minute old
    ...options,
  };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        resolve(locationData);
      },
      (error) => {
        let errorMessage = "Failed to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. This may be due to:\n" +
              "- Location services being disabled on your device\n" +
              "- Poor GPS/Wi-Fi signal\n" +
              "- Browser location restrictions\n\n" +
              "The app will continue to work, but location-based features may be limited.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage =
              "Unable to determine your location. The app will continue to work normally.";
        }

        // Log the actual error code for debugging
        console.warn("Geolocation error:", {
          code: error.code,
          message: error.message,
        });

        // If fallback is enabled, return fallback location instead of rejecting
        if (useFallback) {
          console.info("Using fallback location:", FALLBACK_LOCATION);
          resolve(FALLBACK_LOCATION);
          return;
        }

        reject(new Error(errorMessage));
      },
      defaultOptions
    );
  });
}

/**
 * Watches the user's location for continuous updates
 * @param onSuccess - Callback function called with LocationData on each update
 * @param onError - Callback function called when an error occurs
 * @param options - Optional configuration for geolocation
 * @returns A function to stop watching the location
 */
export function watchUserLocation(
  onSuccess: (location: LocationData) => void,
  onError: (error: Error) => void,
  options: GeolocationOptions = {}
): () => void {
  if (!navigator.geolocation) {
    onError(new Error("Geolocation is not supported by your browser"));
    return () => {};
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options,
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      onSuccess(locationData);
    },
    (error) => {
      let errorMessage = "Failed to watch location";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission denied";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
      }

      onError(new Error(errorMessage));
    },
    defaultOptions
  );

  // Return a cleanup function to stop watching
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Calculates the distance between two points using the Haversine formula
 * @param lat1 - Latitude of the first point
 * @param lon1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lon2 - Longitude of the second point
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
