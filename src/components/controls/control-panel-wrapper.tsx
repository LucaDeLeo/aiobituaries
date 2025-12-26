'use client'

import { ControlPanel } from './control-panel'
// P2.4: DisplayOptions type removed (Display Options section is unused)
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import { useViewModeStorage } from '@/components/obituary/table-view-toggle'
import type { ObituarySummary } from '@/types/obituary'

interface ControlPanelWrapperProps {
  /** Total count of obituaries */
  totalCount: number
  /** Visible count after filtering (optional - falls back to totalCount if not provided) */
  visibleCount?: number
  /** Obituaries for skeptic filter derivation */
  obituaries: ObituarySummary[]
  /** Layout variant */
  variant?: 'sidebar' | 'sheet' | 'drawer'
}

/**
 * Client-side wrapper for ControlPanel that manages URL state.
 * Connects useVisualizationState hook to ControlPanel props.
 *
 * When used from HomePageClient (desktop), visibleCount is calculated
 * by the parent and passed down. When used from ControlSheet (tablet/mobile),
 * visibleCount falls back to totalCount since the parent doesn't have
 * access to filtered data (nuqs ensures URL sync between instances).
 */
export function ControlPanelWrapper({
  totalCount,
  visibleCount,
  obituaries,
  variant = 'sidebar',
}: ControlPanelWrapperProps) {
  const {
    metric,
    setMetric,
    categories,
    setCategories,
    searchQuery,
    setSearchQuery,
    selectedSkeptic,
    setSelectedSkeptic,
  } = useVisualizationState()

  const { mode, isHydrated } = useViewModeStorage()

  // Hide chart controls when in table view (after hydration)
  const isChartControlsHidden = isHydrated && mode === 'table'

  // P2.4: displayOptions removed (Display Options section is commented out in ControlPanel)

  return (
    <ControlPanel
      selectedMetric={metric}
      onMetricChange={setMetric}
      selectedCategories={categories}
      onCategoriesChange={setCategories}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedSkeptic={selectedSkeptic}
      onSkepticChange={setSelectedSkeptic}
      obituaries={obituaries}
      stats={{
        total: totalCount,
        visible: visibleCount ?? totalCount,
      }}
      variant={variant}
      isChartControlsHidden={isChartControlsHidden}
    />
  )
}
