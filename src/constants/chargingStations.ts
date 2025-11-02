import type { ChargingStation } from "@/types/ev";

/**
 * Nigerian Charging Stations Data
 * Locations are in major cities: Lagos, Abuja, Port Harcourt, Kano, Ibadan
 * Pricing in NGN (Nigerian Naira)
 */
export const CHARGING_STATIONS: ChargingStation[] = [
  // Lagos Stations
  {
    id: "lagos-victoria-island",
    name: "Victoria Island Premium Charging Hub",
    address: "Ahmadu Bello Way, Victoria Island, Lagos",
    latitude: 6.4281,
    longitude: 3.4219,
    connectors: [
      {
        id: "conn-vi-1",
        type: "CCS",
        power: 150,
        status: "available",
        pricePerKwh: 180,
      },
      {
        id: "conn-vi-2",
        type: "CCS",
        power: 150,
        status: "available",
        pricePerKwh: 180,
      },
      {
        id: "conn-vi-3",
        type: "Type 2",
        power: 22,
        status: "available",
        pricePerKwh: 120,
      },
      {
        id: "conn-vi-4",
        type: "Type 2",
        power: 22,
        status: "occupied",
        pricePerKwh: 120,
      },
    ],
    amenities: [
      "WiFi",
      "Restrooms",
      "Coffee Shop",
      "Shopping Mall",
      "Parking",
      "Security",
    ],
    pricing: {
      basePrice: 165,
      peakPrice: 180,
      sessionFee: 500,
      currency: "NGN",
    },
    availability: {
      availableConnectors: 3,
      totalConnectors: 4,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.7,
    operatingHours: {
      monday: { open: "06:00", close: "23:00" },
      tuesday: { open: "06:00", close: "23:00" },
      wednesday: { open: "06:00", close: "23:00" },
      thursday: { open: "06:00", close: "23:00" },
      friday: { open: "06:00", close: "23:00" },
      saturday: { open: "06:00", close: "23:00" },
      sunday: { open: "08:00", close: "22:00" },
    },
  },
  {
    id: "lagos-lekki",
    name: "Lekki Phase 1 Charging Station",
    address: "Admiralty Way, Lekki Phase 1, Lagos",
    latitude: 6.4719,
    longitude: 3.4773,
    connectors: [
      {
        id: "conn-lekki-1",
        type: "CCS",
        power: 100,
        status: "available",
        pricePerKwh: 170,
      },
      {
        id: "conn-lekki-2",
        type: "Type 2",
        power: 22,
        status: "available",
        pricePerKwh: 115,
      },
      {
        id: "conn-lekki-3",
        type: "Type 2",
        power: 22,
        status: "available",
        pricePerKwh: 115,
      },
    ],
    amenities: ["WiFi", "Restrooms", "Parking", "Security"],
    pricing: {
      basePrice: 155,
      peakPrice: 170,
      currency: "NGN",
    },
    availability: {
      availableConnectors: 3,
      totalConnectors: 3,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.5,
    operatingHours: {
      monday: { open: "05:00", close: "23:59", is24Hours: true },
      tuesday: { open: "05:00", close: "23:59", is24Hours: true },
      wednesday: { open: "05:00", close: "23:59", is24Hours: true },
      thursday: { open: "05:00", close: "23:59", is24Hours: true },
      friday: { open: "05:00", close: "23:59", is24Hours: true },
      saturday: { open: "05:00", close: "23:59", is24Hours: true },
      sunday: { open: "05:00", close: "23:59", is24Hours: true },
    },
  },
  {
    id: "lagos-ikeja",
    name: "Ikeja City Mall Charging Point",
    address: "Adeniyi Jones Avenue, Ikeja, Lagos",
    latitude: 6.5244,
    longitude: 3.3792,
    connectors: [
      {
        id: "conn-ikeja-1",
        type: "CCS",
        power: 50,
        status: "available",
        pricePerKwh: 160,
      },
      {
        id: "conn-ikeja-2",
        type: "CCS",
        power: 50,
        status: "available",
        pricePerKwh: 160,
      },
      {
        id: "conn-ikeja-3",
        type: "Type 2",
        power: 11,
        status: "occupied",
        pricePerKwh: 110,
      },
    ],
    amenities: ["WiFi", "Restrooms", "Shopping Mall", "Restaurant", "Parking"],
    pricing: {
      basePrice: 150,
      peakPrice: 160,
      currency: "NGN",
    },
    availability: {
      availableConnectors: 2,
      totalConnectors: 3,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.3,
    operatingHours: {
      monday: { open: "08:00", close: "22:00" },
      tuesday: { open: "08:00", close: "22:00" },
      wednesday: { open: "08:00", close: "22:00" },
      thursday: { open: "08:00", close: "22:00" },
      friday: { open: "08:00", close: "22:00" },
      saturday: { open: "08:00", close: "22:00" },
      sunday: { open: "10:00", close: "20:00" },
    },
  },
  // Abuja Stations
  {
    id: "abuja-maitama",
    name: "Maitama District Charging Hub",
    address: "Parakou Street, Maitama, Abuja",
    latitude: 9.0765,
    longitude: 7.3986,
    connectors: [
      {
        id: "conn-maitama-1",
        type: "CCS",
        power: 150,
        status: "available",
        pricePerKwh: 175,
      },
      {
        id: "conn-maitama-2",
        type: "CCS",
        power: 150,
        status: "available",
        pricePerKwh: 175,
      },
      {
        id: "conn-maitama-3",
        type: "Type 2",
        power: 22,
        status: "available",
        pricePerKwh: 120,
      },
    ],
    amenities: ["WiFi", "Restrooms", "Coffee Shop", "Parking", "Security"],
    pricing: {
      basePrice: 165,
      peakPrice: 175,
      sessionFee: 500,
      currency: "NGN",
    },
    availability: {
      availableConnectors: 3,
      totalConnectors: 3,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.6,
    operatingHours: {
      monday: { open: "06:00", close: "23:00" },
      tuesday: { open: "06:00", close: "23:00" },
      wednesday: { open: "06:00", close: "23:00" },
      thursday: { open: "06:00", close: "23:00" },
      friday: { open: "06:00", close: "23:00" },
      saturday: { open: "06:00", close: "23:00" },
      sunday: { open: "08:00", close: "22:00" },
    },
  },
  {
    id: "abuja-wuse",
    name: "Wuse Market Charging Station",
    address: "Ahmadu Bello Way, Wuse Zone 6, Abuja",
    latitude: 9.0579,
    longitude: 7.4951,
    connectors: [
      {
        id: "conn-wuse-1",
        type: "CCS",
        power: 100,
        status: "available",
        pricePerKwh: 170,
      },
      {
        id: "conn-wuse-2",
        type: "Type 2",
        power: 22,
        status: "available",
        pricePerKwh: 115,
      },
      {
        id: "conn-wuse-3",
        type: "Type 2",
        power: 22,
        status: "occupied",
        pricePerKwh: 115,
      },
      {
        id: "conn-wuse-4",
        type: "Type 1",
        power: 7.4,
        status: "available",
        pricePerKwh: 100,
      },
    ],
    amenities: ["WiFi", "Restrooms", "Market Access", "Parking"],
    pricing: {
      basePrice: 155,
      peakPrice: 170,
      currency: "NGN",
    },
    availability: {
      availableConnectors: 3,
      totalConnectors: 4,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.2,
    operatingHours: {
      monday: { open: "07:00", close: "21:00" },
      tuesday: { open: "07:00", close: "21:00" },
      wednesday: { open: "07:00", close: "21:00" },
      thursday: { open: "07:00", close: "21:00" },
      friday: { open: "07:00", close: "21:00" },
      saturday: { open: "07:00", close: "21:00" },
      sunday: { open: "09:00", close: "20:00" },
    },
  },
  // Port Harcourt Stations
  {
    id: "ph-gra",
    name: "GRA Port Harcourt Fast Charging",
    address: "Aba Road, GRA Phase 2, Port Harcourt",
    latitude: 4.8156,
    longitude: 7.0498,
    connectors: [
      {
        id: "conn-ph-1",
        type: "CCS",
        power: 120,
        status: "available",
        pricePerKwh: 165,
      },
      {
        id: "conn-ph-2",
        type: "CCS",
        power: 120,
        status: "available",
        pricePerKwh: 165,
      },
      {
        id: "conn-ph-3",
        type: "Type 2",
        power: 22,
        status: "available",
        pricePerKwh: 110,
      },
    ],
    amenities: ["WiFi", "Restrooms", "Parking", "Security"],
    pricing: {
      basePrice: 150,
      peakPrice: 165,
      currency: "NGN",
    },
    availability: {
      availableConnectors: 3,
      totalConnectors: 3,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.4,
    operatingHours: {
      monday: { open: "06:00", close: "23:00" },
      tuesday: { open: "06:00", close: "23:00" },
      wednesday: { open: "06:00", close: "23:00" },
      thursday: { open: "06:00", close: "23:00" },
      friday: { open: "06:00", close: "23:00" },
      saturday: { open: "06:00", close: "23:00" },
      sunday: { open: "08:00", close: "22:00" },
    },
  },
];

/**
 * Get stations by city
 */
export function getStationsByCity(city: string): ChargingStation[] {
  const cityLower = city.toLowerCase();
  return CHARGING_STATIONS.filter((station) =>
    station.address.toLowerCase().includes(cityLower)
  );
}

/**
 * Get station by ID
 */
export function getStationById(id: string): ChargingStation | undefined {
  return CHARGING_STATIONS.find((station) => station.id === id);
}
