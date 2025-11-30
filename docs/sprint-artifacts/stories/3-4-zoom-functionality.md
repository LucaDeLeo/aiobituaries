# Story 3-4: Zoom Functionality

**Story Key:** 3-4-zoom-functionality
**Epic:** Epic 3 - Timeline Visualization
**Status:** drafted
**Priority:** High

---

## User Story

**As a** visitor,
**I want** to zoom in and out on the timeline,
**So that** I can see dense clusters or the full picture.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-3.4.1 | Smooth zoom with scroll wheel and pinch | Given timeline is displayed, when user zooms with scroll wheel or pinch gesture, then timeline scale changes smoothly with spring animation (~200ms) |
| AC-3.4.2 | Zoom centers on cursor position | Given user zooms, when zoom event fires, then zoom transformation centers on cursor/pinch position (not center of viewport) |
| AC-3.4.3 | Zoom scale limits enforced | Given user zooms, when zoom reaches limits, then scale is clamped to range 0.5x (min) to 5x (max) |
| AC-3.4.4 | Time axis granularity adapts to zoom | Given user zooms in, when zoom exceeds 1.5x, then time axis shows more granular markers (months, then weeks at 3x+) |
| AC-3.4.5 | Dots spread apart when zooming in | Given user zooms in past 1.5x, when dots are rendered, then they spread apart with less overlap |
| AC-3.4.6 | Zoom controls visible and functional | Given zoom controls are visible, when user clicks +/- buttons, then zoom increments/decrements by 20% steps |
| AC-3.4.7 | Zoom controls disabled at limits | Given zoom is at min or max, when user views controls, then corresponding +/- button is disabled |
| AC-3.4.8 | Reset button returns to 1x | Given zoom is not at 1x, when user clicks reset button, then zoom animates back to 1x scale |

---

## Technical Approach

### Implementation Overview

Extend the ScatterPlot component from Stories 3-1 through 3-3 with zoom functionality. The implementation uses wheel/pinch events for gesture-based zoom, a custom useZoom hook for state management, and Motion for smooth spring-based animations. Zoom transforms are applied to the SVG content group alongside existing pan transforms.

### Key Implementation Details

1. **Zoom State Management**
   - Extend existing `viewState` with `scale` property (already defined in ViewState interface)
   - Track zoom center point for proper transform origin
   - Create dedicated `useZoom` hook for reusable zoom logic

2. **Gesture Handling**
   - Wheel: Vertical scroll (no shift) zooms in/out
   - Touch: Pinch gesture (two-finger) for mobile/tablet zoom
   - Keyboard: +/- keys for accessibility (optional enhancement)

3. **Zoom Transform Math**
   - Calculate zoom point relative to SVG coordinate system
   - Apply scale transform centered on zoom point
   - Adjust translateX/Y to keep zoom point stationary
   - Formula: `newTranslate = zoomPoint - (zoomPoint - oldTranslate) * (newScale / oldScale)`

4. **Time Axis Adaptation**
   - Dynamic tick count based on zoom level
   - Format strings change with zoom:
     - < 0.7x: Years only ("2024")
     - 0.7 - 1.5x: Quarters ("Q1 2024")
     - 1.5 - 3.0x: Months ("Jan 2024")
     - > 3.0x: Weeks ("Jan 15")

5. **Zoom Controls UI**
   - Floating button group in bottom-right corner
   - Three buttons: zoom in (+), zoom out (-), reset
   - Backdrop blur for visibility over content
   - Disabled states when at limits

6. **Animation**
   - Spring physics: stiffness 300, damping 30 (from SPRINGS.zoom)
   - Smooth interpolation between scale values
   - Reduced motion: instant scale changes (no spring)

### Reference Implementation

