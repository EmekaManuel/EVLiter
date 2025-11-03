import api from "@/services/apiClient";
import type {
  ChargingStation as UiChargingStation,
  ConnectorType,
} from "@/types/ev";

// API schemas (lightweight TS equivalents of the user's zod schemas)
export type ChargingStationApi = {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  connectorTypes: string[];
  powerOutput: number;
  realtimeAvailability: "Available" | "Occupied" | "Out of Service";
  isCompanyStation: boolean;
  distance?: number; // km
  amenities?: string[];
  operatingHours?: string;
  pricePerKWh?: number;
};

export type SearchChargingStationsRequest = {
  location: string;
  connectorType?: "Type2" | "CCS" | "CHAdeMO" | "Type1" | "GB/T" | "All Types";
  minPower?: number;
  maxDistance?: number; // km
  coordinates?: { lat: number; lng: number };
};

export type SearchChargingStationsResponse = {
  stations: ChargingStationApi[];
  totalCount: number;
  companyStationsCount: number;
  aiSuggestedCount: number;
};

// Mapper from API station to UI station type used by the page
function mapApiToUiStation(s: ChargingStationApi): UiChargingStation {
  const randomTotal = Math.max(2, Math.floor(Math.random() * 8) + 2);
  const randomAvailable = Math.max(
    0,
    Math.min(randomTotal, Math.floor(randomTotal * 0.6))
  );
  const price = Math.max(150, Math.round((s.pricePerKWh ?? 165) * 100) / 100);
  const connectorEntries = s.connectorTypes.map((type, idx) => ({
    id: `${s.id}-c${idx + 1}`,
    type: type.replace("Type 2", "Type 2") as ConnectorType as ConnectorType,
    power: Math.max(7, Math.min(150, Math.round(s.powerOutput))),
    status: (idx < randomAvailable ? "available" : "occupied") as
      | "available"
      | "occupied"
      | "out_of_order",
    pricePerKwh: price / 100, // convert Naira-ish mock to dollars-ish mock
  }));

  return {
    id: s.id,
    name: s.name,
    address: s.address,
    latitude: s.location.lat,
    longitude: s.location.lng,
    connectors: connectorEntries,
    amenities: s.amenities ?? ["WiFi", "Restroom", "Parking"],
    pricing: { basePrice: price / 100, currency: "USD" },
    availability: {
      availableConnectors: randomAvailable,
      totalConnectors: randomTotal,
      lastUpdated: new Date().toISOString(),
    },
    distance: s.distance ? s.distance * 0.621371 : undefined, // km -> miles
    rating: 4 + Math.round(Math.random() * 10) / 10, // 4.0 - 5.0
    imageUrl: "/assets/ev-image.jpg",
    operatingHours: {
      monday: { open: "00:00", close: "23:59", is24Hours: true },
      tuesday: { open: "00:00", close: "23:59", is24Hours: true },
      wednesday: { open: "00:00", close: "23:59", is24Hours: true },
      thursday: { open: "00:00", close: "23:59", is24Hours: true },
      friday: { open: "00:00", close: "23:59", is24Hours: true },
      saturday: { open: "00:00", close: "23:59", is24Hours: true },
      sunday: { open: "00:00", close: "23:59", is24Hours: true },
    },
  };
}

export async function searchChargingStations(
  params: SearchChargingStationsRequest
) {
  const { data } = await api.get<SearchChargingStationsResponse>(
    "/ai/charging-stations",
    {
      params,
    }
  );
  return {
    ...data,
    uiStations: data.stations.map(mapApiToUiStation),
  };
}

export async function searchChargingStationsPost(
  body: SearchChargingStationsRequest
) {
  const { data } = await api.post<SearchChargingStationsResponse>(
    "/ai/charging-stations/search",
    body
  );
  return {
    ...data,
    uiStations: data.stations.map(mapApiToUiStation),
  };
}

export async function getCompanyStations() {
  const { data } = await api.get<{
    stations: ChargingStationApi[];
    count: number;
  }>("/ai/charging-stations/company");
  return {
    ...data,
    uiStations: data.stations.map(mapApiToUiStation),
  };
}

export const chargingStationsApi = {
  search: searchChargingStations,
  searchPost: searchChargingStationsPost,
  getCompany: getCompanyStations,
};
