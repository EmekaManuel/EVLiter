import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminAnalytics, ChargingStation } from "@/types/ev";
import {
  DollarSign,
  Edit,
  Eye,
  MapPin,
  Plus,
  Settings,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    // Fix: setLoading does not exist; likely was meant to indicate API activity but not defined in state
    try {
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
            utilizationRate: 0.85,
            totalSessions: 1240,
            revenue: 1860.0,
          },
          {
            stationId: "station-2",
            stationName: "Mall Parking",
            utilizationRate: 0.72,
            totalSessions: 980,
            revenue: 1470.0,
          },
          {
            stationId: "station-3",
            stationName: "Highway Rest Stop",
            utilizationRate: 0.68,
            totalSessions: 850,
            revenue: 1275.0,
          },
          {
            stationId: "station-4",
            stationName: "Airport Terminal",
            utilizationRate: 0.91,
            totalSessions: 1560,
            revenue: 2340.0,
          },
        ],
        userGrowth: [
          { month: "Jan", newUsers: 245, totalUsers: 2100 },
          { month: "Feb", newUsers: 312, totalUsers: 2412 },
          { month: "Mar", newUsers: 289, totalUsers: 2701 },
          { month: "Apr", newUsers: 146, totalUsers: 2847 },
        ],
        revenueByMonth: [
          { month: "Jan", revenue: 4200.5, sessions: 2100 },
          { month: "Feb", revenue: 4800.2, sessions: 2400 },
          { month: "Mar", revenue: 5200.8, sessions: 2600 },
          { month: "Apr", revenue: 4550.0, sessions: 2275 },
        ],
      };

      const mockStations: ChargingStation[] = [
        {
          id: "station-1",
          name: "Downtown Hub",
          address: "123 Main St, Downtown",
          latitude: 40.7128,
          longitude: -74.006,
          connectors: [
            {
              id: "conn-1",
              type: "CCS",
              power: 150,
              status: "available",
              pricePerKwh: 0.35,
            },
            {
              id: "conn-2",
              type: "Tesla Supercharger",
              power: 250,
              status: "available",
              pricePerKwh: 0.4,
            },
          ],
          amenities: ["WiFi", "Restrooms", "Coffee Shop"],
          pricing: { basePrice: 0.35, currency: "USD" },
          availability: {
            availableConnectors: 2,
            totalConnectors: 2,
            lastUpdated: new Date().toISOString(),
          },
          rating: 4.8,
          operatingHours: {
            monday: { open: "06:00", close: "22:00" },
            tuesday: { open: "06:00", close: "22:00" },
            wednesday: { open: "06:00", close: "22:00" },
            thursday: { open: "06:00", close: "22:00" },
            friday: { open: "06:00", close: "22:00" },
            saturday: { open: "06:00", close: "22:00" },
            sunday: { open: "06:00", close: "22:00" },
          },
        },
        {
          id: "station-2",
          name: "Mall Parking",
          address: "456 Shopping Blvd, Mall District",
          latitude: 40.7589,
          longitude: -73.9851,
          connectors: [
            {
              id: "conn-3",
              type: "Type 2",
              power: 50,
              status: "available",
              pricePerKwh: 0.3,
            },
            {
              id: "conn-4",
              type: "CHAdeMO",
              power: 100,
              status: "occupied",
              pricePerKwh: 0.35,
            },
          ],
          amenities: ["Shopping", "Food Court"],
          pricing: { basePrice: 0.3, currency: "USD" },
          availability: {
            availableConnectors: 1,
            totalConnectors: 2,
            lastUpdated: new Date().toISOString(),
          },
          rating: 4.2,
          operatingHours: {
            monday: { open: "10:00", close: "21:00" },
            tuesday: { open: "10:00", close: "21:00" },
            wednesday: { open: "10:00", close: "21:00" },
            thursday: { open: "10:00", close: "21:00" },
            friday: { open: "10:00", close: "21:00" },
            saturday: { open: "10:00", close: "21:00" },
            sunday: { open: "10:00", close: "21:00" },
          },
        },
        {
          id: "station-3",
          name: "Highway Rest Stop",
          address: "789 Interstate 95, Mile Marker 42",
          latitude: 40.6892,
          longitude: -74.0445,
          connectors: [
            {
              id: "conn-5",
              type: "CCS",
              power: 200,
              status: "available",
              pricePerKwh: 0.45,
            },
            {
              id: "conn-6",
              type: "Tesla Supercharger",
              power: 250,
              status: "available",
              pricePerKwh: 0.5,
            },
            {
              id: "conn-7",
              type: "CHAdeMO",
              power: 100,
              status: "out_of_order",
              pricePerKwh: 0.4,
            },
          ],
          amenities: ["Restrooms", "Gas Station", "Restaurant"],
          pricing: { basePrice: 0.45, currency: "USD" },
          availability: {
            availableConnectors: 2,
            totalConnectors: 3,
            lastUpdated: new Date().toISOString(),
          },
          rating: 4.5,
          operatingHours: {
            monday: { open: "00:00", close: "23:59", is24Hours: true },
            tuesday: { open: "00:00", close: "23:59", is24Hours: true },
            wednesday: { open: "00:00", close: "23:59", is24Hours: true },
            thursday: { open: "00:00", close: "23:59", is24Hours: true },
            friday: { open: "00:00", close: "23:59", is24Hours: true },
            saturday: { open: "00:00", close: "23:59", is24Hours: true },
            sunday: { open: "00:00", close: "23:59", is24Hours: true },
          },
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAnalytics(mockAnalytics);
      setStations(mockStations);
    } catch {
      setError("Failed to load admin data");
    }
  };

  const handleUpdateStation = async (
    stationId: string,
    updates: Partial<ChargingStation>
  ) => {
    try {
      // Mock update - in real app would call API
      console.log("Updating station:", stationId, updates);
    } catch {
      setError("Failed to update station");
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    try {
      // Mock delete - in real app would call API
      console.log("Deleting station:", stationId);
    } catch {
      setError("Failed to delete station");
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

  const renderStationCard = (station: ChargingStation) => (
    <div key={station.id} className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900">{station.name}</h4>
          <span
            className={`text-xs px-2 py-1 rounded-full border ${
              station.availability.availableConnectors > 0
                ? "text-green-600 border-green-200"
                : "text-red-600 border-red-200"
            }`}
          >
            {station.availability.availableConnectors}/
            {station.availability.totalConnectors} available
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            ${station.pricing.basePrice.toFixed(2)}/kWh
          </p>
          <p className="text-xs text-gray-500">{station.rating}/5</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{station.address}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-gray-400" />
          <span>{station.connectors[0]?.power} kW</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{station.connectors.length} connectors</span>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-gray-400" />
          <span>{station.amenities.length} amenities</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
        <Button variant="outline" size="sm" className="flex-1 border-gray-200">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gray-200"
          onClick={() => handleUpdateStation(station.id, {})}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => handleDeleteStation(station.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-gray-400" />
            <h1 className="text-2xl font-light text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-500 font-light mt-2">
            Manage charging stations and view analytics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Analytics Overview */}
          {analytics && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Analytics Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderStatCard(
                  <MapPin className="h-5 w-5 text-gray-600" />,
                  "Total Stations",
                  analytics.totalStations.toString(),
                  `${analytics.activeStations} active`
                )}
                {renderStatCard(
                  <Users className="h-5 w-5 text-gray-600" />,
                  "Total Users",
                  analytics.totalUsers.toString(),
                  "Registered"
                )}
                {renderStatCard(
                  <Zap className="h-5 w-5 text-gray-600" />,
                  "Total Sessions",
                  analytics.totalSessions.toString(),
                  "This month"
                )}
                {renderStatCard(
                  <DollarSign className="h-5 w-5 text-gray-600" />,
                  "Revenue",
                  `$${analytics.revenue.toFixed(2)}`,
                  "This month"
                )}
              </div>
            </div>
          )}

          {/* Station Management */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Station Management
              </h3>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Station
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-50">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white"
                >
                  All Stations
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-white"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="maintenance"
                  className="data-[state=active]:bg-white"
                >
                  Maintenance
                </TabsTrigger>
                <TabsTrigger
                  value="offline"
                  className="data-[state=active]:bg-white"
                >
                  Offline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-3">
                  {stations.map(renderStationCard)}
                </div>
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                <div className="space-y-3">
                  {stations
                    .filter(
                      (station) => station.availability.availableConnectors > 0
                    )
                    .map(renderStationCard)}
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="mt-6">
                <div className="space-y-3">
                  {stations
                    .filter(
                      (station) =>
                        station.availability.availableConnectors <
                        station.availability.totalConnectors
                    )
                    .map(renderStationCard)}
                </div>
              </TabsContent>

              <TabsContent value="offline" className="mt-6">
                <div className="space-y-3">
                  {stations
                    .filter(
                      (station) =>
                        station.availability.availableConnectors === 0
                    )
                    .map(renderStationCard)}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Station Utilization */}
          {analytics && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Station Utilization
              </h3>
              <div className="space-y-3">
                {analytics.stationUtilization.map((station) => (
                  <div
                    key={station.stationId}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {station.stationName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {station.totalSessions} sessions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {(station.utilizationRate * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          ${station.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={station.utilizationRate * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Growth */}
          {analytics && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                User Growth
              </h3>
              <div className="space-y-3">
                {analytics.userGrowth.map((growth) => (
                  <div
                    key={growth.month}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {growth.month}
                        </h4>
                        <p className="text-sm text-gray-500">
                          +{growth.newUsers} new users
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {growth.totalUsers}
                        </p>
                        <p className="text-xs text-gray-500">total users</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Data */}
          {analytics && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Revenue by Month
              </h3>
              <div className="space-y-3">
                {analytics.revenueByMonth.map((revenue) => (
                  <div
                    key={revenue.month}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {revenue.month}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {revenue.sessions} sessions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${revenue.revenue.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">revenue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
