# Story TSR-2.3: Integrate Log Scale Y-Axis into ScatterPlot

**Story Key:** tsr-2-3-scatter-plot-y-axis
**Epic:** TSR-2 - Y-Axis Log Scale (Timeline Visualization Redesign)
**Status:** drafted
**Priority:** High (Core visualization change)

---

## User Story

**As a** visitor,
**I want** obituaries positioned on a logarithmic Y-axis based on AI compute levels,
**So that** I can see the actual scale of AI progress when each "AI is dead" claim was made.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-2.3.1 | Y-axis uses log scale | Given ScatterPlot renders, when yScale is computed, then it uses `createLogYScale()` from scales.ts instead of `scaleLinear` |
| AC-2.3.2 | Domain computed from enabled metrics | Given enabled metrics and date range, when yScale domain is set, then uses `getUnifiedDomain()` to calculate [minFlop, maxFlop] |
| AC-2.3.3 | Points positioned at correct FLOP | Given an obituary with a date, when its Y position is calculated, then it reflects the training compute FLOP value at that date via `getActualFlopAtDate()` |
| AC-2.3.4 | Jitter in log-space | Given obituary Y positioning, when jitter is applied, then jitter is calculated in log-space (orders of magnitude) not linear space |
| AC-2.3.5 | Left margin increased | Given ScatterPlot renders, when margins are applied, then left margin is 72px (up from 20px) to accommodate Y-axis tick labels |
| AC-2.3.6 | Visual parity maintained | Given existing pan/zoom/tooltip interactions, when Y-axis is changed, then all interactions continue to work correctly |

---

## Technical Approach

### Implementation Overview

Transform the ScatterPlot's Y-axis from a normalized linear scale (0-1) to a logarithmic FLOP scale. This positions obituary dots according to the actual AI training compute level at their publication date, making the exponential growth of AI visually apparent.

### Current State Analysis

**Current Y-scale implementation (`scatter-plot.tsx:247-252`):**
```typescript
const yScale = useMemo(() => {
  return scaleLinear({
    domain: [0, 1],
    range: [innerHeight, 0],
  })
}, [innerHeight])
```

**Current point positioning (`scatter-plot.tsx:256-273`):**
```typescript
const pointPositions = useMemo(() => {
  return data.map((obituary) => {
    const obituaryDate = new Date(obituary.date)
    // Get normalized metric value (0-1) for this date
    const metricY = getNormalizedMetricAtDate(trainingComputeFrontier, obituaryDate)
    // Add jitter around the metric line (+-0.15 normalized units)
    const jitter = (hashToJitter(obituary._id) - 0.5) * 0.3
    // Clamp to 0-1 range
    const finalY = Math.max(0.05, Math.min(0.95, metricY + jitter))

    return {
      obituary,
      x: xScale(obituaryDate) ?? 0,
      y: yScale(finalY) ?? 0,
      color: getCategoryColor(obituary.categories),
    }
  })
}, [data, xScale, yScale])
```

**Current margins (`scatter-plot.tsx:50`):**
```typescript
const MARGIN = { top: 20, right: 20, bottom: 40, left: 20 }
```

### Target State

**New Y-scale implementation:**
```typescript
import { createLogYScale } from '@/lib/utils/scales'
import { getUnifiedDomain, getActualFlopAtDate, trainingComputeFrontier } from '@/data/ai-metrics'
import type { MetricType } from '@/types/metrics'

// Props addition (for future control panel integration)
interface ScatterPlotInnerProps {
  // ... existing props
  enabledMetrics?: MetricType[]
  dateRange?: [number, number]
}

// New Y-scale with log domain
const yScale = useMemo(() => {
  const enabledMetrics = props.enabledMetrics ?? ['compute']
  const dateRange = props.dateRange ?? [2010, 2025]
  const domain = getUnifiedDomain(enabledMetrics, dateRange[0], dateRange[1])
  return createLogYScale(innerHeight, domain)
}, [innerHeight, props.enabledMetrics, props.dateRange])
```