```tsx
// src/lib/hooks/use-zoom.ts
'use client'

import { useState, useCallback, useRef } from 'react'
import type { ViewState } from '@/types/visualization'

export interface UseZoomOptions {
  minScale?: number     // Default: 0.5
  maxScale?: number     // Default: 5
  initialScale?: number // Default: 1
  zoomStep?: number     // Default: 1.2 (20% increments)
}

export interface UseZoomReturn {
  scale: number
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setScale: (scale: number, centerX?: number, centerY?: number) => void
  handleWheel: (event: WheelEvent, containerRect: DOMRect) => void
  handlePinch: (scale: number, centerX: number, centerY: number) => void
  isMinZoom: boolean
  isMaxZoom: boolean
}

export function useZoom(
  viewState: ViewState,
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>,
  options: UseZoomOptions = {}
): UseZoomReturn {
  const {
    minScale = 0.5,
    maxScale = 5,
    zoomStep = 1.2,
  } = options

  const clampScale = useCallback((scale: number) => {
    return Math.max(minScale, Math.min(maxScale, scale))
  }, [minScale, maxScale])

  const zoomIn = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      scale: clampScale(prev.scale * zoomStep),
    }))
  }, [clampScale, zoomStep, setViewState])

  const zoomOut = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      scale: clampScale(prev.scale / zoomStep),
    }))
  }, [clampScale, zoomStep, setViewState])

  const resetZoom = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      scale: 1,
      translateX: 0,
      translateY: 0,
    }))
  }, [setViewState])

  const setScale = useCallback((
    newScale: number,
    centerX?: number,
    centerY?: number
  ) => {
    const clamped = clampScale(newScale)
    setViewState(prev => {
      if (centerX !== undefined && centerY !== undefined) {
        // Adjust translate to keep zoom point stationary
        const scaleDelta = clamped / prev.scale
        const newTranslateX = centerX - (centerX - prev.translateX) * scaleDelta
        const newTranslateY = centerY - (centerY - prev.translateY) * scaleDelta
        return {
          ...prev,
          scale: clamped,
          translateX: newTranslateX,
          translateY: newTranslateY,
        }
      }
      return { ...prev, scale: clamped }
    })
  }, [clampScale, setViewState])

  const handleWheel = useCallback((
    event: WheelEvent,
    containerRect: DOMRect
  ) => {
    // Skip if shift is held (reserved for horizontal pan from Story 3-3)
    if (event.shiftKey) return
    // Skip horizontal scroll (trackpad pan)
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return

    event.preventDefault()
    const delta = event.deltaY > 0 ? 1 / zoomStep : zoomStep
    const centerX = event.clientX - containerRect.left
    const centerY = event.clientY - containerRect.top

    setViewState(prev => {
      const newScale = clampScale(prev.scale * delta)
      const scaleDelta = newScale / prev.scale
      const newTranslateX = centerX - (centerX - prev.translateX) * scaleDelta
      const newTranslateY = centerY - (centerY - prev.translateY) * scaleDelta
      return {
        ...prev,
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      }
    })
  }, [clampScale, zoomStep, setViewState])

  const handlePinch = useCallback((
    pinchScale: number,
    centerX: number,
    centerY: number
  ) => {
    setScale(viewState.scale * pinchScale, centerX, centerY)
  }, [viewState.scale, setScale])

  return {
    scale: viewState.scale,
    zoomIn,
    zoomOut,
    resetZoom,
    setScale,
    handleWheel,
    handlePinch,
    isMinZoom: viewState.scale <= minScale,
    isMaxZoom: viewState.scale >= maxScale,
  }
}
```

```tsx
// src/components/visualization/zoom-controls.tsx
'use client'

import { motion } from 'motion/react'
import { Plus, Minus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ZoomControlsProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  isMinZoom: boolean
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
        size="icon"
        onClick={onZoomOut}
        disabled={isMinZoom}
        className="h-8 w-8 text-[--text-secondary] hover:text-[--text-primary] disabled:opacity-30"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <span className="min-w-[3rem] text-center text-xs text-[--text-secondary]">
        {Math.round(scale * 100)}%
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        disabled={isMaxZoom}
        className="h-8 w-8 text-[--text-secondary] hover:text-[--text-primary] disabled:opacity-30"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-4 w-px bg-[--border]" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        disabled={isDefaultZoom}
        className="h-8 w-8 text-[--text-secondary] hover:text-[--text-primary] disabled:opacity-30"
        aria-label="Reset zoom"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
```

```tsx
// Updates to axis-time.tsx for dynamic tick granularity
function getTickFormat(zoomScale: number): string {
  if (zoomScale > 3) return '%b %d'      // "Jan 15" (weeks)
  if (zoomScale > 1.5) return '%b %Y'    // "Jan 2024" (months)
  if (zoomScale > 0.7) return 'Q%q %Y'   // "Q1 2024" (quarters) - custom
  return '%Y'                            // "2024" (years)
}

function getTickCount(zoomScale: number, width: number): number {
  const baseCount = Math.floor(width / 120) // ~120px between ticks
  return Math.max(3, Math.min(12, Math.floor(baseCount * zoomScale)))
}
```

