import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StartChargingDialog } from "@/components/StartChargingDialog";
import { StationInfoModal } from "@/components/StationInfoModal";
import { MetricCard } from "@/components/metrics";
import { SessionCard } from "@/components/sessions";
import { PageHeader } from "@/components/layout";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useChargingDashboard,
  useChargingSessions,
  useActiveChargingSession,
  useStartChargingSession,
  useEndChargingSession,
  useCompanyChargingStations,
} from "@/services/hooks";
import type { LocationData, ChargingStation } from "@/types/ev";
import { getUserLocation, getFallbackLocation } from "@/utils/getLocation";
import { formatDuration } from "@/utils/formatting";
import { cleanStationName, formatOperatingHours } from "@/utils/charging";
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
import { useEffect, useState } from "react";

export default function MyChargingPage() {
  const [activeTab, setActiveTab] = useState<
    "recent" | "this-month" | "all-time"
  >("recent");
  const [realTimeDuration, setRealTimeDuration] = useState<number>(0);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  // React Query hooks
  const dashboardQuery = useChargingDashboard();
  const sessionsQuery = useChargingSessions(
    activeTab !== "all-time"
      ? { filter: activeTab, limit: "50", offset: 0 }
      : undefined
  );
  const activeSessionQuery = useActiveChargingSession();
  const startSessionMutation = useStartChargingSession();
  const endSessionMutation = useEndChargingSession();
  const companyStationsQuery = useCompanyChargingStations();

  // Derived state from queries
  const dashboardData = dashboardQuery.data;
  const sessions =
    activeTab !== "all-time"
      ? sessionsQuery.data || []
      : dashboardData?.sessions || [];
  const userStats = dashboardData?.stats
    ? {
        ...dashboardData.stats,
        monthlyUsage: dashboardData.stats.monthlyUsage.map((usage) => ({
          ...usage,
          energy: usage.energyUsed,
          cost: usage.totalSpent,
        })),
      }
    : null;
  const currentSession =
    activeSessionQuery.data || dashboardData?.activeSession || null;
  const loading =
    dashboardQuery.isLoading ||
    sessionsQuery.isLoading ||
    activeSessionQuery.isLoading;
  const error =
    dashboardQuery.error || sessionsQuery.error || activeSessionQuery.error
      ? String(
          dashboardQuery.error ||
            sessionsQuery.error ||
            activeSessionQuery.error
        )
      : null;

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
      // Get station data if not provided
      let station = data.station;
      if (!station && companyStationsQuery.data) {
        const foundStation = companyStationsQuery.data.uiStations.find(
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

      await startSessionMutation.mutateAsync({
        stationId: data.stationId,
        connectorId: data.connectorId,
        connectorType: data.connectorType,
        batteryLevelStart: data.batteryLevelStart,
        station: station!,
      });

      // Refetch data after successful start
      dashboardQuery.refetch();
      activeSessionQuery.refetch();
      if (activeTab !== "all-time") {
        sessionsQuery.refetch();
      }
    } catch (err) {
      console.error("Error starting charging session:", err);
      throw err; // Re-throw to let dialog handle it
    }
  };

  const handleStopCharging = async () => {
    if (!currentSession) return;

    try {
      await endSessionMutation.mutateAsync({
        sessionId: currentSession.id,
        batteryLevelEnd: currentSession.batteryLevel,
      });

      // Refetch data after successful end
      dashboardQuery.refetch();
      activeSessionQuery.refetch();
      if (activeTab !== "all-time") {
        sessionsQuery.refetch();
      }
    } catch (err) {
      console.error("Error stopping charging session:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        icon={Zap}
        title="My Charging"
        description="Track your charging sessions and energy usage"
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          {userStats && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  icon={<Zap className="h-5 w-5 text-gray-600" />}
                  label="Total Sessions"
                  value={userStats.totalSessions.toString()}
                  subtitle="This month"
                />
                <MetricCard
                  icon={<Battery className="h-5 w-5 text-gray-600" />}
                  label="Energy Used"
                  value={`${userStats.totalEnergyUsed.toFixed(1)} kWh`}
                  subtitle="Lifetime"
                />
                <MetricCard
                  icon={<DollarSign className="h-5 w-5 text-gray-600" />}
                  label="Total Spent"
                  value={`$${userStats.totalSpent.toFixed(2)}`}
                  subtitle="This month"
                />
                <MetricCard
                  icon={<Clock className="h-5 w-5 text-gray-600" />}
                  label="Avg Duration"
                  value={formatDuration(userStats.averageSessionDuration)}
                  subtitle="Per session"
                />
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
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-200"
                    onClick={() => setShowStationModal(true)}
                  >
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
                    <LoadingState message="Loading sessions..." />
                  ) : sessions.length === 0 ? (
                    <EmptyState
                      title="No recent sessions"
                      description="Your charging history will appear here"
                    />
                  ) : (
                    sessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="this-month" className="mt-6">
                <div className="space-y-3">
                  {loading ? (
                    <LoadingState message="Loading sessions..." />
                  ) : sessions.length === 0 ? (
                    <EmptyState
                      title="No sessions this month"
                      description="Start a charging session to see it here"
                    />
                  ) : (
                    sessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="all-time" className="mt-6">
                <div className="space-y-3">
                  {loading ? (
                    <LoadingState message="Loading sessions..." />
                  ) : sessions.length === 0 ? (
                    <EmptyState
                      title="No sessions found"
                      description="Your charging history will appear here"
                    />
                  ) : (
                    sessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))
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

      {/* Station Info Modal */}
      <StationInfoModal
        open={showStationModal}
        onOpenChange={setShowStationModal}
        station={
          currentSession?.station
            ? (currentSession.station as unknown as ChargingStation)
            : null
        }
      />
    </div>
  );
}
