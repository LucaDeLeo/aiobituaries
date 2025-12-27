import { useMemo, memo, useRef, useEffect, useState } from 'react'
import { AreaClosed } from '@visx/shape'
import { curveMonotoneX } from '@visx/curve'
import { useReducedMotion } from 'framer-motion'
import type { ScaleTime } from 'd3-scale'
import type { AIMetricSeries } from '@/data/ai-metrics'
import type { LinearScale } from '@/lib/utils/scales'
import type { MetricType } from '@/types/metrics'
import {
  resampleMetricToPoints,
  pointsToPathD,
  interpolatePoints,
  isPrimaryMetric,
  type Point,
} from '@/lib/utils/path-interpolation'
import { ANIMATION_DURATION_MS, easeOutQuart } from '@/lib/utils/animation-easing'

export interface BackgroundChartProps {
  metrics: AIMetricSeries[]
  /** Currently selected metric to display */
  selectedMetric: MetricType
  /** Time scale for X-axis positioning */
  xScale: ScaleTime<number, number>
  /** Linear scale for Y-axis (METR Task Horizon in minutes) */
  yScale: LinearScale
  innerHeight: number
}

interface TransformedDataPoint {
  date: Date
  value: number       // Original value from data
  yValue: number      // Value for Y positioning
}

/**
 * Custom comparison function for React.memo to prevent unnecessary re-renders.
 * BackgroundChart only needs to re-render when:
 * - Metrics data changes (new data loaded)
 * - Selected metric changes (triggers morph animation)
 * - Scale domains change (date range or metric range)
 * - Chart dimensions change
 *
 * Does NOT need to re-render during pan/zoom since lines transform with CSS.
 */
function arePropsEqual(
  prev: BackgroundChartProps,
  next: BackgroundChartProps
): boolean {
  // Quick dimension check
  if (prev.innerHeight !== next.innerHeight) return false

  // Selected metric comparison
  if (prev.selectedMetric !== next.selectedMetric) return false

  // Scale domain comparison (not reference equality)
  // X-scale domain is Date objects - compare timestamps
  const prevXDomain = prev.xScale.domain()
  const nextXDomain = next.xScale.domain()
  // Guard against null/undefined domains during initialization
  if (!prevXDomain || !nextXDomain) return prev.xScale === next.xScale
  if (prevXDomain[0]?.getTime() !== nextXDomain[0]?.getTime()) return false
  if (prevXDomain[1]?.getTime() !== nextXDomain[1]?.getTime()) return false

  // Y-scale domain comparison
  const prevYDomain = prev.yScale.domain()
  const nextYDomain = next.yScale.domain()
  if (!prevYDomain || !nextYDomain) return prev.yScale === next.yScale
  if (prevYDomain[0] !== nextYDomain[0]) return false
  if (prevYDomain[1] !== nextYDomain[1]) return false

  // Metrics array reference check (data rarely changes)
  // Only compare references since AIMetricSeries[] is static data
  if (prev.metrics !== next.metrics) return false

  return true
}

/**
 * Renders background line chart showing a single AI progress metric.
 * METR Task Horizon uses the primary linear Y-axis (minutes).
 * Training Compute, MMLU, and ECI render as normalized overlays.
 * Supports smooth morph animation when switching between metrics.
 *
 * Memoized to prevent re-renders during pan/zoom operations.
 */