```tsx
// Updates to scatter-plot.tsx for zoom integration
// Import useZoom hook
import { useZoom } from '@/lib/hooks/use-zoom'

// Inside ScatterPlotInner:
const {
  scale,
  zoomIn,
  zoomOut,
  resetZoom,
  handleWheel: handleZoomWheel,
  isMinZoom,
  isMaxZoom,
} = useZoom(viewState, setViewState)

// Update wheel handler to call zoom (non-shift, vertical scroll)
const handleWheel = useCallback((e: React.WheelEvent) => {
  const rect = containerRef.current?.getBoundingClientRect()
  if (!rect) return

  // Horizontal scroll or Shift+scroll = pan (from Story 3-3)
  if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    // Existing pan logic...
    return
  }

  // Vertical scroll without shift = zoom
  handleZoomWheel(e.nativeEvent, rect)
}, [handleZoomWheel, /* pan deps */])

// Apply scale to transform
<motion.g
  style={{
    x: springX,
    scale: viewState.scale,
    transformOrigin: `${MARGIN.left}px ${MARGIN.top}px`,
  }}
>
  {/* Content */}
</motion.g>
```

---

## Tasks

### Task 1: Create useZoom Hook (30 min)
- [ ] Create `src/lib/hooks/use-zoom.ts`
- [ ] Define `UseZoomOptions` interface (minScale, maxScale, zoomStep)
- [ ] Define `UseZoomReturn` interface
- [ ] Implement `clampScale` helper function
- [ ] Implement `zoomIn()` - multiply scale by zoomStep (1.2)
- [ ] Implement `zoomOut()` - divide scale by zoomStep
- [ ] Implement `resetZoom()` - set scale to 1, reset translates
- [ ] Implement `setScale(scale, centerX?, centerY?)` with center-point math
- [ ] Implement `handleWheel(event, containerRect)` for scroll zoom
- [ ] Implement `handlePinch(scale, centerX, centerY)` for touch zoom
- [ ] Export `isMinZoom` and `isMaxZoom` boolean flags
- [ ] Add unit tests for clampScale, zoomIn, zoomOut logic

### Task 2: Create ZoomControls Component (25 min)
- [ ] Create `src/components/visualization/zoom-controls.tsx`
- [ ] Add props: scale, onZoomIn, onZoomOut, onReset, isMinZoom, isMaxZoom
- [ ] Render container div with backdrop blur styling
- [ ] Add zoom out button (-) with Minus icon from lucide-react
- [ ] Add zoom percentage display (e.g., "100%")
- [ ] Add zoom in button (+) with Plus icon
- [ ] Add reset button with RotateCcw icon
- [ ] Apply disabled state to buttons at limits
- [ ] Add `data-testid="zoom-controls"` for E2E testing
- [ ] Add aria-labels for accessibility
- [ ] Add entrance animation (fade in, slide up)

### Task 3: Integrate Zoom with ScatterPlot (30 min)
- [ ] Open `src/components/visualization/scatter-plot.tsx`
- [ ] Import `useZoom` hook
- [ ] Call useZoom with viewState and setViewState
- [ ] Get containerRef bounding rect in wheel handler
- [ ] Update handleWheel to distinguish pan (Shift/horizontal) from zoom (vertical)
- [ ] Call handleZoomWheel for vertical scroll without Shift
- [ ] Apply scale to motion.g transform (alongside translateX from pan)
- [ ] Set appropriate transformOrigin for zoom centering
- [ ] Render ZoomControls component in bottom-right corner
- [ ] Pass zoom callbacks and state to ZoomControls

### Task 4: Implement Pinch Zoom for Touch (25 min)
- [ ] Add pinch gesture detection (two-finger touch)
- [ ] Track initial pinch distance on touchstart with 2 touches
- [ ] Calculate scale delta on touchmove with 2 touches
- [ ] Calculate pinch center point between two touches
- [ ] Call handlePinch with scale delta and center
- [ ] Reset pinch state on touchend
- [ ] Ensure single-touch pan (Story 3-3) still works
- [ ] Add `touch-action: none` if not already present

### Task 5: Update Time Axis for Zoom Granularity (20 min)
- [ ] Open `src/components/visualization/axis-time.tsx`
- [ ] Add `zoomScale` prop to AxisTime component
- [ ] Implement `getTickFormat(zoomScale)` function:
  - `> 3.0`: '%b %d' (weeks)
  - `1.5 - 3.0`: '%b %Y' (months)
  - `0.7 - 1.5`: Quarter format or '%Y' with more ticks
  - `< 0.7`: '%Y' (years only)
- [ ] Implement `getTickCount(zoomScale, width)` for dynamic tick density
- [ ] Pass zoomScale to tick formatter in AxisBottom
- [ ] Verify axis updates when zoom changes

