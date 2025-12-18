#!/usr/bin/env node
/**
 * Parse Epoch AI data and generate TypeScript data file for visualization.
 *
 * Usage: node scripts/parse-epoch-data.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EPOCH_DIR = join(__dirname, '..', 'epoch_data')

// Parse CSV file
function parseCSV(filepath) {
  const content = readFileSync(filepath, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true })
}

// Get best score at each date (frontier envelope)
function computeFrontierEnvelope(records, dateField, scoreField) {
  // Filter records with valid dates and scores
  const valid = records.filter(r => r[dateField] && r[scoreField] && !isNaN(parseFloat(r[scoreField])))

  // Sort by date
  valid.sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]))

  // Compute running maximum (frontier)
  const frontier = []
  let maxScore = 0

  for (const record of valid) {
    const date = record[dateField]
    const score = parseFloat(record[scoreField])

    if (score > maxScore) {
      maxScore = score
      frontier.push({ date, value: score })
    }
  }

  return frontier
}

// Aggregate by month, taking max per month
function aggregateByMonth(points) {
  const byMonth = new Map()

  for (const p of points) {
    const d = new Date(p.date)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

    if (!byMonth.has(monthKey) || p.value > byMonth.get(monthKey)) {
      byMonth.set(monthKey, p.value)
    }
  }

  return Array.from(byMonth.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

// Get frontier model timeline (most notable model at each date)
function computeFrontierModelTimeline(records) {
  // Filter to records with valid dates and training compute
  const valid = records.filter(r =>
    r['Publication date'] &&
    r['Model'] &&
    r['Training compute (FLOP)'] &&
    !isNaN(parseFloat(r['Training compute (FLOP)']))
  )

  // Sort by date
  valid.sort((a, b) => new Date(a['Publication date']) - new Date(b['Publication date']))

  // Track frontier - each time a model beats the previous max compute
  const timeline = []
  let maxCompute = 0

  for (const record of valid) {
    const compute = parseFloat(record['Training compute (FLOP)'])

    if (compute > maxCompute) {
      maxCompute = compute
      timeline.push({
        date: record['Publication date'],
        model: record['Model'],
        compute: compute,
        org: record['Organization'] || 'Unknown'
      })
    }
  }

  return timeline
}

// Main
async function main() {
  console.log('Parsing Epoch AI data...')

  // 1. Parse MMLU data for capability frontier
  const mmluPath = join(EPOCH_DIR, 'AI Trajectory Benchmark Data', 'mmlu_external.csv')
  const mmluRecords = parseCSV(mmluPath)
  console.log(`  MMLU records: ${mmluRecords.length}`)

  const mmluFrontier = computeFrontierEnvelope(mmluRecords, 'Release date', 'EM')
  console.log(`  MMLU frontier points: ${mmluFrontier.length}`)

  // 2. Parse ECI for composite capability index
  const eciPath = join(EPOCH_DIR, 'AI Trajectory Benchmark Data', 'epoch_capabilities_index.csv')
  const eciRecords = parseCSV(eciPath)
  console.log(`  ECI records: ${eciRecords.length}`)

  const eciFrontier = computeFrontierEnvelope(eciRecords, 'Release date', 'ECI Score')
  console.log(`  ECI frontier points: ${eciFrontier.length}`)

  // 3. Parse notable models for training compute
  const modelsPath = join(EPOCH_DIR, 'AI Models', 'notable_ai_models.csv')
  const modelRecords = parseCSV(modelsPath)
  console.log(`  Notable model records: ${modelRecords.length}`)

  // 3b. Parse all models for frontier timeline (more complete than frontier_ai_models.csv)
  const allModelsPath = join(EPOCH_DIR, 'AI Models', 'all_ai_models.csv')
  const allModelRecords = parseCSV(allModelsPath)
  console.log(`  All model records: ${allModelRecords.length}`)

  // Filter to frontier-quality models (marked frontier OR very high compute)
  const frontierModelRecords = allModelRecords.filter(r => {
    const compute = parseFloat(r['Training compute (FLOP)'])
    const isFrontier = r['Frontier model']?.toLowerCase() === 'true' || r['Frontier model'] === '1'
    return (compute > 1e25 || isFrontier) && r['Publication date']
  })
  console.log(`  Frontier-quality records: ${frontierModelRecords.length}`)

  // Compute frontier model timeline (who was on top when)
  const modelTimeline = computeFrontierModelTimeline(frontierModelRecords)
  console.log(`  Model timeline entries: ${modelTimeline.length}`)

  // Get training compute frontier (log scale makes sense here)
  const computeFrontier = computeFrontierEnvelope(modelRecords, 'Publication date', 'Training compute (FLOP)')
    .map(p => ({ date: p.date, value: Math.log10(p.value) })) // Convert to log10
  console.log(`  Compute frontier points: ${computeFrontier.length}`)

  // 4. Parse ML hardware for peak performance
  const hwPath = join(EPOCH_DIR, 'AI Hardware Data', 'ml_hardware.csv')
  const hwRecords = parseCSV(hwPath)
  console.log(`  Hardware records: ${hwRecords.length}`)

  // Aggregate monthly for cleaner visualization
  const mmluMonthly = aggregateByMonth(mmluFrontier)
  const eciMonthly = aggregateByMonth(eciFrontier)
  const computeMonthly = aggregateByMonth(computeFrontier)

  // Generate TypeScript output
  // P1.1 fix: Write to ai-metrics.generated.ts to protect handwritten helpers in ai-metrics.ts
  const output = `/**
 * AI Progress Metrics - Generated from Epoch AI data
 * Source: https://epoch.ai/data
 * Generated: ${new Date().toISOString().split('T')[0]}
 *
 * DO NOT EDIT MANUALLY - regenerate with: node scripts/parse-epoch-data.mjs
 *
 * P1.1: This file is auto-generated. Handwritten helpers are in ai-metrics.ts
 */

