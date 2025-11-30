'use client'

import { motion } from 'motion/react'
import { formatDate } from '@/lib/utils/date'
import { tooltipAppear, DURATIONS } from '@/lib/utils/animation'
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
  // Tooltip dimensions and padding
  const tooltipWidth = 280
  const tooltipHeight = 120 // Approximate height
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

  return (
    <motion.div
      data-testid="tooltip-card"
      variants={tooltipAppear}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: DURATIONS.fast }}
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        maxWidth: '280px',
        zIndex: 50,
      }}
      className="pointer-events-none"
    >
      <div className="bg-[var(--bg-tertiary)] border border-[var(--accent-primary)] rounded-lg p-3 shadow-lg">
        <p className="text-sm text-[var(--text-primary)] font-serif leading-snug mb-2">
          &quot;{truncatedClaim}&quot;
        </p>
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-mono">Source: {obituary.source}</span>
          <span className="font-mono">{formatDate(obituary.date)}</span>
        </div>
      </div>
    </motion.div>
  )
}
