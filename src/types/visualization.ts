import type { ObituarySummary, Category } from './obituary'

/**
 * Y-axis mode for contextual scatter plot.
 * - spread: Default jitter-based distribution for visual clarity
 * - market: Y = NVDA stock price (future)
 * - capability: Y = benchmark score (future)
 * - agi: Y = milestone timeline (future)
 */
export type YAxisMode = 'spread' | 'market' | 'capability' | 'agi'

/**
 * Zoom and pan state for visualization.
 */
export interface ViewState {
  /** Zoom scale factor (0.5 to 5) */
  scale: number
  /** Pan offset X (pixels) */
  translateX: number
  /** Pan offset Y (pixels) */
  translateY: number
}

/**
 * Props for main ScatterPlot component.
 */
export interface ScatterPlotProps {
  /** Obituary data to visualize */
  data: ObituarySummary[]
  /** Y-axis mode (default: 'spread') */
  mode?: YAxisMode
  /** Active category filters (empty = all) */
  activeCategories?: Category[]
  /** Callback when obituary is selected */
  onSelect?: (obituary: ObituarySummary) => void
  /** Height (default: 400) */
  height?: number
}

/**
 * Cluster of overlapping points.
 * Created when points are within clustering threshold at low zoom levels.
 */
export interface PointCluster {
  /** Unique cluster ID (e.g., "cluster-0", "cluster-1") */
  id: string
  /** Center X position (pixel coordinate) */
  x: number
  /** Center Y position (pixel coordinate) */
  y: number
  /** Number of points in cluster (minimum 5 per ClusterConfig.minPoints) */
  count: number
  /** Obituary IDs of all points in this cluster */
  obituaryIds: string[]
  /** Primary category - most common category among cluster members */
  primaryCategory: Category
  /** Earliest date in cluster - for click-to-zoom bounds calculation */
  minDate: Date
  /** Latest date in cluster - for click-to-zoom bounds calculation */
  maxDate: Date
}

/**
 * Tooltip display data for hover tooltips.
 * Used to track which point is being hovered and where to render the tooltip.
 */
export interface TooltipData {
  /** Obituary being shown in tooltip */
  obituary: ObituarySummary
  /** Tooltip X position (pixel coordinate from ScatterPoint) */
  x: number
  /** Tooltip Y position (pixel coordinate from ScatterPoint) */
  y: number
}
