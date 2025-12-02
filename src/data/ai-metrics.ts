/**
 * AI Progress Metrics - Generated from Epoch AI data
 * Source: https://epoch.ai/data
 * Generated: 2025-12-02
 *
 * DO NOT EDIT MANUALLY - regenerate with: node scripts/parse-epoch-data.mjs
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
