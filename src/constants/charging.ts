import type { ConnectorType } from "@/types/ev";

/**
 * Available connector types for EV charging
 */
export const CONNECTOR_TYPES: Array<{
  value: ConnectorType | "all";
  label: string;
}> = [
  { value: "all", label: "All Types" },
  { value: "CCS", label: "CCS" },
  { value: "CHAdeMO", label: "CHAdeMO" },
  { value: "Tesla Supercharger", label: "Tesla Supercharger" },
  { value: "Type 2", label: "Type 2" },
  { value: "Type 1", label: "Type 1" },
  { value: "GB/T", label: "GB/T" },
];

/**
 * Power level options for filtering charging stations
 */
export const POWER_LEVELS: Array<{ value: string; label: string }> = [
  { value: "0", label: "Any" },
  { value: "50", label: "50+ kW" },
  { value: "100", label: "100+ kW" },
  { value: "150", label: "150+ kW" },
  { value: "250", label: "250+ kW" },
];

/**
 * Distance options for filtering charging stations
 */
export const DISTANCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "5", label: "5 miles" },
  { value: "10", label: "10 miles" },
  { value: "25", label: "25 miles" },
  { value: "50", label: "50 miles" },
  { value: "100", label: "100 miles" },
];

/**
 * Connector types array (for forms and selections)
 */
export const CONNECTOR_TYPES_ARRAY: ConnectorType[] = [
  "CCS",
  "CHAdeMO",
  "Tesla Supercharger",
  "Type 2",
  "Type 1",
  "GB/T",
];
