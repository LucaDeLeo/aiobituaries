# Story 4-1: Category Data Model

**Story Key:** 4-1-category-data-model
**Epic:** Epic 4 - Category System & Filtering
**Status:** drafted
**Priority:** High

---

## User Story

**As a** developer,
**I want** categories consistently defined across the app,
**So that** colors and labels are uniform everywhere.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-4.1.1 | Four categories exist | Given the application runs, when categories are referenced anywhere, then four categories exist: capability, market, agi, dismissive |
| AC-4.1.2 | Category properties complete | Given category definitions are loaded, when I check properties, then each has id, label, description, color, colorVar |
| AC-4.1.3 | getCategoryColor works | Given I call getCategoryColor('market'), when function executes, then returns '#7B9E89' |
| AC-4.1.4 | getCategoryLabel works | Given I call getCategoryLabel('agi'), when function executes, then returns 'AGI Skepticism' |
| AC-4.1.5 | isValidCategory valid | Given I call isValidCategory('market'), when function executes, then returns true |
| AC-4.1.6 | isValidCategory invalid | Given I call isValidCategory('invalid'), when function executes, then returns false |

---

## Technical Approach

### Implementation Overview

Create a centralized category constants file that defines all four obituary categories with their associated metadata (ID, label, description, color, CSS variable name). This provides a single source of truth for category information used throughout the application - in timeline visualization dots, filter pills, chart bars, badges, and any other category-related UI.

### Key Implementation Details

1. **Category Definition Structure**
   - Define `CategoryDefinition` interface with all required properties
   - Create `CATEGORIES` constant as Record<Category, CategoryDefinition>
   - Use `as const` for full type inference
   - Export `CATEGORY_ORDER` array for consistent display ordering

2. **Utility Functions**
   - `getCategory(id)` - Get full category definition by ID
   - `getCategoryColor(id)` - Get hex color for category
   - `getCategoryLabel(id)` - Get human-readable label
   - `getAllCategories()` - Get ordered array of all definitions
   - `isValidCategory(value)` - Type guard for validating category strings

3. **Color Alignment**
   - Colors must match CSS variables already defined in globals.css:
     - `--category-capability: #C9A962` (gold)
     - `--category-market: #7B9E89` (sage)
     - `--category-agi: #9E7B7B` (rose)
     - `--category-dismissive: #7B7B9E` (lavender)
   - Include colorVar property for CSS variable reference

4. **Type Safety**
   - Category type already exists in `src/types/obituary.ts`
   - CategoryDefinition interface provides full typing
   - isValidCategory provides runtime type guard
   - All functions fully typed with return types

### Reference Implementation

```typescript
// src/lib/constants/categories.ts

import type { Category } from '@/types/obituary'

/**
 * Full category definition with metadata.
 */
export interface CategoryDefinition {
  /** Unique ID matching Sanity value */
  id: Category
  /** Human-readable label */
  label: string
  /** Short description for tooltips */
  description: string
  /** Hex color value (matches CSS variable) */
  color: string
  /** CSS variable name for color */
  colorVar: string
}

/**
 * Complete category definitions.
 *
 * IMPORTANT: Colors must match CSS variables in globals.css:
 *   --category-capability: #C9A962
 *   --category-market: #7B9E89
 *   --category-agi: #9E7B7B
 *   --category-dismissive: #7B7B9E
 */
export const CATEGORIES: Record<Category, CategoryDefinition> = {
  capability: {
    id: 'capability',
    label: 'Capability Doubt',
    description: 'Claims AI cannot do specific tasks',
    color: '#C9A962',
    colorVar: '--category-capability',
  },
  market: {
    id: 'market',
    label: 'Market/Bubble',
    description: 'AI is overhyped or a bubble',
    color: '#7B9E89',
    colorVar: '--category-market',
  },
  agi: {
    id: 'agi',
    label: 'AGI Skepticism',
    description: 'AGI is impossible or very far away',
    color: '#9E7B7B',
    colorVar: '--category-agi',
  },
  dismissive: {
    id: 'dismissive',
    label: 'Dismissive Framing',
    description: 'Casual dismissal or mockery of AI',
    color: '#7B7B9E',
    colorVar: '--category-dismissive',
  },
} as const

/**
 * Ordered array of categories for consistent display.
 */
export const CATEGORY_ORDER: Category[] = [
  'capability',
  'market',
  'agi',
  'dismissive',
]

/**
 * Get category definition by ID.
 */
export function getCategory(id: Category): CategoryDefinition {
  return CATEGORIES[id]
}

/**
 * Get category color by ID.
 */
export function getCategoryColor(id: Category): string {
  return CATEGORIES[id].color
}

/**
 * Get category label by ID.
 */
export function getCategoryLabel(id: Category): string {
  return CATEGORIES[id].label
}

/**
 * Get all categories as array.
 */
export function getAllCategories(): CategoryDefinition[] {
  return CATEGORY_ORDER.map(id => CATEGORIES[id])
}

/**
 * Check if a value is a valid category.
 */
export function isValidCategory(value: string): value is Category {
  return value in CATEGORIES
}
```

