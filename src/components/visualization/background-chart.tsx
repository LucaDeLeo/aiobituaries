import { useMemo } from 'react'
import { LinePath, AreaClosed } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { scaleLinear } from '@visx/scale'
import type { AIMetricSeries } from '@/data/ai-metrics'
import { isFlopMetric } from '@/data/ai-metrics'
import { logToFlop, type LogScale } from '@/lib/utils/scales'
import type { MetricType } from '@/types/metrics'

export interface BackgroundChartProps {
  metrics: AIMetricSeries[]
  /** Which metrics are currently enabled (controls opacity for smooth transitions) */
  enabledMetrics: MetricType[]
  /** Time scale for X-axis positioning (created via scaleTime) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xScale: any
  /** Log scale for Y-axis positioning of FLOP values */
  yScale: LogScale
  innerHeight: number
}

interface TransformedDataPoint {
  date: Date
  value: number       // Original value from data
  yValue: number      // Value for Y positioning
}

/**
 * Renders background line charts showing AI progress metrics.
 * Training Compute uses actual FLOP values on the log Y-scale.
 * MMLU and ECI render as normalized overlays with reduced opacity.
 * Supports smooth fade transitions when metrics are toggled on/off.
 */
export function BackgroundChart({
  metrics,
  enabledMetrics,
  xScale,
  yScale,
  innerHeight,
}: BackgroundChartProps) {
  // Memoized linear scale for normalized (non-FLOP) metrics
  // Created once outside the map loop to avoid repeated instantiation
  const normalizedYScale = useMemo(
    () => scaleLinear({ domain: [0, 1], range: [innerHeight, 0] }),
    [innerHeight]
  )

  // Transform data with appropriate Y values based on metric type
  const transformedMetrics = useMemo(() => {
    return metrics.map((metric) => {
      const isCompute = isFlopMetric(metric.id as MetricType)

      // Calculate min/max ONCE per metric series (for non-compute normalization)
      let min = 0
      let max = 1
      let range = 1
      if (!isCompute) {
        const values = metric.data.map((p) => p.value)
        min = Math.min(...values)
        max = Math.max(...values)
        range = max - min || 1
      }

      return {
        ...metric,
        isLogScale: isCompute,
        transformedData: metric.data.map((d) => {
          const date = new Date(d.date)

          if (isCompute) {
            // Training compute: convert log10 to actual FLOP for yScale
            return {
              date,
              value: d.value,
              yValue: logToFlop(d.value),
            }
          } else {
            // MMLU/ECI: normalize to 0-1 for overlay rendering
            return {
              date,
              value: d.value,
              yValue: (d.value - min) / range,
            }
          }
        }),
      }
    })
  }, [metrics])

  return (
    <g className="background-chart">
      {transformedMetrics.map((metric) => {
        // Check if this metric is enabled for visibility
        const isEnabled = enabledMetrics.includes(metric.id as MetricType)

        // Filter data to only include points within the x-axis domain
        const [domainStart, domainEnd] = xScale.domain()
        const visibleData = metric.transformedData.filter(
          (d) => d.date >= domainStart && d.date <= domainEnd
        )

        if (visibleData.length < 2) return null

        const getX = (d: TransformedDataPoint) => xScale(d.date) ?? 0

        // Y accessor depends on metric type
        const getY = (d: TransformedDataPoint) => {
          if (metric.isLogScale) {
            // Compute metric: use passed yScale directly with actual FLOP values
            return yScale(d.yValue) ?? 0
          } else {
            // Non-compute: render normalized to chart height (0=bottom, 1=top)
            return innerHeight * (1 - d.yValue)
          }
        }

        // Use appropriate scale for AreaClosed (memoized normalizedYScale for non-compute)
        const areaYScale = metric.isLogScale ? yScale : normalizedYScale

        // Opacity: full for compute (primary), reduced for overlay metrics
        const baseOpacity = metric.isLogScale ? 0.6 : 0.3

        return (
          <g
            key={metric.id}
            data-metric-id={metric.id}
            style={{
              opacity: isEnabled ? baseOpacity : 0,
              transition: 'opacity 200ms ease-in-out',
            }}
          >
            {/* Gradient area fill */}
            <defs>
              <linearGradient
                id={`area-gradient-${metric.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Area under the curve */}
            <AreaClosed
              data={visibleData}
              x={getX}
              y={getY}
              yScale={areaYScale}
              curve={curveMonotoneX}
              fill={`url(#area-gradient-${metric.id})`}
            />

            {/* Line on top */}
            <LinePath
              data={visibleData}
              x={getX}
              y={getY}
              curve={curveMonotoneX}
              stroke={metric.color}
              strokeWidth={2}
              strokeOpacity={metric.isLogScale ? 0.8 : 0.5}
            />
          </g>
        )
      })}
    </g>
  )
}

/**
 * Legend for background metrics
 */
export function BackgroundChartLegend({ metrics }: { metrics: AIMetricSeries[] }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
      {metrics.map((metric) => (
        <div key={metric.id} className="flex items-center gap-1.5">
          <div
            className="h-0.5 w-4 rounded-full"
            style={{ backgroundColor: metric.color, opacity: 0.8 }}
          />
          <span>{metric.label}</span>
        </div>
      ))}
    </div>
  )
}
