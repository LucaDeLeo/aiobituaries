/**
 * Metric Configuration System
 *
 * Provides per-metric scale domains, tick values, and formatters
 * for dynamic Y-axis switching with animation support.
 *
 * Each metric has:
 * - domain: [min, max] for scale construction (computed from data with headroom)
 * - tickValues: Array of nice tick marks to display
 * - formatTick: Function to format tick values as labels
 * - label: Y-axis label text
 * - dataStartDate: When this metric's data begins (for availability checks)
 */

import type { MetricType } from '@/types/metrics'
import {
  metrFrontier,
  trainingComputeFrontier,
  eciFrontier,
  arcagiFrontier,
  mmluFrontier,
  type AIMetricSeries,
} from '@/data/ai-metrics.generated'

/**
 * Configuration for a single metric's Y-axis behavior
 */
export interface MetricConfig {
  /** Metric type identifier */
  id: MetricType
  /** The underlying data series */
  series: AIMetricSeries
  /** [min, max] domain for Y scale */
  domain: [number, number]
  /** Tick values to display on Y-axis */
  tickValues: number[]
  /** Format function for tick labels */
  formatTick: (value: number) => string
  /** Y-axis label text */
  label: string
  /** Date when this metric's data starts (for availability checks) */
  dataStartDate: Date
}

/**
 * Compute domain from data with headroom (10% padding on max)
 * Per tech spec: [min, max * 1.1] with nice rounding
 */
function computeDomainFromData(
  series: AIMetricSeries,
  floorMin: number = 0
): [number, number] {
  const values = series.data.map(d => d.value)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)

  // Use floor for min (or 0 for percentage/minute metrics)
  const min = Math.max(floorMin, Math.floor(dataMin))
  // Add 10% headroom and round up to nice number
  const maxWithHeadroom = dataMax * 1.1
  const max = Math.ceil(maxWithHeadroom / 10) * 10

  return [min, max]
}

/**
 * Generate nice tick values for a domain
 */
function generateTickValues(
  domain: [number, number],
  targetCount: number = 6
): number[] {
  const [min, max] = domain
  const range = max - min
  const step = Math.ceil(range / targetCount / 10) * 10 // Round to nearest 10

  const ticks: number[] = []
  for (let v = min; v <= max; v += step) {
    ticks.push(v)
  }
  // Ensure max is included
  if (ticks[ticks.length - 1] < max) {
    ticks.push(max)
  }
  return ticks
}

/**
 * Format METR tick: "Xmin" or "Xhr Ymin" for large values
 */
function formatMetrTick(value: number): string {
  if (value === 0) return '0'
  const rounded = Math.round(value)
  if (rounded < 60) return `${rounded}min`
  const hours = Math.floor(rounded / 60)
  const mins = rounded % 60
  if (mins === 0) return `${hours}hr`
  return `${hours}hr ${mins}m`
}

/**
 * Format Compute tick: "10^X" with superscript
 */
function formatComputeTick(value: number): string {
  return `10^${Math.round(value)}`
}

/**
 * Format ECI tick: plain number
 */
function formatEciTick(value: number): string {
  return `${Math.round(value)}`
}

/**
 * Format ARC-AGI tick: "X%"
 */
function formatArcagiTick(value: number): string {
  return `${Math.round(value)}%`
}

// Compute domains from actual data at module load time
// This ensures domains always match the data
const metrDomain = computeDomainFromData(metrFrontier, 0)
const computeDomain: [number, number] = [
  Math.floor(Math.min(...trainingComputeFrontier.data.map(d => d.value))),
  Math.ceil(Math.max(...trainingComputeFrontier.data.map(d => d.value)) * 1.05),
]
// ECI: Start from actual data min (rounded down to nearest 10), not arbitrary 100
const eciDataMin = Math.min(...eciFrontier.data.map(d => d.value))
const eciDataMax = Math.max(...eciFrontier.data.map(d => d.value))
const eciDomain: [number, number] = [
  Math.floor(eciDataMin / 10) * 10, // Round down to nearest 10
  Math.ceil(eciDataMax * 1.1 / 10) * 10, // 10% headroom, round up
]
const arcagiDomain = computeDomainFromData(arcagiFrontier, 20)
// MMLU: percentage scores, floor at 20
const mmluDomain = computeDomainFromData(mmluFrontier, 20)

/**
 * Format MMLU tick: "X%"
 */
