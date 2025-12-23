import type { ObituarySummary } from './obituary'

/**
 * Profile link for external platforms (Twitter, Substack, etc.)
 */
export interface SkepticProfile {
  /** Platform identifier: 'twitter', 'substack', 'website', 'linkedin', 'wikipedia' */
  platform: string
  /** Full URL to the profile */
  url: string
}

/**
 * Full skeptic data model from Sanity.
 * Represents a notable AI skeptic with their profile information.
 */
export interface Skeptic {
  /** Sanity document ID */
  _id: string
  /** Display name */
  name: string
  /** URL-safe slug */
  slug: string
  /** Short biography */
  bio: string
  /** External profile links (optional - may be null/undefined from CMS) */
  profiles?: SkepticProfile[] | null
}

/**
 * Lightweight skeptic type for index/list views.
 * Includes aggregated claim count.
 */
export interface SkepticSummary {
  /** Sanity document ID */
  _id: string
  /** Display name */
  name: string
  /** URL-safe slug */
  slug: string
  /** Short biography */
  bio: string
  /** Number of claims attributed to this skeptic */
  claimCount: number
  /** External profile links (optional - may be null/undefined from CMS) */
  profiles?: SkepticProfile[] | null
}

/**
 * Skeptic with their full list of claims (obituaries).
 * Used on the skeptic detail page.
 */
export interface SkepticWithClaims extends Skeptic {
  /** All obituaries attributed to this skeptic */
  claims: ObituarySummary[]
}

/**
 * Snapshot of AI metrics at a specific point in time.
 * Used to display what AI capabilities looked like when a claim was made.
 */
export interface MetricsSnapshot {
  /** MMLU benchmark score (%), null if before Aug 2021 */
  mmlu: number | null
  /** Epoch Capability Index, null if before Feb 2023 */
  eci: number | null
  /** Training compute (log₁₀ FLOP), always available */
  compute: number
  /** Formatted compute string, e.g., "10^25.3" */
  computeFormatted: string
}
