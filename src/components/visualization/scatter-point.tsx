'use client'

import { useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { staggerItem } from '@/lib/utils/animation'
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

const POINT_RADIUS = 7 // 14px diameter

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

  // Check reduced motion preference - allow override for testing
  // IMPORTANT: Call hook unconditionally before early return
  const reducedMotionPref = useReducedMotion()
  const prefersReducedMotion = shouldReduceMotionProp ?? reducedMotionPref

  // Hidden if clustered
  if (isClustered) return null

  const opacity = isFiltered ? (isHovered ? 1 : 0.8) : 0.2
  const glowIntensity = isHovered ? 6 : 4

  const handleClick = () => {
    if (circleRef.current && onClick) {
      onClick(circleRef.current as unknown as HTMLElement)
    }
  }

  return (
    <motion.circle
      ref={circleRef}
      data-testid="scatter-point"
      cx={x}
      cy={y}
      r={POINT_RADIUS}
      fill={color}
      style={{
        filter: `drop-shadow(0 0 ${glowIntensity}px ${color})`,
        cursor: isFiltered ? 'pointer' : 'default',
        pointerEvents: isFiltered ? 'auto' : 'none',
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
      role="img"
      aria-label={`${obituary.source}: ${obituary.claim.slice(0, 50)}...`}
    />
  )
}
