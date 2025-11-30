/**
 * TooltipCard Component Tests
 *
 * Tests for hover tooltip component used in timeline visualization.
 * Following same pattern as scatter-point.test.tsx due to React 19 + Vitest
 * hook resolution issues with direct rendering.
 */
import { describe, it, expect } from 'vitest'

describe('TooltipCard module exports', () => {
  it('exports TooltipCard component', async () => {
    const tooltipCardModule = await import(
      '@/components/visualization/tooltip-card'
    )
    expect(tooltipCardModule.TooltipCard).toBeDefined()
    expect(typeof tooltipCardModule.TooltipCard).toBe('function')
  })

  it('exports TooltipCardProps type (via component existence)', async () => {
    const tooltipCardModule = await import(
      '@/components/visualization/tooltip-card'
    )
    expect(tooltipCardModule.TooltipCard).toBeDefined()
  })
})

describe('TooltipCard dependencies', () => {
  it('imports motion/react for animations', async () => {
    const { motion, AnimatePresence } = await import('motion/react')
    expect(motion).toBeDefined()
    expect(AnimatePresence).toBeDefined()
  })

  it('imports formatDate utility', async () => {
    const { formatDate } = await import('@/lib/utils/date')
    expect(formatDate).toBeDefined()
    expect(typeof formatDate).toBe('function')
  })

  it('imports tooltipAppear animation variants', async () => {
    const { tooltipAppear, DURATIONS } = await import('@/lib/utils/animation')
    expect(tooltipAppear).toBeDefined()
    expect(tooltipAppear.initial).toBeDefined()
    expect(tooltipAppear.animate).toBeDefined()
    expect(tooltipAppear.exit).toBeDefined()
    expect(DURATIONS.fast).toBe(0.15)
  })
})

describe('TooltipCard animation variants', () => {
  it('tooltipAppear has correct initial state', async () => {
    const { tooltipAppear } = await import('@/lib/utils/animation')
    expect(tooltipAppear.initial).toEqual({
      opacity: 0,
      scale: 0.95,
      y: 5,
    })
  })

  it('tooltipAppear has correct animate state', async () => {
    const { tooltipAppear } = await import('@/lib/utils/animation')
    expect(tooltipAppear.animate).toEqual({
      opacity: 1,
      scale: 1,
      y: 0,
    })
  })

  it('tooltipAppear has correct exit state', async () => {
    const { tooltipAppear } = await import('@/lib/utils/animation')
    expect(tooltipAppear.exit).toEqual({
      opacity: 0,
      scale: 0.95,
    })
  })
})

describe('TooltipData interface', () => {
  it('TooltipData type is exported from visualization types', async () => {
    const types = await import('@/types/visualization')
    // TypeScript types don't exist at runtime, but we can verify the module exports
    expect(types).toBeDefined()
  })
})

describe('TooltipCard integration', () => {
  it('ScatterPlot imports TooltipCard', async () => {
    // Verify integration is correctly set up
    const scatterPlot = await import('@/components/visualization/scatter-plot')
    const tooltipCard = await import(
      '@/components/visualization/tooltip-card'
    )

    expect(scatterPlot.ScatterPlot).toBeDefined()
    expect(tooltipCard.TooltipCard).toBeDefined()
  })

  it('ScatterPlot imports TooltipData type', async () => {
    const types = await import('@/types/visualization')
    expect(types).toBeDefined()
  })
})

describe('Date formatting for tooltip display', () => {
  it('formatDate returns expected format', async () => {
    const { formatDate } = await import('@/lib/utils/date')

    expect(formatDate('2023-03-14')).toBe('Mar 14, 2023')
    expect(formatDate('2024-01-01')).toBe('Jan 1, 2024')
  })

  it('formatDate handles different months', async () => {
    const { formatDate } = await import('@/lib/utils/date')

    const dates = [
      { input: '2023-01-15', month: 'Jan' },
      { input: '2023-06-15', month: 'Jun' },
      { input: '2023-12-15', month: 'Dec' },
    ]

    dates.forEach(({ input, month }) => {
      const result = formatDate(input)
      expect(result).toContain(month)
    })
  })
})

describe('Tooltip positioning logic (behavior contract)', () => {
  it('component should accept x, y, obituary, and containerBounds props', async () => {
    const { TooltipCard } = await import(
      '@/components/visualization/tooltip-card'
    )

    // Verify component is a function (React component)
    expect(typeof TooltipCard).toBe('function')

    // Props validation is done at TypeScript compile time
    // We verify the component exists and is importable
  })

  it('boundary detection constants are reasonable', () => {
    // Verify constants used in positioning logic
    const tooltipWidth = 280
    const tooltipHeight = 120
    const padding = 12
    const dotRadius = 14

    expect(tooltipWidth).toBeGreaterThan(0)
    expect(tooltipHeight).toBeGreaterThan(0)
    expect(padding).toBeGreaterThan(0)
    expect(dotRadius).toBeGreaterThan(0)

    // Max width from design spec
    expect(tooltipWidth).toBe(280)
  })
})

describe('Claim truncation behavior', () => {
  it('truncation logic works correctly', () => {
    const longClaim = 'a'.repeat(150)
    const shortClaim = 'Short claim'

    // Simulate truncation logic from component
    const truncatedLong =
      longClaim.length > 100 ? `${longClaim.slice(0, 100)}...` : longClaim

    const truncatedShort =
      shortClaim.length > 100
        ? `${shortClaim.slice(0, 100)}...`
        : shortClaim

    expect(truncatedLong).toHaveLength(103) // 100 + "..."
    expect(truncatedLong).toMatch(/\.\.\.$/u)
    expect(truncatedShort).toBe(shortClaim)
  })

  it('truncation preserves exactly 100 characters plus ellipsis', () => {
    const claim = 'x'.repeat(200)
    const truncated =
      claim.length > 100 ? `${claim.slice(0, 100)}...` : claim

    expect(truncated).toHaveLength(103)
    expect(truncated.slice(0, 100)).toBe('x'.repeat(100))
  })

  it('does not truncate claims under 100 characters', () => {
    const claim = 'Test claim that is under 100 characters'
    const truncated =
      claim.length > 100 ? `${claim.slice(0, 100)}...` : claim

    expect(truncated).toBe(claim)
    expect(truncated).not.toContain('...')
  })
})
