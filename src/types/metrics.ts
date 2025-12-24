/**
 * Metric type identifiers for AI metrics visualization.
 * Matches the `id` values in AIMetricSeries from ai-metrics.ts:
 * - 'compute' - Training compute (log10 FLOP)
 * - 'arcagi' - ARC-AGI benchmark score (percentage)
 * - 'eci' - Epoch Capability Index (index score)
 * - 'metr' - METR Task Horizon (minutes of autonomous work)
 */
export type MetricType = 'compute' | 'arcagi' | 'eci' | 'metr'
