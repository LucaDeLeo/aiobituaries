'use client'

import { useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { staggerItem } from '@/lib/utils/animation'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'
import type { ObituarySummary } from '@/types/obituary'

export interface ScatterPointProps {
  obituary: ObituarySummary
  x: number
  y: number
  color: string
  isFiltered?: boolean
  isHovered?: boolean
  isClustered?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onClick?: (element: HTMLElement) => void
  /** Override reduced motion for testing purposes */
  shouldReduceMotion?: boolean
}

const POINT_RADIUS = 7 // 14px diameter (visual size)
const TABLET_TOUCH_RADIUS = 22 // 44px diameter touch target for tablet

export function ScatterPoint({
  obituary,
  x,
  y,
  color,
  isFiltered = true,
  isHovered = false,
  isClustered = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  shouldReduceMotion: shouldReduceMotionProp,
}: ScatterPointProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const breakpoint = useBreakpoint()

  // Check reduced motion preference - allow override for testing
  // IMPORTANT: Call hook unconditionally before early return
  const reducedMotionPref = useReducedMotion()
  const prefersReducedMotion = shouldReduceMotionProp ?? reducedMotionPref

  // Hidden if clustered
  if (isClustered) return null

  // Touch target size based on breakpoint
  const touchRadius = breakpoint === 'tablet' ? TABLET_TOUCH_RADIUS : POINT_RADIUS

  const opacity = isFiltered ? (isHovered ? 1 : 0.8) : 0.2
  const glowIntensity = isHovered ? 6 : 4

  const handleClick = () => {
    if (circleRef.current && onClick) {
      onClick(circleRef.current as unknown as HTMLElement)
    }
  }

  return (
    <g data-testid="scatter-point-group">
      {/* Invisible touch target (larger on tablet for 44px minimum) */}
      <motion.circle
        ref={circleRef}
        data-testid="scatter-point-touch-target"
        cx={x}
        cy={y}
        r={touchRadius}
        fill="transparent"
        style={{
          cursor: isFiltered ? 'pointer' : 'default',
          pointerEvents: isFiltered ? 'auto' : 'none',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleClick}
        role="img"
        aria-label={`${obituary.source}: ${obituary.claim.slice(0, 50)}...`}
      />

      {/* Visual dot (always 14px) */}
      <motion.circle
        data-testid="scatter-point"
        cx={x}
        cy={y}
        r={POINT_RADIUS}
        fill={color}
        style={{
          filter: `drop-shadow(0 0 ${glowIntensity}px ${color})`,
          pointerEvents: 'none',
          willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
        }}
        variants={prefersReducedMotion ? undefined : staggerItem}
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0 }}
        animate={
          prefersReducedMotion
            ? { opacity }
            : {
                opacity,
                scale: isHovered ? 1.3 : 1,
              }
        }
        whileHover={prefersReducedMotion ? undefined : { scale: 1.3 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                // 200ms per AC-4.4.6 for filter transitions
                opacity: { duration: 0.2 },
                scale: { type: 'spring', stiffness: 300, damping: 20 },
              }
        }
      />
    </g>
  )
}
