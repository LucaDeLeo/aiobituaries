import { cn } from '@/lib/utils'
import type { MetricsSnapshot } from '@/types/skeptic'

interface MetricsBadgeProps {
  metrics: MetricsSnapshot
  className?: string
  /** Compact mode for list items */
  compact?: boolean
}

/**
 * Displays AI metrics (MMLU, Compute, ECI) in a badge format.
 * Shows "--" for unavailable metrics (before their start date).
 *
 * Used on skeptic pages to show what AI capabilities looked like
 * at the time each claim was made.
 */
export function MetricsBadge({ metrics, className, compact = false }: MetricsBadgeProps) {
  return (
    <div
      className={cn(
        'font-mono text-sm',
        compact ? 'space-y-0.5' : 'space-y-1',
        className
      )}
    >
      <MetricRow
        label="MMLU"
        value={metrics.mmlu !== null ? `${metrics.mmlu}%` : '--'}
        compact={compact}
      />
      <MetricRow
        label="Compute"
        value={metrics.computeFormatted}
        compact={compact}
      />
      <MetricRow
        label="ECI"
        value={metrics.eci !== null ? metrics.eci.toString() : '--'}
        compact={compact}
      />
    </div>
  )
}

interface MetricRowProps {
  label: string
  value: string
  compact?: boolean
}

function MetricRow({ label, value, compact }: MetricRowProps) {
  return (
    <div
      className={cn(
        'flex justify-between gap-2',
        compact ? 'text-xs' : 'text-sm'
      )}
    >
      <span className="text-[--text-muted]">{label}:</span>
      <span className="text-[--text-secondary] tabular-nums">{value}</span>
    </div>
  )
}

interface CurrentMetricsFooterProps {
  metrics: MetricsSnapshot
  className?: string
}

/**
 * Footer component showing current/latest AI metrics.
 * Provides context for comparison with historical claim metrics.
 */
export function CurrentMetricsFooter({ metrics, className }: CurrentMetricsFooterProps) {
  return (
    <div
      className={cn(
        'bg-[--bg-secondary] border border-[--border] rounded-lg p-4',
        className
      )}
    >
      <p className="text-sm text-[--text-muted] mb-2">Today&apos;s AI Metrics</p>
      <p className="font-mono text-sm text-[--text-secondary]">
        MMLU {metrics.mmlu !== null ? `${metrics.mmlu}%` : '--'} · Compute{' '}
        {metrics.computeFormatted} · ECI{' '}
        {metrics.eci !== null ? metrics.eci : '--'}
      </p>
    </div>
  )
}
