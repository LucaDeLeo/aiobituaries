/**
 * Context Enrichment for Discovery Pipeline
 *
 * Enriches obituary drafts with contextual data from the time of the claim:
 * - AI benchmark scores
 * - Training compute values
 * - Current leading model
 */

import {
  getMetricValueAtDate,
  trainingComputeFrontier,
  mmluFrontier,
  getFrontierModelAtDate,
} from '@/data/ai-metrics'
import type { ContextMetadata } from '@/types/context'

/**
 * Get the leading AI model at a given date
 *
 * Uses Epoch AI's frontier_ai_models.csv data to determine
 * which model had the highest training compute at that time.
 *
 * @param date - The date to check
 * @returns Name of the leading model at that time
 */
export function getModelAtDate(date: Date): string {
  const entry = getFrontierModelAtDate(date)
  return entry ? entry.model : 'Unknown'
}

/**
 * Enrich context data for a given date
 *
 * Pulls AI metrics from our existing data to provide context
 * about AI progress at the time a claim was made.
 *
 * @param dateStr - ISO 8601 date string
 * @returns Enriched context metadata
 */
export async function enrichContext(dateStr: string): Promise<ContextMetadata> {
  const date = new Date(dateStr)

  // Get training compute value (log10 FLOP)
  const computeValue = getMetricValueAtDate(trainingComputeFrontier, date)

  // Get MMLU score if available for the date
  let mmluScore: number | undefined
  try {
    const mmlu = getMetricValueAtDate(mmluFrontier, date)
    // MMLU scores should be in 0-100 range
    if (mmlu > 0 && mmlu <= 100) {
      mmluScore = mmlu
    }
  } catch {
    // MMLU data might not cover all dates
  }

  // Get the leading model at that time
  const currentModel = getModelAtDate(date)

  // Build context metadata
  const context: ContextMetadata = {
    currentModel,
  }

  // Add benchmark info if available
  if (mmluScore) {
    context.benchmarkName = 'MMLU'
    context.benchmarkScore = Math.round(mmluScore * 10) / 10
  }

  // Add a note about the AI landscape
  // Training compute is in log10 FLOP
  if (computeValue > 0) {
    const flopMagnitude = Math.floor(computeValue)
    context.note = `Frontier training compute: 10^${flopMagnitude} FLOP`
  }

  return context
}

/**
 * Generate a slug from claim text with fallback and uniqueness suffix.
 *
 * P1.3 fix: Handles edge cases:
 * - Empty claims or punctuation-only strings get fallback slug
 * - Optional date suffix for uniqueness
 * - Never returns empty string
 *
 * @param claim - The claim text
 * @param date - Optional ISO date string for uniqueness suffix
 * @returns URL-safe slug (never empty)
 */
export function generateSlug(claim: string, date?: string): string {
  // Generate base slug from claim text
  const baseSlug = claim
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  // If slug is empty (punctuation-only input), use fallback
  if (!baseSlug) {
    const dateSuffix = date ? `-${date.replace(/-/g, '')}` : `-${Date.now()}`
    return `claim${dateSuffix}`
  }

  // Add date suffix for uniqueness if provided
  if (date) {
    // Extract YYYYMMDD for compact suffix
    const dateCompact = date.replace(/-/g, '').slice(0, 8)
    return `${baseSlug}-${dateCompact}`.slice(0, 80)
  }

  return baseSlug
}
