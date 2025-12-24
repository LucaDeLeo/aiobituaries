/**
 * MetricConfig System Tests
 *
 * Tests for the dynamic metric configuration system that provides
 * per-metric scale domains, tick values, and formatters.
 */
import { describe, it, expect } from 'vitest'
import {
  METRIC_CONFIGS,
  getMetricConfig,
  getVisibleTickValues,
  isDateInMetricRange,
  getMetricYValue,
  formatMetrTick,
  formatComputeTick,
  formatEciTick,
  formatArcagiTick,
} from '@/lib/utils/metric-scales'
import type { MetricType } from '@/types/metrics'

describe('METRIC_CONFIGS', () => {
  it('contains all four metric types', () => {
    const metricTypes: MetricType[] = ['metr', 'compute', 'eci', 'arcagi']
    metricTypes.forEach((type) => {
      expect(METRIC_CONFIGS[type]).toBeDefined()
    })
  })

  it('each config has required properties', () => {
    Object.values(METRIC_CONFIGS).forEach((config) => {
      expect(config.id).toBeDefined()
      expect(config.series).toBeDefined()
      expect(config.domain).toHaveLength(2)
      expect(config.tickValues).toBeDefined()
      expect(config.tickValues.length).toBeGreaterThan(0)
      expect(typeof config.formatTick).toBe('function')
      expect(config.label).toBeDefined()
      expect(config.dataStartDate).toBeInstanceOf(Date)
    })
  })

  it('domains are computed from actual data with headroom', () => {
    // METR domain should start at 0 and include headroom above max
    expect(METRIC_CONFIGS.metr.domain[0]).toBe(0)
    expect(METRIC_CONFIGS.metr.domain[1]).toBeGreaterThan(288) // Max is ~289

    // ECI domain should not start at 100 (old hardcoded value)
    // Should start at rounded-down actual min (~109.8 -> 100)
    expect(METRIC_CONFIGS.eci.domain[0]).toBeLessThanOrEqual(110)

    // Compute domain should reflect log10 FLOP range
    expect(METRIC_CONFIGS.compute.domain[0]).toBeGreaterThanOrEqual(1)
    expect(METRIC_CONFIGS.compute.domain[1]).toBeLessThanOrEqual(30)
  })

  it('domains have min < max', () => {
    Object.values(METRIC_CONFIGS).forEach((config) => {
      expect(config.domain[0]).toBeLessThan(config.domain[1])
    })
  })

  it('tick values are within domain', () => {
    Object.values(METRIC_CONFIGS).forEach((config) => {
      config.tickValues.forEach((tick) => {
        expect(tick).toBeGreaterThanOrEqual(config.domain[0])
        expect(tick).toBeLessThanOrEqual(config.domain[1])
      })
    })
  })

  it('tick values are in ascending order', () => {
    Object.values(METRIC_CONFIGS).forEach((config) => {
      for (let i = 1; i < config.tickValues.length; i++) {
        expect(config.tickValues[i]).toBeGreaterThan(config.tickValues[i - 1])
      }
    })
  })
})

describe('getMetricConfig', () => {
  it('returns correct config for each metric type', () => {
    expect(getMetricConfig('metr').id).toBe('metr')
    expect(getMetricConfig('compute').id).toBe('compute')
    expect(getMetricConfig('eci').id).toBe('eci')
    expect(getMetricConfig('arcagi').id).toBe('arcagi')
  })

  it('returns same reference as METRIC_CONFIGS', () => {
    expect(getMetricConfig('metr')).toBe(METRIC_CONFIGS.metr)
    expect(getMetricConfig('compute')).toBe(METRIC_CONFIGS.compute)
  })
})

describe('getVisibleTickValues', () => {
  it('filters tick values to domain bounds', () => {
    const visible = getVisibleTickValues('metr', [50, 200])
    visible.forEach((tick) => {
      expect(tick).toBeGreaterThanOrEqual(50)
      expect(tick).toBeLessThanOrEqual(200)
    })
  })

  it('returns empty array when domain excludes all ticks', () => {
    // Using a domain that doesn't overlap with METR tick values
    const visible = getVisibleTickValues('metr', [1000, 2000])
    expect(visible).toHaveLength(0)
  })

  it('returns all ticks when domain encompasses entire range', () => {
    const config = METRIC_CONFIGS.metr
    const visible = getVisibleTickValues('metr', config.domain)
    expect(visible).toEqual(config.tickValues)
  })
})

describe('isDateInMetricRange', () => {
  it('returns true for dates after metric data starts', () => {
    // METR data starts 2019-11-01
    expect(isDateInMetricRange('metr', new Date('2023-01-01'))).toBe(true)
    // Compute data starts 1950
    expect(isDateInMetricRange('compute', new Date('2000-01-01'))).toBe(true)
    // ECI data starts 2023-02-01
    expect(isDateInMetricRange('eci', new Date('2024-01-01'))).toBe(true)
  })

  it('returns false for dates before metric data starts', () => {
    // ECI data starts 2023-02-01
    expect(isDateInMetricRange('eci', new Date('2022-01-01'))).toBe(false)
    // ARC-AGI data starts 2021-08-01
    expect(isDateInMetricRange('arcagi', new Date('2020-01-01'))).toBe(false)
  })
})

