'use client'

import type { Category } from '@/types/obituary'
import type { MetricType } from '@/types/metrics'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { CollapsibleSection } from './collapsible-section'
import { MetricsToggle } from './metrics-toggle'
import { CategoryCheckboxes } from './category-checkboxes'
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
  /** Display options (trend annotations, clustering) */
  displayOptions: DisplayOptions
  /** Callback when display options change */
  onDisplayOptionsChange: (options: DisplayOptions) => void
  /** Obituary counts for stats display */
  stats: { total: number; visible: number }
  /** Layout variant - affects padding and spacing */
  variant?: 'sidebar' | 'sheet' | 'drawer'
  /** Hide chart-specific controls (Background Metrics) in table view */
  isChartControlsHidden?: boolean
}

const variantStyles = {
  sidebar: 'p-0',
  sheet: 'p-2',
  drawer: 'p-0',
}

export function ControlPanel({
  enabledMetrics,
  onMetricsChange,
  selectedCategories,
  onCategoriesChange,
  stats,
  variant = 'sidebar',
  isChartControlsHidden = false,
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
        {/* MotionConfig respects prefers-reduced-motion user preference */}
        <MotionConfig reducedMotion="user">
          {/* Chart-specific controls - animated based on view mode */}
          <AnimatePresence initial={false}>
            {!isChartControlsHidden && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <CollapsibleSection title="Background Metrics" defaultOpen>
                  <MetricsToggle
                    enabledMetrics={enabledMetrics}
                    onMetricsChange={onMetricsChange}
                  />
                </CollapsibleSection>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint when chart controls hidden */}
          <AnimatePresence>
            {isChartControlsHidden && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden px-4 py-3 text-sm text-muted-foreground bg-secondary/30 border-b border-border"
              >
                Chart controls hidden in table view
              </motion.div>
            )}
          </AnimatePresence>
        </MotionConfig>

        {/* Categories - always visible */}
        <CollapsibleSection title="Categories" defaultOpen>
          <CategoryCheckboxes
            selectedCategories={selectedCategories}
            onCategoriesChange={onCategoriesChange}
          />
        </CollapsibleSection>

        {/* Display Options - hidden until implemented
        <CollapsibleSection title="Display Options" defaultOpen={false}>
          <p className="text-sm text-muted-foreground">
            Trend annotations and clustering settings
          </p>
        </CollapsibleSection>
        */}
      </div>
    </div>
  )
}
