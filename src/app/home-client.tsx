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
 *
 * Hero variant: Accepts external state props from parent (HomePageClient)
 * for single-source-of-truth URL state management.
 */

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { CategoryFilter } from '@/components/filters/category-filter'

// Dynamic import for ScatterPlot - reduces initial bundle by ~300KB
// SSR disabled since it's a client-side D3/visx visualization
// Skeleton matches exact ScatterPlot container sizing to prevent CLS
const ScatterPlot = dynamic(
  () => import('@/components/visualization/scatter-plot').then(mod => ({ default: mod.ScatterPlot })),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full min-h-[300px] md:min-h-[400px] bg-[var(--bg-secondary)]"
        role="status"
        aria-label="Loading visualization"
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[var(--text-muted)] text-sm animate-pulse">Loading visualization...</span>
        </div>
      </div>
    ),
  }
)
import { CategoryChart } from '@/components/visualization/category-chart'
import { BackgroundChartLegend } from '@/components/visualization/background-chart'
import { allMetrics } from '@/data/ai-metrics'
import {
  TableViewToggle,
  useViewModeStorage,
} from '@/components/obituary/table-view-toggle'
import { ObituaryTable } from '@/components/obituary/obituary-table'
import { useLiveRegionOptional } from '@/components/accessibility/live-region'
import type { ObituarySummary, Category } from '@/types/obituary'
import type { MetricType } from '@/types/metrics'
import { useFilters } from '@/lib/hooks/use-filters'

export interface HomeClientProps {
  /** Obituary data from server-side fetch */
  obituaries: ObituarySummary[]
  /** Layout variant: 'default' for existing, 'hero' for new grid layout */
  variant?: 'default' | 'hero'
  /** Enabled metrics for background chart (hero variant only) */
  enabledMetrics?: MetricType[]
  /** Active category filters from parent (hero variant only) */
  activeCategories?: Category[]
}

/**
 * Client-side portion of the homepage.
 * Manages filter state and passes it to visualization components.
 */
export function HomeClient({
  obituaries,
  variant = 'default',
  enabledMetrics,
  activeCategories: externalCategories,
}: HomeClientProps) {
  // For default variant, use internal useFilters (backward compat)
  // For hero variant, use external state if provided
  const { categories: internalCategories, toggleCategory, clearFilters } = useFilters()
  const { mode, setMode, isHydrated } = useViewModeStorage()
  const liveRegion = useLiveRegionOptional()

  // Determine which categories to use based on variant and props
  const categories = variant === 'hero' && externalCategories !== undefined
    ? externalCategories
    : internalCategories

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

  // Hero variant: Full-height chart only (controls in sidebar)
  // min-h-[500px] prevents CLS during hydration
  // P0.8 fix: Add view toggle so users can switch between visualization and table
  if (variant === 'hero') {
    return (
      <div className="h-full min-h-[500px] flex flex-col relative">
        {/* P0.8 fix: View toggle for hero variant - positioned top-right */}
        <div className="flex justify-end p-2 absolute top-2 right-2 z-10">
          <TableViewToggle mode={mode} onModeChange={handleModeChange} />
        </div>
        <div className="flex-1 relative">
          {!isHydrated || mode === 'visualization' ? (
            <ScatterPlot
              data={obituaries}
              activeCategories={categories}
              enabledMetrics={enabledMetrics}
              fillContainer
            />
          ) : (
            <ObituaryTable
              obituaries={obituaries}
              activeCategories={categories}
            />
          )}
        </div>
      </div>
    )
  }

  // Default variant: Existing layout
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
        <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
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
