import api from "@/services/apiClient";
import type {
  ChargingRecommendation,
  ChargingStation,
  LocationData,
} from "@/types/ev";

// Request Types
export type ChargingTimeRequest = {
  batteryCapacityKWh: number;
  currentChargePercent: number;
  targetChargePercent: number;
  chargerPowerKw: number;
  chargerType?: "AC" | "DC";
  efficiency?: number; // 0.5-1.0, default 0.9
};

export type ChargingTimeResult = {
  estimatedTimeMinutes: number;
  estimatedTimeHours: number;
  energyNeededKWh: number;
  chargerType: string;
  chargerPowerKw: number;
  explanation: string;
};

export type CostEstimateRequest = {
  energyKWh: number;
  location: string;
  chargerType?: "home" | "public_ac" | "public_dc";
  timeOfDay?: "peak" | "off_peak" | "standard";
};

export type CostEstimateResult = {
  estimatedCostNaira: number;
  pricePerKWhNaira: number;
  location: string;
  chargerType: string;
  timeOfDay: string;
  breakdown: {
    energyCost: number;
    serviceFee?: number;
    tax?: number;
  };
  explanation: string;
};

export type RecommendationRequest = {
  car: {
    make: string;
    model: string;
    year: number;
    batteryCapacityKWh?: number;
    rangeKm?: number;
  };
  location: {
    city: string;
    state?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  preferences?: {
    dailyDrivingKm?: number;
    chargingFrequency?: "daily" | "weekly" | "as_needed";
    budget?: {
      min?: number;
      max?: number;
    };
    prioritizeSpeed?: boolean;
    homeCharging?: boolean;
  };
};

export type RecommendationStation = {
  name: string;
  address: string;
  distance: number; // in km
  chargerTypes: string[];
  maxPowerKw: number;
  availability?: string;
  estimatedCostRange?: string;
  amenities?: string[];
  confidence: number;
};

export type RecommendationResult = {
  chargingStations: RecommendationStation[];
  chargingStrategy: {
    recommendedFrequency: string;
    optimalChargeRange: string;
    estimatedMonthlyCost: string;
    tips: string[];
  };
  carInsights: {
    efficiency?: string;
    rangeAnxietyLevel: string;
    suitabilityScore: number;
    considerations: string[];
  };
  confidence: number;
  sources?: string[];
};

export type PricingInfo = {
  currency: string;
  lastUpdated: string;
  rates: {
    home: {
      peak: number;
      off_peak: number;
      standard: number;
    };
    public_ac: {
      peak: number;
      off_peak: number;
      standard: number;
    };
    public_dc: {
      peak: number;
      off_peak: number;
      standard: number;
    };
  };
  notes: string[];
};

// Helper function to estimate coordinates from distance and user location
// Uses a simple bearing calculation to spread stations around user location
function estimateCoordinatesFromDistance(
  userLat: number,
  userLng: number,
  distanceKm: number,
  bearingDegrees: number = 0
): { latitude: number; longitude: number } {
  // Earth's radius in kilometers
  const R = 6371;
  // Convert distance to radians
  const d = distanceKm / R;
  // Convert bearing to radians
  const bearing = (bearingDegrees * Math.PI) / 180;
  const lat1 = (userLat * Math.PI) / 180;
  const lng1 = (userLng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(bearing)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lng2 * 180) / Math.PI,
  };
}

