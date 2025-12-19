/**
 * Quality Filtering for Discovery Pipeline
 *
 * Filters discovery candidates through multiple quality gates:
 * 1. Whitelist matching (handles and publications)
 * 2. Notability heuristics (followers, bio, verified)
 * 3. Content quality (length, spam detection)
 */

import {
  ALL_NOTABLE_HANDLES,
  ALL_WHITELISTED_DOMAINS,
  NOTABILITY_CONFIG,
  EXCLUSION_PATTERNS,
} from '@/config/sources'
import type { DiscoveryCandidate, AuthorMetadata } from '@/types/discovery'

/**
 * Precomputed lowercase handles for O(1) lookup.
 * Created once at module load to avoid repeated Array.from() and toLowerCase() calls.
 */
const LOWERCASE_HANDLES = new Set(
  Array.from(ALL_NOTABLE_HANDLES).map((h) => h.toLowerCase())
)

/**
 * Check if a Twitter handle is in the whitelist
 *
 * @param handle - Twitter handle (with or without @)
 * @returns true if whitelisted
 */
export function isWhitelistedHandle(handle: string): boolean {
  // Normalize: remove @ and lowercase, then O(1) Set lookup
  const normalized = handle.replace(/^@/, '').toLowerCase()
  return LOWERCASE_HANDLES.has(normalized)
}

/**
 * Check if a URL is from a whitelisted publication
 *
 * @param url - Full URL to check
 * @returns true if from whitelisted domain
 */
export function isWhitelistedPublication(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return ALL_WHITELISTED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

/**
 * Extract domain from URL for source attribution
 *
 * @param url - Full URL
 * @returns Domain name or null
 */
export function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * Check if an author passes notability heuristics
 * Used for unknown accounts not in the whitelist
 *
 * @param author - Author metadata
 * @returns true if author meets notability threshold
 */
export function passesNotabilityHeuristics(author: AuthorMetadata): boolean {
  const { minFollowers, bioKeywords, verifiedMinFollowers } = NOTABILITY_CONFIG

  // Verified accounts have lower threshold
  if (author.verified && author.followers && author.followers >= verifiedMinFollowers) {
    return true
  }

  // Regular accounts need more followers
  if (author.followers && author.followers >= minFollowers) {
    return true
  }

  // Bio keyword matching for expertise indicators
  if (author.bio && bioKeywords.test(author.bio)) {
    // Lower threshold if bio suggests expertise
    if (author.followers && author.followers >= minFollowers / 2) {
      return true
    }
  }

  return false
}

/**
 * Check if content passes quality checks (not spam, sufficient length)
 *
 * @param candidate - The discovery candidate
 * @returns true if content passes quality checks
 */
export function passesContentQuality(candidate: DiscoveryCandidate): boolean {
  const text = candidate.text || candidate.title

  // Must have meaningful content
  if (!text || text.length < 50) {
    return false
  }

  // Check exclusion patterns
  for (const pattern of EXCLUSION_PATTERNS) {
    if (pattern.test(text)) {
      return false
    }
  }

  return true
}

/**
 * Filter a single candidate through all quality gates
 *
 * @param candidate - The candidate to check
 * @returns true if candidate passes all quality gates
 */
export function passesQualityGates(candidate: DiscoveryCandidate): boolean {
  // Gate 1: Content quality
  if (!passesContentQuality(candidate)) {
    return false
  }

  // Gate 2: Source whitelist
  if (candidate.sourceType === 'news') {
    // News must be from whitelisted publication
    return isWhitelistedPublication(candidate.url)
  }

  // Gate 3: Tweet author checks
  if (candidate.sourceType === 'tweet') {
    const handle = candidate.author?.handle
    if (handle && isWhitelistedHandle(handle)) {
      return true
    }

    // Fall back to notability heuristics
    if (candidate.author && passesNotabilityHeuristics(candidate.author)) {
      return true
    }

    return false
  }

  return false
}

/**
 * Filter candidates through all quality gates
 *
 * @param candidates - Array of candidates to filter
 * @returns Filtered array of quality candidates
 */
export function filterCandidates(
  candidates: DiscoveryCandidate[]
): DiscoveryCandidate[] {
  return candidates.filter(passesQualityGates)
}
