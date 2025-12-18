# Step 05: Derive Year Bounds from Data

## Objective
Replace hard-coded `MAX_YEAR = 2025` with a value derived from the actual metrics data.

## Problem
- `src/lib/hooks/use-visualization-state.ts` has:
  ```typescript
  const MIN_YEAR = 1950
  const MAX_YEAR = 2025
  ```
- Every time Epoch data updates, this needs manual editing
- Risk of stale bounds

## Files to Modify

### 1. src/data/ai-metrics.ts

**Add helper function at the end of file:**

```typescript
/**
 * Get the maximum year from the training compute frontier data.
 * Used to dynamically set URL state bounds.
 *
 * @returns The year of the most recent data point (e.g., 2025)
 */
export function getMaxDataYear(): number {
  const lastPoint = trainingComputeFrontier.data.at(-1)
  if (lastPoint) {
    return new Date(lastPoint.date).getFullYear()
  }
  // Fallback if data is empty (shouldn't happen)
  return new Date().getFullYear()
}

/**
 * Get the minimum year from the training compute frontier data.
 *
 * @returns The year of the earliest data point
 */
export function getMinDataYear(): number {
  const firstPoint = trainingComputeFrontier.data[0]
  if (firstPoint) {
    return new Date(firstPoint.date).getFullYear()
  }
  return 1950
}
```

### 2. src/lib/hooks/use-visualization-state.ts

**Add import:**
```typescript
import { getMaxDataYear } from '@/data/ai-metrics'
```

**Update constants:**

**Before:**
```typescript
// Date range constraints
const MIN_YEAR = 1950
const MAX_YEAR = 2025
const DEFAULT_FROM = 2010
const DEFAULT_TO = 2025
```

**After:**
```typescript
// Date range constraints - MAX_YEAR derived from actual data
const MIN_YEAR = 1950
const MAX_YEAR = getMaxDataYear()
const DEFAULT_FROM = 2010
const DEFAULT_TO = MAX_YEAR
```

## Acceptance Criteria

- [ ] `getMaxDataYear()` exported from ai-metrics.ts
- [ ] `MAX_YEAR` uses dynamic value
- [ ] `DEFAULT_TO` uses `MAX_YEAR`
- [ ] Build passes
- [ ] Visualization state tests pass

## Test Commands
```bash
bun run build
bun vitest run tests/unit/lib/hooks/use-visualization-state.test.ts
bun vitest run tests/unit/data/
```

## Notes
- MIN_YEAR stays hardcoded (1950 is a reasonable historical bound)
- The dynamic MAX_YEAR means data updates automatically extend the range
- DEFAULT_TO matches MAX_YEAR for best initial view
