'use client'

import { ControlPanel, type DisplayOptions } from './control-panel'
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import { useViewModeStorage } from '@/components/obituary/table-view-toggle'

interface ControlPanelWrapperProps {
  /** Total count of obituaries */
  totalCount: number
  /** Visible count after filtering (optional - falls back to totalCount if not provided) */
  visibleCount?: number
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
  variant = 'sidebar',
}: ControlPanelWrapperProps) {
  const {
    metrics,
    setMetrics,
    categories,
    setCategories,
    searchQuery,
    setSearchQuery,
  } = useVisualizationState()

  const { mode, isHydrated } = useViewModeStorage()

  // Hide chart controls when in table view (after hydration)
  const isChartControlsHidden = isHydrated && mode === 'table'

  // Placeholder for future display options (Story 3.X)
  const displayOptions: DisplayOptions = {
    showTrendAnnotations: true,
    enableClustering: false,
  }
  const handleDisplayOptionsChange = () => {}

  return (
    <ControlPanel
      enabledMetrics={metrics}
      onMetricsChange={setMetrics}
      selectedCategories={categories}
      onCategoriesChange={setCategories}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      displayOptions={displayOptions}
      onDisplayOptionsChange={handleDisplayOptionsChange}
      stats={{
        total: totalCount,
        visible: visibleCount ?? totalCount,
      }}
      variant={variant}
      isChartControlsHidden={isChartControlsHidden}
    />
  )
}