describe('getMetricYValue', () => {
  it('returns null for dates before metric data starts', () => {
    // ECI data starts 2023-02-01
    expect(getMetricYValue('eci', new Date('2022-01-01'))).toBeNull()
  })

  it('returns a number for dates within metric data range', () => {
    const value = getMetricYValue('metr', new Date('2024-01-01'))
    expect(value).not.toBeNull()
    expect(typeof value).toBe('number')
  })

  it('returns interpolated values between data points', () => {
    // METR should have increasing values over time
    const early = getMetricYValue('metr', new Date('2022-01-01'))
    const late = getMetricYValue('metr', new Date('2024-06-01'))

    expect(early).not.toBeNull()
    expect(late).not.toBeNull()
    expect(late!).toBeGreaterThan(early!)
  })

  it('returns value at or after last data point', () => {
    // Far future date should return last value
    const futureValue = getMetricYValue('metr', new Date('2030-01-01'))
    expect(futureValue).not.toBeNull()
    expect(typeof futureValue).toBe('number')
  })
})

describe('Tick Formatters', () => {
  describe('formatMetrTick', () => {
    it('formats 0 as "0"', () => {
      expect(formatMetrTick(0)).toBe('0')
    })

    it('formats minutes < 60 with "min" suffix', () => {
      expect(formatMetrTick(30)).toBe('30min')
      expect(formatMetrTick(45)).toBe('45min')
    })

    it('formats hours with "hr" suffix', () => {
      expect(formatMetrTick(60)).toBe('1hr')
      expect(formatMetrTick(120)).toBe('2hr')
    })

    it('formats hours and minutes correctly', () => {
      expect(formatMetrTick(90)).toBe('1hr 30m')
      expect(formatMetrTick(150)).toBe('2hr 30m')
    })

    it('rounds to nearest minute', () => {
      expect(formatMetrTick(59.6)).toBe('1hr')
      expect(formatMetrTick(30.4)).toBe('30min')
    })
  })

  describe('formatComputeTick', () => {
    it('formats as 10^X', () => {
      expect(formatComputeTick(24)).toBe('10^24')
      expect(formatComputeTick(17)).toBe('10^17')
    })

    it('rounds to nearest integer', () => {
      expect(formatComputeTick(24.6)).toBe('10^25')
      expect(formatComputeTick(24.4)).toBe('10^24')
    })
  })

  describe('formatEciTick', () => {
    it('formats as plain integer', () => {
      expect(formatEciTick(120)).toBe('120')
      expect(formatEciTick(154.5)).toBe('155')
    })
  })

  describe('formatArcagiTick', () => {
    it('formats with % suffix', () => {
      expect(formatArcagiTick(80)).toBe('80%')
      expect(formatArcagiTick(25.7)).toBe('26%')
    })
  })
})

describe('Data Start Dates', () => {
  // Note: Using UTC methods to avoid timezone issues
  it('METR starts November 2019', () => {
    const start = METRIC_CONFIGS.metr.dataStartDate
    expect(start.getUTCFullYear()).toBe(2019)
    expect(start.getUTCMonth()).toBe(10) // November = 10 (0-indexed)
  })

  it('Compute starts July 1950', () => {
    const start = METRIC_CONFIGS.compute.dataStartDate
    expect(start.getUTCFullYear()).toBe(1950)
  })

  it('ECI starts February 2023', () => {
    const start = METRIC_CONFIGS.eci.dataStartDate
    expect(start.getUTCFullYear()).toBe(2023)
    expect(start.getUTCMonth()).toBe(1) // February = 1
  })

  it('ARC-AGI starts August 2021', () => {
    const start = METRIC_CONFIGS.arcagi.dataStartDate
    expect(start.getUTCFullYear()).toBe(2021)
    expect(start.getUTCMonth()).toBe(7) // August = 7
  })
})

describe('Metric Labels', () => {
  it('METR label mentions Task Horizon', () => {
    expect(METRIC_CONFIGS.metr.label).toContain('Task Horizon')
  })

  it('Compute label mentions log₁₀ FLOP', () => {
    expect(METRIC_CONFIGS.compute.label).toContain('log₁₀ FLOP')
  })

  it('ECI label mentions Capability Index', () => {
    expect(METRIC_CONFIGS.eci.label).toContain('Capability Index')
  })

  it('ARC-AGI label mentions Score', () => {
    expect(METRIC_CONFIGS.arcagi.label).toContain('Score')
  })
})
