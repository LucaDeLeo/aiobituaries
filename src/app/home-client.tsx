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

import { useMemo, useCallback } from 'react'
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
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import { getUTCYear } from '@/lib/utils/date'
import { matchesSearch } from '@/lib/utils/filters'

export interface HomeClientProps {
  /** Obituary data from server-side fetch */
  obituaries: ObituarySummary[]
  /** Layout variant: 'default' for existing, 'hero' for new grid layout */
  variant?: 'default' | 'hero'
  /** Selected metric for background chart (hero variant only) */
  selectedMetric?: MetricType
  /** Active category filters from parent (hero variant only) */
  activeCategories?: Category[]
  /** Search query for filtering obituaries (hero variant only) */
  searchQuery?: string
  /** Selected skeptic slug for filtering (hero variant only) */
  selectedSkeptic?: string | null
}

/**
 * Client-side portion of the homepage.
 * Manages filter state and passes it to visualization components.
 */
// P2.5 fix: matchesSearch moved to @/lib/utils/filters for deduplication

export function HomeClient({
  obituaries,
  variant = 'default',
  selectedMetric: externalMetric,
  activeCategories: externalCategories,
  searchQuery: externalSearchQuery,
  selectedSkeptic: externalSkeptic,
}: HomeClientProps) {
  // For default variant, use useVisualizationState directly (syncs with ControlSheet)
  // For hero variant, use external state from parent (HomePageClient)
  const visualizationState = useVisualizationState()
  const { categories: legacyCategories, toggleCategory, clearFilters } = useFilters()
  const { mode, setMode, isHydrated } = useViewModeStorage()
  const liveRegion = useLiveRegionOptional()

  // Determine state based on variant:
  // - hero: use external props from parent (HomePageClient owns the state)
  // - default: use useVisualizationState directly (syncs with ControlSheet on tablet)
  const categories = variant === 'hero' && externalCategories !== undefined
    ? externalCategories
    : variant === 'default'
      ? visualizationState.categories
      : legacyCategories

  // Search query: hero uses external props, default uses URL state
  const searchQuery = variant === 'hero'
    ? (externalSearchQuery ?? '')
    : visualizationState.searchQuery

  // Skeptic filter: hero uses external props, default uses URL state
  const selectedSkeptic = variant === 'hero'
    ? (externalSkeptic ?? null)
    : visualizationState.selectedSkeptic

  // Selected metric: hero uses external props, default uses URL state
  const selectedMetric = variant === 'hero'
    ? externalMetric
    : visualizationState.metric

  // Category toggle/clear handlers - use appropriate state manager based on variant
  const handleToggleCategory = useCallback((category: Category) => {
    if (variant === 'default') {
      // Use URL state via visualizationState
      const newCategories = categories.includes(category)
        ? categories.filter(c => c !== category)
        : [...categories, category]
      visualizationState.setCategories(newCategories)
    } else {
      // Use legacy useFilters (or let parent handle via externalCategories)
      toggleCategory(category)
    }
  }, [variant, categories, visualizationState, toggleCategory])

  const handleClearFilters = useCallback(() => {
    if (variant === 'default') {
      visualizationState.setCategories([])
    } else {
      clearFilters()
    }
  }, [variant, visualizationState, clearFilters])

  // Filter obituaries based on search query and skeptic (for hero variant)
  const filteredObituaries = useMemo(() => {
    let filtered = obituaries

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(obit => matchesSearch(obit, searchQuery))
    }

    // Skeptic filter
    if (selectedSkeptic) {
      filtered = filtered.filter(obit => obit.skeptic?.slug === selectedSkeptic)
    }

    return filtered
  }, [obituaries, searchQuery, selectedSkeptic])

  // Visualization filter: Only show claims from year 2000 onwards in the scatter plot
  // P1.2 fix: Use getUTCYear to avoid timezone-related off-by-one errors
  // Table view continues to show all claims for historical completeness
  const VISUALIZATION_MIN_YEAR = 2000
  const visualizationObituaries = useMemo(() => {
    return filteredObituaries.filter(obit => {
      const year = getUTCYear(obit.date)
      return year >= VISUALIZATION_MIN_YEAR
    })
  }, [filteredObituaries])

  // Calculate filtered count for accessibility announcements
  const filteredCount = useMemo(() => {
    if (categories.length === 0) return filteredObituaries.length
    return filteredObituaries.filter((obit) =>
      obit.categories?.some((cat) => categories.includes(cat))
    ).length
  }, [filteredObituaries, categories])

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
              data={visualizationObituaries}
              activeCategories={categories}
              selectedMetric={selectedMetric}
              fillContainer
            />
          ) : (
            <ObituaryTable
              obituaries={filteredObituaries}
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
            <ScatterPlot
              data={visualizationObituaries}
              activeCategories={categories}
              selectedMetric={selectedMetric}
            />
            <div className="mt-3 flex justify-center">
              <BackgroundChartLegend metrics={allMetrics} />
            </div>
          </>
        ) : (
          // P2.1 fix: Use filteredObituaries (applies search/skeptic filters)
          // Note: Table shows all years for historical completeness,
          // but visibleCount in sidebar should reflect the active view
          <ObituaryTable
            obituaries={filteredObituaries}
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
          onCategoryClick={handleToggleCategory}
        />
      </section>

      {/* Category Filter Bar */}
      <CategoryFilter
        activeCategories={categories}
        onToggle={handleToggleCategory}
        onShowAll={handleClearFilters}
        totalCount={obituaries.length}
        filteredCount={filteredCount}
      />
    </>
  )
}