### Task 6: Add Motion Animation for Zoom (15 min)
- [ ] Create scaleMotion value with useMotionValue
- [ ] Create springScale with useSpring (stiffness: 300, damping: 30)
- [ ] Sync scaleMotion with viewState.scale
- [ ] Apply springScale to motion.g transform
- [ ] Add reduced motion check - use instant transitions if preferred
- [ ] Import and use shouldReduceMotion or useReducedMotion

### Task 7: Write Unit Tests (25 min)
- [ ] Create `tests/unit/lib/hooks/use-zoom.test.ts`
- [ ] Test: clampScale respects min/max bounds
- [ ] Test: zoomIn multiplies scale by zoomStep
- [ ] Test: zoomOut divides scale by zoomStep
- [ ] Test: resetZoom sets scale to 1 and resets translates
- [ ] Test: isMinZoom true when scale <= minScale
- [ ] Test: isMaxZoom true when scale >= maxScale
- [ ] Test: handleWheel calculates correct new scale
- [ ] Test: center-point zoom math adjusts translate correctly

### Task 8: Write Component Tests (20 min)
- [ ] Create `tests/unit/components/visualization/zoom-controls.test.tsx`
- [ ] Test: renders three buttons (+, -, reset)
- [ ] Test: displays zoom percentage
- [ ] Test: zoom in button disabled when isMaxZoom
- [ ] Test: zoom out button disabled when isMinZoom
- [ ] Test: reset button disabled when scale is 1
- [ ] Test: clicking buttons calls appropriate callbacks

### Task 9: Manual Testing (20 min)
- [ ] Navigate to homepage with timeline
- [ ] Test scroll wheel zoom in (vertical scroll up)
- [ ] Test scroll wheel zoom out (vertical scroll down)
- [ ] Verify zoom centers on cursor position
- [ ] Verify Shift+scroll still pans horizontally
- [ ] Test pinch zoom on mobile/tablet (or DevTools emulation)
- [ ] Verify pinch centers on pinch midpoint
- [ ] Click + button, verify zoom increases ~20%
- [ ] Click - button, verify zoom decreases ~20%
- [ ] Click reset button, verify returns to 100%
- [ ] Verify + disabled at 500% (5x)
- [ ] Verify - disabled at 50% (0.5x)
- [ ] Verify time axis shows weeks at high zoom
- [ ] Verify time axis shows years at low zoom
- [ ] Verify dots spread apart when zoomed in
- [ ] Verify zoom animation is smooth (60fps)
- [ ] Enable reduced motion, verify instant zoom

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Story 3-1 (Scatter Plot Foundation) | Required | ScatterPlot container, ViewState, scales |
| Story 3-2 (Timeline Data Points) | Required | ScatterPoint rendering, dot positions |
| Story 3-3 (Horizontal Scroll/Pan) | Required | Pan state, wheel handler structure, spring animation |
| motion | Package | useMotionValue, useSpring for smooth animation |
| lucide-react | Package | Plus, Minus, RotateCcw icons for zoom controls |
| @visx/axis | Package | AxisBottom with dynamic tick formatting |

---

## Definition of Done

- [ ] Scroll wheel zoom in/out works smoothly
- [ ] Zoom centers on cursor position
- [ ] Pinch zoom works on touch devices
- [ ] Zoom is limited to 0.5x - 5x range
- [ ] Zoom controls (+/-/reset) are visible and functional
- [ ] Zoom controls disabled at limits
- [ ] Reset button returns to 1x with animation
- [ ] Time axis shows more granular ticks when zoomed in
- [ ] Dots spread apart when zoomed in > 1.5x
- [ ] Zoom animation runs at 60fps
- [ ] Reduced motion is respected
- [ ] Unit tests pass for useZoom hook
- [ ] Component tests pass for ZoomControls
- [ ] No TypeScript errors
- [ ] Lint passes (`pnpm lint`)

---

## Test Scenarios

### Unit Test Scenarios

1. **Scale Clamping**
   - clampScale(0.3) returns 0.5 (min)
   - clampScale(6) returns 5 (max)
   - clampScale(2) returns 2 (within range)

2. **Zoom In/Out**
   - zoomIn from 1 results in 1.2
   - zoomOut from 1 results in 0.833...
   - zoomIn at max (5) stays at 5
   - zoomOut at min (0.5) stays at 0.5

3. **Center-Point Zoom Math**
   - Zoom in at (100, 100) adjusts translateX/Y to keep point stationary
   - Test with scale 1 -> 2, verify translate adjustment