function formatMmluTick(value: number): string {
  return `${Math.round(value)}%`
}

/**
 * Metric configurations - domains computed from actual data
 */
export const METRIC_CONFIGS: Record<MetricType, MetricConfig> = {
  metr: {
    id: 'metr',
    series: metrFrontier,
    domain: metrDomain,
    tickValues: generateTickValues(metrDomain, 5),
    formatTick: formatMetrTick,
    label: 'Task Horizon (minutes)',
    dataStartDate: new Date('2019-11-01'),
  },
  mmlu: {
    id: 'mmlu',
    series: mmluFrontier,
    domain: mmluDomain,
    tickValues: [20, 40, 60, 80, 100].filter(
      v => v >= mmluDomain[0] && v <= mmluDomain[1]
    ),
    formatTick: formatMmluTick,
    label: 'MMLU Score (%)',
    dataStartDate: new Date('2021-08-01'),
  },
  compute: {
    id: 'compute',
    series: trainingComputeFrontier,
    domain: computeDomain,
    tickValues: Array.from(
      { length: Math.ceil((computeDomain[1] - computeDomain[0]) / 2) + 1 },
      (_, i) => computeDomain[0] + i * 2
    ).filter(v => v <= computeDomain[1]),
    formatTick: formatComputeTick,
    label: 'Training Compute (log₁₀ FLOP)',
    dataStartDate: new Date('1950-07-01'),
  },
  eci: {
    id: 'eci',
    series: eciFrontier,
    domain: eciDomain,
    tickValues: generateTickValues(eciDomain, 5),
    formatTick: formatEciTick,
    label: 'Epoch Capability Index',
    dataStartDate: new Date('2023-02-01'),
  },
  arcagi: {
    id: 'arcagi',
    series: arcagiFrontier,
    domain: arcagiDomain,
    // Filter tick values to domain - data starts at ~25.7%, so exclude 20
    tickValues: [20, 40, 60, 80, 100].filter(
      v => v >= arcagiDomain[0] && v <= arcagiDomain[1]
    ),
    formatTick: formatArcagiTick,
    label: 'ARC-AGI Score (%)',
    dataStartDate: new Date('2024-09-01'),
  },
}

/**
 * Get metric configuration by type
 */
export function getMetricConfig(metricType: MetricType): MetricConfig {
  return METRIC_CONFIGS[metricType]
}

/**
 * Get visible tick values that fit within a potentially clamped domain
 */
export function getVisibleTickValues(
  metricType: MetricType,
  domain: [number, number]
): number[] {
  const config = METRIC_CONFIGS[metricType]
  return config.tickValues.filter(v => v >= domain[0] && v <= domain[1])
}

/**
 * Check if a date is within a metric's data availability range
 */
export function isDateInMetricRange(metricType: MetricType, date: Date): boolean {
  const config = METRIC_CONFIGS[metricType]
  return date >= config.dataStartDate
}

/**
 * Get the Y value for an obituary date on a specific metric
 * Returns null if the metric has no data for that date
 */
export function getMetricYValue(
  metricType: MetricType,
  date: Date
): number | null {
  const config = METRIC_CONFIGS[metricType]

  // Return null if before data starts
  if (date < config.dataStartDate) {
    return null
  }

  // Use binary search for O(log n) lookup
  const series = config.series
  const targetTime = date.getTime()
  const points = series.data

  // Binary search for the interval
  let lo = 0
  let hi = points.length - 1

  const firstTime = new Date(points[0].date).getTime()
  const lastTime = new Date(points[hi].date).getTime()

  if (targetTime <= firstTime) return points[0].value
  if (targetTime >= lastTime) return points[hi].value

  while (lo < hi - 1) {
    const mid = (lo + hi) >>> 1
    const midTime = new Date(points[mid].date).getTime()
    if (midTime <= targetTime) {
      lo = mid
    } else {
      hi = mid
    }
  }

  // Interpolate between lo and hi (which is lo + 1)
  const startTime = new Date(points[lo].date).getTime()
  const endTime = new Date(points[lo + 1].date).getTime()
  const ratio = (targetTime - startTime) / (endTime - startTime)
  return points[lo].value + ratio * (points[lo + 1].value - points[lo].value)
}

// Re-export formatters for direct use
export { formatMetrTick, formatMmluTick, formatComputeTick, formatEciTick, formatArcagiTick }
