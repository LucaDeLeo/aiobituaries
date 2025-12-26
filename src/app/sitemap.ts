import type { MetadataRoute } from 'next'
import { getObituaries } from '@/lib/sanity/queries'
import { parseUTCDate } from '@/lib/utils/date'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiobituaries.com'

/**
 * Generates dynamic sitemap including homepage and all obituary pages.
 * Uses ISR through getObituaries() cache tags for automatic updates.
 * P1.2 fix: Use parseUTCDate for consistent date parsing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const obituaries = await getObituaries()

  const obituaryUrls: MetadataRoute.Sitemap = obituaries.map((obituary) => ({
    url: `${BASE_URL}/obituary/${obituary.slug}`,
    lastModified: parseUTCDate(obituary.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...obituaryUrls,
  ]
}