**New point positioning with log-space jitter:**
```typescript
const pointPositions = useMemo(() => {
  return data.map((obituary) => {
    const obituaryDate = new Date(obituary.date)

    // Get actual FLOP value at this date
    const baseFlop = getActualFlopAtDate(trainingComputeFrontier, obituaryDate)

    // Jitter in log-space: +/- 0.3 orders of magnitude
    // hashToJitter returns 0-1, center to -0.5 to 0.5, scale to +/-0.3
    const jitterExp = (hashToJitter(obituary._id) - 0.5) * 0.6
    const jitteredFlop = baseFlop * Math.pow(10, jitterExp)

    return {
      obituary,
      x: xScale(obituaryDate) ?? 0,
      y: yScale(jitteredFlop) ?? 0,
      color: getCategoryColor(obituary.categories),
    }
  })
}, [data, xScale, yScale])
```

**Updated margins:**
```typescript
const MARGIN = { top: 20, right: 20, bottom: 40, left: 72 }
```

### Key Implementation Details

1. **Log Scale Integration**
   - Replace `scaleLinear` with `createLogYScale` from `@/lib/utils/scales`
   - Domain comes from `getUnifiedDomain()` based on enabled metrics
   - Default to `['compute']` metrics and `[2010, 2025]` date range

2. **Log-Space Jitter**
   - Current: Linear jitter of +/- 0.15 normalized units
   - New: Multiplicative jitter in orders of magnitude
   - `jitterExp = (hash - 0.5) * 0.6` gives +/- 0.3 orders of magnitude
   - `jitteredFlop = baseFlop * 10^jitterExp` shifts by 10^(-0.3) to 10^(0.3) factor
   - This spreads points visually without distorting the log scale relationship

3. **Margin Adjustment**
   - Left margin: 20px -> 72px
   - Accommodates tick labels like "10^24" (scientific notation with superscript)
   - Story 2.4 will add the actual AxisLeft component

4. **Backward Compatibility**
   - Props `enabledMetrics` and `dateRange` are optional with defaults
   - Existing callers continue to work without changes
   - Control panel integration (Epic 3) will pass these props

5. **Domain Calculation Flow**
   ```
   enabledMetrics: ['compute']
   dateRange: [2010, 2025]
        |
        v
   getUnifiedDomain(['compute'], 2010, 2025)
        |
        v
   getMetricDomain(trainingComputeFrontier, 2010, 2025)
        |
        v
   filterMetricsByDateRange -> find min/max log values -> add padding
        |
        v
   [10^(minLog-1), 10^(maxLog+1)] e.g., [10^22, 10^26.7]
   ```

---

## Tasks

### Task 1: Update Imports and Props Interface (10 min)
**AC Coverage:** AC-2.3.1, AC-2.3.2

- [ ] Add imports for scale utilities and metrics helpers
- [ ] Add optional props `enabledMetrics?: MetricType[]` and `dateRange?: [number, number]` to `ScatterPlotInnerProps`
- [ ] Pass props through from outer `ScatterPlot` component
- [ ] Set defaults: `enabledMetrics = ['compute']`, `dateRange = [2010, 2025]`

```typescript
// Add to imports
import { createLogYScale, type LogScale } from '@/lib/utils/scales'
import { getUnifiedDomain, getActualFlopAtDate, trainingComputeFrontier } from '@/data/ai-metrics'
import type { MetricType } from '@/types/metrics'
```

### Task 2: Update Margin Constant (5 min)
**AC Coverage:** AC-2.3.5

- [ ] Change `MARGIN.left` from 20 to 72
- [ ] Verify innerWidth calculation still correct
- [ ] Note: This leaves space for Y-axis labels (Story 2.4)

```typescript
const MARGIN = { top: 20, right: 20, bottom: 40, left: 72 }
```

### Task 3: Replace Y-Scale Implementation (15 min)
**AC Coverage:** AC-2.3.1, AC-2.3.2

- [ ] Replace `scaleLinear` yScale with `createLogYScale`
- [ ] Compute domain using `getUnifiedDomain(enabledMetrics, dateRange[0], dateRange[1])`
- [ ] Add enabledMetrics and dateRange to useMemo dependencies
- [ ] Add type annotation for LogScale

```typescript
const yScale = useMemo(() => {
  const metrics = enabledMetrics ?? ['compute']
  const range = dateRange ?? [2010, 2025]
  const domain = getUnifiedDomain(metrics, range[0], range[1])
  return createLogYScale(innerHeight, domain)
}, [innerHeight, enabledMetrics, dateRange])
```

### Task 4: Update Point Positioning with Log-Space Jitter (20 min)
**AC Coverage:** AC-2.3.3, AC-2.3.4

