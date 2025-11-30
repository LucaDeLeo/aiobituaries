// This is SERVER-SIDE ONLY code. Never expose SANITY_WEBHOOK_SECRET to the client.
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Server-side secret - never expose to client
  const secret = request.headers.get('x-sanity-webhook-secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // Revalidate all pages that display obituaries
  revalidatePath('/')
  revalidatePath('/claims')
  revalidatePath('/obituary/[slug]', 'page')

  return NextResponse.json({ revalidated: true })
}