4. **Limit Flags**
   - isMinZoom true when scale = 0.5
   - isMaxZoom true when scale = 5
   - Both false when scale = 1

### Component Test Scenarios

1. **ZoomControls Rendering**
   - Three buttons present with correct icons
   - Percentage display shows current scale
   - aria-labels present for accessibility

2. **Button States**
   - + disabled when isMaxZoom
   - - disabled when isMinZoom
   - Reset disabled when scale = 1

3. **Button Clicks**
   - + calls onZoomIn
   - - calls onZoomOut
   - Reset calls onReset

### Manual Testing Checklist

- [ ] Scroll wheel: scroll up zooms in
- [ ] Scroll wheel: scroll down zooms out
- [ ] Zoom centers on cursor position
- [ ] Shift+scroll: still pans horizontally (not zoom)
- [ ] Pinch: two-finger pinch zooms on touch
- [ ] Pinch: centers on pinch midpoint
- [ ] Zoom controls: + increases zoom by ~20%
- [ ] Zoom controls: - decreases zoom by ~20%
- [ ] Zoom controls: reset returns to 100%
- [ ] + disabled at 500% zoom
- [ ] - disabled at 50% zoom
- [ ] Reset disabled at 100%
- [ ] Time axis: years only at 50% zoom
- [ ] Time axis: months visible at 200% zoom
- [ ] Time axis: weeks visible at 400% zoom
- [ ] Dots spread apart at high zoom
- [ ] Animation is smooth (60fps)
- [ ] Reduced motion: instant zoom changes

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/hooks/use-zoom.ts` | Create | Zoom state management hook |
| `src/components/visualization/zoom-controls.tsx` | Create | Zoom UI controls component |
| `src/components/visualization/scatter-plot.tsx` | Modify | Integrate zoom with wheel handler and transform |
| `src/components/visualization/axis-time.tsx` | Modify | Add dynamic tick granularity based on zoom |
| `tests/unit/lib/hooks/use-zoom.test.ts` | Create | Unit tests for useZoom hook |
| `tests/unit/components/visualization/zoom-controls.test.tsx` | Create | Component tests for ZoomControls |

---

## FR Coverage

This story satisfies the following Functional Requirements:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR9 | Users can zoom in/out on timeline to adjust time scale granularity | Wheel zoom, pinch zoom, and zoom controls implemented with center-point behavior, scale limits, and dynamic axis granularity |

---

## Learnings from Previous Stories

From Story 3-1 (Scatter Plot Foundation):
1. **ViewState Interface** - Already includes `scale`, `translateX`, `translateY`
2. **motion.g Wrapper** - Transform container ready for scale transform
3. **Scale Calculations** - xScale/yScale with useMemo pattern
4. **MARGIN Constants** - Use for transformOrigin calculation

From Story 3-2 (Timeline Data Points):
1. **Motion Integration** - motion/react already imported
2. **Spring Physics** - SPRINGS constants available (stiffness/damping)
3. **Category Colors** - Already applied per category

From Story 3-3 (Horizontal Scroll/Pan):
1. **Wheel Handler Pattern** - handleWheel already exists, extend for zoom
2. **Shift Key Detection** - Shift+scroll reserved for pan, vertical for zoom
3. **Touch Handling** - Single-touch pan exists, add two-touch pinch
4. **Motion Values** - useMotionValue/useSpring pattern established
5. **isDragging State** - Use similar pattern for isPinching if needed

From Architecture/Tech Spec:
1. **SPRINGS.zoom** - { stiffness: 300, damping: 30 } for zoom animation
2. **Tick Granularity Table** - Defined in spec (year/quarter/month/week)
3. **Scale Range** - 0.5x to 5x defined in spec
4. **shouldReduceMotion** - Available in animation.ts

---

## Dev Agent Record

### Context Reference
`docs/sprint-artifacts/story-contexts/3-4-zoom-functionality-context.xml`

### Implementation Notes
_(To be filled during implementation)_

### Files Created
_(To be filled during implementation)_

### Files Modified
_(To be filled during implementation)_

### Deviations from Plan
_(To be filled during implementation)_

### Issues Encountered
_(To be filled during implementation)_

### Key Decisions
_(To be filled during implementation)_

### Test Results
_(To be filled during implementation)_

### Completion Timestamp
_(To be filled during implementation)_

---

_Story created: 2025-11-30_
_Epic: Timeline Visualization (Epic 3)_
_Sequence: 4 of 8 in Epic 3_
