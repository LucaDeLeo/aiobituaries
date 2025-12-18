'use client'

/**
 * ZoomControls Component
 *
 * Floating control panel for zoom in/out and reset functionality.
 * Provides visual feedback for current zoom level and disabled states at limits.
 * Touch targets adapt based on breakpoint (48px mobile/tablet, 32px desktop).
 *
 * Responsive positioning:
 * - Desktop (>=1024px): top-right of chart area, 16px offset
 * - Mobile/Tablet (<1024px): bottom-right above FAB trigger
 */

import { motion } from 'framer-motion'
import { Plus, Minus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'
import { cn } from '@/lib/utils'

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
  const breakpoint = useBreakpoint()
  const isDesktop = breakpoint === 'desktop'

  // Reset is disabled when scale is approximately 1
  const isDefaultZoom = Math.abs(scale - 1) < 0.01

  // Touch target size: mobile/tablet get 48px, desktop gets 32px (WCAG 2.5.5)
  const buttonSize = isDesktop ? 'h-8 w-8' : 'h-12 w-12'
  const iconSize = isDesktop ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <motion.div
      className={cn(
        // Base styles
        'absolute z-20 flex items-center gap-1 rounded-lg border border-[--border] bg-[--bg-secondary]/80 p-1 backdrop-blur-md',
        // Horizontal position - always right
        'right-4',
        // Vertical position - responsive
        // Desktop: top-right of chart area
        'lg:top-4 lg:bottom-auto',
        // Mobile/tablet: above FAB (56px FAB + 24px offset + 16px gap = ~96px)
        'bottom-[calc(80px+1rem)] top-auto'
      )}
      initial={{ opacity: 0, y: isDesktop ? -10 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.5 }}
      data-testid="zoom-controls"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onZoomOut}
        disabled={isMinZoom}
        className={cn(
          buttonSize,
          'text-[--text-secondary] hover:text-[--text-primary] disabled:opacity-30'
        )}
        aria-label="Zoom out"
        data-testid="zoom-out-button"
      >
        <Minus className={iconSize} aria-hidden="true" />
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
        className={cn(
          buttonSize,
          'text-[--text-secondary] hover:text-[--text-primary] disabled:opacity-30'
        )}
        aria-label="Zoom in"
        data-testid="zoom-in-button"
      >
        <Plus className={iconSize} aria-hidden="true" />
      </Button>

      <div className="mx-1 h-4 w-px bg-[--border]" />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onReset}
        disabled={isDefaultZoom}
        className={cn(
          buttonSize,
          'text-[--text-secondary] hover:text-[--text-primary] disabled:opacity-30'
        )}
        aria-label="Reset zoom"
        data-testid="zoom-reset-button"
      >
        <RotateCcw className={iconSize} aria-hidden="true" />
      </Button>
    </motion.div>
  )
}
