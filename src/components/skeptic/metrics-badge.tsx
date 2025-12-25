import { cn } from '@/lib/utils'
import type { MetricsSnapshot } from '@/types/skeptic'

interface MetricsBadgeProps {
  metrics: MetricsSnapshot
  className?: string
  /** Compact mode for list items */
  compact?: boolean
}

/**
 * Displays AI metrics (Compute, MMLU, ARC-AGI, ECI, METR) in a badge format.
 * Shows "N/A" for unavailable metrics (before their measurement start date).
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
        label="Compute"
        value={metrics.computeFormatted}
        compact={compact}
      />
      <MetricRow
        label="MMLU"
        value={metrics.mmlu !== null ? `${metrics.mmlu}%` : 'N/A'}
        compact={compact}
      />
      <MetricRow
        label="ARC-AGI"
        value={metrics.arcagi !== null ? `${metrics.arcagi}%` : 'N/A'}
        compact={compact}
      />
      <MetricRow
        label="ECI"
        value={metrics.eci !== null ? metrics.eci.toString() : 'N/A'}
        compact={compact}
      />
      <MetricRow
        label="METR"
        value={metrics.metr !== null ? `${metrics.metr} min` : 'N/A'}
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
      <span className="text-[var(--text-muted)]">{label}:</span>
      <span className="text-[var(--text-secondary)] tabular-nums">{value}</span>
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
        'bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4',
        className
      )}
    >
      <p className="text-sm text-[var(--text-muted)] mb-2">Today&apos;s AI Metrics</p>
      <p className="font-mono text-sm text-[var(--text-secondary)]">
        Compute {metrics.computeFormatted} · MMLU{' '}
        {metrics.mmlu !== null ? `${metrics.mmlu}%` : 'N/A'} · ARC-AGI{' '}
        {metrics.arcagi !== null ? `${metrics.arcagi}%` : 'N/A'} · ECI{' '}
        {metrics.eci !== null ? metrics.eci : 'N/A'} · METR{' '}
        {metrics.metr !== null ? `${metrics.metr}min` : 'N/A'}
      </p>
    </div>
  )
}