---

## Tasks

### Task 1: Create Categories Constants File (30 min)
- [x] Create directory `src/lib/constants/` if not exists
- [x] Create `src/lib/constants/categories.ts`
- [x] Define CategoryDefinition interface with all required properties:
  - id: Category
  - label: string
  - description: string
  - color: string
  - colorVar: string
- [x] Define CATEGORIES constant with all four categories:
  - capability: Capability Doubt, #C9A962, --category-capability
  - market: Market/Bubble, #7B9E89, --category-market
  - agi: AGI Skepticism, #9E7B7B, --category-agi
  - dismissive: Dismissive Framing, #7B7B9E, --category-dismissive
- [x] Add descriptions for tooltip usage:
  - capability: "Claims AI cannot do specific tasks"
  - market: "AI is overhyped or a bubble"
  - agi: "AGI is impossible or very far away"
  - dismissive: "Casual dismissal or mockery of AI"
- [x] Use `as const` for type inference
- [x] Define CATEGORY_ORDER array for consistent display order
- [x] Add JSDoc comments explaining color alignment with globals.css

### Task 2: Implement Utility Functions (20 min)
- [x] Implement getCategory(id) - returns full CategoryDefinition
- [x] Implement getCategoryColor(id) - returns hex color string
- [x] Implement getCategoryLabel(id) - returns label string
- [x] Implement getAllCategories() - returns ordered array of definitions
- [x] Implement isValidCategory(value) - type guard returning boolean
- [x] Add JSDoc comments to all functions
- [x] Ensure all functions have explicit return types

### Task 3: Verify CSS Variable Alignment (15 min)
- [x] Open `src/app/globals.css`
- [x] Verify category CSS variables exist:
  - --category-capability: #C9A962
  - --category-market: #7B9E89
  - --category-agi: #9E7B7B
  - --category-dismissive: #7B7B9E
- [x] If variables missing, add them to globals.css
- [x] Verify colors match between CSS and constants file
- [x] Test that colorVar property references correct variable name

