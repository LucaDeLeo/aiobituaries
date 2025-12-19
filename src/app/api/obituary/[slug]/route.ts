import { NextResponse } from 'next/server'
import { getObituaryBySlug } from '@/lib/sanity/queries'

/**
 * GET /api/obituary/[slug]
 *
 * Server-side API route to fetch obituary details by slug.
 * This proxies the Sanity request to avoid CORS issues when
 * fetching from client components.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    const obituary = await getObituaryBySlug(slug)

    if (!obituary) {
      return NextResponse.json(
        { error: 'Obituary not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(obituary)
  } catch (error) {
    console.error('Error fetching obituary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch obituary' },
      { status: 500 }
    )
  }
}
