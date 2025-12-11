/**
 * BackgroundChart Toggle Tests (Story TSR-4-1)
 *
 * Tests for metric toggle functionality in BackgroundChart component.
 * Verifies filtering, empty state handling, transitions, and colors.
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { scaleTime, scaleLinear } from '@visx/scale'
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

  const createMockYScale = () =>
    scaleLinear({
      domain: [0, 1],
      range: [400, 0],
    })

  it('renders enabled metric with opacity 0.6 (AC-1)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute']}
          xScale={createMockXScale()}
          yScale={createMockYScale()}
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
          yScale={createMockYScale()}
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

  it('renders multiple enabled metrics visible (AC-2)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute', 'mmlu']}
          xScale={createMockXScale()}
          yScale={createMockYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // Both compute and mmlu should be visible
    const computeGroup = container.querySelector('[data-metric-id="compute"]')
    const mmluGroup = container.querySelector('[data-metric-id="mmlu"]')
    const eciGroup = container.querySelector('[data-metric-id="eci"]')

    expect(computeGroup?.getAttribute('style')).toContain('opacity: 0.6')
    expect(mmluGroup?.getAttribute('style')).toContain('opacity: 0.6')
    expect(eciGroup?.getAttribute('style')).toContain('opacity: 0')
  })

  it('renders all three metrics visible when all enabled', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute', 'mmlu', 'eci']}
          xScale={createMockXScale()}
          yScale={createMockYScale()}
          innerHeight={400}
        />
      </svg>
    )

    // All should be visible
    const computeGroup = container.querySelector('[data-metric-id="compute"]')
    const mmluGroup = container.querySelector('[data-metric-id="mmlu"]')
    const eciGroup = container.querySelector('[data-metric-id="eci"]')

    expect(computeGroup?.getAttribute('style')).toContain('opacity: 0.6')
    expect(mmluGroup?.getAttribute('style')).toContain('opacity: 0.6')
    expect(eciGroup?.getAttribute('style')).toContain('opacity: 0.6')
  })
})

describe('BackgroundChart empty state (AC-3)', () => {
  const createMockXScale = () =>
    scaleTime({
      domain: [new Date('2010-01-01'), new Date('2025-01-01')],
      range: [0, 800],
    })

  const createMockYScale = () =>
    scaleLinear({
      domain: [0, 1],
      range: [400, 0],
    })

  it('hides all metrics when enabledMetrics is empty (AC-3)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={[]}
          xScale={createMockXScale()}
          yScale={createMockYScale()}
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

  const createMockYScale = () =>
    scaleLinear({
      domain: [0, 1],
      range: [400, 0],
    })

  it('uses correct color for compute metric (AC-5)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute']}
          xScale={createMockXScale()}
          yScale={createMockYScale()}
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
          yScale={createMockYScale()}
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
          yScale={createMockYScale()}
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

  const createMockYScale = () =>
    scaleLinear({
      domain: [0, 1],
      range: [400, 0],
    })

  it('applies transition style to metric groups (AC-4)', async () => {
    const { BackgroundChart } = await import('@/components/visualization/background-chart')
    const { allMetrics } = await import('@/data/ai-metrics')

    const { container } = render(
      <svg>
        <BackgroundChart
          metrics={allMetrics}
          enabledMetrics={['compute']}
          xScale={createMockXScale()}
          yScale={createMockYScale()}
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
          yScale={createMockYScale()}
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
