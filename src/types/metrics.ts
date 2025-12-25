/**
 * Metric type identifiers for AI metrics visualization.
 * Matches the `id` values in AIMetricSeries from ai-metrics.ts:
 * - 'compute' - Training compute (log10 FLOP)
 * - 'mmlu' - MMLU benchmark score (%, Aug 2021+)
 * - 'arcagi' - ARC-AGI benchmark score (%, Sept 2024+)
 * - 'eci' - Epoch Capability Index (index score, Feb 2023+)
 * - 'metr' - METR Task Horizon (minutes, Nov 2019+)
 */
export type MetricType = 'compute' | 'mmlu' | 'arcagi' | 'eci' | 'metr'