- [ ] Replace `getNormalizedMetricAtDate` with `getActualFlopAtDate`
- [ ] Calculate jitter in log-space (orders of magnitude)
- [ ] Apply jitter multiplicatively: `baseFlop * 10^jitterExp`
- [ ] Remove 0-1 clamping (log scale handles bounds)
- [ ] Verify jitter range: +/- 0.3 orders of magnitude (~0.5x to ~2x)

```typescript
const pointPositions = useMemo(() => {
  return data.map((obituary) => {
    const obituaryDate = new Date(obituary.date)

    // Get actual FLOP value at this date
    const baseFlop = getActualFlopAtDate(trainingComputeFrontier, obituaryDate)

    // Jitter in log-space: +/- 0.3 orders of magnitude
    const jitterExp = (hashToJitter(obituary._id) - 0.5) * 0.6
    const jitteredFlop = baseFlop * Math.pow(10, jitterExp)

    return {
      obituary,
      x: xScale(obituaryDate) ?? 0,
      y: yScale(jitteredFlop) ?? 0,
      color: getCategoryColor(obituary.categories),
    }
  })
}, [data, xScale, yScale])
```

### Task 5: Update BackgroundChart Y-Scale Prop (10 min)
**AC Coverage:** AC-2.3.6

- [ ] Check BackgroundChart component interface
- [ ] If it accepts yScale prop, verify it works with LogScale type
- [ ] If needed, update BackgroundChart to accept LogScale (may defer to Story 4.2)
- [ ] For now, BackgroundChart may continue using normalized 0-1 scale

Note: Full BackgroundChart log-scale integration is Story 4.2. This task ensures no breakage.

### Task 6: Verify Existing Interactions (15 min)
**AC Coverage:** AC-2.3.6

- [ ] Test pan/drag still works correctly
- [ ] Test zoom in/out still works correctly
- [ ] Test tooltip positioning still correct
- [ ] Test cluster badge positioning (if affected by Y-axis)
- [ ] Test keyboard navigation still works
- [ ] Test modal opens correctly on point click

### Task 7: Update Outer ScatterPlot Component (10 min)
**AC Coverage:** AC-2.3.2

- [ ] Add `enabledMetrics` and `dateRange` to `ScatterPlotProps`
- [ ] Pass through to `ScatterPlotInner`
- [ ] Update JSDoc comments

```typescript
export interface ScatterPlotProps {
  data: ObituarySummary[]
  height?: number
  activeCategories?: Category[]
  fillContainer?: boolean
  enabledMetrics?: MetricType[]  // New
  dateRange?: [number, number]    // New
}
```

### Task 8: Write Unit Tests (30 min)
**AC Coverage:** All

Create/update `tests/unit/components/visualization/scatter-plot.test.ts`:

- [ ] Test yScale uses log domain from getUnifiedDomain
- [ ] Test point Y positions use actual FLOP values
- [ ] Test jitter is in log-space (multiplicative)
- [ ] Test left margin is 72px
- [ ] Test default enabledMetrics is ['compute']
- [ ] Test default dateRange is [2010, 2025]
- [ ] Test custom enabledMetrics/dateRange props are respected

### Task 9: Visual Verification (15 min)
**AC Coverage:** All

- [ ] Run dev server: `bun dev`
- [ ] Verify obituary points spread along log Y-axis
- [ ] Verify points track with training compute trend line (approximately)
- [ ] Verify left side has space for Y-axis labels
- [ ] Verify pan/zoom behavior unchanged
- [ ] Take screenshot for PR/documentation

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Story 2.1 | done | Scale utilities: `createLogYScale`, `LogScale` type |
| Story 2.2 | done | Metrics helpers: `getUnifiedDomain`, `getActualFlopAtDate`, `MetricType` |
| src/components/visualization/scatter-plot.tsx | Existing | Current linear Y-axis implementation |
| src/lib/utils/scatter-helpers.ts | Existing | `hashToJitter` function |

### Downstream Dependencies

Stories that depend on this:
- **Story 2.4:** Y-Axis Labels and Grid (adds AxisLeft with tick labels)
- **Story 4.1-4.2:** BackgroundChart updates (adapts to log scale)
- **Story 5.3:** Tooltip Enhancement (shows FLOP value)

---

## Definition of Done

