# Step 04: Deduplicate Category Constants

## Objective
Remove duplicated category constants and replace deprecated `CATEGORY_LABELS` usage.

## Problem
1. `CATEGORY_VALUES` in `use-visualization-state.ts` duplicates `CATEGORY_ORDER`
2. `CATEGORY_LABELS` is marked deprecated but still used in `category-filter.tsx`

## Files to Modify

### 1. src/lib/hooks/use-visualization-state.ts

**Remove local constant and import from categories:**

**Before (around line 41):**
```typescript
// Category values as const array for parseAsStringLiteral
const CATEGORY_VALUES = ['capability', 'market', 'agi', 'dismissive'] as const
```

**After:**
```typescript
import { CATEGORY_ORDER } from '@/lib/constants/categories'
```

**Update parser (around line 62-64):**

**Before:**
```typescript
const categoryParser = parseAsArrayOf(
  parseAsStringLiteral(CATEGORY_VALUES)
).withDefault([])
```

**After:**
```typescript
const categoryParser = parseAsArrayOf(
  parseAsStringLiteral(CATEGORY_ORDER)
).withDefault([])
```

### 2. src/components/filters/category-filter.tsx

**Update import (line 5):**

**Before:**
```typescript
import { CATEGORY_ORDER, getCategory, CATEGORY_LABELS } from '@/lib/constants/categories'
```

**After:**
```typescript
import { CATEGORY_ORDER, getCategory, getCategoryLabel } from '@/lib/constants/categories'
```

**Update usages (around lines 82-88):**

**Before:**
```typescript
const categoryLabel = CATEGORY_LABELS[activeCategories[0]]
// ...
const categoryLabels = activeCategories
  .map((cat) => CATEGORY_LABELS[cat])
  .join(' and ')
```

**After:**
```typescript
const categoryLabel = getCategoryLabel(activeCategories[0])
// ...
const categoryLabels = activeCategories
  .map((cat) => getCategoryLabel(cat))
  .join(' and ')
```

## Acceptance Criteria

- [ ] `CATEGORY_VALUES` removed from use-visualization-state.ts
- [ ] `CATEGORY_ORDER` imported and used instead
- [ ] `CATEGORY_LABELS` not imported in category-filter.tsx
- [ ] `getCategoryLabel()` used instead
- [ ] Build passes
- [ ] Filter tests pass

## Test Commands
```bash
bun run build
bun vitest run tests/unit/lib/hooks/use-visualization-state.test.ts
bun vitest run tests/unit/lib/hooks/use-filters.test.ts
```

## Notes
- `CATEGORY_ORDER` is the canonical source of truth
- `getCategoryLabel()` provides the same functionality as the deprecated object
