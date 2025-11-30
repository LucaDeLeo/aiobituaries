'use client'

/**
 * ZoomControls Component
 *
 * Floating control panel for zoom in/out and reset functionality.
 * Provides visual feedback for current zoom level and disabled states at limits.
 */

import { motion } from 'motion/react'
import { Plus, Minus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ZoomControlsProps {
  /** Current zoom scale (e.g., 1 = 100%) */
  scale: number
  /** Handler for zoom in button click */
  onZoomIn: () => void
  /** Handler for zoom out button click */
  onZoomOut: () => void
  /** Handler for reset button click */
  onReset: () => void
  /** Whether zoom is at minimum (0.5x) */
  isMinZoom: boolean
  /** Whether zoom is at maximum (5x) */
  isMaxZoom: boolean
}

export function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  isMinZoom,
  isMaxZoom,
}: ZoomControlsProps) {
  // Reset is disabled when scale is approximately 1
  const isDefaultZoom = Math.abs(scale - 1) < 0.01

  return (
    <motion.div
      className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-lg border border-[--border] bg-[--bg-secondary]/80 p-1 backdrop-blur-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.5 }}
      data-testid="zoom-controls"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onZoomOut}
        disabled={isMinZoom}
        className="h-8 w-8 text-[--text-secondary] hover:text-[--text-primary] disabled:opacity-30"
        aria-label="Zoom out"
        data-testid="zoom-out-button"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <span
        className="min-w-[3rem] text-center text-xs text-[--text-secondary]"
        data-testid="zoom-percentage"
      >
        {Math.round(scale * 100)}%
      </span>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onZoomIn}
        disabled={isMaxZoom}
        className="h-8 w-8 text-[--text-secondary] hover:text-[--text-primary] disabled:opacity-30"
        aria-label="Zoom in"
        data-testid="zoom-in-button"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-4 w-px bg-[--border]" />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onReset}
        disabled={isDefaultZoom}
        className="h-8 w-8 text-[--text-secondary] hover:text-[--text-primary] disabled:opacity-30"
        aria-label="Reset zoom"
        data-testid="zoom-reset-button"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
