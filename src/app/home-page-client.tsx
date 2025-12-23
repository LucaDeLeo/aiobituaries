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
  } = useVisualizationState()

  // Calculate visible count based on category filter
  // Only categories affect visible count (not metrics) because:
  // - Metrics toggle background lines, not points
  const visibleCount = useMemo(() => {
    if (categories.length === 0) return obituaries.length
    return obituaries.filter((obit) =>
      obit.categories?.some((cat) => categories.includes(cat))
    ).length
  }, [obituaries, categories])

  return (
    <>
      {/* Chart section - min-h prevents CLS during hydration */}
      <section className="relative overflow-hidden h-full min-h-[500px]">
        <HomeClient
          obituaries={obituaries}
          variant="hero"
          enabledMetrics={metrics}
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
