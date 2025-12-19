'use client'

import { useRef, forwardRef, useImperativeHandle, memo } from 'react'
import { motion } from 'framer-motion'
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
  /** Whether to reduce motion (computed once in parent to avoid N hook calls) */
  shouldReduceMotion: boolean
  /** Tab index for roving tabindex pattern (0 = focusable, -1 = programmatically focusable) */
  tabIndex?: 0 | -1
  /** Whether this point currently has keyboard focus */
  isFocused?: boolean
  /** Handler for keyboard events */
  onKeyDown?: (event: React.KeyboardEvent) => void
  /** Handler for focus events */
  onFocus?: () => void
  /** Touch target radius - passed from parent to avoid N resize listeners (P0.1 fix) */
  touchRadius?: number
}

const POINT_RADIUS = 7 // 14px diameter (visual size)
const FOCUSED_POINT_RADIUS = 9 // ~1.25x scale when focused (AC-6.2.5)
const FOCUS_RING_RADIUS = 14 // 2px gold ring outside point (AC-6.2.5)

/**
 * Custom comparison function for React.memo to prevent unnecessary re-renders.
 * Only re-render if critical props change (position, state, or obituary data).
 */
function arePropsEqual(prev: ScatterPointProps, next: ScatterPointProps): boolean {
  return (
    prev.obituary._id === next.obituary._id &&
    prev.x === next.x &&
    prev.y === next.y &&
    prev.isFocused === next.isFocused &&
    prev.isFiltered === next.isFiltered &&
    prev.isHovered === next.isHovered &&
    prev.isClustered === next.isClustered &&
    prev.color === next.color &&
    prev.tabIndex === next.tabIndex &&
    prev.touchRadius === next.touchRadius
  )
}

const ScatterPointComponent = forwardRef<SVGGElement, ScatterPointProps>(
  function ScatterPoint(
    {
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
      shouldReduceMotion,
      tabIndex = -1,
      isFocused = false,
      onKeyDown,
      onFocus,
      touchRadius: touchRadiusProp,
    },
    ref
  ) {
    const circleRef = useRef<SVGCircleElement>(null)
    const groupRef = useRef<SVGGElement>(null)

    // Expose the group element via forwardRef
    useImperativeHandle(ref, () => groupRef.current as SVGGElement)

    // Hidden if clustered
    if (isClustered) return null

    // Touch target size - use prop from parent (avoids N resize listeners per P0.1)
    const touchRadius = touchRadiusProp ?? POINT_RADIUS

    const opacity = isFiltered ? (isHovered || isFocused ? 1 : 0.85) : 0.2
    // More dramatic glow effect
    const glowIntensity = isHovered || isFocused ? 12 : 6
    const outerGlowIntensity = isHovered || isFocused ? 20 : 10

    // Use larger radius when focused (AC-6.2.5: 1.25x scale)
    const currentRadius = isFocused ? FOCUSED_POINT_RADIUS : POINT_RADIUS

    const handleClick = () => {
      if (circleRef.current && onClick) {
        onClick(circleRef.current as unknown as HTMLElement)
      }
    }

    // Generate unique IDs for ARIA relationships
    const pointId = `point-${obituary._id}`
    const descriptionId = `desc-${obituary._id}`

    // Format date for screen reader (UTC-safe)
    const date = new Date(obituary.date + 'T00:00:00Z')
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })

    return (
      <g
        ref={groupRef}
        data-testid="scatter-point-group"
        role="listitem"
        tabIndex={tabIndex}
        aria-labelledby={pointId}
        aria-describedby={descriptionId}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        className="outline-none"
        style={{ cursor: isFiltered ? 'pointer' : 'default' }}
      >
        {/* Screen reader accessible name */}
        <title id={pointId}>{`${obituary.source} - ${formattedDate}`}</title>

        {/* Screen reader extended description */}
        <desc id={descriptionId}>
          {`${obituary.claim.slice(0, 150)}${obituary.claim.length > 150 ? '...' : ''}. Category: ${obituary.categories.join(', ')}`}
        </desc>

        {/* Focus ring - visible when focused (AC-6.2.5: 2px gold ring) */}
        {isFocused && (
          <circle
            cx={x}
            cy={y}
            r={FOCUS_RING_RADIUS}
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth={2}
            strokeDasharray="4 2"
            className={shouldReduceMotion ? '' : 'animate-focus-ring'}
            data-testid="scatter-point-focus-ring"
          />
        )}

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
        />

        {/* Outer glow ring (subtle atmospheric effect) */}
        {/* suppressHydrationWarning: Framer Motion renders initial opacity differently on SSR vs client */}
        {isFiltered && (
          <motion.circle
            suppressHydrationWarning
            cx={x}
            cy={y}
            r={currentRadius + 4}
            fill="none"
            stroke={color}
            strokeWidth={1}
            style={{
              pointerEvents: 'none',
            }}
            initial={{
              opacity: 0.15,
              r: currentRadius + 4,
            }}
            animate={{
              opacity: isHovered || isFocused ? 0.4 : 0.15,
              r: isHovered || isFocused ? currentRadius + 6 : currentRadius + 4,
            }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          />
        )}

        {/* Visual dot (scales up when focused per AC-6.2.5) */}
        {/* suppressHydrationWarning: Framer Motion renders initial props differently on SSR vs client */}
        <motion.circle
          suppressHydrationWarning
          data-testid="scatter-point"
          cx={x}
          cy={y}
          r={currentRadius}
          fill={color}
          style={{
            filter: `drop-shadow(0 0 ${glowIntensity}px ${color}) drop-shadow(0 0 ${outerGlowIntensity}px ${color}40)`,
            pointerEvents: 'none',
            willChange: shouldReduceMotion ? 'auto' : 'transform, opacity',
          }}
          variants={shouldReduceMotion ? undefined : staggerItem}
          initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0 }}
          animate={
            shouldReduceMotion
              ? { opacity }
              : {
                  opacity,
                  scale: isHovered ? 1.3 : 1,
                }
          }
          whileHover={shouldReduceMotion ? undefined : { scale: 1.3 }}
          transition={
            shouldReduceMotion
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
)

/**
 * Memoized ScatterPoint component to prevent unnecessary re-renders during scroll/pan.
 * Uses custom comparison to only re-render when relevant props change.
 */
export const ScatterPoint = memo(ScatterPointComponent, arePropsEqual)
