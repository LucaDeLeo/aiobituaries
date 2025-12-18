/**
 * Types for the AI Obituary Discovery Pipeline
 */

import type { Category } from './obituary'
import type { ContextMetadata } from './context'

/**
 * Source type for discovered content
 */
export type SourceType = 'tweet' | 'news'

/**
 * Author/creator metadata for a discovered piece of content
 */
export interface AuthorMetadata {
  /** Display name */
  name: string
  /** Twitter/X handle (without @) */
  handle?: string
  /** Author bio/description */
  bio?: string
  /** Follower count (Twitter) */
  followers?: number
  /** Verified status */
  verified?: boolean
}

/**
 * A candidate piece of content discovered by the pipeline
 * before classification and filtering
 */
export interface DiscoveryCandidate {
  /** URL to the original content */
  url: string
  /** Title or first line of content */
  title: string
  /** Full text content */
  text: string
  /** ISO 8601 date when content was published */
  publishedDate: string
  /** Author information if available */
  author?: AuthorMetadata
  /** Whether this is a tweet or news article */
  sourceType: SourceType
  /** Exa score/relevance if available */
  score?: number
}

/**
 * Recommendation from the classifier
 */
export type ClassificationRecommendation = 'approve' | 'review' | 'reject'

/**
 * Result of LLM classification for a candidate
 */
export interface ClassificationResult {
  /** Whether the content contains an AI doom/skepticism claim */
  isAIDoomClaim: boolean
  /** Confidence score 0-1 that this is a doom claim */
  claimConfidence: number
  /** Whether the author is notable enough to track */
  isNotable: boolean
  /** Reason for notability determination */
  notabilityReason: string
  /** The extracted/summarized claim text */
  extractedClaim: string
  /** Suggested category for the claim */
  suggestedCategory: Category
  /** Overall recommendation */
  recommendation: ClassificationRecommendation
}

/**
 * A candidate paired with its classification result
 */
export interface ClassifiedCandidate {
  candidate: DiscoveryCandidate
  result: ClassificationResult
}

/**
 * Discovery metadata attached to draft obituaries
 */
export interface DiscoveryMetadata {
  /** When the content was discovered */
  discoveredAt: string
  /** Confidence score from classification */
  confidence: number
  /** Why the author was considered notable */
  notabilityReason: string
  /** Original source type */
  sourceType: SourceType
}

/**
 * Draft obituary to be created in Sanity CMS
 * This extends the base obituary structure with draft-specific fields
 */
export interface ObituaryDraft {
  /** Sanity document type */
  _type: 'obituary'
  /** The extracted claim text */
  claim: string
  /** Source name (publication or author name) */
  source: string
  /** URL to original content */
  sourceUrl: string
  /** ISO 8601 date of the claim */
  date: string
  /** Suggested categories */
  categories: Category[]
  /** Context data at time of claim */
  context: ContextMetadata
  /** Slug for URL (generated from claim) */
  slug: {
    _type: 'slug'
    current: string
  }
  /** Discovery pipeline metadata - stored in Sanity custom field */
  discoveryMetadata: DiscoveryMetadata
}

/**
 * Result summary from running the discovery pipeline
 */
export interface DiscoveryRunResult {
  /** Number of raw candidates discovered */
  discovered: number
  /** Number remaining after quality filtering */
  filtered: number
  /** Number classified as valid claims */
  classified: number
  /** Number of drafts created in Sanity */
  created: number
  /** IDs of created documents */
  createdIds: string[]
  /** Any errors that occurred */
  errors: string[]
  /** Timestamp of the run */
  timestamp: string
}

/**
 * Exa search result types (subset of what Exa returns)
 */
export interface ExaSearchResult {
  url: string
  title: string
  text?: string
  publishedDate?: string
  author?: string
  score?: number
}

export interface ExaSearchResponse {
  results: ExaSearchResult[]
  autopromptString?: string
}
