'use client'

import type { MetricType } from '@/types/metrics'
import { cn } from '@/lib/utils'
import { allMetrics } from '@/data/ai-metrics.generated'
import { useHydrated } from '@/lib/hooks/use-hydrated'
import { ExternalLink } from 'lucide-react'

/**
 * UI-specific descriptions for each metric (not in generated data)
 */
const METRIC_DESCRIPTIONS: Record<MetricType, string> = {
  compute: 'Historical training compute trend',
  mmlu: 'Knowledge & reasoning benchmark (Aug 2021+)',
  arcagi: 'Novel reasoning benchmark (Sept 2024+)',
  eci: 'Composite AI capability index (Feb 2023+)',
  metr: 'Agentic task duration (Nov 2019+)',
}

/**
 * Derive metrics config from generated data with UI descriptions.
 * Shows all 5 metrics for unified modal/selector consistency.
 */
const METRICS = allMetrics.map((metric) => ({
  id: metric.id as MetricType,
  label: metric.label,
  description: METRIC_DESCRIPTIONS[metric.id as MetricType],
  color: metric.color,
  source: metric.source,
}))

export interface MetricsToggleProps {
  /** Currently selected metric */
  selectedMetric: MetricType
  /** Callback when metric selection changes */
  onMetricChange: (metric: MetricType) => void
  /** Optional className for container */
  className?: string
}

/**
 * MetricsToggle - Radio button list for selecting a background metric trend line
 *
 * Allows users to select which single AI progress metric is displayed as
 * the background trend line in the visualization. Each metric has a distinct
 * color that matches its trend line.
 *
 * @example
 * ```tsx
 * const { metric, setMetric } = useVisualizationState()
 *
 * <MetricsToggle
 *   selectedMetric={metric}
 *   onMetricChange={setMetric}
 * />
 * ```
 */
export function MetricsToggle({
  selectedMetric,
  onMetricChange,
  className,
}: MetricsToggleProps) {
  // Track hydration state to prevent hydration mismatch
  // selectedMetric comes from URL state which may differ between SSR and client
  const isHydrated = useHydrated()

  const handleSelect = (metricId: MetricType) => {
    onMetricChange(metricId)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)} role="radiogroup" aria-label="Select background metric">
      {METRICS.map((metric) => {
        // Use false during SSR to ensure consistent hydration
        // After hydration, use actual state from URL params
        const isSelected = isHydrated && selectedMetric === metric.id
        const radioId = `metric-${metric.id}`

        return (
          <label
            key={metric.id}
            htmlFor={radioId}
            className="flex items-start gap-3 cursor-pointer group"
          >
            {/* Custom radio button with native input for accessibility */}
            <div className="relative flex items-center justify-center pt-0.5">
              <input
                type="radio"
                id={radioId}
                name="metric-select"
                checked={isSelected}
                onChange={() => handleSelect(metric.id)}
                className="peer sr-only"
              />
              {/* Visual radio button */}
              <div
                className={cn(
                  'h-4 w-4 rounded-full border-2 transition-colors flex items-center justify-center',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-transparent'
                    : 'border-muted-foreground/50 group-hover:border-muted-foreground'
                )}
                style={{
                  backgroundColor: isSelected ? metric.color : 'transparent',
                }}
              >
                {/* Inner dot for selected state */}
                {isSelected && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Label and description */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-sm font-medium leading-none">
                {metric.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {metric.description}
              </span>
            </div>

            {/* Source link */}
            <a
              href={metric.source}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0"
              aria-label={`View ${metric.label} data source`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </label>
        )
      })}
    </div>
  )
}
