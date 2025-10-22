import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminDashboardService } from "@/services/api/ev";
import type { AdminAnalytics, ChargingStation } from "@/types/ev";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  DollarSign,
  Edit,
  Eye,
  MapPin,
  Plus,
  Settings,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsResponse, stationsResponse] = await Promise.all([
        adminDashboardService.getAnalytics(),
        adminDashboardService.getAnalytics(), // This would be a different endpoint for stations
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (err) {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockAnalytics: AdminAnalytics = {
    totalStations: 156,
    activeStations: 148,
    totalUsers: 2847,
    totalSessions: 12450,
    revenue: 18750.5,
    energyDelivered: 45620.8,
    stationUtilization: [
      {
        stationId: "station-1",
        stationName: "Downtown Hub",
        utilizationRate: 85,
        totalSessions: 1240,
        revenue: 1860.0,
      },
      {
        stationId: "station-2",
        stationName: "Mall Parking",
        utilizationRate: 72,
        totalSessions: 980,
        revenue: 1470.0,
      },
      {
        stationId: "station-3",
        stationName: "Highway Rest Stop",
        utilizationRate: 68,
        totalSessions: 850,
        revenue: 1275.0,
      },
      {
        stationId: "station-4",
        stationName: "Airport Terminal",
        utilizationRate: 91,
        totalSessions: 1560,
        revenue: 2340.0,
      },
      {
        stationId: "station-5",
        stationName: "University Campus",
        utilizationRate: 45,
        totalSessions: 320,
        revenue: 480.0,
      },
    ],
    userGrowth: [
      { month: "2024-01", newUsers: 120, totalUsers: 2100 },
      { month: "2024-02", newUsers: 180, totalUsers: 2280 },
      { month: "2024-03", newUsers: 220, totalUsers: 2500 },
      { month: "2024-04", newUsers: 347, totalUsers: 2847 },
    ],
    revenueByMonth: [
      { month: "2024-01", revenue: 4200.5, sessions: 2800 },
      { month: "2024-02", revenue: 4800.75, sessions: 3200 },
      { month: "2024-03", revenue: 5200.25, sessions: 3500 },
      { month: "2024-04", revenue: 4550.0, sessions: 2950 },
    ],
  };

  const mockStations: ChargingStation[] = [
    {
      id: "station-1",
      name: "Downtown Charging Hub",
      address: "123 Main St, Downtown",
      latitude: 40.7128,
      longitude: -74.006,
      connectors: [
        {
          id: "conn-1",
          type: "CCS",
          power: 150,
          status: "available",
          pricePerKwh: 0.15,
        },
        {
          id: "conn-2",
          type: "CHAdeMO",
          power: 50,
          status: "occupied",
          pricePerKwh: 0.15,
        },
      ],
      amenities: ["WiFi", "Restrooms", "Coffee Shop"],
      pricing: { basePrice: 0.15, currency: "USD" },
      availability: {
        availableConnectors: 1,
        totalConnectors: 2,
        lastUpdated: "2024-04-15T10:30:00Z",
      },
      rating: 4.5,
      operatingHours: {
        monday: { open: "06:00", close: "22:00" },
        tuesday: { open: "06:00", close: "22:00" },
        wednesday: { open: "06:00", close: "22:00" },
        thursday: { open: "06:00", close: "22:00" },
        friday: { open: "06:00", close: "22:00" },
        saturday: { open: "08:00", close: "20:00" },
        sunday: { open: "08:00", close: "20:00" },
      },
    },
  ];

  const data = analytics || mockAnalytics;
  const stationData = stations.length > 0 ? stations : mockStations;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{data.totalStations}</p>
                <p className="text-sm text-gray-600">Total Stations</p>
                <Badge variant="outline" className="mt-1">
                  {data.activeStations} Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Users</p>
                <Badge variant="outline" className="mt-1">
                  +{data.userGrowth[data.userGrowth.length - 1]?.newUsers} this
                  month
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data.totalSessions.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <Badge variant="outline" className="mt-1">
                  {data.energyDelivered.toFixed(0)} kWh delivered
                </Badge>
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
                  ${data.revenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <Badge variant="outline" className="mt-1">
                  ${(data.revenue / data.totalSessions).toFixed(2)} avg/session
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Station Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Station Utilization</CardTitle>
                <CardDescription>
                  Top performing charging stations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.stationUtilization.slice(0, 5).map((station) => (
                    <div key={station.stationId} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {station.stationName}
                        </span>
                        <span>{station.utilizationRate}% utilization</span>
                      </div>
                      <Progress value={station.utilizationRate} />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Sessions</p>
                          <p className="font-medium">{station.totalSessions}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-medium">
                            ${station.revenue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  Monthly user registration trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userGrowth.map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <span>+{month.newUsers} new users</span>
                      </div>
                      <Progress
                        value={
                          (month.newUsers /
                            Math.max(
                              ...data.userGrowth.map((m) => m.newUsers)
                            )) *
                          100
                        }
                      />
                      <p className="text-sm text-gray-600">
                        Total: {month.totalUsers.toLocaleString()} users
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Monthly revenue and session data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.revenueByMonth.map((month) => (
                  <div key={month.month} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{month.month}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-medium">
                          ${month.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sessions</span>
                        <span className="font-medium">{month.sessions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg/Session</span>
                        <span className="font-medium">
                          ${(month.revenue / month.sessions).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Charging Stations</CardTitle>
                  <CardDescription>
                    Manage all charging stations in the network
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Station
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stationData.map((station) => (
                  <div key={station.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{station.name}</h3>
                        <p className="text-sm text-gray-600">
                          {station.address}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            station.availability.availableConnectors > 0
                              ? "default"
                              : "secondary"
                          }
                        >
                          {station.availability.availableConnectors}/
                          {station.availability.totalConnectors} Available
                        </Badge>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Rating</p>
                        <p className="font-medium">{station.rating}/5</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price</p>
                        <p className="font-medium">
                          ${station.pricing.basePrice.toFixed(2)}/kWh
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Connectors</p>
                        <p className="font-medium">
                          {station.connectors.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amenities</p>
                        <p className="font-medium">
                          {station.amenities.length}
                        </p>
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
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Overall system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Station Uptime</span>
                    <span className="text-sm">98.5%</span>
                  </div>
                  <Progress value={98.5} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Average Session Time
                    </span>
                    <span className="text-sm">42 min</span>
                  </div>
                  <Progress value={84} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Customer Satisfaction
                    </span>
                    <span className="text-sm">4.3/5</span>
                  </div>
                  <Progress value={86} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alerts & Issues</CardTitle>
                <CardDescription>
                  Current system alerts and maintenance needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Station Maintenance Due
                      </p>
                      <p className="text-xs text-gray-600">
                        3 stations require routine maintenance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Out of Service</p>
                      <p className="text-xs text-gray-600">
                        1 station temporarily offline
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">
                        All Systems Operational
                      </p>
                      <p className="text-xs text-gray-600">
                        Network running smoothly
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Station</CardTitle>
                <CardDescription>
                  Add a new charging station to the network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stationName">Station Name</Label>
                  <Input id="stationName" placeholder="Enter station name" />
                </div>

                <div>
                  <Label htmlFor="stationAddress">Address</Label>
                  <Input
                    id="stationAddress"
                    placeholder="Enter station address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="40.7128"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="-74.0060"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="connectorType">Connector Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select connector type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CCS">CCS</SelectItem>
                      <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                      <SelectItem value="Tesla Supercharger">
                        Tesla Supercharger
                      </SelectItem>
                      <SelectItem value="Type 2">Type 2</SelectItem>
                      <SelectItem value="Type 1">Type 1</SelectItem>
                      <SelectItem value="GB/T">GB/T</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Station
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Operations</CardTitle>
                <CardDescription>
                  Perform bulk operations on stations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update All Pricing
                </Button>

                <Button variant="outline" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Refresh Availability
                </Button>

                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>

                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
