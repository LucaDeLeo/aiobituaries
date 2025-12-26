/**
 * Discovery Pipeline API Endpoint
 *
 * Triggered by Vercel Cron daily at 9am UTC.
 * Discovers AI doom claims, classifies them, and creates draft obituaries.
 */

import { NextRequest, NextResponse } from 'next/server'
import { discoverCandidates } from '@/lib/exa/queries'
import { filterCandidates } from '@/lib/discovery/quality-filter'
import { classifyCandidates, filterClassified } from '@/lib/discovery/classifier'
import { enrichContext, generateSlug } from '@/lib/discovery/enricher'
import {
  createObituaryDrafts,
  filterNewDrafts,
} from '@/lib/sanity/mutations'
import { extractDomain } from '@/lib/discovery/quality-filter'
import type { ObituaryDraft, DiscoveryRunResult, ClassifiedCandidate } from '@/types/discovery'

/**
 * Convert a classified candidate to an obituary draft
 */
async function toDraft(classified: ClassifiedCandidate): Promise<ObituaryDraft> {
  const { candidate, result } = classified

  // Enrich with context from the claim date
  const context = await enrichContext(candidate.publishedDate)

  // Determine source name
  const sourceName =
    candidate.sourceType === 'tweet'
      ? candidate.author?.name || 'Twitter'
      : extractDomain(candidate.url) || 'Unknown'

  // P1.3 fix: Pass date to generateSlug for uniqueness
  const claimDate = candidate.publishedDate.slice(0, 10) // YYYY-MM-DD

  return {
    _type: 'obituary',
    claim: result.extractedClaim,
    source: sourceName,
    sourceUrl: candidate.url,
    date: claimDate,
    categories: [result.suggestedCategory],
    context,
    slug: {
      _type: 'slug',
      current: generateSlug(result.extractedClaim, claimDate),
    },
    discoveryMetadata: {
      discoveredAt: new Date().toISOString(),
      confidence: result.claimConfidence,
      notabilityReason: result.notabilityReason,
      sourceType: candidate.sourceType,
    },
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const errors: string[] = []

  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Step 1: Calculate "since" date (24 hours ago)
    const since = new Date()
    since.setHours(since.getHours() - 24)

    // Step 2: Discover candidates from Exa
    console.log('[discover] Starting discovery since', since.toISOString())
    const rawCandidates = await discoverCandidates(since)
    console.log(`[discover] Found ${rawCandidates.length} raw candidates`)

    if (rawCandidates.length === 0) {
      const result: DiscoveryRunResult = {
        discovered: 0,
        filtered: 0,
        classified: 0,
        created: 0,
        createdIds: [],
        errors: [],
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(result)
    }

    // Step 3: Filter through quality gates
    const filtered = filterCandidates(rawCandidates)
    console.log(`[discover] ${filtered.length} candidates passed quality filter`)

    if (filtered.length === 0) {
      const result: DiscoveryRunResult = {
        discovered: rawCandidates.length,
        filtered: 0,
        classified: 0,
        created: 0,
        createdIds: [],
        errors: [],
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(result)
    }

    // Step 4: Classify with LLM
    const classified = await classifyCandidates(filtered)
    console.log(`[discover] ${classified.length} candidates classified`)

    // Step 5: Filter out rejections
    const approved = filterClassified(classified)
    console.log(`[discover] ${approved.length} candidates approved`)

    if (approved.length === 0) {
      const result: DiscoveryRunResult = {
        discovered: rawCandidates.length,
        filtered: filtered.length,
        classified: classified.length,
        created: 0,
        createdIds: [],
        errors: [],
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(result)
    }

    // Step 6: Convert to drafts and enrich
    const drafts = await Promise.all(approved.map(toDraft))

    // Step 7: Filter out duplicates (already exist in Sanity)
    const newDrafts = await filterNewDrafts(drafts)
    console.log(`[discover] ${newDrafts.length} new drafts (${drafts.length - newDrafts.length} duplicates filtered)`)

    if (newDrafts.length === 0) {
      const result: DiscoveryRunResult = {
        discovered: rawCandidates.length,
        filtered: filtered.length,
        classified: approved.length,
        created: 0,
        createdIds: [],
        errors: ['All candidates were duplicates'],
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(result)
    }

    // Step 8: Create in Sanity
    const { createdIds, failedIndices } = await createObituaryDrafts(newDrafts)

    if (failedIndices.length > 0) {
      errors.push(`Failed to create ${failedIndices.length} drafts`)
    }

    const duration = Date.now() - startTime
    console.log(`[discover] Completed in ${duration}ms. Created ${createdIds.length} drafts`)

    const result: DiscoveryRunResult = {
      discovered: rawCandidates.length,
      filtered: filtered.length,
      classified: approved.length,
      created: createdIds.length,
      createdIds,
      errors,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[discover] Pipeline failed:', error)
    return NextResponse.json(
      {
        error: 'Discovery pipeline failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Allow GET for manual testing (just returns status)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Discovery pipeline ready. Use POST to trigger.',
    configured: {
      exa: !!process.env.EXA_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      sanity: !!process.env.SANITY_WRITE_TOKEN,
      cron: !!process.env.CRON_SECRET,
    },
  })
}