// Helper function to convert API recommendation to frontend ChargingRecommendation
function convertToChargingRecommendation(
  apiStation: RecommendationStation,
  userLocation: LocationData | null,
  index: number
): ChargingRecommendation {
  // Convert km to miles for distance
  const distanceMiles = apiStation.distance * 0.621371;

  // Parse charger types
  const connectors = apiStation.chargerTypes.map((type, idx) => ({
    id: `connector-${index}-${idx}`,
    type: type as ChargingStation["connectors"][0]["type"],
    power: apiStation.maxPowerKw,
    status: "available" as const,
    pricePerKwh: 165, // Default, will be replaced by actual pricing
  }));

  // Determine availability status
  const availability = apiStation.availability || "Medium";
  const totalConnectors = connectors.length || 1; // Ensure at least 1
  let availableConnectors = totalConnectors;
  if (availability === "Low") {
    availableConnectors = Math.max(1, Math.floor(totalConnectors * 0.3));
  } else if (availability === "Medium") {
    availableConnectors = Math.max(1, Math.floor(totalConnectors * 0.6));
  }

  // Estimate coordinates from distance (spread stations around user location)
  // Use different bearings to spread them around
  const bearing = (index * 45) % 360; // Spread stations in 45-degree increments
  const estimatedCoords = userLocation
    ? estimateCoordinatesFromDistance(
        userLocation.latitude,
        userLocation.longitude,
        apiStation.distance,
        bearing
      )
    : { latitude: 0, longitude: 0 };

  // Create a ChargingStation object
  const station: ChargingStation = {
    id: `station-${apiStation.name
      .replace(/\s+/g, "-")
      .toLowerCase()}-${index}`,
    name: apiStation.name,
    address: apiStation.address,
    latitude: estimatedCoords.latitude,
    longitude: estimatedCoords.longitude,
    connectors,
    amenities: apiStation.amenities || [],
    pricing: {
      basePrice: 165, // Default NGN per kWh
      currency: "NGN",
    },
    availability: {
      availableConnectors,
      totalConnectors,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.0, // Default rating
    operatingHours: {
      monday: { open: "00:00", close: "23:59", is24Hours: true },
      tuesday: { open: "00:00", close: "23:59", is24Hours: true },
      wednesday: { open: "00:00", close: "23:59", is24Hours: true },
      thursday: { open: "00:00", close: "23:59", is24Hours: true },
      friday: { open: "00:00", close: "23:59", is24Hours: true },
      saturday: { open: "00:00", close: "23:59", is24Hours: true },
      sunday: { open: "00:00", close: "23:59", is24Hours: true },
    },
    distance: distanceMiles,
  };

  // Determine priority based on confidence and distance
  let priority: "high" | "medium" | "low" = "medium";
  if (apiStation.confidence > 0.7 && distanceMiles < 5) {
    priority = "high";
  } else if (apiStation.confidence < 0.4 || distanceMiles > 25) {
    priority = "low";
  }

  // Estimate cost (simplified)
  const estimatedCost = connectors[0]?.pricePerKwh
    ? (50 * connectors[0].pricePerKwh) / 1000
    : 10; // Rough estimate for 50kWh

  // Estimate time based on power
  const estimatedTime = Math.ceil((50 / apiStation.maxPowerKw) * 60);

  return {
    stationId: station.id,
    station,
    reason: `Recommended based on ${availability.toLowerCase()} availability, ${distanceMiles.toFixed(
      1
    )} miles away`,
    estimatedCost,
    estimatedTime,
    priority,
    factors: [
      {
        type: "distance",
        impact:
          distanceMiles < 5
            ? "positive"
            : distanceMiles > 25
            ? "negative"
            : "neutral",
        description: `${distanceMiles.toFixed(1)} miles from your location`,
        weight: 0.3,
      },
      {
        type: "availability",
        impact:
          availability === "High"
            ? "positive"
            : availability === "Low"
            ? "negative"
            : "neutral",
        description: `${availability} availability`,
        weight: 0.25,
      },
      {
        type: "cost",
        impact: "neutral",
        description: apiStation.estimatedCostRange || "Cost estimate available",
        weight: 0.2,
      },
    ],
  };
}

// API Functions
export async function calculateChargingTime(
  payload: ChargingTimeRequest
): Promise<ChargingTimeResult> {
  const { data } = await api.post<ChargingTimeResult>(
    "/ai/advisor/charging-time",
    payload
  );
  return data;
}

export async function calculateCostEstimate(
  payload: CostEstimateRequest
): Promise<CostEstimateResult> {
  const { data } = await api.post<CostEstimateResult>(
    "/ai/advisor/cost-estimate",
    payload
  );
  return data;
}

export async function getRecommendations(
  payload: RecommendationRequest,
  userLocation: LocationData | null
): Promise<{
  recommendations: ChargingRecommendation[];
  strategy: RecommendationResult["chargingStrategy"];
  insights: RecommendationResult["carInsights"];
  confidence: number;
}> {
  const { data } = await api.post<RecommendationResult>(
    "/ai/advisor/recommendations",
    payload
  );

  // Convert API stations to ChargingRecommendation format
  const recommendations = data.chargingStations.map((station, index) =>
    convertToChargingRecommendation(station, userLocation, index)
  );

  return {
    recommendations,
    strategy: data.chargingStrategy,
    insights: data.carInsights,
    confidence: data.confidence,
  };
}

export async function getPricingInfo(params?: {
  location?: string;
  charger_type?: "home" | "public_ac" | "public_dc";
}): Promise<PricingInfo> {
  const { data } = await api.get<PricingInfo>("/ai/advisor/pricing", {
    params,
  });
  return data;
}

// Service object for convenience
export const carAdvisorService = {
  calculateChargingTime,
  calculateCostEstimate,
  getRecommendations,
  getPricingInfo,
};
