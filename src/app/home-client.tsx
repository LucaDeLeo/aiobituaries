'use client'

/**
 * HomeClient Component
 *
 * Client wrapper for the homepage that enables URL-synced filter state.
 * This component uses the useFilters hook to manage category filters
 * and passes the state to the CategoryFilter component.
 *
 * The homepage server component fetches data and passes it here;
 * this client component handles interactivity and filter state.
 *
 * Also supports alternative table view for accessibility (Story 6-4).
 * Table view toggle is hidden on mobile (desktop/tablet only).
 */

import { useMemo } from 'react'
import { CategoryFilter } from '@/components/filters/category-filter'
import { ScatterPlot } from '@/components/visualization/scatter-plot'
import { CategoryChart } from '@/components/visualization/category-chart'
import { BackgroundChartLegend } from '@/components/visualization/background-chart'
import { allMetrics } from '@/data/ai-metrics'
import {
  TableViewToggle,
  useViewModeStorage,
} from '@/components/obituary/table-view-toggle'
import { ObituaryTable } from '@/components/obituary/obituary-table'
import { useLiveRegionOptional } from '@/components/accessibility/live-region'
import type { ObituarySummary } from '@/types/obituary'
import { useFilters } from '@/lib/hooks/use-filters'

export interface HomeClientProps {
  /** Obituary data from server-side fetch */
  obituaries: ObituarySummary[]
}

/**
 * Client-side portion of the homepage.
 * Manages filter state and passes it to visualization components.
 */
export function HomeClient({ obituaries }: HomeClientProps) {
  const { categories, toggleCategory, clearFilters } = useFilters()
  const { mode, setMode, isHydrated } = useViewModeStorage()
  const liveRegion = useLiveRegionOptional()

  // Calculate filtered count for accessibility announcements
  const filteredCount = useMemo(() => {
    if (categories.length === 0) return obituaries.length
    return obituaries.filter((obit) =>
      obit.categories?.some((cat) => categories.includes(cat))
    ).length
  }, [obituaries, categories])

  // Handle view mode change with screen reader announcement
  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode)
    liveRegion?.announcePolite(
      newMode === 'table'
        ? 'Switched to table view'
        : 'Switched to timeline view'
    )
  }

  return (
    <>
      {/* Timeline/Table Visualization */}
      <section className="container mx-auto px-4 py-8">
        {/* View toggle - hidden on mobile (md:inline-flex) */}
        <div className="flex justify-end mb-4">
          <TableViewToggle mode={mode} onModeChange={handleModeChange} />
        </div>

        {/* Conditional view rendering */}
        {/* During SSR or before hydration, show timeline only */}
        {/* After hydration, show based on user preference */}
        {!isHydrated || mode === 'visualization' ? (
          <>
            <ScatterPlot data={obituaries} activeCategories={categories} />
            <div className="mt-3 flex justify-center">
              <BackgroundChartLegend metrics={allMetrics} />
            </div>
          </>
        ) : (
          <ObituaryTable
            obituaries={obituaries}
            activeCategories={categories}
          />
        )}
      </section>

      {/* Category Breakdown Chart */}
      <section className="max-w-md mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold mb-4 text-[--text-primary]">
          Category Breakdown
        </h2>
        <CategoryChart
          obituaries={obituaries}
          activeCategories={categories}
          onCategoryClick={toggleCategory}
        />
      </section>

      {/* Category Filter Bar */}
      <CategoryFilter
        activeCategories={categories}
        onToggle={toggleCategory}
        onShowAll={clearFilters}
        totalCount={obituaries.length}
        filteredCount={filteredCount}
      />
    </>
  )
}
