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
 * Create multiple obituary drafts in Sanity
 *
 * @param drafts - Array of drafts to create
 * @returns Object with created IDs and failed indices
 */
export async function createObituaryDrafts(
  drafts: ObituaryDraft[]
): Promise<{ createdIds: string[]; failedIndices: number[] }> {
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
 *
 * @param drafts - Array of drafts to filter
 * @returns Drafts that don't already exist in Sanity
 */
export async function filterNewDrafts(
  drafts: ObituaryDraft[]
): Promise<ObituaryDraft[]> {
  const results = await Promise.all(
    drafts.map(async (draft) => ({
      draft,
      exists: await obituaryExistsByUrl(draft.sourceUrl),
    }))
  )

  return results.filter((r) => !r.exists).map((r) => r.draft)
}
