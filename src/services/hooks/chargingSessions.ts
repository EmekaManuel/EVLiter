import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chargingSessionsApi from "@/services/api/modules/chargingSessions";
import { notify, getErrorMessage } from "@/lib/utils";

// ============================================
// Charging Sessions Queries
// ============================================

export function useChargingSessions(
  params?: chargingSessionsApi.GetSessionsParams
) {
  return useQuery({
    queryKey: ["charging-sessions", params ?? {}],
    queryFn: () => chargingSessionsApi.getSessions(params),
    staleTime: 30_000, // 30 seconds
  });
}

export function useActiveChargingSession() {
  return useQuery({
    queryKey: ["charging-sessions", "active"],
    queryFn: chargingSessionsApi.getActiveSession,
    staleTime: 10_000, // 10 seconds - poll frequently for active session
    refetchInterval: 30_000, // Poll every 30 seconds
  });
}

export function useChargingStats() {
  return useQuery({
    queryKey: ["charging-stats"],
    queryFn: chargingSessionsApi.getUserStats,
    staleTime: 60_000, // 1 minute
  });
}

export function useChargingDashboard() {
  return useQuery({
    queryKey: ["charging-dashboard"],
    queryFn: chargingSessionsApi.getDashboard,
    staleTime: 30_000, // 30 seconds
  });
}

// ============================================
// Charging Sessions Mutations
// ============================================

export function useStartChargingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chargingSessionsApi.startChargingSession,
    onMutate: async () => {
      const loadingId = notify.loading("Starting charging session...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["charging-sessions"] });
      queryClient.invalidateQueries({
        queryKey: ["charging-sessions", "active"],
      });
      queryClient.invalidateQueries({ queryKey: ["charging-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["charging-stats"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success(
        "Charging session started",
        "Your vehicle is now charging"
      );
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to start charging session", getErrorMessage(error));
    },
  });
}

export function useEndChargingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chargingSessionsApi.endChargingSession,
    onMutate: async () => {
      const loadingId = notify.loading("Stopping charging session...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["charging-sessions"] });
      queryClient.invalidateQueries({
        queryKey: ["charging-sessions", "active"],
      });
      queryClient.invalidateQueries({ queryKey: ["charging-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["charging-stats"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Charging session ended", "Session stopped successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to stop charging session", getErrorMessage(error));
    },
  });
}

export function useUpdateActiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chargingSessionsApi.updateActiveSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["charging-sessions", "active"],
      });
      queryClient.invalidateQueries({ queryKey: ["charging-dashboard"] });
      // Silent update - no notification needed for real-time updates
    },
    onError: (error) => {
      notify.error("Failed to update session", getErrorMessage(error));
    },
  });
}
