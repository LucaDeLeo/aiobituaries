import { scaleLog, scaleLinear } from '@visx/scale'

/**
 * Standard tick values for FLOP Y-axis (10^17 to 10^27)
 * Covers the range relevant for modern AI training compute
 */
export const LOG_TICK_VALUES = [
  1e17, 1e18, 1e19, 1e20, 1e21, 1e22, 1e23, 1e24, 1e25, 1e26, 1e27,
] as const

/**
 * Type for the log scale returned by createLogYScale
 */
export type LogScale = ReturnType<typeof createLogYScale>

/**
 * Create logarithmic Y-scale for FLOP values
 * @param height - Chart inner height in pixels
 * @param domain - [minFlop, maxFlop] actual FLOP values (not log)
 * @returns visx ScaleLog configured for Y-axis rendering
 */
export function createLogYScale(height: number, domain: [number, number]) {
  return scaleLog({
    domain,
    range: [height, 0], // Inverted: high FLOP at top (y=0)
    base: 10,
  })
}

/**
 * Unicode superscript characters for digits 0-9
 */
const SUPERSCRIPTS = '\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079'

/**
 * Convert integer to Unicode superscript string
 * @param n - Integer to convert
 * @returns String with superscript digits
 */
export function toSuperscript(n: number): string {
  const str = String(Math.abs(Math.round(n)))
  const prefix = n < 0 ? '\u207b' : '' // Superscript minus
  return prefix + str.split('').map(d => SUPERSCRIPTS[parseInt(d)]).join('')
}

/**
 * Format FLOP value as tick label with superscript notation
 * @param value - FLOP value (e.g., 1e24)
 * @returns Formatted string (e.g., "10^24" with superscript)
 */
export function formatFlopTick(value: number): string {
  const exp = Math.round(Math.log10(value))
  return `10${toSuperscript(exp)}`
}

/**
 * Convert log10 value to actual FLOP
 * @param logValue - Log base 10 of FLOP (e.g., 24 for 10^24)
 * @returns Actual FLOP value
 */
export function logToFlop(logValue: number): number {
  return Math.pow(10, logValue)
}

/**
 * Convert actual FLOP to log10 value
 * @param flop - Actual FLOP value
 * @returns Log base 10 of FLOP
 * @note Returns -Infinity for 0, NaN for negative values
 */
export function flopToLog(flop: number): number {
  return Math.log10(flop)
}

/**
 * Filter LOG_TICK_VALUES to only those within a domain
 * Useful for rendering only visible axis ticks
 * @param domain - [min, max] FLOP values
 * @returns Filtered tick values within domain
 */
export function getVisibleTickValues(domain: [number, number]): number[] {
  return LOG_TICK_VALUES.filter(v => v >= domain[0] && v <= domain[1])
}

// =============================================================================
// METR Task Horizon Linear Scale (minutes)
// =============================================================================

/**
 * Type for the linear scale returned by createLinearYScale
 */
export type LinearScale = ReturnType<typeof createLinearYScale>

/**
 * Create linear Y-scale for METR Task Horizon values (minutes)
 * @param height - Chart inner height in pixels
 * @param domain - [min, max] minutes (typically [0, maxMinutes])
 * @returns visx ScaleLinear configured for Y-axis rendering
 */
export function createLinearYScale(height: number, domain: [number, number]) {
  return scaleLinear({
    domain,
    range: [height, 0], // Inverted: high values at top (y=0)
  })
}

/**
 * Standard tick values for METR Y-axis (0 to 300 minutes)
 * @deprecated Use METRIC_CONFIGS from '@/lib/utils/metric-scales' instead.
 * That system computes tick values dynamically from data.
 */
export const METR_TICK_VALUES = [0, 50, 100, 150, 200, 250, 300] as const

/**
 * Format METR tick value as label (simple version)
 * @deprecated Use formatMetrTick from '@/lib/utils/metric-scales' instead.
 * The new version handles hours for values >= 60 minutes.
 * @param value - Minutes value
 * @returns Formatted string with "min" suffix
 */
export function formatMetrTick(value: number): string {
  return `${Math.round(value)}min`
}

/**
 * Get visible tick values for METR linear scale
 * @deprecated Use getVisibleTickValues from '@/lib/utils/metric-scales' instead.
 * @param domain - [min, max] minutes
 * @returns Filtered tick values within domain
 */
export function getVisibleMetrTickValues(domain: [number, number]): number[] {
  return METR_TICK_VALUES.filter(v => v >= domain[0] && v <= domain[1])
}
