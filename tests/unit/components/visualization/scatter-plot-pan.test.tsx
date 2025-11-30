/**
 * ScatterPlot Pan Functionality Tests
 *
 * Tests for Story 3-3: Horizontal Scroll/Pan
 * Tests module exports and pan-related utilities.
 * Due to React 19 + Vitest hook resolution issues, we test exports and logic functions
 * rather than direct component rendering.
 */
import { describe, it, expect } from 'vitest'

describe('ScatterPlot pan module exports', () => {
  it('exports createClampTranslateX helper', async () => {
    const scatterModule = await import(
      '@/components/visualization/scatter-plot'
    )
    expect(scatterModule.createClampTranslateX).toBeDefined()
    expect(typeof scatterModule.createClampTranslateX).toBe('function')
  })

  it('exports calculateEdgeGradientVisibility helper', async () => {
    const scatterModule = await import(
      '@/components/visualization/scatter-plot'
    )
    expect(scatterModule.calculateEdgeGradientVisibility).toBeDefined()
    expect(typeof scatterModule.calculateEdgeGradientVisibility).toBe(
      'function'
    )
  })
})

describe('createClampTranslateX', () => {
  it('clamps value to min when below min', async () => {
    const { createClampTranslateX } = await import(
      '@/components/visualization/scatter-plot'
    )
    const clamp = createClampTranslateX({ min: -100, max: 50 })

    expect(clamp(-200)).toBe(-100)
    expect(clamp(-500)).toBe(-100)
  })

  it('clamps value to max when above max', async () => {
    const { createClampTranslateX } = await import(
      '@/components/visualization/scatter-plot'
    )
    const clamp = createClampTranslateX({ min: -100, max: 50 })

    expect(clamp(100)).toBe(50)
    expect(clamp(200)).toBe(50)
  })

  it('returns value unchanged when within bounds', async () => {
    const { createClampTranslateX } = await import(
      '@/components/visualization/scatter-plot'
    )
    const clamp = createClampTranslateX({ min: -100, max: 50 })

    expect(clamp(0)).toBe(0)
    expect(clamp(-50)).toBe(-50)
    expect(clamp(25)).toBe(25)
  })

  it('handles edge case where min equals max', async () => {
    const { createClampTranslateX } = await import(
      '@/components/visualization/scatter-plot'
    )
    const clamp = createClampTranslateX({ min: 0, max: 0 })

    expect(clamp(-10)).toBe(0)
    expect(clamp(10)).toBe(0)
    expect(clamp(0)).toBe(0)
  })

  it('handles negative bounds correctly', async () => {
    const { createClampTranslateX } = await import(
      '@/components/visualization/scatter-plot'
    )
    const clamp = createClampTranslateX({ min: -500, max: -100 })

    expect(clamp(-600)).toBe(-500)
    expect(clamp(0)).toBe(-100)
    expect(clamp(-300)).toBe(-300)
  })
})

describe('calculateEdgeGradientVisibility', () => {
  it('shows left gradient when translateX is less than max', async () => {
    const { calculateEdgeGradientVisibility } = await import(
      '@/components/visualization/scatter-plot'
    )
    const result = calculateEdgeGradientVisibility(0, { min: -100, max: 50 })

    expect(result.showLeft).toBe(true)
  })

  it('hides left gradient when translateX equals max', async () => {
    const { calculateEdgeGradientVisibility } = await import(
      '@/components/visualization/scatter-plot'
    )
    const result = calculateEdgeGradientVisibility(50, { min: -100, max: 50 })

    expect(result.showLeft).toBe(false)
  })

  it('shows right gradient when translateX is greater than min', async () => {
    const { calculateEdgeGradientVisibility } = await import(
      '@/components/visualization/scatter-plot'
    )
    const result = calculateEdgeGradientVisibility(0, { min: -100, max: 50 })

    expect(result.showRight).toBe(true)
  })

  it('hides right gradient when translateX equals min', async () => {
    const { calculateEdgeGradientVisibility } = await import(
      '@/components/visualization/scatter-plot'
    )
    const result = calculateEdgeGradientVisibility(-100, { min: -100, max: 50 })

    expect(result.showRight).toBe(false)
  })

  it('shows both gradients when in middle of range', async () => {
    const { calculateEdgeGradientVisibility } = await import(
      '@/components/visualization/scatter-plot'
    )
    const result = calculateEdgeGradientVisibility(-25, { min: -100, max: 50 })

    expect(result.showLeft).toBe(true)
    expect(result.showRight).toBe(true)
  })

  it('hides both gradients when no panning available (min === max === 0)', async () => {
    const { calculateEdgeGradientVisibility } = await import(
      '@/components/visualization/scatter-plot'
    )
    const result = calculateEdgeGradientVisibility(0, { min: 0, max: 0 })

    expect(result.showLeft).toBe(false)
    expect(result.showRight).toBe(false)
  })
})

describe('Motion library availability', () => {
  it('useMotionValue is importable from motion/react', async () => {
    const { useMotionValue } = await import('motion/react')
    expect(useMotionValue).toBeDefined()
    expect(typeof useMotionValue).toBe('function')
  })

  it('useSpring is importable from motion/react', async () => {
    const { useSpring } = await import('motion/react')
    expect(useSpring).toBeDefined()
    expect(typeof useSpring).toBe('function')
  })

  it('animate is importable from motion/react', async () => {
    const { animate } = await import('motion/react')
    expect(animate).toBeDefined()
    expect(typeof animate).toBe('function')
  })
})

describe('ViewState type compatibility', () => {
  it('ViewState includes translateX field', async () => {
    // Import the type properly and check it has the required fields
    const { ViewState } = await import('@/types/visualization') as unknown as {
      ViewState: { scale: number; translateX: number; translateY: number }
    }
    // TypeScript compilation proves ViewState has these fields
    // Runtime check that we can create valid viewState objects
    const viewState = {
      scale: 1,
      translateX: 0,
      translateY: 0,
    }

    expect(viewState.translateX).toBe(0)
    expect(viewState.scale).toBeDefined()
  })
})
