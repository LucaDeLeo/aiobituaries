/**
 * Sanity Write Client and Mutations
 *
 * Handles creating draft obituaries in Sanity CMS.
 * Uses a separate write token from the read-only client.
 */

import { createClient, type SanityClient } from '@sanity/client'
import type { ObituaryDraft } from '@/types/discovery'

let _writeClient: SanityClient | null = null

/**
 * Get the Sanity write client.
 * Returns null if required env vars are not configured.
 *
 * This is separate from the read client because:
 * 1. Requires SANITY_WRITE_TOKEN (more privileged)
 * 2. Does not use CDN (writes go direct)
 */
export function getSanityWriteClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_WRITE_TOKEN

  // All required for write operations
  if (
    !projectId ||
    !token ||
    projectId === 'placeholder' ||
    projectId === 'your_project_id'
  ) {
    return null
  }

  if (!_writeClient) {
    _writeClient = createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      token,
      useCdn: false, // Writes must go direct
    })
  }

  return _writeClient
}

/**
 * Check if Sanity write client is configured
 */
export function isSanityWriteConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.SANITY_WRITE_TOKEN
  )
}

/**
 * Create a single obituary draft in Sanity
 *
 * @param draft - The obituary draft to create
 * @returns Created document ID or null on failure
 */
export async function createObituaryDraft(
  draft: ObituaryDraft
): Promise<string | null> {
  const client = getSanityWriteClient()

  if (!client) {
    console.warn('[sanity/mutations] Write client not configured')
    return null
  }

  try {
    // Create the document
    const result = await client.create(draft)
    return result._id
  } catch (error) {
    console.error('[sanity/mutations] Failed to create draft:', error)
    return null
  }
}

/**
 * Create multiple obituary drafts in Sanity using a transaction for efficiency
 *
 * @param drafts - Array of drafts to create
 * @returns Object with created IDs and failed indices
 */
export async function createObituaryDrafts(
  drafts: ObituaryDraft[]
): Promise<{ createdIds: string[]; failedIndices: number[] }> {
  const client = getSanityWriteClient()

  if (!client) {
    console.warn('[sanity/mutations] Write client not configured')
    return { createdIds: [], failedIndices: drafts.map((_, i) => i) }
  }

  if (drafts.length === 0) {
    return { createdIds: [], failedIndices: [] }
  }

  try {
    // Use transaction for batch creation (more efficient than sequential creates)
    const transaction = client.transaction()
    const tempIds: string[] = []

    for (const draft of drafts) {
      // Generate a temporary ID for tracking
      const tempId = `drafts.${Date.now()}-${Math.random().toString(36).slice(2)}`
      tempIds.push(tempId)
      transaction.create({ ...draft, _id: tempId })
    }

    const result = await transaction.commit()

    // Extract created IDs from transaction result
    const createdIds = result.results.map((r) => r.id)
    return { createdIds, failedIndices: [] }
  } catch (error) {
    console.error('[sanity/mutations] Batch create failed, falling back to sequential:', error)

    // Fallback to sequential creation
    const createdIds: string[] = []
    const failedIndices: number[] = []

    for (let i = 0; i < drafts.length; i++) {
      const id = await createObituaryDraft(drafts[i])
      if (id) {
        createdIds.push(id)
      } else {
        failedIndices.push(i)
      }
    }

    return { createdIds, failedIndices }
  }
}

/**
 * Check if an obituary with this URL already exists
 * Prevents duplicate entries
 *
 * @param sourceUrl - The source URL to check
 * @returns true if a document with this URL exists
 */
export async function obituaryExistsByUrl(sourceUrl: string): Promise<boolean> {
  const client = getSanityWriteClient()

  if (!client) {
    // Can't check, assume it doesn't exist
    return false
  }

  try {
    const count = await client.fetch<number>(
      'count(*[_type == "obituary" && sourceUrl == $url])',
      { url: sourceUrl }
    )
    return count > 0
  } catch (error) {
    console.error('[sanity/mutations] Failed to check for duplicate:', error)
    return false
  }
}

/**
 * Filter drafts to exclude those that already exist (by URL)
 * Uses a single GROQ query for efficiency instead of N individual queries
 *
 * @param drafts - Array of drafts to filter
 * @returns Drafts that don't already exist in Sanity
 */
