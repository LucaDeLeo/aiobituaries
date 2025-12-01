/**
 * Timeline position state for sessionStorage persistence.
 * Stores scroll position, zoom level, and timestamp for expiry logic.
 */
export interface TimelinePosition {
  /** Horizontal scroll position (translateX) in pixels */
  scrollX: number
  /** Zoom level (0.5 to 5.0) */
  zoom: number
  /** Timestamp when saved (Date.now()) for expiry logic */
  timestamp: number
}

/** sessionStorage key for timeline position */
export const TIMELINE_POSITION_STORAGE_KEY = 'timeline-position'

/** Position expiry duration: 1 hour in milliseconds */
export const TIMELINE_POSITION_EXPIRY_MS = 60 * 60 * 1000

/**
 * Adjacent obituary reference for prev/next navigation.
 * Used in obituary detail pages to enable sequential browsing.
 */
export interface AdjacentObituary {
  /** Obituary slug for navigation */
  slug: string
  /** Claim text (truncated for display) */
  claimPreview: string
  /** Source name displayed as label */
  source: string
  /** Publication date */
  date: string
}

/**
 * Navigation context for obituary detail pages.
 * Contains references to chronologically adjacent obituaries.
 */
export interface ObituaryNavigation {
  /** Previous obituary (older by date) */
  previous: AdjacentObituary | null
  /** Next obituary (newer by date) */
  next: AdjacentObituary | null
}
