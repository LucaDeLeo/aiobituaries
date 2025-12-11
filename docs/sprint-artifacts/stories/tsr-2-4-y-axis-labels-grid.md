# Story TSR-2.4: Y-Axis Labels and Grid Lines

**Story Key:** tsr-2-4-y-axis-labels-grid
**Epic:** TSR-2 - Y-Axis Log Scale (Timeline Visualization Redesign)
**Status:** ready-for-dev
**Priority:** High (Final story in Epic TSR-2)

---

## User Story

**As a** visitor,
**I want** labeled Y-axis ticks with horizontal grid lines showing AI compute scale,
**So that** I can read the actual FLOP values and understand the magnitude of AI progress.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-2.4.1 | Y-axis displays tick labels | Given ScatterPlot renders, when Y-axis is drawn, then tick labels appear at LOG_TICK_VALUES positions within the current domain |
| AC-2.4.2 | Labels use superscript notation | Given tick label for 10^24, when rendered, then displays as "10^24" using Unicode superscript characters via `formatFlopTick()` |
| AC-2.4.3 | Labels positioned correctly | Given Y-axis labels, when rendered, then they are right-aligned within the 72px left margin with proper spacing from axis line |
| AC-2.4.4 | Horizontal grid lines at ticks | Given LOG_TICK_VALUES within domain, when grid is rendered, then horizontal lines extend across full chart width at each tick position |
| AC-2.4.5 | Grid lines styled consistently | Given grid lines, when rendered, then styled with `--border` color, 30% opacity, matching existing X-axis grid |
| AC-2.4.6 | Only visible ticks rendered | Given Y-axis domain [min, max], when ticks are computed, then only LOG_TICK_VALUES within domain range are rendered |
| AC-2.4.7 | Axis integrates with existing interactions | Given pan/zoom interactions, when Y-axis is displayed, then axis labels and grid remain static (don't pan with content). **Verification:** AxisLeft and GridRows must be rendered OUTSIDE the `<motion.g>` pan/zoom group in DOM structure - testable by checking that axis/grid elements are NOT descendants of the motion.g transform group |

---

## Technical Approach

### Implementation Overview

Add Y-axis labels and horizontal grid lines to the ScatterPlot using visx `AxisLeft` and `GridRows` components. This completes Epic TSR-2 by making the logarithmic FLOP scale readable with labeled ticks and visual grid references.

### Current State Analysis

**From Story TSR-2.3, ScatterPlot now has:**
- Log-scale yScale via `createLogYScale()` from `@/lib/utils/scales`
- MARGIN.left = 72px (space reserved for Y-axis labels)
- yScale typed as `LogScale` from scales.ts
- Domain from `getUnifiedDomain(enabledMetrics, dateRange[0], dateRange[1])`

**Available utilities from Story TSR-2.1 (`src/lib/utils/scales.ts`):**
```typescript
// Standard tick values for FLOP Y-axis (10^17 to 10^27)
export const LOG_TICK_VALUES = [1e17, 1e18, 1e19, 1e20, 1e21, 1e22, 1e23, 1e24, 1e25, 1e26, 1e27]

// Format FLOP value as tick label with superscript notation
export function formatFlopTick(value: number): string  // Returns "10^24" with superscript

// Filter LOG_TICK_VALUES to only those within a domain
export function getVisibleTickValues(domain: [number, number]): number[]
```

**Current ScatterPlot structure (`scatter-plot.tsx:875-909`):**
```tsx
<Group left={MARGIN.left} top={MARGIN.top}>
  {/* Grid lines at year intervals (vertical) */}
  <GridColumns
    scale={xScale}
    height={innerHeight}
    stroke="var(--border)"
    strokeOpacity={0.3}
    strokeDasharray="2,2"
  />

  {/* Background metric lines */}
  <BackgroundChart ... />

  {/* X-axis (time) */}
  <AxisBottom top={innerHeight} scale={xScale} ... />

  {/* Panning/zooming content group */}
  <motion.g style={{ x: springX, scale: springScale, ... }}>
    {/* Points, clusters, etc. */}
  </motion.g>
</Group>
```

### Target State

Add AxisLeft and GridRows before the panning content group (so they stay fixed).
All elements include `data-testid` attributes for reliable unit testing:

```tsx
import { AxisLeft, AxisBottom } from '@visx/axis'
import { GridColumns, GridRows } from '@visx/grid'
import { LOG_TICK_VALUES, formatFlopTick, getVisibleTickValues } from '@/lib/utils/scales'

// Inside ScatterPlotInner render, after BackgroundChart:

// Compute visible tick values for current domain
const visibleTickValues = useMemo(() => {
  const domain = yScale.domain() as [number, number]
  return getVisibleTickValues(domain)
}, [yScale])

// In JSX:
<Group left={MARGIN.left} top={MARGIN.top}>
  {/* Vertical grid lines at year intervals */}
  <GridColumns scale={xScale} height={innerHeight} ... />

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

  {/* Background metric lines */}
  <BackgroundChart ... />

  {/* Y-axis (FLOP) */}
  <g data-testid="y-axis">
    <AxisLeft
      scale={yScale}
      tickValues={visibleTickValues}
      tickFormat={(value) => formatFlopTick(value as number)}
      stroke="var(--border)"
      tickStroke="var(--border)"
      tickLabelProps={() => ({
        fill: 'var(--text-secondary)',
        fontSize: 11,
        fontFamily: 'var(--font-mono, monospace)',
        textAnchor: 'end',
        dx: -8,
        dy: 4,
      })}
    />
  </g>

  {/* X-axis (time) */}
  <AxisBottom top={innerHeight} scale={xScale} ... />

  {/* Panning/zooming content group - axis/grid stay outside for static positioning */}
  <motion.g data-testid="pan-zoom-group" ...>
```

### Key Implementation Details

1. **Tick Value Filtering**
   - Use `getVisibleTickValues(domain)` to filter LOG_TICK_VALUES
   - Only render ticks within current yScale domain
   - Domain changes with `enabledMetrics` and `dateRange` props

2. **Label Formatting**
   - `formatFlopTick(1e24)` returns "10^24" with Unicode superscript
   - Monospace font for alignment (`var(--font-mono)`)
   - Right-aligned (`textAnchor: 'end'`)

3. **Label Positioning**
   - `dx: -8` offsets labels 8px left of axis line
   - `dy: 4` vertically centers with tick mark
   - AxisLeft renders at x=0 within the Group (at MARGIN.left from SVG edge)

4. **Grid Line Styling**
   - Match existing GridColumns: `--border` color, 30% opacity
   - No dash array (solid lines for Y, dashed for X)
   - Extend full `innerWidth`
   - **Rendering order:** GridRows placed before BackgroundChart/points in JSX
     - SVG uses painter's algorithm (later elements render on top)
     - Grid lines render behind data, acting as subtle visual references

5. **Static Positioning**
   - AxisLeft and GridRows rendered OUTSIDE the motion.g pan/zoom group
   - They remain fixed while points pan/zoom
   - DOM structure: axis/grid are siblings of motion.g, not children
   - Testable via `data-testid` attributes and DOM containment checks

---

## Tasks

### Task 1: Add Imports (5 min)
**AC Coverage:** AC-2.4.1, AC-2.4.4

- [ ] Add `AxisLeft` to existing `@visx/axis` import
- [ ] Add `GridRows` to existing `@visx/grid` import
- [ ] Add `LOG_TICK_VALUES`, `formatFlopTick`, `getVisibleTickValues` to scales import

```typescript
// Update existing imports
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridColumns, GridRows } from '@visx/grid'
import {
  createLogYScale,
  type LogScale,
  LOG_TICK_VALUES,
  formatFlopTick,
  getVisibleTickValues
} from '@/lib/utils/scales'
```

### Task 2: Compute Visible Tick Values (10 min)
**AC Coverage:** AC-2.4.6

- [ ] Add `useMemo` to compute visible tick values from yScale domain
- [ ] Extract domain from yScale using `.domain()` method
- [ ] Call `getVisibleTickValues(domain)` to filter

```typescript
// After yScale useMemo, add:
const visibleTickValues = useMemo(() => {
  const domain = yScale.domain() as [number, number]
  return getVisibleTickValues(domain)
}, [yScale])
```

### Task 3: Add GridRows Component (15 min)
**AC Coverage:** AC-2.4.4, AC-2.4.5

- [ ] Add `<GridRows>` after existing `<GridColumns>`
- [ ] Wrap in `<g data-testid="y-grid">` for testability
- [ ] Configure `scale={yScale}`, `width={innerWidth}`
- [ ] Set `tickValues={visibleTickValues}`
- [ ] Style: `stroke="var(--border)"`, `strokeOpacity={0.3}`
- [ ] Verify grid lines extend full width

**Z-Index/Rendering Order:** GridRows is placed BEFORE BackgroundChart and points in JSX, which means it renders behind them (painter's algorithm). This ensures grid lines appear as subtle background references without obscuring data.

```tsx
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
```

### Task 4: Add AxisLeft Component (20 min)
**AC Coverage:** AC-2.4.1, AC-2.4.2, AC-2.4.3

- [ ] Add `<AxisLeft>` after BackgroundChart (before AxisBottom)
- [ ] Wrap in `<g data-testid="y-axis">` for testability
- [ ] Configure `scale={yScale}` and `tickValues={visibleTickValues}`
- [ ] Set `tickFormat={(value) => formatFlopTick(value as number)}`
- [ ] Style axis and tick strokes with `var(--border)`
- [ ] Configure tickLabelProps for proper positioning

```tsx
{/* Y-axis (FLOP scale) */}
<g data-testid="y-axis">
  <AxisLeft
    scale={yScale}
    tickValues={visibleTickValues}
    tickFormat={(value) => formatFlopTick(value as number)}
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
  />
</g>
```

### Task 5: Verify Static Positioning (10 min)
**AC Coverage:** AC-2.4.7

- [ ] Add `data-testid="pan-zoom-group"` to the `<motion.g>` element
- [ ] Confirm GridRows wrapper (`data-testid="y-grid"`) is OUTSIDE pan/zoom group
- [ ] Confirm AxisLeft wrapper (`data-testid="y-axis"`) is OUTSIDE pan/zoom group
- [ ] DOM structure verification: axis/grid groups should be siblings of motion.g, not children
- [ ] Test: pan/zoom the chart, axis labels should stay fixed
- [ ] Test: points should move while grid/axis remain static

### Task 6: Style Refinement (15 min)
**AC Coverage:** AC-2.4.3, AC-2.4.5

- [ ] Adjust `dx` offset if labels overlap axis line
- [ ] Adjust `dy` offset for vertical centering
- [ ] Verify font-family fallback works
- [ ] Verify color variables resolve correctly in dark mode
- [ ] Check superscript characters render properly across browsers

### Task 7: Write Unit Tests (25 min)
**AC Coverage:** All

Create/update `tests/unit/components/visualization/scatter-plot.test.ts`:

- [ ] Test AxisLeft renders with correct tickValues
- [ ] Test formatFlopTick is called for each visible tick
- [ ] Test GridRows renders horizontal lines
- [ ] Test only ticks within domain are rendered
- [ ] Test axis styling props
- [ ] Test axis elements are NOT inside motion.g pan/zoom group

**NOTE:** visx does not guarantee stable class names like `.visx-axis-left`. Use these strategies instead:
1. Add `data-testid` attributes to wrapper `<g>` elements for axis and grid
2. Query by SVG element structure (e.g., `g > line`, `g > text`)
3. For superscript text, use exact Unicode pattern from `formatFlopTick()`

```typescript
describe('Y-Axis Labels and Grid', () => {
  it('renders AxisLeft with visible tick values', () => {
    const { container } = render(<ScatterPlot data={testData} />)
    // Query by data-testid on wrapper group (added in implementation)
    const axisLeft = container.querySelector('[data-testid="y-axis"]')
    expect(axisLeft).toBeInTheDocument()
    // Verify tick text elements exist within axis group
    const tickLabels = axisLeft?.querySelectorAll('text')
    expect(tickLabels?.length).toBeGreaterThan(0)
  })

  it('formats tick labels with superscript notation', () => {
    const { container } = render(<ScatterPlot data={testData} />)
    // Use exact Unicode superscript pattern (e.g., "10" + superscript "24")
    // formatFlopTick(1e24) returns "10\u00b2\u2074"
    const axisGroup = container.querySelector('[data-testid="y-axis"]')
    const labels = axisGroup?.querySelectorAll('text')
    // At least one label should contain "10" followed by superscript chars
    const hasSupercriptLabel = Array.from(labels || []).some(
      label => /^10[\u2070\u00b9\u00b2\u00b3\u2074-\u2079]+$/.test(label.textContent || '')
    )
    expect(hasSupercriptLabel).toBe(true)
  })

  it('renders horizontal grid rows', () => {
    const { container } = render(<ScatterPlot data={testData} />)
    // Query by data-testid on wrapper group
    const gridRows = container.querySelector('[data-testid="y-grid"]')
    expect(gridRows).toBeInTheDocument()
    // Verify line elements exist within grid group
    const lines = gridRows?.querySelectorAll('line')
    expect(lines?.length).toBeGreaterThan(0)
  })

  it('axis and grid are outside pan/zoom motion group', () => {
    const { container } = render(<ScatterPlot data={testData} />)
    // motion.g has data-testid="pan-zoom-group" (added in implementation)
    const panZoomGroup = container.querySelector('[data-testid="pan-zoom-group"]')
    const yAxis = container.querySelector('[data-testid="y-axis"]')
    const yGrid = container.querySelector('[data-testid="y-grid"]')

    // Verify axis/grid are NOT descendants of pan/zoom group
    expect(panZoomGroup?.contains(yAxis)).toBe(false)
    expect(panZoomGroup?.contains(yGrid)).toBe(false)
  })
})
```

**Implementation Note:** Add these `data-testid` attributes during Task 3-4:
- `data-testid="y-axis"` on the `<g>` wrapper around AxisLeft
- `data-testid="y-grid"` on the `<g>` wrapper around GridRows
- `data-testid="pan-zoom-group"` on the `<motion.g>` element

### Task 8: Visual Verification (15 min)
**AC Coverage:** All

- [ ] Run dev server: `bun dev`
- [ ] Verify Y-axis labels appear with superscript notation (10^20, 10^22, etc.)
- [ ] Verify horizontal grid lines at each labeled tick
- [ ] Verify grid lines extend full chart width
- [ ] Verify labels right-aligned within margin
- [ ] Verify pan/zoom doesn't move axis/grid
- [ ] Test with different date ranges (if control exists)
- [ ] Take screenshot for PR documentation

### Task 9: Cross-Browser Testing (10 min)
**AC Coverage:** AC-2.4.2

- [ ] Test Chrome: Unicode superscript renders correctly
- [ ] Test Safari: Unicode superscript renders correctly
- [ ] Test Firefox: Unicode superscript renders correctly
- [ ] Verify monospace font fallback works

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Story TSR-2.1 | done | Scale utilities: `LOG_TICK_VALUES`, `formatFlopTick`, `getVisibleTickValues` |
| Story TSR-2.3 | done | LogScale Y-axis with 72px left margin |
| @visx/axis | npm | AxisLeft component |
| @visx/grid | npm | GridRows component |

### Downstream Dependencies

Stories that build on this:
- **Epic TSR-2 complete:** This is the final story in Epic TSR-2
- **Story 4.2:** BackgroundChart will render alongside this Y-axis
- **Story 5.3:** Tooltip will show FLOP values using same formatFlopTick

---

## Definition of Done

- [ ] AxisLeft renders Y-axis with tick labels
- [ ] Tick labels use Unicode superscript notation via formatFlopTick
- [ ] Only LOG_TICK_VALUES within domain are rendered
- [ ] GridRows renders horizontal lines at each tick
- [ ] Grid styled: `--border` color, 30% opacity
- [ ] Labels positioned: right-aligned, 11px, monospace font
- [ ] Axis/grid remain static during pan/zoom
- [ ] Unit tests pass: `bun test:run`
- [ ] No TypeScript errors: `bun run lint`
- [ ] Visual verification in browser
- [ ] Cross-browser superscript rendering verified

---

## Test Scenarios

### Unit Test Scenarios

1. **AxisLeft Renders with Correct Props**
   ```typescript
   // AxisLeft should use yScale and visible tick values
   render(<ScatterPlot data={testData} dateRange={[2020, 2025]} />)
   // Expect axis to render with ticks like 10^22, 10^23, 10^24, 10^25
   ```

2. **Tick Label Formatting**
   ```typescript
   // formatFlopTick should produce superscript notation
   expect(formatFlopTick(1e24)).toBe('10\u2072\u2074') // 10^24 in Unicode
   ```

3. **Grid Lines at Tick Values**
   ```typescript
   // GridRows should render lines at each visibleTickValue
   const gridLines = container.querySelectorAll('.visx-grid-rows line')
   expect(gridLines.length).toEqual(visibleTickValues.length)
   ```

4. **Domain Filtering**
   ```typescript
   // Only ticks within domain should be visible
   const domain = [1e22, 1e26] // 4 orders of magnitude
   const visible = getVisibleTickValues(domain)
   expect(visible).toEqual([1e22, 1e23, 1e24, 1e25, 1e26])
   ```

### Integration Test Scenarios

1. **Static During Pan/Zoom**
   - Pan timeline left/right
   - Y-axis labels should remain fixed
   - Grid lines should remain fixed
   - Only points should move

2. **Domain Changes**
   - Change dateRange prop (when control exists)
   - Different tick values should appear
   - Grid lines should update

3. **Visual Consistency**
   - Y-axis grid matches X-axis grid opacity
   - Labels readable against background
   - No overlapping with chart content

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/visualization/scatter-plot.tsx` | Modify | Add AxisLeft, GridRows, visibleTickValues computation |
| `tests/unit/components/visualization/scatter-plot.test.ts` | Modify/Create | Add tests for Y-axis labels and grid |

---

## FR/TSR Coverage

| Requirement ID | Description | How Satisfied |
|----------------|-------------|---------------|
| TSR6 | Tick labels display scientific notation (10^18, 10^20) | formatFlopTick produces Unicode superscript |
| TSR7 | Grid lines appear at each labeled tick value | GridRows at visibleTickValues positions |

---

## Technical Notes

### visx AxisLeft Props Reference

```typescript
<AxisLeft
  scale={scale}           // Required: ScaleLogarithmic
  tickValues={[...]}      // Explicit tick positions
  tickFormat={fn}         // (value) => string
  stroke={string}         // Axis line color
  tickStroke={string}     // Tick mark color
  tickLabelProps={fn}     // () => SVGTextProps
  hideAxisLine={boolean}  // Optional: hide the axis line
  hideTicks={boolean}     // Optional: hide tick marks
  hideZero={boolean}      // Optional: hide zero tick
/>
```

### visx GridRows Props Reference

```typescript
<GridRows
  scale={scale}           // Required: ScaleLogarithmic
  width={number}          // Grid line width (extends right)
  tickValues={[...]}      // Explicit row positions
  stroke={string}         // Line color
  strokeOpacity={number}  // Line opacity
  strokeDasharray={string}// Optional: dashed pattern
/>
```

### Unicode Superscript Characters

The `formatFlopTick` function uses these Unicode characters:
- Superscript minus: \u207b
- Superscript 0-9: \u2070, \u00b9, \u00b2, \u00b3, \u2074-\u2079

Example: `10^24` becomes `10\u00b2\u2074` which renders as "10^24" with raised numerals.

### CSS Variables Used

- `--border`: Grid and axis stroke color
- `--text-secondary`: Tick label color
- `--font-mono`: Monospace font for labels (alignment)

These should be defined in the project's CSS/Tailwind config for theme consistency.

---

## Dev Agent Record

_This section is populated during implementation_

### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

### File List

---

_Story created: 2025-12-11_
_Epic: TSR-2 - Y-Axis Log Scale (Timeline Visualization Redesign)_
_Sequence: 4 of 4 in Epic TSR-2 (FINAL)_
_Requirements: TSR6, TSR7_
