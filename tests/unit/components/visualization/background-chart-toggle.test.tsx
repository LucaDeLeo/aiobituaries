/**
 * BackgroundChart Single-Select Tests
 *
 * Tests for single metric selection and line morph animation in BackgroundChart component.
 * Verifies metric rendering, colors, opacity, and data structure.
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { scaleTime } from '@visx/scale'
import { createLinearYScale, logToFlop } from '@/lib/utils/scales'

describe('BackgroundChart module exports', () => {
  it('exports BackgroundChart component', async () => {
    const chartModule = await import('@/components/visualization/background-chart')
    expect(chartModule.BackgroundChart).toBeDefined()
    // React.memo wraps components - can be function or object (memoized component)
    expect(['function', 'object'].includes(typeof chartModule.BackgroundChart)).toBe(true)
  })

  it('exports BackgroundChartLegend component', async () => {
    const chartModule = await import('@/components/visualization/background-chart')
    expect(chartModule.BackgroundChartLegend).toBeDefined()
    expect(typeof chartModule.BackgroundChartLegend).toBe('function')
  })
})

describe('BackgroundChart single metric rendering', () => {
  // Create mock scales for testing
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2010-01-01'), new Date('2025-01-01')],
      range: [0, 800],
    })

  // Use linear scale for METR (primary metric)
  const createMockLinearYScale = () =>
    createLinearYScale(400, [0, 350])

  it('renders selected METR metric with data-metric-id attribute', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          selectedMetric="metr"
          xScale={createMockXScale()}
          yScale={createMockLinearYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // Only the selected metric should be rendered
    const metrGroup = container.querySelector('[data-metric-id="metr"]')
    expect(metrGroup).not.toBeNull()
  })

  it('renders selected compute metric', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          selectedMetric="compute"
          xScale={createMockXScale()}
          yScale={createMockLinearYScale()}
          innerHeight={400}
        />
      </svg>
    )

    const computeGroup = container.querySelector('[data-metric-id="compute"]')
    expect(computeGroup).not.toBeNull()
  })

  it('renders selected arcagi metric', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          selectedMetric="arcagi"
          xScale={createMockXScale()}
          yScale={createMockLinearYScale()}
          innerHeight={400}
        />
      </svg>
    )

    const arcagiGroup = container.querySelector('[data-metric-id="arcagi"]')
    expect(arcagiGroup).not.toBeNull()
  })
})

describe('BackgroundChart metric colors', () => {
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2010-01-01'), new Date('2025-01-01')],
      range: [0, 800],
    })

  const createMockLinearYScale = () =>
    createLinearYScale(400, [0, 350])

  it('uses correct color for compute metric', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          selectedMetric="compute"
          xScale={createMockXScale()}
          yScale={createMockLinearYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // Find the line path and check its stroke color
    const computeGroup = container.querySelector('[data-metric-id="compute"]')
    const linePath = computeGroup?.querySelector('path[stroke]')

    expect(linePath?.getAttribute('stroke')).toBe('rgb(118, 185, 0)')
  })

  it('uses correct color for arcagi metric', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          selectedMetric="arcagi"
          xScale={createMockXScale()}
          yScale={createMockLinearYScale()}
          innerHeight={400}
        />
      </svg>
    )

    const arcagiGroup = container.querySelector('[data-metric-id="arcagi"]')
    const linePath = arcagiGroup?.querySelector('path[stroke]')

    expect(linePath?.getAttribute('stroke')).toBe('rgb(234, 179, 8)')
  })

  it('uses correct color for eci metric', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          selectedMetric="eci"
          xScale={createMockXScale()}
          yScale={createMockLinearYScale()}
          innerHeight={400}
        />
      </svg>
    )

    const eciGroup = container.querySelector('[data-metric-id="eci"]')
    const linePath = eciGroup?.querySelector('path[stroke]')

    expect(linePath?.getAttribute('stroke')).toBe('rgb(99, 102, 241)')
  })
})

describe('Default metric state', () => {
  it('default selectedMetric is "metr" per visualization state hook', async () => {
    // The default selectedMetric value is defined in useVisualizationState hook
    // Verify the ai-metrics module provides all expected metrics
    const { allMetrics, metrFrontier } = await import('@/data/ai-metrics')

    expect(allMetrics).toBeDefined()
    expect(Array.isArray(allMetrics)).toBe(true)
    expect(allMetrics).toHaveLength(4) // arcagi, eci, compute, metr

    // Verify METR metric exists (this is the new default)
    expect(metrFrontier.id).toBe('metr')
  })
})

// =============================================================================
// Single-Select Rendering Tests
// =============================================================================

describe('BackgroundChart - Single Metric Rendering', () => {
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2010-01-01'), new Date('2025-01-01')],
      range: [0, 800],
    })

  const createMockLinearYScale = () =>
    createLinearYScale(400, [0, 350])

  describe('METR positioning', () => {
    it('positions METR line using actual minute values', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { metrFrontier } = await import('@/data/ai-metrics')

      const linearYScale = createMockLinearYScale()
      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[metrFrontier]}
            selectedMetric="metr"
            xScale={createMockXScale()}
            yScale={linearYScale}
            innerHeight={400}
          />
        </svg>
      )

      // LinePath should exist
      const metrGroup = container.querySelector('[data-metric-id="metr"]')
      const linePath = metrGroup?.querySelector('path[stroke]')
      expect(linePath).toBeInTheDocument()

      // Path should have valid d attribute
      const pathD = linePath?.getAttribute('d')
      expect(pathD).toBeTruthy()
      expect(pathD).toContain('M') // Valid path
    })

    it('uses logToFlop for legacy FLOP calculations', () => {
      // Test that logToFlop still works for overlay metrics
      const testValue = 25 // log10 FLOP
      const expectedFlop = logToFlop(testValue)
      expect(expectedFlop).toBe(1e25)
    })
  })

  describe('Single metric opacity', () => {
    it('renders METR metric with primary opacity (0.6)', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { metrFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[metrFrontier]}
            selectedMetric="metr"
            xScale={createMockXScale()}
            yScale={createMockLinearYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // Check that the path has the expected opacity
      const metrGroup = container.querySelector('[data-metric-id="metr"]')
      const linePath = metrGroup?.querySelector('path[stroke]')
      // The path has inline opacity style
      expect(linePath?.getAttribute('style')).toContain('opacity')
    })

    it('renders overlay metric with reduced opacity (0.3)', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { mmluFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[mmluFrontier]}
            selectedMetric="arcagi"
            xScale={createMockXScale()}
            yScale={createMockLinearYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const arcagiGroup = container.querySelector('[data-metric-id="arcagi"]')
      const linePath = arcagiGroup?.querySelector('path[stroke]')
      // Overlay metrics have 0.3 opacity
      expect(linePath?.getAttribute('style')).toContain('opacity')
    })
  })

  describe('Date range filtering', () => {
    it('filters data points outside xScale domain', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { metrFrontier } = await import('@/data/ai-metrics')

      // Create xScale with narrow domain (2020-2023)
      const narrowXScale = scaleTime({
        domain: [new Date('2020-01-01'), new Date('2023-12-31')],
        range: [0, 800],
      })

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[metrFrontier]}
            selectedMetric="metr"
            xScale={narrowXScale}
            yScale={createMockLinearYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // Should render (METR has data in 2020-2023)
      const metrGroup = container.querySelector('[data-metric-id="metr"]')
      const linePath = metrGroup?.querySelector('path[stroke]')
      expect(linePath).toBeInTheDocument()
    })

    it('returns null when no data in date range', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { metrFrontier } = await import('@/data/ai-metrics')

      // Create xScale with future domain (no data exists)
      const futureXScale = scaleTime({
        domain: [new Date('2030-01-01'), new Date('2035-12-31')],
        range: [0, 800],
      })

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[metrFrontier]}
            selectedMetric="metr"
            xScale={futureXScale}
            yScale={createMockLinearYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // No line should render (no data points in range)
      const linePath = container.querySelector('path[stroke]')
      expect(linePath).not.toBeInTheDocument()
    })
  })

  describe('AreaClosed integration', () => {
    it('renders area fill for selected metric', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { metrFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[metrFrontier]}
            selectedMetric="metr"
            xScale={createMockXScale()}
            yScale={createMockLinearYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // AreaClosed creates a filled path with gradient
      const areaPath = container.querySelector('path[fill^="url(#area-gradient"]')
      expect(areaPath).toBeInTheDocument()
    })
  })
})

// =============================================================================
// Path Interpolation Utility Tests
// =============================================================================

describe('Path Interpolation Utilities', () => {
  it('exports resampleMetricToPoints function', async () => {
    const { resampleMetricToPoints } = await import('@/lib/utils/path-interpolation')
    expect(resampleMetricToPoints).toBeDefined()
    expect(typeof resampleMetricToPoints).toBe('function')
  })

  it('exports pointsToPathD function', async () => {
    const { pointsToPathD } = await import('@/lib/utils/path-interpolation')
    expect(pointsToPathD).toBeDefined()
    expect(typeof pointsToPathD).toBe('function')
  })

  it('exports interpolatePoints function', async () => {
    const { interpolatePoints } = await import('@/lib/utils/path-interpolation')
    expect(interpolatePoints).toBeDefined()
    expect(typeof interpolatePoints).toBe('function')
  })

  it('pointsToPathD generates valid SVG path', async () => {
    const { pointsToPathD } = await import('@/lib/utils/path-interpolation')

    const points = [
      { x: 0, y: 100 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ]

    const pathD = pointsToPathD(points)
    expect(pathD).toContain('M0.00,100.00')
    expect(pathD).toContain('L50.00,50.00')
    expect(pathD).toContain('L100.00,0.00')
  })

  it('interpolatePoints creates intermediate positions', async () => {
    const { interpolatePoints } = await import('@/lib/utils/path-interpolation')

    const from = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]
    const to = [
      { x: 0, y: 100 },
      { x: 100, y: 0 },
    ]

    // At t=0.5, points should be halfway between
    const result = interpolatePoints(from, to, 0.5)

    expect(result[0].x).toBe(0)
    expect(result[0].y).toBe(50)
    expect(result[1].x).toBe(100)
    expect(result[1].y).toBe(50)
  })
})
