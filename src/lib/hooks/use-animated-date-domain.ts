/**
 * useAnimatedDateDomain Hook
 *
 * Animates X-axis date domain transitions when switching metrics.
 * Uses requestAnimationFrame for smooth 600ms transitions
 * with easeOutQuart easing to match the Y-axis and background line morph.
 *
 * Respects prefers-reduced-motion for accessibility.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ANIMATION_DURATION_MS, easeOutQuart } from '@/lib/utils/animation-easing'

// Re-export for consumers that need the constant
export { ANIMATION_DURATION_MS }

/**
 * Interpolate between two date domain values using timestamps.
 *
 * Converts Date objects to milliseconds for linear interpolation,
 * then converts back to Date objects for the result.
 *
 * @param from - Starting domain [startDate, endDate]
 * @param to - Target domain [startDate, endDate]
 * @param progress - Interpolation progress from 0 to 1
 * @returns Interpolated domain as [Date, Date]
 */
function lerpDateDomain(
  from: [Date, Date],
  to: [Date, Date],
  progress: number
): [Date, Date] {
  const fromStartMs = from[0].getTime()
  const fromEndMs = from[1].getTime()
  const toStartMs = to[0].getTime()
  const toEndMs = to[1].getTime()

  return [
    new Date(fromStartMs + (toStartMs - fromStartMs) * progress),
    new Date(fromEndMs + (toEndMs - fromEndMs) * progress),
  ]
}

export interface UseAnimatedDateDomainOptions {
  /** Target domain to animate to */
  targetDomain: [Date, Date]
  /** Animation duration in ms (default: 600) */
  duration?: number
}

export interface UseAnimatedDateDomainResult {
  /** Current animated domain value */
  domain: [Date, Date]
  /** Whether animation is currently in progress */
  isAnimating: boolean
}

/**
 * Hook that provides smooth date domain transitions for X-axis scales.
 *
 * @param options.targetDomain - The date domain to animate towards
 * @param options.duration - Animation duration in ms (default 600)
 * @returns { domain, isAnimating } - Current animated domain and animation state
 *
 * @example
 * const { domain, isAnimating } = useAnimatedDateDomain({
 *   targetDomain: [metricStartDate, endDate]
 * })
 * const xScale = scaleTime({ domain, range: [0, width] })
 */
export function useAnimatedDateDomain({
  targetDomain,
  duration = ANIMATION_DURATION_MS,
}: UseAnimatedDateDomainOptions): UseAnimatedDateDomainResult {
  // Check reduced motion preference
  const prefersReducedMotion = useReducedMotion()
  const shouldReduceMotion = prefersReducedMotion ?? false

  // Current animated domain
  const [animatedDomain, setAnimatedDomain] = useState<[Date, Date]>(targetDomain)

  // Animation refs
  const animationFrameRef = useRef<number | null>(null)
  const previousDomainRef = useRef<[Date, Date]>(targetDomain)
  // Use ref to capture current domain at animation start (avoids stale closure)
  const animatedDomainRef = useRef<[Date, Date]>(targetDomain)
  const [isAnimating, setIsAnimating] = useState(false)

  // Keep animatedDomainRef in sync with state
  useEffect(() => {
    animatedDomainRef.current = animatedDomain
  }, [animatedDomain])

  // Handle domain changes
  useEffect(() => {
    // Check if domain actually changed (compare timestamps)
    const domainChanged =
      previousDomainRef.current[0].getTime() !== targetDomain[0].getTime() ||
      previousDomainRef.current[1].getTime() !== targetDomain[1].getTime()

    if (!domainChanged) return

    // Cancel any existing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Capture the starting domain from ref (not stale state)
    const fromDomain: [Date, Date] = [
      new Date(animatedDomainRef.current[0].getTime()),
      new Date(animatedDomainRef.current[1].getTime()),
    ]
    const startTime = performance.now()

    let hasStarted = false
    const animate = (currentTime: number) => {
      // Instant transition for reduced motion
      if (shouldReduceMotion) {
        setAnimatedDomain(targetDomain)
        previousDomainRef.current = targetDomain
        animationFrameRef.current = null
        return
      }

      // Signal animation start on first frame (inside rAF for React best practices)
      if (!hasStarted) {
        setIsAnimating(true)
        hasStarted = true
      }

      const elapsed = currentTime - startTime
      const rawProgress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutQuart(rawProgress)

      const interpolated = lerpDateDomain(fromDomain, targetDomain, easedProgress)
      setAnimatedDomain(interpolated)

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        animationFrameRef.current = null
        previousDomainRef.current = targetDomain
        setIsAnimating(false)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [targetDomain, duration, shouldReduceMotion])

  // Memoize the result to prevent unnecessary rerenders
  const result = useMemo(
    () => ({ domain: animatedDomain, isAnimating }),
    [animatedDomain, isAnimating]
  )

  return result
}
