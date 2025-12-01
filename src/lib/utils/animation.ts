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
 * Reduced motion duration - near-instant but not zero
 * (allows state to register before completing)
 */
export const REDUCED_DURATION = 0.01

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

/**
 * Stagger container animation.
 * Applies staggered delay to child elements with dynamic timing calculation.
 * Maximum total duration is capped at 500ms regardless of child count.
 *
 * Usage:
 * <motion.g variants={staggerContainer} initial="initial" animate="animate">
 *   <motion.circle variants={staggerItem} />
 * </motion.g>
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05, // 50ms between each child
      delayChildren: 0.1, // 100ms initial delay
    },
  },
}

/**
 * Stagger item animation for individual data points.
 * Fades in from opacity 0 and scales up from 0 to full size.
 * Used with staggerContainer for entrance animations.
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 0.8, scale: 1 },
}

/**
 * Reduced motion animation presets.
 * Used when prefers-reduced-motion: reduce is enabled.
 */
export const REDUCED_SPRINGS = {
  hover: { duration: REDUCED_DURATION },
  zoom: { duration: REDUCED_DURATION },
  pan: { duration: REDUCED_DURATION },
} as const

/**
 * Get animation variants with reduced motion support.
 * Returns simplified variants when user prefers reduced motion.
 *
 * @param fullVariants - Original animation variants
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Simplified variants for reduced motion or original variants
 */
export function getReducedMotionVariants(
  fullVariants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (!prefersReducedMotion) return fullVariants

  // Create reduced motion version - keep final states, remove animations
  const reduced: Variants = {}
  for (const key of Object.keys(fullVariants)) {
    const variant = fullVariants[key]
    if (typeof variant === 'object' && variant !== null) {
      // Keep final state values, remove transitions
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { transition: _unusedTransition, ...state } = variant as Record<string, unknown>
      reduced[key] = {
        ...state,
        transition: { duration: REDUCED_DURATION },
      }
    } else {
      reduced[key] = variant
    }
  }
  return reduced
}

/**
 * Get scroll behavior respecting reduced motion preference.
 *
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns 'auto' for instant scroll or 'smooth' for animated scroll
 */
export function getScrollBehavior(prefersReducedMotion: boolean): ScrollBehavior {
  return prefersReducedMotion ? 'auto' : 'smooth'
}
