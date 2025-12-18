'use client'

import type { ReactNode } from 'react'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'

interface ClientLayoutRouterProps {
  /** Content to render on mobile/tablet (< 1024px) */
  mobile: ReactNode
  /** Content to render on desktop (>= 1024px) */
  desktop: ReactNode
  /** Fallback while detecting breakpoint */
  fallback?: ReactNode
}

/**
 * Conditionally renders mobile or desktop content based on viewport width.
 * Prevents double-mounting of heavy component trees.
 *
 * Uses useBreakpoint hook which returns 'mobile' | 'tablet' | 'desktop'.
 * Only ONE tree is mounted at a time, preventing duplicate hooks and state.
 */
export function ClientLayoutRouter({
  mobile,
  desktop,
  fallback = null,
}: ClientLayoutRouterProps) {
  const breakpoint = useBreakpoint()

  // During SSR/hydration, breakpoint may be undefined briefly
  // Show fallback or desktop (most common for initial page load)
  if (!breakpoint) {
    return <>{fallback}</>
  }

  // Desktop: lg breakpoint (1024px+)
  if (breakpoint === 'desktop') {
    return <>{desktop}</>
  }

  // Mobile and Tablet: below lg breakpoint
  return <>{mobile}</>
}
