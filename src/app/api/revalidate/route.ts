// This is SERVER-SIDE ONLY code. Never expose SANITY_WEBHOOK_SECRET to the client.
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Server-side secret - never expose to client
  const secret = request.headers.get('x-sanity-webhook-secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // P1.6 fix: Use tag-based revalidation to match queries.ts cache tags
  // All obituary queries use { next: { tags: ['obituaries'] } }
  // Next.js 16 requires options object with expire (0 = immediate)
  revalidateTag('obituaries', { expire: 0 })
  revalidateTag('obituary', { expire: 0 }) // Used by getObituaryCount

  // Also revalidate paths for good measure
  revalidatePath('/')
  revalidatePath('/about')
  revalidatePath('/obituary/[slug]', 'page')
  revalidatePath('/sitemap.xml')

  return NextResponse.json({ revalidated: true })
}
