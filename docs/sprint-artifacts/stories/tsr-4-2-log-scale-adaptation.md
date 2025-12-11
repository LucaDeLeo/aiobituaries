# Story TSR-4-2: Adapt BackgroundChart to Log Scale

**Epic:** TSR-4 (Background Chart Updates)
**Status:** ready-for-dev
**Priority:** High
**Estimation:** 3-4 hours

---

## User Story

**As a** developer,
**I want** BackgroundChart to render metric lines using the actual log Y-scale from ScatterPlot,
**So that** trend lines align correctly with obituary data points and the FLOP axis.

---

## Context

### Background

BackgroundChart currently normalizes all metrics to a 0-1 range internally before rendering. This was appropriate when the Y-axis had no meaningful scale, but now that ScatterPlot uses a logarithmic FLOP Y-axis (Story TSR-2-1 through TSR-2-4), the background lines no longer align correctly with the data.

**Current Problem:**
- BackgroundChart creates its own `scaleLinear({ domain: [0, 1], range: [innerHeight, 0] })`
- All metrics are normalized to 0-1 regardless of their actual values
- Lines don't correspond to real FLOP values on the Y-axis
- Training compute data is stored as log10 FLOP (e.g., 23.5 = 10^23.5 FLOP)

**Desired Behavior:**
- BackgroundChart receives the same log scale that ScatterPlot uses
- Training Compute line is positioned at actual FLOP values
- MMLU and ECI metrics need special treatment (they're not FLOP-based)
- Date range filtering via xScale domain

### Epic Dependencies

- **Story TSR-2-1 (Scale Utilities):** Complete - `createLogYScale`, `logToFlop`, `flopToLog`
- **Story TSR-2-2 (ai-metrics Helpers):** Complete - `getActualFlopAtDate`, `filterMetricsByDateRange`
- **Story TSR-4-1 (Metric Toggles):** Complete - BackgroundChart receives `enabledMetrics` prop

### Technical Context

**Current BackgroundChart Implementation (Problem):**
```typescript
// src/components/visualization/background-chart.tsx - Lines 31-48
const normalizedMetrics = useMemo(() => {
  return metrics.map((metric) => {
    const values = metric.data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    return {
      ...metric,
      normalizedData: metric.data.map((d) => ({
        date: new Date(d.date),
        normalizedValue: (d.value - min) / range,  // PROBLEM: Always 0-1
        originalValue: d.value,
      })),
    }
  })
}, [metrics])

// Line 64-70 - Uses internal 0-1 scale, not yScale prop
const areaYScale = scaleLinear({
  domain: [0, 1],
  range: [innerHeight, 0],
})
```

**ScatterPlot's yScale (Correct):**
```typescript
// src/components/visualization/scatter-plot.tsx - Lines 262-265
const yScale = useMemo((): LogScale => {
  const domain = getUnifiedDomain(enabledMetrics, dateRange[0], dateRange[1])
  return createLogYScale(innerHeight, domain)
}, [innerHeight, enabledMetrics, dateRange])
```

**Metric Data Formats:**
```typescript
// Training Compute: values are log10 FLOP (e.g., 23.5, 24.3, 25.3)
trainingComputeFrontier.data: [{ date: "2023-03-01", value: 25.3 }, ...]

// MMLU: values are percentages (e.g., 60, 86.4, 88.1)
mmluFrontier.data: [{ date: "2023-03-01", value: 86.4 }, ...]

// ECI: values are index scores (e.g., 125.9, 142.8)
eciFrontier.data: [{ date: "2023-02-01", value: 109.8 }, ...]
```

### Key Design Decisions

1. **Training Compute renders on log FLOP scale:** Convert stored log10 values to actual FLOP using `logToFlop()`
2. **MMLU/ECI use opacity overlay approach:** Since they're not FLOP-based, render them normalized 0-1 with reduced visual weight
3. **Pass yScale and use it directly:** Remove internal scale creation, use the passed yScale
4. **Date range filtering via xScale domain:** Filter data points outside xScale domain
5. **Maintain smooth transitions:** Keep the 200ms opacity transitions from TSR-4-1

---

## Acceptance Criteria

### AC-1: Training Compute Line Uses Log Scale

**Given** enabledMetrics includes 'compute'
**When** BackgroundChart renders the training compute line
**Then** Y positions are calculated using actual FLOP values via `logToFlop(dataPoint.value)`
**And** line coordinates align with yScale tick labels (10^22, 10^24, etc.)

**Implementation:**
```typescript
// For training compute metric - use isFlopMetric() helper from ai-metrics.ts
import { isFlopMetric } from '@/data/ai-metrics'

const getY = (d: TransformedDataPoint) => {
  if (metric.isLogScale) {
    // d.yValue already contains logToFlop(value) from transformation step
    return yScale(d.yValue) ?? 0
  }
  // ... other metrics use normalized yValue
}
```

**Note:** The `isFlopMetric(metricType)` helper (ai-metrics.ts:476-478) provides the `metricType === 'compute'` check.

### AC-2: Non-FLOP Metrics Render as Normalized Overlay

**Given** enabledMetrics includes 'mmlu' or 'eci'
**When** BackgroundChart renders non-compute metrics
**Then** they render normalized to innerHeight range (top = max, bottom = min)
**And** visual opacity is reduced (0.3 instead of 0.6) to distinguish from primary scale

**Rationale:** MMLU (percentage) and ECI (index) don't map to FLOP scale. They provide context but shouldn't imply false alignment with the Y-axis.

### AC-3: Date Range Filtering Works Correctly

**Given** xScale has domain [Jan 2015, Dec 2025]
**When** BackgroundChart filters data
**Then** only data points within the xScale domain are rendered
**And** lines extend smoothly between first/last visible points

**Current behavior already filters by xScale domain (lines 57-60):**
```typescript
const [domainStart, domainEnd] = xScale.domain()
const visibleData = metric.normalizedData.filter(
  (d) => d.date >= domainStart && d.date <= domainEnd
)
```

### AC-4: Transitions Maintained from TSR-4-1

**Given** metric toggles change enabledMetrics
**When** lines appear/disappear
**Then** 200ms opacity transition applies (no regression from TSR-4-1)

### AC-5: AreaClosed Works with Log Scale

**Given** Training Compute is enabled
**When** AreaClosed renders the fill area
**Then** area fills correctly from line to bottom of chart
**And** gradient renders smoothly across log scale range

**Note:** AreaClosed requires a `yScale` prop. Must pass appropriate scale.

### AC-6: Props Interface Updated

**Given** BackgroundChart component
**When** checking its props interface
**Then** interface includes `enabledMetrics` for visibility control:

```typescript
import type { LogScale } from '@/lib/utils/scales'

export interface BackgroundChartProps {
  metrics: AIMetricSeries[]
  enabledMetrics: MetricType[]  // Added in TSR-4-1
  xScale: ScaleTime<number, number>
  yScale: LogScale  // From scales.ts - cleaner than verbose union type
  innerHeight: number
}
```

---

## Technical Implementation

### Files to Modify

```
src/components/visualization/background-chart.tsx  # Main changes
tests/unit/components/visualization/background-chart-toggle.test.tsx  # Extend tests
```

### Implementation Guide

**1. Update BackgroundChart Data Transformation (AC-1, AC-2):**

```typescript
// src/components/visualization/background-chart.tsx

import { logToFlop } from '@/lib/utils/scales'
import { isFlopMetric } from '@/data/ai-metrics'
import type { MetricType } from '@/types/metrics'

interface TransformedDataPoint {
  date: Date
  value: number         // Original value from data
  yValue: number        // Value for Y positioning
  isLogScale: boolean   // Whether this uses log scale
}

export function BackgroundChart({
  metrics,
  enabledMetrics,
  xScale,
  yScale,
  innerHeight,
}: BackgroundChartProps) {
  // Transform data with appropriate Y values based on metric type
  const transformedMetrics = useMemo(() => {
    return metrics.map((metric) => {
      const isCompute = isFlopMetric(metric.id as MetricType)

      // Calculate min/max ONCE per metric series (not per data point)
      let min = 0, max = 1, range = 1
      if (!isCompute) {
        const values = metric.data.map(p => p.value)
        min = Math.min(...values)
        max = Math.max(...values)
        range = max - min || 1
      }

      return {
        ...metric,
        isLogScale: isCompute,
        transformedData: metric.data.map((d) => {
          const date = new Date(d.date)

          if (isCompute) {
            // Training compute: convert log10 to actual FLOP
            return {
              date,
              value: d.value,
              yValue: logToFlop(d.value),  // Actual FLOP for yScale
              isLogScale: true,
            }
          } else {
            // MMLU/ECI: normalize to 0-1 for overlay rendering
            return {
              date,
              value: d.value,
              yValue: (d.value - min) / range,  // Normalized 0-1
              isLogScale: false,
            }
          }
        }),
      }
    })
  }, [metrics])

  // ... render logic
}
```

**2. Update Render Logic for Different Scales (AC-1, AC-2, AC-5):**

```typescript
{transformedMetrics.map((metric) => {
  const isEnabled = enabledMetrics.includes(metric.id as MetricType)

  // Filter to visible date range
  const [domainStart, domainEnd] = xScale.domain()
  const visibleData = metric.transformedData.filter(
    (d) => d.date >= domainStart && d.date <= domainEnd
  )

  if (visibleData.length < 2) return null

  const getX = (d: TransformedDataPoint) => xScale(d.date) ?? 0

  // Y accessor depends on metric type
  const getY = (d: TransformedDataPoint) => {
    if (metric.isLogScale) {
      // Compute metric: use passed yScale directly
      return yScale(d.yValue) ?? 0
    } else {
      // Non-compute: render normalized to chart height
      return innerHeight * (1 - d.yValue)  // Inverted: high values at top
    }
  }

  // Create appropriate scale for AreaClosed
  const areaYScale = metric.isLogScale
    ? yScale  // Use log scale
    : scaleLinear({ domain: [0, 1], range: [innerHeight, 0] })  // Normalized scale

  // Opacity: full for compute, reduced for overlay metrics
  const baseOpacity = metric.isLogScale ? 0.6 : 0.3

  return (
    <g
      key={metric.id}
      data-metric-id={metric.id}
      style={{
        opacity: isEnabled ? baseOpacity : 0,
        transition: 'opacity 200ms ease-in-out',
      }}
    >
      {/* ... existing gradient, AreaClosed, LinePath */}

      <AreaClosed
        data={visibleData}
        x={getX}
        y={getY}
        yScale={areaYScale}
        curve={curveMonotoneX}
        fill={`url(#area-gradient-${metric.id})`}
      />

      <LinePath
        data={visibleData}
        x={getX}
        y={getY}
        curve={curveMonotoneX}
        stroke={metric.color}
        strokeWidth={2}
        strokeOpacity={metric.isLogScale ? 0.8 : 0.5}  // Reduced for overlay
      />
    </g>
  )
})}
```

**3. Update Props Interface (AC-6):**

```typescript
import type { ScaleTime } from '@visx/scale'
import type { LogScale } from '@/lib/utils/scales'
import type { MetricType } from '@/types/metrics'

