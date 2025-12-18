/**
 * Exa Search Queries for AI Doom Discovery
 *
 * Searches for AI skepticism/doom claims across tweets and news articles.
 */

import { getExaClient } from './client'
import { ALL_WHITELISTED_DOMAINS, AI_DOOM_KEYWORDS } from '@/config/sources'
import type { DiscoveryCandidate, SourceType } from '@/types/discovery'

/**
 * Build the search query string from doom keywords
 */
function buildSearchQuery(): string {
  // Combine keywords with OR for broader search
  // Take a subset to avoid overly long queries
  const keywords = AI_DOOM_KEYWORDS.slice(0, 8)
  return keywords.join(' OR ')
}

/**
 * Transform Exa search result to DiscoveryCandidate
 */
function toCandidate(
  result: {
    url: string
    title?: string | null
    text?: string | null
    publishedDate?: string | null
    author?: string | null
    score?: number | null
  },
  sourceType: SourceType
): DiscoveryCandidate {
  return {
    url: result.url,
    title: result.title ?? '',
    text: result.text ?? '',
    publishedDate: result.publishedDate ?? new Date().toISOString(),
    author: result.author
      ? {
          name: result.author,
          // For tweets, extract handle from URL
          handle: sourceType === 'tweet' ? extractHandleFromUrl(result.url) : undefined,
        }
      : undefined,
    sourceType,
    score: result.score ?? undefined,
  }
}

/**
 * Extract Twitter handle from tweet URL
 * e.g., "https://twitter.com/GaryMarcus/status/123" -> "GaryMarcus"
 */
function extractHandleFromUrl(url: string): string | undefined {
  const match = url.match(/(?:twitter\.com|x\.com)\/([^/]+)/)
  return match?.[1]
}

/**
 * Search for AI doom claims in tweets
 *
 * @param since - Only return tweets published after this date
 * @param numResults - Maximum number of results (default 50)
 * @returns Array of discovery candidates
 */
export async function searchTweets(
  since: Date,
  numResults = 50
): Promise<DiscoveryCandidate[]> {
  const client = getExaClient()

  if (!client) {
    console.warn('[exa/queries] Exa client not configured, skipping tweet search')
    return []
  }

  try {
    const response = await client.searchAndContents(buildSearchQuery(), {
      category: 'tweet',
      startPublishedDate: since.toISOString(),
      numResults,
      text: true,
    })

    return response.results.map((r) => toCandidate(r, 'tweet'))
  } catch (error) {
    console.error('[exa/queries] Tweet search failed:', error)
    return []
  }
}

/**
 * Search for AI doom claims in news articles
 *
 * @param since - Only return articles published after this date
 * @param numResults - Maximum number of results (default 50)
 * @returns Array of discovery candidates
 */
export async function searchNews(
  since: Date,
  numResults = 50
): Promise<DiscoveryCandidate[]> {
  const client = getExaClient()

  if (!client) {
    console.warn('[exa/queries] Exa client not configured, skipping news search')
    return []
  }

  try {
    const response = await client.searchAndContents(buildSearchQuery(), {
      category: 'news',
      includeDomains: [...ALL_WHITELISTED_DOMAINS],
      startPublishedDate: since.toISOString(),
      numResults,
      text: true,
    })

    return response.results.map((r) => toCandidate(r, 'news'))
  } catch (error) {
    console.error('[exa/queries] News search failed:', error)
    return []
  }
}

/**
 * Discover all candidates from both tweets and news
 *
 * @param since - Only return content published after this date
 * @returns Combined array of discovery candidates
 */
export async function discoverCandidates(
  since: Date
): Promise<DiscoveryCandidate[]> {
  // Run both searches in parallel
  const [tweets, news] = await Promise.all([searchTweets(since), searchNews(since)])

  return [...tweets, ...news]
}
