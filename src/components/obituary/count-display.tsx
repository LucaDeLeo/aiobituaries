'use client'

import { useMemo } from 'react'
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import type { ObituarySummary } from '@/types/obituary'

export interface CountDisplayProps {
  /** Total obituary count */
  count: number
  /** Optional obituaries for filtered count calculation */
  obituaries?: ObituarySummary[]
}

/**
 * Hero count display component.
 * Displays obituary count prominently with gold styling and pulsing glow animation.
 * Responds to active category filters via URL state.
 *
 * Features:
 * - Massive, dramatic number display (dominates viewport)
 * - Geist Mono font for the number with tight tracking
 * - Editorial "OBITUARIES" label with wide letter spacing
 * - Gold accent color (#C9A962) with enhanced glow
 * - Decorative horizontal rules for archival aesthetic
 * - Responsive sizing scaling from mobile to large desktop
 * - Screen reader accessible with descriptive label
 */
export function CountDisplay({ count, obituaries }: CountDisplayProps) {
  const { categories } = useVisualizationState()

  // Calculate filtered count based on active categories
  const { displayCount, isFiltered } = useMemo(() => {
    if (!obituaries || categories.length === 0) {
      return { displayCount: count, isFiltered: false }
    }
    const filtered = obituaries.filter((obit) =>
      obit.categories?.some((cat) => categories.includes(cat))
    ).length
    return { displayCount: filtered, isFiltered: true }
  }, [obituaries, categories, count])

  const formattedCount = new Intl.NumberFormat('en-US').format(displayCount)

  return (
    <div className="text-center relative">
      {/* Decorative top line - smaller on mobile */}
      <div className="flex items-center justify-center gap-3 mb-3 md:mb-6" aria-hidden="true">
        <div className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent to-[var(--accent-primary)]/50" />
        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rotate-45 border border-[var(--accent-primary)]/50" />
        <div className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent to-[var(--accent-primary)]/50" />
      </div>

      {/* Main h1 heading - responsive sizing */}
      <h1 className="relative">
        <span className="sr-only">
          {isFiltered ? `${displayCount} of ${count}` : count} AI Obituaries
        </span>

        {/* The number - more compact on mobile */}
        <span
          aria-hidden="true"
          className="block font-mono text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] xl:text-[14rem]
                     text-[var(--accent-primary)] animate-pulse-glow motion-reduce:animate-none
                     tracking-tighter leading-none"
        >
          {formattedCount}
        </span>

        {/* Editorial label with wide tracking */}
        <span
          aria-hidden="true"
          className="block mt-1 md:mt-4 text-xs sm:text-base md:text-xl lg:text-2xl
                     tracking-[0.2em] md:tracking-[0.35em] uppercase
                     text-[var(--text-secondary)] font-sans font-light"
        >
          Obituaries
        </span>
      </h1>

      {/* Decorative bottom line */}
      <div className="flex items-center justify-center gap-3 mt-3 md:mt-6" aria-hidden="true">
        <div className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent to-[var(--accent-primary)]/50" />
        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rotate-45 border border-[var(--accent-primary)]/50" />
        <div className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent to-[var(--accent-primary)]/50" />
      </div>

      {/* Filter indicator */}
      {isFiltered && (
        <p
          aria-hidden="true"
          className="mt-1 md:mt-2 text-xs md:text-sm text-[var(--text-muted)]"
        >
          of {count} total
        </p>
      )}

      {/* Tagline - more compact on mobile */}
      <p className="mt-3 md:mt-8 text-[10px] md:text-sm text-[var(--text-muted)] font-serif italic max-w-xs md:max-w-md mx-auto leading-tight">
        A memorial to the ever-dying predictions of AI doom
      </p>
    </div>
  )
}