export interface BackgroundChartProps {
  metrics: AIMetricSeries[]
  enabledMetrics: MetricType[]
  xScale: ScaleTime<number, number>
  yScale: LogScale  // Clean type from scales.ts
  innerHeight: number
}
```

### Test Coverage Requirements

**Extend tests/unit/components/visualization/background-chart-toggle.test.tsx:**

```typescript
import { logToFlop } from '@/lib/utils/scales'
import { createLogYScale } from '@/lib/utils/scales'

describe('BackgroundChart - Log Scale Adaptation', () => {
  // Create proper log scale for testing
  const createMockLogYScale = () =>
    createLogYScale(400, [1e22, 1e27])

  describe('training compute positioning', () => {
    it('positions compute line using actual FLOP values', () => {
      const logYScale = createMockLogYScale()
      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={createMockXScale()}
            yScale={logYScale}
            innerHeight={400}
          />
        </svg>
      )

      // LinePath should exist and use transformed coordinates
      const linePath = container.querySelector('path[stroke="rgb(118, 185, 0)"]')
      expect(linePath).toBeInTheDocument()

      // Path should have valid d attribute (coordinates in log space)
      const pathD = linePath?.getAttribute('d')
      expect(pathD).toBeTruthy()
      expect(pathD).toContain('M')  // Valid path
    })

    it('uses logToFlop for Y coordinate calculation', () => {
      // Test that data point at log10=25 (1e25 FLOP) maps correctly
      const testValue = 25  // log10 FLOP
      const expectedFlop = logToFlop(testValue)
      expect(expectedFlop).toBe(1e25)
    })
  })

  describe('non-compute metrics', () => {
    it('renders MMLU with reduced opacity', () => {
      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[mmluFrontier]}
            enabledMetrics={['mmlu']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const metricGroup = container.querySelector('[data-metric-id="mmlu"]')
      // Check that opacity is 0.3 (reduced) not 0.6
      expect(metricGroup).toHaveStyle({ opacity: '0.3' })
    })

    it('renders ECI as normalized overlay', () => {
      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[eciFrontier]}
            enabledMetrics={['eci']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      const metricGroup = container.querySelector('[data-metric-id="eci"]')
      expect(metricGroup).toBeInTheDocument()
    })
  })

  describe('date range filtering', () => {
    it('filters data points outside xScale domain', () => {
      // Create xScale with narrow domain (2020-2023)
      const narrowXScale = scaleTime({
        domain: [new Date('2020-01-01'), new Date('2023-12-31')],
        range: [0, 800],
      })

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={narrowXScale}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // Should render (training compute has data 2020-2023)
      const linePath = container.querySelector('path[stroke="rgb(118, 185, 0)"]')
      expect(linePath).toBeInTheDocument()
    })

    it('returns null when no data in date range', () => {
      // Create xScale with future domain (no data exists)
      const futureXScale = scaleTime({
        domain: [new Date('2030-01-01'), new Date('2035-12-31')],
        range: [0, 800],
      })

      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={futureXScale}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // No line should render (no data points in range)
      const linePath = container.querySelector('path[stroke]')
      expect(linePath).not.toBeInTheDocument()
    })
  })

  describe('AreaClosed integration', () => {
    it('renders area fill with log scale', () => {
      const { container } = render(
        <svg>
          <BackgroundChart
            metrics={[trainingComputeFrontier]}
            enabledMetrics={['compute']}
            xScale={createMockXScale()}
            yScale={createMockLogYScale()}
            innerHeight={400}
          />
        </svg>
      )

      // AreaClosed creates a filled path with gradient
      const areaPath = container.querySelector('path[fill^="url(#area-gradient"]')
      expect(areaPath).toBeInTheDocument()
    })
  })
})
```

---

## Tasks

### Task 1: Update Data Transformation (AC: 1, 2)
- [ ] Replace `normalizedMetrics` with `transformedMetrics` that handles both log and normalized values
- [ ] Add `isLogScale` flag based on metric id ('compute' vs others)
- [ ] For compute: store `logToFlop(d.value)` as `yValue`
- [ ] For MMLU/ECI: store normalized 0-1 as `yValue`
- [ ] Import `logToFlop` from `@/lib/utils/scales`

### Task 2: Update Y Position Calculation (AC: 1, 2)
- [ ] Create `getY` function that checks `isLogScale` flag
- [ ] For log scale metrics: use `yScale(d.yValue)`
- [ ] For normalized metrics: use `innerHeight * (1 - d.yValue)`
- [ ] Ensure coordinates stay within chart bounds

### Task 3: Update AreaClosed yScale Prop (AC: 5)
- [ ] Conditionally pass appropriate scale to AreaClosed
- [ ] Log scale metrics: pass the actual `yScale` prop
- [ ] Normalized metrics: create inline linear scale
- [ ] Verify area fills correctly in both cases

### Task 4: Differentiate Visual Weight (AC: 2)
- [ ] Set compute opacity to 0.6 (primary)
- [ ] Set MMLU/ECI opacity to 0.3 (overlay)
- [ ] Reduce strokeOpacity for overlay metrics (0.5 vs 0.8)
- [ ] Maintain transition from TSR-4-1 (200ms)

### Task 5: Update Props Interface (AC: 6)
- [ ] Import proper scale types from @visx/scale
- [ ] Update `yScale` prop type to accept log scale
- [ ] Verify TypeScript compiles without errors

### Task 6: Verify Date Range Filtering (AC: 3)
- [ ] Confirm existing xScale domain filtering still works
- [ ] Test with narrow date ranges
- [ ] Ensure lines extend to edge of visible area

### Task 7: Maintain Transitions (AC: 4)
- [ ] Verify 200ms opacity transition still applies
- [ ] Test toggle behavior in browser
- [ ] Ensure no regression from TSR-4-1

### Task 8: Write Unit Tests
- [ ] Add log scale positioning tests
- [ ] Add non-compute metrics overlay tests
- [ ] Add date range filtering edge case tests
- [ ] Add AreaClosed integration tests
- [ ] Run: `bun vitest tests/unit/components/visualization/background-chart`

### Task 9: Integration Testing
- [ ] Run `bun dev` and open visualization
- [ ] Verify Training Compute line aligns with Y-axis ticks (10^22, 10^24, etc.)
- [ ] Enable MMLU - verify it renders with reduced opacity
- [ ] Enable ECI - verify it renders normalized to full height
- [ ] Adjust date range slider - verify lines update correctly
- [ ] Verify obituary dots align with compute line at their dates

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] All tasks completed
- [ ] Tests pass: `bun vitest tests/unit/components/visualization/background-chart`
- [ ] No TypeScript errors: `bun run lint`
- [ ] Existing tests pass: `bun test:run`
- [ ] Training Compute line aligns with log scale Y-axis ticks
- [ ] MMLU/ECI render as subtle overlay (reduced opacity)
- [ ] Date range filtering works correctly
- [ ] 200ms transitions maintained
- [ ] Visual inspection confirms correct positioning

---

## Dev Notes

### Why Not All Metrics on Log Scale?

MMLU (percentage 0-100) and ECI (index ~100-155) don't fit the FLOP scale (10^17 - 10^27). Options considered:

1. **Secondary Y-axis (rejected):** Clutters visualization, confusing dual scales
2. **Normalized overlay (chosen):** Shows trend direction without implying FLOP alignment
3. **Hide non-compute (rejected):** Loses useful context

The overlay approach preserves information while clearly distinguishing primary (compute) from secondary (MMLU/ECI) metrics.

### Compute Line Positioning Logic

```
Data value: 25.3 (log10 FLOP)
    |
    v
