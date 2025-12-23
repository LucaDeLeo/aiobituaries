'use client'

import { useMemo } from 'react'
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import type { ObituarySummary } from '@/types/obituary'

export interface CountDisplayCompactProps {
  /** Total obituary count */
  count: number
  /** Optional obituaries for filtered count calculation */
  obituaries?: ObituarySummary[]
}

/**
 * Compact count display for desktop header.
 * Displays inline with smaller styling - no decorative elements.
 * Responds to active category filters via URL state.
 */
export function CountDisplayCompact({ count, obituaries }: CountDisplayCompactProps) {
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
    <div className="flex items-center gap-2">
      <span className="sr-only">
        {isFiltered ? `${displayCount} of ${count}` : count} AI Obituaries
      </span>
      <span
        aria-hidden="true"
        className="font-mono text-2xl text-primary font-semibold tracking-tight"
      >
        {formattedCount}
      </span>
      <span
        aria-hidden="true"
        className="text-sm text-muted-foreground uppercase tracking-wider"
      >
        Obituaries
      </span>
      {isFiltered && (
        <span
          aria-hidden="true"
          className="text-xs text-muted-foreground"
        >
          of {count}
        </span>
      )}
    </div>
  )
}
