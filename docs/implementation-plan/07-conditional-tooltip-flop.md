# Step 07: Conditional Tooltip FLOP Display

## Objective
Only show "AI Progress: X FLOP" in tooltip when the compute metric is enabled.

## Problem
- `tooltip-card.tsx` always shows FLOP value
- When compute metric is disabled in controls, showing FLOP is confusing
- UX inconsistency with the metric toggle feature

## Files to Modify

### 1. src/components/visualization/tooltip-card.tsx

**Update interface (around line 10):**

**Before:**
```typescript
export interface TooltipCardProps {
  obituary: ObituarySummary
  x: number
  y: number
  containerBounds: DOMRect
}
```

**After:**
```typescript
export interface TooltipCardProps {
  obituary: ObituarySummary
  x: number
  y: number
  containerBounds: DOMRect
  /** Whether to show the FLOP value (compute metric enabled) */
  showFlop?: boolean
}
```

**Update component signature:**

**Before:**
```typescript
export function TooltipCard({ obituary, x, y, containerBounds }: TooltipCardProps) {
```

**After:**
```typescript
export function TooltipCard({ obituary, x, y, containerBounds, showFlop = true }: TooltipCardProps) {
```

**Conditionally render FLOP section (around lines 116-119):**

**Before:**
```typescript
{/* AI Progress (FLOP value at date) */}
<div className="text-[11px] text-[var(--text-muted)] mt-2 font-mono">
  AI Progress: {formattedFlop} FLOP
</div>
```

**After:**
```typescript
{/* AI Progress (FLOP value at date) - only shown when compute metric enabled */}
{showFlop && (
  <div className="text-[11px] text-[var(--text-muted)] mt-2 font-mono">
    AI Progress: {formattedFlop} FLOP
  </div>
)}
```

### 2. src/components/visualization/scatter-plot.tsx

Find where TooltipCard is rendered and pass the prop.

**Locate the TooltipCard usage** (search for `<TooltipCard`):

**Before:**
```typescript
<TooltipCard
  obituary={hoveredObituary}
  x={tooltipPosition.x}
  y={tooltipPosition.y}
  containerBounds={containerBounds}
/>
```

**After:**
```typescript
<TooltipCard
  obituary={hoveredObituary}
  x={tooltipPosition.x}
  y={tooltipPosition.y}
  containerBounds={containerBounds}
  showFlop={enabledMetrics?.includes('compute') ?? true}
/>
```

Note: `enabledMetrics` should already be available as a prop to ScatterPlot.

## Acceptance Criteria

- [ ] `showFlop` prop added to TooltipCardProps
- [ ] FLOP line only renders when `showFlop` is true
- [ ] ScatterPlot passes `showFlop` based on `enabledMetrics`
- [ ] Default behavior unchanged (showFlop defaults to true)
- [ ] Build passes
- [ ] Tooltip tests pass

## Test Commands
```bash
bun run build
bun vitest run tests/unit/components/visualization/tooltip-card.test.ts
bun vitest run tests/unit/components/visualization/scatter-plot.test.tsx
```

## Manual Testing
1. Load homepage with desktop view
2. Verify tooltip shows FLOP when "Training Compute" is checked
3. Uncheck "Training Compute" in controls
4. Hover over a point - FLOP line should not appear
5. Re-check "Training Compute" - FLOP should appear again
