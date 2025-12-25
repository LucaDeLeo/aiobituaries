'use client'

import { useMemo, useRef, useState, useCallback, useEffect, startTransition } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  animate,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion'
import { ParentSize } from '@visx/responsive'
import { cn } from '@/lib/utils'
import { scaleTime } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridColumns, GridRows } from '@visx/grid'
import { Group } from '@visx/group'
import type { ObituarySummary, Category } from '@/types/obituary'
import type { ViewState, PointCluster, TooltipData } from '@/types/visualization'
import { ScatterPoint } from './scatter-point'
import { ClusterBadge } from './cluster-badge'
import { TooltipCard } from './tooltip-card'
import { ObituaryModal } from '@/components/obituary/obituary-modal'
import { hashToJitter, getCategoryColor } from '@/lib/utils/scatter-helpers'
import { useTimelinePosition } from '@/lib/hooks/use-timeline-position'
import { SPRINGS } from '@/lib/utils/animation'
import { markPerformance, measurePerformance } from '@/lib/utils/performance'
import {
  computeClusters,
  shouldShowClusters,
  DEFAULT_CLUSTER_CONFIG,
} from '@/lib/utils/clustering'
import { useRovingFocus } from '@/lib/hooks/use-roving-focus'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'
import { BackgroundChart } from './background-chart'
import { allMetrics } from '@/data/ai-metrics'
import {
  createLinearYScale,
  type LinearScale,
} from '@/lib/utils/scales'
import {
  getMetricConfig,
  getMetricYValue,
  getVisibleTickValues,
  isDateInMetricRange,
} from '@/lib/utils/metric-scales'
import { useAnimatedDomain } from '@/lib/hooks/use-animated-domain'
import type { MetricType } from '@/types/metrics'

export interface ScatterPlotProps {
  data: ObituarySummary[]
  height?: number
  /** Active category filters - empty array shows all (no filtering) */
  activeCategories?: Category[]
  /** Fill parent container height (for grid layout). Parent must have explicit height. */
  fillContainer?: boolean
  /** Selected metric for background chart. Defaults to 'metr'. */
  selectedMetric?: MetricType
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 72 }

// Edge gradient overlay component
function EdgeGradients({
  showLeft,
  showRight,
  height,
}: {
  showLeft: boolean
  showRight: boolean
  height: number
}) {
  return (
    <>
      {showLeft && (
        <div
          className="pointer-events-none absolute left-0 top-0 z-10"
          style={{
            width: 60,
            height,
            background:
              'linear-gradient(to right, var(--bg-secondary, #1a1a1a), transparent)',
          }}
        />
      )}
      {showRight && (
        <div
          className="pointer-events-none absolute right-0 top-0 z-10"
          style={{
            width: 60,
            height,
            background:
              'linear-gradient(to left, var(--bg-secondary, #1a1a1a), transparent)',
          }}
        />
      )}
    </>
  )
}

/**
 * Format date as quarter (d3 has no native %q specifier)
 * Returns "Q1 2024" format
 */
export function formatQuarter(date: Date): string {
  const quarter = Math.ceil((date.getMonth() + 1) / 3)
  return `Q${quarter} ${date.getFullYear()}`
}

/**
 * Get tick count based on container width
 */
export function getTickCount(width: number): number {
  const baseCount = Math.floor(width / 120) // ~120px between ticks
  return Math.max(3, Math.min(12, baseCount))
}

