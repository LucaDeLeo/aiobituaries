/**
 * Reduced Motion Animation Utilities Tests
 *
 * Tests for reduced motion support utilities in animation.ts.
 * Story: 6-6-reduced-motion-support
 */
import { describe, it, expect } from 'vitest'
import type { Variants } from 'motion/react'
import {
  REDUCED_DURATION,
  REDUCED_SPRINGS,
  getReducedMotionVariants,
  getScrollBehavior,
} from '@/lib/utils/animation'

describe('REDUCED_DURATION', () => {
  it('exports near-zero duration constant', () => {
    expect(REDUCED_DURATION).toBe(0.01)
  })

  it('is greater than zero to allow state registration', () => {
    expect(REDUCED_DURATION).toBeGreaterThan(0)
  })

  it('is much smaller than normal durations', () => {
    expect(REDUCED_DURATION).toBeLessThan(0.1)
  })
})

describe('REDUCED_SPRINGS', () => {
  it('exports reduced motion spring presets', () => {
    expect(REDUCED_SPRINGS.hover).toBeDefined()
    expect(REDUCED_SPRINGS.zoom).toBeDefined()
    expect(REDUCED_SPRINGS.pan).toBeDefined()
  })

  it('hover preset has near-zero duration', () => {
    expect(REDUCED_SPRINGS.hover).toEqual({ duration: REDUCED_DURATION })
  })

  it('zoom preset has near-zero duration', () => {
    expect(REDUCED_SPRINGS.zoom).toEqual({ duration: REDUCED_DURATION })
  })

  it('pan preset has near-zero duration', () => {
    expect(REDUCED_SPRINGS.pan).toEqual({ duration: REDUCED_DURATION })
  })

  it('all presets use same reduced duration', () => {
    expect(REDUCED_SPRINGS.hover.duration).toBe(REDUCED_SPRINGS.zoom.duration)
    expect(REDUCED_SPRINGS.zoom.duration).toBe(REDUCED_SPRINGS.pan.duration)
  })
})

describe('getReducedMotionVariants', () => {
  const sampleVariants: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 5 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: { opacity: 0, scale: 0.95 },
  }

  it('returns original variants when prefersReducedMotion is false', () => {
    const result = getReducedMotionVariants(sampleVariants, false)
    expect(result).toEqual(sampleVariants)
    expect(result).toBe(sampleVariants) // Same reference
  })

  it('returns simplified variants when prefersReducedMotion is true', () => {
    const result = getReducedMotionVariants(sampleVariants, true)
    expect(result).not.toBe(sampleVariants) // Different reference
    expect(result).not.toEqual(sampleVariants)
  })

  it('preserves final state values in reduced motion mode', () => {
    const result = getReducedMotionVariants(sampleVariants, true)

    // Check initial state preserved
    const initialResult = result.initial as Record<string, unknown>
    expect(initialResult.opacity).toBe(0)
    expect(initialResult.scale).toBe(0.95)
    expect(initialResult.y).toBe(5)

    // Check animate state preserved
    const animateResult = result.animate as Record<string, unknown>
    expect(animateResult.opacity).toBe(1)
    expect(animateResult.scale).toBe(1)
    expect(animateResult.y).toBe(0)

    // Check exit state preserved
    const exitResult = result.exit as Record<string, unknown>
    expect(exitResult.opacity).toBe(0)
    expect(exitResult.scale).toBe(0.95)
  })

  it('replaces transitions with reduced duration', () => {
    const result = getReducedMotionVariants(sampleVariants, true)

    const animateResult = result.animate as Record<string, unknown>
    expect(animateResult.transition).toEqual({ duration: REDUCED_DURATION })
  })

  it('removes original transition properties', () => {
    const result = getReducedMotionVariants(sampleVariants, true)

    const animateResult = result.animate as Record<string, unknown>
    const transition = animateResult.transition as Record<string, unknown>

    expect(transition.ease).toBeUndefined()
    expect(transition.type).toBeUndefined()
    expect(transition.stiffness).toBeUndefined()
    expect(transition.damping).toBeUndefined()
  })

  it('handles variants without transitions', () => {
    const simpleVariants: Variants = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    }

    const result = getReducedMotionVariants(simpleVariants, true)

    const animateResult = result.animate as Record<string, unknown>
    expect(animateResult.transition).toEqual({ duration: REDUCED_DURATION })
  })

  it('handles empty variants object', () => {
    const emptyVariants: Variants = {}
    const result = getReducedMotionVariants(emptyVariants, true)
    expect(result).toEqual({})
  })

  it('handles non-object variant values', () => {
    // Test with string variant reference (motion/react allows string references at runtime)
    const mixedVariants = {
      initial: { opacity: 0 },
      animate: 'visible', // String variant name reference
    } as unknown as Variants

    const result = getReducedMotionVariants(mixedVariants, true)
    expect(result.animate).toBe('visible')
  })

  it('handles spring transitions', () => {
    const springVariants: Variants = {
      initial: { scale: 0 },
      animate: {
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      },
    }

    const result = getReducedMotionVariants(springVariants, true)
    const animateResult = result.animate as Record<string, unknown>

    expect(animateResult.transition).toEqual({ duration: REDUCED_DURATION })
    expect(animateResult.scale).toBe(1)
  })
})

describe('getScrollBehavior', () => {
  it('returns "auto" when reduced motion is preferred', () => {
    const result = getScrollBehavior(true)
    expect(result).toBe('auto')
  })

  it('returns "smooth" when reduced motion is not preferred', () => {
    const result = getScrollBehavior(false)
    expect(result).toBe('smooth')
  })

  it('returns valid ScrollBehavior type', () => {
    const validBehaviors: ScrollBehavior[] = ['auto', 'smooth', 'instant']
    expect(validBehaviors).toContain(getScrollBehavior(true))
    expect(validBehaviors).toContain(getScrollBehavior(false))
  })
})
