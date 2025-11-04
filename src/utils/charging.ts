import type { ChargingSession } from "@/types/ev";

/**
 * Charging session and station utilities
 */

/**
 * Cleans up station name by removing redundant "Charging Station" prefix
 * @param name - Station name
 * @returns Cleaned station name
 */
export function cleanStationName(name: string): string {
  return name.replace(/^Charging Station\s+/i, "").trim() || name;
}

/**
 * Gets the color class for a charging session status
 * @param status - Charging session status
 * @returns Tailwind CSS color class
 */
export function getStatusColor(status: ChargingSession["status"]): string {
  switch (status) {
    case "active":
      return "text-green-600";
    case "completed":
      return "text-gray-600";
    case "cancelled":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

/**
 * Formats operating hours into a human-readable string
 * @param hours - Operating hours object with day schedules
 * @returns Formatted string like "24/7" or "Mon-Fri: 08:00 - 22:00"
 */
export function formatOperatingHours(hours: {
  monday: { open: string; close: string; is24Hours?: boolean };
  tuesday: { open: string; close: string; is24Hours?: boolean };
  wednesday: { open: string; close: string; is24Hours?: boolean };
  thursday: { open: string; close: string; is24Hours?: boolean };
  friday: { open: string; close: string; is24Hours?: boolean };
  saturday: { open: string; close: string; is24Hours?: boolean };
  sunday: { open: string; close: string; is24Hours?: boolean };
}): string {
  const allSame = Object.values(hours).every(
    (day) => day.is24Hours || (day.open === "00:00" && day.close === "23:59")
  );

  if (allSame && hours.monday.is24Hours) {
    return "24/7";
  }

  const weekdays = hours.monday;
  const weekends = hours.saturday;

  if (weekdays.open === weekends.open && weekdays.close === weekends.close) {
    return `Daily: ${weekdays.open} - ${weekdays.close}`;
  }

  return `Mon-Fri: ${weekdays.open} - ${weekdays.close}, Sat-Sun: ${weekends.open} - ${weekends.close}`;
}

/**
 * Gets the station icon path based on availability
 * @param availableConnectors - Number of available connectors
 * @param totalConnectors - Total number of connectors
 * @returns Icon path
 */
export function getStationIcon(
  availableConnectors: number,
  totalConnectors: number
): string {
  if (availableConnectors === 0) return "/icons/station-red.png";
  if (availableConnectors < totalConnectors / 2)
    return "/icons/station-yellow.png";
  return "/icons/station-green.png";
}
