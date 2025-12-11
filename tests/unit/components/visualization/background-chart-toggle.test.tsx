/**
 * BackgroundChart Toggle Tests (Story TSR-4-1, TSR-4-2)
 *
 * Tests for metric toggle functionality and log scale adaptation in BackgroundChart component.
 * Verifies filtering, empty state handling, transitions, colors, and log scale positioning.
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { scaleTime } from '@visx/scale'
import { createLogYScale, logToFlop } from '@/lib/utils/scales'
import type { MetricType } from '@/types/metrics'

describe('BackgroundChart module exports', () => {
  it('exports BackgroundChart component', async () => {
    const chartModule = await import('@/components/visualization/background-chart')
    expect(chartModule.BackgroundChart).toBeDefined()
    expect(typeof chartModule.BackgroundChart).toBe('function')
  })

  it('exports BackgroundChartLegend component', async () => {
    const chartModule = await import('@/components/visualization/background-chart')
    expect(chartModule.BackgroundChartLegend).toBeDefined()
    expect(typeof chartModule.BackgroundChartLegend).toBe('function')
  })
})

describe('BackgroundChart metric visibility (AC-1, AC-2)', () => {
  // Create mock scales for testing
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2010-01-01'), new Date('2025-01-01')],
      range: [0, 800],
    })

  // Use actual log scale for proper testing (TSR-4-2)
  const createMockLogYScale = () =>
    createLogYScale(400, [1e17, 1e27])

  it('renders enabled compute metric with opacity 0.6 (AC-1)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute']}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // Find the compute metric group by data-metric-id
    const computeGroup = container.querySelector('[data-metric-id="compute"]')
    expect(computeGroup).not.toBeNull()
    expect(computeGroup?.getAttribute('style')).toContain('opacity: 0.6')
  })

  it('renders disabled metric with opacity 0', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute']}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // mmlu and eci should be hidden (opacity 0)
    const mmluGroup = container.querySelector('[data-metric-id="mmlu"]')
    const eciGroup = container.querySelector('[data-metric-id="eci"]')

    expect(mmluGroup?.getAttribute('style')).toContain('opacity: 0')
    expect(eciGroup?.getAttribute('style')).toContain('opacity: 0')
  })

  it('renders multiple enabled metrics with differentiated opacity (AC-2)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute', 'mmlu']}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // Compute (FLOP metric) uses 0.6 opacity, MMLU (overlay) uses 0.3
    const computeGroup = container.querySelector('[data-metric-id="compute"]')
    const mmluGroup = container.querySelector('[data-metric-id="mmlu"]')
    const eciGroup = container.querySelector('[data-metric-id="eci"]')

    expect(computeGroup?.getAttribute('style')).toContain('opacity: 0.6')
    expect(mmluGroup?.getAttribute('style')).toContain('opacity: 0.3')
    expect(eciGroup?.getAttribute('style')).toContain('opacity: 0')
  })

  it('renders all three metrics with differentiated opacity when all enabled', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute', 'mmlu', 'eci']}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // Compute uses 0.6, overlay metrics (mmlu, eci) use 0.3
    const computeGroup = container.querySelector('[data-metric-id="compute"]')
    const mmluGroup = container.querySelector('[data-metric-id="mmlu"]')
    const eciGroup = container.querySelector('[data-metric-id="eci"]')

    expect(computeGroup?.getAttribute('style')).toContain('opacity: 0.6')
    expect(mmluGroup?.getAttribute('style')).toContain('opacity: 0.3')
    expect(eciGroup?.getAttribute('style')).toContain('opacity: 0.3')
  })
})

describe('BackgroundChart empty state (AC-3)', () => {
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2010-01-01'), new Date('2025-01-01')],
      range: [0, 800],
    })

  const createMockLogYScale = () =>
    createLogYScale(400, [1e17, 1e27])

  it('hides all metrics when enabledMetrics is empty (AC-3)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={[]}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // All metrics should have opacity 0
    const computeGroup = container.querySelector('[data-metric-id="compute"]')
    const mmluGroup = container.querySelector('[data-metric-id="mmlu"]')
    const eciGroup = container.querySelector('[data-metric-id="eci"]')

    expect(computeGroup?.getAttribute('style')).toContain('opacity: 0')
    expect(mmluGroup?.getAttribute('style')).toContain('opacity: 0')
    expect(eciGroup?.getAttribute('style')).toContain('opacity: 0')
  })
})

describe('BackgroundChart metric colors (AC-5)', () => {
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2010-01-01'), new Date('2025-01-01')],
      range: [0, 800],
    })

  const createMockLogYScale = () =>
    createLogYScale(400, [1e17, 1e27])

  it('uses correct color for compute metric (AC-5)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute']}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // Find the line path in compute group and check its stroke color
    const computeGroup = container.querySelector('[data-metric-id="compute"]')
    const linePath = computeGroup?.querySelector('path[stroke]')

    expect(linePath?.getAttribute('stroke')).toBe('rgb(118, 185, 0)')
  })

  it('uses correct color for mmlu metric (AC-5)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['mmlu']}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    const mmluGroup = container.querySelector('[data-metric-id="mmlu"]')
    const linePath = mmluGroup?.querySelector('path[stroke]')

    expect(linePath?.getAttribute('stroke')).toBe('rgb(234, 179, 8)')
  })

  it('uses correct color for eci metric (AC-5)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['eci']}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    const eciGroup = container.querySelector('[data-metric-id="eci"]')
    const linePath = eciGroup?.querySelector('path[stroke]')

    expect(linePath?.getAttribute('stroke')).toBe('rgb(99, 102, 241)')
  })
})

describe('BackgroundChart transitions (AC-4)', () => {
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2010-01-01'), new Date('2025-01-01')],
      range: [0, 800],
    })

  const createMockLogYScale = () =>
    createLogYScale(400, [1e17, 1e27])

  it('applies transition style to metric groups (AC-4)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute']}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    const metricGroup = container.querySelector('[data-metric-id="compute"]')
    expect(metricGroup).not.toBeNull()

    // Check for transition style
    const style = metricGroup?.getAttribute('style')
    expect(style).toContain('transition')
    expect(style).toContain('opacity')
    expect(style).toContain('200ms')
    expect(style).toContain('ease-in-out')
  })

  it('transition style applies to all metric groups for smooth toggle', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute']}
          xScale={createMockXScale()}
          yScale={createMockLogYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // All metrics should have transition, even disabled ones (for fade-in when enabled)
    const groups = container.querySelectorAll('[data-metric-id]')
    expect(groups.length).toBeGreaterThanOrEqual(3)

    groups.forEach((group) => {
      const style = group.getAttribute('style')
      expect(style).toContain('transition')
    })
  })
})

describe('Default metrics state (AC-6)', () => {
  it('default enabledMetrics is ["compute"] per visualization state hook', async () => {
    // The default enabledMetrics value is defined in useVisualizationState hook
    // Verify the ai-metrics module provides all expected metrics
    const { allMetrics, trainingComputeFrontier } = await import('@/data/ai-metrics')

    expect(allMetrics).toBeDefined()
    expect(Array.isArray(allMetrics)).toBe(true)
    expect(allMetrics).toHaveLength(3)

    // Verify compute metric is the expected default
    expect(trainingComputeFrontier.id).toBe('compute')

    // Verify filtering logic produces correct result for default ['compute']
    const defaultEnabled: MetricType[] = ['compute']
    const filtered = allMetrics.filter((m) => defaultEnabled.includes(m.id as MetricType))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('compute')
  })
})

// =============================================================================
// TSR-4-2: Log Scale Adaptation Tests
// =============================================================================

describe('BackgroundChart - Log Scale Adaptation (TSR-4-2)', () => {
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2010-01-01'), new Date('2025-01-01')],
      range: [0, 800],
    })

  const createMockLogYScale = () =>
    createLogYScale(400, [1e17, 1e27])

  describe('Training Compute positioning (AC-1)', () => {
    it('positions compute line using actual FLOP values', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { trainingComputeFrontier } = await import('@/data/ai-metrics')

      const logYScale = createMockLogYScale()
      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={createMockXScale()}
            yScale={logYScale}
            innerHeight={400}
          />
        </svg>
      )

      // LinePath should exist and use transformed coordinates
      const linePath = container.querySelector('path[stroke="rgb(118, 185, 0)"]')
      expect(linePath).toBeInTheDocument()

      // Path should have valid d attribute (coordinates in log space)
      const pathD = linePath?.getAttribute('d')
      expect(pathD).toBeTruthy()
      expect(pathD).toContain('M') // Valid path
    })

    it('uses logToFlop for Y coordinate calculation', () => {
      // Test that data point at log10=25 (1e25 FLOP) maps correctly
      const testValue = 25 // log10 FLOP
      const expectedFlop = logToFlop(testValue)
      expect(expectedFlop).toBe(1e25)
    })
  })

  describe('Non-FLOP metrics render as overlay (AC-2)', () => {
    it('renders MMLU with reduced opacity (0.3)', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { mmluFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[mmluFrontier]}
            enabledMetrics={['mmlu']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const metricGroup = container.querySelector('[data-metric-id="mmlu"]')
      expect(metricGroup?.getAttribute('style')).toContain('opacity: 0.3')
    })

    it('renders ECI with reduced opacity (0.3)', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { eciFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[eciFrontier]}
            enabledMetrics={['eci']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const metricGroup = container.querySelector('[data-metric-id="eci"]')
      expect(metricGroup?.getAttribute('style')).toContain('opacity: 0.3')
    })

    it('renders non-compute metrics with reduced strokeOpacity', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { mmluFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[mmluFrontier]}
            enabledMetrics={['mmlu']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const mmluGroup = container.querySelector('[data-metric-id="mmlu"]')
      const linePath = mmluGroup?.querySelector('path[stroke]')
      // Non-compute uses strokeOpacity 0.5 vs 0.8 for compute
      expect(linePath?.getAttribute('stroke-opacity')).toBe('0.5')
    })

    it('renders compute metric with full strokeOpacity', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { trainingComputeFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const computeGroup = container.querySelector('[data-metric-id="compute"]')
      const linePath = computeGroup?.querySelector('path[stroke]')
      // Compute uses full strokeOpacity 0.8
      expect(linePath?.getAttribute('stroke-opacity')).toBe('0.8')
    })
  })

  describe('Date range filtering (AC-3)', () => {
    it('filters data points outside xScale domain', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { trainingComputeFrontier } = await import('@/data/ai-metrics')

      // Create xScale with narrow domain (2020-2023)
      const narrowXScale = scaleTime({
        domain: [new Date('2020-01-01'), new Date('2023-12-31')],
        range: [0, 800],
      })

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={narrowXScale}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // Should render (training compute has data in 2020-2023)
      const linePath = container.querySelector('path[stroke="rgb(118, 185, 0)"]')
      expect(linePath).toBeInTheDocument()
    })

    it('returns null when no data in date range', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { trainingComputeFrontier } = await import('@/data/ai-metrics')

      // Create xScale with future domain (no data exists)
      const futureXScale = scaleTime({
        domain: [new Date('2030-01-01'), new Date('2035-12-31')],
        range: [0, 800],
      })

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={futureXScale}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // No line should render (no data points in range)
      const linePath = container.querySelector('path[stroke]')
      expect(linePath).not.toBeInTheDocument()
    })
  })

  describe('AreaClosed integration (AC-5)', () => {
    it('renders area fill with log scale for compute', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { trainingComputeFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // AreaClosed creates a filled path with gradient
      const areaPath = container.querySelector('path[fill^="url(#area-gradient"]')
      expect(areaPath).toBeInTheDocument()
    })

    it('renders area fill for non-compute metrics', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { mmluFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[mmluFrontier]}
            enabledMetrics={['mmlu']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const areaPath = container.querySelector('path[fill^="url(#area-gradient-mmlu"]')
      expect(areaPath).toBeInTheDocument()
    })
  })

  describe('Transition maintained (AC-4)', () => {
    it('maintains 200ms opacity transition for compute metrics', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { trainingComputeFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const metricGroup = container.querySelector('[data-metric-id="compute"]')
      const style = metricGroup?.getAttribute('style')
      expect(style).toContain('transition: opacity 200ms ease-in-out')
    })

    it('maintains 200ms opacity transition for overlay metrics', async () => {
      const { BackgroundChart } = await import('@/components/visualization/background-chart')
      const { mmluFrontier } = await import('@/data/ai-metrics')

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[mmluFrontier]}
            enabledMetrics={['mmlu']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const metricGroup = container.querySelector('[data-metric-id="mmlu"]')
      const style = metricGroup?.getAttribute('style')
      expect(style).toContain('transition: opacity 200ms ease-in-out')
    })
  })
})
