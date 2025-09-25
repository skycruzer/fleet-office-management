import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a localized date string
 */
export function formatDate(
  date: Date | string | null,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return "No date";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  };

  return dateObj.toLocaleDateString("en-US", defaultOptions);
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format pilot name consistently
 */
export function formatPilotName(firstName: string | null, lastName: string | null, middleName?: string | null): string {
  if (!firstName || !lastName) return "Unknown Pilot";

  if (middleName) {
    return `${lastName}, ${firstName} ${middleName}`;
  }

  return `${lastName}, ${firstName}`;
}

/**
 * Get initials from a full name
 */
export function getInitials(name: string | null): string {
  if (!name) return "??";

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Format aviation compliance percentage for display
 */
export function formatCompliancePercentage(percentage: number | null): string {
  if (percentage === null) return "N/A";
  return `${percentage.toFixed(1)}%`;
}

/**
 * Determine if a pilot is captain based on role
 */
export function isCaptain(role: string | null): boolean {
  return role === "Captain";
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
