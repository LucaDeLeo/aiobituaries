/**
 * Exa API Client
 *
 * Lazy-initialized client following the pattern from src/lib/sanity/client.ts
 * Returns null if API key is not configured (allows graceful degradation).
 */

import Exa from 'exa-js'

let _client: Exa | null = null

/**
 * Get the Exa search client.
 * Returns null if EXA_API_KEY is not configured.
 *
 * @returns Exa client instance or null
 */
export function getExaClient(): Exa | null {
  const apiKey = process.env.EXA_API_KEY

  if (!apiKey) {
    return null
  }

  // Lazy initialization - only create client once
  if (!_client) {
    _client = new Exa(apiKey)
  }

  return _client
}

/**
 * Check if Exa is configured and available
 */
export function isExaConfigured(): boolean {
  return !!process.env.EXA_API_KEY
}
