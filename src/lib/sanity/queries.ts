import { client } from './client'
import type { Obituary } from '@/types/obituary'

/**
 * GROQ projection for obituary fields.
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
 * Fetch all obituaries ordered by date descending.
 * Uses CDN for fast reads.
 */
export async function getObituaries(): Promise<Obituary[]> {
  return client.fetch(
    `*[_type == "obituary"] | order(date desc) ${obituaryProjection}`
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