function BackgroundChartComponent({
  metrics,
  selectedMetric,
  xScale,
  yScale,
  innerHeight,
}: BackgroundChartProps) {
  // Check reduced motion preference
  const prefersReducedMotion = useReducedMotion()
  const shouldReduceMotion = prefersReducedMotion ?? false

  // Animation state - track previous metric ID in state (not ref) for reactivity
  // previousMetricId is updated AFTER animation completes
  const [previousMetricId, setPreviousMetricId] = useState<MetricType>(selectedMetric)
  const [animationProgress, setAnimationProgress] = useState(1)
  const animationFrameRef = useRef<number | null>(null)

  // NOTE: normalizedYScale removed - all metrics now use the shared yScale
  // whose domain animates when switching metrics, ensuring consistent positioning

  // Get the currently selected metric data
  const currentMetric = useMemo(() => {
    return metrics.find((m) => m.id === selectedMetric)
  }, [metrics, selectedMetric])

  // Get the previous metric data (for animation) - now using state, not ref
  const previousMetric = useMemo(() => {
    return metrics.find((m) => m.id === previousMetricId)
  }, [metrics, previousMetricId])

  // Compute resampled points for current metric
  const currentPoints = useMemo(() => {
    if (!currentMetric) return []
    return resampleMetricToPoints(currentMetric, xScale, yScale, innerHeight)
  }, [currentMetric, xScale, yScale, innerHeight])

  // Compute resampled points for previous metric (for animation)
  const previousPoints = useMemo(() => {
    if (!previousMetric) return []
    return resampleMetricToPoints(previousMetric, xScale, yScale, innerHeight)
  }, [previousMetric, xScale, yScale, innerHeight])

  // Check if we're currently animating (progress < 1 and metrics differ)
  const isAnimating = animationProgress < 1 && previousMetricId !== selectedMetric

  // Handle metric change - trigger animation
  useEffect(() => {
    // Cancel any existing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // If metric changed, start animation
    if (previousMetricId !== selectedMetric) {
      // Start morph animation (or instant swap for reduced motion)
      const startTime = performance.now()
      const duration = shouldReduceMotion ? 0 : ANIMATION_DURATION_MS

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const rawProgress = duration === 0 ? 1 : Math.min(elapsed / duration, 1)
        const easedProgress = easeOutQuart(rawProgress)

        setAnimationProgress(easedProgress)

        if (rawProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          // Animation complete - update previous to current
          setPreviousMetricId(selectedMetric)
          animationFrameRef.current = null
        }
      }

      // Use requestAnimationFrame even for instant swap to avoid sync setState
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [selectedMetric, previousMetricId, shouldReduceMotion])

  // Compute animated path
  const animatedPathD = useMemo(() => {
    if (!isAnimating || previousPoints.length === 0 || currentPoints.length === 0) {
      return pointsToPathD(currentPoints)
    }

    // Ensure same length for interpolation
    const normalizedPrev = previousPoints.length === currentPoints.length
      ? previousPoints
      : resampleToLength(previousPoints, currentPoints.length)

    const interpolated = interpolatePoints(normalizedPrev, currentPoints, animationProgress)
    return pointsToPathD(interpolated)
  }, [isAnimating, previousPoints, currentPoints, animationProgress])

  if (!currentMetric) return null

  const isPrimary = isPrimaryMetric(currentMetric.id)
  const baseOpacity = isPrimary ? 0.6 : 0.3
  const strokeOpacity = isPrimary ? 0.8 : 0.5

  // Use current metric's color (area fill updates with metric change)
  const currentColor = currentMetric.color

  // For area fill, use current metric's data with raw values
  // All metrics now use the shared yScale (no normalization needed)
  const [domainStart, domainEnd] = xScale.domain()
  const visibleData = currentMetric.data
    .map((d) => {
      const date = new Date(d.date)
      return {
        date,
        value: d.value,
        yValue: d.value, // Raw metric value - yScale handles conversion
      }
    })
    .filter((d) => d.date >= domainStart && d.date <= domainEnd)

  // Return null if we don't have enough data points to render a meaningful line
  // Either condition alone means we can't render - use OR instead of AND
  if (visibleData.length < 2 || currentPoints.length === 0) return null

  const getX = (d: TransformedDataPoint) => xScale(d.date) ?? 0
  // All metrics use yScale directly - the yScale domain is set to the selected
  // metric's domain and animates when switching, ensuring consistent positioning
  const getY = (d: TransformedDataPoint) => yScale(d.yValue) ?? 0

  // Use the shared yScale for area fill (domain matches selected metric)
  const areaYScale = yScale

  return (
    <g className="background-chart" data-metric-id={currentMetric.id}>
      {/* Gradient area fill - crossfade between metrics */}
      <defs>
        <linearGradient
          id={`area-gradient-${currentMetric.id}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={currentColor} stopOpacity={0.3} />
          <stop offset="100%" stopColor={currentColor} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Area under the curve - simple crossfade, not morph */}
      <g
        style={{
          opacity: baseOpacity,
          transition: shouldReduceMotion ? 'none' : 'opacity 200ms ease-in-out',
        }}
      >
        <AreaClosed
          data={visibleData}
          x={getX}
          y={getY}
          yScale={areaYScale}
          curve={curveMonotoneX}
          fill={`url(#area-gradient-${currentMetric.id})`}
        />
      </g>

      {/* Animated line using resampled path */}
      <path
        d={animatedPathD}
        fill="none"
        stroke={currentColor}
        strokeWidth={2}
        strokeOpacity={strokeOpacity}
        style={{
          opacity: baseOpacity,
        }}
      />
    </g>
  )
}

/**
 * Resample points array to a target length using linear interpolation.
 */
function resampleToLength(points: Point[], targetLength: number): Point[] {
  if (points.length === 0 || targetLength === 0) return []
  if (points.length === targetLength) return points

  const result: Point[] = []
  for (let i = 0; i < targetLength; i++) {
    const t = i / (targetLength - 1)
    const sourceIdx = t * (points.length - 1)
    const lowerIdx = Math.floor(sourceIdx)
    const upperIdx = Math.min(lowerIdx + 1, points.length - 1)
    const fraction = sourceIdx - lowerIdx

    result.push({
      x: points[lowerIdx].x + (points[upperIdx].x - points[lowerIdx].x) * fraction,
      y: points[lowerIdx].y + (points[upperIdx].y - points[lowerIdx].y) * fraction,
    })
  }
  return result
}

/**
 * Memoized BackgroundChart component.
 * Prevents re-renders during pan/zoom when only viewState changes.
 * Only re-renders when scale domains, enabled metrics, or dimensions change.
 */
export const BackgroundChart = memo(BackgroundChartComponent, arePropsEqual)

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
