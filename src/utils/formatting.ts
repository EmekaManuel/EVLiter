/**
 * Date and time formatting utilities
 */

/**
 * Formats a duration in minutes to a human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string like "2h 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  const roundedMinutes = Math.round(minutes);
  const hours = Math.floor(roundedMinutes / 60);
  const mins = roundedMinutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/**
 * Formats a date string to a short date format
 * @param date - Date string or Date object
 * @returns Formatted string like "Jan 15, 2024"
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date string to a time format
 * @param date - Date string or Date object
 * @returns Formatted string like "02:30 PM"
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a date string to a combined date and time format
 * @param date - Date string or Date object
 * @returns Formatted string like "Jan 15, 2:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
