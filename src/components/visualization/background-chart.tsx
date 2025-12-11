import { useMemo } from 'react'
import { LinePath, AreaClosed } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { scaleLinear } from '@visx/scale'
import type { AIMetricSeries } from '@/data/ai-metrics'
import type { MetricType } from '@/types/metrics'

export interface BackgroundChartProps {
  metrics: AIMetricSeries[]
  /** Which metrics are currently enabled (controls opacity for smooth transitions) */
  enabledMetrics: MetricType[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xScale: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yScale: any
  innerHeight: number
}

/**
 * Renders background line charts showing AI progress metrics.
 * Each metric is normalized to 0-1 and rendered as a subtle area + line.
 * Supports smooth fade transitions when metrics are toggled on/off.
 */
export function BackgroundChart({
  metrics,
  enabledMetrics,
  xScale,
  yScale,
  innerHeight,
}: BackgroundChartProps) {
  // Pre-compute normalized data for each metric
  const normalizedMetrics = useMemo(() => {
    return metrics.map((metric) => {
      const values = metric.data.map((d) => d.value)
      const min = Math.min(...values)
      const max = Math.max(...values)
      const range = max - min || 1

      return {
        ...metric,
        normalizedData: metric.data.map((d) => ({
          date: new Date(d.date),
          normalizedValue: (d.value - min) / range,
          originalValue: d.value,
        })),
      }
    })
  }, [metrics])

  return (
    <g className="background-chart">
      {normalizedMetrics.map((metric) => {
        // Check if this metric is enabled for visibility
        const isEnabled = enabledMetrics.includes(metric.id as MetricType)

        // Filter data to only include points within the x-axis domain
        const [domainStart, domainEnd] = xScale.domain()
        const visibleData = metric.normalizedData.filter(
          (d) => d.date >= domainStart && d.date <= domainEnd
        )

        if (visibleData.length < 2) return null

        const getX = (d: (typeof visibleData)[0]) => xScale(d.date) ?? 0
        const getY = (d: (typeof visibleData)[0]) => yScale(d.normalizedValue) ?? 0

        // Create a local yScale for AreaClosed that matches the expected type
        const areaYScale = scaleLinear({
          domain: [0, 1],
          range: [innerHeight, 0],
        })

        return (
          <g
            key={metric.id}
            data-metric-id={metric.id}
            style={{
              opacity: isEnabled ? 0.6 : 0,
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
              strokeOpacity={0.8}
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
