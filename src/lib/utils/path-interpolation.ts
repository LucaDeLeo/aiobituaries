/**
 * Path Interpolation Utilities for Metric Line Morph Animation
 *
 * Provides functions to resample metric data to a common set of X positions,
 * interpolate Y values, and generate SVG path strings for smooth morphing
 * between different metrics.
 */

import type { ScaleTime } from 'd3-scale'
import type { AIMetricSeries } from '@/data/ai-metrics.generated'
import type { LinearScale } from '@/lib/utils/scales'

export interface Point {
  x: number
  y: number
}

/**
 * Number of points to resample to for smooth animation.
 * 100 provides good visual fidelity without being too heavy.
 */
const RESAMPLE_POINTS = 100

/**
 * Check if a metric uses the primary Y-axis scale (METR Task Horizon).
 *
 * NOTE: This is now used only for visual styling (opacity, stroke width).
 * All metrics use the same yScale for positioning - the yScale domain
 * is animated when switching metrics, so all metrics should use yScale
 * directly for consistent positioning of both dots and lines.
 */
export function isPrimaryMetric(metricId: string): boolean {
  return metricId === 'metr'
}

/**
 * Resample a metric's data to evenly-spaced points within the visible viewport.
 * Returns pixel coordinates ready for SVG rendering.
 *
 * @param metric - The metric series to resample
 * @param xScale - Time scale for X-axis positioning
 * @param yScale - Linear scale for Y-axis (METR primary)
 * @param innerHeight - Chart inner height for overlay metrics
 * @param numPoints - Number of points to generate (default: 100)
 * @returns Array of {x, y} pixel coordinates
 */
export function resampleMetricToPoints(
  metric: AIMetricSeries,
  xScale: ScaleTime<number, number>,
  yScale: LinearScale,
  _innerHeight: number, // Kept for API compatibility, no longer used
  numPoints: number = RESAMPLE_POINTS
): Point[] {
  const [domainStart, domainEnd] = xScale.domain()

  // Filter data to visible range
  const visibleData = metric.data.filter((d) => {
    const date = new Date(d.date)
    return date >= domainStart && date <= domainEnd
  })

  if (visibleData.length < 2) {
    return []
  }

  // Get date range for visible data
  const visibleDates = visibleData.map((d) => new Date(d.date).getTime())
  const minTime = Math.min(...visibleDates)
  const maxTime = Math.max(...visibleDates)

  // Generate evenly-spaced sample points
  const points: Point[] = []
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1)
    const targetTime = minTime + t * (maxTime - minTime)
    const targetDate = new Date(targetTime)

    // Find the interval containing this time and interpolate
    const yValue = interpolateValueAtTime(visibleData, targetTime)

    // Convert to pixel coordinates using the shared yScale
    // The yScale domain is set to the selected metric's domain and animates
    // when switching metrics, ensuring dots and lines share the same coordinate system
    const x = xScale(targetDate) ?? 0
    const y = yScale(yValue) ?? 0

    points.push({ x, y })
  }

  return points
}

/**
 * Interpolate a value at a specific timestamp from metric data.
 * Uses linear interpolation between adjacent points.
 */
function interpolateValueAtTime(
  data: { date: string; value: number }[],
  targetTime: number
): number {
  // Find the two points surrounding targetTime
  let prevIdx = -1
  for (let i = 0; i < data.length; i++) {
    const pointTime = new Date(data[i].date).getTime()
    if (pointTime <= targetTime) {
      prevIdx = i
    } else {
      break
    }
  }

  // Edge cases
  if (prevIdx === -1) {
    return data[0].value
  }
  if (prevIdx === data.length - 1) {
    return data[data.length - 1].value
  }

  // Linear interpolation
  const prev = data[prevIdx]
  const next = data[prevIdx + 1]
  const prevTime = new Date(prev.date).getTime()
  const nextTime = new Date(next.date).getTime()
  const ratio = (targetTime - prevTime) / (nextTime - prevTime)

  return prev.value + ratio * (next.value - prev.value)
}

/**
 * Convert an array of points to an SVG path `d` attribute string.
 * Uses line-to (L) commands for direct point-to-point connections.
 * This works well for morph animations with many resampled points.
 *
 * @param points - Array of {x, y} coordinates
 * @returns SVG path d attribute string
 */
export function pointsToPathD(points: Point[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`

  // Start with move to first point
  let d = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`

  // Connect points with line-to commands
  // With 100 resampled points, L commands produce visually smooth lines
  for (let i = 1; i < points.length; i++) {
    const curr = points[i]
    d += ` L${curr.x.toFixed(2)},${curr.y.toFixed(2)}`
  }

  return d
}

/**
 * Interpolate between two path point arrays.
 * Both arrays must have the same length.
 *
 * @param from - Starting points
 * @param to - Ending points
 * @param t - Interpolation factor (0 = from, 1 = to)
 * @returns Interpolated points
 */
export function interpolatePoints(from: Point[], to: Point[], t: number): Point[] {
  if (from.length !== to.length) {
    console.warn('Path interpolation: arrays have different lengths')
    return t < 0.5 ? from : to
  }

  return from.map((fromPoint, i) => ({
    x: fromPoint.x + (to[i].x - fromPoint.x) * t,
    y: fromPoint.y + (to[i].y - fromPoint.y) * t,
  }))
}

/**
 * Get resampled path string for a metric, ready for animation.
 *
 * @param metric - The metric series
 * @param xScale - Time scale for X-axis
 * @param yScale - Linear scale for Y-axis (METR primary)
 * @param innerHeight - Chart inner height
 * @returns SVG path d string
 */
export function getMetricPathD(
  metric: AIMetricSeries,
  xScale: ScaleTime<number, number>,
  yScale: LinearScale,
  innerHeight: number
): string {
  const points = resampleMetricToPoints(metric, xScale, yScale, innerHeight)
  return pointsToPathD(points)
}
