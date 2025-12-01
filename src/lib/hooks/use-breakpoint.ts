'use client'

import { useEffect, useState } from 'react'
import type { Breakpoint } from '@/types/navigation'
import { BREAKPOINTS } from '@/types/navigation'

/**
 * Hook to detect current responsive breakpoint.
 *
 * Returns 'mobile' | 'tablet' | 'desktop' based on window.innerWidth.
 * Listens for window resize and updates accordingly.
 *
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768-1023px
 * - Desktop: >= 1024px
 *
 * @example
 * ```tsx
 * const breakpoint = useBreakpoint()
 * const isMobile = breakpoint === 'mobile'
 * ```
 */
export function useBreakpoint(): Breakpoint {
  // Default to desktop for SSR compatibility (most common on first render)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')

  useEffect(() => {
    function updateBreakpoint() {
      const width = window.innerWidth
      if (width < BREAKPOINTS.tablet.min) {
        setBreakpoint('mobile')
      } else if (width <= BREAKPOINTS.tablet.max) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    // Set initial breakpoint
    updateBreakpoint()

    // Listen for resize
    window.addEventListener('resize', updateBreakpoint)

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

/**
 * Hook to detect if device supports hover (mouse/trackpad).
 *
 * Uses CSS media query: (hover: hover) and (pointer: fine)
 * - Returns true for desktop with mouse/trackpad
 * - Returns false for touch-only devices
 *
 * @example
 * ```tsx
 * const supportsHover = useSupportsHover()
 *
 * return (
 *   <button
 *     onMouseEnter={supportsHover ? handleHover : undefined}
 *     onClick={!supportsHover ? handleTap : undefined}
 *   />
 * )
 * ```
 */
export function useSupportsHover(): boolean {
  // Initialize with media query state (avoiding SSR issues)
  const [supportsHover, setSupportsHover] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(hover: hover) and (pointer: fine)').matches
    }
    return true // Default for SSR
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => setSupportsHover(e.matches)
    mediaQuery.addEventListener('change', handler)

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return supportsHover
}
