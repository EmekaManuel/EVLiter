/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type {
  CarInfo,
  ChargingStation,
  ChargingRecommendation,
  ChargingSession,
  AdminAnalytics,
  StationSearchFilters,
  LocationData,
  ApiResponse,
  PaginatedResponse,
} from "@/types/ev";

// Google Maps type declarations
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Geocoder: new () => {
          geocode: (
            request: any,
            callback: (results: any[] | null, status: any) => void
          ) => void;
        };
        GeocoderResult: any;
        GeocoderStatus: any;
      };
    };
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// AI Car Recognition Service
export const carRecognitionService = {
  // Recognize car by VIN
  recognizeByVin: async (vin: string): Promise<ApiResponse<CarInfo>> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai/car-recognition/vin`,
        {
          vin,
          apiKey:
            import.meta.env.VITE_CLAUDE_API_KEY ||
            import.meta.env.VITE_OPENAI_API_KEY,
        }
      );
      return response.data;
    } catch {
      throw new Error("Failed to recognize car by VIN");
    }
  },

  // Recognize car by make/model/year
  recognizeByModel: async (
    make: string,
    model: string,
    year: number
  ): Promise<ApiResponse<CarInfo>> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai/car-recognition/model`,
        {
          make,
          model,
          year,
          apiKey:
            import.meta.env.VITE_CLAUDE_API_KEY ||
            import.meta.env.VITE_OPENAI_API_KEY,
        }
      );
      return response.data;
    } catch {
      throw new Error("Failed to recognize car by model");
    }
  },

  // Get car image from AI
  getCarImage: async (carInfo: CarInfo): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/car-image`, {
        make: carInfo.make,
        model: carInfo.model,
        year: carInfo.year,
        apiKey:
          import.meta.env.VITE_CLAUDE_API_KEY ||
          import.meta.env.VITE_OPENAI_API_KEY,
      });
      return response.data.imageUrl;
    } catch {
      throw new Error("Failed to get car image");
    }
  },
};

// Google Maps Service
export const mapsService = {
  // Initialize Google Maps
  initializeMap: (elementId: string, options: any) => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        const element = document.getElementById(elementId);
        if (!element) {
          reject(new Error(`Element with id "${elementId}" not found`));
          return;
        }
        const map = new window.google.maps.Map(element, options);
        resolve(map);
      } else {
        reject(new Error("Google Maps not loaded"));
      }
    });
  },

  // Get user's current location
  getCurrentLocation: (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  // Calculate distance between two points
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Geocode address to coordinates
  geocodeAddress: async (address: string): Promise<LocationData> => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      return new Promise((resolve, reject) => {
        geocoder.geocode(
          { address },
          (results: any[] | null, status: string) => {
            if (status === "OK" && results && results[0]) {
              const location = results[0].geometry.location;
              resolve({
                latitude: location.lat(),
                longitude: location.lng(),
                address: results[0].formatted_address,
              });
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });
    } catch {
      throw new Error("Failed to geocode address");
    }
  },
};

// Charging Station Service
export const chargingStationService = {
  // Get nearby charging stations
  getNearbyStations: async (
    location: LocationData,
    radius: number = 25,
    filters?: StationSearchFilters
  ): Promise<ApiResponse<ChargingStation[]>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stations/nearby`, {
        params: {
          lat: location.latitude,
          lng: location.longitude,
          radius,
          ...filters,
        },
      });
      return response.data;
    } catch {
      throw new Error("Failed to get nearby stations");
    }
  },

  // Get station details
  getStationDetails: async (
    stationId: string
  ): Promise<ApiResponse<ChargingStation>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stations/${stationId}`);
      return response.data;
    } catch {
      throw new Error("Failed to get station details");
    }
  },

  // Update station availability
  updateAvailability: async (
    stationId: string
  ): Promise<ApiResponse<ChargingStation>> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/stations/${stationId}/availability`
      );
      return response.data;
    } catch {
      throw new Error("Failed to update station availability");
    }
  },

  // Search stations
  searchStations: async (
    query: string,
    filters?: StationSearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<ChargingStation>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stations/search`, {
        params: {
          q: query,
          page,
          limit,
          ...filters,
        },
      });
      return response.data;
    } catch {
      throw new Error("Failed to search stations");
    }
  },
};

// Smart Advisor Service
export const smartAdvisorService = {
  // Get charging recommendations
  getRecommendations: async (
    carInfo: CarInfo,
    location: LocationData,
    preferences?: {
      prioritizeCost?: boolean;
      prioritizeTime?: boolean;
      maxDistance?: number;
    }
  ): Promise<ApiResponse<ChargingRecommendation[]>> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/advisor/recommendations`,
        {
          carInfo,
          location,
          preferences,
        }
      );
      return response.data;
    } catch {
      throw new Error("Failed to get recommendations");
    }
  },

  // Calculate charging time
  calculateChargingTime: async (
    carInfo: CarInfo,
    stationPower: number,
    currentBatteryLevel: number,
    targetBatteryLevel: number = 80
  ): Promise<number> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/advisor/charging-time`,
        {
          carInfo,
          stationPower,
          currentBatteryLevel,
          targetBatteryLevel,
        }
      );
      return response.data.chargingTimeMinutes;
    } catch {
      throw new Error("Failed to calculate charging time");
    }
  },

  // Get cost estimate
  getCostEstimate: async (
    carInfo: CarInfo,
    station: ChargingStation,
    currentBatteryLevel: number,
    targetBatteryLevel: number = 80
  ): Promise<number> => {
    try {
      const energyNeeded =
        ((targetBatteryLevel - currentBatteryLevel) / 100) *
        carInfo.batteryCapacity;
      const cost = energyNeeded * station.pricing.basePrice;
      return cost;
    } catch {
      throw new Error("Failed to calculate cost estimate");
    }
  },
};

// User Dashboard Service
export const userDashboardService = {
  // Get user's charging sessions
  getChargingSessions: async (
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<ChargingSession>> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/sessions`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch {
      throw new Error("Failed to get charging sessions");
    }
  },

  // Get user statistics
  getUserStats: async (userId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/stats`);
      return response.data;
    } catch {
      throw new Error("Failed to get user statistics");
    }
  },

  // Start charging session
  startChargingSession: async (
    userId: string,
    stationId: string,
    connectorId: string
  ): Promise<ApiResponse<ChargingSession>> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/sessions`, {
        userId,
        stationId,
        connectorId,
      });
      return response.data;
    } catch {
      throw new Error("Failed to start charging session");
    }
  },

  // End charging session
  endChargingSession: async (
    sessionId: string
  ): Promise<ApiResponse<ChargingSession>> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/sessions/${sessionId}/end`
      );
      return response.data;
    } catch {
      throw new Error("Failed to end charging session");
    }
  },
};

// Admin Dashboard Service
export const adminDashboardService = {
  // Get analytics
  getAnalytics: async (): Promise<ApiResponse<AdminAnalytics>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/analytics`);
      return response.data;
    } catch {
      throw new Error("Failed to get analytics");
    }
  },

  // Update station data
  updateStation: async (
    stationId: string,
    updates: Partial<ChargingStation>
  ): Promise<ApiResponse<ChargingStation>> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/stations/${stationId}`,
        updates
      );
      return response.data;
    } catch {
      throw new Error("Failed to update station");
    }
  },

  // Add new station
  addStation: async (
    station: Omit<ChargingStation, "id">
  ): Promise<ApiResponse<ChargingStation>> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/stations`,
        station
      );
      return response.data;
    } catch {
      throw new Error("Failed to add station");
    }
  },

  // Delete station
  deleteStation: async (stationId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/stations/${stationId}`
      );
      return response.data;
    } catch {
      throw new Error("Failed to delete station");
    }
  },
};
