import type { ContextMetadata } from './context'

/**
 * Categorization of AI skepticism claims.
 * Each obituary can have multiple categories.
 * Categories determine Y-axis behavior in the contextual scatter plot visualization.
 *
 * Category types:
 * - capability-narrow: Task-specific skepticism ("AI will never write code")
 * - capability-reasoning: Intelligence/understanding skepticism ("LLMs are just autocomplete")
 * - capability: Legacy category - maps to capability-narrow for backwards compatibility
 * - market: Financial/bubble claims ("AI bubble will burst")
 * - agi: AGI-specific skepticism ("AGI is impossible")
 * - dismissive: General AI dismissal ("AI is just hype")
 */
export type Category =
  | 'capability-narrow'
  | 'capability-reasoning'
  | 'capability' // Legacy - treat as capability-narrow
  | 'market'
  | 'agi'
  | 'dismissive'

/**
 * Claim status tracking - how has the prediction aged?
 *
 * - falsified: Claim has been definitively proven wrong by AI progress
 * - aging: Claim is showing signs of being wrong but not definitively falsified
 * - pending: Claim cannot yet be evaluated (timeline not reached, or newly added)
 */
export type ClaimStatus = 'falsified' | 'aging' | 'pending'

/**
 * Lightweight skeptic reference for linking from obituary to skeptic profile.
 */
export interface SkepticRef {
  /** Skeptic display name */
  name: string
  /** URL-safe slug for linking */
  slug: string
}

/**
 * Core data model representing an AI skepticism claim documented as an "obituary".
 * Each obituary captures a claim, its source, date, categorization, and contextual
 * data (stock prices, benchmarks) that existed when the claim was made.
 */
export interface Obituary {
  /** Sanity document ID */
  _id: string
  /** URL-safe identifier derived from claim */
  slug: string
  /** The actual skepticism claim text */
  claim: string
  /** Publication or person who made the claim */
  source: string
  /** URL to original source */
  sourceUrl: string
  /** ISO 8601 date when claim was made */
  date: string
  /** Array of claim categories */
  categories: Category[]
  /** Contextual data at time of claim */
  context: ContextMetadata
  /** Reference to linked skeptic profile (optional - may be null) */
  skeptic?: SkepticRef | null
  /** Claim status - how has the prediction aged? (optional, defaults to 'pending') */
  status?: ClaimStatus
}

/**
 * Lightweight obituary type for list/card views.
 * Excludes context metadata and sourceUrl for smaller payload and faster rendering.
 */
export interface ObituarySummary {
  /** Sanity document ID */
  _id: string
  /** URL-safe identifier derived from claim */
  slug: string
  /** The actual skepticism claim text */
  claim: string
  /** Publication or person who made the claim */
  source: string
  /** ISO 8601 date when claim was made */
  date: string
  /** Array of claim categories */
  categories: Category[]
  /** Reference to linked skeptic profile (optional - may be null) */
  skeptic?: SkepticRef | null
  /** Claim status - how has the prediction aged? (optional, defaults to 'pending') */
  status?: ClaimStatus
}
