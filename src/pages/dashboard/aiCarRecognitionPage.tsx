import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CarInfo, ConnectorType } from "@/types/ev";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Battery,
  Car,
  MapPin,
  Zap,
  Loader2,
  Clock,
  History,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  useRecognizeCarByVIN,
  useRecognizeCarByModel,
  useCarRecognitionHistory,
} from "@/services/hooks";
import type {
  CarRecognitionResponse,
  CarRecognitionHistory,
} from "@/services/api/modules/carRecognition";
import { useCarInfoStore } from "@/store/carInfoStore";
import { formatDateTime } from "@/utils/formatting";
import { CONNECTOR_TYPES_ARRAY } from "@/constants/charging";

const vinSchema = z.object({
  vin: z
    .string()
    .min(17, "VIN must be 17 characters")
    .max(17, "VIN must be 17 characters")
    .toUpperCase(),
});

const modelSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .min(1990, "Year must be 1990 or later")
    .max(new Date().getFullYear() + 1, "Invalid year"),
});

type VinFormData = z.infer<typeof vinSchema>;
type ModelFormData = z.infer<typeof modelSchema>;

// Helper function to convert CarRecognitionResponse to CarInfo
function convertToCarInfo(response: CarRecognitionResponse): CarInfo {
  // Get the primary connector type (use first available or default to Type 2)
  const connectorType: ConnectorType =
    (response.connectorTypes?.[0] as ConnectorType) || "Type 2";

  // Calculate battery capacity (convert from string or use default)
  const batteryCapacity =
    response.charging?.capacityKWh ||
    (response.battery
      ? parseFloat(response.battery.replace(/[^\d.]/g, ""))
      : 75); // Default 75 kWh if not available

  // Get max charging power (prefer DC, fallback to AC, then default)
  const maxChargingPower =
    response.charging?.dcMaxKw ||
    response.charging?.acMaxKw ||
    response.charging?.onboardChargerKw ||
    11; // Default 11 kW AC

  // Estimate range based on battery capacity (rough estimate: 4 miles per kWh)
  const estimatedRange = batteryCapacity * 4;

  return {
    id: response.vin || `${response.make}-${response.model}-${response.year}`,
    make: response.make,
    model: response.model,
    year: response.year,
    vin: response.vin,
    batteryCapacity,
    chargingConnector: connectorType,
    maxChargingPower,
    estimatedRange,
    imageUrl: response.imageUrl || undefined,
  };
}

