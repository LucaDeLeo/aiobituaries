# Story 4-5: Category Breakdown Chart

**Story Key:** 4-5-category-breakdown-chart
**Epic:** Epic 4 - Category System & Filtering
**Status:** drafted
**Priority:** High

---

## User Story

**As a** visitor,
**I want** to see the distribution of obituaries by category,
**So that** I understand what types of skepticism are most common.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-4.5.1 | Chart displays all categories | Given homepage is loaded, when chart is visible, then horizontal bar chart shows all 4 categories |
| AC-4.5.2 | Bars use category colors | Given chart renders, when I view bars, then each bar uses its category color (#C9A962, #7B9E89, #9E7B7B, #7B7B9E) |
| AC-4.5.3 | Count and percentage shown | Given chart renders, when I view labels, then count and percentage shown for each (e.g., "48 (31%)") |
| AC-4.5.4 | Sorted by count descending | Given chart renders, when I view order, then bars sorted by count (highest first) |
| AC-4.5.5 | Non-active categories dimmed | Given filters are active, when I view chart, then non-filtered categories appear dimmed (40% opacity) |
| AC-4.5.6 | Click toggles filter | Given chart is visible, when I click a bar, then that category is toggled in filter |
| AC-4.5.7 | Hover shows feedback | Given chart is visible, when I hover a bar, then bar shows hover state (text color change) |
| AC-4.5.8 | Bars animate on load | Given page loads, when chart appears, then bars animate in (grow from 0 width) |

---

## Technical Approach

### Implementation Overview

Create a `CategoryChart` component that displays a horizontal bar chart showing the distribution of obituaries by category. The component should:

1. Count obituaries per category (client-side computation from data prop)
2. Display horizontal bars with category colors
3. Show count and percentage labels
4. Support click-to-filter interaction
5. Respect active filter state (dim non-active categories)
6. Animate bars on mount

### Key Implementation Details

1. **Component Structure**
   - Create `src/components/visualization/category-chart.tsx`
   - Client component ('use client') for interactivity and animations
   - Use CSS-based bars (no Visx needed - simpler implementation)

2. **Props Interface**
   ```typescript
   interface CategoryChartProps {
     obituaries: { categories: Category[] }[]
     activeCategories?: Category[]
     onCategoryClick?: (category: Category) => void
   }
   ```

3. **Category Counting Logic**
   - Use `useMemo` to compute counts from obituaries prop
   - Handle multi-category obituaries (count each category separately)
   - Calculate percentages based on total obituaries
   - Sort by count descending

4. **Visual Design**
   - Horizontal bar chart with labels on left
   - Bars grow from left to right
   - Use category colors from constants
   - Show count (percentage) on right side of each row

5. **Interactivity**
   - Click handler calls `onCategoryClick` prop
   - Hover state changes text from `--text-secondary` to `--text-primary`
   - Active filters dim non-matching bars to 40% opacity

6. **Animation**
   - Use Motion for bar width animation
   - Stagger animation by index (0.1s per bar)
   - Duration: 0.5s for bar growth

### Reference Implementation

```tsx
// src/components/visualization/category-chart.tsx
'use client'

import { useMemo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CATEGORY_ORDER, getCategory } from '@/lib/constants/categories'
import type { Category } from '@/types/obituary'

interface CategoryChartProps {
  obituaries: { categories: Category[] }[]
  activeCategories?: Category[]
  onCategoryClick?: (category: Category) => void
}

export function CategoryChart({
  obituaries,
  activeCategories = [],
  onCategoryClick,
}: CategoryChartProps) {
  // Count obituaries per category
  const counts = useMemo(() => {
    const result: Record<Category, number> = {
      capability: 0,
      market: 0,
      agi: 0,
      dismissive: 0,
    }

    obituaries.forEach(ob => {
      ob.categories.forEach(cat => {
        if (cat in result) {
          result[cat]++
        }
      })
    })

    return result
  }, [obituaries])

  const total = obituaries.length
  const maxCount = Math.max(...Object.values(counts))

  // Sort by count descending
  const sortedCategories = useMemo(() => {
    return [...CATEGORY_ORDER].sort((a, b) => counts[b] - counts[a])
  }, [counts])

  return (
    <div
      data-testid="category-chart"
      className="space-y-3"
    >
      {sortedCategories.map((categoryId, index) => {
        const category = getCategory(categoryId)
        const count = counts[categoryId]
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
        const isActive = activeCategories.length === 0 || activeCategories.includes(categoryId)

        return (
          <motion.button
            key={categoryId}
            data-testid={`category-bar-${categoryId}`}
            className={cn(
              'w-full text-left group',
              'transition-opacity',
              isActive ? 'opacity-100' : 'opacity-40'
            )}
            onClick={() => onCategoryClick?.(categoryId)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isActive ? 1 : 0.4, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between mb-1">
              <span className="text-sm text-[--text-secondary] group-hover:text-[--text-primary] transition-colors">
                {category.label}
              </span>
              <span className="text-sm text-[--text-muted]">
                {count} ({percentage}%)
              </span>
            </div>
            <div className="h-2 bg-[--bg-tertiary] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: category.color }}
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
```

### Integration in HomeClient

```tsx
// src/app/home-client.tsx (addition to existing component)
import { CategoryChart } from '@/components/visualization/category-chart'

// Inside HomeClient component render:
<section className="max-w-md mx-auto px-4 py-8">
  <h2 className="text-lg font-semibold mb-4 text-[--text-primary]">
    Category Breakdown
  </h2>
  <CategoryChart
    obituaries={obituaries}
    activeCategories={categories}
    onCategoryClick={toggleCategory}
  />
</section>
```

---

## Tasks

### Task 1: Create CategoryChart Component File (20 min)
- [x] Create `src/components/visualization/category-chart.tsx`
- [x] Add 'use client' directive
- [x] Import required dependencies (motion, useMemo, cn, category constants)
- [x] Define `CategoryChartProps` interface
- [x] Export `CategoryChart` function component

### Task 2: Implement Category Counting Logic (15 min)
- [x] Create `counts` useMemo that initializes all 4 categories to 0
- [x] Iterate through obituaries and count each category
- [x] Handle obituaries with multiple categories (count each separately)
- [x] Calculate `total` (number of obituaries)
- [x] Calculate `maxCount` for bar width scaling

### Task 3: Implement Sorted Categories (10 min)
- [x] Create `sortedCategories` useMemo
- [x] Sort CATEGORY_ORDER by counts descending
- [x] Verify sort returns highest count first

### Task 4: Implement Bar Rendering (25 min)
- [x] Map over sortedCategories to render each bar
- [x] Add `data-testid="category-chart"` to container
- [x] Add `data-testid="category-bar-{categoryId}"` to each bar button
- [x] Calculate `percentage` as `Math.round((count / total) * 100)`
- [x] Calculate `barWidth` as `(count / maxCount) * 100`
- [x] Render category label on left
- [x] Render count and percentage on right
- [x] Render bar with category color

### Task 5: Implement Active/Inactive State (15 min)
- [x] Calculate `isActive` based on activeCategories prop
- [x] When activeCategories is empty, all categories are active
- [x] When activeCategories has values, only matching categories are active
- [x] Apply `opacity-40` class to inactive categories
- [x] Ensure transition-opacity class is present for smooth changes

### Task 6: Implement Click Handler (10 min)
- [x] Add onClick handler to each bar button
- [x] Call `onCategoryClick?.(categoryId)` on click
- [x] Verify button is accessible (implicit button role)

### Task 7: Implement Hover State (10 min)
- [x] Add `group` class to button for group-hover
- [x] Add `group-hover:text-[--text-primary]` to label span
- [x] Add `transition-colors` for smooth transition
- [x] Verify hover changes label color from secondary to primary

### Task 8: Implement Animation (15 min)
- [x] Add Motion `motion.button` wrapper with initial/animate
- [x] Initial state: `{ opacity: 0, x: -20 }`
- [x] Animate state: `{ opacity: isActive ? 1 : 0.4, x: 0 }`
- [x] Add stagger delay: `delay: index * 0.1`
- [x] Add `motion.div` for bar with width animation
- [x] Bar initial: `{ width: 0 }`
- [x] Bar animate: `{ width: \`${barWidth}%\` }`
- [x] Bar transition: `{ duration: 0.5, delay: index * 0.1 }`

### Task 9: Integrate in HomeClient (15 min)
- [x] Open `src/app/home-client.tsx`
- [x] Import `CategoryChart` component
- [x] Add section below timeline for category breakdown
- [x] Pass `obituaries`, `activeCategories={categories}`, `onCategoryClick={toggleCategory}`
- [x] Style section with `max-w-md mx-auto px-4 py-8`
- [x] Add heading "Category Breakdown"

### Task 10: Write Unit Tests (45 min)
- [x] Create `tests/unit/components/visualization/category-chart.test.tsx`
- [x] Test: renders all 4 category bars
- [x] Test: displays correct count and percentage
- [x] Test: bars sorted by count descending
- [x] Test: calls onCategoryClick when bar clicked
- [x] Test: inactive categories have opacity-40 class
- [x] Test: empty activeCategories shows all at full opacity

### Task 11: Run Quality Checks (15 min)
- [x] Run TypeScript check: `pnpm tsc --noEmit`
- [x] Run lint: `pnpm lint`
- [x] Run tests: `pnpm test:run`
- [x] Fix any errors or warnings
- [x] Verify all tests pass

### Task 12: Manual Testing (15 min)
- [ ] Start dev server: `pnpm dev`
- [ ] Open homepage with data
- [ ] Verify chart displays below timeline
- [ ] Verify bars are sorted by count (highest first)
- [ ] Verify count and percentage displayed correctly
- [ ] Verify bars use category colors
- [ ] Click a bar - verify filter toggles
- [ ] Verify inactive categories are dimmed
- [ ] Verify hover changes text color
- [ ] Verify bars animate on initial load

### Task 13: Update Sprint Status (5 min)
- [x] Open `docs/sprint-artifacts/sprint-status.yaml`
- [x] Update `4-5-category-breakdown-chart: backlog` to `4-5-category-breakdown-chart: drafted` (done by this file creation)
- [x] When implementation complete, update to `review`

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Story 4-1 (Category Data Model) | Completed | CATEGORY_ORDER, getCategory functions |
| Story 4-2 (Category Filter Bar) | Completed | Filter UI pattern reference |
| Story 4-3 (URL State with nuqs) | Completed | useFilters hook for integration |
| Story 4-4 (Filter Effect on Timeline) | Completed | activeCategories prop pattern |
| HomeClient component | Existing | Integration point for chart |
| Motion library | Existing | Animation framework |
| cn utility | Existing | Class name merging |

---

## Definition of Done

- [x] CategoryChart component created at `src/components/visualization/category-chart.tsx`
- [x] Component displays horizontal bar chart with all 4 categories
- [x] Bars use correct category colors
- [x] Count and percentage labels displayed
- [x] Bars sorted by count (highest first)
- [x] Click handler calls onCategoryClick prop
- [x] Active filter state dims non-matching categories to 40% opacity
- [x] Hover state changes label text color
- [x] Bars animate in on mount (grow from 0 width)
- [x] Chart integrated in HomeClient below timeline
- [x] data-testid attributes added for testing
- [x] Unit tests written and passing
- [x] No TypeScript errors
- [x] Lint passes (`pnpm lint`)
- [ ] Manual testing confirms all acceptance criteria
- [x] Sprint status updated

---

## Test Scenarios

### Unit Test Scenarios

1. **CategoryChart Rendering**
   - Renders container with data-testid="category-chart"
   - Renders 4 category bars with data-testid="category-bar-{id}"
   - Each bar shows category label
   - Each bar shows count and percentage

2. **Category Counting**
   - Correctly counts single-category obituaries
   - Correctly counts multi-category obituaries
   - Handles empty obituaries array
   - Calculates correct percentages

3. **Sorting**
   - Bars sorted by count descending
   - Highest count appears first
   - Equal counts maintain stable order

4. **Interactivity**
   - Calls onCategoryClick with correct category ID
   - Does not error if onCategoryClick not provided

5. **Active/Inactive State**
   - All bars full opacity when activeCategories empty
   - Only matching bars full opacity when filtered
   - Non-matching bars have opacity-40 class

### Manual Testing Checklist

- [ ] Chart visible below timeline on homepage
- [ ] Bars use correct category colors (gold, sage, rose, lavender)
- [ ] Bars sorted by count (highest first)
- [ ] Count and percentage displayed (e.g., "48 (31%)")
- [ ] Click bar - filter toggles in URL
- [ ] Click same bar again - filter removed
- [ ] When filtered, non-matching bars are dimmed
- [ ] Hover bar - label text changes color
- [ ] On page load, bars animate in (grow from left)

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/visualization/category-chart.tsx` | Create | Category breakdown chart component |
| `src/app/home-client.tsx` | Modify | Add CategoryChart section below timeline |
| `tests/unit/components/visualization/category-chart.test.tsx` | Create | Unit tests for chart component |
| `docs/sprint-artifacts/sprint-status.yaml` | Modify | Update 4-5 status: backlog -> drafted -> review |

---

## FR Coverage

This story satisfies the following Functional Requirements:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR16 | System displays category breakdown visualization (chart showing distribution) | CategoryChart component displays horizontal bar chart showing count and percentage per category; bars use category colors; sorted by count descending; interactive click-to-filter; respects active filter state |

---

## Learnings from Previous Stories

From Story 4-4 (Filter Effect on Timeline):
1. **Active State Pattern** - `isActive = activeCategories.length === 0 || activeCategories.includes(categoryId)`
2. **Opacity Values** - Use 40% (0.4) for inactive, 100% (1) for active
3. **Transition Pattern** - Use transition classes for smooth opacity changes

From Story 4-3 (URL State with nuqs):
1. **toggleCategory Function** - Available from useFilters hook for click-to-filter
2. **categories Array** - Pass as activeCategories prop

From Story 4-2 (Category Filter Bar):
1. **Category Constants** - Use CATEGORY_ORDER and getCategory from constants
2. **Color Pattern** - Access via category.color property
3. **Label Pattern** - Access via category.label property

From Story 4-1 (Category Data Model):
1. **Category Type** - Import from @/types/obituary
2. **Category Colors** - capability=#C9A962, market=#7B9E89, agi=#9E7B7B, dismissive=#7B7B9E

From Epic 4 Tech Spec:
1. **Chart Design** - Horizontal bar chart, compact, sorted by count
2. **Interactivity** - Click toggles filter, hover shows feedback
3. **Animation** - Bars grow on load
4. **data-testid** - category-chart container, category-bar-{id} per bar

---

## Dev Agent Record

### Context Reference

Story Context: `docs/sprint-artifacts/story-contexts/4-5-category-breakdown-chart-context.xml`

### Implementation Notes

- Created CategoryChart component following the reference implementation from the story file
- Used useMemo for both counts and sortedCategories calculations for performance
- Implemented active state logic: `isActive = activeCategories.length === 0 || activeCategories.includes(categoryId)`
- Bar width scaled to maxCount (not total) so highest bar is always 100% width
- Motion animations with 0.5s duration and 0.1s stagger delay per bar
- Added cursor-pointer class for better UX feedback
- Integrated into HomeClient below ScatterPlot section

### Files Created

- `src/components/visualization/category-chart.tsx` - CategoryChart component with horizontal bar chart
- `tests/unit/components/visualization/category-chart.test.tsx` - 40 unit tests covering all functionality

### Files Modified

- `src/app/home-client.tsx` - Added CategoryChart section with heading below ScatterPlot
- `docs/sprint-artifacts/sprint-status.yaml` - Updated 4-5 status: drafted -> in-progress -> review

### Deviations from Plan

None - implementation closely follows the reference implementation and story context.

### Issues Encountered

- Test floating-point precision issue with stagger delay calculation (0.3 vs 0.30000000000000004) - Fixed by using toBeCloseTo for floating point comparison
- Build command fails due to network issues fetching Google Fonts - unrelated to code changes, infrastructure issue

### Key Decisions

1. Used CSS-based bars with Motion animation (as specified, no Visx needed)
2. Percentage calculation uses `obituaries.length` as total (not sum of counts) per spec
3. Bar width uses `maxCount` as denominator so highest bar is always 100%
4. Hover state uses group/group-hover pattern for efficient styling

### Test Results

- **40 tests passing** in category-chart.test.tsx
- **562 total tests passing** in full test suite
- TypeScript: No errors in new/modified files
- Lint: No errors (only pre-existing warning in unrelated file)

### Completion Timestamp

2025-11-30

---

_Story created: 2025-11-30_
_Epic: Category System & Filtering (Epic 4)_
_Sequence: 5 of 5 in Epic 4 (Final story)_
