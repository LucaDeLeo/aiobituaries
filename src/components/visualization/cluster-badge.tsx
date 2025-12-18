'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { getCategoryColor } from '@/lib/utils/scatter-helpers'
import type { PointCluster } from '@/types/visualization'

interface ClusterBadgeProps {
  cluster: PointCluster
  onClick: () => void
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

/**
 * Visual badge for clustered points.
 * Displays count, uses primary category color, and supports click-to-zoom.
 */
export function ClusterBadge({
  cluster,
  onClick,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: ClusterBadgeProps) {
  // P2.1 fix: Check reduced motion preference
  const shouldReduceMotion = useReducedMotion()

  const color = getCategoryColor([cluster.primaryCategory])
  const radius = 12 // 24px diameter
  const badgeRadius = 8

  // Format count: "+N" for counts <= 99, "99+" for counts > 99
  const countText = cluster.count > 99 ? '99+' : `+${cluster.count}`

  return (
    <motion.g
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
      data-testid="cluster-badge"
      initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0 }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.15 }}
      transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow effect circle */}
      <circle
        cx={cluster.x}
        cy={cluster.y}
        r={radius + 4}
        fill={color}
        opacity={0.3}
        style={{
          filter: 'blur(4px)',
        }}
      />

      {/* Main cluster circle */}
      <circle
        cx={cluster.x}
        cy={cluster.y}
        r={radius}
        fill={color}
        opacity={isHovered ? 1 : 0.9}
        style={{
          filter: `drop-shadow(0 0 ${isHovered ? 8 : 4}px ${color})`,
        }}
      />

      {/* Count badge background */}
      <circle
        cx={cluster.x + radius - 2}
        cy={cluster.y - radius + 2}
        r={badgeRadius}
        fill="var(--bg-primary)"
        stroke={color}
        strokeWidth={1.5}
      />

      {/* Count text */}
      <text
        x={cluster.x + radius - 2}
        y={cluster.y - radius + 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--text-primary)"
        fontSize={9}
        fontWeight={600}
        fontFamily="var(--font-geist-mono)"
      >
        {countText}
      </text>
    </motion.g>
  )
}
