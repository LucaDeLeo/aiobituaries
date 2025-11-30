import { client } from './client'
import type { Obituary, ObituarySummary } from '@/types/obituary'

/**
 * GROQ projection for full obituary fields.
 * Extracts slug.current as "slug" for cleaner API.
 */
const obituaryProjection = `{
  _id,
  "slug": slug.current,
  claim,
  source,
  sourceUrl,
  date,
  categories,
  context
}`

/**
 * GROQ projection for summary obituary fields (list/card views).
 * Excludes context and sourceUrl for smaller payload.
 */
const summaryProjection = `{
  _id,
  "slug": slug.current,
  claim,
  source,
  date,
  categories
}`

/**
 * Fetch all obituaries ordered by date descending.
 * Returns summary data for list/card views.
 * Uses ISR with 'obituaries' tag for cache revalidation.
 */
export async function getObituaries(): Promise<ObituarySummary[]> {
  return client.fetch(
    `*[_type == "obituary"] | order(date desc) ${summaryProjection}`,
    undefined,
    { next: { tags: ['obituaries'] } }
  )
}

/**
 * Fetch a single obituary by slug.
 * Returns null if not found.
 */
export async function getObituaryBySlug(slug: string): Promise<Obituary | null> {
  return client.fetch(
    `*[_type == "obituary" && slug.current == $slug][0] ${obituaryProjection}`,
    { slug }
  )
}

/**
 * Get total count of obituaries.
 * Useful for homepage statistics.
 * Uses ISR with 'obituary' tag for cache revalidation.
 */
export async function getObituaryCount(): Promise<number> {
  return client.fetch(`count(*[_type == "obituary"])`, undefined, {
    next: { tags: ['obituary'] },
  })
}
