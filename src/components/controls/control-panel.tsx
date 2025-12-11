'use client'

import type { Category } from '@/types/obituary'
import type { MetricType } from '@/types/metrics'
import { CollapsibleSection } from './collapsible-section'
import { MetricsToggle } from './metrics-toggle'
import { cn } from '@/lib/utils'

// Re-export for consumers that import from control-panel
export type { MetricType }

export interface DisplayOptions {
  showTrendAnnotations: boolean
  enableClustering: boolean
}

export interface ControlPanelProps {
  /** Currently enabled background metrics */
  enabledMetrics: MetricType[]
  /** Callback when metrics selection changes */
  onMetricsChange: (metrics: MetricType[]) => void
  /** Currently selected categories (empty = all) */
  selectedCategories: Category[]
  /** Callback when category selection changes */
  onCategoriesChange: (categories: Category[]) => void
  /** Current date range [startYear, endYear] */
  dateRange: [number, number]
  /** Callback when date range changes */
  onDateRangeChange: (range: [number, number]) => void
  /** Display options (trend annotations, clustering) */
  displayOptions: DisplayOptions
  /** Callback when display options change */
  onDisplayOptionsChange: (options: DisplayOptions) => void
  /** Obituary counts for stats display */
  stats: { total: number; visible: number }
  /** Layout variant - affects padding and spacing */
  variant?: 'sidebar' | 'sheet' | 'drawer'
}

const variantStyles = {
  sidebar: 'p-0',
  sheet: 'p-2',
  drawer: 'p-0',
}

export function ControlPanel({
  enabledMetrics,
  onMetricsChange,
  stats,
  variant = 'sidebar',
}: ControlPanelProps) {
  return (
    <div className={cn('flex flex-col h-full', variantStyles[variant])}>
      {/* Header with stats */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">Controls</h2>
        <p className="text-sm text-muted-foreground">
          Showing {stats.visible} of {stats.total}
        </p>
      </div>

      {/* Collapsible sections */}
      <div className="flex-1 overflow-y-auto">
        <CollapsibleSection title="Background Metrics" defaultOpen>
          <MetricsToggle
            enabledMetrics={enabledMetrics}
            onMetricsChange={onMetricsChange}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Time Range" defaultOpen>
          {/* TODO: DateRangeSlider - Story 3.3 */}
          <p className="text-sm text-muted-foreground">
            Filter obituaries by date range
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Categories" defaultOpen>
          {/* TODO: CategoryCheckboxes - Story 3.4 */}
          <p className="text-sm text-muted-foreground">
            Filter by claim category
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Display Options" defaultOpen={false}>
          {/* TODO: DisplayOptions controls - future story */}
          <p className="text-sm text-muted-foreground">
            Trend annotations and clustering settings
          </p>
        </CollapsibleSection>
      </div>
    </div>
  )
}
