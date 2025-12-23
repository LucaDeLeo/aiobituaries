'use client'

import { useReducedMotion } from 'framer-motion'
import { getScrollBehavior } from '@/lib/utils/animation'

export interface SkipLinkProps {
  /** Target element ID to jump to (default: 'main-content') */
  targetId?: string
  /** Link text (default: 'Skip to main content') */
  children?: React.ReactNode
}

/**
 * Skip link component for keyboard accessibility.
 * Appears visually on Tab focus and jumps to main content on activation.
 * Respects prefers-reduced-motion preference for scroll behavior (AC-6.6.9).
 *
 * @example
 * ```tsx
 * <SkipLink targetId="main-content">Skip to main content</SkipLink>
 * ```
 */
export function SkipLink({
  targetId = 'main-content',
  children = 'Skip to main content',
}: SkipLinkProps) {
  // Check reduced motion preference for scroll behavior
  const prefersReducedMotion = useReducedMotion() ?? false

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: getScrollBehavior(prefersReducedMotion) })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-2 focus:rounded-lg
        focus:bg-[var(--accent-primary)] focus:text-[var(--bg-primary)]
        focus:font-medium focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-[var(--accent-primary)]
      "
    >
      {children}
    </a>
  )
}
