/**
 * Metric type identifiers for AI metrics visualization.
 * Matches the `id` values in AIMetricSeries from ai-metrics.ts:
 * - 'compute' - Training compute (log10 FLOP)
 * - 'mmlu' - MMLU benchmark score (percentage)
 * - 'eci' - Epoch Capability Index (index score)
 */
export type MetricType = 'compute' | 'mmlu' | 'eci'
