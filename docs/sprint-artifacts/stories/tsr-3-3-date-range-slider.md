# Story TSR-3-3: Implement DateRangeSlider Component

**Epic:** TSR-3 (Control Panel Implementation)
**Status:** ready-for-dev
**Priority:** High
**Estimation:** 2-3 hours

---

## User Story

**As a** visitor,
**I want** to adjust the visible time range,
**So that** I can focus on specific eras of AI development.

---

## Context

### Background

The timeline visualization spans AI development from 1950 to 2025. Users need to zoom into specific time periods to focus on eras of interest - e.g., the recent deep learning boom (2012-2025) or the entire history of AI claims.

This story implements a dual-handle range slider that allows users to set both the start and end year of the visible time range. The slider integrates with the URL state management from Story TSR-3-1, which provides debounced URL updates (400ms) to prevent URL spam during slider drag operations.

### Epic Dependencies

- **Story TSR-3-1 (URL State Hook):** Complete - provides `dateRange`, `setDateRange` with 400ms debounce
- **Story TSR-1-2 (ControlPanel Shell):** Complete - provides container with "Time Range" section placeholder
- **Story TSR-3-5 (Assemble ControlPanel):** Will integrate this component

### Technical Context

**Available State from useVisualizationState:**
```typescript
const { dateRange, setDateRange, isPending } = useVisualizationState()
// dateRange: [number, number] - [startYear, endYear]
// setDateRange: (range: [number, number]) => void - updates with 400ms debounce
// isPending: boolean - true during URL transition
```

**Date Range Constants (from use-visualization-state.ts):**
```typescript
const MIN_YEAR = 1950    // Earliest selectable year
const MAX_YEAR = 2025    // Latest selectable year
const DEFAULT_FROM = 2010  // Default start
const DEFAULT_TO = 2025    // Default end
```

**Current ControlPanel Placeholder:**
```tsx
<CollapsibleSection title="Time Range" defaultOpen>
  {/* TODO: DateRangeSlider - Story 3.3 */}
  <p className="text-sm text-muted-foreground">
    Filter obituaries by date range
  </p>
</CollapsibleSection>
```

### Key Design Decisions

1. **Radix Slider:** Use `@radix-ui/react-slider` for accessible dual-handle slider
2. **Debounced URL updates:** Visual updates immediate, URL updates after 400ms idle (handled by hook)
3. **Minimum gap:** 1 year minimum between handles
4. **Year display:** Show current range as "2010 - 2025" above slider
5. **Controlled component:** State managed externally via props

### Package Installation Required

The project does NOT currently have `@radix-ui/react-slider` installed. This must be added:

```bash
bun add @radix-ui/react-slider
```

---

## Acceptance Criteria

### AC-1: Component Renders Dual-Handle Slider

**Given** DateRangeSlider component is rendered
**When** it appears in the "Time Range" section
**Then** displays:
- Header showing current range: "2010 - 2025" (or current values)
- Horizontal slider track
- Two draggable handles (start year, end year)
- Min label "1950" on left
- Max label "2025" on right

### AC-2: Slider Reflects Current State

**Given** dateRange prop is `[2015, 2023]`
**When** component renders
**Then**:
- Left handle positioned at 2015
- Right handle positioned at 2023
- Header displays "2015 - 2023"
- Track between handles shows filled/active style

### AC-3: Dragging Updates Range

**Given** current range is `[2010, 2025]`
**When** user drags left handle to 2015
**Then** `onDateRangeChange` is called with `[2015, 2025]`

**Given** current range is `[2010, 2025]`
**When** user drags right handle to 2020
**Then** `onDateRangeChange` is called with `[2010, 2020]`

### AC-4: Minimum Gap Enforced

**Given** current range is `[2010, 2025]`
**When** user drags left handle toward right handle
**Then** handles cannot overlap - minimum 1 year gap maintained

**Given** right handle at 2020
**When** user drags left handle to 2020
**Then** left handle stops at 2019

### AC-5: Keyboard Accessibility

**Given** focus is on a slider handle
**When** user presses Arrow keys
**Then**:
- Left/Down: decreases value by 1 year
- Right/Up: increases value by 1 year
- Page Down: decreases by larger step (5 years)
- Page Up: increases by larger step (5 years)

**And** focus ring is visible on active handle

### AC-6: Screen Reader Support

**Given** screen reader is active
**When** navigating the slider
**Then**:
- Handles have accessible labels: "Start year" and "End year"
- Current values are announced
- Range boundaries (1950-2025) are communicated

---

## Technical Implementation

### Files to Create/Modify

```
src/components/controls/date-range-slider.tsx    # Main component
tests/unit/components/controls/date-range-slider.test.tsx  # Tests
```

