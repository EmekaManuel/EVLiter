// EV Car Recognition Types
export interface CarInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  batteryCapacity: number; // kWh
  chargingConnector: ConnectorType;
  maxChargingPower: number; // kW
  estimatedRange: number; // miles
  imageUrl?: string;
}

export type ConnectorType =
  | "CCS"
  | "CHAdeMO"
  | "Tesla Supercharger"
  | "Type 2"
  | "Type 1"
  | "GB/T";

// Charging Station Types
export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  connectors: ChargingConnector[];
  amenities: string[];
  pricing: PricingInfo;
  availability: AvailabilityStatus;
  distance?: number; // miles from user
  rating: number;
  imageUrl?: string;
  operatingHours: OperatingHours;
}

export interface ChargingConnector {
  id: string;
  type: ConnectorType;
  power: number; // kW
  status: "available" | "occupied" | "out_of_order";
  pricePerKwh: number;
}

export interface PricingInfo {
  basePrice: number; // per kWh
  peakPrice?: number; // per kWh during peak hours
  sessionFee?: number; // flat fee per session
  currency: string;
}

export interface AvailabilityStatus {
  availableConnectors: number;
  totalConnectors: number;
  lastUpdated: string;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string; // HH:MM format
  close: string; // HH:MM format
  is24Hours?: boolean;
}

// Smart Advisor Types
export interface ChargingRecommendation {
  stationId: string;
  station: ChargingStation;
  reason: string;
  estimatedCost: number;
  estimatedTime: number; // minutes
  priority: "high" | "medium" | "low";
  factors: RecommendationFactor[];
}

export interface RecommendationFactor {
  type: "cost" | "time" | "distance" | "availability" | "amenities";
  impact: "positive" | "negative" | "neutral";
  description: string;
  weight: number; // 0-1
}

// User Dashboard Types
export interface ChargingSession {
  id: string;
  stationId: string;
  stationName: string;
  startTime: string;
  endTime?: string;
  energyDelivered: number; // kWh
  cost: number;
  connectorType: ConnectorType;
  status: "active" | "completed" | "cancelled";
}

export interface UserStats {
  totalSessions: number;
  totalEnergyDelivered: number; // kWh
  totalCost: number;
  averageSessionTime: number; // minutes
  favoriteStation?: string;
  monthlyUsage: MonthlyUsage[];
}

export interface MonthlyUsage {
  month: string;
  sessions: number;
  energyDelivered: number;
  cost: number;
}

// Admin Dashboard Types
export interface AdminAnalytics {
  totalStations: number;
  activeStations: number;
  totalUsers: number;
  totalSessions: number;
  revenue: number;
  energyDelivered: number;
  stationUtilization: StationUtilization[];
  userGrowth: UserGrowth[];
  revenueByMonth: RevenueData[];
}

export interface StationUtilization {
  stationId: string;
  stationName: string;
  utilizationRate: number; // percentage
  totalSessions: number;
  revenue: number;
}

export interface UserGrowth {
  month: string;
  newUsers: number;
  totalUsers: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  sessions: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search and Filter Types
export interface StationSearchFilters {
  connectorType?: ConnectorType[];
  minPower?: number;
  maxDistance?: number;
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}
