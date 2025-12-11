'use client'

import { ControlPanel, type MetricType, type DisplayOptions } from './control-panel'
import type { Category } from '@/types/obituary'

interface ControlPanelWrapperProps {
  /** Total count of obituaries */
  totalCount: number
  /** Layout variant */
  variant?: 'sidebar' | 'sheet' | 'drawer'
}

/**
 * Client-side wrapper for ControlPanel that manages state.
 *
 * This wrapper exists because page.tsx is a Server Component and cannot
 * pass event handler functions to Client Components. All state management
 * is handled here with placeholder values until Story 3.1 wires up URL state.
 */
export function ControlPanelWrapper({
  totalCount,
  variant = 'sidebar',
}: ControlPanelWrapperProps) {
  // Placeholder state - will be replaced with URL state in Story 3.1
  const enabledMetrics: MetricType[] = ['compute']
  const selectedCategories: Category[] = []
  const dateRange: [number, number] = [2010, 2025]
  const displayOptions: DisplayOptions = {
    showTrendAnnotations: true,
    enableClustering: false,
  }

  // No-op handlers - will be replaced with actual handlers in Story 3.1
  const handleMetricsChange = () => {}
  const handleCategoriesChange = () => {}
  const handleDateRangeChange = () => {}
  const handleDisplayOptionsChange = () => {}

  return (
    <ControlPanel
      enabledMetrics={enabledMetrics}
      onMetricsChange={handleMetricsChange}
      selectedCategories={selectedCategories}
      onCategoriesChange={handleCategoriesChange}
      dateRange={dateRange}
      onDateRangeChange={handleDateRangeChange}
      displayOptions={displayOptions}
      onDisplayOptionsChange={handleDisplayOptionsChange}
      stats={{ total: totalCount, visible: totalCount }}
      variant={variant}
    />
  )
}
