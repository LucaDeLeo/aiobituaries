/**
 * Shared filter utilities for obituary data.
 *
 * P2.5 fix: Consolidates duplicate filter logic that was in
 * both home-client.tsx and home-page-client.tsx.
 */

import type { ObituarySummary } from '@/types/obituary'

/**
 * Check if an obituary matches a search query.
 * Searches in claim text, source name, and categories (case-insensitive).
 *
 * @param obit - The obituary to check
 * @param query - Search query string
 * @returns true if the obituary matches the query
 *
 * @example
 * ```ts
 * matchesSearch(obit, 'AI') // true if claim, source, or category contains 'AI'
 * matchesSearch(obit, '')   // true (empty query matches all)
 * ```
 */
export function matchesSearch(obit: ObituarySummary, query: string): boolean {
  if (!query) return true
  const lowerQuery = query.toLowerCase()
  return (
    obit.claim.toLowerCase().includes(lowerQuery) ||
    obit.source.toLowerCase().includes(lowerQuery) ||
    obit.categories?.some(cat => cat.toLowerCase().includes(lowerQuery)) ||
    false
  )
}
