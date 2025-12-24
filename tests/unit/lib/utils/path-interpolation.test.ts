/**
 * Path Interpolation Utility Tests
 *
 * Tests for metric resampling and path generation utilities
 * used in line morph animations.
 */
import { describe, it, expect } from 'vitest'
import { scaleTime } from '@visx/scale'
import { createLinearYScale } from '@/lib/utils/scales'
import {
  resampleMetricToPoints,
  pointsToPathD,
  interpolatePoints,
  isPrimaryMetric,
  type Point,
} from '@/lib/utils/path-interpolation'
import type { AIMetricSeries } from '@/data/ai-metrics.generated'

describe('isPrimaryMetric', () => {
  it('returns true for metr metric', () => {
    expect(isPrimaryMetric('metr')).toBe(true)
  })

  it('returns false for compute metric', () => {
    expect(isPrimaryMetric('compute')).toBe(false)
  })

  it('returns false for arcagi metric', () => {
    expect(isPrimaryMetric('arcagi')).toBe(false)
  })

  it('returns false for eci metric', () => {
    expect(isPrimaryMetric('eci')).toBe(false)
  })

  it('returns false for unknown metrics', () => {
    expect(isPrimaryMetric('unknown')).toBe(false)
  })
})

describe('pointsToPathD', () => {
  it('returns empty string for empty points array', () => {
    expect(pointsToPathD([])).toBe('')
  })

  it('returns M command for single point', () => {
    const result = pointsToPathD([{ x: 10, y: 20 }])
    expect(result).toBe('M10,20')
  })

  it('generates valid SVG path for multiple points', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 10, y: 20 },
      { x: 20, y: 10 },
    ]
    const result = pointsToPathD(points)

    // Should start with M command
    expect(result).toMatch(/^M/)
    // Should contain L commands for subsequent points
    expect(result).toContain('L')
    // Should have path for all points
    expect(result).toMatch(/M0\.00,0\.00/)
    expect(result).toMatch(/L10\.00,20\.00/)
    expect(result).toMatch(/L20\.00,10\.00/)
  })

  it('formats coordinates to 2 decimal places', () => {
    const points: Point[] = [
      { x: 1.12345, y: 2.98765 },
      { x: 3.14159, y: 4.56789 },
    ]
    const result = pointsToPathD(points)

    expect(result).toBe('M1.12,2.99 L3.14,4.57')
  })
})

describe('interpolatePoints', () => {
  const from: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ]
  const to: Point[] = [
    { x: 0, y: 20 },
    { x: 10, y: 30 },
  ]

  it('returns from points when t=0', () => {
    const result = interpolatePoints(from, to, 0)
    expect(result).toEqual(from)
  })

  it('returns to points when t=1', () => {
    const result = interpolatePoints(from, to, 1)
    expect(result).toEqual(to)
  })

  it('interpolates correctly at t=0.5', () => {
    const result = interpolatePoints(from, to, 0.5)
    expect(result).toEqual([
      { x: 0, y: 10 },
      { x: 10, y: 20 },
    ])
  })

  it('interpolates correctly at t=0.25', () => {
    const result = interpolatePoints(from, to, 0.25)
    expect(result).toEqual([
      { x: 0, y: 5 },
      { x: 10, y: 15 },
    ])
  })

  it('returns from points when arrays have different lengths', () => {
    const shortFrom: Point[] = [{ x: 0, y: 0 }]
    // t < 0.5 should return from
    expect(interpolatePoints(shortFrom, to, 0.3)).toEqual(shortFrom)
    // t >= 0.5 should return to
    expect(interpolatePoints(shortFrom, to, 0.6)).toEqual(to)
  })
})

describe('resampleMetricToPoints', () => {
  // Create mock scales for testing
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2020-01-01'), new Date('2024-01-01')],
      range: [0, 400],
    })

  const createMockYScale = () =>
    createLinearYScale(300, [0, 100])

  const mockMetric: AIMetricSeries = {
    id: 'metr',
    label: 'Test Metric',
    color: 'rgb(255, 0, 0)',
    unit: 'minutes',
    data: [
      { date: '2020-01-01', value: 10 },
      { date: '2021-01-01', value: 30 },
      { date: '2022-01-01', value: 50 },
      { date: '2023-01-01', value: 70 },
      { date: '2024-01-01', value: 90 },
    ],
  }

  it('returns empty array for metric with less than 2 visible points', () => {
    const xScale = scaleTime({
      domain: [new Date('2019-01-01'), new Date('2019-06-01')],
      range: [0, 400],
    })
    const result = resampleMetricToPoints(mockMetric, xScale, createMockYScale(), 300)
    expect(result).toEqual([])
  })

  it('resamples to specified number of points', () => {
    const result = resampleMetricToPoints(
      mockMetric,
      createMockXScale(),
      createMockYScale(),
      300,
      50 // 50 points instead of default 100
    )
    expect(result.length).toBe(50)
  })

  it('generates points with x values within scale range', () => {
    const xScale = createMockXScale()
    const result = resampleMetricToPoints(mockMetric, xScale, createMockYScale(), 300)

    const [minX, maxX] = xScale.range()
    result.forEach((point) => {
      expect(point.x).toBeGreaterThanOrEqual(minX)
      expect(point.x).toBeLessThanOrEqual(maxX)
    })
  })

  it('generates points with y values within chart height', () => {
    const innerHeight = 300
    const result = resampleMetricToPoints(
      mockMetric,
      createMockXScale(),
      createMockYScale(),
      innerHeight
    )

    result.forEach((point) => {
      expect(point.y).toBeGreaterThanOrEqual(0)
      expect(point.y).toBeLessThanOrEqual(innerHeight)
    })
  })

  it('uses normalized Y values for non-primary metrics', () => {
    const nonPrimaryMetric: AIMetricSeries = {
      ...mockMetric,
      id: 'compute', // Not 'metr', so it's a non-primary metric
    }
    const innerHeight = 300
    const result = resampleMetricToPoints(
      nonPrimaryMetric,
      createMockXScale(),
      createMockYScale(),
      innerHeight
    )

    // Non-primary metrics should still have Y values in chart bounds
    result.forEach((point) => {
      expect(point.y).toBeGreaterThanOrEqual(0)
      expect(point.y).toBeLessThanOrEqual(innerHeight)
    })
  })
})
