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
  TrendingUp,
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
    // Load saved car info from localStorage or context
    const savedCarInfo = localStorage.getItem("carInfo");
    if (savedCarInfo) {
      setCarInfo(JSON.parse(savedCarInfo));
    }
  }, []);

  const initializeLocation = async () => {
    try {
      const location = await mapsService.getCurrentLocation();
      setUserLocation(location);
    } catch (err) {
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
    } catch (err) {
      setError("Failed to get charging recommendations");
    } finally {
      setLoading(false);
    }
  };

  const getFactorIcon = (type: RecommendationFactor["type"]) => {
    switch (type) {
      case "cost":
        return <DollarSign className="h-4 w-4" />;
      case "time":
        return <Clock className="h-4 w-4" />;
      case "distance":
        return <MapPin className="h-4 w-4" />;
      case "availability":
        return <Battery className="h-4 w-4" />;
      case "amenities":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getFactorColor = (impact: RecommendationFactor["impact"]) => {
    switch (impact) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: ChargingRecommendation["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold">Smart Charging Advisor</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preferences Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Charging Preferences</CardTitle>
              <CardDescription>
                Configure your preferences for optimal charging recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(handleGetRecommendations)}
                className="space-y-6"
              >
                {/* Car Info Display */}
                {carInfo ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900">
                      {carInfo.year} {carInfo.make} {carInfo.model}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {carInfo.batteryCapacity} kWh • {carInfo.maxChargingPower}{" "}
                      kW max
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Please set up your car information in the AI Car
                      Recognition section first.
                    </p>
                  </div>
                )}

                {/* Battery Level */}
                <div className="space-y-2">
                  <Label htmlFor="currentBatteryLevel">
                    Current Battery Level (%)
                  </Label>
                  <Input
                    id="currentBatteryLevel"
                    type="number"
                    min="0"
                    max="100"
                    {...form.register("currentBatteryLevel", {
                      valueAsNumber: true,
                    })}
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${form.watch("currentBatteryLevel")}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetBatteryLevel">
                    Target Battery Level (%)
                  </Label>
                  <Input
                    id="targetBatteryLevel"
                    type="number"
                    min="10"
                    max="100"
                    {...form.register("targetBatteryLevel", {
                      valueAsNumber: true,
                    })}
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${form.watch("targetBatteryLevel")}%` }}
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prioritizeCost">
                      Prioritize Cost Savings
                    </Label>
                    <Switch
                      id="prioritizeCost"
                      checked={form.watch("prioritizeCost")}
                      onCheckedChange={(checked) =>
                        form.setValue("prioritizeCost", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="prioritizeTime">Prioritize Speed</Label>
                    <Switch
                      id="prioritizeTime"
                      checked={form.watch("prioritizeTime")}
                      onCheckedChange={(checked) =>
                        form.setValue("prioritizeTime", checked)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxDistance">Max Distance (miles)</Label>
                    <Select
                      value={form.watch("maxDistance").toString()}
                      onValueChange={(value) =>
                        form.setValue("maxDistance", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !carInfo || !userLocation}
                >
                  {loading ? "Analyzing..." : "Get Recommendations"}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          {recommendations.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Recommended Stations</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations based on your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div
                        key={rec.stationId}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedRecommendation?.stationId === rec.stationId
                            ? "border-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedRecommendation(rec)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium">
                                {rec.station.name}
                              </h3>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {rec.station.address}
                            </p>
                            <p className="text-sm text-gray-700 mb-3">
                              {rec.reason}
                            </p>

                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span>${rec.estimatedCost.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span>{rec.estimatedTime} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4 text-purple-600" />
                                <span>
                                  {rec.station.distance?.toFixed(1)} mi
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-2">
                              <Zap className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium">
                                {rec.station.connectors[0]?.power} kW
                              </span>
                            </div>
                            <Badge variant="outline">
                              {rec.station.availability.availableConnectors}{" "}
                              available
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Recommendation Details */}
              {selectedRecommendation && (
                <Card>
                  <CardHeader>
                    <CardTitle>Why This Station?</CardTitle>
                    <CardDescription>
                      Detailed analysis of the recommendation factors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Cost Analysis</h4>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Estimated Cost</span>
                              <span className="font-bold text-green-700">
                                $
                                {selectedRecommendation.estimatedCost.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Time Analysis</h4>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Estimated Time</span>
                              <span className="font-bold text-blue-700">
                                {selectedRecommendation.estimatedTime} min
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">
                          Recommendation Factors
                        </h4>
                        <div className="space-y-2">
                          {selectedRecommendation.factors.map(
                            (factor, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-2 border rounded-lg"
                              >
                                <div className={getFactorColor(factor.impact)}>
                                  {getFactorIcon(factor.type)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium capitalize">
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

                      <div className="flex space-x-3">
                        <Button className="flex-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Zap className="h-4 w-4 mr-2" />
                          Start Charging
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-gray-600">
                  Configure your preferences and click "Get Recommendations" to
                  see AI-powered suggestions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
