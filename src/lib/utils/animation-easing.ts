/**
 * Shared Animation Utilities
 *
 * Centralized easing functions and animation constants used across
 * the visualization system for consistent motion behavior.
 *
 * Used by:
 * - useAnimatedDomain (Y-axis transitions)
 * - useAnimatedDateDomain (X-axis transitions)
 * - BackgroundChart (line morph animations)
 */

/**
 * Animation duration in milliseconds.
 * All domain/chart animations use this value for visual cohesion.
 *
 * 600ms provides smooth transitions that feel responsive without being jarring.
 * This matches Material Design's "emphasized" duration for complex animations.
 */
export const ANIMATION_DURATION_MS = 600

/**
 * Ease-out quart easing function.
 *
 * Provides smooth deceleration with a pronounced slow-down at the end.
 * Formula: 1 - (1 - t)^4
 *
 * Characteristics:
 * - Starts fast, ends slow
 * - More pronounced than ease-out cubic
 * - Similar feel to Material Design's [0.4, 0, 0.2, 1] bezier
 *
 * @param t - Progress value from 0 to 1
 * @returns Eased progress value from 0 to 1
 *
 * @example
 * const progress = elapsed / duration
 * const easedProgress = easeOutQuart(progress)
 * const interpolatedValue = start + (end - start) * easedProgress
 */
export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}
