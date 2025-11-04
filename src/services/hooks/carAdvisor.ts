import { useQuery, useMutation } from "@tanstack/react-query";
import * as carAdvisorApi from "@/services/api/modules/carAdvisor";
import { notify, getErrorMessage } from "@/lib/utils";

// ============================================
// Car Advisor Queries
// ============================================

export function useChargingTime(
  payload: carAdvisorApi.ChargingTimeRequest,
  enabled = true
) {
  return useQuery({
    queryKey: ["car-advisor", "charging-time", payload],
    queryFn: () => carAdvisorApi.calculateChargingTime(payload),
    enabled,
    staleTime: 60_000, // 1 minute
  });
}

export function useCostEstimate(
  payload: carAdvisorApi.CostEstimateRequest,
  enabled = true
) {
  return useQuery({
    queryKey: ["car-advisor", "cost-estimate", payload],
    queryFn: () => carAdvisorApi.calculateCostEstimate(payload),
    enabled,
    staleTime: 60_000, // 1 minute
  });
}

export function useChargingRecommendations(
  payload: carAdvisorApi.RecommendationRequest,
  userLocation: { latitude: number; longitude: number } | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["car-advisor", "recommendations", payload, userLocation],
    queryFn: () => carAdvisorApi.getRecommendations(payload, userLocation),
    enabled: enabled && !!userLocation,
    staleTime: 60_000, // 1 minute
  });
}

export function usePricingInfo(params?: {
  location?: string;
  charger_type?: "home" | "public_ac" | "public_dc";
}) {
  return useQuery({
    queryKey: ["car-advisor", "pricing", params ?? {}],
    queryFn: () => carAdvisorApi.getPricingInfo(params),
    staleTime: 300_000, // 5 minutes - pricing doesn't change often
  });
}

// ============================================
// Car Advisor Mutations (for POST operations)
// ============================================

export function useCalculateChargingTime() {
  return useMutation({
    mutationFn: carAdvisorApi.calculateChargingTime,
    onMutate: async () => {
      const loadingId = notify.loading("Calculating charging time...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Charging time calculated", "Time estimate ready");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to calculate charging time", getErrorMessage(error));
    },
  });
}

export function useCalculateCostEstimate() {
  return useMutation({
    mutationFn: carAdvisorApi.calculateCostEstimate,
    onMutate: async () => {
      const loadingId = notify.loading("Calculating cost estimate...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Cost estimate calculated", "Price estimate ready");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to calculate cost estimate", getErrorMessage(error));
    },
  });
}

export function useGetRecommendations() {
  return useMutation({
    mutationFn: ({
      payload,
      userLocation,
    }: {
      payload: carAdvisorApi.RecommendationRequest;
      userLocation: { latitude: number; longitude: number } | null;
    }) => carAdvisorApi.getRecommendations(payload, userLocation),
    onMutate: async () => {
      const loadingId = notify.loading("Finding charging recommendations...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success(
        "Recommendations ready",
        "Charging stations found for your location"
      );
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to get recommendations", getErrorMessage(error));
    },
  });
}
