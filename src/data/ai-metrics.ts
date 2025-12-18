/**
 * AI Progress Metrics
 *
 * P1.1 fix: This file re-exports generated data and contains handwritten helpers.
 * The generator script (scripts/parse-epoch-data.mjs) only writes to ai-metrics.generated.ts,
 * so handwritten helpers here are safe from being overwritten.
 */

import { logToFlop } from '@/lib/utils/scales'
import type { MetricType } from '@/types/metrics'

// Re-export everything from generated file
export {
  mmluFrontier,
  eciFrontier,
  trainingComputeFrontier,
  allMetrics,
  getMetricValueAtDate,
  normalizeMetricValue,
  getNormalizedMetricAtDate,
  frontierModelTimeline,
  getFrontierModelAtDate,
  type MetricDataPoint,
  type AIMetricSeries,
  type FrontierModelEntry,
} from './ai-metrics.generated'

// Re-export MetricType for convenience
export type { MetricType }

// Import what we need for helpers
import {
  trainingComputeFrontier,
  mmluFrontier,
  eciFrontier,
  getMetricValueAtDate,
  type AIMetricSeries,
  type MetricDataPoint,
} from './ai-metrics.generated'

// =============================================================================
// AI Metrics Helpers for Log Scale Y-Axis (Story TSR-2.2)
// These are HANDWRITTEN helpers that must not be overwritten by the generator
// =============================================================================

/**
 * Get actual FLOP value (not log) at a date from training compute series.
 * Uses existing getMetricValueAtDate for interpolation, then converts from log.
 *
 * @param series - Must be trainingComputeFrontier (other series not in FLOP)
 * @param date - Target date
 * @returns Actual FLOP value (e.g., 1e24)
 *
 * @example
 * const date = new Date('2023-03-01')
 * const flop = getActualFlopAtDate(trainingComputeFrontier, date)
 * // Returns ~10^25.3 FLOP
 */
export function getActualFlopAtDate(series: AIMetricSeries, date: Date): number {
  const logValue = getMetricValueAtDate(series, date)
  return logToFlop(logValue)
}

/**
 * Filter metric data points to those within a year range.
 * Inclusive of start and end years.
 *
 * @param series - Any metric series
 * @param startYear - Start year (inclusive)
 * @param endYear - End year (inclusive)
 * @returns Filtered data points
 *
 * @example
 * const filtered = filterMetricsByDateRange(trainingComputeFrontier, 2020, 2023)
 * // Returns only points from 2020-2023
 */
export function filterMetricsByDateRange(
  series: AIMetricSeries,
  startYear: number,
  endYear: number
): MetricDataPoint[] {
  return series.data.filter(point => {
    const year = new Date(point.date).getFullYear()
    return year >= startYear && year <= endYear
  })
}

/**
 * Get Y-axis domain (actual FLOP values) for training compute within date range.
 * Adds 1 order of magnitude padding on each end for visual breathing room.
 *
 * @param series - Training compute series (values are log10 FLOP)
 * @param startYear - Start year
 * @param endYear - End year
 * @returns [minFlop, maxFlop] suitable for log scale domain
 *
 * @example
 * const [min, max] = getMetricDomain(trainingComputeFrontier, 2020, 2023)
 * // Returns domain with padding, e.g., [10^22, 10^26.3]
 */
export function getMetricDomain(
  series: AIMetricSeries,
  startYear: number,
  endYear: number
): [number, number] {
  const filtered = filterMetricsByDateRange(series, startYear, endYear)

  if (filtered.length === 0) {
    // Fallback to full series range
    const values = series.data.map(d => d.value)
    const minLog = Math.min(...values)
    const maxLog = Math.max(...values)
    return [logToFlop(minLog - 1), logToFlop(maxLog + 1)]
  }

  const values = filtered.map(d => d.value)
  const minLog = Math.min(...values)
  const maxLog = Math.max(...values)

  // Add 1 order of magnitude padding
  return [logToFlop(minLog - 1), logToFlop(maxLog + 1)]
}

/**
 * Get unified Y-axis domain encompassing all enabled metrics.
 * For now, only training compute affects the FLOP domain.
 * MMLU and ECI will need secondary Y-axis or overlay treatment (Epic 4).
 *
 * @param enabledMetrics - Array of enabled metric types
 * @param startYear - Start year
 * @param endYear - End year
 * @returns [minFlop, maxFlop] domain for log Y-axis
 *
 * @example
 * const [min, max] = getUnifiedDomain(['compute', 'mmlu'], 2020, 2025)
 * // Returns domain based on compute metric
 */
export function getUnifiedDomain(
  enabledMetrics: MetricType[],
  startYear: number,
  endYear: number
): [number, number] {
  // Training compute is the primary metric for FLOP Y-axis
  if (enabledMetrics.includes('compute')) {
    return getMetricDomain(trainingComputeFrontier, startYear, endYear)
  }

  // Default domain if no compute metric enabled
  // Covers typical AI progress range (10^17 to 10^27)
  return [1e17, 1e27]
}

/**
 * Get metric series by type identifier.
 * Useful for dynamic metric selection.
 *
 * @param metricType - The metric type identifier
 * @returns The corresponding AIMetricSeries
 *
 * @example
 * const series = getMetricSeries('compute')
 * // Returns trainingComputeFrontier
 */
export function getMetricSeries(metricType: MetricType): AIMetricSeries {
  switch (metricType) {
    case 'compute':
      return trainingComputeFrontier
    case 'mmlu':
      return mmluFrontier
    case 'eci':
      return eciFrontier
  }
}

/**
 * Check if a metric type uses FLOP scale (vs percentage or index).
 * Used to determine which metrics affect the Y-axis domain.
 *
 * @param metricType - The metric type to check
 * @returns true if metric is in FLOP scale (only 'compute')
 *
 * @example
 * isFlopMetric('compute') // true
 * isFlopMetric('mmlu')    // false
 */
export function isFlopMetric(metricType: MetricType): boolean {
  return metricType === 'compute'
}

/**
 * Get the maximum year from the training compute frontier data.
 * Used to dynamically set URL state bounds.
 *
 * @returns The year of the most recent data point (e.g., 2025)
 */
export function getMaxDataYear(): number {
  const lastPoint = trainingComputeFrontier.data.at(-1)
  if (lastPoint) {
    return new Date(lastPoint.date).getFullYear()
  }
  // Fallback if data is empty (shouldn't happen)
  return new Date().getFullYear()
}

/**
 * Get the minimum year from the training compute frontier data.
 *
 * @returns The year of the earliest data point
 */
export function getMinDataYear(): number {
  const firstPoint = trainingComputeFrontier.data[0]
  if (firstPoint) {
    return new Date(firstPoint.date).getFullYear()
  }
  return 1950
}
