# Story 3-1: Scatter Plot Foundation

**Story Key:** 3-1-scatter-plot-foundation
**Epic:** Epic 3 - Timeline Visualization
**Status:** drafted
**Priority:** High

---

## User Story

**As a** visitor,
**I want** to see obituaries plotted on a timeline,
**So that** I can visualize the pattern of AI skepticism over time.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-3.1.1 | Scatter plot displays when data loaded | Given obituary data is loaded, when the homepage renders, then a scatter plot visualization is displayed |
| AC-3.1.2 | Container takes full width | Scatter plot container takes full width of parent container |
| AC-3.1.3 | Minimum height enforced | Desktop: minimum 400px height; Mobile: minimum 300px height |
| AC-3.1.4 | Dark background applied | Background uses `--bg-secondary` (#14141A) color |
| AC-3.1.5 | Grid lines at year intervals | Subtle vertical grid lines appear at year boundaries |
| AC-3.1.6 | X-axis represents time | Horizontal axis shows dates with appropriate tick marks |
| AC-3.1.7 | Y-axis uses spread mode | Vertical axis distributes points using jitter algorithm for visual clarity |
| AC-3.1.8 | Empty state handled | When no obituaries exist, shows "No obituaries yet" message |
| AC-3.1.9 | Responsive width | Uses ParentSize or ResizeObserver for responsive width handling |
| AC-3.1.10 | Scales computed with useMemo | Time and linear scales memoized to avoid recalculation |

---

## Technical Approach

### Implementation Overview

Create the foundational scatter plot visualization component using Visx. This story establishes the SVG container, time-based X-axis scale, jitter-based Y-axis distribution, and responsive sizing. The component serves as the base for all subsequent timeline stories.

### Key Implementation Details

1. **Component Architecture**
   - Create `src/components/visualization/scatter-plot.tsx` as Client Component ('use client')
   - Use `@visx/responsive` ParentSize wrapper for responsive sizing
   - Accept `ObituarySummary[]` data as prop from server component

2. **Scale Setup**
   - X-axis: `scaleTime` from `@visx/scale` mapping date domain to pixel range
   - Y-axis: `scaleLinear` from `@visx/scale` mapping 0-1 jitter values to pixel height
   - Compute domain from min/max dates in data

3. **SVG Container**
   - Full-width responsive container
   - Minimum height enforced via CSS (400px desktop, 300px mobile)
   - Background: `--bg-secondary` (#14141A)
   - Padding/margins for axis labels

4. **Grid Lines**
   - Vertical grid lines at year intervals
   - Subtle color: `--border` (#2A2A35) at 30% opacity
   - Use Visx GridColumns or custom line rendering

5. **Axis Rendering**
   - X-axis at bottom using `@visx/axis` AxisBottom
   - Year-based tick formatting for default zoom level
   - Axis styled with Deep Archive theme colors

6. **Empty State**
   - Check if data array is empty
   - Render centered "No obituaries yet" message
   - Style with muted text color

### Reference Implementation

```tsx
// src/components/visualization/scatter-plot.tsx
'use client'

import { useMemo } from 'react'
import { ParentSize } from '@visx/responsive'
import { scaleTime, scaleLinear } from '@visx/scale'
import { AxisBottom } from '@visx/axis'
import { GridColumns } from '@visx/grid'
import { Group } from '@visx/group'
import type { ObituarySummary } from '@/types/obituary'

export interface ScatterPlotProps {
  data: ObituarySummary[]
  height?: number
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 20 }
const MIN_HEIGHT_DESKTOP = 400
const MIN_HEIGHT_MOBILE = 300

function ScatterPlotInner({
  data,
  width,
  height,
}: {
  data: ObituarySummary[]
  width: number
  height: number
}) {
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
    const dates = data.map(d => new Date(d.date))
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
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
    <svg
      width={width}
      height={height}
      data-testid="scatter-plot"
      role="img"
      aria-label={`Interactive timeline of ${data.length} AI obituaries`}
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

        {/* X-axis (time) */}
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="var(--border)"
          tickStroke="var(--border)"
          tickLabelProps={() => ({
            fill: 'var(--text-secondary)',
            fontSize: 11,
            textAnchor: 'middle',
            dy: '0.25em',
          })}
          numTicks={Math.min(innerWidth / 100, 10)}
        />

        {/* Data points will be rendered in Story 3.2 */}
      </Group>
    </svg>
  )
}

export function ScatterPlot({ data, height }: ScatterPlotProps) {
  return (
    <div
      className="w-full min-h-[300px] md:min-h-[400px]"
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
```

### Type Definitions

```typescript
// src/types/visualization.ts
import type { ObituarySummary, Category } from './obituary'

/**
 * Y-axis mode for contextual scatter plot.
 * - spread: Default jitter-based distribution for visual clarity
 * - market: Y = NVDA stock price (future)
 * - capability: Y = benchmark score (future)
 * - agi: Y = milestone timeline (future)
 */
export type YAxisMode = 'spread' | 'market' | 'capability' | 'agi'

/**
 * Zoom and pan state for visualization.
 */
export interface ViewState {
  /** Zoom scale factor (0.5 to 5) */
  scale: number
  /** Pan offset X (pixels) */
  translateX: number
  /** Pan offset Y (pixels) */
  translateY: number
}

/**
 * Props for main ScatterPlot component.
 */
export interface ScatterPlotProps {
  /** Obituary data to visualize */
  data: ObituarySummary[]
  /** Y-axis mode (default: 'spread') */
  mode?: YAxisMode
  /** Active category filters (empty = all) */
  activeCategories?: Category[]
  /** Callback when obituary is selected */
  onSelect?: (obituary: ObituarySummary) => void
  /** Height (default: 400) */
  height?: number
}
```

### Integration with Homepage

```tsx
// src/app/page.tsx (modification)
import { getObituaries } from '@/lib/sanity/queries'
import { ScatterPlot } from '@/components/visualization/scatter-plot'

export default async function HomePage() {
  const obituaries = await getObituaries()

  return (
    <main>
      {/* Count display from Story 2.1 */}

      {/* Timeline Visualization */}
      <section className="container mx-auto px-4 py-8">
        <ScatterPlot data={obituaries} />
      </section>

      {/* List display from Story 2.2 */}
    </main>
  )
}
```

---

## Tasks

### Task 1: Create Type Definitions (10 min)
- [ ] Create `src/types/visualization.ts`
- [ ] Define `YAxisMode` type union
- [ ] Define `ViewState` interface for zoom/pan state
- [ ] Define `ScatterPlotProps` interface
- [ ] Export all types

### Task 2: Install Visx Dependencies (5 min)
- [ ] Verify `@visx/scale` is installed
- [ ] Verify `@visx/axis` is installed
- [ ] Verify `@visx/grid` is installed
- [ ] Verify `@visx/group` is installed
- [ ] Verify `@visx/responsive` is installed
- [ ] If any missing, run: `pnpm add @visx/scale @visx/axis @visx/grid @visx/group @visx/responsive`

### Task 3: Create ScatterPlot Component (45 min)
- [ ] Create `src/components/visualization/scatter-plot.tsx`
- [ ] Add 'use client' directive
- [ ] Import Visx dependencies (scale, axis, grid, group, responsive)
- [ ] Define MARGIN constants and MIN_HEIGHT values
- [ ] Create `ScatterPlotInner` component for inner rendering
- [ ] Compute xScale with `scaleTime` using useMemo
- [ ] Compute yScale with `scaleLinear` using useMemo
- [ ] Calculate date domain from data (min/max with padding)
- [ ] Render SVG container with background color
- [ ] Add `data-testid="scatter-plot"` attribute
- [ ] Add `role="img"` and `aria-label` for accessibility
- [ ] Render GridColumns for year intervals
- [ ] Render AxisBottom for time axis
- [ ] Style axis with Deep Archive theme colors
- [ ] Create outer `ScatterPlot` wrapper with ParentSize
- [ ] Apply min-height classes (300px mobile, 400px desktop)

### Task 4: Implement Empty State (15 min)
- [ ] Check if data array is empty
- [ ] Render centered "No obituaries yet" text
- [ ] Use muted text color (`--text-muted`)
- [ ] Maintain SVG container with background

### Task 5: Integrate with Homepage (15 min)
- [ ] Open `src/app/page.tsx`
- [ ] Import `ScatterPlot` component
- [ ] Add section for timeline visualization
- [ ] Pass `obituaries` data to ScatterPlot
- [ ] Position between count display and list display

### Task 6: Write Unit Tests (30 min)
- [ ] Create `tests/unit/components/visualization/scatter-plot.test.tsx`
- [ ] Test: Renders SVG element with data-testid
- [ ] Test: Shows empty state when no data
- [ ] Test: Has correct background color
- [ ] Test: Has aria-label with obituary count
- [ ] Test: Renders AxisBottom component
- [ ] Test: Renders GridColumns component
- [ ] Test: Handles responsive width changes
- [ ] Test: Computes correct date domain from data

### Task 7: Manual Testing (15 min)
- [ ] Navigate to homepage
- [ ] Verify scatter plot container is visible
- [ ] Verify dark background color (--bg-secondary)
- [ ] Verify X-axis shows date ticks
- [ ] Verify grid lines visible at year intervals
- [ ] Verify container is responsive (resize browser)
- [ ] Verify minimum height maintained on mobile viewport
- [ ] Test with empty data (modify query temporarily)
- [ ] Verify "No obituaries yet" message displays

### Task 8: Bundle Size Verification (10 min)
- [ ] Run `pnpm build`
- [ ] Check visualization chunk size in build output
- [ ] Verify Visx imports are tree-shaken
- [ ] Document bundle size in Dev Agent Record

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Epic 1 Complete | Required | Foundation, Sanity integration, design system |
| Story 2-1 (Count Display) | Required | Homepage structure exists |
| @visx/scale | Package | Time and linear scales |
| @visx/axis | Package | AxisBottom component |
| @visx/grid | Package | GridColumns component |
| @visx/group | Package | Group component for positioning |
| @visx/responsive | Package | ParentSize wrapper |

---

## Definition of Done

- [ ] `ScatterPlot` component exists at `src/components/visualization/scatter-plot.tsx`
- [ ] `visualization.ts` types exist at `src/types/visualization.ts`
- [ ] Component integrated into homepage
- [ ] Container takes full width of parent
- [ ] Minimum height enforced (400px desktop, 300px mobile)
- [ ] Background uses `--bg-secondary` color
- [ ] X-axis shows time with date ticks
- [ ] Grid lines visible at year intervals
- [ ] Empty state shows "No obituaries yet"
- [ ] Component is responsive (uses ParentSize)
- [ ] Scales computed with useMemo for performance
- [ ] data-testid="scatter-plot" attribute present
- [ ] ARIA label describes visualization
- [ ] Unit tests pass
- [ ] No TypeScript errors
- [ ] Lint passes (`pnpm lint`)
- [ ] Bundle size verified (Visx tree-shaken)

---

## Test Scenarios

### Unit Test Scenarios

1. **Renders SVG Element**
   - Render ScatterPlot with data
   - Expect SVG element with data-testid="scatter-plot"

2. **Empty State Displays Message**
   - Render ScatterPlot with empty array
   - Expect "No obituaries yet" text visible

3. **Background Color Applied**
   - Render ScatterPlot with data
   - Expect rect element with fill="var(--bg-secondary)"

4. **ARIA Label Includes Count**
   - Render ScatterPlot with 5 obituaries
   - Expect aria-label contains "5 AI obituaries"

5. **X-Axis Renders**
   - Render ScatterPlot with data
   - Expect AxisBottom rendered with time scale

6. **Grid Lines Render**
   - Render ScatterPlot with data
   - Expect GridColumns rendered

7. **Date Domain Computed Correctly**
   - Render with dates spanning 2022-2024
   - Expect scale domain includes date range with padding

8. **Responsive Width Works**
   - Render in container of different widths
   - Expect SVG width matches container

### Manual Testing Checklist

- [ ] Navigate to homepage with obituary data
- [ ] Scatter plot container visible below count display
- [ ] Dark background matches header/page bg
- [ ] X-axis shows years (e.g., 2022, 2023, 2024)
- [ ] Subtle dashed grid lines at year boundaries
- [ ] Resize browser window - chart resizes
- [ ] Mobile viewport - chart has ~300px height
- [ ] Desktop viewport - chart has ~400px height
- [ ] Clear empty data, verify "No obituaries yet"
- [ ] Inspect element - data-testid present

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/types/visualization.ts` | Create | Visualization type definitions |
| `src/components/visualization/scatter-plot.tsx` | Create | Main scatter plot component |
| `src/app/page.tsx` | Modify | Integrate ScatterPlot into homepage |
| `tests/unit/components/visualization/scatter-plot.test.tsx` | Create | Component unit tests |

---

## FR Coverage

This story satisfies the following Functional Requirements:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR7 | System displays obituaries on an interactive chronological timeline | ScatterPlot provides the foundation container with time-based X-axis. Data points added in Story 3.2 |

---

## Learnings from Previous Story

From Story 2-8 (Share/Copy Link) and Epic 2 patterns:

1. **Client Component Pattern** - Use 'use client' directive at top of file for interactive components
2. **Deep Archive Colors** - Use CSS variable references like `var(--bg-secondary)` for theme consistency
3. **Responsive Design** - Use Tailwind responsive classes (md:min-h-[400px]) for breakpoint styling
4. **data-testid Pattern** - Add data-testid attributes for E2E test selectors
5. **useMemo for Performance** - Memoize expensive computations (scales) to prevent re-renders
6. **Component Location** - Place visualization components in `src/components/visualization/`
7. **Type Exports** - Define types in dedicated files under `src/types/` for reuse

---

## Dev Agent Record

_This section is populated during implementation_

### Context Reference
`docs/sprint-artifacts/story-contexts/3-1-scatter-plot-foundation-context.xml`

### Implementation Notes
_To be filled during implementation_

### Files Created
_To be filled during implementation_

### Files Modified
_To be filled during implementation_

### Deviations from Plan
_To be filled during implementation_

### Issues Encountered
_To be filled during implementation_

### Key Decisions
_To be filled during implementation_

### Test Results
_To be filled during implementation_

### Bundle Size Analysis
_To be filled during implementation (Visx packages + total)_

### Completion Timestamp
_To be filled during implementation_

---

_Story created: 2025-11-30_
_Epic: Timeline Visualization (Epic 3)_
_Sequence: 1 of 8 in Epic 3_
