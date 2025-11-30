import type { Obituary } from '@/types/obituary'
import { truncate } from '@/lib/utils/seo'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiobituaries.com'

interface JsonLdProps {
  obituary?: Obituary
  type?: 'article' | 'website'
}

/**
 * Renders JSON-LD structured data for SEO.
 * Supports Article schema for obituary pages and WebSite schema for homepage.
 */
export function JsonLd({ obituary, type = 'article' }: JsonLdProps) {
  if (type === 'website' || !obituary) {
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AI Obituaries',
      description: 'A data-driven archive documenting AI skepticism',
      url: BASE_URL,
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    )
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: truncate(obituary.claim, 110),
    datePublished: obituary.date,
    author: {
      '@type': 'Person',
      name: obituary.source,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Obituaries',
      url: BASE_URL,
    },
    description: truncate(
      `${obituary.source}: "${obituary.claim}"`,
      155
    ),
    url: `${BASE_URL}/obituary/${obituary.slug}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  )
}
