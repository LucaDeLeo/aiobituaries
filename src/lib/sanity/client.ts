import { createClient, type SanityClient } from 'next-sanity'

/**
 * P1.2 fix: Lazy Sanity client creation to avoid throwing on import when env is missing.
 * This allows the mock fallback logic in queries.ts to work properly.
 */
let _client: SanityClient | null = null

/**
 * Get the Sanity CMS client configured for read operations.
 * Returns null if required env vars are missing (allows mock fallback).
 * Uses CDN for faster reads in production.
 */
export function getSanityClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

  // Return null if projectId is missing or placeholder - allows mock fallback
  if (!projectId || projectId === 'placeholder' || projectId === 'your_project_id' || projectId === 'your_project_id_here') {
    return null
  }

  // Lazy initialization - only create client once
  if (!_client) {
    _client = createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: true,
    })
  }

  return _client
}

/**
 * Legacy export for backward compatibility.
 * @deprecated Use getSanityClient() instead for null-safe access
 */
export const client = {
  fetch: async <T>(
    query: string,
    params?: Record<string, unknown>,
    options?: { next?: { tags?: string[]; revalidate?: number | false } }
  ): Promise<T> => {
    const sanityClient = getSanityClient()
    if (!sanityClient) {
      throw new Error('Sanity client not configured - use mock data instead')
    }
    // Use explicit arguments to match Sanity client signature
    // Default params to empty object to satisfy QueryParams type
    return sanityClient.fetch<T>(query, params ?? {}, options)
  },
}