export interface MetricDataPoint {
  date: string
  value: number
}

export interface AIMetricSeries {
  id: string
  label: string
  color: string
  unit: string
  data: MetricDataPoint[]
}

/**
 * MMLU Benchmark Frontier
 * Best MMLU score achieved at each point in time.
 * Shows capability progress on a standardized benchmark.
 */
export const mmluFrontier: AIMetricSeries = {
  id: 'mmlu',
  label: 'MMLU Score',
  color: 'rgb(234, 179, 8)', // Amber
  unit: '%',
  data: ${JSON.stringify(mmluMonthly.map(p => ({ date: p.date, value: Math.round(p.value * 1000) / 10 })), null, 4).replace(/\n/g, '\n  ')},
}

/**
 * Epoch Capabilities Index (ECI) Frontier
 * Composite capability score from Epoch AI.
 * Higher is better - tracks overall AI capability.
 */
export const eciFrontier: AIMetricSeries = {
  id: 'eci',
  label: 'Epoch Capability Index',
  color: 'rgb(99, 102, 241)', // Indigo
  unit: 'ECI',
  data: ${JSON.stringify(eciMonthly.map(p => ({ date: p.date, value: Math.round(p.value * 10) / 10 })), null, 4).replace(/\n/g, '\n  ')},
}

/**
 * Training Compute Frontier (log10 FLOP)
 * Maximum training compute used by frontier models.
 * Shows exponential scaling of AI training.
 */
export const trainingComputeFrontier: AIMetricSeries = {
  id: 'compute',
  label: 'Training Compute',
  color: 'rgb(118, 185, 0)', // Green
  unit: 'log₁₀ FLOP',
  data: ${JSON.stringify(computeMonthly.map(p => ({ date: p.date, value: Math.round(p.value * 10) / 10 })), null, 4).replace(/\n/g, '\n  ')},
}

/**
 * All metric series for visualization
 */
export const allMetrics: AIMetricSeries[] = [mmluFrontier, eciFrontier, trainingComputeFrontier]

/**
 * Frontier model timeline - which model was the frontier at each date
 * Based on training compute from Epoch's frontier_ai_models.csv
 */
export interface FrontierModelEntry {
  /** Date this model became the frontier */
  date: string
  /** Model name */
  model: string
  /** Organization that created the model */
  org: string
}

export const frontierModelTimeline: FrontierModelEntry[] = ${JSON.stringify(
  modelTimeline.map(m => ({ date: m.date, model: m.model, org: m.org })),
  null,
  2
)}

/**
 * Get the frontier model at a specific date
 * Returns the most recent model that was released on or before the given date
 */
export function getFrontierModelAtDate(date: Date): FrontierModelEntry | null {
  const dateStr = date.toISOString().slice(0, 10)
  let result: FrontierModelEntry | null = null

  for (const entry of frontierModelTimeline) {
    if (entry.date <= dateStr) {
      result = entry
    } else {
      break
    }
  }

  return result
}

/**
 * Get interpolated value for a metric at a specific date
 */
export function getMetricValueAtDate(series: AIMetricSeries, date: Date): number {
  const targetTime = date.getTime()
  const points = series.data

  for (let i = 0; i < points.length - 1; i++) {
    const startTime = new Date(points[i].date).getTime()
    const endTime = new Date(points[i + 1].date).getTime()

    if (targetTime >= startTime && targetTime <= endTime) {
      const ratio = (targetTime - startTime) / (endTime - startTime)
      return points[i].value + ratio * (points[i + 1].value - points[i].value)
    }
  }

  if (targetTime < new Date(points[0].date).getTime()) {
    return points[0].value
  }
  return points[points.length - 1].value
}

/**
 * Normalize value to 0-1 range based on series min/max
 */
export function normalizeMetricValue(series: AIMetricSeries, value: number): number {
  const values = series.data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return (value - min) / (max - min)
}

/**
 * Get normalized value (0-1) for a metric at a specific date
 */
export function getNormalizedMetricAtDate(series: AIMetricSeries, date: Date): number {
  const value = getMetricValueAtDate(series, date)
  return normalizeMetricValue(series, value)
}
`

  // P1.1 fix: Write to generated file to protect handwritten helpers
  const outPath = join(__dirname, '..', 'src', 'data', 'ai-metrics.generated.ts')
  writeFileSync(outPath, output)
  console.log(`\nWrote ${outPath}`)
  console.log('Note: Handwritten helpers are safe in ai-metrics.ts')

  // Print date ranges
  console.log('\nDate ranges:')
  console.log(`  MMLU: ${mmluMonthly[0]?.date} to ${mmluMonthly[mmluMonthly.length - 1]?.date}`)
  console.log(`  ECI: ${eciMonthly[0]?.date} to ${eciMonthly[eciMonthly.length - 1]?.date}`)
  console.log(`  Compute: ${computeMonthly[0]?.date} to ${computeMonthly[computeMonthly.length - 1]?.date}`)
}

main().catch(console.error)
