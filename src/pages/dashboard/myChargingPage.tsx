import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StartChargingDialog } from "@/components/StartChargingDialog";
import * as chargingSessionsApi from "@/services/api/modules/chargingSessions";
import type { ChargingSession, UserStats, LocationData } from "@/types/ev";
import { getUserLocation } from "@/utils/getLocation";
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
    getUserLocation()
      .then((location) => {
        setUserLocation(location);
      })
      .catch((error) => {
        console.error("Failed to get user location:", error);
        // Don't block the app if location fails
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
    batteryLevelStart: number;
  }) => {
    try {
      setError(null);

      const session = await chargingSessionsApi.startChargingSession({
        stationId: data.stationId,
        connectorId: data.connectorId,
        batteryLevelStart: data.batteryLevelStart,
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
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900">
            {cleanStationName(session.stationName)}
          </h4>
          <span
            className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
              session.status
            )}`}
          >
            {session.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            ${session.totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(session.startTime)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
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

      <div className="mt-3 pt-3 border-t border-gray-100">
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
                  <p className="text-sm text-gray-500 mt-1">
                    {cleanStationName(currentSession.stationName)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${currentSession.totalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentSession.energyDelivered.toFixed(1)} kWh
                  </p>
                </div>
              </div>

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