// Exported for testing purposes
export function ScatterPlotInner({
  data,
  width,
  height,
  activeCategories = [],
  selectedMetric = 'metr',
}: {
  data: ObituarySummary[]
  width: number
  height: number
  activeCategories: Category[]
  selectedMetric?: MetricType
}) {
  // Timeline position persistence hook
  const {
    position: savedPosition,
    savePosition,
    wasRestored,
    isLoaded: positionLoaded,
  } = useTimelinePosition()

  // ViewState for tracking pan and zoom position
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })

  // Pan state refs
  const containerRef = useRef<SVGSVGElement>(null)
  const isPanningRef = useRef(false)
  const startXRef = useRef(0)
  const velocityRef = useRef(0)
  const lastMoveTimeRef = useRef(0)

  // State for cursor (triggers re-render for cursor change)
  const [isDragging, setIsDragging] = useState(false)

  // State for hovered cluster badge
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null)

  // Check reduced motion preference (null means preference unknown, treat as false)
  const prefersReducedMotion = useReducedMotion()
  const shouldReduceMotion = prefersReducedMotion ?? false

  // Tooltip state
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [containerBounds, setContainerBounds] = useState<DOMRect | null>(null)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Modal state
  const [selectedSummary, setSelectedSummary] = useState<ObituarySummary | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const clickedPointRef = useRef<HTMLElement | null>(null)
  const modalCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [clickOrigin, setClickOrigin] = useState<{ x: number; y: number } | null>(null)

  // Keyboard accessibility state (AC-6.2.6)
  const [announcement, setAnnouncement] = useState('')
  const timelineContainerRef = useRef<HTMLDivElement>(null)

  // Compute breakpoint ONCE at parent level to avoid N resize listeners (P0.1 fix)
  const breakpoint = useBreakpoint()
  const touchRadius = breakpoint === 'tablet' ? 22 : 7 // TABLET_TOUCH_RADIUS : POINT_RADIUS

  // Compute inner dimensions
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom)

  // Compute scales with useMemo and performance monitoring
  // X-axis ALWAYS starts at year 2000 - hardcoded to match visualization filter
  const xScale = useMemo(() => {
    markPerformance('scale-compute-start')

    // Always start at Jan 1, 2000 (matches VISUALIZATION_MIN_YEAR filter in home-client.tsx)
    const X_AXIS_START = new Date(2000, 0, 1)

    if (data.length === 0) {
      return scaleTime({
        domain: [X_AXIS_START, new Date()],
        range: [0, innerWidth],
      })
    }

    const dates = data.map((d) => new Date(d.date))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

    // Add 5% padding to the end only
    const timeRange = maxDate.getTime() - X_AXIS_START.getTime()
    const padding = timeRange * 0.05

    const scale = scaleTime({
      domain: [
        X_AXIS_START,
        new Date(maxDate.getTime() + padding),
      ],
      range: [0, innerWidth],
    })

    markPerformance('scale-compute-end')
    measurePerformance('scale-computation', 'scale-compute-start', 'scale-compute-end', 10)

    return scale
  }, [data, innerWidth])

  // Get metric configuration for selected metric
  const metricConfig = useMemo(
    () => getMetricConfig(selectedMetric),
    [selectedMetric]
  )

  // Animate Y-axis domain transitions (600ms to match line morph)
  const { domain: animatedDomain } = useAnimatedDomain({
    targetDomain: metricConfig.domain,
  })

  // Y-axis uses selected metric's domain (animated)
  const yScale = useMemo((): LinearScale => {
    return createLinearYScale(innerHeight, animatedDomain)
  }, [innerHeight, animatedDomain])

  // Compute visible tick values for Y-axis based on selected metric
  const visibleTickValues = useMemo(() => {
    return getVisibleTickValues(selectedMetric, animatedDomain)
  }, [selectedMetric, animatedDomain])


  // Memoize point positions for performance (AC-6.8.5)
  // Y position is based on selected metric's value at the obituary date + deterministic jitter
  const pointPositions = useMemo(() => {
    const [domainMin, domainMax] = metricConfig.domain
    const domainRange = domainMax - domainMin

    return data.map((obituary) => {
      const obituaryDate = new Date(obituary.date)

      // Get metric value at this date (null if date is before metric data starts)
      const baseValue = getMetricYValue(selectedMetric, obituaryDate)

      // Check if date is within metric's data range
      const isInRange = isDateInMetricRange(selectedMetric, obituaryDate)

      // Use domain minimum for dates before metric data starts
      const effectiveValue = baseValue ?? domainMin

      // Deterministic jitter: +/- 5% of domain range
      // hashToJitter returns 0-1, center to -0.5 to 0.5
      const jitterFactor = (hashToJitter(obituary._id) - 0.5) * 0.1
      const jitterAmount = domainRange * jitterFactor
      const jitteredValue = Math.max(domainMin, Math.min(domainMax, effectiveValue + jitterAmount))

      return {
        obituary,
        x: xScale(obituaryDate) ?? 0,
        y: yScale(jitteredValue) ?? 0,
        color: getCategoryColor(obituary.categories),
        // Flag for points outside metric's data range (for reduced opacity)
        isOutOfRange: !isInRange,
      }
    })
  }, [data, xScale, yScale, selectedMetric, metricConfig.domain])

  // Compute clusters based on current positions
  const clusters = useMemo(() => {
    if (!shouldShowClusters(1)) {
      return []
    }

    return computeClusters(pointPositions, DEFAULT_CLUSTER_CONFIG, 1)
  }, [pointPositions])

  // P0.3 fix: Precompute clustered IDs as Set for O(1) membership checks
  const clusteredIds = useMemo(
    () => new Set(clusters.flatMap(c => c.obituaryIds)),
    [clusters]
  )

  // Determine if a point should be filtered-in (visible at full opacity)
  // Empty activeCategories = show all; otherwise match any category (OR logic)
  const isPointFiltered = useCallback(
    (obituary: ObituarySummary): boolean => {
      if (activeCategories.length === 0) return true
      return obituary.categories?.some((cat) => activeCategories.includes(cat)) ?? false
    },
    [activeCategories]
  )

  // Sort data by date for consistent chronological navigation order (AC-6.2.2)
  const sortedData = useMemo(
    () => [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data]
  )

  // Filter visible data for keyboard navigation - skips filtered points (AC-6.2.9)
  // Also exclude clustered points from keyboard navigation
  const visibleData = useMemo(
    () =>
      sortedData.filter((ob) => {
        const matchesFilter = isPointFiltered(ob)
        // P0.3 fix: O(1) Set lookup instead of linear scan
        const isClustered = clusteredIds.has(ob._id) && shouldShowClusters(1)
        return matchesFilter && !isClustered
      }),
    [sortedData, isPointFiltered, clusteredIds]
  )

  // P0.2 fix: Precompute ID → index map to avoid O(n²) findIndex in render loop
  const visibleIndexById = useMemo(
    () => new Map(visibleData.map((o, i) => [o._id, i])),
    [visibleData]
  )

  // Viewport virtualization: Only render points within visible viewport (AC-6.8.5)
  // Calculate viewport bounds with buffer for smooth scrolling
  const VIEWPORT_BUFFER = 100 // px buffer on each side
  const visiblePointPositions = useMemo(() => {
    const viewportLeft = -viewState.translateX - VIEWPORT_BUFFER
    const viewportRight = -viewState.translateX + width + VIEWPORT_BUFFER

    return pointPositions.filter(({ x }) => {
      // Transform x position by current pan
      const transformedX = x + viewState.translateX
      return transformedX >= viewportLeft && transformedX <= viewportRight
    })
  }, [pointPositions, viewState.translateX, width])


  // Motion values for smooth pan animation
  const translateXMotion = useMotionValue(viewState.translateX)
  const springX = useSpring(translateXMotion, SPRINGS.pan)

  // Track whether position has been restored (to prevent re-restoration)
  const hasRestoredRef = useRef(false)

  // Restore position from sessionStorage on mount (after position is loaded)
  // This is a legitimate use of setState in useEffect - syncing React state with
  // sessionStorage (external system). Only runs once when position is loaded.
  useEffect(() => {
    if (positionLoaded && wasRestored && savedPosition && !hasRestoredRef.current) {
      hasRestoredRef.current = true
      // Restore position immediately (no animation for instant positioning)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with external storage
      setViewState((prev) => ({
        ...prev,
        translateX: savedPosition.scrollX,
      }))
      // Also update motion values for immediate visual update
      translateXMotion.set(savedPosition.scrollX)
    }
  }, [positionLoaded, wasRestored, savedPosition, translateXMotion])

  // Save position to sessionStorage on scroll change (debounced by hook)
  // Skip initial mount and position restoration to avoid saving default values
  const isInitialMount = useRef(true)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    // Skip if we're in the middle of restoring position
    if (!positionLoaded || (wasRestored && !hasRestoredRef.current)) {
      return
    }
    // Save current position (zoom is always 1 now)
    savePosition({ scrollX: viewState.translateX, zoom: 1 })
  }, [viewState.translateX, savePosition, positionLoaded, wasRestored])

  // Handler for cluster click - pan to center the cluster
  const handleClusterClick = useCallback(
    (cluster: PointCluster) => {
      const minDateX = xScale(cluster.minDate)
      const maxDateX = xScale(cluster.maxDate)
      const centerX = (minDateX + maxDateX) / 2

      // Pan to center the cluster in view
      setViewState((prev) => ({
        ...prev,
        translateX: innerWidth / 2 - centerX,
      }))
    },
    [xScale, innerWidth, setViewState]
  )

  // Handler for point mouse enter with 300ms debounce
  const handlePointMouseEnter = useCallback(
    (obituary: ObituarySummary, xPos: number, yPos: number) => {
      // Clear existing timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }

      // Set hoveredId immediately for dot visual state
      setHoveredId(obituary._id)

      // Debounce tooltip appearance by 300ms
      tooltipTimeoutRef.current = setTimeout(() => {
        // Get fresh bounds when showing tooltip
        if (containerRef.current) {
          setContainerBounds(containerRef.current.getBoundingClientRect())
        }
        setTooltipData({ obituary, x: xPos, y: yPos })
      }, 300)
    },
    []
  )

  // Handler for point mouse leave (immediate)
  const handlePointMouseLeave = useCallback(() => {
    // Clear timeout if tooltip hasn't appeared yet
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }

    // Clear states immediately
    setHoveredId(null)
    setTooltipData(null)
  }, [])

  // Handler for point click - captures element and viewport coordinates for animation
  const handlePointClick = useCallback(
    (obituary: ObituarySummary, element: HTMLElement) => {
      // Get element's center position for animation origin
      const rect = element.getBoundingClientRect()
      const originX = rect.left + rect.width / 2
      const originY = rect.top + rect.height / 2
      setClickOrigin({ x: originX, y: originY })

      setSelectedSummary(obituary)
      setIsModalOpen(true)
      clickedPointRef.current = element
    },
    []
  )

  // Handler for modal close (P2.4 fix: store timeout ref for cleanup)
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    // Clear any previous timeout
    if (modalCloseTimeoutRef.current) {
      clearTimeout(modalCloseTimeoutRef.current)
    }
    // Delay clearing selectedSummary to allow exit animation
    modalCloseTimeoutRef.current = setTimeout(() => {
      setSelectedSummary(null)
      modalCloseTimeoutRef.current = null
    }, 300)
  }, [])

  // Scroll to point helper - pans timeline to show focused point (AC-6.2.10)
  const scrollToPoint = useCallback(
    (index: number) => {
      const obituary = visibleData[index]
      if (!obituary) return

      const xPos = xScale(new Date(obituary.date))
      const currentXPos = xPos + viewState.translateX

      // Check if point is outside visible bounds (with some padding)
      const padding = 100
      if (currentXPos < padding || currentXPos > innerWidth - padding) {
        // Calculate new translateX to center the point
        const targetTranslateX = innerWidth / 2 - xPos
        const clampedX = Math.max(
          -(xScale(new Date(sortedData[sortedData.length - 1].date)) - innerWidth + 50),
          Math.min(50, targetTranslateX)
        )

        // Animate the pan
        animate(translateXMotion, clampedX, {
          type: 'spring',
          stiffness: SPRINGS.pan.stiffness,
          damping: SPRINGS.pan.damping,
          onComplete: () => {
            setViewState((prev) => ({ ...prev, translateX: clampedX }))
          },
        })
      }
    },
    [visibleData, xScale, viewState.translateX, innerWidth, sortedData, translateXMotion, setViewState]
  )

  // Roving focus hook for keyboard navigation
  const {
    focusedIndex,
    getTabIndex,
    handleKeyDown: rovingHandleKeyDown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Reserved for future use
    setFocusedIndex: _setFocusedIndex,
    getItemRef,
    resetFocus,
  } = useRovingFocus({
    itemCount: visibleData.length,
    onFocusChange: scrollToPoint,
    initialIndex: 0,
    wrap: true,
  })

  // Handle Enter/Space to open modal (AC-6.2.3)
  const handlePointKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number, obituary: ObituarySummary) => {
      // First handle roving focus navigation
      rovingHandleKeyDown(event, index)

      // Then handle activation keys (P0.1 fix: use event.currentTarget instead of unused pointRefs)
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handlePointClick(obituary, event.currentTarget as HTMLElement)
        setAnnouncement(`Opening details for ${obituary.source}`)
      }

      // Handle Escape to exit roving focus (AC-6.2.8)
      if (event.key === 'Escape') {
        event.preventDefault()
        // Reset focus and move focus to timeline container
        resetFocus()
        timelineContainerRef.current?.focus()
        setAnnouncement('Exited timeline navigation')
      }
    },
    [rovingHandleKeyDown, handlePointClick, resetFocus]
  )

  // Handle focus change announcements (AC-6.2.6)
  const handlePointFocus = useCallback(
    (index: number, obituary: ObituarySummary) => {
      const position = index + 1
      const total = visibleData.length
      const formattedDate = new Date(obituary.date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
      const claimPreview = obituary.claim.slice(0, 100) + (obituary.claim.length > 100 ? '...' : '')

      setAnnouncement(
        `${position} of ${total}. ${obituary.source}. ${formattedDate}. ${claimPreview}`
      )
    },
    [visibleData.length]
  )

  // Cleanup timeouts on unmount (P2.4 fix: also clean modal timeout)
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      if (modalCloseTimeoutRef.current) {
        clearTimeout(modalCloseTimeoutRef.current)
      }
    }
  }, [])

  // Calculate pan bounds
  const panBounds = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0 }
    const dates = data.map((d) => new Date(d.date).getTime())
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    const dataWidth = xScale(new Date(maxDate)) - xScale(new Date(minDate))
    const containerWidth = width - MARGIN.left - MARGIN.right
    const padding = 50

    // If data fits in container, no panning needed
    if (dataWidth <= containerWidth) {
      return { min: 0, max: 0 }
    }

    // Allow panning from right edge (negative translateX) to left edge
    return {
      min: -(dataWidth - containerWidth + padding),
      max: padding,
    }
  }, [data, xScale, width])

  // Clamp helper
  const clampTranslateX = useCallback(
    (value: number) => {
      return Math.max(panBounds.min, Math.min(panBounds.max, value))
    },
    [panBounds]
  )

  // Pan handlers
  const handlePanStart = useCallback((clientX: number) => {
    isPanningRef.current = true
    startXRef.current = clientX
    velocityRef.current = 0
    lastMoveTimeRef.current = Date.now()
    setIsDragging(true)
  }, [])

  const handlePanMove = useCallback(
    (clientX: number) => {
      if (!isPanningRef.current) return

      const now = Date.now()
      const dt = now - lastMoveTimeRef.current
      const dx = clientX - startXRef.current

      // Track velocity for momentum (normalize to ~60fps)
      if (dt > 0) {
        velocityRef.current = (dx / dt) * 16
      }

      startXRef.current = clientX
      lastMoveTimeRef.current = now

      // Update translateX with clamping
      const newTranslateX = clampTranslateX(translateXMotion.get() + dx)
      translateXMotion.set(newTranslateX)
      setViewState((prev) => ({ ...prev, translateX: newTranslateX }))
    },
    [clampTranslateX, translateXMotion]
  )

  const handlePanEnd = useCallback(() => {
    if (!isPanningRef.current) return
    isPanningRef.current = false
    setIsDragging(false)

    // When reduced motion preferred, stop immediately without momentum (AC-6.6.3)
    if (shouldReduceMotion) {
      const currentX = translateXMotion.get()
      setViewState((prev) => ({ ...prev, translateX: currentX }))
      return
    }

    // Apply momentum (velocity * 10 for noticeable effect)
    const momentumX = velocityRef.current * 10
    const targetX = clampTranslateX(translateXMotion.get() + momentumX)

    animate(translateXMotion, targetX, {
      type: 'spring',
      stiffness: SPRINGS.pan.stiffness,
      damping: SPRINGS.pan.damping,
      onComplete: () => {
        setViewState((prev) => ({ ...prev, translateX: targetX }))
      },
    })
  }, [clampTranslateX, translateXMotion, shouldReduceMotion])

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handlePanStart(e.clientX)
    },
    [handlePanStart]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handlePanMove(e.clientX)
    },
    [handlePanMove]
  )

  const handleMouseUp = useCallback(() => {
    handlePanEnd()
  }, [handlePanEnd])

  const handleMouseLeave = useCallback(() => {
    if (isPanningRef.current) handlePanEnd()
  }, [handlePanEnd])

  // Touch event handlers (single-touch pan only)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handlePanStart(e.touches[0].clientX)
      }
    },
    [handlePanStart]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        handlePanMove(e.touches[0].clientX)
      }
    },
    [handlePanMove]
  )

  const handleTouchEnd = useCallback(() => {
    handlePanEnd()
  }, [handlePanEnd])

  // Wheel handler - horizontal scroll or Shift+scroll for panning
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Check if this should be pan (Shift+scroll or horizontal scroll)
      const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      const isShiftScroll = e.shiftKey

      if (isShiftScroll || isHorizontalScroll) {
        // Pan behavior - use startTransition for performance (AC-6.8.5)
        const deltaX = e.shiftKey ? e.deltaY : e.deltaX
        if (Math.abs(deltaX) > 0) {
          e.preventDefault()
          const newTranslateX = clampTranslateX(translateXMotion.get() - deltaX)
          translateXMotion.set(newTranslateX)
          // Use startTransition to mark scroll updates as non-urgent
          startTransition(() => {
            setViewState((prev) => ({ ...prev, translateX: newTranslateX }))
          })
        }
      }
      // Vertical scroll without shift = no action (removed zoom)
    },
    [clampTranslateX, translateXMotion]
  )

  // Edge gradient visibility
  const showLeftGradient = viewState.translateX < panBounds.max
  const showRightGradient = viewState.translateX > panBounds.min

  // Empty state
  if (data.length === 0) {
    return (
      <svg width={width} height={height} data-testid="scatter-plot">
        <rect width={width} height={height} fill="var(--bg-secondary)" />
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fill="var(--text-muted)"
          className="text-sm"
        >
          No obituaries yet
        </text>
      </svg>
    )
  }

  return (
    <div
      ref={timelineContainerRef}
      className="relative"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      role="application"
      aria-label="Timeline visualization. Use arrow keys to navigate between obituaries."
      tabIndex={-1}
    >
      {/* Live region for screen reader announcements (AC-6.2.6) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="timeline-live-region"
      >
        {announcement}
      </div>

      {/* Navigation instructions (AC-6.2.7) */}
      <div className="sr-only" id="timeline-instructions">
        Press left and right arrow keys to navigate between obituaries.
        Press Enter or Space to view details.
        Press Home to go to first obituary, End to go to last.
        Press Escape to exit timeline navigation.
      </div>

      <EdgeGradients
        showLeft={showLeftGradient}
        showRight={showRightGradient}
        height={height}
      />
      <svg
        ref={containerRef}
        width={width}
        height={height}
        data-testid="scatter-plot"
        role="group"
        aria-label={`Timeline showing ${visibleData.length} obituaries`}
        aria-describedby="timeline-instructions"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      >
        {/* Background */}
        <rect width={width} height={height} fill="var(--bg-secondary)" />

        <Group left={MARGIN.left} top={MARGIN.top}>
          {/* Vertical grid lines at year intervals */}
          <GridColumns
            scale={xScale}
            height={innerHeight}
            stroke="var(--border)"
            strokeOpacity={0.3}
            strokeDasharray="2,2"
          />

          {/* Horizontal grid lines at FLOP tick values - renders behind data */}
          <g data-testid="y-grid">
            <GridRows
              scale={yScale}
              width={innerWidth}
              tickValues={visibleTickValues}
              stroke="var(--border)"
              strokeOpacity={0.3}
            />
          </g>

          {/* Background metric lines showing AI progress */}
          <BackgroundChart
            metrics={allMetrics}
            selectedMetric={selectedMetric}
            xScale={xScale}
            yScale={yScale}
            innerHeight={innerHeight}
          />

          {/* Y-axis (dynamic based on selected metric) */}
          <g data-testid="y-axis">
            <AxisLeft
              scale={yScale}
              tickValues={visibleTickValues}
              tickFormat={(value) => metricConfig.formatTick(value as number)}
              stroke="var(--border)"
              tickStroke="var(--border)"
              tickLabelProps={() => ({
                fill: 'var(--text-secondary)',
                fontSize: 11,
                fontFamily: 'var(--font-mono, monospace)',
                textAnchor: 'end' as const,
                dx: -8,
                dy: 4,
              })}
              label={metricConfig.label}
              labelOffset={42}
              labelProps={{
                fill: 'var(--text-muted)',
                fontSize: 11,
                fontFamily: 'var(--font-sans, sans-serif)',
                textAnchor: 'middle' as const,
              }}
            />
          </g>

          {/* X-axis (time) with dynamic tick granularity */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke="var(--border)"
            tickStroke="var(--border)"
            tickFormat={(date) => formatQuarter(date as Date)}
            tickLabelProps={() => ({
              fill: 'var(--text-secondary)',
              fontSize: 11,
              textAnchor: 'middle' as const,
              dy: '0.25em',
            })}
            numTicks={getTickCount(innerWidth)}
          />

          {/* Panning content group - apply translateX transform */}
          {/* will-change: transform hints to browser for GPU layer promotion (AC-1, AC-2) */}
          <motion.g
            data-testid="pan-group"
            style={{
              x: springX,
              willChange: 'transform',
            }}
          >
            {/* Data Points - role="list" for keyboard nav */}
            {/* Performance optimization (AC-6.8.5): Only render visible points with viewport virtualization */}
            {/* NOTE: Removed stagger animation - with 136+ points, stagger caused 7s+ total animation time */}
            <g
              role="list"
              aria-label="Obituary data points"
            >
              {visiblePointPositions.map(({ obituary, x: xPos, y: yPos, color, isOutOfRange }) => {
                // P0.3 fix: O(1) Set lookup instead of linear scan
                const isClustered =
                  clusteredIds.has(obituary._id) &&
                  shouldShowClusters(1)

                // Find index in visibleData for keyboard navigation (P0.2: O(1) Map lookup)
                const visibleIndex = visibleIndexById.get(obituary._id) ?? -1
                const isKeyboardNavigable = visibleIndex !== -1

                return (
                  <ScatterPoint
                    key={obituary._id}
                    ref={isKeyboardNavigable ? getItemRef(visibleIndex) : undefined}
                    obituary={obituary}
                    x={xPos}
                    y={yPos}
                    color={color}
                    isFiltered={isPointFiltered(obituary)}
                    isClustered={isClustered}
                    isHovered={hoveredId === obituary._id}
                    isSelected={isModalOpen && selectedSummary?._id === obituary._id}
                    isOutOfRange={isOutOfRange}
                    onMouseEnter={() => handlePointMouseEnter(obituary, xPos, yPos)}
                    onMouseLeave={handlePointMouseLeave}
                    onClick={(element) => handlePointClick(obituary, element)}
                    shouldReduceMotion={shouldReduceMotion}
                    touchRadius={touchRadius}
                    // Keyboard navigation props (AC-6.2.1 through AC-6.2.5)
                    tabIndex={isKeyboardNavigable ? getTabIndex(visibleIndex) : -1}
                    isFocused={isKeyboardNavigable && visibleIndex === focusedIndex}
                    onKeyDown={
                      isKeyboardNavigable
                        ? (e) => handlePointKeyDown(e, visibleIndex, obituary)
                        : undefined
                    }
                    onFocus={
                      isKeyboardNavigable
                        ? () => handlePointFocus(visibleIndex, obituary)
                        : undefined
                    }
                  />
                )
              })}
            </g>

            {/* Cluster badges - render AFTER individual dots for proper z-index layering */}
            <AnimatePresence>
              {clusters.map((cluster) => (
                <ClusterBadge
                  key={cluster.id}
                  cluster={cluster}
                  onClick={() => handleClusterClick(cluster)}
                  isHovered={hoveredClusterId === cluster.id}
                  onMouseEnter={() => setHoveredClusterId(cluster.id)}
                  onMouseLeave={() => setHoveredClusterId(null)}
                />
              ))}
            </AnimatePresence>
          </motion.g>
        </Group>
      </svg>

      {/* Tooltip - render outside SVG with portal-like positioning */}
      <AnimatePresence>
        {tooltipData && containerBounds && (
          <TooltipCard
            obituary={tooltipData.obituary}
            x={tooltipData.x + MARGIN.left}
            y={tooltipData.y + MARGIN.top}
            containerBounds={containerBounds}
            showFlop={selectedMetric === 'compute'}
          />
        )}
      </AnimatePresence>

      {/* Obituary Detail Panel - center dialog with origin animation */}
      <ObituaryModal
        selectedSummary={selectedSummary}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        triggerRef={clickedPointRef}
        clickOrigin={clickOrigin}
      />
    </div>
  )
}

