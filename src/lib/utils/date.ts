/**
 * Date formatting utilities.
 *
 * Shared date formatting functions for consistent display across the application.
 * P1.2 fix: All date functions use UTC to avoid timezone-related off-by-one errors.
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

/**
 * Parse a YYYY-MM-DD date string as UTC midnight.
 * Avoids timezone issues when comparing dates.
 *
 * @param dateString - ISO date string (e.g., "2023-03-14")
 * @returns Date object at UTC midnight
 *
 * @example
 * ```ts
 * parseUTCDate("2023-03-14").toISOString() // "2023-03-14T00:00:00.000Z"
 * ```
 */
export function parseUTCDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00Z')
}

/**
 * Create a UTC date from year, month (0-indexed), and optional day.
 * Use instead of `new Date(year, month, day)` to avoid local timezone issues.
 *
 * @param year - Full year (e.g., 2023)
 * @param month - Month (0-11, January = 0)
 * @param day - Day of month (1-31), defaults to 1
 * @returns Date object at UTC midnight
 *
 * @example
 * ```ts
 * createUTCDate(2023, 0, 1).toISOString() // "2023-01-01T00:00:00.000Z"
 * createUTCDate(2023, 11, 31).toISOString() // "2023-12-31T00:00:00.000Z"
 * ```
 */
export function createUTCDate(year: number, month: number, day: number = 1): Date {
  return new Date(Date.UTC(year, month, day))
}

/**
 * Get the last day of a month in UTC.
 *
 * @param year - Full year
 * @param month - Month (0-11)
 * @returns Date object at UTC midnight on the last day of the month
 *
 * @example
 * ```ts
 * getUTCMonthEnd(2023, 1).toISOString() // "2023-02-28T00:00:00.000Z"
 * getUTCMonthEnd(2024, 1).toISOString() // "2024-02-29T00:00:00.000Z" (leap year)
 * ```
 */
export function getUTCMonthEnd(year: number, month: number): Date {
  // Day 0 of next month = last day of current month
  return new Date(Date.UTC(year, month + 1, 0))
}

/**
 * Get UTC year from a date string or Date object.
 * Avoids local timezone issues that can cause off-by-one errors.
 *
 * @param date - ISO date string or Date object
 * @returns UTC year (e.g., 2024)
 *
 * @example
 * ```ts
 * getUTCYear("2024-01-01") // 2024 (always, regardless of local timezone)
 * getUTCYear(new Date("2024-01-01")) // 2024
 * ```
 */
export function getUTCYear(date: string | Date): number {
  const d = typeof date === 'string' ? parseUTCDate(date) : date
  return d.getUTCFullYear()
}

/**
 * Format a date for screen reader announcements in UTC.
 *
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "January 2024")
 */
export function formatDateForAnnouncement(dateString: string): string {
  const date = parseUTCDate(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
