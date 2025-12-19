'use client'

import type { MetricType } from '@/types/metrics'
import { cn } from '@/lib/utils'
import { allMetrics } from '@/data/ai-metrics.generated'

/**
 * UI-specific descriptions for each metric (not in generated data)
 */
const METRIC_DESCRIPTIONS: Record<MetricType, string> = {
  compute: 'FLOP trend line',
  mmlu: 'Benchmark accuracy',
  eci: 'Composite capability',
}

/**
 * Derive metrics config from generated data with UI descriptions
 */
const METRICS = allMetrics.map((metric) => ({
  id: metric.id as MetricType,
  label: metric.label,
  description: METRIC_DESCRIPTIONS[metric.id as MetricType],
  color: metric.color,
}))

export interface MetricsToggleProps {
  /** Currently enabled metrics */
  enabledMetrics: MetricType[]
  /** Callback when metrics selection changes */
  onMetricsChange: (metrics: MetricType[]) => void
  /** Optional className for container */
  className?: string
}

/**
 * MetricsToggle - Checkbox list for toggling background metric trend lines
 *
 * Allows users to select which AI progress metrics are displayed as
 * background trend lines in the visualization. Each metric has a distinct
 * color that matches its trend line.
 *
 * @example
 * ```tsx
 * const { metrics, setMetrics } = useVisualizationState()
 *
 * <MetricsToggle
 *   enabledMetrics={metrics}
 *   onMetricsChange={setMetrics}
 * />
 * ```
 */
export function MetricsToggle({
  enabledMetrics,
  onMetricsChange,
  className,
}: MetricsToggleProps) {
  const handleToggle = (metricId: MetricType) => {
    const isEnabled = enabledMetrics.includes(metricId)

    if (isEnabled) {
      // Remove metric
      onMetricsChange(enabledMetrics.filter((m) => m !== metricId))
    } else {
      // Add metric
      onMetricsChange([...enabledMetrics, metricId])
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {METRICS.map((metric) => {
        const isChecked = enabledMetrics.includes(metric.id)
        const checkboxId = `metric-${metric.id}`

        return (
          <label
            key={metric.id}
            htmlFor={checkboxId}
            className="flex items-start gap-3 cursor-pointer group"
          >
            {/* Custom checkbox with native input for accessibility */}
            <div className="relative flex items-center justify-center pt-0.5">
              <input
                type="checkbox"
                id={checkboxId}
                checked={isChecked}
                onChange={() => handleToggle(metric.id)}
                className="peer sr-only"
              />
              {/* Visual checkbox */}
              <div
                className={cn(
                  'h-4 w-4 rounded border-2 transition-colors',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  isChecked
                    ? 'border-transparent'
                    : 'border-muted-foreground/50 group-hover:border-muted-foreground'
                )}
                style={{
                  backgroundColor: isChecked ? metric.color : 'transparent',
                }}
              >
                {/* Checkmark */}
                {isChecked && (
                  <svg
                    className="h-full w-full text-white"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 8l3 3 5-6" />
                  </svg>
                )}
              </div>
            </div>

            {/* Label and description */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium leading-none">
                {metric.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {metric.description}
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}