export async function filterNewDrafts(
  drafts: ObituaryDraft[]
): Promise<ObituaryDraft[]> {
  if (drafts.length === 0) return []

  const client = getSanityWriteClient()

  if (!client) {
    // Can't check, return all drafts
    return drafts
  }

  try {
    // Single query to find all existing URLs (more efficient than N queries)
    const urls = drafts.map((d) => d.sourceUrl)
    const existingUrls = await client.fetch<string[]>(
      `*[_type == "obituary" && sourceUrl in $urls].sourceUrl`,
      { urls }
    )

    // Filter out drafts whose URLs already exist
    const existingSet = new Set(existingUrls)
    return drafts.filter((draft) => !existingSet.has(draft.sourceUrl))
  } catch (error) {
    console.error('[sanity/mutations] Batch URL check failed:', error)
    // On error, return all drafts (let individual creates handle duplicates)
    return drafts
  }
}

// =============================================================================
// Skeptic Mutations (Notable Skeptics Feature)
// =============================================================================

import type { SkepticProfile } from '@/types/skeptic'

/**
 * Draft skeptic document for Sanity creation
 */
export interface SkepticDraft {
  _type: 'skeptic'
  name: string
  slug: { _type: 'slug'; current: string }
  bio: string
  profiles?: SkepticProfile[]
}

/**
 * Create a single skeptic in Sanity
 *
 * @param skeptic - The skeptic data to create
 * @returns Created document ID or null on failure
 */
export async function createSkeptic(
  skeptic: SkepticDraft
): Promise<string | null> {
  const client = getSanityWriteClient()

  if (!client) {
    console.warn('[sanity/mutations] Write client not configured')
    return null
  }

  try {
    const result = await client.create(skeptic)
    console.log(`[sanity/mutations] Created skeptic: ${skeptic.name} (${result._id})`)
    return result._id
  } catch (error) {
    console.error(`[sanity/mutations] Failed to create skeptic ${skeptic.name}:`, error)
    return null
  }
}

/**
 * Create multiple skeptics in Sanity using a transaction
 *
 * @param skeptics - Array of skeptics to create
 * @returns Object with created IDs and failed names
 */
export async function createSkeptics(
  skeptics: SkepticDraft[]
): Promise<{ createdIds: string[]; failedNames: string[] }> {
  const client = getSanityWriteClient()

  if (!client) {
    console.warn('[sanity/mutations] Write client not configured')
    return { createdIds: [], failedNames: skeptics.map((s) => s.name) }
  }

  if (skeptics.length === 0) {
    return { createdIds: [], failedNames: [] }
  }

  const createdIds: string[] = []
  const failedNames: string[] = []

  // Create sequentially to handle errors per-skeptic
  for (const skeptic of skeptics) {
    const id = await createSkeptic(skeptic)
    if (id) {
      createdIds.push(id)
    } else {
      failedNames.push(skeptic.name)
    }
  }

  return { createdIds, failedNames }
}

/**
 * Check if a skeptic with this slug already exists
 *
 * @param slug - The slug to check
 * @returns true if a skeptic with this slug exists
 */
export async function skepticExistsBySlug(slug: string): Promise<boolean> {
  const client = getSanityWriteClient()

  if (!client) {
    return false
  }

  try {
    const count = await client.fetch<number>(
      'count(*[_type == "skeptic" && slug.current == $slug])',
      { slug }
    )
    return count > 0
  } catch (error) {
    console.error('[sanity/mutations] Failed to check for existing skeptic:', error)
    return false
  }
}

/**
 * Filter skeptics to exclude those that already exist (by slug)
 *
 * @param skeptics - Array of skeptics to filter
 * @returns Skeptics that don't already exist in Sanity
 */
export async function filterNewSkeptics(
  skeptics: SkepticDraft[]
): Promise<SkepticDraft[]> {
  if (skeptics.length === 0) return []

  const client = getSanityWriteClient()

  if (!client) {
    return skeptics
  }

  try {
    const slugs = skeptics.map((s) => s.slug.current)
    const existingSlugs = await client.fetch<string[]>(
      `*[_type == "skeptic" && slug.current in $slugs].slug.current`,
      { slugs }
    )

    const existingSet = new Set(existingSlugs)
    return skeptics.filter((skeptic) => !existingSet.has(skeptic.slug.current))
  } catch (error) {
    console.error('[sanity/mutations] Batch slug check failed:', error)
    return skeptics
  }
}
