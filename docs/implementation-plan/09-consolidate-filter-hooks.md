# Step 09: Consolidate Filter Hooks (Quick Fix)

## Objective
Ensure `useFilters` and `useVisualizationState` share constants to prevent drift.

## Problem
- `useFilters` uses `CATEGORY_ORDER` for category validation
- `useVisualizationState` previously used local `CATEGORY_VALUES` (fixed in Step 04)
- Both hooks manage the `cat` URL parameter
- Potential for inconsistent behavior if implementations drift

## Current State After Step 04
After Step 04, both hooks should use `CATEGORY_ORDER`. This step verifies and documents the shared approach.

## Files to Review

### 1. src/lib/hooks/use-filters.ts
Should have:
```typescript
import { CATEGORY_ORDER } from '@/lib/constants/categories'

const categoryParser = parseAsArrayOf(
  parseAsStringLiteral(CATEGORY_ORDER)
).withDefault([])
```

### 2. src/lib/hooks/use-visualization-state.ts
After Step 04, should have:
```typescript
import { CATEGORY_ORDER } from '@/lib/constants/categories'

const categoryParser = parseAsArrayOf(
  parseAsStringLiteral(CATEGORY_ORDER)
).withDefault([])
```

## Verification Steps

1. Confirm both files import `CATEGORY_ORDER`
2. Confirm both use same parser pattern
3. Verify URL param name is consistent (`cat`)
4. Run tests for both hooks

## Optional Enhancement: Shared Parser

If more consolidation is desired, create a shared parser:

### src/lib/utils/url-parsers.ts (NEW, optional)
```typescript
import { parseAsArrayOf, parseAsStringLiteral } from 'nuqs'
import { CATEGORY_ORDER } from '@/lib/constants/categories'

/**
 * Shared URL parser for category array parameter.
 * Used by both useFilters and useVisualizationState.
 */
export const categoryParser = parseAsArrayOf(
  parseAsStringLiteral(CATEGORY_ORDER)
).withDefault([])
```

Then both hooks import from this shared location.

## Acceptance Criteria

- [ ] Both hooks use `CATEGORY_ORDER` (verified after Step 04)
- [ ] Both hooks use same URL param name (`cat`)
- [ ] Tests pass for both hooks
- [ ] No category-related bugs in URL state

## Test Commands
```bash
bun vitest run tests/unit/lib/hooks/use-filters.test.ts
bun vitest run tests/unit/lib/hooks/use-visualization-state.test.ts
```

## Manual Testing
1. On mobile view, filter by category - verify URL updates
2. Copy URL, open in desktop view - verify same filter applied
3. On desktop, change category - verify URL consistent

## Notes
- This step is primarily verification after Step 04
- Full hook merge is deferred as it requires more architectural changes
- Current approach (shared constants) is sufficient for preventing drift
