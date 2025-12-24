/**
 * useAnimatedDomain Hook Tests
 *
 * Tests for the hook that provides smooth domain transitions for Y-axis scales.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnimatedDomain } from '@/lib/hooks/use-animated-domain'

describe('useAnimatedDomain', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Initial state', () => {
    it('returns initial domain matching targetDomain', () => {
      const { result } = renderHook(() =>
        useAnimatedDomain({ targetDomain: [0, 100] })
      )

      expect(result.current.domain).toEqual([0, 100])
    })

    it('isAnimating is false initially', () => {
      const { result } = renderHook(() =>
        useAnimatedDomain({ targetDomain: [0, 100] })
      )

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('Domain changes', () => {
    it('updates domain when targetDomain changes', async () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDomain({ targetDomain: domain }),
        { initialProps: { domain: [0, 100] as [number, number] } }
      )

      expect(result.current.domain).toEqual([0, 100])

      // Change domain
      rerender({ domain: [0, 200] })

      // Advance timers to complete animation
      await act(async () => {
        vi.advanceTimersByTime(700) // Slightly more than 600ms duration
      })

      expect(result.current.domain).toEqual([0, 200])
    })

    it('sets isAnimating true during transition', async () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDomain({ targetDomain: domain }),
        { initialProps: { domain: [0, 100] as [number, number] } }
      )

      // Change domain
      rerender({ domain: [0, 200] })

      // Advance one frame
      await act(async () => {
        vi.advanceTimersByTime(16)
      })

      expect(result.current.isAnimating).toBe(true)

      // Complete animation
      await act(async () => {
        vi.advanceTimersByTime(700)
      })

      expect(result.current.isAnimating).toBe(false)
    })

    it('does not animate when domain values are the same', () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDomain({ targetDomain: domain }),
        { initialProps: { domain: [0, 100] as [number, number] } }
      )

      // Rerender with same values
      rerender({ domain: [0, 100] })

      expect(result.current.isAnimating).toBe(false)
      expect(result.current.domain).toEqual([0, 100])
    })
  })

  describe('Animation behavior', () => {
    it('interpolates domain during animation', async () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDomain({ targetDomain: domain }),
        { initialProps: { domain: [0, 100] as [number, number] } }
      )

      rerender({ domain: [0, 200] })

      // Advance to ~50% of animation
      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      // Domain should be somewhere between [0,100] and [0,200]
      // With easeOutQuart at 50%, progress is actually ~0.94 (fast start, slow end)
      // So domain[1] should be between 100 and 200
      expect(result.current.domain[0]).toBe(0)
      expect(result.current.domain[1]).toBeGreaterThan(100)
      expect(result.current.domain[1]).toBeLessThanOrEqual(200)
    })

    it('cancels previous animation when domain changes rapidly', async () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDomain({ targetDomain: domain }),
        { initialProps: { domain: [0, 100] as [number, number] } }
      )

      // First change
      rerender({ domain: [0, 200] })

      await act(async () => {
        vi.advanceTimersByTime(100) // Partial animation
      })

      // Second change before first completes
      rerender({ domain: [0, 300] })

      // Complete animation
      await act(async () => {
        vi.advanceTimersByTime(700)
      })

      // Should end at final target, not intermediate
      expect(result.current.domain).toEqual([0, 300])
    })
  })

  describe('Custom duration', () => {
    it('respects custom duration parameter', async () => {
      const { result, rerender } = renderHook(
        ({ domain, duration }) =>
          useAnimatedDomain({ targetDomain: domain, duration }),
        { initialProps: { domain: [0, 100] as [number, number], duration: 1000 } }
      )

      rerender({ domain: [0, 200], duration: 1000 })

      // At 600ms (default duration), should still be animating
      await act(async () => {
        vi.advanceTimersByTime(600)
      })

      expect(result.current.isAnimating).toBe(true)
      expect(result.current.domain[1]).toBeLessThan(200)

      // Complete animation
      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      expect(result.current.domain).toEqual([0, 200])
    })
  })

  describe('Return value stability', () => {
    it('returns memoized result object when nothing changes', () => {
      const { result, rerender } = renderHook(
        ({ domain }) => useAnimatedDomain({ targetDomain: domain }),
        { initialProps: { domain: [0, 100] as [number, number] } }
      )

      const firstResult = result.current

      // Rerender with same props
      rerender({ domain: [0, 100] })

      // Result object should be the same reference if nothing changed
      expect(result.current).toBe(firstResult)
    })
  })
})

describe('useAnimatedDomain interface', () => {
  it('exports correct types', () => {
    const { result } = renderHook(() =>
      useAnimatedDomain({ targetDomain: [0, 100] })
    )

    // Type checks - these would fail at compile time if types are wrong
    const domain: [number, number] = result.current.domain
    const isAnimating: boolean = result.current.isAnimating

    expect(domain).toHaveLength(2)
    expect(typeof isAnimating).toBe('boolean')
  })
})