export function ScatterPlot({
  data,
  height,
  activeCategories = [],
  fillContainer,
  selectedMetric,
}: ScatterPlotProps) {
  return (
    <div
      className={cn(
        "w-full",
        fillContainer ? "h-full" : "min-h-[300px] md:min-h-[400px]"
      )}
      data-testid="scatter-plot-container"
      style={fillContainer ? undefined : { height: height || 'auto' }}
    >
      <ParentSize>
        {({ width, height: parentHeight }) => (
          <ScatterPlotInner
            data={data}
            width={width}
            height={height || Math.max(parentHeight, 300)}
            activeCategories={activeCategories}
            selectedMetric={selectedMetric}
          />
        )}
      </ParentSize>
    </div>
  )
}

// Export clampTranslateX logic for testing
export function createClampTranslateX(panBounds: { min: number; max: number }) {
  return (value: number) =>
    Math.max(panBounds.min, Math.min(panBounds.max, value))
}

// Export edge gradient visibility logic for testing
export function calculateEdgeGradientVisibility(
  translateX: number,
  panBounds: { min: number; max: number }
) {
  return {
    showLeft: translateX < panBounds.max,
    showRight: translateX > panBounds.min,
  }
}

/**
 * Pure function for filter logic - exported for testing
 * Returns true if obituary should be filtered-in (visible), false if filtered-out (faded)
 * @param obituaryCategories - Categories from the obituary
 * @param activeCategories - Active filter categories (empty = show all)
 */
export function isObituaryFiltered(
  obituaryCategories: Category[],
  activeCategories: Category[]
): boolean {
  // Empty activeCategories = show all
  if (activeCategories.length === 0) return true
  // Match if any category matches (OR logic)
  return obituaryCategories.some((cat) => activeCategories.includes(cat))
}
