import { DollarSign, Clock, MapPin, Battery, CheckCircle } from "lucide-react";
import type { RecommendationFactor } from "@/types/ev";
import type { ChargingRecommendation } from "@/types/ev";

/**
 * UI-related constants
 */

/**
 * Icons for recommendation factors
 */
export const FACTOR_ICONS = {
  cost: DollarSign,
  time: Clock,
  distance: MapPin,
  availability: Battery,
  amenities: CheckCircle,
} as const;

/**
 * Color classes for recommendation factor impacts
 */
export const FACTOR_COLORS = {
  positive: "text-green-600",
  negative: "text-red-600",
  neutral: "text-gray-600",
} as const;

/**
 * Color classes for recommendation priorities
 */
export const PRIORITY_COLORS = {
  high: "bg-green-50 text-green-800 border-green-200",
  medium: "bg-yellow-50 text-yellow-800 border-yellow-200",
  low: "bg-gray-50 text-gray-800 border-gray-200",
} as const;

/**
 * Helper function to get priority color class
 */
export function getPriorityColor(
  priority: ChargingRecommendation["priority"]
): string {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
}

/**
 * Helper function to get factor color class
 */
export function getFactorColor(impact: RecommendationFactor["impact"]): string {
  return FACTOR_COLORS[impact] || FACTOR_COLORS.neutral;
}

/**
 * Helper function to get factor icon component
 */
export function getFactorIcon(
  type: RecommendationFactor["type"]
): (typeof FACTOR_ICONS)[keyof typeof FACTOR_ICONS] {
  return FACTOR_ICONS[type] || CheckCircle;
}
