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

// =============================================================================
// P1.3 Performance Fix: Optimized Metric Lookup with Precomputed Timestamps
// =============================================================================

/**
 * Cache for precomputed timestamp arrays per series.
 * Avoids O(n) Date parsing on every lookup.
 */
const timestampCache = new WeakMap<{ data: { date: string }[] }, number[]>()

/**
 * Get or create cached timestamp array for a metric series.
 * Uses WeakMap keyed by series object reference for automatic cleanup.
 */
function getTimestamps(series: { data: { date: string }[] }): number[] {
  let cached = timestampCache.get(series)
  if (!cached) {
    cached = series.data.map(d => new Date(d.date).getTime())
    timestampCache.set(series, cached)
  }
  return cached
}

/**
 * Binary search to find the interval containing targetTime.
 * Returns index of the point just before or at targetTime.
 *
 * @returns Index where timestamps[index] <= targetTime < timestamps[index+1],
 *          or -1 if before first point, or length-1 if at/after last point.
 */
function findInterval(timestamps: number[], targetTime: number): number {
  if (targetTime <= timestamps[0]) return -1
  if (targetTime >= timestamps[timestamps.length - 1]) return timestamps.length - 1

  let lo = 0
  let hi = timestamps.length - 1

  while (lo < hi - 1) {
    const mid = (lo + hi) >>> 1
    if (timestamps[mid] <= targetTime) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return lo
}

/**
 * Optimized version of getMetricValueAtDate using binary search.
 * O(log n) time complexity with O(1) amortized timestamp caching.
 *
 * @param series - Any metric series
 * @param date - Target date
 * @returns Interpolated value at the date
 */
export function getMetricValueAtDateFast(series: AIMetricSeries, date: Date): number {
  const timestamps = getTimestamps(series)
  const targetTime = date.getTime()
  const points = series.data

  const idx = findInterval(timestamps, targetTime)

  // Before first point - return first value
  if (idx === -1) return points[0].value

  // At or after last point - return last value
  if (idx === points.length - 1) return points[points.length - 1].value

  // Interpolate between idx and idx+1
  const startTime = timestamps[idx]
  const endTime = timestamps[idx + 1]
  const ratio = (targetTime - startTime) / (endTime - startTime)
  return points[idx].value + ratio * (points[idx + 1].value - points[idx].value)
}

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
 * Uses optimized getMetricValueAtDateFast for O(log n) interpolation,
 * then converts from log.
 *
 * P1.3 fix: Uses binary search with cached timestamps instead of linear scan.
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
  const logValue = getMetricValueAtDateFast(series, date)
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
    case 'arcagi':
      return mmluFrontier // mmluFrontier is aliased to arcagiFrontier
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

// =============================================================================
// Skeptic Page Helpers (Notable Skeptics Feature)
// =============================================================================

import type { MetricsSnapshot } from '@/types/skeptic'

/**
 * Get all three AI metrics (MMLU, ECI, Compute) at a specific date.
 * Returns null for metrics that don't have data before their start date.
 *
 * @param date - Target date to get metrics for
 * @returns MetricsSnapshot with all three metrics and formatted compute
 *
 * Metric availability:
 * - Compute: Always available (data from 1950)
 * - MMLU: Available from Aug 2021
 * - ECI: Available from Feb 2023
 *
 * @example
 * const metrics = getAllMetricsAtDate(new Date('2022-03-15'))
 * // Returns: { mmlu: 67.2, compute: 24.4, computeFormatted: "10^24.4", eci: null }
 */
export function getAllMetricsAtDate(date: Date): MetricsSnapshot {
  // MMLU data starts Aug 2021
  const mmluStart = new Date('2021-08-01')
  const mmlu = date >= mmluStart ? getMetricValueAtDate(mmluFrontier, date) : null

  // ECI data starts Feb 2023
  const eciStart = new Date('2023-02-01')
  const eci = date >= eciStart ? getMetricValueAtDate(eciFrontier, date) : null

  // Compute is always available (from 1950)
  const compute = getMetricValueAtDate(trainingComputeFrontier, date)
  const computeFormatted = `10^${compute.toFixed(1)}`

  return {
    mmlu: mmlu !== null ? Math.round(mmlu * 10) / 10 : null, // Round to 1 decimal
    eci: eci !== null ? Math.round(eci * 10) / 10 : null,
    compute: Math.round(compute * 10) / 10,
    computeFormatted,
  }
}

/**
 * Get the latest/current AI metrics.
 * Uses today's date to get the most recent available values.
 *
 * @returns MetricsSnapshot with current values for all metrics
 *
 * @example
 * const current = getCurrentMetrics()
 * // Returns: { mmlu: 88.1, compute: 26.7, computeFormatted: "10^26.7", eci: 154.4 }
 */
export function getCurrentMetrics(): MetricsSnapshot {
  return getAllMetricsAtDate(new Date())
}
