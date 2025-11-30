'use client'

/**
 * useZoom Hook
 *
 * Manages zoom state for interactive visualizations.
 * Supports wheel zoom, pinch-to-zoom, and programmatic zoom controls.
 * Implements center-point zoom to keep the point under cursor stationary.
 */

import { useCallback } from 'react'
import { useReducedMotion } from 'motion/react'
import { SPRINGS } from '@/lib/utils/animation'
import type { ViewState } from '@/types/visualization'

// Zoom constants
export const MIN_SCALE = 0.5
export const MAX_SCALE = 5
export const ZOOM_STEP = 1.2 // 20% per step

export interface UseZoomOptions {
  /** Minimum zoom scale (default: 0.5) */
  minScale?: number
  /** Maximum zoom scale (default: 5) */
  maxScale?: number
  /** Zoom step multiplier (default: 1.2 for 20% steps) */
  zoomStep?: number
}

export interface UseZoomReturn {
  /** Current zoom scale */
  scale: number
  /** Zoom in by one step */
  zoomIn: () => void
  /** Zoom out by one step */
  zoomOut: () => void
  /** Reset zoom to 1x and reset translate to 0 */
  resetZoom: () => void
  /** Set scale with optional center point adjustment */
  setScale: (scale: number, centerX?: number, centerY?: number) => void
  /** Handle wheel event for zoom */
  handleWheel: (event: WheelEvent, containerRect: DOMRect) => void
  /** Handle pinch gesture for zoom */
  handlePinch: (pinchScale: number, centerX: number, centerY: number) => void
  /** True when at minimum zoom */
  isMinZoom: boolean
  /** True when at maximum zoom */
  isMaxZoom: boolean
  /** True when user prefers reduced motion */
  shouldReduceMotion: boolean
  /** Get zoom transition config (respects reduced motion) */
  getZoomTransition: () => typeof SPRINGS.zoom | { duration: number }
}

/**
 * Pure function to clamp scale within bounds.
 * Exported for testing.
 */
export function createClampScale(minScale: number, maxScale: number) {
  return (scale: number): number => Math.max(minScale, Math.min(maxScale, scale))
}

/**
 * Calculate center-point zoom adjustment for translate values.
 * Formula: newTranslate = zoomPoint - (zoomPoint - oldTranslate) * (newScale / oldScale)
 * Exported for testing.
 */
export function calculateCenterPointZoom(
  oldScale: number,
  newScale: number,
  oldTranslateX: number,
  oldTranslateY: number,
  centerX: number,
  centerY: number
): { translateX: number; translateY: number } {
  const scaleDelta = newScale / oldScale
  return {
    translateX: centerX - (centerX - oldTranslateX) * scaleDelta,
    translateY: centerY - (centerY - oldTranslateY) * scaleDelta,
  }
}

/**
 * Hook for managing zoom state in visualizations.
 *
 * @param viewState - Current view state (scale, translateX, translateY)
 * @param setViewState - State setter for view state
 * @param options - Optional configuration for zoom behavior
 */
export function useZoom(
  viewState: ViewState,
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>,
  options: UseZoomOptions = {}
): UseZoomReturn {
  const {
    minScale = MIN_SCALE,
    maxScale = MAX_SCALE,
    zoomStep = ZOOM_STEP,
  } = options

  // Check reduced motion preference (null means preference unknown, treat as false)
  const prefersReducedMotion = useReducedMotion()
  const shouldReduceMotion = prefersReducedMotion ?? false

  const clampScale = useCallback(
    (scale: number) => createClampScale(minScale, maxScale)(scale),
    [minScale, maxScale]
  )

  // Get transition config based on reduced motion preference
  const getZoomTransition = useCallback(() => {
    return shouldReduceMotion ? { duration: 0 } : SPRINGS.zoom
  }, [shouldReduceMotion])

  const zoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      scale: clampScale(prev.scale * zoomStep),
    }))
  }, [clampScale, zoomStep, setViewState])

  const zoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      scale: clampScale(prev.scale / zoomStep),
    }))
  }, [clampScale, zoomStep, setViewState])

  const resetZoom = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      scale: 1,
      translateX: 0,
      translateY: 0,
    }))
  }, [setViewState])

  const setScale = useCallback(
    (newScale: number, centerX?: number, centerY?: number) => {
      const clamped = clampScale(newScale)
      setViewState((prev) => {
        if (centerX !== undefined && centerY !== undefined) {
          const { translateX, translateY } = calculateCenterPointZoom(
            prev.scale,
            clamped,
            prev.translateX,
            prev.translateY,
            centerX,
            centerY
          )
          return {
            ...prev,
            scale: clamped,
            translateX,
            translateY,
          }
        }
        return { ...prev, scale: clamped }
      })
    },
    [clampScale, setViewState]
  )

  const handleWheel = useCallback(
    (event: WheelEvent, containerRect: DOMRect) => {
      // Skip if shift is held (reserved for horizontal pan from Story 3-3)
      if (event.shiftKey) return
      // Skip horizontal scroll (trackpad pan)
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return

      event.preventDefault()

      // Scroll up (negative deltaY) = zoom in, scroll down = zoom out
      const delta = event.deltaY > 0 ? 1 / zoomStep : zoomStep
      const centerX = event.clientX - containerRect.left
      const centerY = event.clientY - containerRect.top

      setViewState((prev) => {
        const newScale = clampScale(prev.scale * delta)
        const { translateX, translateY } = calculateCenterPointZoom(
          prev.scale,
          newScale,
          prev.translateX,
          prev.translateY,
          centerX,
          centerY
        )
        return {
          ...prev,
          scale: newScale,
          translateX,
          translateY,
        }
      })
    },
    [clampScale, zoomStep, setViewState]
  )

  const handlePinch = useCallback(
    (pinchScale: number, centerX: number, centerY: number) => {
      setViewState((prev) => {
        const newScale = clampScale(prev.scale * pinchScale)
        const { translateX, translateY } = calculateCenterPointZoom(
          prev.scale,
          newScale,
          prev.translateX,
          prev.translateY,
          centerX,
          centerY
        )
        return {
          ...prev,
          scale: newScale,
          translateX,
          translateY,
        }
      })
    },
    [clampScale, setViewState]
  )

  return {
    scale: viewState.scale,
    zoomIn,
    zoomOut,
    resetZoom,
    setScale,
    handleWheel,
    handlePinch,
    isMinZoom: viewState.scale <= minScale,
    isMaxZoom: viewState.scale >= maxScale,
    shouldReduceMotion,
    getZoomTransition,
  }
}
