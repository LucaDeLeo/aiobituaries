'use client'

import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { motion, useMotionValue, useSpring, animate } from 'motion/react'
import { ParentSize } from '@visx/responsive'
import { scaleTime, scaleLinear } from '@visx/scale'
import { AxisBottom } from '@visx/axis'
import { GridColumns } from '@visx/grid'
import { Group } from '@visx/group'
import { timeFormat } from 'd3-time-format'
import type { ObituarySummary } from '@/types/obituary'
import type { ViewState } from '@/types/visualization'
import { ScatterPoint } from './scatter-point'
import { ZoomControls } from './zoom-controls'
import { hashToJitter, getCategoryColor } from '@/lib/utils/scatter-helpers'
import { useZoom } from '@/lib/hooks/use-zoom'
import { SPRINGS } from '@/lib/utils/animation'

export interface ScatterPlotProps {
  data: ObituarySummary[]
  height?: number
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 20 }

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
 * Get tick formatter based on zoom level
 * - <0.7x: Years only ("%Y")
 * - 0.7-1.5x: Quarters ("Q1 2024")
 * - 1.5-3.0x: Months ("%b %Y")
 * - >3.0x: Weeks ("%b %d")
 */
export function getTickFormatter(zoomScale: number): (date: Date) => string {
  if (zoomScale > 3) return timeFormat('%b %d') // "Jan 15" (weeks)
  if (zoomScale > 1.5) return timeFormat('%b %Y') // "Jan 2024" (months)
  if (zoomScale > 0.7) return formatQuarter // "Q1 2024" (quarters - custom)
  return timeFormat('%Y') // "2024" (years only)
}

/**
 * Get tick count based on zoom level and container width
 */
export function getTickCount(zoomScale: number, width: number): number {
  const baseCount = Math.floor(width / 120) // ~120px between ticks
  return Math.max(3, Math.min(12, Math.floor(baseCount * zoomScale)))
}

/** Minimal touch interface for our needs */
interface TouchPoint {
  clientX: number
  clientY: number
}

/**
 * Get distance between two touch points
 */
