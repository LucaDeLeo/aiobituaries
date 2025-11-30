import { client } from './client'
import type { Obituary, ObituarySummary } from '@/types/obituary'
import { mockObituaries } from '@/data/mock-obituaries'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

const shouldUseMock =
  process.env.NODE_ENV !== 'test' &&
  (!projectId ||
    projectId === 'placeholder' ||
    projectId === 'your_project_id' ||
    !dataset ||
    dataset === 'placeholder')

const FALLBACK_SOURCE_URL = 'https://example.com'

function summaryToObituary(summary: ObituarySummary): Obituary {
  return {
    ...summary,
    sourceUrl: FALLBACK_SOURCE_URL,
    context: {},
  }
}

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
  if (shouldUseMock) {
    return mockObituaries
  }

  try {
    return await client.fetch(
      `*[_type == "obituary"] | order(date desc) ${summaryProjection}`,
      undefined,
      { next: { tags: ['obituaries'] } }
    )
  } catch {
    // Fallback to mock data if CMS is unavailable
    return mockObituaries
  }
}

/**
 * Fetch a single obituary by slug.
 * Returns null if not found.
 * Uses ISR with 'obituaries' tag for cache revalidation.
 */
export async function getObituaryBySlug(slug: string): Promise<Obituary | null> {
  if (shouldUseMock) {
    const fallback = mockObituaries.find((entry) => entry.slug === slug)
    return fallback ? summaryToObituary(fallback) : null
  }

  try {
    return await client.fetch(
      `*[_type == "obituary" && slug.current == $slug][0] ${obituaryProjection}`,
      { slug },
      { next: { tags: ['obituaries'] } }
    )
  } catch {
    const fallback = mockObituaries.find((entry) => entry.slug === slug)
    return fallback ? summaryToObituary(fallback) : null
  }
}

/**
 * Fetch all obituary slugs for static generation.
 * Used by generateStaticParams() in dynamic route pages.
 * Uses ISR with 'obituaries' tag for cache revalidation.
 */
export async function getAllObituarySlugs(): Promise<string[]> {
  if (shouldUseMock) {
    return mockObituaries.map((o) => o.slug)
  }

  try {
    return await client.fetch<string[]>(
      `*[_type == "obituary"].slug.current`,
      {},
      { next: { tags: ['obituaries'] } }
    )
  } catch {
    return mockObituaries.map((o) => o.slug)
  }
}

/**
 * Get total count of obituaries.
 * Useful for homepage statistics.
 * Uses ISR with 'obituary' tag for cache revalidation.
 */
export async function getObituaryCount(): Promise<number> {
  if (shouldUseMock) {
    return mockObituaries.length
  }

  try {
    return await client.fetch(`count(*[_type == "obituary"])`, undefined, {
      next: { tags: ['obituary'] },
    })
  } catch {
    return mockObituaries.length
  }
}
