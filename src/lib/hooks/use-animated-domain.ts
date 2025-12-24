/**
 * useAnimatedDomain Hook
 *
 * Animates Y-axis domain transitions when switching metrics.
 * Uses requestAnimationFrame for smooth 600ms transitions
 * with easeOutQuart easing to match the background line morph.
 *
 * Respects prefers-reduced-motion for accessibility.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Animation duration in milliseconds.
 * Matches the background chart line morph duration.
 */
const ANIMATION_DURATION_MS = 600

/**
 * Ease-out quart function for smooth deceleration.
 * Matches the background chart's easing for visual cohesion.
 */
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

/**
 * Interpolate between two domain values
 */
function lerpDomain(
  from: [number, number],
  to: [number, number],
  progress: number
): [number, number] {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
  ]
}

export interface UseAnimatedDomainOptions {
  /** Target domain to animate to */
  targetDomain: [number, number]
  /** Animation duration in ms (default: 600) */
  duration?: number
}

export interface UseAnimatedDomainResult {
  /** Current animated domain value */
  domain: [number, number]
  /** Whether animation is currently in progress */
  isAnimating: boolean
}

/**
 * Hook that provides smooth domain transitions for Y-axis scales.
 *
 * @param options.targetDomain - The domain to animate towards
 * @param options.duration - Animation duration in ms (default 600)
 * @returns { domain, isAnimating } - Current animated domain and animation state
 *
 * @example
 * const { domain, isAnimating } = useAnimatedDomain({
 *   targetDomain: metricConfig.domain
 * })
 * const yScale = createLinearYScale(height, domain)
 */
export function useAnimatedDomain({
  targetDomain,
  duration = ANIMATION_DURATION_MS,
}: UseAnimatedDomainOptions): UseAnimatedDomainResult {
  // Check reduced motion preference
  const prefersReducedMotion = useReducedMotion()
  const shouldReduceMotion = prefersReducedMotion ?? false

  // Current animated domain
  const [animatedDomain, setAnimatedDomain] = useState<[number, number]>(targetDomain)

  // Animation refs
  const animationFrameRef = useRef<number | null>(null)
  const previousDomainRef = useRef<[number, number]>(targetDomain)
  // Use ref to capture current domain at animation start (avoids stale closure)
  const animatedDomainRef = useRef<[number, number]>(targetDomain)
  const [isAnimating, setIsAnimating] = useState(false)

  // Keep animatedDomainRef in sync with state
  useEffect(() => {
    animatedDomainRef.current = animatedDomain
  }, [animatedDomain])

  // Handle domain changes
  useEffect(() => {
    // Check if domain actually changed
    const domainChanged =
      previousDomainRef.current[0] !== targetDomain[0] ||
      previousDomainRef.current[1] !== targetDomain[1]

    if (!domainChanged) return

    // Cancel any existing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Instant transition for reduced motion
    if (shouldReduceMotion) {
      setAnimatedDomain(targetDomain)
      previousDomainRef.current = targetDomain
      return
    }

    // Capture the starting domain from ref (not stale state)
    const fromDomain: [number, number] = [...animatedDomainRef.current] as [number, number]
    const startTime = performance.now()
    setIsAnimating(true)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const rawProgress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutQuart(rawProgress)

      const interpolated = lerpDomain(fromDomain, targetDomain, easedProgress)
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