### Task 4: Write Unit Tests (45 min)
- [x] Create directory `tests/unit/lib/constants/` if not exists
- [x] Create `tests/unit/lib/constants/categories.test.ts`
- [x] Test CATEGORIES constant:
  - Contains exactly 4 categories
  - All category IDs present (capability, market, agi, dismissive)
  - Each category has all required properties
  - Color format is valid hex (#XXXXXX)
  - colorVar format starts with --category-
- [x] Test CATEGORY_ORDER:
  - Contains exactly 4 elements
  - All elements are valid Category values
  - Order matches expected: capability, market, agi, dismissive
- [x] Test getCategoryColor:
  - Returns correct color for each category
  - capability -> #C9A962
  - market -> #7B9E89
  - agi -> #9E7B7B
  - dismissive -> #7B7B9E
- [x] Test getCategoryLabel:
  - Returns correct label for each category
  - capability -> 'Capability Doubt'
  - market -> 'Market/Bubble'
  - agi -> 'AGI Skepticism'
  - dismissive -> 'Dismissive Framing'
- [x] Test getCategory:
  - Returns full CategoryDefinition object
  - Object has all required properties
- [x] Test getAllCategories:
  - Returns array of length 4
  - Returns CategoryDefinition objects
  - Order matches CATEGORY_ORDER
- [x] Test isValidCategory:
  - Returns true for all valid categories
  - Returns false for 'invalid'
  - Returns false for empty string
  - Returns false for random string
  - Returns false for numbers (cast to string)

### Task 5: Export and Integration (10 min)
- [x] Create `src/lib/constants/index.ts` barrel export (optional) - Skipped, not needed
- [x] Verify all exports are accessible via import
- [x] Run lint to ensure no errors: `pnpm lint`
- [x] Run TypeScript check: `pnpm tsc --noEmit`
- [x] Run tests: `pnpm test tests/unit/lib/constants/categories.test.ts`
- [x] Verify all tests pass

### Task 6: Documentation (10 min)
- [x] Ensure all functions have JSDoc comments
- [x] Add usage examples in JSDoc where helpful
- [x] Document color alignment requirement in file header
- [x] Verify import paths work from components

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Category type | Required | Already exists in `src/types/obituary.ts` |
| globals.css | Required | Must contain category CSS variables |
| TypeScript | Required | For type definitions |
| Vitest | Required | For unit tests |

---

## Definition of Done

- [x] `src/lib/constants/categories.ts` created with all exports
- [x] CategoryDefinition interface defined
- [x] CATEGORIES constant with all 4 categories
- [x] CATEGORY_ORDER array for display ordering
- [x] getCategory function implemented and tested
- [x] getCategoryColor function implemented and tested
- [x] getCategoryLabel function implemented and tested
- [x] getAllCategories function implemented and tested
- [x] isValidCategory type guard implemented and tested
- [x] Colors match CSS variables in globals.css
- [x] All unit tests passing
- [x] No TypeScript errors (in categories.ts - pre-existing errors in other test files)
- [x] Lint passes (`pnpm lint`) - no errors in categories files
- [x] JSDoc comments on all exports

---

## Test Scenarios

### Unit Test Scenarios

1. **CATEGORIES Constant**
   - Verify 4 categories exist
   - Each has id, label, description, color, colorVar
   - Colors are valid hex format
   - colorVar references match variable names

2. **CATEGORY_ORDER Array**
   - Contains 4 elements
   - Order is capability, market, agi, dismissive
   - All elements are valid Category values

3. **getCategoryColor Function**
   - capability returns #C9A962
   - market returns #7B9E89
   - agi returns #9E7B7B
   - dismissive returns #7B7B9E

4. **getCategoryLabel Function**
   - capability returns 'Capability Doubt'
   - market returns 'Market/Bubble'
   - agi returns 'AGI Skepticism'
   - dismissive returns 'Dismissive Framing'

5. **getCategory Function**
   - Returns full CategoryDefinition object
   - Object has all required properties

6. **getAllCategories Function**
   - Returns array of 4 elements
   - Elements are CategoryDefinition objects
   - Order matches CATEGORY_ORDER

7. **isValidCategory Function**
   - Returns true for 'market', 'capability', 'agi', 'dismissive'
   - Returns false for 'invalid', '', random strings

### Manual Testing Checklist

- [ ] Import CATEGORIES in scatter-point.tsx and verify type works
- [ ] Import getCategoryColor and verify return type is string
- [ ] Import isValidCategory and verify type guard works
- [ ] Verify IDE autocomplete works for Category type
- [ ] Verify colors visually match CSS variables

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/constants/categories.ts` | Create | Category definitions and utility functions |
| `tests/unit/lib/constants/categories.test.ts` | Create | Unit tests for categories module |
| `src/app/globals.css` | Verify | Confirm category CSS variables exist |

---

## FR Coverage

This story satisfies the following Functional Requirements:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR14 | System categorizes obituaries into four types: Capability doubt, Market/bubble claims, AGI skepticism, Dismissive framing | Creates centralized CATEGORIES constant defining all four types with unique IDs, labels, descriptions, and colors. Provides utility functions for consistent access across the application. Type-safe Category type already exists in obituary.ts and is used as the source of truth. |

---

## Learnings from Previous Stories

From Story 3-8 (Animation Polish):
1. **Centralized Constants** - animation.ts pattern shows effective use of centralized constants (DURATIONS, SPRINGS)
2. **Utility Functions** - Small focused utility functions with clear purposes work well
3. **Type Safety** - Proper TypeScript typing prevents runtime errors

From Story 3-2 (Timeline Data Points):
1. **Color Usage** - getCategoryColor will be used by ScatterPoint for dot colors
2. **Category Array Handling** - Obituaries have categories[] array, need to handle multi-category items

From Story 2-2 (Obituary List Display):
1. **Category Badges** - Categories displayed as colored indicators need consistent colors
2. **Label Consistency** - Human-readable labels needed for UI display

From Epic 4 Tech Spec:
1. **CSS Variable Alignment** - Colors defined in categories.ts MUST match globals.css variables
2. **CATEGORY_ORDER** - Consistent ordering needed for filter bar and chart display
3. **Type Guard** - isValidCategory needed for URL parameter validation in Story 4.3

From Architecture Document:
1. **Category Colors** - Four distinct colors defined in UX Design Specification:
   - Capability (gold): #C9A962
   - Market (sage): #7B9E89
   - AGI (rose): #9E7B7B
   - Dismissive (lavender): #7B7B9E

---

## Dev Agent Record

### Context Reference

Story Context: `docs/sprint-artifacts/story-contexts/4-1-category-data-model-context.xml`

### Implementation Notes

Extended existing `src/lib/constants/categories.ts` with:
- `CategoryDefinition` interface with all required properties (id, label, description, color, colorVar)
- `CATEGORIES` constant as `Record<Category, CategoryDefinition>` with all 4 categories
- `CATEGORY_ORDER` array for consistent display ordering
- `getCategory(id)` - returns full CategoryDefinition by ID
- `getCategoryColor(id)` - returns hex color string
- `getCategoryLabel(id)` - returns human-readable label
- `getAllCategories()` - returns ordered array of CategoryDefinition
- `isValidCategory(value)` - type guard for validating category strings

Preserved existing `CATEGORY_COLORS` and `CATEGORY_LABELS` exports with `@deprecated` JSDoc tags for backward compatibility.

### Files Created

- `tests/unit/lib/constants/categories.test.ts` - 43 unit tests covering all acceptance criteria

### Files Modified

- `src/lib/constants/categories.ts` - Extended with CategoryDefinition interface, CATEGORIES constant, CATEGORY_ORDER array, and utility functions

### Deviations from Plan

- Kept existing `CATEGORY_COLORS` and `CATEGORY_LABELS` exports (marked as deprecated) for backward compatibility with existing code

### Issues Encountered

- Pre-existing TypeScript errors in `tests/unit/lib/sanity/queries.test.ts` and `tests/unit/lib/utils/seo.test.ts` (unrelated to this story)
- Pre-existing lint warning in `tests/unit/components/visualization/scatter-plot-pan.test.tsx` (unrelated to this story)

### Key Decisions

1. Added `@deprecated` JSDoc tags to legacy exports instead of removing them to avoid breaking existing code
2. Used `as const` on CATEGORIES for full type inference
3. Followed animation.ts pattern for JSDoc documentation style
4. All functions have explicit return types per development constraints

### Test Results

- 43 tests passing in `tests/unit/lib/constants/categories.test.ts`
- Full test suite: 428 tests passing

### Completion Timestamp

2025-11-30

---

_Story created: 2025-11-30_
_Epic: Category System & Filtering (Epic 4)_
_Sequence: 1 of 5 in Epic 4_

---

## Senior Developer Review (AI)

**Review Date:** 2025-11-30
**Reviewer:** Claude Code Review Agent
**Review Outcome:** APPROVED

### Executive Summary

Story 4-1 implementation is complete and meets all acceptance criteria. The code quality is excellent with comprehensive test coverage (43 tests), proper TypeScript typing, and thorough JSDoc documentation. The implementation follows established patterns from previous stories (animation.ts) and maintains backward compatibility with deprecated legacy exports.

### Acceptance Criteria Validation

| AC ID | Criterion | Status | Evidence |
|-------|-----------|--------|----------|
| AC-4.1.1 | CATEGORIES constant with all 4 categories | IMPLEMENTED | `/Users/luca/dev/aiobituaries/src/lib/constants/categories.ts:28-57` - CATEGORIES Record contains capability, market, agi, dismissive |
| AC-4.1.2 | CategoryDefinition interface with id, label, description, color, colorVar fields | IMPLEMENTED | `/Users/luca/dev/aiobituaries/src/lib/constants/categories.ts:6-17` - Interface defines all 5 required properties |
| AC-4.1.3 | getCategoryColor(category) returns correct hex color | IMPLEMENTED | `/Users/luca/dev/aiobituaries/src/lib/constants/categories.ts:83-85` - Returns '#7B9E89' for market, verified by tests |
| AC-4.1.4 | getCategoryLabel(category) returns display label | IMPLEMENTED | `/Users/luca/dev/aiobituaries/src/lib/constants/categories.ts:92-94` - Returns 'AGI Skepticism' for agi, verified by tests |
| AC-4.1.5 | isValidCategory(value) returns true for valid categories | IMPLEMENTED | `/Users/luca/dev/aiobituaries/src/lib/constants/categories.ts:109-111` - Type guard returns true for valid values |
| AC-4.1.6 | isValidCategory(value) returns false for invalid values | IMPLEMENTED | `/Users/luca/dev/aiobituaries/src/lib/constants/categories.ts:109-111` - Returns false for invalid/empty/random strings |

### Task Completion Validation

| Task | Status | Evidence |
|------|--------|----------|
| Task 1: Create Categories Constants File | VERIFIED | File exists at `src/lib/constants/categories.ts` with all required exports |
| Task 2: Implement Utility Functions | VERIFIED | All 5 utility functions implemented with JSDoc and explicit return types |
| Task 3: Verify CSS Variable Alignment | VERIFIED | Colors match globals.css:25-28 exactly |
| Task 4: Write Unit Tests | VERIFIED | 43 tests in `tests/unit/lib/constants/categories.test.ts` |
| Task 5: Export and Integration | VERIFIED | Lint passes, tests pass (43/43), exports accessible |
| Task 6: Documentation | VERIFIED | All functions have JSDoc comments with @param and @returns |

### Code Quality Assessment

**Strengths:**
- Clean TypeScript with proper typing (Category import from @/types/obituary)
- Comprehensive JSDoc documentation on all exports
- Backward compatibility preserved with @deprecated annotations
- Test coverage is thorough with edge cases
- Colors verified to match CSS variables in globals.css
- `as const` used for full type inference on CATEGORIES

**Architecture Alignment:**
- Follows established constant patterns from animation.ts
- Category type sourced from single source of truth (obituary.ts)
- Color values align with UX Design Specification

### Test Coverage Analysis

- **Total Tests:** 43
- **Pass Rate:** 100%
- **Coverage Areas:**
  - CATEGORIES constant structure (11 tests)
  - CATEGORY_ORDER array (3 tests)
  - getCategoryColor function (5 tests)
  - getCategoryLabel function (5 tests)
  - getCategory function (3 tests)
  - getAllCategories function (4 tests)
  - isValidCategory function (9 tests)
  - Legacy constants (3 tests)

### Security Notes

No security concerns identified. This is a pure constant/utility module with no external inputs or side effects.

### Issues Summary

| Severity | Count | Details |
|----------|-------|---------|
| CRITICAL | 0 | - |
| HIGH | 0 | - |
| MEDIUM | 0 | - |
| LOW | 0 | - |

### Pre-existing Issues (Not Story-Related)

The TypeScript check revealed pre-existing errors in:
- `tests/unit/lib/sanity/queries.test.ts` (14 errors)
- `tests/unit/lib/utils/seo.test.ts` (4 errors)

These errors existed before this story and do not affect the categories implementation.

### Final Verdict

**APPROVED** - All acceptance criteria implemented with evidence. Code quality excellent. Test coverage comprehensive. Ready for deployment.
