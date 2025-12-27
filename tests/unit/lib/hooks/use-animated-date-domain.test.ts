/**
 * useAnimatedDateDomain Hook Tests
 *
 * Tests for the hook that provides smooth date domain transitions for X-axis scales.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnimatedDateDomain, ANIMATION_DURATION_MS } from '@/lib/hooks/use-animated-date-domain'

// Mock framer-motion's useReducedMotion hook
const mockUseReducedMotion = vi.fn(() => false)
vi.mock('framer-motion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}))

// Buffer time to ensure animation completes
const ANIMATION_BUFFER_MS = 100

describe('useAnimatedDateDomain', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockUseReducedMotion.mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  const jan2000 = new Date('2000-01-01')
  const jan2010 = new Date('2010-01-01')
  const jan2020 = new Date('2020-01-01')
  const jan2025 = new Date('2025-01-01')

  describe('Initial state', () => {
    it('returns initial domain matching targetDomain', () => {
      const { result } = renderHook(() =>
        useAnimatedDateDomain({ targetDomain: [jan2000, jan2020] })
      )

      expect(result.current.domain[0].getTime()).toBe(jan2000.getTime())
      expect(result.current.domain[1].getTime()).toBe(jan2020.getTime())
    })

    it('isAnimating is false initially', () => {
      const { result } = renderHook(() =>
        useAnimatedDateDomain({ targetDomain: [jan2000, jan2020] })
      )

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('Domain changes', () => {
    it('updates domain when targetDomain changes', async () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
        { initialProps: { domain: [jan2000, jan2020] as [Date, Date] } }
      )

      expect(result.current.domain[0].getTime()).toBe(jan2000.getTime())
      expect(result.current.domain[1].getTime()).toBe(jan2020.getTime())

      // Change domain - simulate switching to a newer metric
      rerender({ domain: [jan2010, jan2025] })

      // Advance timers to complete animation
      await act(async () => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS + ANIMATION_BUFFER_MS)
      })

      expect(result.current.domain[0].getTime()).toBe(jan2010.getTime())
      expect(result.current.domain[1].getTime()).toBe(jan2025.getTime())
    })

    it('sets isAnimating true during transition', async () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
        { initialProps: { domain: [jan2000, jan2020] as [Date, Date] } }
      )

      // Change domain
      rerender({ domain: [jan2010, jan2025] })

      // Advance one frame
      await act(async () => {
        vi.advanceTimersByTime(16)
      })

      expect(result.current.isAnimating).toBe(true)

      // Complete animation
      await act(async () => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS + ANIMATION_BUFFER_MS)
      })

      expect(result.current.isAnimating).toBe(false)
    })

    it('does not animate when domain values are the same', () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
        { initialProps: { domain: [jan2000, jan2020] as [Date, Date] } }
      )

      // Rerender with same values (new Date objects but same timestamps)
      rerender({ domain: [new Date(jan2000.getTime()), new Date(jan2020.getTime())] })

      expect(result.current.isAnimating).toBe(false)
      expect(result.current.domain[0].getTime()).toBe(jan2000.getTime())
      expect(result.current.domain[1].getTime()).toBe(jan2020.getTime())
    })
  })

  describe('Animation behavior', () => {
    it('interpolates domain during animation', async () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
        { initialProps: { domain: [jan2000, jan2020] as [Date, Date] } }
      )

      rerender({ domain: [jan2010, jan2025] })

      // Advance to ~50% of animation
      await act(async () => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS / 2)
      })

      // Domain should be interpolated between start and end
      // Start time should be between jan2000 and jan2010
      expect(result.current.domain[0].getTime()).toBeGreaterThanOrEqual(jan2000.getTime())
      expect(result.current.domain[0].getTime()).toBeLessThanOrEqual(jan2010.getTime())

      // End time should be between jan2020 and jan2025
      expect(result.current.domain[1].getTime()).toBeGreaterThanOrEqual(jan2020.getTime())
      expect(result.current.domain[1].getTime()).toBeLessThanOrEqual(jan2025.getTime())
    })

    it('cancels previous animation when domain changes rapidly', async () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
        { initialProps: { domain: [jan2000, jan2020] as [Date, Date] } }
      )

      // First change
      rerender({ domain: [jan2010, jan2025] })

      await act(async () => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS / 6) // Partial animation (~100ms)
      })

      // Second change before first completes
      const jan2015 = new Date('2015-01-01')
      rerender({ domain: [jan2015, jan2025] })

      // Complete animation
      await act(async () => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS + ANIMATION_BUFFER_MS)
      })

      // Should end at final target, not intermediate
      expect(result.current.domain[0].getTime()).toBe(jan2015.getTime())
      expect(result.current.domain[1].getTime()).toBe(jan2025.getTime())
    })
  })

  describe('Custom duration', () => {
    const CUSTOM_DURATION_MS = 1000

    it('respects custom duration parameter', async () => {
      const { result, rerender } = renderHook(
        ({ domain, duration }) =>
          useAnimatedDateDomain({ targetDomain: domain, duration }),
        { initialProps: { domain: [jan2000, jan2020] as [Date, Date], duration: CUSTOM_DURATION_MS } }
      )

      rerender({ domain: [jan2010, jan2025], duration: CUSTOM_DURATION_MS })

      // At default duration (600ms), should still be animating with custom 1000ms
      await act(async () => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS)
      })

      expect(result.current.isAnimating).toBe(true)
      expect(result.current.domain[0].getTime()).toBeLessThan(jan2010.getTime())

      // Complete animation (remaining time plus buffer)
      await act(async () => {
        vi.advanceTimersByTime(CUSTOM_DURATION_MS - ANIMATION_DURATION_MS + ANIMATION_BUFFER_MS)
      })

      expect(result.current.domain[0].getTime()).toBe(jan2010.getTime())
      expect(result.current.domain[1].getTime()).toBe(jan2025.getTime())
    })
  })

  describe('Return value stability', () => {
    it('returns memoized result object when nothing changes', () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
        { initialProps: { domain: [jan2000, jan2020] as [Date, Date] } }
      )

      const firstResult = result.current

      // Rerender with same props (same date objects)
      rerender({ domain: [jan2000, jan2020] })

      // Result object should be the same reference if nothing changed
      expect(result.current).toBe(firstResult)
    })
  })

  describe('Metric switching scenarios', () => {
    it('animates from METR start (Nov 2019) to Compute start (1950)', async () => {
      const metrStart = new Date('2019-11-01')
      const computeStart = new Date('1950-07-01')
      const endDate = new Date('2025-12-01')

      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
        { initialProps: { domain: [metrStart, endDate] as [Date, Date] } }
      )

      // Switch to compute metric (1950 start)
      rerender({ domain: [computeStart, endDate] })

      // Advance to complete animation
      await act(async () => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS + ANIMATION_BUFFER_MS)
      })

      expect(result.current.domain[0].getTime()).toBe(computeStart.getTime())
      expect(result.current.domain[1].getTime()).toBe(endDate.getTime())
    })

    it('animates from Compute start (1950) to ARC-AGI start (Sept 2024)', async () => {
      const computeStart = new Date('1950-07-01')
      const arcagiStart = new Date('2024-09-01')
      const endDate = new Date('2025-12-01')

      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
        { initialProps: { domain: [computeStart, endDate] as [Date, Date] } }
      )

      // Switch to ARC-AGI metric (2024 start)
      rerender({ domain: [arcagiStart, endDate] })

      // Advance to complete animation
      await act(async () => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS + ANIMATION_BUFFER_MS)
      })

      expect(result.current.domain[0].getTime()).toBe(arcagiStart.getTime())
      expect(result.current.domain[1].getTime()).toBe(endDate.getTime())
    })
  })
})

describe('useAnimatedDateDomain interface', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockUseReducedMotion.mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('exports correct types', () => {
    const { result } = renderHook(() =>
      useAnimatedDateDomain({ targetDomain: [new Date('2000-01-01'), new Date('2025-01-01')] })
    )

    // Type checks - these would fail at compile time if types are wrong
    const domain: [Date, Date] = result.current.domain
    const isAnimating: boolean = result.current.isAnimating

    expect(domain).toHaveLength(2)
    expect(domain[0]).toBeInstanceOf(Date)
    expect(domain[1]).toBeInstanceOf(Date)
    expect(typeof isAnimating).toBe('boolean')
  })
})

describe('useAnimatedDateDomain reduced motion (AC7)', () => {
  const jan2000 = new Date('2000-01-01')
  const jan2010 = new Date('2010-01-01')
  const jan2020 = new Date('2020-01-01')
  const jan2025 = new Date('2025-01-01')

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('instantly transitions when prefers-reduced-motion is true', async () => {
    // Enable reduced motion preference
    mockUseReducedMotion.mockReturnValue(true)

    const { result, rerender } = renderHook(
      ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
      { initialProps: { domain: [jan2000, jan2020] as [Date, Date] } }
    )

    // Change domain
    rerender({ domain: [jan2010, jan2025] })

    // Advance just one frame - should be complete immediately
    await act(async () => {
      vi.advanceTimersByTime(16)
    })

    // Domain should be at final value immediately (no interpolation)
    expect(result.current.domain[0].getTime()).toBe(jan2010.getTime())
    expect(result.current.domain[1].getTime()).toBe(jan2025.getTime())

    // isAnimating should never become true
    expect(result.current.isAnimating).toBe(false)
  })

  it('does not set isAnimating when reduced motion is preferred', async () => {
    mockUseReducedMotion.mockReturnValue(true)

    const animatingStates: boolean[] = []

    const { result, rerender } = renderHook(
      ({ domain }) => {
        const hookResult = useAnimatedDateDomain({ targetDomain: domain })
        animatingStates.push(hookResult.isAnimating)
        return hookResult
      },
      { initialProps: { domain: [jan2000, jan2020] as [Date, Date] } }
    )

    rerender({ domain: [jan2010, jan2025] })

    // Advance through what would be animation time
    await act(async () => {
      vi.advanceTimersByTime(ANIMATION_DURATION_MS + ANIMATION_BUFFER_MS)
    })

    // isAnimating should never have been true
    expect(animatingStates.every(state => state === false)).toBe(true)
    expect(result.current.isAnimating).toBe(false)
  })

  it('animation works normally when reduced motion is false', async () => {
    mockUseReducedMotion.mockReturnValue(false)

    const { result, rerender } = renderHook(
      ({ domain }) => useAnimatedDateDomain({ targetDomain: domain }),
      { initialProps: { domain: [jan2000, jan2020] as [Date, Date] } }
    )

    rerender({ domain: [jan2010, jan2025] })

    // Advance partway through animation
    await act(async () => {
      vi.advanceTimersByTime(ANIMATION_DURATION_MS / 2)
    })

    // Should be animating and interpolated
    expect(result.current.isAnimating).toBe(true)
    expect(result.current.domain[0].getTime()).toBeGreaterThan(jan2000.getTime())
    expect(result.current.domain[0].getTime()).toBeLessThan(jan2010.getTime())

    // Complete animation
    await act(async () => {
      vi.advanceTimersByTime(ANIMATION_DURATION_MS)
    })

    expect(result.current.isAnimating).toBe(false)
    expect(result.current.domain[0].getTime()).toBe(jan2010.getTime())
  })
})