logToFlop(25.3) = 10^25.3 = 1.995e25 FLOP
    |
    v
yScale(1.995e25) = pixel Y coordinate (near 10^25 tick)
```

### AreaClosed Scale Requirements

AreaClosed requires a `yScale` prop for proper area filling. For log scale metrics, we pass the actual yScale. For normalized metrics, we create an inline linear scale:

```typescript
const areaYScale = metric.isLogScale
  ? yScale
  : scaleLinear({ domain: [0, 1], range: [innerHeight, 0] })
```

### Edge Case: yScale Domain Clipping

When data points fall outside the yScale domain, visx log scale returns `undefined`. Handle this in the getY accessor:

```typescript
const getY = (d: TransformedDataPoint) => {
  if (metric.isLogScale) {
    // yScale returns undefined for values outside domain
    return yScale(d.yValue) ?? 0
  }
  // ...
}
```

Data points outside the Y domain will be clipped to the chart edge (y=0 for values above domain, y=innerHeight for values below). This is acceptable behavior as the visible data range should encompass all enabled metrics.

### Performance Considerations

- `transformedMetrics` is memoized on `metrics` dependency
- No additional re-renders compared to previous implementation
- logToFlop is a simple Math.pow operation (negligible cost)
- min/max calculated once per metric series (not per data point)

### References

- [Source: docs/sprint-artifacts/epics-timeline-redesign.md#Story 4.2]
- [Source: src/components/visualization/background-chart.tsx - Current implementation]
- [Source: src/lib/utils/scales.ts - logToFlop, createLogYScale]
- [Source: src/data/ai-metrics.ts - Metric data formats]
- [Source: Story TSR-4-1 - Metric toggles and transitions]

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be filled in by dev agent -->

### Debug Log References

### Completion Notes List

### File List

- `/Users/luca/dev/aiobituaries/src/components/visualization/background-chart.tsx`
- `/Users/luca/dev/aiobituaries/tests/unit/components/visualization/background-chart-toggle.test.tsx`