### Dependencies to Install

```bash
bun add @radix-ui/react-slider
```

### Implementation Guide

**src/components/controls/date-range-slider.tsx:**

```tsx
'use client'

import * as Slider from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

// Date range constraints
const MIN_YEAR = 1950
const MAX_YEAR = 2025

export interface DateRangeSliderProps {
  /** Current date range [startYear, endYear] */
  value: [number, number]
  /** Callback when range changes (called during drag) */
  onValueChange: (range: [number, number]) => void
  /** Optional className for container */
  className?: string
}

/**
 * DateRangeSlider - Dual-handle slider for selecting a year range
 *
 * Allows users to select a start and end year for the visualization.
 * Values update immediately during drag for responsive UI, while
 * URL updates are debounced by the parent state hook.
 *
 * @example
 * ```tsx
 * const { dateRange, setDateRange } = useVisualizationState()
 *
 * <DateRangeSlider
 *   value={dateRange}
 *   onValueChange={setDateRange}
 * />
 * ```
 */
export function DateRangeSlider({
  value,
  onValueChange,
  className,
}: DateRangeSliderProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Current range display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {value[0]} - {value[1]}
        </span>
        <span className="text-xs text-muted-foreground">
          {value[1] - value[0]} years
        </span>
      </div>

      {/* Slider */}
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={value}
        onValueChange={(v) => onValueChange(v as [number, number])}
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
        minStepsBetweenThumbs={1}
      >
        <Slider.Track className="bg-muted relative grow rounded-full h-1.5">
          <Slider.Range className="absolute bg-primary rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className={cn(
            'block h-4 w-4 rounded-full bg-background border-2 border-primary',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'hover:bg-accent transition-colors',
            'cursor-grab active:cursor-grabbing'
          )}
          aria-label="Start year"
        />
        <Slider.Thumb
          className={cn(
            'block h-4 w-4 rounded-full bg-background border-2 border-primary',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'hover:bg-accent transition-colors',
            'cursor-grab active:cursor-grabbing'
          )}
          aria-label="End year"
        />
      </Slider.Root>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{MIN_YEAR}</span>
        <span>{MAX_YEAR}</span>
      </div>
    </div>
  )
}
```

### Test Coverage Requirements

**tests/unit/components/controls/date-range-slider.test.tsx:**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DateRangeSlider } from '@/components/controls/date-range-slider'

