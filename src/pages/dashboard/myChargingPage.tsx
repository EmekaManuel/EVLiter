import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userDashboardService } from "@/services/api/ev";
import type { ChargingSession, UserStats } from "@/types/ev";
import {
  BarChart3,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - in real app, this would come from auth context
  const userId = "user-123";

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user stats and sessions in parallel
      const [statsResponse, sessionsResponse] = await Promise.all([
        userDashboardService.getUserStats(userId),
        userDashboardService.getChargingSessions(userId),
      ]);

      if (statsResponse.success) {
        setUserStats(statsResponse.data);
      }

      if (sessionsResponse.success) {
        setSessions(sessionsResponse.data);

        // Find active session
        const activeSession = sessionsResponse.data.find(
          (s) => s.status === "active"
        );
        setCurrentSession(activeSession || null);
      }
    } catch (err) {
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCharging = async (
    stationId: string,
    connectorId: string
  ) => {
    try {
      const response = await userDashboardService.startChargingSession(
        userId,
        stationId,
        connectorId
      );
      if (response.success) {
        setCurrentSession(response.data);
        await loadUserData(); // Refresh data
      }
    } catch (err) {
      setError("Failed to start charging session");
    }
  };

  const handleEndCharging = async () => {
    if (!currentSession) return;

    try {
      const response = await userDashboardService.endChargingSession(
        currentSession.id
      );
      if (response.success) {
        setCurrentSession(null);
        await loadUserData(); // Refresh data
      }
    } catch (err) {
      setError("Failed to end charging session");
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const getSessionStatusColor = (status: ChargingSession["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Mock data for demonstration
  const mockStats: UserStats = {
    totalSessions: 45,
    totalEnergyDelivered: 1250.5,
    totalCost: 187.5,
    averageSessionTime: 45,
    favoriteStation: "Downtown Charging Hub",
    monthlyUsage: [
      { month: "2024-01", sessions: 8, energyDelivered: 220.5, cost: 33.2 },
      { month: "2024-02", sessions: 12, energyDelivered: 340.2, cost: 51.3 },
      { month: "2024-03", sessions: 15, energyDelivered: 425.8, cost: 64.2 },
      { month: "2024-04", sessions: 10, energyDelivered: 264.0, cost: 39.8 },
    ],
  };

  const mockSessions: ChargingSession[] = [
    {
      id: "session-1",
      stationId: "station-1",
      stationName: "Downtown Charging Hub",
      startTime: "2024-04-15T10:30:00Z",
      endTime: "2024-04-15T11:15:00Z",
      energyDelivered: 45.2,
      cost: 6.78,
      connectorType: "CCS",
      status: "completed",
    },
    {
      id: "session-2",
      stationId: "station-2",
      stationName: "Mall Parking Charging",
      startTime: "2024-04-14T14:20:00Z",
      endTime: "2024-04-14T15:05:00Z",
      energyDelivered: 38.7,
      cost: 5.81,
      connectorType: "Type 2",
      status: "completed",
    },
    {
      id: "session-3",
      stationId: "station-3",
      stationName: "Highway Rest Stop",
      startTime: "2024-04-13T09:15:00Z",
      status: "active",
      energyDelivered: 0,
      cost: 0,
      connectorType: "Tesla Supercharger",
    },
  ];

  const stats = userStats || mockStats;
  const allSessions = sessions.length > 0 ? sessions : mockSessions;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Zap className="h-8 w-8 text-yellow-600" />
        <h1 className="text-3xl font-bold">My Charging</h1>
      </div>

      {/* Current Session */}
      {currentSession && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Play className="h-5 w-5" />
              <span>Currently Charging</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium">{currentSession.stationName}</h3>
                <p className="text-sm text-gray-600">
                  Started {formatDuration(currentSession.startTime)} ago
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {currentSession.energyDelivered.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">kWh Delivered</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">
                    ${currentSession.cost.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Cost</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleEndCharging}
                  variant="destructive"
                  className="flex items-center space-x-2"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>End Session</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Battery className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalEnergyDelivered.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">kWh Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  ${stats.totalCost.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.averageSessionTime}</p>
                <p className="text-sm text-gray-600">Avg Session (min)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">Charging Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>
                Your charging history and session details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allSessions.map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-medium">{session.stationName}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(session.startTime).toLocaleDateString()} •
                            {formatDuration(session.startTime, session.endTime)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getSessionStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Battery className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            {session.energyDelivered.toFixed(1)} kWh
                          </p>
                          <p className="text-gray-600">Energy</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">
                            ${session.cost.toFixed(2)}
                          </p>
                          <p className="text-gray-600">Cost</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="font-medium">{session.connectorType}</p>
                          <p className="text-gray-600">Connector</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="font-medium">Station ID</p>
                          <p className="text-gray-600">{session.stationId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Usage</CardTitle>
                <CardDescription>
                  Your charging activity over the past months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyUsage.map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <span>{month.sessions} sessions</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Energy</p>
                          <p className="font-medium">
                            {month.energyDelivered.toFixed(1)} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cost</p>
                          <p className="font-medium">
                            ${month.cost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={
                          (month.sessions /
                            Math.max(
                              ...stats.monthlyUsage.map((m) => m.sessions)
                            )) *
                          100
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Favorite Station</CardTitle>
                <CardDescription>
                  Your most frequently used charging location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-lg font-medium">
                    {stats.favoriteStation}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Most visited charging station
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Stations</CardTitle>
              <CardDescription>
                Your favorite charging stations for quick access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Saved Stations Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Save your favorite charging stations for quick access
                </p>
                <Button variant="outline">Browse Stations</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
