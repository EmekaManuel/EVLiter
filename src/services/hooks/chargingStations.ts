import { useQuery } from "@tanstack/react-query";
import * as chargingStationsApi from "@/services/api/modules/chargingStations";

// ============================================
// Charging Stations Queries
// ============================================

export function useSearchChargingStations(
  params: chargingStationsApi.SearchChargingStationsRequest,
  enabled = true
) {
  return useQuery({
    queryKey: ["charging-stations", "search", params],
    queryFn: () => chargingStationsApi.searchChargingStations(params),
    enabled,
    staleTime: 60_000, // 1 minute
  });
}

export function useSearchChargingStationsPost(
  body: chargingStationsApi.SearchChargingStationsRequest
) {
  return useQuery({
    queryKey: ["charging-stations", "search-post", body],
    queryFn: () => chargingStationsApi.searchChargingStationsPost(body),
    enabled: false, // Disable auto-fetch, use manually with refetch
    staleTime: 60_000,
  });
}

export function useCompanyChargingStations() {
  return useQuery({
    queryKey: ["charging-stations", "company"],
    queryFn: chargingStationsApi.getCompanyStations,
    staleTime: 60_000, // 1 minute
  });
}
