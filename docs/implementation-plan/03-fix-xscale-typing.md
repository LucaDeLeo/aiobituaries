# Step 03: Fix xScale Typing

## Objective
Replace `any` type for `xScale` prop in BackgroundChart with proper Visx type.

## Problem
- `src/components/visualization/background-chart.tsx` line 16 has:
  ```typescript
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xScale: any
  ```
- This loses type safety on scale usage

## Files to Modify

### 1. src/components/visualization/background-chart.tsx

**Add import:**
```typescript
import type { ScaleTime } from 'd3-scale'
```

**Update interface (around line 10-20):**

**Before:**
```typescript
export interface BackgroundChartProps {
  metrics: AIMetricSeries[]
  enabledMetrics: MetricType[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xScale: any
  yScale: LogScale
  innerHeight: number
}
```

**After:**
```typescript
export interface BackgroundChartProps {
  metrics: AIMetricSeries[]
  enabledMetrics: MetricType[]
  /** Time scale for X-axis positioning */
  xScale: ScaleTime<number, number>
  yScale: LogScale
  innerHeight: number
}
```

**Remove the eslint-disable comment.**

## Acceptance Criteria

- [ ] `xScale` has proper type `ScaleTime<number, number>`
- [ ] No `any` type or eslint-disable comment
- [ ] Build passes with no type errors
- [ ] Existing tests pass

## Test Commands
```bash
bun run build
bun vitest run tests/unit/components/visualization/
```

## Notes
- `ScaleTime` is from `d3-scale` which is a dependency of `@visx/scale`
- The type parameters `<number, number>` represent domain and range output types
