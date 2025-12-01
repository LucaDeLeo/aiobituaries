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
