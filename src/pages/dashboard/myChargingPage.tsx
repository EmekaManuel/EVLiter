import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockChargingSessions, mockUserStats } from "@/mocks/myChargingMocks";
import type { ChargingSession, UserStats } from "@/types/ev";
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
import { useEffect, useState } from "react";

export default function MyChargingPage() {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentSession, setCurrentSession] = useState<ChargingSession | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const userId = "user-123";

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Clear any existing errors
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockSessions = mockChargingSessions(userId);
      setUserStats(mockUserStats);
      setSessions(mockSessions);

      console.log("Mock data loaded:", {
        sessions: mockSessions.length,
        stats: mockUserStats,
      });

      const activeSession = mockSessions.find(
        (session) => session.status === "active"
      );
      if (activeSession) {
        setCurrentSession(activeSession);
      }
    } catch {
      setError("Failed to load charging data");
    }
  };

  const handleStartCharging = async () => {
    try {
      // Clear any existing errors
      setError(null);

      const response = await userDashboardService.startChargingSession(
        userId,
        "station-123",
        "connector-1"
      );

      if (response.success) {
        setCurrentSession(response.data);
        await loadUserData();
      }
    } catch {
      setError("Failed to start charging session");
    }
  };

  const handleStopCharging = async () => {
    if (!currentSession) return;

    try {
      const response = await userDashboardService.endChargingSession(
        currentSession.id
      );

      if (response.success) {
        setCurrentSession(null);
        await loadUserData();
      }
    } catch {
      setError("Failed to stop charging session");
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
          <h4 className="font-medium text-gray-900">{session.stationName}</h4>
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
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-gray-400" />
          <span>{session.stationRating}/5</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {formatTime(session.startTime)} - {formatTime(session.endTime)}
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
                    {currentSession.stationName}
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
                      {formatDuration(currentSession.duration)}
                    </p>
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                  <div>
                    <p className="text-lg font-light text-gray-900">
                      {currentSession.averagePower} kW
                    </p>
                    <p className="text-xs text-gray-500">Power</p>
                  </div>
                  <div>
                    <p className="text-lg font-light text-gray-900">
                      {currentSession.stationRating}/5
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
                  onClick={handleStartCharging}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Charging
                </Button>
              )}
            </div>

            <Tabs defaultValue="recent" className="w-full">
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
                  {sessions.slice(0, 5).map(renderSessionCard)}
                </div>
              </TabsContent>

              <TabsContent value="this-month" className="mt-6">
                <div className="space-y-3">
                  {sessions
                    .filter((session) => {
                      const sessionDate = new Date(session.startTime);
                      const now = new Date();
                      return (
                        sessionDate.getMonth() === now.getMonth() &&
                        sessionDate.getFullYear() === now.getFullYear()
                      );
                    })
                    .map(renderSessionCard)}
                </div>
              </TabsContent>

              <TabsContent value="all-time" className="mt-6">
                <div className="space-y-3">
                  {sessions.map(renderSessionCard)}
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
    </div>
  );
}
