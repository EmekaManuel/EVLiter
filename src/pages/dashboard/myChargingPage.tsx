import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StartChargingDialog } from "@/components/StartChargingDialog";
import * as chargingSessionsApi from "@/services/api/modules/chargingSessions";
import * as chargingStationsApi from "@/services/api/modules/chargingStations";
import type {
  ChargingSession,
  UserStats,
  LocationData,
  ChargingStation,
} from "@/types/ev";
import { getUserLocation, getFallbackLocation } from "@/utils/getLocation";
import {
  Battery,
  Clock,
  DollarSign,
  MapPin,
  Play,
  Star,
  StopCircle,
  Zap,
  TrendingUp,
  Gauge,
  Activity,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function MyChargingPage() {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentSession, setCurrentSession] = useState<ChargingSession | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "recent" | "this-month" | "all-time"
  >("recent");
  const [realTimeDuration, setRealTimeDuration] = useState<number>(0);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Load dashboard data (sessions, stats, active session)
      const dashboardData = await chargingSessionsApi.getDashboard();

      // Map monthlyUsage to include legacy fields for backward compatibility
      const mappedStats = {
        ...dashboardData.stats,
        monthlyUsage: dashboardData.stats.monthlyUsage.map((usage) => ({
          ...usage,
          energy: usage.energyUsed,
          cost: usage.totalSpent,
        })),
      };

      setUserStats(mappedStats);
      setSessions(dashboardData.sessions);
      setCurrentSession(dashboardData.activeSession);

      // Load filtered sessions based on active tab
      if (activeTab !== "all-time") {
        const filteredSessions = await chargingSessionsApi.getSessions({
          filter: activeTab,
          limit: "50".toString(),
        });
        setSessions(filteredSessions);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load charging data";
      setError(errorMessage);
      console.error("Error loading charging data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Get user location on mount
  useEffect(() => {
    getUserLocation({}, true) // Use fallback if location unavailable
      .then((location) => {
        setUserLocation(location);
      })
      .catch((error) => {
        // If fallback also fails, use fallback location directly
        console.warn("Location unavailable, using fallback:", error.message);
        setUserLocation(getFallbackLocation());
      });
  }, []);

  // Real-time updates for active session
  useEffect(() => {
    if (!currentSession || currentSession.status !== "active") {
      setRealTimeDuration(0);
      return;
    }

    // Calculate real-time duration
    const updateDuration = () => {
      const startTime = new Date(currentSession.startTime).getTime();
      const now = Date.now();
      const elapsedMinutes = Math.floor((now - startTime) / 60000);
      setRealTimeDuration(elapsedMinutes);
    };

    // Update immediately
    updateDuration();

    // Update every second for smooth timer
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  // Poll active session for updates (battery level, energy, etc.)
  useEffect(() => {
    if (!currentSession || currentSession.status !== "active") {
      return;
    }

    const pollActiveSession = async () => {
      try {
        const activeSession = await chargingSessionsApi.getActiveSession();
        if (activeSession) {
          setCurrentSession(activeSession);
        } else {
          // Session ended
          setCurrentSession(null);
          loadUserData();
        }
      } catch (err) {
        console.error("Error polling active session:", err);
      }
    };

    // Poll every 30 seconds (as recommended in the documentation)
    const interval = setInterval(pollActiveSession, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.id, currentSession?.status]);

  const handleStartCharging = async (data: {
    stationId: string;
    connectorId: string;
    connectorType?: string; // Optional connector type for backend validation
    batteryLevelStart: number;
    station?: {
      id: string;
      name: string;
      address: string;
      location: { lat: number; lng: number };
      connectorTypes: string[];
      powerOutput: number;
      realtimeAvailability: "Available" | "Occupied" | "Out of Service";
      isCompanyStation: boolean;
      distance?: number;
      amenities?: string[];
      operatingHours?: string;
      pricePerKWh?: number;
    };
  }) => {
    try {
      setError(null);

      // Get station data if not provided
      let station = data.station;
      if (!station) {
        // Fetch station details from API
        const stationsResponse = await chargingStationsApi.getCompanyStations();
        const foundStation = stationsResponse.uiStations.find(
          (s: ChargingStation) => s.id === data.stationId
        );

        if (!foundStation) {
          throw new Error("Station not found");
        }

        // Convert UI station to backend format
        station = {
          id: foundStation.id,
          name: foundStation.name,
          address: foundStation.address,
          location: {
            lat: foundStation.latitude,
            lng: foundStation.longitude,
          },
          connectorTypes: foundStation.connectors.map((c) => c.type),
          powerOutput: Math.max(...foundStation.connectors.map((c) => c.power)),
          realtimeAvailability:
            foundStation.availability.availableConnectors > 0
              ? "Available"
              : "Occupied",
          isCompanyStation: true,
          distance: foundStation.distance,
          amenities: foundStation.amenities,
          operatingHours: formatOperatingHours(foundStation.operatingHours),
          pricePerKWh: foundStation.pricing.basePrice * 100, // Convert to Naira
        };
      }

      const session = await chargingSessionsApi.startChargingSession({
        stationId: data.stationId,
        connectorId: data.connectorId,
        connectorType: data.connectorType, // Pass through connector type if provided
        batteryLevelStart: data.batteryLevelStart,
        station,
      });

      setCurrentSession(session);
      await loadUserData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start charging session";
      setError(errorMessage);
      console.error("Error starting charging session:", err);
      throw err; // Re-throw to let dialog handle it
    }
  };

  // Helper function to format operating hours
  const formatOperatingHours = (hours: {
    monday: { open: string; close: string; is24Hours?: boolean };
    tuesday: { open: string; close: string; is24Hours?: boolean };
    wednesday: { open: string; close: string; is24Hours?: boolean };
    thursday: { open: string; close: string; is24Hours?: boolean };
    friday: { open: string; close: string; is24Hours?: boolean };
    saturday: { open: string; close: string; is24Hours?: boolean };
    sunday: { open: string; close: string; is24Hours?: boolean };
  }): string => {
    const allSame = Object.values(hours).every(
      (day) => day.is24Hours || (day.open === "00:00" && day.close === "23:59")
    );

    if (allSame && hours.monday.is24Hours) {
      return "24/7";
    }

    const weekdays = hours.monday;
    const weekends = hours.saturday;

    if (weekdays.open === weekends.open && weekdays.close === weekends.close) {
      return `Daily: ${weekdays.open} - ${weekdays.close}`;
    }

    return `Mon-Fri: ${weekdays.open} - ${weekdays.close}, Sat-Sun: ${weekends.open} - ${weekends.close}`;
  };

  const handleStopCharging = async () => {
    if (!currentSession) return;

    try {
      setError(null);

      await chargingSessionsApi.endChargingSession({
        sessionId: currentSession.id,
        batteryLevelEnd: currentSession.batteryLevel,
      });

      setCurrentSession(null);
      await loadUserData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to stop charging session";
      setError(errorMessage);
      console.error("Error stopping charging session:", err);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Clean up station name (remove redundant "Charging Station" prefix)
  const cleanStationName = (name: string) => {
    return name.replace(/^Charging Station\s+/i, "").trim() || name;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: ChargingSession["status"]) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "completed":
        return "text-gray-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const renderStatCard = (
    icon: React.ReactNode,
    label: string,
    value: string,
    subtitle?: string
  ) => (
    <div className="p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
        <div>
          <p className="text-2xl font-light text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const renderSessionCard = (session: ChargingSession) => {
    const batteryChange =
      session.batteryLevelStart !== undefined
        ? session.batteryLevel - session.batteryLevelStart
        : null;
    const efficiency =
      session.duration > 0
        ? (session.energyDelivered / (session.duration / 60)).toFixed(2)
        : "0.00";
    const costPerHour =
      session.duration > 0
        ? ((session.totalCost / session.duration) * 60).toFixed(2)
        : "0.00";
    const costPerKwh =
      session.energyDelivered > 0
        ? (session.totalCost / session.energyDelivered).toFixed(2)
        : "0.00";

    return (
      <div
        key={session.id}
        className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-gray-900">
                {session.station?.name || cleanStationName(session.stationName)}
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded-full border shrink-0 font-medium ${getStatusColor(
                  session.status
                )}`}
              >
                {session.status}
              </span>
            </div>
            {session.station?.address && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{session.station.address}</span>
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{formatDate(session.startTime)}</span>
              <span>•</span>
              <span>
                {formatTime(session.startTime)}
                {session.endTime ? ` - ${formatTime(session.endTime)}` : ""}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-lg font-semibold text-gray-900">
              ${session.totalCost.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">${costPerKwh}/kWh</p>
            {session.station?.pricePerKWh && (
              <p className="text-xs text-gray-400 mt-1">
                Rate: ${session.station.pricePerKWh}/kWh
              </p>
            )}
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Duration</p>
            </div>
            <p className="text-base font-semibold text-gray-900">
              {formatDuration(session.duration)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Battery className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Energy</p>
            </div>
            <p className="text-base font-semibold text-gray-900">
              {session.energyDelivered.toFixed(2)} kWh
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Avg Power</p>
            </div>
            <p className="text-base font-semibold text-gray-900">
              {session.averagePower.toFixed(1)} kW
            </p>
          </div>
          {session.stationRating ? (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-xs font-medium text-gray-500">Rating</p>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {session.stationRating}/5
              </p>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-xs font-medium text-gray-500">Efficiency</p>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {efficiency} kWh/h
              </p>
            </div>
          )}
        </div>

        {/* Battery Level Info */}
        {(session.batteryLevelStart !== undefined ||
          batteryChange !== null) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {session.batteryLevelStart !== undefined && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Start Level</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {session.batteryLevelStart}%
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600 mb-1">End Level</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {session.batteryLevel}%
                  </p>
                </div>
                {batteryChange !== null && batteryChange > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Gained</p>
                    <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />+
                      {batteryChange.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Cost Efficiency</p>
                <p className="text-sm font-semibold text-gray-900">
                  ${costPerHour}/hour
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Activity className="h-3.5 w-3.5 text-gray-400" />
            <span>Efficiency: {efficiency} kWh/h</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Gauge className="h-3.5 w-3.5 text-gray-400" />
            <span>Cost Rate: ${costPerHour}/hour</span>
          </div>
        </div>

        {/* Station Details */}
        {session.station && (
          <div className="mb-4 pt-4 border-t border-gray-200 space-y-3">
            {(session.station.amenities &&
              session.station.amenities.length > 0) ||
            (session.station.connectorTypes &&
              session.station.connectorTypes.length > 0) ||
            session.station.operatingHours ||
            session.station.powerOutput ? (
              <div className="flex flex-wrap gap-2 text-xs">
                {session.station.operatingHours && (
                  <span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">
                    {session.station.operatingHours}
                  </span>
                )}
                {session.station.powerOutput && (
                  <span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">
                    {session.station.powerOutput} kW max
                  </span>
                )}
                {session.station.amenities &&
                  session.station.amenities.length > 0 && (
                    <span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">
                      {session.station.amenities.length} amenities
                    </span>
                  )}
                {session.station.connectorTypes &&
                  session.station.connectorTypes.length > 0 && (
                    <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-blue-700 font-medium">
                      {session.station.connectorTypes.join(", ")}
                    </span>
                  )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6 text-gray-400" />
            <h1 className="text-2xl font-light text-gray-900">My Charging</h1>
          </div>
          <p className="text-gray-500 font-light mt-2">
            Track your charging sessions and energy usage
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          {userStats && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderStatCard(
                  <Zap className="h-5 w-5 text-gray-600" />,
                  "Total Sessions",
                  userStats.totalSessions.toString(),
                  "This month"
                )}
                {renderStatCard(
                  <Battery className="h-5 w-5 text-gray-600" />,
                  "Energy Used",
                  `${userStats.totalEnergyUsed.toFixed(1)} kWh`,
                  "Lifetime"
                )}
                {renderStatCard(
                  <DollarSign className="h-5 w-5 text-gray-600" />,
                  "Total Spent",
                  `$${userStats.totalSpent.toFixed(2)}`,
                  "This month"
                )}
                {renderStatCard(
                  <Clock className="h-5 w-5 text-gray-600" />,
                  "Avg Duration",
                  formatDuration(userStats.averageSessionDuration),
                  "Per session"
                )}
              </div>
            </div>
          )}

          {/* Current Session */}
          {currentSession && (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Active Session
                  </h3>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {currentSession.station?.name ||
                      cleanStationName(currentSession.stationName)}
                  </p>
                  {currentSession.station?.address && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{currentSession.station.address}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${currentSession.totalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentSession.energyDelivered.toFixed(1)} kWh
                  </p>
                  {currentSession.station?.pricePerKWh && (
                    <p className="text-xs text-gray-500 mt-1">
                      ${currentSession.station.pricePerKWh}/kWh
                    </p>
                  )}
                </div>
              </div>

              {/* Station Details */}
              {currentSession.station && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {currentSession.station.operatingHours && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {currentSession.station.operatingHours}
                        </span>
                      </div>
                    )}
                    {currentSession.station.powerOutput && (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {currentSession.station.powerOutput} kW
                        </span>
                      </div>
                    )}
                    {currentSession.station.distance !== undefined && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {currentSession.station.distance.toFixed(1)} mi away
                        </span>
                      </div>
                    )}
                    {currentSession.station.realtimeAvailability && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">
                          {currentSession.station.realtimeAvailability}
                        </span>
                      </div>
                    )}
                  </div>
                  {currentSession.station.amenities &&
                    currentSession.station.amenities.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-2">
                          {currentSession.station.amenities.map(
                            (amenity, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-700"
                              >
                                {amenity}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {currentSession.station.connectorTypes &&
                    currentSession.station.connectorTypes.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">
                          Connector Types:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {currentSession.station.connectorTypes.map(
                            (type, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded-full text-blue-700"
                              >
                                {type}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              <div className="space-y-4">
                {/* Battery Level with Start/End Comparison */}
                <div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                    <span>Battery Level</span>
                    <div className="flex items-center gap-3">
                      {currentSession.batteryLevelStart !== undefined && (
                        <span className="text-xs text-gray-500">
                          Start: {currentSession.batteryLevelStart}%
                        </span>
                      )}
                      <span className="font-medium text-gray-900">
                        {currentSession.batteryLevel}%
                      </span>
                      {currentSession.batteryLevelStart !== undefined && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />+
                          {(
                            currentSession.batteryLevel -
                            currentSession.batteryLevelStart
                          ).toFixed(1)}
                          %
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={currentSession.batteryLevel}
                    className="h-2"
                  />
                </div>

                {/* Detailed Charging Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <p className="text-xs text-gray-500">Duration</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDuration(
                        realTimeDuration > 0
                          ? realTimeDuration
                          : currentSession.duration
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-3.5 w-3.5 text-gray-400" />
                      <p className="text-xs text-gray-500">Power</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentSession.averagePower > 0
                        ? `${currentSession.averagePower.toFixed(1)} kW`
                        : "0.0 kW"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Battery className="h-3.5 w-3.5 text-gray-400" />
                      <p className="text-xs text-gray-500">Energy</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentSession.energyDelivered.toFixed(2)} kWh
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                      <p className="text-xs text-gray-500">Cost</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      ${currentSession.totalCost.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Efficiency</p>
                      <p className="text-sm font-medium text-gray-900">
                        {currentSession.duration > 0
                          ? (
                              currentSession.energyDelivered /
                              (currentSession.duration / 60)
                            ).toFixed(2)
                          : "0.00"}{" "}
                        kWh/h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gauge className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Cost Rate</p>
                      <p className="text-sm font-medium text-gray-900">
                        {currentSession.duration > 0
                          ? (
                              (currentSession.totalCost /
                                currentSession.duration) *
                              60
                            ).toFixed(2)
                          : "0.00"}{" "}
                        $/hour
                      </p>
                    </div>
                  </div>
                  {currentSession.stationRating && (
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Station Rating</p>
                        <p className="text-sm font-medium text-gray-900">
                          {currentSession.stationRating}/5
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleStopCharging}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop Charging
                  </Button>
                  <Button variant="outline" className="flex-1 border-gray-200">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Station
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Sessions History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Charging History
              </h3>
              {!currentSession && (
                <Button
                  onClick={() => setShowStartDialog(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Charging
                </Button>
              )}
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "recent" | "this-month" | "all-time")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-gray-50">
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-white"
                >
                  Recent
                </TabsTrigger>
                <TabsTrigger
                  value="this-month"
                  className="data-[state=active]:bg-white"
                >
                  This Month
                </TabsTrigger>
                <TabsTrigger
                  value="all-time"
                  className="data-[state=active]:bg-white"
                >
                  All Time
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="mt-6">
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : sessions.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent sessions</p>
                  ) : (
                    sessions.map(renderSessionCard)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="this-month" className="mt-6">
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : sessions.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No sessions this month
                    </p>
                  ) : (
                    sessions.map(renderSessionCard)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="all-time" className="mt-6">
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : sessions.length === 0 ? (
                    <p className="text-sm text-gray-500">No sessions found</p>
                  ) : (
                    sessions.map(renderSessionCard)
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Start Charging Dialog */}
      <StartChargingDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        onStartCharging={handleStartCharging}
        userLocation={userLocation || undefined}
      />
    </div>
  );
}
