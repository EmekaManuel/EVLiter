import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import type {
  ChargingRecommendation,
  LocationData,
  RecommendationFactor,
} from "@/types/ev";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Battery,
  Brain,
  CheckCircle,
  Clock,
  DollarSign,
  Info,
  MapPin,
  Star,
  Zap,
  Loader2,
} from "lucide-react";
import { useEffect, useState, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import MapComponent from "@/components/Map";
import { useJsApiLoader } from "@react-google-maps/api";
import { getUserLocation, calculateDistance } from "@/utils/getLocation";
import { getRecommendations as getRecommendationsApi } from "@/services/api/modules/carAdvisor";
import { useCarInfoStore } from "@/store/carInfoStore";
import type { RecommendationResult } from "@/services/api/modules/carAdvisor";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const preferencesSchema = z.object({
  prioritizeCost: z.boolean(),
  prioritizeTime: z.boolean(),
  maxDistance: z.number().min(1).max(100),
  currentBatteryLevel: z.number().min(0).max(100),
  targetBatteryLevel: z.number().min(10).max(100),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const DISTANCE_OPTIONS = [
  { value: "5", label: "5 miles" },
  { value: "10", label: "10 miles" },
  { value: "25", label: "25 miles" },
  { value: "50", label: "50 miles" },
  { value: "100", label: "100 miles" },
];

const FACTOR_ICONS = {
  cost: DollarSign,
  time: Clock,
  distance: MapPin,
  availability: Battery,
  amenities: CheckCircle,
} as const;

const FACTOR_COLORS = {
  positive: "text-green-600",
  negative: "text-red-600",
  neutral: "text-gray-600",
} as const;

const PRIORITY_COLORS = {
  high: "bg-green-50 text-green-800 border-green-200",
  medium: "bg-yellow-50 text-yellow-800 border-yellow-200",
  low: "bg-gray-50 text-gray-800 border-gray-200",
} as const;

export default function SmartAdvisorPage() {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "geometry"],
  });

  const carInfo = useCarInfoStore((state) => state.carInfo);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [recommendations, setRecommendations] = useState<
    ChargingRecommendation[]
  >([]);
  const [chargingStrategy, setChargingStrategy] = useState<
    RecommendationResult["chargingStrategy"] | null
  >(null);
  const [carInsights, setCarInsights] = useState<
    RecommendationResult["carInsights"] | null
  >(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<ChargingRecommendation | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      prioritizeCost: false,
      prioritizeTime: true,
      maxDistance: 25,
      currentBatteryLevel: 20,
      targetBatteryLevel: 80,
    },
  });

  useEffect(() => {
    if (isLoaded) {
      initializeLocation();
    }
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

  // Helper function to get city/state from coordinates using Google Geocoding
  const getCityFromCoordinates = async (
    lat: number,
    lng: number
  ): Promise<{ city: string; state?: string }> => {
    if (!window.google?.maps?.Geocoder) {
      // Fallback to default location if Geocoder not available
      return { city: "Lagos", state: "Lagos" };
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          let city = "Lagos";
          let state: string | undefined;

          // Extract city and state from address components
          for (const component of results[0].address_components) {
            if (component.types.includes("locality")) {
              city = component.long_name;
            } else if (
              component.types.includes("administrative_area_level_1")
            ) {
              state = component.long_name;
            }
          }

          resolve({ city, state });
        } else {
          // Fallback to default
          resolve({ city: "Lagos", state: "Lagos" });
        }
      });
    });
  };

  const handleGetRecommendations = async () => {
    if (!carInfo || !userLocation) {
      setError("Please ensure your car information and location are available");
      return;
    }

    setLoading(true);
    setError(null);
    // Clear previous data
    setRecommendations([]);
    setChargingStrategy(null);
    setCarInsights(null);
    setConfidence(null);
    setSelectedRecommendation(null);

    try {
      // Get city and state from coordinates
      const locationInfo = await getCityFromCoordinates(
        userLocation.latitude,
        userLocation.longitude
      );

      // Build request payload
      const formValues = form.getValues();
      const preferences = {
        prioritizeSpeed: formValues.prioritizeTime,
        dailyDrivingKm: undefined, // Could be added as a form field if needed
        chargingFrequency: undefined, // Could be added as a form field if needed
        budget: formValues.prioritizeCost
          ? { min: 0, max: undefined }
          : undefined,
        homeCharging: undefined, // Could be added as a form field if needed
      };

      const requestPayload = {
        car: {
          make: carInfo.make,
          model: carInfo.model,
          year: carInfo.year,
          batteryCapacityKWh: carInfo.batteryCapacity,
          rangeKm: carInfo.estimatedRange
            ? carInfo.estimatedRange * 1.60934
            : undefined, // Convert miles to km
        },
        location: {
          city: locationInfo.city,
          state: locationInfo.state,
          coordinates: {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          },
        },
        preferences,
      };

      // Call the API
      const result = await getRecommendationsApi(requestPayload, userLocation);

      // Update state with all data from API
      setRecommendations(result.recommendations);
      setChargingStrategy(result.strategy);
      setCarInsights(result.insights);
      setConfidence(result.confidence);
    } catch (err) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error)?.message ||
        "Failed to get charging recommendations";
      setError(errorMessage);
      console.error("Error getting recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFactorIcon = (type: RecommendationFactor["type"]) => {
    const IconComponent = FACTOR_ICONS[type] || Info;
    return <IconComponent className="h-4 w-4" />;
  };

  const getFactorColor = (impact: RecommendationFactor["impact"]) => {
    return FACTOR_COLORS[impact] || FACTOR_COLORS.neutral;
  };

  const getPriorityColor = (priority: ChargingRecommendation["priority"]) => {
    return PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
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

  const renderBatteryInput = (
    id: string,
    label: string,
    min: number,
    max: number,
    color: string,
    field: keyof PreferencesFormData
  ) => (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        className="mt-2 border-gray-200 focus:border-gray-400"
        {...form.register(field, { valueAsNumber: true })}
      />
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${form.watch(field)}%` }}
        />
      </div>
    </div>
  );

  const renderSwitchField = (
    id: string,
    label: string,
    field: keyof PreferencesFormData
  ) => (
    <div className="flex items-center justify-between py-2">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 cursor-pointer"
      >
        {label}
      </Label>
      <Switch
        id={id}
        checked={form.watch(field) as boolean}
        onCheckedChange={(checked) => form.setValue(field, checked as boolean)}
        className="data-[state=checked]:bg-gray-900 data-[state=unchecked]:bg-gray-300 border border-gray-400 data-[state=unchecked]:border-gray-400 shadow-sm [&>[data-slot=switch-thumb]]:bg-white [&>[data-slot=switch-thumb]]:shadow-md [&>[data-slot=switch-thumb]]:border [&>[data-slot=switch-thumb]]:border-gray-300 [&>[data-slot=switch-thumb]]:size-[14px]"
      />
    </div>
  );

  const calculateDirections = (
    origin: LocationData,
    destination: ChargingRecommendation["station"]
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

  const handleRecommendationClick = (rec: ChargingRecommendation) => {
    setSelectedRecommendation(rec);
    if (map) {
      map.setCenter({
        lat: rec.station.latitude,
        lng: rec.station.longitude,
      });
      map.setZoom(15);
    }

    // Calculate directions if user location is available
    if (userLocation) {
      calculateDirections(userLocation, rec.station);
    } else {
      setDirections(null);
    }
  };

  const getStationIcon = (rec: ChargingRecommendation) => {
    const availableConnectors = rec.station.availability.availableConnectors;
    const totalConnectors = rec.station.availability.totalConnectors;

    if (availableConnectors === 0) return "/icons/station-red.png";
    if (availableConnectors < totalConnectors / 2)
      return "/icons/station-yellow.png";
    return "/icons/station-green.png";
  };

  const renderStationInfo = (rec: ChargingRecommendation) => (
    <div
      key={rec.stationId}
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        selectedRecommendation?.stationId === rec.stationId
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => handleRecommendationClick(rec)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">{rec.station.name}</h4>
            <span
              className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(
                rec.priority
              )}`}
            >
              {rec.priority} priority
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-2">{rec.station.address}</p>
          <p className="text-sm text-gray-700 mb-3">{rec.reason}</p>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>${rec.estimatedCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{rec.estimatedTime} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>
                {userLocation
                  ? calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      rec.station.latitude,
                      rec.station.longitude
                    ).toFixed(1)
                  : rec.station.distance?.toFixed(1) || "N/A"}{" "}
                mi
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 mb-2">
            <Zap className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">
              {rec.station.connectors[0]?.power} kW
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {rec.station.availability.availableConnectors} available
          </span>
        </div>
      </div>
    </div>
  );

  const renderMetricCard = (
    icon: React.ReactNode,
    label: string,
    value: string,
    bgColor: string,
    textColor: string,
    borderColor: string
  ) => (
    <div className={`p-4 ${bgColor} border ${borderColor} rounded-lg`}>
      <div className="flex items-center space-x-3">
        <div className={textColor}>{icon}</div>
        <div>
          <p className={`text-sm font-medium ${textColor}`}>{label}</p>
          <p
            className={`text-lg font-light ${textColor.replace("600", "900")}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );

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
            <Brain className="h-6 w-6 text-gray-400" />
            <h1 className="text-2xl font-light text-gray-900">
              Smart Charging
            </h1>
          </div>
          <p className="text-gray-500 font-light mt-2">
            Get AI-powered charging recommendations
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preferences Form */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Car Info Display */}
              {carInfo ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    {carInfo.year} {carInfo.make} {carInfo.model}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {carInfo.batteryCapacity} kWh • {carInfo.maxChargingPower}{" "}
                    kW max
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-3">
                    Please set up your car information in the Car Recognition
                    section first.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard/ai-car-recognition")}
                    className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  >
                    Go to Car Recognition
                  </Button>
                </div>
              )}

              {/* Preferences Form */}
              <form
                onSubmit={form.handleSubmit(handleGetRecommendations)}
                className="space-y-6"
              >
                {renderBatteryInput(
                  "currentBatteryLevel",
                  "Current Battery Level (%)",
                  0,
                  100,
                  "bg-blue-600",
                  "currentBatteryLevel"
                )}

                {renderBatteryInput(
                  "targetBatteryLevel",
                  "Target Battery Level (%)",
                  10,
                  100,
                  "bg-green-600",
                  "targetBatteryLevel"
                )}

                <div className="space-y-4">
                  {renderSwitchField(
                    "prioritizeCost",
                    "Prioritize Cost Savings",
                    "prioritizeCost"
                  )}
                  {renderSwitchField(
                    "prioritizeTime",
                    "Prioritize Speed",
                    "prioritizeTime"
                  )}

                  {renderSelectField(
                    "Max Distance",
                    DISTANCE_OPTIONS,
                    (value) => form.setValue("maxDistance", parseInt(value)),
                    "Any distance"
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={loading || !carInfo || !userLocation}
                >
                  {loading ? "Analyzing..." : "Get Recommendations"}
                </Button>
              </form>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2 scrollbar-hide space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {" "}
            {recommendations.length > 0 ? (
              <>
                {/* Strategy and Insights Cards */}
                {(chargingStrategy || carInsights) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Charging Strategy */}
                    {chargingStrategy && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                        <div className="flex items-center space-x-2 mb-3">
                          <Brain className="h-5 w-5 text-blue-600" />
                          <h3 className="text-sm font-medium text-gray-900">
                            Charging Strategy
                          </h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Frequency: </span>
                            <span className="font-medium text-gray-900">
                              {chargingStrategy.recommendedFrequency}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Optimal Range:{" "}
                            </span>
                            <span className="font-medium text-gray-900">
                              {chargingStrategy.optimalChargeRange}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Monthly Cost:{" "}
                            </span>
                            <span className="font-medium text-gray-900">
                              {chargingStrategy.estimatedMonthlyCost}
                            </span>
                          </div>
                          {chargingStrategy.tips &&
                            chargingStrategy.tips.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <p className="text-xs font-medium text-gray-700 mb-2">
                                  Tips:
                                </p>
                                <ul className="space-y-1">
                                  {chargingStrategy.tips.map((tip, index) => (
                                    <li
                                      key={index}
                                      className="text-xs text-gray-600 flex items-start"
                                    >
                                      <span className="mr-2">•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Car Insights */}
                    {carInsights && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                        <div className="flex items-center space-x-2 mb-3">
                          <Info className="h-5 w-5 text-purple-600" />
                          <h3 className="text-sm font-medium text-gray-900">
                            Car Insights
                          </h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          {carInsights.efficiency && (
                            <div>
                              <span className="text-gray-600">
                                Efficiency:{" "}
                              </span>
                              <span className="font-medium text-gray-900">
                                {carInsights.efficiency}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">
                              Range Anxiety:{" "}
                            </span>
                            <span className="font-medium text-gray-900">
                              {carInsights.rangeAnxietyLevel}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Suitability Score:{" "}
                            </span>
                            <span className="font-medium text-gray-900">
                              {carInsights.suitabilityScore}/10
                            </span>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (carInsights.suitabilityScore / 10) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          {carInsights.considerations &&
                            carInsights.considerations.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-purple-200">
                                <p className="text-xs font-medium text-gray-700 mb-2">
                                  Considerations:
                                </p>
                                <ul className="space-y-1">
                                  {carInsights.considerations.map(
                                    (consideration, index) => (
                                      <li
                                        key={index}
                                        className="text-xs text-gray-600 flex items-start"
                                      >
                                        <span className="mr-2">•</span>
                                        <span>{consideration}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Map */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Map View
                  </h3>
                  {locationLoading ? (
                    <div className="h-96 w-full rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <p className="text-gray-500">
                          Getting your location...
                        </p>
                      </div>
                    </div>
                  ) : userLocation ? (
                    <MapComponent
                      center={{
                        lat: userLocation.latitude,
                        lng: userLocation.longitude,
                      }}
                      zoom={recommendations.length > 0 ? 11 : 12}
                      markers={recommendations.map((rec) => ({
                        id: rec.stationId,
                        position: {
                          lat: rec.station.latitude,
                          lng: rec.station.longitude,
                        },
                        title: rec.station.name,
                        icon: getStationIcon(rec),
                        onClick: () => handleRecommendationClick(rec),
                      }))}
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

                {/* Recommendations List */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Recommended Stations ({recommendations.length})
                  </h3>
                  <div className="space-y-3">
                    {recommendations.map(renderStationInfo)}
                  </div>
                </div>

                {/* Selected Recommendation Details */}
                {selectedRecommendation && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedRecommendation.station.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedRecommendation.station.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {selectedRecommendation.station.rating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {
                            selectedRecommendation.station.availability
                              .availableConnectors
                          }
                          /
                          {
                            selectedRecommendation.station.availability
                              .totalConnectors
                          }{" "}
                          Available
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Cost and Time Analysis */}
                      <div className="grid grid-cols-2 gap-6">
                        {renderMetricCard(
                          <DollarSign className="h-5 w-5" />,
                          "Estimated Cost",
                          `₦${selectedRecommendation.estimatedCost.toFixed(2)}`,
                          "bg-green-50",
                          "text-green-600",
                          "border-green-200"
                        )}

                        {renderMetricCard(
                          <Clock className="h-5 w-5" />,
                          "Estimated Time",
                          `${selectedRecommendation.estimatedTime} min`,
                          "bg-blue-50",
                          "text-blue-600",
                          "border-blue-200"
                        )}
                      </div>

                      {/* Recommendation Factors */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Recommendation Factors
                        </h4>
                        <div className="space-y-3">
                          {selectedRecommendation.factors.map(
                            (factor, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                              >
                                <div className={getFactorColor(factor.impact)}>
                                  {getFactorIcon(factor.type)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium capitalize text-gray-900">
                                    {factor.type.replace("_", " ")}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {factor.description}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Progress
                                    value={factor.weight * 100}
                                    className="w-16 h-2"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {(factor.weight * 100).toFixed(0)}%
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Button
                          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                          onClick={() => {
                            if (selectedRecommendation && userLocation) {
                              if (!directions) {
                                calculateDirections(
                                  userLocation,
                                  selectedRecommendation.station
                                );
                              }
                              // Also open in Google Maps
                              const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${selectedRecommendation.station.latitude},${selectedRecommendation.station.longitude}&travelmode=driving`;
                              window.open(url, "_blank");
                            }
                          }}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-gray-200"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Start Charging
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confidence Indicator */}
                {confidence !== null && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Recommendation Confidence:
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            confidence > 0.7
                              ? "bg-green-600"
                              : confidence > 0.4
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {(confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-gray-500 font-light">
                  Configure your preferences and click "Get Recommendations" to
                  see AI-powered suggestions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
