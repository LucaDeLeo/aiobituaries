/**
 * Animation Utilities Tests
 *
 * Tests for animation presets and utilities used throughout the application.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  DURATIONS,
  SPRINGS,
  shouldReduceMotion,
  getTransition,
  tooltipAppear,
} from '@/lib/utils/animation'

describe('DURATIONS', () => {
  it('exports standard duration presets', () => {
    expect(DURATIONS.fast).toBe(0.15)
    expect(DURATIONS.normal).toBe(0.2)
    expect(DURATIONS.slow).toBe(0.3)
  })

  it('durations are in seconds', () => {
    expect(DURATIONS.fast).toBeLessThan(1)
    expect(DURATIONS.normal).toBeLessThan(1)
    expect(DURATIONS.slow).toBeLessThan(1)
  })
})

describe('SPRINGS', () => {
  it('exports spring animation presets', () => {
    expect(SPRINGS.hover).toBeDefined()
    expect(SPRINGS.zoom).toBeDefined()
    expect(SPRINGS.pan).toBeDefined()
  })

  it('hover spring has correct configuration', () => {
    expect(SPRINGS.hover).toEqual({
      type: 'spring',
      stiffness: 300,
      damping: 20,
    })
  })

  it('zoom spring has correct configuration', () => {
    expect(SPRINGS.zoom).toEqual({
      type: 'spring',
      stiffness: 300,
      damping: 30,
    })
  })

  it('pan spring has correct configuration', () => {
    expect(SPRINGS.pan).toEqual({
      type: 'spring',
      stiffness: 100,
      damping: 20,
    })
  })
})

describe('tooltipAppear', () => {
  it('exports tooltip animation variants', () => {
    expect(tooltipAppear).toBeDefined()
    expect(tooltipAppear.initial).toBeDefined()
    expect(tooltipAppear.animate).toBeDefined()
    expect(tooltipAppear.exit).toBeDefined()
  })

  it('initial state has correct values', () => {
    expect(tooltipAppear.initial).toEqual({
      opacity: 0,
      scale: 0.95,
      y: 5,
    })
  })

  it('animate state transitions to full visibility', () => {
    expect(tooltipAppear.animate).toEqual({
      opacity: 1,
      scale: 1,
      y: 0,
    })
  })

  it('exit state fades out with scale', () => {
    expect(tooltipAppear.exit).toEqual({
      opacity: 0,
      scale: 0.95,
    })
  })

  it('uses subtle scale animation (0.95 to 1)', () => {
    const initial = tooltipAppear.initial as { scale: number }
    const animate = tooltipAppear.animate as { scale: number }

    expect(initial.scale).toBe(0.95)
    expect(animate.scale).toBe(1)
    expect(animate.scale - initial.scale).toBeCloseTo(0.05) // Subtle 5% scale
  })

  it('uses small upward movement (5px)', () => {
    const initial = tooltipAppear.initial as { y: number }
    const animate = tooltipAppear.animate as { y: number }
    expect(initial.y).toBe(5)
    expect(animate.y).toBe(0)
  })
})

describe('shouldReduceMotion', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false when window is undefined (SSR)', () => {
    const originalWindow = global.window
    // @ts-expect-error - Testing SSR environment
    delete global.window

    expect(shouldReduceMotion()).toBe(false)

    global.window = originalWindow
  })

  it('returns false when matchMedia is not available', () => {
    const originalMatchMedia = window.matchMedia
    // @ts-expect-error - Testing missing matchMedia
    delete window.matchMedia

    expect(shouldReduceMotion()).toBe(false)

    window.matchMedia = originalMatchMedia
  })

  it('checks for prefers-reduced-motion media query', () => {
    const matchMediaMock = vi.fn()
    matchMediaMock.mockReturnValue({ matches: false })
    window.matchMedia = matchMediaMock

    shouldReduceMotion()

    expect(matchMediaMock).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)'
    )
  })
})

describe('getTransition', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns spring configuration when motion is not reduced', () => {
    const matchMediaMock = vi.fn()
    matchMediaMock.mockReturnValue({ matches: false })
    window.matchMedia = matchMediaMock

    const transition = getTransition('hover')
    expect(transition).toEqual(SPRINGS.hover)
  })

  it('returns zero duration when motion is reduced', () => {
    const matchMediaMock = vi.fn()
    matchMediaMock.mockReturnValue({ matches: true })
    window.matchMedia = matchMediaMock

    const transition = getTransition('hover')
    expect(transition).toEqual({ duration: 0 })
  })

  it('works with different spring presets', () => {
    const matchMediaMock = vi.fn()
    matchMediaMock.mockReturnValue({ matches: false })
    window.matchMedia = matchMediaMock

    expect(getTransition('hover')).toEqual(SPRINGS.hover)
    expect(getTransition('zoom')).toEqual(SPRINGS.zoom)
    expect(getTransition('pan')).toEqual(SPRINGS.pan)
  })
})