describe('DateRangeSlider', () => {
  const defaultProps = {
    value: [2010, 2025] as [number, number],
    onValueChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders current range display', () => {
      render(<DateRangeSlider {...defaultProps} />)

      expect(screen.getByText('2010 - 2025')).toBeInTheDocument()
    })

    it('renders year span', () => {
      render(<DateRangeSlider {...defaultProps} />)

      expect(screen.getByText('15 years')).toBeInTheDocument()
    })

    it('renders min and max labels', () => {
      render(<DateRangeSlider {...defaultProps} />)

      expect(screen.getByText('1950')).toBeInTheDocument()
      expect(screen.getByText('2025')).toBeInTheDocument()
    })

    it('renders two slider thumbs', () => {
      render(<DateRangeSlider {...defaultProps} />)

      const thumbs = screen.getAllByRole('slider')
      expect(thumbs).toHaveLength(2)
    })

    it('reflects custom value prop', () => {
      render(
        <DateRangeSlider
          {...defaultProps}
          value={[1980, 2000]}
        />
      )

      expect(screen.getByText('1980 - 2000')).toBeInTheDocument()
      expect(screen.getByText('20 years')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has accessible labels for slider thumbs', () => {
      render(<DateRangeSlider {...defaultProps} />)

      expect(
        screen.getByRole('slider', { name: /start year/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('slider', { name: /end year/i })
      ).toBeInTheDocument()
    })

    it('thumbs have correct aria values', () => {
      render(<DateRangeSlider {...defaultProps} value={[2015, 2023]} />)

      const startThumb = screen.getByRole('slider', { name: /start year/i })
      const endThumb = screen.getByRole('slider', { name: /end year/i })

      expect(startThumb).toHaveAttribute('aria-valuenow', '2015')
      expect(endThumb).toHaveAttribute('aria-valuenow', '2023')
    })

    it('thumbs have min/max aria attributes', () => {
      render(<DateRangeSlider {...defaultProps} />)

      const thumbs = screen.getAllByRole('slider')

      thumbs.forEach((thumb) => {
        expect(thumb).toHaveAttribute('aria-valuemin', '1950')
        expect(thumb).toHaveAttribute('aria-valuemax', '2025')
      })
    })
  })

  describe('edge cases', () => {
    it('handles minimum range (1 year)', () => {
      render(
        <DateRangeSlider
          {...defaultProps}
          value={[2024, 2025]}
        />
      )

      expect(screen.getByText('2024 - 2025')).toBeInTheDocument()
      expect(screen.getByText('1 years')).toBeInTheDocument()
    })

    it('handles full range', () => {
      render(
        <DateRangeSlider
          {...defaultProps}
          value={[1950, 2025]}
        />
      )

      expect(screen.getByText('1950 - 2025')).toBeInTheDocument()
      expect(screen.getByText('75 years')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <DateRangeSlider {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
```

---

## Tasks

### Task 1: Install Radix Slider Package
- [ ] Run `bun add @radix-ui/react-slider`
- [ ] Verify package installed in package.json

### Task 2: Create DateRangeSlider Component (AC: 1, 2, 3, 4)
- [ ] Create `src/components/controls/date-range-slider.tsx`
- [ ] Import Radix Slider primitives
- [ ] Implement dual-handle slider with value/onValueChange
- [ ] Add current range display header
- [ ] Add year span calculation display
- [ ] Configure min=1950, max=2025, step=1, minStepsBetweenThumbs=1

### Task 3: Style Component (AC: 1, 2)
- [ ] Style slider track with bg-muted
- [ ] Style active range with bg-primary
- [ ] Style thumbs with border and hover states
- [ ] Add focus ring for keyboard navigation
- [ ] Add grab cursor states
- [ ] Style min/max labels with muted text

### Task 4: Accessibility (AC: 5, 6)
- [ ] Add aria-label to each thumb ("Start year", "End year")
- [ ] Verify keyboard navigation (arrow keys, page up/down)
- [ ] Verify focus ring visibility
- [ ] Test with screen reader (aria-valuenow announced)

### Task 5: Create Test Suite (AC: 1-6)
- [ ] Create `tests/unit/components/controls/date-range-slider.test.tsx`
- [ ] Test rendering of range display
- [ ] Test both thumbs render
- [ ] Test aria labels and values
- [ ] Test custom className
- [ ] Test edge cases (min range, full range)

### Task 6: Integration with ControlPanel
- [ ] Import DateRangeSlider in control-panel.tsx
- [ ] Replace placeholder in "Time Range" section
- [ ] Wire up props from ControlPanelProps (dateRange, onDateRangeChange)
- [ ] Verify visual appearance in sidebar
- [ ] Test slider interaction updates display immediately

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] All tasks completed
- [ ] Package installed: `@radix-ui/react-slider` in package.json
- [ ] Tests pass: `bun vitest tests/unit/components/controls/date-range-slider.test.tsx`
- [ ] No TypeScript errors: `bun run lint`
- [ ] Component renders correctly in ControlPanel
- [ ] Keyboard navigation works (Arrow keys, Page Up/Down)
- [ ] Focus rings visible on thumbs
- [ ] URL updates after 400ms of slider inactivity (via hook)
- [ ] Ready for Story TSR-3-5 integration

---

## Dev Notes

### Radix Slider API

The `@radix-ui/react-slider` provides:
- Multiple thumbs via multiple `Slider.Thumb` children
- `minStepsBetweenThumbs` prevents overlap
- Built-in keyboard support (arrows, page up/down, home/end)
- ARIA attributes auto-applied

```tsx
<Slider.Root
  value={[start, end]}
  onValueChange={([start, end]) => ...}
  min={1950}
  max={2025}
  step={1}
  minStepsBetweenThumbs={1}
>
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.Thumb aria-label="Start year" />
  <Slider.Thumb aria-label="End year" />
</Slider.Root>
```

### Debouncing Strategy

The component itself does NOT debounce - it calls `onValueChange` on every drag frame for responsive UI. The debouncing is handled by `useVisualizationState`:

```typescript
// In use-visualization-state.ts
const setDateRange = useCallback((range) => {
  setLocalOverride(range)  // Immediate visual update
  debounceRef.current = setTimeout(() => {
    setDateParams({ from, to })  // Debounced URL update
  }, 400)
}, [])
```

### Integration Pattern

```tsx
// In ControlPanel or parent component
const { dateRange, setDateRange } = useVisualizationState()

<DateRangeSlider
  value={dateRange}
  onValueChange={setDateRange}
/>
```

### Similar to MetricsToggle Pattern

This component follows the same pattern as MetricsToggle:
- Controlled component (value + onValueChange)
- Optional className prop
- JSDoc with usage example
- Native elements/Radix for accessibility

### References

- [Source: docs/sprint-artifacts/epics-timeline-redesign.md#Story 3.3]
- [Source: src/lib/hooks/use-visualization-state.ts - dateRange state]
- [Radix Slider: https://www.radix-ui.com/primitives/docs/components/slider]

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

### Completion Notes List

### File List
