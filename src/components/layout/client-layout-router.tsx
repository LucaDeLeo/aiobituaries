'use client'

import type { ReactNode } from 'react'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'

interface ClientLayoutRouterProps {
  /** Content to render on mobile (< 768px) */
  mobile: ReactNode
  /** Content to render on tablet (768px - 1024px). Falls back to mobile if not provided. */
  tablet?: ReactNode
  /** Content to render on desktop (>= 1024px) */
  desktop: ReactNode
  /** Fallback while detecting breakpoint */
  fallback?: ReactNode
}

/**
 * P0.4 fix: Conditionally renders mobile, tablet, or desktop content based on viewport width.
 * Prevents double-mounting of heavy component trees by mounting ONLY ONE branch.
 *
 * Uses useBreakpoint hook which returns 'mobile' | 'tablet' | 'desktop'.
 * Only ONE tree is mounted at a time, preventing duplicate hooks and resize listeners.
 *
 * Breakpoints:
 * - mobile: < 768px (md)
 * - tablet: 768px - 1024px
 * - desktop: >= 1024px (lg)
 */
export function ClientLayoutRouter({
  mobile,
  tablet,
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

  // Tablet: md to lg breakpoint (768px - 1024px)
  if (breakpoint === 'tablet') {
    // Fall back to mobile content if tablet-specific content not provided
    return <>{tablet ?? mobile}</>
  }

  // Mobile: below md breakpoint (< 768px)
  return <>{mobile}</>
}
