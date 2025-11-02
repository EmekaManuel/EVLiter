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
import type {
  ChargingStation,
  LocationData,
  StationSearchFilters,
} from "@/types/ev";
import MapComponent from "@/components/Map";
import { useJsApiLoader } from "@react-google-maps/api";
import { getUserLocation, calculateDistance } from "@/utils/getLocation";
import {
  DollarSign,
  MapPin,
  Navigation,
  Search,
  Star,
  Zap,
  Loader2,
} from "lucide-react";
import { useEffect, useState, type SetStateAction } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "geometry"],
  });

  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<StationSearchFilters>({});

  useEffect(() => {
    if (isLoaded) {
      initializeLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const initializeLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const location = await getUserLocation({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      setUserLocation(location);
      console.log("User location obtained:", location);

      // Load nearby stations once we have the location
      await loadNearbyStations(location);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get location";
      setLocationError(errorMessage);
      console.error("Failed to get location:", error);

      // Set a default location (fallback)
      const defaultLocation: LocationData = {
        latitude: 40.7128,
        longitude: -74.006,
      };
      setUserLocation(defaultLocation);
    } finally {
      setLocationLoading(false);
    }
  };

  const loadNearbyStations = async (location: LocationData) => {
    setLoading(true);
    try {
      // Your API call to fetch stations would go here
      // For now, we'll just log it
      console.log("Loading stations near:", location);

      // Example: const response = await chargingStationService.getNearbyStations(location, 25, filters);
      // setStations(response.data);
    } catch (error) {
      console.error("Failed to load charging stations:", error);
    } finally {
      setLoading(false);
    }
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

  const calculateDirections = (
    origin: LocationData,
    destination: ChargingStation
  ) => {
    if (!window.google?.maps?.DirectionsService) {
      console.warn("DirectionsService not available");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: origin.latitude, lng: origin.longitude },
        destination: {
          lat: destination.latitude,
          lng: destination.longitude,
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
          if (map && result.routes[0]) {
            const bounds = new window.google.maps.LatLngBounds();
            result.routes[0].legs.forEach((leg) => {
              bounds.extend(leg.start_location);
              bounds.extend(leg.end_location);
            });
            map.fitBounds(bounds);
          }
        } else {
          console.error("Directions request failed:", status);
          setDirections(null);
        }
      }
    );
  };

  const handleStationClick = (station: ChargingStation) => {
    setSelectedStation(station);
    if (map) {
      map.setCenter({ lat: station.latitude, lng: station.longitude });
      map.setZoom(15);
    }

    // Calculate directions if user location is available
    if (userLocation) {
      calculateDirections(userLocation, station);
    } else {
      setDirections(null);
    }
  };

  const handleSearch = async () => {
    if (!userLocation) return;
    setDirections(null); // Clear previous directions
    setSelectedStation(null); // Clear selection
    await loadNearbyStations(userLocation);
  };

  const handleFilterChange = (key: keyof StationSearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getDistance = (station: ChargingStation) => {
    if (!userLocation) return null;
    return calculateDistance(
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
        <SelectTrigger className="mt-2 border-gray-200 focus:border-gray-400">
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
      onClick={() => handleStationClick(station)}
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

  // Prepare markers for MapComponent
  const mapMarkers = stations.map((station) => ({
    id: station.id,
    position: { lat: station.latitude, lng: station.longitude },
    title: station.name,
    icon: getStationIcon(station),
    onClick: () => handleStationClick(station),
  }));

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          <div className="text-gray-500">Loading maps...</div>
        </div>
      </div>
    );
  }

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

          {/* Location Error Alert */}
          {locationError && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Location access:</strong> {locationError}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={initializeLocation}
                className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                Try Again
              </Button>
            </div>
          )}
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
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Apply Filters"
                  )}
                </Button>
              </div>

              {/* Station List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Nearby Stations ({stations.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No stations found nearby
                    </div>
                  ) : (
                    stations.map((station) =>
                      renderStationInfo(
                        station,
                        selectedStation?.id === station.id
                      )
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
              {locationLoading ? (
                <div className="h-96 w-full rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    <p className="text-gray-500">Getting your location...</p>
                  </div>
                </div>
              ) : userLocation ? (
                <MapComponent
                  center={{
                    lat: userLocation.latitude,
                    lng: userLocation.longitude,
                  }}
                  zoom={12}
                  markers={mapMarkers}
                  directions={directions}
                  onMapLoad={(
                    mapInstance: SetStateAction<google.maps.Map | null>
                  ) => setMap(mapInstance)}
                />
              ) : (
                <div className="h-96 w-full rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <p className="text-gray-500 mb-3">
                      Unable to load location
                    </p>
                    <Button
                      onClick={initializeLocation}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}
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
                  <Button
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                    onClick={() => {
                      if (selectedStation && userLocation) {
                        if (!directions) {
                          calculateDirections(userLocation, selectedStation);
                        }
                        // Also open in Google Maps
                        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${selectedStation.latitude},${selectedStation.longitude}&travelmode=driving`;
                        window.open(url, "_blank");
                      }
                    }}
                  >
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
