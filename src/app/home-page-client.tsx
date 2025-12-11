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
 * URL (?metrics=compute,mmlu&from=2015&to=2025&cat=market)
 *     |
 *     v
 * useVisualizationState()
 *     |
 *     +---> ControlPanelWrapper ---> ControlPanel
 *     |                                   |
 *     v                                   v
 * HomeClient               [MetricsToggle, DateRangeSlider, CategoryCheckboxes]
 *     |
 *     v
 * ScatterPlot (filters + renders)
 */

import { useMemo } from 'react'
import { HomeClient } from './home-client'
import { ControlPanelWrapper } from '@/components/controls'
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import type { ObituarySummary } from '@/types/obituary'

interface HomePageClientProps {
  /** Obituaries data from server-side fetch */
  obituaries: ObituarySummary[]
}

/**
 * Client wrapper for desktop homepage that coordinates state between
 * ControlPanel and visualization. Single source of truth for URL state.
 */
export function HomePageClient({ obituaries }: HomePageClientProps) {
  const {
    metrics,
    categories,
    dateRange,
  } = useVisualizationState()

  // Calculate visible count based on category filter
  // Only categories affect visible count (not metrics or dateRange) because:
  // - Metrics toggle background lines, not points
  // - DateRange affects Y-axis domain, not which points render
  const visibleCount = useMemo(() => {
    if (categories.length === 0) return obituaries.length
    return obituaries.filter((obit) =>
      obit.categories?.some((cat) => categories.includes(cat))
    ).length
  }, [obituaries, categories])

  return (
    <>
      {/* Chart section */}
      <section className="relative overflow-hidden h-full">
        <HomeClient
          obituaries={obituaries}
          variant="hero"
          enabledMetrics={metrics}
          dateRange={dateRange}
          activeCategories={categories}
        />
      </section>

      {/* Sidebar */}
      <aside className="border-l border-border overflow-y-auto bg-secondary" aria-label="Controls panel">
        <ControlPanelWrapper
          totalCount={obituaries.length}
          visibleCount={visibleCount}
          variant="sidebar"
        />
      </aside>
    </>
  )
}
