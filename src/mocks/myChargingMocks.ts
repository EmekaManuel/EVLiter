import type { ChargingSession, UserStats } from "@/types/ev";

export const mockUserStats: UserStats = {
  totalSessions: 47,
  totalEnergyUsed: 1247.5,
  totalSpent: 187.25,
  averageSessionDuration: 45,
  monthlyUsage: [
    { month: "Jan", sessions: 8, energy: 180.5, cost: 28.5 },
    { month: "Feb", sessions: 12, energy: 245.2, cost: 38.75 },
    { month: "Mar", sessions: 15, energy: 312.8, cost: 49.2 },
    { month: "Apr", sessions: 12, energy: 509.0, cost: 70.8 },
  ],
};

export const mockChargingSessions = (userId: string): ChargingSession[] => [
  {
    id: "session-1",
    userId: userId,
    stationId: "station-123",
    stationName: "Tesla Supercharger - Downtown",
    connectorId: "connector-1",
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    endTime: new Date().toISOString(),
    duration: 120,
    energyDelivered: 45.2,
    totalCost: 18.5,
    averagePower: 75.5,
    batteryLevel: 85,
    status: "active",
    stationRating: 4.8,
  },
  {
    id: "session-2",
    userId: userId,
    stationId: "station-456",
    stationName: "EVgo Station - Mall Plaza",
    connectorId: "connector-2",
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    endTime: new Date(
      Date.now() - 24 * 60 * 60 * 1000 + 45 * 60 * 1000
    ).toISOString(),
    duration: 45,
    energyDelivered: 32.1,
    totalCost: 12.8,
    averagePower: 65.2,
    batteryLevel: 90,
    status: "completed",
    stationRating: 4.2,
  },
  {
    id: "session-3",
    userId: userId,
    stationId: "station-789",
    stationName: "ChargePoint - Office Building",
    connectorId: "connector-1",
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    endTime: new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
    ).toISOString(),
    duration: 60,
    energyDelivered: 28.7,
    totalCost: 11.5,
    averagePower: 48.5,
    batteryLevel: 88,
    status: "completed",
    stationRating: 4.5,
  },
  {
    id: "session-4",
    userId: userId,
    stationId: "station-101",
    stationName: "Electrify America - Highway Rest",
    connectorId: "connector-3",
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    endTime: new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000
    ).toISOString(),
    duration: 30,
    energyDelivered: 22.3,
    totalCost: 9.2,
    averagePower: 89.1,
    batteryLevel: 75,
    status: "completed",
    stationRating: 4.7,
  },
  {
    id: "session-5",
    userId: userId,
    stationId: "station-202",
    stationName: "Volta Charging - Shopping Center",
    connectorId: "connector-2",
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    endTime: new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000
    ).toISOString(),
    duration: 50,
    energyDelivered: 35.8,
    totalCost: 14.3,
    averagePower: 58.2,
    batteryLevel: 92,
    status: "completed",
    stationRating: 4.1,
  },
  {
    id: "session-6",
    userId: userId,
    stationId: "station-303",
    stationName: "Tesla Supercharger - Airport",
    connectorId: "connector-1",
    startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    endTime: new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000
    ).toISOString(),
    duration: 40,
    energyDelivered: 26.4,
    totalCost: 10.6,
    averagePower: 72.3,
    batteryLevel: 80,
    status: "completed",
    stationRating: 4.9,
  },
  {
    id: "session-7",
    userId: userId,
    stationId: "station-404",
    stationName: "EVgo Station - City Center",
    connectorId: "connector-2",
    startTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
    endTime: new Date(
      Date.now() - 21 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000
    ).toISOString(),
    duration: 35,
    energyDelivered: 19.7,
    totalCost: 7.9,
    averagePower: 45.8,
    batteryLevel: 70,
    status: "completed",
    stationRating: 3.8,
  },
];
