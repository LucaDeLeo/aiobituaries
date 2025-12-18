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
} from '@/data/ai-metrics'
import type { ContextMetadata } from '@/types/context'

/**
 * Timeline of notable AI models for enrichment
 * Maps date ranges to the leading model at that time
 */
const MODEL_TIMELINE: Array<{ until: string; model: string }> = [
  // `until` = last day this model was the frontier, date <= until returns this model
  { until: '2020-06-10', model: 'GPT-3' }, // GPT-3 released Jun 11, 2020
  { until: '2022-11-29', model: 'GPT-3' }, // ChatGPT (GPT-3.5) released Nov 30, 2022
  { until: '2023-03-13', model: 'GPT-3.5' }, // GPT-4 released Mar 14, 2023
  { until: '2023-11-05', model: 'GPT-4' }, // GPT-4 Turbo released Nov 6, 2023
  { until: '2024-05-12', model: 'GPT-4 Turbo' }, // GPT-4o released May 13, 2024
  { until: '2024-09-11', model: 'GPT-4o' }, // o1 released Sep 12, 2024
  { until: '2024-12-04', model: 'o1' }, // o1 Pro released Dec 5, 2024
  { until: '2025-01-19', model: 'o1 Pro' }, // DeepSeek R1 released Jan 20, 2025
  { until: '2099-12-31', model: 'DeepSeek R1' }, // Current frontier
]

/**
 * Get the leading AI model at a given date
 *
 * @param date - The date to check
 * @returns Name of the leading model at that time
 */
export function getModelAtDate(date: Date): string {
  const dateStr = date.toISOString().slice(0, 10)

  for (const { until, model } of MODEL_TIMELINE) {
    if (dateStr <= until) {
      return model
    }
  }

  return 'Unknown'
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
 * Generate a slug from claim text
 *
 * @param claim - The claim text
 * @returns URL-safe slug
 */
export function generateSlug(claim: string): string {
  return claim
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}
