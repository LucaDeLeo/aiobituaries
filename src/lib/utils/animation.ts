/**
 * Animation Presets and Utilities
 *
 * Shared animation constants and helpers for consistent motion behavior
 * across the application. Includes spring configurations and reduced motion support.
 */

import type { Variants } from 'motion/react'

/**
 * Standard duration presets (in seconds)
 */
export const DURATIONS = {
  /** 150ms - hover states, tooltips */
  fast: 0.15,
  /** 200ms - state changes */
  normal: 0.2,
  /** 300ms - modal open/close */
  slow: 0.3,
} as const

/**
 * Spring animation presets for Motion/Framer
 * Each preset is tuned for specific interaction types:
 * - hover: Quick, responsive feedback
 * - zoom: Snappy scale changes
 * - pan: Smooth, momentum-like scrolling
 */
export const SPRINGS = {
  /** Quick response for hover/focus states */
  hover: { type: 'spring' as const, stiffness: 300, damping: 20 },
  /** Snappy zoom transitions */
  zoom: { type: 'spring' as const, stiffness: 300, damping: 30 },
  /** Smooth pan with momentum feel */
  pan: { type: 'spring' as const, stiffness: 100, damping: 20 },
} as const

/**
 * Check if user prefers reduced motion.
 * Returns true if the user has enabled reduced motion in their OS settings.
 *
 * @returns boolean - true if reduced motion is preferred
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get transition configuration for a specific animation type.
 * Respects reduced motion preference.
 *
 * @param key - The animation preset key
 * @returns Transition configuration object
 */
export function getTransition(key: keyof typeof SPRINGS): typeof SPRINGS[keyof typeof SPRINGS] | { duration: number } {
  if (shouldReduceMotion()) {
    return { duration: 0 }
  }
  return SPRINGS[key]
}

/**
 * Tooltip appear animation.
 * Subtle fade-in with slight scale and upward movement.
 * Used for hover tooltips on timeline data points.
 */
export const tooltipAppear: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 5 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
}

/**
 * Modal slide-in animation from right.
 * Slides in from right edge with fade-in effect.
 * Used for obituary modal drawer component.
 */
export const modalSlideIn: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
}
