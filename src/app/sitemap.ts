import type { MetadataRoute } from 'next'
import { getObituaries } from '@/lib/sanity/queries'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiobituaries.com'

/**
 * Generates dynamic sitemap including homepage and all obituary pages.
 * Uses ISR through getObituaries() cache tags for automatic updates.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const obituaries = await getObituaries()

  const obituaryUrls: MetadataRoute.Sitemap = obituaries.map((obituary) => ({
    url: `${BASE_URL}/obituary/${obituary.slug}`,
    lastModified: new Date(obituary.date),
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
    ...obituaryUrls,
  ]
}
