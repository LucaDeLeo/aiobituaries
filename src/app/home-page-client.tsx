'use client'

/**
 * HomePageClient Component
 *
 * Client wrapper for desktop homepage that coordinates state between
 * ControlPanel and visualization. This serves as the single source of truth
 * for URL state, calling useVisualizationState once and passing state down
 * via props to child components.
 *
 * State flow:
 * URL (?metrics=compute,mmlu&cat=market)
 *     |
 *     v
 * useVisualizationState()
 *     |
 *     +---> ControlPanelWrapper ---> ControlPanel
 *     |                                   |
 *     v                                   v
 * HomeClient               [MetricsToggle, CategoryCheckboxes]
 *     |
 *     v
 * ScatterPlot (filters + renders)
 */

import { useMemo } from 'react'
import { HomeClient } from './home-client'
import { ControlPanelWrapper } from '@/components/controls'
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import { useViewModeStorage } from '@/components/obituary/table-view-toggle'
import { getUTCYear } from '@/lib/utils/date'
import { matchesSearch } from '@/lib/utils/filters'
import type { ObituarySummary } from '@/types/obituary'

interface HomePageClientProps {
  /** Obituaries data from server-side fetch */
  obituaries: ObituarySummary[]
}

/**
 * Client wrapper for desktop homepage that coordinates state between
 * ControlPanel and visualization. Single source of truth for URL state.
 */
// P2.5 fix: matchesSearch moved to @/lib/utils/filters for deduplication

export function HomePageClient({ obituaries }: HomePageClientProps) {
  const {
    metric,
    categories,
    searchQuery,
    selectedSkeptic,
  } = useVisualizationState()

  // P2.1 fix: Get view mode to calculate count matching the actual view
  const { mode, isHydrated } = useViewModeStorage()

  // Calculate visible count based on active filters
  // P2.1 fix: Year filter only applies to visualization view, not table view
  // P1.2 fix: Use UTC year to avoid timezone-related off-by-one errors
  const VISUALIZATION_MIN_YEAR = 2000
  const visibleCount = useMemo(() => {
    // During SSR/hydration, assume visualization mode (year filter applies)
    const applyYearFilter = !isHydrated || mode === 'visualization'

    return obituaries.filter((obit) => {
      // Year filter (2000+) - only for visualization mode
      // Use UTC to avoid off-by-one errors in negative timezones
      if (applyYearFilter) {
        const year = getUTCYear(obit.date)
        if (year < VISUALIZATION_MIN_YEAR) return false
      }
      // Category filter (empty = all)
      const matchesCategory = categories.length === 0 ||
        obit.categories?.some((cat) => categories.includes(cat))
      // Search filter (empty = all)
      const matchesSearchQuery = matchesSearch(obit, searchQuery)
      // Skeptic filter (null = all)
      const matchesSkeptic = !selectedSkeptic || obit.skeptic?.slug === selectedSkeptic
      return matchesCategory && matchesSearchQuery && matchesSkeptic
    }).length
  }, [obituaries, categories, searchQuery, selectedSkeptic, mode, isHydrated])

  return (
    <>
      {/* Chart section - fills grid cell, no min-height to prevent overflow */}
      <section className="relative overflow-hidden h-full">
        <HomeClient
          obituaries={obituaries}
          variant="hero"
          selectedMetric={metric}
          activeCategories={categories}
          searchQuery={searchQuery}
          selectedSkeptic={selectedSkeptic}
        />
      </section>

      {/* Sidebar */}
      <aside className="border-l border-border overflow-y-auto bg-secondary" aria-label="Controls panel">
        <ControlPanelWrapper
          totalCount={obituaries.length}
          visibleCount={visibleCount}
          obituaries={obituaries}
          variant="sidebar"
        />
      </aside>
    </>
  )
}
