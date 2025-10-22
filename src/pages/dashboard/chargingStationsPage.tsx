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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chargingStationService, mapsService } from "@/services/api/ev";
import type {
  ChargingStation,
  LocationData,
  StationSearchFilters,
} from "@/types/ev";
import {
  DollarSign,
  MapPin,
  Navigation,
  Search,
  Star,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function ChargingStationsPage() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<StationSearchFilters>({});
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize map and get user location
  useEffect(() => {
    initializeMapAndLocation();
  }, []);

  const initializeMapAndLocation = async () => {
    try {
      // Get user's current location
      const location = await mapsService.getCurrentLocation();
      setUserLocation(location);

      // Initialize Google Maps
      if (mapRef.current && window.google) {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: location.latitude, lng: location.longitude },
          zoom: 12,
          mapTypeId: "roadmap",
        });
        setMap(mapInstance);

        // Load nearby stations
        await loadNearbyStations(location);
      }
    } catch (err) {
      setError("Failed to initialize map or get location");
    }
  };

  const loadNearbyStations = async (location: LocationData) => {
    setLoading(true);
    try {
      const response = await chargingStationService.getNearbyStations(
        location,
        25,
        filters
      );
      if (response.success) {
        setStations(response.data);
        addStationsToMap(response.data);
      }
    } catch (err) {
      setError("Failed to load charging stations");
    } finally {
      setLoading(false);
    }
  };

  const addStationsToMap = (stations: ChargingStation[]) => {
    if (!map) return;

    // Clear existing markers
    const markers: any[] = [];

    stations.forEach((station) => {
      const marker = new window.google.maps.Marker({
        position: { lat: station.latitude, lng: station.longitude },
        map: map,
        title: station.name,
        icon: {
          url: getStationIcon(station),
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });

      marker.addListener("click", () => {
        setSelectedStation(station);
        map.setCenter({ lat: station.latitude, lng: station.longitude });
        map.setZoom(15);
      });

      markers.push(marker);
    });
  };

  const getStationIcon = (station: ChargingStation) => {
    const availableConnectors = station.connectors.filter(
      (c) => c.status === "available"
    ).length;
    const totalConnectors = station.connectors.length;

    if (availableConnectors === 0) return "/icons/station-red.png";
    if (availableConnectors < totalConnectors / 2)
      return "/icons/station-yellow.png";
    return "/icons/station-green.png";
  };

  const handleSearch = async () => {
    if (!userLocation) return;
    await loadNearbyStations(userLocation);
  };

  const handleFilterChange = (key: keyof StationSearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getDistance = (station: ChargingStation) => {
    if (!userLocation) return null;
    return mapsService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      station.latitude,
      station.longitude
    );
  };

  const getAvailabilityColor = (station: ChargingStation) => {
    const available = station.availability.availableConnectors;
    const total = station.availability.totalConnectors;
    const percentage = (available / total) * 100;

    if (percentage === 0) return "text-red-600";
    if (percentage < 50) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <MapPin className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Charging Stations</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search and Filters */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search & Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search Location</Label>
                <div className="flex space-x-2">
                  <Input
                    id="search"
                    placeholder="Enter address or city"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Connector Type</Label>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange("connectorType", [value])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All connector types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
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

              <div>
                <Label>Min Power (kW)</Label>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange("minPower", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any power level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any</SelectItem>
                    <SelectItem value="50">50+ kW</SelectItem>
                    <SelectItem value="100">100+ kW</SelectItem>
                    <SelectItem value="150">150+ kW</SelectItem>
                    <SelectItem value="250">250+ kW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max Distance</Label>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange("maxDistance", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 miles</SelectItem>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="25">25 miles</SelectItem>
                    <SelectItem value="50">50 miles</SelectItem>
                    <SelectItem value="100">100 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Searching..." : "Apply Filters"}
              </Button>
            </CardContent>
          </Card>

          {/* Station List */}
          <Card>
            <CardHeader>
              <CardTitle>Nearby Stations ({stations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stations.map((station) => (
                  <div
                    key={station.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStation?.id === station.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedStation(station)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{station.name}</h3>
                        <p className="text-sm text-gray-600">
                          {station.address}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span
                            className={`font-medium ${getAvailabilityColor(
                              station
                            )}`}
                          >
                            {station.availability.availableConnectors}/
                            {station.availability.totalConnectors} available
                          </span>
                          {userLocation && (
                            <span className="text-gray-500">
                              {getDistance(station)?.toFixed(1)} mi
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {station.rating}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          ${station.pricing.basePrice.toFixed(2)}/kWh
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Map View</CardTitle>
              <CardDescription>
                Click on stations to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={mapRef} className="h-96 w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Selected Station Details */}
          {selectedStation && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedStation.name}</span>
                  <Badge variant="secondary">
                    {selectedStation.availability.availableConnectors}/
                    {selectedStation.availability.totalConnectors} Available
                  </Badge>
                </CardTitle>
                <CardDescription>{selectedStation.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="connectors">Connectors</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Price</p>
                          <p className="text-lg font-bold">
                            ${selectedStation.pricing.basePrice.toFixed(2)}/kWh
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">Rating</p>
                          <p className="text-lg font-bold">
                            {selectedStation.rating}/5
                          </p>
                        </div>
                      </div>
                    </div>

                    {userLocation && (
                      <div className="flex items-center space-x-2">
                        <Navigation className="h-5 w-5 text-blue-600" />
                        <span>
                          Distance: {getDistance(selectedStation)?.toFixed(1)}{" "}
                          miles
                        </span>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="connectors" className="space-y-3">
                    {selectedStation.connectors.map((connector) => (
                      <div
                        key={connector.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{connector.type}</p>
                          <p className="text-sm text-gray-600">
                            {connector.power} kW
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              connector.status === "available"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {connector.status.replace("_", " ")}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            ${connector.pricePerKwh.toFixed(2)}/kWh
                          </p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="amenities" className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedStation.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 flex space-x-3">
                  <Button className="flex-1">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Start Charging
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
