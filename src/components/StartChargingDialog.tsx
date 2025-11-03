import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import * as chargingStationsApi from "@/services/api/modules/chargingStations";
import type { ChargingStation, ChargingConnector } from "@/types/ev";
import { MapPin, Zap, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const startChargingSchema = z.object({
  stationId: z.string().min(1, "Please select a charging station"),
  connectorId: z.string().min(1, "Please select a connector"),
  batteryLevelStart: z
    .number()
    .min(0, "Battery level must be between 0 and 100")
    .max(100, "Battery level must be between 0 and 100"),
});

type StartChargingFormData = z.infer<typeof startChargingSchema>;

interface StartChargingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartCharging: (data: {
    stationId: string;
    connectorId: string;
    batteryLevelStart: number;
  }) => Promise<void>;
  userLocation?: { latitude: number; longitude: number };
}

export function StartChargingDialog({
  open,
  onOpenChange,
  onStartCharging,
  userLocation,
}: StartChargingDialogProps) {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);
  const [availableConnectors, setAvailableConnectors] = useState<
    ChargingConnector[]
  >([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [comboboxSearchQuery, setComboboxSearchQuery] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<StartChargingFormData>({
    resolver: zodResolver(startChargingSchema),
    defaultValues: {
      stationId: "",
      connectorId: "",
      batteryLevelStart: 20,
    },
  });

  const watchedStationId = watch("stationId");
  const watchedConnectorId = watch("connectorId");

  // Load stations when dialog opens
  useEffect(() => {
    if (open) {
      loadStations();
      reset();
      setSelectedStation(null);
      setAvailableConnectors([]);
      setSubmitError(null);
      setComboboxSearchQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userLocation]);

  // Update available connectors when station changes
  useEffect(() => {
    if (watchedStationId && stations.length > 0) {
      const station = stations.find((s) => s.id === watchedStationId);
      if (station) {
        setSelectedStation(station);
        const available = station.connectors.filter(
          (c) => c.status === "available"
        );
        setAvailableConnectors(available);
        // Reset connector selection if current one is not available
        if (
          watchedConnectorId &&
          !available.find((c) => c.id === watchedConnectorId)
        ) {
          setValue("connectorId", "");
        }
      }
    } else {
      setSelectedStation(null);
      setAvailableConnectors([]);
    }
  }, [watchedStationId, stations, watchedConnectorId, setValue]);

  const loadStations = async (searchQuery?: string) => {
    setLoadingStations(true);
    try {
      if (searchQuery && searchQuery.trim()) {
        const response = await chargingStationsApi.searchChargingStations({
          location: searchQuery,
          coordinates: userLocation
            ? { lat: userLocation.latitude, lng: userLocation.longitude }
            : undefined,
        });
        setStations(response.uiStations);
      } else if (userLocation) {
        const response = await chargingStationsApi.searchChargingStations({
          location: `${userLocation.latitude},${userLocation.longitude}`,
          coordinates: {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          },
        });
        setStations(response.uiStations);
      } else {
        // Fallback: get company stations
        const response = await chargingStationsApi.getCompanyStations();
        setStations(response.uiStations);
      }
    } catch (error) {
      console.error("Error loading stations:", error);
    } finally {
      setLoadingStations(false);
    }
  };

  // Debounce API search when combobox search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStations(comboboxSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comboboxSearchQuery]);

  // Convert stations to combobox options
  const stationOptions = useMemo(() => {
    return stations.map((station) => ({
      value: station.id,
      label: station.name,
      triggerLabel: (
        <div className="flex items-center gap-2 flex-1 text-left">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{station.name}</span>
            <span className="text-xs text-gray-500 truncate">
              {station.address}
              {station.distance && ` • ${station.distance.toFixed(1)} mi away`}
            </span>
          </div>
        </div>
      ),
      render: (
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium">{station.name}</span>
            <span className="text-xs text-gray-500">
              {station.address}
              {station.distance && ` • ${station.distance.toFixed(1)} mi away`}
            </span>
          </div>
        </div>
      ),
    }));
  }, [stations]);

  const onSubmit = async (data: StartChargingFormData) => {
    try {
      setSubmitError(null);
      await onStartCharging({
        stationId: data.stationId,
        connectorId: data.connectorId,
        batteryLevelStart: data.batteryLevelStart,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start charging session";
      setSubmitError(errorMessage);
      console.error("Error starting charging:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto overflow-x-hidden bg-white sm:rounded-lg">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Start Charging Session
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1.5">
            Select a charging station, connector, and enter your current battery
            level to start charging.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
          {/* Station Search and Selection */}
          <div className="space-y-3">
            <Label
              htmlFor="stationId"
              className="text-sm font-medium text-gray-700"
            >
              Charging Station <span className="text-red-500">*</span>
            </Label>
            <Combobox
              options={stationOptions}
              value={watchedStationId}
              onValueChange={(value) => {
                setValue("stationId", value);
                setValue("connectorId", ""); // Reset connector when station changes
              }}
              placeholder="Search and select a charging station"
              searchPlaceholder="Search by location or station name..."
              emptyMessage="No stations found. Try searching with a different location."
              isLoading={loadingStations}
              shouldFilter={false}
              onSearchChange={setComboboxSearchQuery}
              searchValue={comboboxSearchQuery}
            />
            {errors.stationId && (
              <p className="text-sm text-red-600 mt-1.5">
                {errors.stationId.message}
              </p>
            )}

            {/* Station Details */}
            {selectedStation && (
              <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] text-gray-900 mb-1">
                      {selectedStation.name}
                    </p>
                    <p className="text-sm text-gray-600 flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="break-words text-xs">
                        {selectedStation.address}
                      </span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      ${selectedStation.pricing.basePrice.toFixed(2)}
                      <span className="text-xs font-normal text-gray-500">
                        /kWh
                      </span>
                    </p>
                    {selectedStation.rating && (
                      <p className="text-xs text-gray-600 mt-1">
                        ⭐ {selectedStation.rating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-gray-200 text-[12px]">
                  <span className="text-gray-700">
                    <span className="font-medium text-gray-900">
                      {selectedStation.availability.availableConnectors}
                    </span>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-600">
                      {selectedStation.availability.totalConnectors}
                    </span>
                    <span className="text-gray-500 ml-1">Available</span>
                  </span>
                  {selectedStation.distance && (
                    <span className="text-gray-600">
                      {selectedStation.distance.toFixed(1)} mi away
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Connector Selection */}
          <div className="space-y-3">
            <Label
              htmlFor="connectorId"
              className="text-sm font-medium text-gray-700"
            >
              Connector <span className="text-red-500">*</span>
            </Label>
            {!selectedStation ? (
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50/50">
                <p className="text-sm text-gray-500">
                  Please select a station first
                </p>
              </div>
            ) : availableConnectors.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-red-200 rounded-lg text-center bg-red-50/30">
                <p className="text-sm text-red-600 font-medium">
                  No available connectors at this station
                </p>
              </div>
            ) : (
              <Select
                value={watchedConnectorId}
                onValueChange={(value) => setValue("connectorId", value)}
              >
                <SelectTrigger id="connectorId" className="h-11">
                  <SelectValue placeholder="Select a connector" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableConnectors.map((connector) => (
                    <SelectItem key={connector.id} value={connector.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="font-medium">{connector.type}</span>
                        <span className="text-xs text-gray-600">
                          {connector.power} kW • $
                          {connector.pricePerKwh.toFixed(2)}/kWh
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.connectorId && (
              <p className="text-sm text-red-600 mt-1.5">
                {errors.connectorId.message}
              </p>
            )}
          </div>

          {/* Battery Level */}
          <div className="space-y-3">
            <Label
              htmlFor="batteryLevelStart"
              className="text-sm font-medium text-gray-700"
            >
              Current Battery Level <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="batteryLevelStart"
                type="number"
                min="0"
                max="100"
                placeholder="Enter current battery level (0-100)"
                className="h-11 pr-10"
                {...register("batteryLevelStart", {
                  valueAsNumber: true,
                })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                %
              </span>
            </div>
            {errors.batteryLevelStart && (
              <p className="text-sm text-red-600 mt-1.5">
                {errors.batteryLevelStart.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter your current battery percentage (0-100%)
            </p>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedStation ||
                availableConnectors.length === 0
              }
              className="bg-green-700 hover:bg-green-800 text-white min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Start Charging
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
