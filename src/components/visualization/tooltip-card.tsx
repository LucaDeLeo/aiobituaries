'use client'

import { motion, useReducedMotion } from 'motion/react'
import { formatDate } from '@/lib/utils/date'
import { tooltipAppear, DURATIONS } from '@/lib/utils/animation'
import { formatFlopTick } from '@/lib/utils/scales'
import { getActualFlopAtDate, trainingComputeFrontier } from '@/data/ai-metrics'
import type { ObituarySummary } from '@/types/obituary'

export interface TooltipCardProps {
  obituary: ObituarySummary
  x: number
  y: number
  containerBounds: DOMRect
}

/**
 * TooltipCard Component
 *
 * Displays a hover tooltip preview for timeline data points.
 * Shows claim (truncated to 100 chars), source name, and formatted date.
 *
 * Features:
 * - Intelligent positioning with edge detection
 * - Fade-in animation with scale (150ms)
 * - Portal-like rendering outside SVG context
 * - Respects reduced motion preferences
 *
 * Positioning Logic:
 * - Default: Centered above dot
 * - Near top edge: Flips to below dot
 * - Near right edge: Aligns left
 * - Near left edge: Aligns right
 */
export function TooltipCard({ obituary, x, y, containerBounds }: TooltipCardProps) {
  // Check reduced motion preference
  const shouldReduceMotion = useReducedMotion()

  // Tooltip dimensions and padding
  const tooltipWidth = 280
  const tooltipHeight = 140 // Approximate height (increased for FLOP line)
  const padding = 12
  const dotRadius = 14 // Account for dot size when flipping to below

  // Calculate default position (centered above dot)
  let left = x - tooltipWidth / 2
  let top = y - tooltipHeight - padding

  // Boundary detection: Right edge
  if (left + tooltipWidth > containerBounds.width) {
    left = containerBounds.width - tooltipWidth - padding
  }

  // Boundary detection: Left edge
  if (left < 0) {
    left = padding
  }

  // Boundary detection: Top edge (flip to below)
  if (top < 0) {
    top = y + padding + dotRadius
  }

  // Truncate claim to 100 characters
  const truncatedClaim =
    obituary.claim.length > 100
      ? `${obituary.claim.slice(0, 100)}...`
      : obituary.claim

  // Calculate FLOP value at obituary date
  const flopValue = getActualFlopAtDate(trainingComputeFrontier, new Date(obituary.date))
  const formattedFlop = formatFlopTick(flopValue)

  return (
    <motion.div
      data-testid="tooltip-card"
      variants={shouldReduceMotion ? undefined : tooltipAppear}
      initial={shouldReduceMotion ? undefined : "initial"}
      animate={shouldReduceMotion ? undefined : "animate"}
      exit={shouldReduceMotion ? undefined : "exit"}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: DURATIONS.fast }}
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        maxWidth: '280px',
        zIndex: 50,
        willChange: shouldReduceMotion ? 'auto' : 'transform, opacity',
      }}
      className="pointer-events-none"
    >
      {/* Outer glow layer */}
      <div className="absolute -inset-1 bg-[var(--accent-primary)]/10 rounded-xl blur-sm" />

      {/* Main card with layered borders */}
      <div className="relative">
        {/* Decorative outer border */}
        <div className="absolute -inset-0.5 border border-[var(--accent-primary)]/20 rounded-xl" />

        {/* Main card */}
        <div className="relative bg-[var(--bg-tertiary)] border-2 border-[var(--accent-primary)] rounded-lg p-4 shadow-xl shadow-[var(--accent-primary)]/10">
          {/* Corner flourishes */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[var(--accent-primary)]/40" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[var(--accent-primary)]/40" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[var(--accent-primary)]/40" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[var(--accent-primary)]/40" />

          <p className="text-sm text-[var(--text-primary)] font-serif italic leading-snug mb-3">
            &ldquo;{truncatedClaim}&rdquo;
          </p>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
            <span className="font-mono truncate max-w-[140px]">{obituary.source}</span>
            <span className="font-mono text-[var(--text-muted)]">{formatDate(obituary.date)}</span>
          </div>

          {/* AI Progress (FLOP value at date) */}
          <div className="text-[11px] text-[var(--text-muted)] mt-2 font-mono">
            AI Progress: {formattedFlop} FLOP
          </div>
        </div>
      </div>
    </motion.div>
  )
}
