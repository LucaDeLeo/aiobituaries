/**
 * AI Progress Metrics - Generated from Epoch AI data
 * Source: https://epoch.ai/data
 * Generated: 2025-12-02
 *
 * DO NOT EDIT MANUALLY - regenerate with: node scripts/parse-epoch-data.mjs
 */

import { logToFlop } from '@/lib/utils/scales'
import type { MetricType } from '@/types/metrics'

// Re-export MetricType for convenience
export type { MetricType }

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
  data: [
      {
          "date": "2021-08-01",
          "value": 25.7
      },
      {
          "date": "2021-12-01",
          "value": 60
      },
      {
          "date": "2022-03-01",
          "value": 70
      },
      {
          "date": "2023-03-01",
          "value": 86.4
      },
      {
          "date": "2024-06-01",
          "value": 86.5
      },
      {
          "date": "2024-09-01",
          "value": 86.9
      },
      {
          "date": "2024-10-01",
          "value": 87.3
      },
      {
          "date": "2024-11-01",
          "value": 88.1
      }
  ],
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
  data: [
      {
          "date": "2023-02-01",
          "value": 109.8
      },
      {
          "date": "2023-03-01",
          "value": 125.9
      },
      {
          "date": "2024-02-01",
          "value": 126.5
      },
      {
          "date": "2024-04-01",
          "value": 127.1
      },
      {
          "date": "2024-05-01",
          "value": 128.5
      },
      {
          "date": "2024-06-01",
          "value": 130
      },
      {
          "date": "2024-07-01",
          "value": 130.5
      },
      {
          "date": "2024-09-01",
          "value": 138
      },
      {
          "date": "2024-12-01",
          "value": 142.8
      },
      {
          "date": "2025-03-01",
          "value": 145.2
      },
      {
          "date": "2025-04-01",
          "value": 147.5
      },
      {
          "date": "2025-06-01",
          "value": 148.1
      },
      {
          "date": "2025-08-01",
          "value": 150.7
      },
      {
          "date": "2025-10-01",
          "value": 151.1
      },
      {
          "date": "2025-11-01",
          "value": 154.4
      }
  ],
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
  data: [
      {
          "date": "1950-07-01",
          "value": 1.6
      },
      {
          "date": "1956-12-01",
          "value": 5.8
      },
      {
          "date": "1959-01-01",
          "value": 8.8
      },
      {
          "date": "1960-03-01",
          "value": 8.9
      },
      {
          "date": "1987-06-01",
          "value": 10.5
      },
      {
          "date": "1989-11-01",
          "value": 12.2
      },
      {
          "date": "1992-04-01",
          "value": 13.3
      },
      {
          "date": "1994-12-01",
          "value": 13.3
      },
      {
          "date": "1997-11-01",
          "value": 13.5
      },
      {
          "date": "2000-11-01",
          "value": 15.8
      },
      {
          "date": "2007-06-01",
          "value": 18.2
      },
      {
          "date": "2013-01-01",
          "value": 18.4
      },
      {
          "date": "2014-06-01",
          "value": 18.5
      },
      {
          "date": "2014-09-01",
          "value": 19.7
      },
      {
          "date": "2014-12-01",
          "value": 20.5
      },
      {
          "date": "2015-09-01",
          "value": 20.6
      },
      {
          "date": "2016-01-01",
          "value": 21.3
      },
      {
          "date": "2016-09-01",
          "value": 21.8
      },
      {
          "date": "2018-05-01",
          "value": 21.9
      },
      {
          "date": "2019-09-01",
          "value": 22.3
      },
      {
          "date": "2019-10-01",
          "value": 23
      },
      {
          "date": "2020-01-01",
          "value": 23
      },
      {
          "date": "2020-05-01",
          "value": 23.5
      },
      {
          "date": "2021-08-01",
          "value": 23.6
      },
      {
          "date": "2021-09-01",
          "value": 24.3
      },
      {
          "date": "2022-04-01",
          "value": 24.4
      },
      {
          "date": "2022-06-01",
          "value": 24.4
      },
      {
          "date": "2023-03-01",
          "value": 25.3
      },
      {
          "date": "2023-12-01",
          "value": 25.7
      },
      {
          "date": "2025-02-01",
          "value": 26.6
      },
      {
          "date": "2025-07-01",
          "value": 26.7
      }
  ],
}

/**
 * All metric series for visualization
 */
export const allMetrics: AIMetricSeries[] = [mmluFrontier, eciFrontier, trainingComputeFrontier]

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

// =============================================================================
// AI Metrics Helpers for Log Scale Y-Axis (Story TSR-2.2)
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
