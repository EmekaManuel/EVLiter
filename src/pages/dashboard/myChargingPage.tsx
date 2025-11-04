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

  const renderSessionCard = (session: ChargingSession) => (
    <div key={session.id} className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900">
              {session.station?.name || cleanStationName(session.stationName)}
            </h4>
            <span
              className={`text-xs px-2 py-1 rounded-full border shrink-0 ${getStatusColor(
                session.status
              )}`}
            >
              {session.status}
            </span>
          </div>
          {session.station?.address && (
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{session.station.address}</span>
            </p>
          )}
        </div>
        <div className="text-right shrink-0 ml-4">
          <p className="text-sm font-medium text-gray-900">
            ${session.totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(session.startTime)}
          </p>
          {session.station?.pricePerKWh && (
            <p className="text-xs text-gray-500 mt-1">
              ${session.station.pricePerKWh}/kWh
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{formatDuration(session.duration)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Battery className="h-4 w-4 text-gray-400" />
          <span>{session.energyDelivered.toFixed(1)} kWh</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-gray-400" />
          <span>{session.averagePower} kW</span>
        </div>
        {session.stationRating && (
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-gray-400" />
            <span>{session.stationRating}/5</span>
          </div>
        )}
      </div>

      {/* Station Details */}
      {session.station && (
        <div className="mb-3 pt-3 border-t border-gray-100 space-y-2">
          {(session.station.amenities &&
            session.station.amenities.length > 0) ||
          (session.station.connectorTypes &&
            session.station.connectorTypes.length > 0) ||
          session.station.operatingHours ||
          session.station.powerOutput ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {session.station.operatingHours && (
                <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                  {session.station.operatingHours}
                </span>
              )}
              {session.station.powerOutput && (
                <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                  {session.station.powerOutput} kW
                </span>
              )}
              {session.station.amenities &&
                session.station.amenities.length > 0 && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                    {session.station.amenities.length} amenities
                  </span>
                )}
              {session.station.connectorTypes &&
                session.station.connectorTypes.length > 0 && (
                  <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700">
                    {session.station.connectorTypes.join(", ")}
                  </span>
                )}
            </div>
          ) : null}
        </div>
      )}

      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {formatTime(session.startTime)}
          {session.endTime ? ` - ${formatTime(session.endTime)}` : " - Active"}
        </p>
      </div>
    </div>
  );

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
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Battery Level</span>
                    <span>{currentSession.batteryLevel}%</span>
                  </div>
                  <Progress
                    value={currentSession.batteryLevel}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-light text-gray-900">
                      {formatDuration(
                        realTimeDuration > 0
                          ? realTimeDuration
                          : currentSession.duration
                      )}
                    </p>
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                  <div>
                    <p className="text-lg font-light text-gray-900">
                      {currentSession.averagePower > 0
                        ? `${currentSession.averagePower.toFixed(1)} kW`
                        : "0.0 kW"}
                    </p>
                    <p className="text-xs text-gray-500">Power</p>
                  </div>
                  <div>
                    <p className="text-lg font-light text-gray-900">
                      {currentSession.stationRating
                        ? `${currentSession.stationRating}/5`
                        : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
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
