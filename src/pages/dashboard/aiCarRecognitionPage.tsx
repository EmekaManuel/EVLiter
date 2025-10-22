import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { carRecognitionService } from "@/services/api/ev";
import type { CarInfo, ConnectorType } from "@/types/ev";
import { zodResolver } from "@hookform/resolvers/zod";
import { Battery, Car, MapPin, Zap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const vinSchema = z.object({
  vin: z
    .string()
    .min(17, "VIN must be 17 characters")
    .max(17, "VIN must be 17 characters"),
});

const modelSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .min(1990)
    .max(new Date().getFullYear() + 1),
});

type VinFormData = z.infer<typeof vinSchema>;
type ModelFormData = z.infer<typeof modelSchema>;

const connectorTypes: ConnectorType[] = [
  "CCS",
  "CHAdeMO",
  "Tesla Supercharger",
  "Type 2",
  "Type 1",
  "GB/T",
];

export default function AiCarRecognitionPage() {
  const [carInfo, setCarInfo] = useState<CarInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vinForm = useForm<VinFormData>({
    resolver: zodResolver(vinSchema),
  });

  const modelForm = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
  });

  const handleVinSubmit = async (data: VinFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await carRecognitionService.recognizeByVin(data.vin);
      if (response.success) {
        setCarInfo(response.data);
      } else {
        setError(response.message || "Failed to recognize car");
      }
    } catch {
      setError("Failed to recognize car by VIN");
    } finally {
      setLoading(false);
    }
  };

  const handleModelSubmit = async (data: ModelFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await carRecognitionService.recognizeByModel(
        data.make,
        data.model,
        data.year
      );
      if (response.success) {
        setCarInfo(response.data);
      } else {
        setError(response.message || "Failed to recognize car");
      }
    } catch {
      setError("Failed to recognize car by model");
    } finally {
      setLoading(false);
    }
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
                    />
                    {vinForm.formState.errors.vin && (
                      <p className="text-sm text-red-500 mt-1">
                        {vinForm.formState.errors.vin.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {loading ? "Recognizing..." : "Recognize Vehicle"}
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
                    {loading ? "Recognizing..." : "Recognize Vehicle"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          <div>
            {carInfo ? (
              <div className="space-y-6">
                {/* Car Image */}
                {carInfo.imageUrl && (
                  <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={carInfo.imageUrl}
                      alt={`${carInfo.make} ${carInfo.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div>
                  <h3 className="text-xl font-light text-gray-900 mb-1">
                    {carInfo.year} {carInfo.make} {carInfo.model}
                  </h3>
                  {carInfo.vin && (
                    <p className="text-sm text-gray-500">VIN: {carInfo.vin}</p>
                  )}
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Battery className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Battery Capacity
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {carInfo.batteryCapacity} kWh
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Max Charging Power
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {carInfo.maxChargingPower} kW
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Estimated Range
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {carInfo.estimatedRange} mi
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Connector Type
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {carInfo.chargingConnector}
                    </span>
                  </div>
                </div>

                {/* Compatible Connectors */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Compatible Connectors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {connectorTypes.map((connector) => (
                      <span
                        key={connector}
                        className={`px-3 py-1 text-xs rounded-full border ${
                          connector === carInfo.chargingConnector
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        {connector}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-light">
                  Enter your vehicle information to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
