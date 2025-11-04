import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChargingStation, ChargingSession } from "@/types/ev";
import {
  MapPin,
  Zap,
  Star,
  DollarSign,
  Battery,
  CheckCircle,
} from "lucide-react";
import { formatOperatingHours } from "@/utils/charging";

interface StationInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: ChargingStation | ChargingSession["station"] | null;
}

export function StationInfoModal({
  open,
  onOpenChange,
  station,
}: StationInfoModalProps) {
  // Handle both full ChargingStation and partial session station
  const isFullStation = station ? "connectors" in station : false;
  const fullStation =
    station && isFullStation ? (station as ChargingStation) : null;
  const partialStation =
    station && !isFullStation ? (station as ChargingSession["station"]) : null;

  const availableConnectors = fullStation
    ? fullStation.connectors.filter((c) => c.status === "available").length
    : 0;
  const totalConnectors = fullStation ? fullStation.connectors.length : 0;
  const maxPower = fullStation
    ? Math.max(...fullStation.connectors.map((c) => c.power))
    : partialStation?.powerOutput || 0;
  const basePrice = fullStation
    ? fullStation.pricing.basePrice
    : partialStation?.pricePerKWh || 0;
  const rating = fullStation ? fullStation.rating : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!station ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Station information not available</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                {station.name}
              </DialogTitle>
              <DialogDescription className="flex items-start gap-2 mt-2">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{station.address}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Battery className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Availability</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {availableConnectors}/{totalConnectors}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Price</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    ${basePrice.toFixed(2)}
                    <span className="text-xs font-normal text-gray-500">
                      /kWh
                    </span>
                  </p>
                </div>
                {rating !== undefined && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-gray-400" />
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {rating.toFixed(1)}
                    </p>
                  </div>
                )}
                {maxPower > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-gray-400" />
                      <p className="text-xs text-gray-500">Max Power</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {maxPower} kW
                    </p>
                  </div>
                )}
              </div>

              {/* Connectors */}
              {fullStation &&
                fullStation.connectors &&
                fullStation.connectors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Available Connectors
                    </h3>
                    <div className="space-y-2">
                      {fullStation.connectors.map((connector) => (
                        <div
                          key={connector.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            connector.status === "available"
                              ? "border-green-200 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                connector.status === "available"
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {connector.type}
                              </p>
                              <p className="text-xs text-gray-500">
                                {connector.power} kW
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-xs font-medium ${
                                connector.status === "available"
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {connector.status === "available"
                                ? "Available"
                                : connector.status === "occupied"
                                ? "Occupied"
                                : "Out of Service"}
                            </p>
                            <p className="text-xs text-gray-500">
                              $
                              {connector.pricePerKwh?.toFixed(2) ||
                                basePrice.toFixed(2)}
                              /kWh
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Connector Types (for partial station data) */}
              {partialStation &&
                partialStation.connectorTypes &&
                partialStation.connectorTypes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Connector Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {partialStation.connectorTypes.map(
                        (type: string, index: number) => (
                          <div
                            key={index}
                            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full"
                          >
                            <span className="text-xs text-gray-700">
                              {type}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Operating Hours */}
              {station.operatingHours && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Operating Hours
                  </h3>
                  <p className="text-sm text-gray-600">
                    {typeof station.operatingHours === "string"
                      ? station.operatingHours
                      : formatOperatingHours(station.operatingHours)}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {station.amenities && station.amenities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {station.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Details */}
              {fullStation && fullStation.pricing && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Pricing
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Base Price</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${fullStation.pricing.basePrice.toFixed(2)}/kWh
                      </span>
                    </div>
                    {fullStation.pricing.peakPrice && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">
                          Peak Price
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ${fullStation.pricing.peakPrice.toFixed(2)}/kWh
                        </span>
                      </div>
                    )}
                    {fullStation.pricing.sessionFee && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">
                          Session Fee
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ${fullStation.pricing.sessionFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Distance */}
              {station.distance !== undefined && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{station.distance.toFixed(1)} miles away</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-200"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
