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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { carRecognitionService } from "@/services/api/ev";
import type { CarInfo, ConnectorType } from "@/types/ev";
import { zodResolver } from "@hookform/resolvers/zod";
import { Battery, Car, Clock, MapPin, Zap } from "lucide-react";
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
    } catch (err) {
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
    } catch (err) {
      setError("Failed to recognize car by model");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Car className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">AI Car Recognition</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recognition Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Identify Your EV</CardTitle>
            <CardDescription>
              Use AI to automatically identify your electric vehicle and get
              charging specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="vin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vin">By VIN</TabsTrigger>
                <TabsTrigger value="model">By Model</TabsTrigger>
              </TabsList>

              <TabsContent value="vin" className="space-y-4">
                <form
                  onSubmit={vinForm.handleSubmit(handleVinSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="vin">
                      Vehicle Identification Number (VIN)
                    </Label>
                    <Input
                      id="vin"
                      placeholder="Enter 17-character VIN"
                      {...vinForm.register("vin")}
                    />
                    {vinForm.formState.errors.vin && (
                      <p className="text-sm text-red-600 mt-1">
                        {vinForm.formState.errors.vin.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Recognizing..." : "Recognize by VIN"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="model" className="space-y-4">
                <form
                  onSubmit={modelForm.handleSubmit(handleModelSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      placeholder="e.g., Tesla, BMW, Nissan"
                      {...modelForm.register("make")}
                    />
                    {modelForm.formState.errors.make && (
                      <p className="text-sm text-red-600 mt-1">
                        {modelForm.formState.errors.make.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Model 3, i3, Leaf"
                      {...modelForm.register("model")}
                    />
                    {modelForm.formState.errors.model && (
                      <p className="text-sm text-red-600 mt-1">
                        {modelForm.formState.errors.model.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2023"
                      {...modelForm.register("year", { valueAsNumber: true })}
                    />
                    {modelForm.formState.errors.year && (
                      <p className="text-sm text-red-600 mt-1">
                        {modelForm.formState.errors.year.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Recognizing..." : "Recognize by Model"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Car Information Display */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>
              AI-identified specifications for your electric vehicle
            </CardDescription>
          </CardHeader>
          <CardContent>
            {carInfo ? (
              <div className="space-y-6">
                {/* Car Image */}
                {carInfo.imageUrl && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={carInfo.imageUrl}
                      alt={`${carInfo.make} ${carInfo.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {carInfo.year} {carInfo.make} {carInfo.model}
                  </h3>
                  {carInfo.vin && (
                    <p className="text-sm text-gray-600">VIN: {carInfo.vin}</p>
                  )}
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Battery className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Battery Capacity</p>
                      <p className="text-lg font-bold">
                        {carInfo.batteryCapacity} kWh
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Max Charging Power</p>
                      <p className="text-lg font-bold">
                        {carInfo.maxChargingPower} kW
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Estimated Range</p>
                      <p className="text-lg font-bold">
                        {carInfo.estimatedRange} mi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Connector Type</p>
                      <Badge variant="secondary">
                        {carInfo.chargingConnector}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Compatible Connectors */}
                <div>
                  <h4 className="font-medium mb-2">Compatible Connectors</h4>
                  <div className="flex flex-wrap gap-2">
                    {connectorTypes.map((connector) => (
                      <Badge
                        key={connector}
                        variant={
                          connector === carInfo.chargingConnector
                            ? "default"
                            : "outline"
                        }
                      >
                        {connector}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your vehicle information to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
