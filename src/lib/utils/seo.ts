import type { Metadata } from 'next'
import type { Obituary } from '@/types/obituary'

const SITE_NAME = 'AI Obituaries'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiobituaries.com'

/**
 * Truncates a string to a maximum length, adding ellipsis if truncated.
 * Ensures the result never exceeds maxLength characters.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Generates Next.js Metadata object for an individual obituary page.
 * Includes title, description, Open Graph, and Twitter Card meta tags.
 */
export function generateObituaryMetadata(obituary: Obituary): Metadata {
  // Title: truncated claim (layout template adds " | AI Obituaries")
  const title = truncate(obituary.claim, 45)

  // Description: source + claim context, max 155 chars
  const description = truncate(
    `${obituary.source}: "${obituary.claim}"`,
    155
  )

  const url = `${BASE_URL}/obituary/${obituary.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: `${BASE_URL}/og/default.png`,
          width: 1200,
          height: 630,
          alt: `AI Obituaries - ${obituary.source}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/og/default.png`],
    },
    alternates: {
      canonical: url,
    },
  }
}

/**
 * Homepage metadata configuration.
 * Provides SEO-optimized title, description, and social sharing tags.
 */
export const homepageMetadata: Metadata = {
  title: 'Documenting AI Skepticism',
  description: 'A data-driven archive of every time critics declared AI dead, overhyped, or a bubble. Documented predictions with full context.',
  openGraph: {
    title: 'AI Obituaries - Documenting AI Skepticism',
    description: 'A data-driven archive of every time critics declared AI dead, overhyped, or a bubble.',
    type: 'website',
    url: BASE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: `${BASE_URL}/og/default.png`,
        width: 1200,
        height: 630,
        alt: 'AI Obituaries',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Obituaries - Documenting AI Skepticism',
    description: 'A data-driven archive of every time critics declared AI dead, overhyped, or a bubble.',
    images: [`${BASE_URL}/og/default.png`],
  },
}