- [ ] Y-axis uses `createLogYScale` instead of `scaleLinear`
- [ ] Domain computed via `getUnifiedDomain(enabledMetrics, startYear, endYear)`
- [ ] Points positioned using `getActualFlopAtDate` + log-space jitter
- [ ] Left margin is 72px
- [ ] Jitter is +/- 0.3 orders of magnitude (multiplicative)
- [ ] Pan/zoom/tooltip interactions work correctly
- [ ] Optional props `enabledMetrics` and `dateRange` supported
- [ ] Unit tests pass
- [ ] No TypeScript errors: `bun run lint`
- [ ] Visual verification in browser

---

## Test Scenarios

### Unit Test Scenarios

1. **Y-Scale Domain from getUnifiedDomain**
   ```typescript
   // Mock getUnifiedDomain to return known domain
   const { yScale } = renderScatterPlot({ enabledMetrics: ['compute'], dateRange: [2020, 2025] })
   expect(yScale.domain()[0]).toBeGreaterThan(1e20)
   expect(yScale.domain()[1]).toBeLessThan(1e28)
   ```

2. **Point Positioning Uses Actual FLOP**
   ```typescript
   // Given obituary dated 2023-03-01, training compute ~10^25.3
   const positions = getPointPositions(testData, xScale, yScale)
   const point = positions.find(p => p.obituary.date === '2023-03-01')
   // Y position should be near 10^25 on log scale
   expect(yScale.invert(point.y)).toBeCloseTo(1e25, -23)
   ```

3. **Log-Space Jitter**
   ```typescript
   // Jitter should be multiplicative, not additive
   const baseFlop = 1e24
   const jitterExp = 0.3 // max positive jitter
   const jitteredFlop = baseFlop * Math.pow(10, jitterExp)
   expect(jitteredFlop).toBeCloseTo(2e24, -22) // 10^0.3 ~ 2
   ```

4. **Margin Width**
   ```typescript
   const { container } = render(<ScatterPlot data={testData} />)
   // innerWidth should account for 72px left margin
   expect(MARGIN.left).toBe(72)
   ```

### Integration Test Scenarios

1. **Pan Still Works**
   - Drag left/right
   - Points and axis move together
   - No visual glitches

2. **Zoom Still Works**
   - Scroll to zoom
   - Points scale correctly
   - Domain doesn't change unexpectedly

3. **Tooltip Positioning**
   - Hover over point
   - Tooltip appears near point
   - Position correct after pan/zoom

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/visualization/scatter-plot.tsx` | Modify | Replace Y-scale, update positioning, change margin |
| `tests/unit/components/visualization/scatter-plot.test.ts` | Modify/Create | Add tests for log scale behavior |

---

## FR/TSR Coverage

| Requirement ID | Description | How Satisfied |
|----------------|-------------|---------------|
| TSR5 | Y-axis uses logarithmic scale (base 10) | createLogYScale uses base-10 log |
| TSR8 | Obituaries position correctly on log scale based on FLOP at date | getActualFlopAtDate + yScale positioning |

---

## Technical Notes

### Why Log-Space Jitter?

With a linear Y-axis, jitter of +/- 0.15 (15% of range) worked fine. With a log scale spanning 5-10 orders of magnitude, linear jitter would either:
- Be invisible (0.15 * 10^25 = 1.5 * 10^24, negligible spread)
- Or be enormous if scaled to log range

Log-space jitter of +/- 0.3 orders of magnitude means:
- Minimum multiplier: 10^(-0.3) ~ 0.5 (half the base value)
- Maximum multiplier: 10^(0.3) ~ 2 (double the base value)
- Visually consistent spread at any FLOP level

### BackgroundChart Compatibility

The BackgroundChart currently uses the same yScale passed to it. With this change:
- If yScale is a LogScale, BackgroundChart needs to handle it
- Current BackgroundChart normalizes to 0-1 internally
- Full integration deferred to Story 4.2
- For now, BackgroundChart may render incorrectly but won't break

### Props Design Decision

Added `enabledMetrics` and `dateRange` as props rather than hardcoding because:
1. Control Panel (Epic 3) will manage these values
2. URL state hook will provide them
3. Keeps ScatterPlot as a controlled component
4. Defaults maintain current behavior

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
_Sequence: 3 of 4 in Epic TSR-2_
_Requirements: TSR5, TSR8_
