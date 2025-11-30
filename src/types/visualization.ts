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