function getTouchDistance(touch1: TouchPoint, touch2: TouchPoint): number {
  const dx = touch2.clientX - touch1.clientX
  const dy = touch2.clientY - touch1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Get center point between two touches relative to container
 */
function getTouchCenter(
  touch1: TouchPoint,
  touch2: TouchPoint,
  rect: DOMRect
): { x: number; y: number } {
  return {
    x: (touch1.clientX + touch2.clientX) / 2 - rect.left,
    y: (touch1.clientY + touch2.clientY) / 2 - rect.top,
  }
}

// Exported for testing purposes
export function ScatterPlotInner({
  data,
  width,
  height,
}: {
  data: ObituarySummary[]
  width: number
  height: number
}) {
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

  // Pinch zoom state refs
  const initialPinchDistanceRef = useRef<number | null>(null)
  const pinchCenterRef = useRef<{ x: number; y: number } | null>(null)
  const lastPinchScaleRef = useRef(1)

  // State for cursor (triggers re-render for cursor change)
  const [isDragging, setIsDragging] = useState(false)

  // Compute inner dimensions
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom)

  // Compute scales with useMemo
  const xScale = useMemo(() => {
    if (data.length === 0) {
      return scaleTime({
        domain: [new Date('2020-01-01'), new Date()],
        range: [0, innerWidth],
      })
    }
    const dates = data.map((d) => new Date(d.date))
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    // Add padding to domain
    const padding = (maxDate.getTime() - minDate.getTime()) * 0.05
    return scaleTime({
      domain: [
        new Date(minDate.getTime() - padding),
        new Date(maxDate.getTime() + padding),
      ],
      range: [0, innerWidth],
    })
  }, [data, innerWidth])

  const yScale = useMemo(() => {
    return scaleLinear({
      domain: [0, 1],
      range: [innerHeight, 0],
    })
  }, [innerHeight])

  // Motion values for smooth pan animation
  const translateXMotion = useMotionValue(viewState.translateX)
  const springX = useSpring(translateXMotion, SPRINGS.pan)

  // Motion values for smooth zoom animation
  const scaleMotion = useMotionValue(viewState.scale)
  const springScale = useSpring(scaleMotion, SPRINGS.zoom)

  // Sync scale motion value with viewState
  useEffect(() => {
    scaleMotion.set(viewState.scale)
  }, [viewState.scale, scaleMotion])

  // Use zoom hook
  const {
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel: handleZoomWheel,
    handlePinch,
    isMinZoom,
    isMaxZoom,
  } = useZoom(viewState, setViewState)

  // Calculate pan bounds (adjusted for zoom)
  const panBounds = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0 }
    const dates = data.map((d) => new Date(d.date).getTime())
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    const dataWidth = xScale(new Date(maxDate)) - xScale(new Date(minDate))
    const containerWidth = width - MARGIN.left - MARGIN.right
    const padding = 50

    // Scale data width by zoom level
    const scaledDataWidth = dataWidth * viewState.scale

    // If data fits in container (even when scaled), no panning needed
    if (scaledDataWidth <= containerWidth) {
      return { min: 0, max: 0 }
    }

    // Allow panning from right edge (negative translateX) to left edge
    return {
      min: -(scaledDataWidth - containerWidth + padding),
      max: padding,
    }
  }, [data, xScale, width, viewState.scale])

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
  }, [clampTranslateX, translateXMotion])

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

  // Touch event handlers (single-touch pan, two-touch pinch zoom)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Two-finger: pinch zoom
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        initialPinchDistanceRef.current = getTouchDistance(
          e.touches[0],
          e.touches[1]
        )
        pinchCenterRef.current = getTouchCenter(
          e.touches[0],
          e.touches[1],
          rect
        )
        lastPinchScaleRef.current = viewState.scale

        // Cancel any ongoing pan
        if (isPanningRef.current) {
          isPanningRef.current = false
          setIsDragging(false)
        }
      } else if (e.touches.length === 1) {
        // Single-finger: pan
        handlePanStart(e.touches[0].clientX)
      }
    },
    [handlePanStart, viewState.scale]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        e.touches.length === 2 &&
        initialPinchDistanceRef.current !== null &&
        pinchCenterRef.current !== null
      ) {
        // Two-finger: pinch zoom
        e.preventDefault()
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1])
        const pinchScale = currentDistance / initialPinchDistanceRef.current

        handlePinch(pinchScale, pinchCenterRef.current.x, pinchCenterRef.current.y)
        lastPinchScaleRef.current = viewState.scale * pinchScale
      } else if (e.touches.length === 1) {
        // Single-finger: pan
        handlePanMove(e.touches[0].clientX)
      }
    },
    [handlePanMove, handlePinch, viewState.scale]
  )

  const handleTouchEnd = useCallback(() => {
    // Reset pinch state
    initialPinchDistanceRef.current = null
    pinchCenterRef.current = null
    lastPinchScaleRef.current = viewState.scale

    // End pan
    handlePanEnd()
  }, [handlePanEnd, viewState.scale])

  // Wheel handler - distinguish between pan (Shift/horizontal) and zoom (vertical)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      // Check if this should be pan (Shift+scroll or horizontal scroll)
      const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      const isShiftScroll = e.shiftKey

      if (isShiftScroll || isHorizontalScroll) {
        // Pan behavior (from Story 3-3)
        const deltaX = e.shiftKey ? e.deltaY : e.deltaX
        if (Math.abs(deltaX) > 0) {
          e.preventDefault()
          const newTranslateX = clampTranslateX(translateXMotion.get() - deltaX)
          translateXMotion.set(newTranslateX)
          setViewState((prev) => ({ ...prev, translateX: newTranslateX }))
        }
        return
      }

      // Vertical scroll without shift = zoom
      handleZoomWheel(e.nativeEvent, rect)
    },
    [clampTranslateX, translateXMotion, handleZoomWheel]
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
      className="relative"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
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
        role="img"
        aria-label={`Interactive timeline of ${data.length} AI obituaries`}
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
          {/* Grid lines at year intervals */}
          <GridColumns
            scale={xScale}
            height={innerHeight}
            stroke="var(--border)"
            strokeOpacity={0.3}
            strokeDasharray="2,2"
          />

          {/* X-axis (time) with dynamic tick granularity */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke="var(--border)"
            tickStroke="var(--border)"
            tickFormat={(date) =>
              getTickFormatter(viewState.scale)(date as Date)
            }
            tickLabelProps={() => ({
              fill: 'var(--text-secondary)',
              fontSize: 11,
              textAnchor: 'middle' as const,
              dy: '0.25em',
            })}
            numTicks={getTickCount(viewState.scale, innerWidth)}
          />

          {/* Panning and zooming content group - apply both translateX and scale transforms */}
          <motion.g
            style={{
              x: springX,
              scale: springScale,
              transformOrigin: `${MARGIN.left}px ${MARGIN.top}px`,
            }}
          >
            {/* Data Points with staggered animation */}
            <motion.g
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.05, // 50ms between dots
                    delayChildren: 0.1, // 100ms initial delay
                  },
                },
              }}
            >
              {data.map((obituary) => {
                const xPos = xScale(new Date(obituary.date))
                const yPos = yScale(hashToJitter(obituary._id))
                const color = getCategoryColor(obituary.categories)

                return (
                  <ScatterPoint
                    key={obituary._id}
                    obituary={obituary}
                    x={xPos}
                    y={yPos}
                    color={color}
                  />
                )
              })}
            </motion.g>
          </motion.g>
        </Group>
      </svg>

      {/* Zoom Controls */}
      <ZoomControls
        scale={viewState.scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetZoom}
        isMinZoom={isMinZoom}
        isMaxZoom={isMaxZoom}
      />
    </div>
  )
}

export function ScatterPlot({ data, height }: ScatterPlotProps) {
  return (
    <div
      className="w-full min-h-[300px] md:min-h-[400px]"
      data-testid="scatter-plot-container"
      style={{ height: height || 'auto' }}
    >
      <ParentSize>
        {({ width, height: parentHeight }) => (
          <ScatterPlotInner
            data={data}
            width={width}
            height={height || Math.max(parentHeight, 300)}
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
