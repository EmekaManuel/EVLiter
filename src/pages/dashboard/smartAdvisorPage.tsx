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
import { mapsService, smartAdvisorService } from "@/services/api/ev";
import type {
  CarInfo,
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  const [carInfo, setCarInfo] = useState<CarInfo | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [recommendations, setRecommendations] = useState<
    ChargingRecommendation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<ChargingRecommendation | null>(null);

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
    initializeLocation();
    const savedCarInfo = localStorage.getItem("carInfo");
    if (savedCarInfo) {
      setCarInfo(JSON.parse(savedCarInfo));
    }
  }, []);

  const initializeLocation = async () => {
    try {
      const location = await mapsService.getCurrentLocation();
      setUserLocation(location);
    } catch {
      setError("Failed to get your location");
    }
  };

  const handleGetRecommendations = async (data: PreferencesFormData) => {
    if (!carInfo || !userLocation) {
      setError("Please ensure your car information and location are available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await smartAdvisorService.getRecommendations(
        carInfo,
        userLocation,
        {
          prioritizeCost: data.prioritizeCost,
          prioritizeTime: data.prioritizeTime,
          maxDistance: data.maxDistance,
        }
      );

      if (response.success) {
        setRecommendations(response.data);
        if (response.data.length > 0) {
          setSelectedRecommendation(response.data[0]);
        }
      } else {
        setError(response.message || "Failed to get recommendations");
      }
    } catch {
      setError("Failed to get charging recommendations");
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
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Switch
        id={id}
        checked={form.watch(field) as boolean}
        onCheckedChange={(checked) => form.setValue(field, checked as boolean)}
      />
    </div>
  );

  const renderStationInfo = (rec: ChargingRecommendation) => (
    <div
      key={rec.stationId}
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        selectedRecommendation?.stationId === rec.stationId
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => setSelectedRecommendation(rec)}
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
              <span>{rec.station.distance?.toFixed(1)} mi</span>
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
                  <p className="text-sm text-yellow-800">
                    Please set up your car information in the Car Recognition
                    section first.
                  </p>
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
          <div className="lg:col-span-2 space-y-6">
            {recommendations.length > 0 ? (
              <>
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
                          `$${selectedRecommendation.estimatedCost.toFixed(2)}`,
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
                        <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
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
