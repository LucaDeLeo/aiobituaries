import { describe, it, expect } from 'vitest'
import {
  getActualFlopAtDate,
  filterMetricsByDateRange,
  getMetricDomain,
  getUnifiedDomain,
  getMetricSeries,
  isFlopMetric,
  getAllMetricsAtDate,
  getCurrentMetrics,
  trainingComputeFrontier,
  mmluFrontier,
  eciFrontier,
  type AIMetricSeries,
} from '@/data/ai-metrics'

describe('AI Metrics Helpers', () => {
  describe('getActualFlopAtDate', () => {
    it('returns correct FLOP for known data point', () => {
      // trainingComputeFrontier has { date: "2023-03-01", value: 25.3 }
      const date = new Date('2023-03-01')
      const flop = getActualFlopAtDate(trainingComputeFrontier, date)
      expect(flop).toBeCloseTo(Math.pow(10, 25.3), 5)
    })

    it('interpolates between data points', () => {
      // Between "2022-04-01" (24.4) and "2023-03-01" (25.3)
      const date = new Date('2022-10-01')
      const flop = getActualFlopAtDate(trainingComputeFrontier, date)
      expect(flop).toBeGreaterThan(Math.pow(10, 24.4))
      expect(flop).toBeLessThan(Math.pow(10, 25.3))
    })

    it('returns first value for date before series start', () => {
      const date = new Date('1940-01-01')
      const flop = getActualFlopAtDate(trainingComputeFrontier, date)
      // First data point: { date: "1950-07-01", value: 1.6 }
      expect(flop).toBeCloseTo(Math.pow(10, 1.6), 5)
    })

    it('returns last value for date after series end', () => {
      const date = new Date('2030-01-01')
      const flop = getActualFlopAtDate(trainingComputeFrontier, date)
      // Last data point: { date: "2025-07-01", value: 26.7 }
      expect(flop).toBeCloseTo(Math.pow(10, 26.7), 5)
    })
  })

  describe('filterMetricsByDateRange', () => {
    it('filters correctly within range', () => {
      const filtered = filterMetricsByDateRange(trainingComputeFrontier, 2020, 2022)
      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach(point => {
        const year = new Date(point.date).getFullYear()
        expect(year).toBeGreaterThanOrEqual(2020)
        expect(year).toBeLessThanOrEqual(2022)
      })
    })

    it('includes boundary years (inclusive)', () => {
      // 2020-01-01 and 2020-05-01 are in trainingComputeFrontier
      const filtered = filterMetricsByDateRange(trainingComputeFrontier, 2020, 2020)
      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.every(p => new Date(p.date).getFullYear() === 2020)).toBe(true)
    })

    it('returns empty array for out-of-range years', () => {
      const filtered = filterMetricsByDateRange(trainingComputeFrontier, 2100, 2150)
      expect(filtered).toEqual([])
    })

    it('handles empty series gracefully', () => {
      const emptySeries: AIMetricSeries = {
        id: 'test',
        label: 'Test',
        color: 'rgb(0,0,0)',
        unit: 'test',
        data: [],
      }
      const filtered = filterMetricsByDateRange(emptySeries, 2020, 2025)
      expect(filtered).toEqual([])
    })

    it('works with MMLU series', () => {
      const filtered = filterMetricsByDateRange(mmluFrontier, 2023, 2024)
      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach(point => {
        const year = new Date(point.date).getFullYear()
        expect(year).toBeGreaterThanOrEqual(2023)
        expect(year).toBeLessThanOrEqual(2024)
      })
    })
  })

  describe('getMetricDomain', () => {
    it('returns padded domain for date range', () => {
      const [min, max] = getMetricDomain(trainingComputeFrontier, 2020, 2023)
      // Data range 2020-2023: ~23.0 to ~25.3, so domain should be ~10^22 to ~10^26.3
      expect(min).toBeLessThan(1e23)
      expect(max).toBeGreaterThan(1e25)
    })

    it('adds 1 order of magnitude padding', () => {
      // Filter data to get exact min/max from source
      const filtered = filterMetricsByDateRange(trainingComputeFrontier, 2022, 2023)
      const values = filtered.map(d => d.value)
      const minLog = Math.min(...values)
      const maxLog = Math.max(...values)

      const [min, max] = getMetricDomain(trainingComputeFrontier, 2022, 2023)

      // Verify 1 order of magnitude padding is applied
      expect(min).toBeCloseTo(Math.pow(10, minLog - 1), 5)
      expect(max).toBeCloseTo(Math.pow(10, maxLog + 1), 5)
    })

    it('falls back to full series range for empty filter', () => {
      const [min, max] = getMetricDomain(trainingComputeFrontier, 2100, 2150)
      // Should fall back to full range: 1.6 to 26.7
      // With padding: 10^0.6 to 10^27.7
      expect(min).toBeCloseTo(Math.pow(10, 0.6), 0)
      expect(max).toBeCloseTo(Math.pow(10, 27.7), 0)
    })
  })

  describe('getUnifiedDomain', () => {
    it('returns compute domain when compute is enabled', () => {
      const [min, max] = getUnifiedDomain(['compute', 'mmlu'], 2020, 2023)
      // Should use compute metric's domain
      const [computeMin, computeMax] = getMetricDomain(trainingComputeFrontier, 2020, 2023)
      expect(min).toBe(computeMin)
      expect(max).toBe(computeMax)
    })

    it('returns default domain without compute', () => {
      const [min, max] = getUnifiedDomain(['mmlu', 'eci'], 2020, 2025)
      expect(min).toBe(1e17)
      expect(max).toBe(1e27)
    })

    it('returns default domain with empty metrics array', () => {
      const [min, max] = getUnifiedDomain([], 2020, 2025)
      expect(min).toBe(1e17)
      expect(max).toBe(1e27)
    })

    it('returns compute domain when only compute is enabled', () => {
      const [min, max] = getUnifiedDomain(['compute'], 2020, 2023)
      const [computeMin, computeMax] = getMetricDomain(trainingComputeFrontier, 2020, 2023)
      expect(min).toBe(computeMin)
      expect(max).toBe(computeMax)
    })
  })

  describe('getMetricSeries', () => {
    it('returns trainingComputeFrontier for compute', () => {
      const series = getMetricSeries('compute')
      expect(series).toBe(trainingComputeFrontier)
      expect(series.id).toBe('compute')
    })

    it('returns mmluFrontier for mmlu', () => {
      const series = getMetricSeries('mmlu')
      expect(series).toBe(mmluFrontier)
      expect(series.id).toBe('mmlu')
    })

    it('returns eciFrontier for eci', () => {
      const series = getMetricSeries('eci')
      expect(series).toBe(eciFrontier)
      expect(series.id).toBe('eci')
    })
  })

  describe('isFlopMetric', () => {
    it('returns true for compute', () => {
      expect(isFlopMetric('compute')).toBe(true)
    })

    it('returns false for mmlu', () => {
      expect(isFlopMetric('mmlu')).toBe(false)
    })

    it('returns false for eci', () => {
      expect(isFlopMetric('eci')).toBe(false)
    })
  })

  describe('getAllMetricsAtDate (Skeptic Pages)', () => {
    it('returns all metrics for recent date', () => {
      const date = new Date('2024-06-01')
      const metrics = getAllMetricsAtDate(date)

      expect(metrics.mmlu).not.toBeNull()
      expect(metrics.eci).not.toBeNull()
      expect(metrics.compute).toBeGreaterThan(0)
      expect(metrics.computeFormatted).toMatch(/^10\^\d+\.\d$/)
    })

    it('returns null mmlu for dates before Aug 2021', () => {
      const date = new Date('2021-01-15')
      const metrics = getAllMetricsAtDate(date)

      expect(metrics.mmlu).toBeNull()
      expect(metrics.compute).toBeGreaterThan(0)
    })

    it('returns null eci for dates before Feb 2023', () => {
      const date = new Date('2022-12-01')
      const metrics = getAllMetricsAtDate(date)

      expect(metrics.mmlu).not.toBeNull() // MMLU available
      expect(metrics.eci).toBeNull() // ECI not yet available
      expect(metrics.compute).toBeGreaterThan(0)
    })

    it('formats compute correctly', () => {
      const date = new Date('2023-03-01')
      const metrics = getAllMetricsAtDate(date)

      // Compute at 2023-03-01 is 25.3
      expect(metrics.computeFormatted).toBe('10^25.3')
      expect(metrics.compute).toBeCloseTo(25.3, 1)
    })

    it('rounds values to 1 decimal place', () => {
      const date = new Date('2024-01-15')
      const metrics = getAllMetricsAtDate(date)

      if (metrics.mmlu !== null) {
        expect(metrics.mmlu.toString()).toMatch(/^\d+(\.\d)?$/)
      }
      if (metrics.eci !== null) {
        expect(metrics.eci.toString()).toMatch(/^\d+(\.\d)?$/)
      }
      expect(metrics.compute.toString()).toMatch(/^\d+(\.\d)?$/)
    })

    it('handles very old dates (compute always available)', () => {
      const date = new Date('1980-01-01')
      const metrics = getAllMetricsAtDate(date)

      expect(metrics.mmlu).toBeNull()
      expect(metrics.eci).toBeNull()
      expect(metrics.compute).toBeGreaterThan(0)
      expect(metrics.computeFormatted).toBeDefined()
    })
  })

  describe('getCurrentMetrics', () => {
    it('returns non-null values for all metrics', () => {
      const metrics = getCurrentMetrics()

      expect(metrics.mmlu).not.toBeNull()
      expect(metrics.eci).not.toBeNull()
      expect(metrics.compute).toBeGreaterThan(0)
      expect(metrics.computeFormatted).toBeDefined()
    })

    it('returns recent MMLU values (should be high)', () => {
      const metrics = getCurrentMetrics()
      // Current MMLU should be above 85%
      expect(metrics.mmlu).toBeGreaterThan(85)
    })

    it('returns recent ECI values', () => {
      const metrics = getCurrentMetrics()
      // Current ECI should be above 140
      expect(metrics.eci).toBeGreaterThan(140)
    })
  })
})
