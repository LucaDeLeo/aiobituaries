import type { ContextMetadata } from './context'

/**
 * Categorization of AI skepticism claims.
 * Each obituary can have multiple categories.
 * Categories determine Y-axis behavior in the contextual scatter plot visualization.
 */
export type Category = 'market' | 'capability' | 'agi' | 'dismissive'

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
}
