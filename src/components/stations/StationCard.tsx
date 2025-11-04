import { Star, MapPin } from "lucide-react";
import type { ChargingStation } from "@/types/ev";
import { calculateDistance } from "@/utils/getLocation";
import type { LocationData } from "@/types/ev";

interface StationCardProps {
  station: ChargingStation;
  isSelected?: boolean;
  onClick?: () => void;
  userLocation?: LocationData | null;
  showDistance?: boolean;
}

export function StationCard({
  station,
  isSelected = false,
  onClick,
  userLocation,
  showDistance = true,
}: StationCardProps) {
  const getAvailabilityColor = () => {
    const ratio =
      station.availability.availableConnectors /
      station.availability.totalConnectors;
    if (ratio === 0) return "text-red-600";
    if (ratio < 0.5) return "text-yellow-600";
    return "text-green-600";
  };

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        station.latitude,
        station.longitude
      )
    : station.distance;

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{station.name}</h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {station.address}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <span className={`font-medium ${getAvailabilityColor()}`}>
              {station.availability.availableConnectors}/
              {station.availability.totalConnectors} available
            </span>
            {showDistance && distance !== undefined && (
              <span className="text-gray-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {distance.toFixed(1)} mi
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="flex items-center space-x-1 mb-1">
            <Star className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">
              {station.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            ${station.pricing.basePrice.toFixed(2)}/kWh
          </p>
        </div>
      </div>
    </div>
  );
}
