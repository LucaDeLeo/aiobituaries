'use client'

import type { Category, ObituarySummary } from '@/types/obituary'
import type { MetricType } from '@/types/metrics'
import type { TimelineViewMode } from '@/types/accessibility'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { CollapsibleSection } from './collapsible-section'
import { MetricsToggle } from './metrics-toggle'
import { CategoryCheckboxes } from './category-checkboxes'
import { SearchInput } from './search-input'
import { SkepticFilter } from './skeptic-filter'
import { TableViewToggle } from '@/components/obituary/table-view-toggle'
import { cn } from '@/lib/utils'
import { CATEGORY_ORDER, CATEGORIES } from '@/lib/constants/categories'

// Re-export for consumers that import from control-panel
export type { MetricType }

// P2.4: DisplayOptions interface removed (Display Options section is unused/commented out)

export interface ControlPanelProps {
  /** Currently selected background metric */
  selectedMetric: MetricType
  /** Callback when metric selection changes */
  onMetricChange: (metric: MetricType) => void
  /** Currently selected categories (empty = all) */
  selectedCategories: Category[]
  /** Callback when category selection changes */
  onCategoriesChange: (categories: Category[]) => void
  /** Current search query */
  searchQuery: string
  /** Callback when search query changes */
  onSearchChange: (query: string) => void
  /** Currently selected skeptic slug (null = no filter) */
  selectedSkeptic: string | null
  /** Callback when skeptic selection changes */
  onSkepticChange: (slug: string | null) => void
  /** Obituaries for skeptic filter derivation */
  obituaries: ObituarySummary[]
  /** Obituary counts for stats display */
  stats: { total: number; visible: number }
  /** Layout variant - affects padding and spacing */
  variant?: 'sidebar' | 'sheet' | 'drawer'
  /** Hide chart-specific controls (Background Metrics) in table view */
  isChartControlsHidden?: boolean
  /** Current view mode (timeline/table) */
  viewMode?: TimelineViewMode
  /** Callback when view mode changes */
  onViewModeChange?: (mode: TimelineViewMode) => void
}

const variantStyles = {
  sidebar: 'p-0',
  sheet: 'p-2',
  drawer: 'p-0',
}

export function ControlPanel({
  selectedMetric,
  onMetricChange,
  selectedCategories,
  onCategoriesChange,
  searchQuery,
  onSearchChange,
  selectedSkeptic,
  onSkepticChange,
  obituaries,
  stats,
  variant = 'sidebar',
  isChartControlsHidden = false,
  viewMode = 'visualization',
  onViewModeChange,
}: ControlPanelProps) {
  return (
    <div className={cn('flex flex-col h-full', variantStyles[variant])}>
      {/* Header with stats, view toggle, and search */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold">Controls</h2>
            <p className="text-sm text-muted-foreground">
              Showing {stats.visible} of {stats.total}
            </p>
          </div>
          {onViewModeChange && (
            <TableViewToggle mode={viewMode} onModeChange={onViewModeChange} />
          )}
        </div>
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search claims, sources..."
        />
      </div>

      {/* Chart explanation - helps users understand the visualization */}
      <div className="px-4 py-3 bg-accent/5 border-b border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">How to read this chart:</span>{' '}
          Each dot represents a skeptical AI claim. Vertical position shows AI agent
          task duration (METR) when the claim was made—higher means more capable AI existed.
        </p>
        {/* Compact category legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 border-t border-border/50">
          {CATEGORY_ORDER.map((categoryId) => {
            const category = CATEGORIES[categoryId]
            return (
              <div key={categoryId} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                <span className="text-[10px] text-muted-foreground">{category.label}</span>
              </div>
            )
          })}
        </div>
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
                    selectedMetric={selectedMetric}
                    onMetricChange={onMetricChange}
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

        {/* Skeptic filter */}
        <CollapsibleSection title="Filter by Skeptic" defaultOpen>
          <SkepticFilter
            obituaries={obituaries}
            selectedSkeptic={selectedSkeptic}
            onSkepticChange={onSkepticChange}
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
