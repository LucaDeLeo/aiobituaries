/**
 * Date formatting utilities.
 *
 * Shared date formatting functions for consistent display across the application.
 */

/**
 * Format ISO 8601 date string to human-readable format.
 *
 * @param dateString - ISO date string (e.g., "2023-03-14")
 * @returns Formatted date (e.g., "Mar 14, 2023")
 *
 * @example
 * ```ts
 * formatDate("2023-03-14") // "Mar 14, 2023"
 * formatDate("2024-01-01") // "Jan 1, 2024"
 * ```
 */
export function formatDate(dateString: string): string {
  // Parse date as UTC to avoid timezone issues
  const date = new Date(dateString + 'T00:00:00Z')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
