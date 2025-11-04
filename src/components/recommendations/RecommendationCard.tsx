import { DollarSign, Clock, MapPin, Star } from "lucide-react";
import type { ChargingRecommendation } from "@/types/ev";
import { calculateDistance } from "@/utils/getLocation";
import type { LocationData } from "@/types/ev";
import { getPriorityColor } from "@/constants/ui";

interface RecommendationCardProps {
  recommendation: ChargingRecommendation;
  isSelected?: boolean;
  onClick?: () => void;
  userLocation?: LocationData | null;
}

export function RecommendationCard({
  recommendation,
  isSelected = false,
  onClick,
  userLocation,
}: RecommendationCardProps) {
  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        recommendation.station.latitude,
        recommendation.station.longitude
      )
    : recommendation.station.distance;

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">
              {recommendation.station.name}
            </h4>
            <span
              className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(
                recommendation.priority
              )}`}
            >
              {recommendation.priority} priority
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {recommendation.station.address}
          </p>
          <p className="text-sm text-gray-700 mb-3">{recommendation.reason}</p>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>${recommendation.estimatedCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{recommendation.estimatedTime} min</span>
            </div>
            {distance !== undefined && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{distance.toFixed(1)} mi</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="flex items-center space-x-1 mb-1">
            <Star className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">
              {recommendation.station.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            ${recommendation.station.pricing.basePrice.toFixed(2)}/kWh
          </p>
        </div>
      </div>
    </div>
  );
}
