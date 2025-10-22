/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
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
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Geocoder: new () => {
          geocode: (
            request: any,
            callback: (results: any[] | null, status: any) => void
          ) => void;
        };
        GeocoderResult: any;
        GeocoderStatus: any;
      };
    };
  }
}

const CONNECTOR_TYPES = [
  { value: "all", label: "All Types" },
  { value: "CCS", label: "CCS" },
  { value: "CHAdeMO", label: "CHAdeMO" },
  { value: "Tesla Supercharger", label: "Tesla Supercharger" },
  { value: "Type 2", label: "Type 2" },
  { value: "Type 1", label: "Type 1" },
  { value: "GB/T", label: "GB/T" },
];

const POWER_LEVELS = [
  { value: "0", label: "Any" },
  { value: "50", label: "50+ kW" },
  { value: "100", label: "100+ kW" },
  { value: "150", label: "150+ kW" },
  { value: "250", label: "250+ kW" },
];

const DISTANCES = [
  { value: "5", label: "5 miles" },
  { value: "10", label: "10 miles" },
  { value: "25", label: "25 miles" },
  { value: "50", label: "50 miles" },
  { value: "100", label: "100 miles" },
];

export default function ChargingStationsPage() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<StationSearchFilters>({});
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeMapAndLocation();
  });

  const initializeMapAndLocation = async () => {
    try {
      const location = await mapsService.getCurrentLocation();
      setUserLocation(location);

      if (mapRef.current && window.google) {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: location.latitude, lng: location.longitude },
          zoom: 12,
          mapTypeId: "roadmap",
        });
        setMap(mapInstance);
        await loadNearbyStations(location);
      }
    } catch {
      console.error("Failed to initialize map or get location");
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
    } catch {
      console.error("Failed to load charging stations");
    } finally {
      setLoading(false);
    }
  };

  const addStationsToMap = (stations: ChargingStation[]) => {
    if (!map) return;

    stations.forEach((station) => {
      const marker = new (window.google.maps as any).Marker({
        position: { lat: station.latitude, lng: station.longitude },
        map: map,
        title: station.name,
        icon: {
          url: getStationIcon(station),
          // @ts-expect crazt types
          scaledSize: new (window.google.maps as any).Size(30, 30),
        },
      });

      marker.addListener("click", () => {
        setSelectedStation(station);
        map.setCenter({ lat: station.latitude, lng: station.longitude });
        map.setZoom(15);
      });
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

  const renderSelectField = (
    label: string,
    options: Array<{ value: string; label: string }>,
    onValueChange: (value: string) => void,
    placeholder: string
  ) => (
    <div className="relative">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Select onValueChange={onValueChange}>
        <SelectTrigger className="mt-2  border-gray-200 focus:border-gray-400">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-50 bg-white">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-gray-100"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderStationInfo = (station: ChargingStation, isSelected = false) => (
    <div
      key={station.id}
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => setSelectedStation(station)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{station.name}</h4>
          <p className="text-sm text-gray-500 mt-1">{station.address}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <span className={`font-medium ${getAvailabilityColor(station)}`}>
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
          <div className="flex items-center space-x-1 mb-1">
            <Star className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{station.rating}</span>
          </div>
          <p className="text-sm text-gray-500">
            ${station.pricing.basePrice.toFixed(2)}/kWh
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-gray-400" />
            <h1 className="text-2xl font-light text-gray-900">
              Charging Stations
            </h1>
          </div>
          <p className="text-gray-500 font-light mt-2">
            Find nearby charging points with real-time availability
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and Filters */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Search */}
              <div>
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-700"
                >
                  Search Location
                </Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="search"
                    placeholder="Enter address or city"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-gray-200 focus:border-gray-400"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-6">
                {renderSelectField(
                  "Connector Type",
                  CONNECTOR_TYPES,
                  (value) => handleFilterChange("connectorType", [value]),
                  "All connector types"
                )}

                {renderSelectField(
                  "Min Power (kW)",
                  POWER_LEVELS,
                  (value) => handleFilterChange("minPower", parseInt(value)),
                  "Any power level"
                )}

                {renderSelectField(
                  "Max Distance",
                  DISTANCES,
                  (value) => handleFilterChange("maxDistance", parseInt(value)),
                  "Any distance"
                )}

                <Button
                  onClick={handleSearch}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Apply Filters"}
                </Button>
              </div>

              {/* Station List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Nearby Stations ({stations.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stations.map((station) =>
                    renderStationInfo(
                      station,
                      selectedStation?.id === station.id
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Map and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Map View
              </h3>
              <div
                ref={mapRef}
                className="h-96 w-full rounded-lg border border-gray-200"
              />
            </div>

            {/* Selected Station Details */}
            {selectedStation && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedStation.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedStation.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {selectedStation.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {selectedStation.availability.availableConnectors}/
                      {selectedStation.availability.totalConnectors} Available
                    </span>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-50">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-white"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="connectors"
                      className="data-[state=active]:bg-white"
                    >
                      Connectors
                    </TabsTrigger>
                    <TabsTrigger
                      value="amenities"
                      className="data-[state=active]:bg-white"
                    >
                      Amenities
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Price
                          </p>
                          <p className="text-lg font-light text-gray-900">
                            ${selectedStation.pricing.basePrice.toFixed(2)}/kWh
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Rating
                          </p>
                          <p className="text-lg font-light text-gray-900">
                            {selectedStation.rating}/5
                          </p>
                        </div>
                      </div>
                    </div>

                    {userLocation && (
                      <div className="flex items-center space-x-3">
                        <Navigation className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          Distance: {getDistance(selectedStation)?.toFixed(1)}{" "}
                          miles
                        </span>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="connectors" className="mt-6 space-y-3">
                    {selectedStation.connectors.map((connector) => (
                      <div
                        key={connector.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {connector.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {connector.power} kW
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 text-xs rounded-full border ${
                              connector.status === "available"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {connector.status.replace("_", " ")}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            ${connector.pricePerKwh.toFixed(2)}/kWh
                          </p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="amenities" className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {selectedStation.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 flex space-x-3">
                  <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button variant="outline" className="flex-1 border-gray-200">
                    <Zap className="h-4 w-4 mr-2" />
                    Start Charging
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