export default function AiCarRecognitionPage() {
  const { setCarInfo: saveCarInfo } = useCarInfoStore();
  const [carInfo, setCarInfo] = useState<CarRecognitionResponse | null>(null);

  // React Query hooks
  const recognitionHistoryQuery = useCarRecognitionHistory({
    limit: 20,
    offset: 0,
  });
  const recognizeByVINMutation = useRecognizeCarByVIN();
  const recognizeByModelMutation = useRecognizeCarByModel();

  const vinForm = useForm<VinFormData>({
    resolver: zodResolver(vinSchema),
  });

  const modelForm = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
  });

  // Derived state from queries
  const recognitionHistory = recognitionHistoryQuery.data?.recognitions || [];
  const loadingHistory = recognitionHistoryQuery.isLoading;
  const historyError = recognitionHistoryQuery.error
    ? String(recognitionHistoryQuery.error)
    : null;

  // Loading states from mutations
  const loading =
    recognizeByVINMutation.isPending || recognizeByModelMutation.isPending;

  const handleVinSubmit = async (data: VinFormData) => {
    try {
      const result = await recognizeByVINMutation.mutateAsync({
        vin: data.vin,
      });
      setCarInfo(result);
      // Save to Zustand store
      const carInfoData = convertToCarInfo(result);
      saveCarInfo(carInfoData);
      // Refresh history
      recognitionHistoryQuery.refetch();
    } catch {
      setCarInfo(null);
      saveCarInfo(null);
    }
  };

  const handleModelSubmit = async (data: ModelFormData) => {
    try {
      const result = await recognizeByModelMutation.mutateAsync({
        make: data.make,
        model: data.model,
        year: data.year,
      });
      setCarInfo(result);
      // Save to Zustand store
      const carInfoData = convertToCarInfo(result);
      saveCarInfo(carInfoData);
      // Refresh history
      recognitionHistoryQuery.refetch();
    } catch {
      setCarInfo(null);
      saveCarInfo(null);
    }
  };

  const handleSelectRecognition = (recognition: CarRecognitionHistory) => {
    setCarInfo(recognition);
    const carInfoData = convertToCarInfo(recognition);
    saveCarInfo(carInfoData);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-3">
            <Car className="h-6 w-6 text-gray-400" />
            <h1 className="text-2xl font-light text-gray-900">
              Car Recognition
            </h1>
          </div>
          <p className="text-gray-500 font-light mt-2">
            Identify your electric vehicle specifications
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Recognition Form */}
          <div>
            <Tabs defaultValue="vin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-50">
                <TabsTrigger
                  value="vin"
                  className="data-[state=active]:bg-white"
                >
                  VIN
                </TabsTrigger>
                <TabsTrigger
                  value="model"
                  className="data-[state=active]:bg-white"
                >
                  Model
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vin" className="mt-6">
                <form
                  onSubmit={vinForm.handleSubmit(handleVinSubmit)}
                  className="space-y-6"
                >
                  <div>
                    <Label
                      htmlFor="vin"
                      className="text-sm font-medium text-gray-700"
                    >
                      Vehicle Identification Number
                    </Label>
                    <Input
                      id="vin"
                      placeholder="Enter 17-character VIN"
                      className="mt-2 border-gray-200 focus:border-gray-400"
                      {...vinForm.register("vin")}
                      disabled={loading}
                    />
                    {vinForm.formState.errors.vin && (
                      <p className="text-sm text-red-500 mt-1">
                        {vinForm.formState.errors.vin.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      VIN is typically found on the driver's side dashboard
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Recognizing...
                      </>
                    ) : (
                      "Recognize Vehicle"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="model" className="mt-6">
                <form
                  onSubmit={modelForm.handleSubmit(handleModelSubmit)}
                  className="space-y-6"
                >
                  <div>
                    <Label
                      htmlFor="make"
                      className="text-sm font-medium text-gray-700"
                    >
                      Make
                    </Label>
                    <Input
                      id="make"
                      placeholder="e.g., Tesla, BMW, Nissan"
                      className="mt-2 border-gray-200 focus:border-gray-400"
                      {...modelForm.register("make")}
                      disabled={loading}
                    />
                    {modelForm.formState.errors.make && (
                      <p className="text-sm text-red-500 mt-1">
                        {modelForm.formState.errors.make.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="model"
                      className="text-sm font-medium text-gray-700"
                    >
                      Model
                    </Label>
                    <Input
                      id="model"
                      placeholder="e.g., Model 3, i3, Leaf"
                      className="mt-2 border-gray-200 focus:border-gray-400"
                      {...modelForm.register("model")}
                      disabled={loading}
                    />
                    {modelForm.formState.errors.model && (
                      <p className="text-sm text-red-500 mt-1">
                        {modelForm.formState.errors.model.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="year"
                      className="text-sm font-medium text-gray-700"
                    >
                      Year
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2023"
                      className="mt-2 border-gray-200 focus:border-gray-400"
                      {...modelForm.register("year", { valueAsNumber: true })}
                      disabled={loading}
                    />
                    {modelForm.formState.errors.year && (
                      <p className="text-sm text-red-500 mt-1">
                        {modelForm.formState.errors.year.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Recognizing...
                      </>
                    ) : (
                      "Recognize Vehicle"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {carInfo && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 font-medium">
                  Vehicle Recognized
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Confidence: {(carInfo.confidence * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          <div>
            {carInfo ? (
              <div className="space-y-6">
                {/* Car Image */}
                {carInfo.imageUrl && (
                  <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={carInfo.imageUrl}
                      alt={`${carInfo.make} ${carInfo.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div>
                  <h3 className="text-xl font-light text-gray-900 mb-1">
                    {carInfo.year} {carInfo.make} {carInfo.model}
                  </h3>
                  {carInfo.trim && (
                    <p className="text-sm text-gray-500">
                      Trim: {carInfo.trim}
                    </p>
                  )}
                  {carInfo.vin && (
                    <p className="text-sm text-gray-500 mt-1">
                      VIN: {carInfo.vin}
                    </p>
                  )}
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  {carInfo.charging?.capacityKWh && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Battery className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Battery Capacity
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {carInfo.charging.capacityKWh} kWh
                      </span>
                    </div>
                  )}

                  {(carInfo.charging?.dcMaxKw || carInfo.charging?.acMaxKw) && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Max Charging Power
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">
                        DC: {carInfo.charging?.dcMaxKw || "N/A"} kW
                        {carInfo.charging?.acMaxKw &&
                          ` / AC: ${carInfo.charging.acMaxKw} kW`}
                      </span>
                    </div>
                  )}

                  {carInfo.charging?.chargePortLocation && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Charge Port Location
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {carInfo.charging.chargePortLocation}
                      </span>
                    </div>
                  )}

                  {carInfo.bodyStyle && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Car className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Body Style
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {carInfo.bodyStyle}
                      </span>
                    </div>
                  )}

                  {carInfo.drivetrain && (
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <Car className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Drivetrain
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {carInfo.drivetrain}
                      </span>
                    </div>
                  )}
                </div>

                {/* Compatible Connectors */}
                {carInfo.connectorTypes &&
                  carInfo.connectorTypes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Compatible Connectors
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {CONNECTOR_TYPES_ARRAY.map((connector) => {
                          const isCompatible =
                            carInfo.connectorTypes?.includes(connector);
                          return (
                            <span
                              key={connector}
                              className={`px-3 py-1 text-xs rounded-full border ${
                                isCompatible
                                  ? "bg-gray-900 text-white border-gray-900"
                                  : "bg-white text-gray-400 border-gray-200"
                              }`}
                            >
                              {connector}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Data Sources */}
                {carInfo.sources && carInfo.sources.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Data sources: {carInfo.sources.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-light">
                  Enter your vehicle information to get started
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  We'll fetch detailed specifications and charging capabilities
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recognition History Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <History className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Recognition History
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => recognitionHistoryQuery.refetch()}
              disabled={loadingHistory}
              className="text-sm"
            >
              {loadingHistory ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>

          {historyError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{historyError}</p>
            </div>
          )}

          {loadingHistory ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Loading history...</p>
            </div>
          ) : recognitionHistory.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-light">
                No recognition history yet
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Your recognized vehicles will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recognitionHistory.map((recognition) => {
                const isSelected =
                  carInfo?.vin === recognition.vin &&
                  carInfo?.make === recognition.make &&
                  carInfo?.model === recognition.model &&
                  carInfo?.year === recognition.year;

                return (
                  <div
                    key={recognition.id}
                    onClick={() => handleSelectRecognition(recognition)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {recognition.year} {recognition.make}{" "}
                            {recognition.model}
                          </h4>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                          )}
                          {recognition.method && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                                recognition.method === "vin"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}
                            >
                              {recognition.method.toUpperCase()}
                            </span>
                          )}
                        </div>
                        {recognition.trim && (
                          <p className="text-sm text-gray-600 mb-1">
                            {recognition.trim}
                          </p>
                        )}
                        {recognition.vin && (
                          <p className="text-xs text-gray-500 mb-2 font-mono">
                            VIN: {recognition.vin}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDateTime(recognition.createdAt)}</span>
                          </div>
                          {recognition.charging?.capacityKWh && (
                            <div className="flex items-center gap-1">
                              <Battery className="h-3.5 w-3.5" />
                              <span>
                                {recognition.charging.capacityKWh} kWh
                              </span>
                            </div>
                          )}
                          {recognition.charging?.dcMaxKw && (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5" />
                              <span>{recognition.charging.dcMaxKw} kW DC</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                              {(recognition.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {recognition.imageUrl && (
                        <div className="ml-4 shrink-0">
                          <img
                            src={recognition.imageUrl}
                            alt={`${recognition.make} ${recognition.model}`}
                            className="w-20 h-20 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
