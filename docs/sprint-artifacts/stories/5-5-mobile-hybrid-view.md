# Story 5-5: Mobile Hybrid View

**Story Key:** 5-5-mobile-hybrid-view
**Epic:** Epic 5 - Navigation & Responsive Experience
**Status:** drafted
**Priority:** High

---

## User Story

**As a** mobile visitor,
**I want** an optimized timeline view designed for small screens,
**So that** I can explore the obituary archive comfortably on my phone without zooming or scrolling horizontally.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-5.5.1 | Mobile view shows density bar | Given I am viewing the homepage on a mobile device (< 768px), when the page renders, then I see a density bar showing distribution of obituaries over time |
| AC-5.5.2 | Mobile view shows card list | Given I am viewing the homepage on a mobile device (< 768px), when the page renders, then below the density bar I see a vertical scrollable list of obituary cards |
| AC-5.5.3 | Density bar shows visual distribution | Given the density bar is displayed, when I view it, then each time period (month) is represented by a vertical bar whose height indicates the count of obituaries in that period |
| AC-5.5.4 | Tapping density bar filters by period | Given the density bar is displayed, when I tap on a bar representing a specific time period, then the card list filters to show only obituaries from that period |
| AC-5.5.5 | Cards show essential information | Given the card list is displayed, when I view a card, then it shows the claim preview, source name, publication date, and category badges |
| AC-5.5.6 | Tapping card opens modal | Given the card list is displayed, when I tap on an obituary card, then the ObituaryModal opens from the bottom as a sheet |
| AC-5.5.7 | Filter bar is sticky | Given I am scrolling the card list, when I scroll down, then the CategoryFilter bar remains visible and sticky at the top or bottom of the viewport |
| AC-5.5.8 | Vertical scroll is smooth | Given the card list contains many obituaries, when I scroll the list vertically, then scrolling is smooth at 60fps with no jank |
| AC-5.5.9 | Empty state shows helpful message | Given I have applied filters that match zero obituaries, when the filtered card list is empty, then I see a message "No obituaries match your filters" with a link to clear filters |
| AC-5.5.10 | Desktop view shows timeline | Given I am viewing the homepage on desktop (>= 1024px), when the page renders, then I see the full horizontal ScatterPlot timeline, not the mobile hybrid view |
| AC-5.5.11 | Year labels on density bar | Given the density bar is displayed, when I view it, then I see year labels below the bars to indicate the time span |
| AC-5.5.12 | Clear date filter option | Given I have tapped a density bar to filter by date, when I view the interface, then I see a "Clear date filter" link that removes the date filter |

---

## Technical Approach

### Implementation Overview

Create a mobile-first hybrid view that replaces the horizontal ScatterPlot on small screens (< 768px) with a density bar + vertical card list combination. The density bar provides a visual overview of obituary distribution over time, while the card list enables easy browsing and tapping. On desktop (>= 1024px), the existing ScatterPlot remains unchanged.

### Key Implementation Details

1. **MobileTimeline Component**
   - Container component coordinating DensityBar and MobileCardList
   - Manages state: selectedObituary (for modal) and dateFilter (for density bar tap)
   - Filters obituaries by activeCategories (from URL) and optional dateFilter (from density bar)
   - Renders ObituaryModal with side="bottom" for mobile sheet

2. **DensityBar Component**
   - Calculates density by month using useMemo
   - Renders vertical bars (height = count / maxCount * 48px)
   - Minimum height 2px for months with 0 obituaries (visual continuity)
   - Tappable bars trigger onPeriodSelect with date range
   - Displays year labels below bars
   - Shows "Clear date filter" link when active period is set

3. **MobileCardList Component**
   - Renders vertical scrollable list of ObituaryCard components
   - Each card wrapped in button for tap handling
   - Empty state with message + link to clear filters
   - Uses flex-1 overflow-y-auto for smooth scrolling

4. **Homepage Layout Integration**
   - Modify `src/app/page.tsx` to show different views per breakpoint
   - Desktop/Tablet (>= 768px): `<div className="hidden md:flex">` wraps ScatterPlot
   - Mobile (< 768px): `<div className="md:hidden flex">` wraps MobileTimeline
   - CategoryFilter positioned differently per breakpoint (fixed bottom on desktop, sticky bottom on mobile)

5. **ObituaryModal Enhancement**
   - Already supports `side` prop from Epic 3
   - Mobile: side="bottom" (sheet from bottom)
   - Desktop: side="right" (sheet from right)

### Reference Implementation

```typescript
// src/components/mobile/mobile-timeline.tsx

'use client'

import { useState } from 'react'
import { DensityBar } from './density-bar'
import { MobileCardList } from './mobile-card-list'
import { ObituaryModal } from '@/components/obituary/obituary-modal'
import type { Obituary } from '@/types/obituary'

interface MobileTimelineProps {
  obituaries: Obituary[]
  activeCategories: string[]
}

export function MobileTimeline({ obituaries, activeCategories }: MobileTimelineProps) {
  const [selectedObituary, setSelectedObituary] = useState<Obituary | null>(null)
  const [dateFilter, setDateFilter] = useState<{ start?: Date; end?: Date } | null>(null)

  // Filter obituaries by category and optional date range
  const filteredObituaries = obituaries.filter(ob => {
    // Category filter
    if (activeCategories.length > 0 &&
        !ob.categories.some(c => activeCategories.includes(c))) {
      return false
    }
    // Date filter from density bar tap
    if (dateFilter) {
      const date = new Date(ob.date)
      if (dateFilter.start && date < dateFilter.start) return false
      if (dateFilter.end && date > dateFilter.end) return false
    }
    return true
  })

  return (
    <div className="flex flex-col h-full">
      {/* Density Bar */}
      <DensityBar
        obituaries={obituaries}
        activeCategories={activeCategories}
        onPeriodSelect={setDateFilter}
        activePeriod={dateFilter}
      />

      {/* Card List */}
      <MobileCardList
        obituaries={filteredObituaries}
        onSelect={setSelectedObituary}
      />

      {/* Bottom Sheet Modal */}
      {selectedObituary && (
        <ObituaryModal
          obituary={selectedObituary}
          isOpen={!!selectedObituary}
          onClose={() => setSelectedObituary(null)}
          side="bottom"
        />
      )}
    </div>
  )
}
```

```typescript
// src/components/mobile/density-bar.tsx

'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import type { Obituary } from '@/types/obituary'

interface DensityBarProps {
  obituaries: Obituary[]
  activeCategories: string[]
  onPeriodSelect: (period: { start: Date; end: Date } | null) => void
  activePeriod: { start?: Date; end?: Date } | null
}

export function DensityBar({
  obituaries,
  activeCategories,
  onPeriodSelect,
  activePeriod
}: DensityBarProps) {
  // Calculate density by month
  const { density, years, maxCount } = useMemo(() => {
    const counts: Record<string, number> = {}

    obituaries.forEach(ob => {
      // Apply category filter
      if (activeCategories.length > 0 &&
          !ob.categories.some(c => activeCategories.includes(c))) {
        return
      }

      const date = new Date(ob.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      counts[key] = (counts[key] || 0) + 1
    })

    // Get year range
    const dates = obituaries.map(ob => new Date(ob.date))
    const minYear = Math.min(...dates.map(d => d.getFullYear()))
    const maxYear = Math.max(...dates.map(d => d.getFullYear()))
    const years = Array.from(
      { length: maxYear - minYear + 1 },
      (_, i) => minYear + i
    )

    // Build density array (12 months per year)
    const density: { month: string; year: number; count: number }[] = []
    years.forEach(year => {
      for (let month = 0; month < 12; month++) {
        const key = `${year}-${month}`
        density.push({
          month: key,
          year,
          count: counts[key] || 0
        })
      }
    })

    const maxCount = Math.max(...Object.values(counts), 1)

    return { density, years, maxCount }
  }, [obituaries, activeCategories])

  return (
    <div className="px-4 py-3 bg-[--bg-secondary] border-b border-[--border]">
      {/* Density Bars */}
      <div className="flex items-end gap-[2px] h-12 mb-2">
        {density.map(({ month, count }) => {
          const height = count > 0 ? Math.max(4, (count / maxCount) * 48) : 2
          const [year, monthNum] = month.split('-').map(Number)
          const monthDate = new Date(year, monthNum)

          return (
            <button
              key={month}
              className={cn(
                "flex-1 min-w-[2px] rounded-t transition-colors",
                count > 0
                  ? "bg-[--accent-primary] hover:bg-[--accent-primary]/80"
                  : "bg-[--border]"
              )}
              style={{ height: `${height}px` }}
              onClick={() => {
                const start = new Date(year, monthNum, 1)
                const end = new Date(year, monthNum + 1, 0)
                onPeriodSelect({ start, end })
              }}
              aria-label={`${count} obituaries in ${monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
            />
          )
        })}
      </div>

      {/* Year Labels */}
      <div className="flex justify-between text-xs text-[--text-muted]">
        {years.map(year => (
          <span key={year}>{year}</span>
        ))}
      </div>

      {/* Active period indicator */}
      {activePeriod && (
        <button
          onClick={() => onPeriodSelect(null)}
          className="mt-2 text-xs text-[--accent-primary] underline"
        >
          Clear date filter
        </button>
      )}
    </div>
  )
}
```

```typescript
// src/components/mobile/mobile-card-list.tsx

'use client'

import { ObituaryCard } from '@/components/obituary/obituary-card'
import type { Obituary } from '@/types/obituary'

interface MobileCardListProps {
  obituaries: Obituary[]
  onSelect: (obituary: Obituary) => void
}

export function MobileCardList({ obituaries, onSelect }: MobileCardListProps) {
  if (obituaries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <p className="text-[--text-muted]">
          No obituaries match your filters.
          <br />
          <button
            onClick={() => window.location.href = '/'}
            className="text-[--accent-primary] underline mt-2"
          >
            Clear filters
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {obituaries.map(obituary => (
        <button
          key={obituary._id}
          onClick={() => onSelect(obituary)}
          className="w-full text-left"
        >
          <ObituaryCard obituary={obituary} compact />
        </button>
      ))}
    </div>
  )
}
```

```typescript
// src/app/page.tsx (modification)

import { Suspense } from 'react'
import { getObituaries } from '@/lib/sanity/queries'
import { MobileTimeline } from '@/components/mobile/mobile-timeline'
import { CategoryFilter } from '@/components/filters/category-filter'
import { HomeClient } from './home-client'

interface Props {
  searchParams: Promise<{ cat?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams
  const obituaries = await getObituaries()
  const activeCategories = params.cat?.split(',').filter(Boolean) || []

  return (
    <main className="flex flex-col min-h-screen">
      {/* Desktop/Tablet: Full timeline */}
      <div className="hidden md:flex flex-col flex-1">
        <div className="flex-1 relative">
          <Suspense fallback={<div>Loading timeline...</div>}>
            <HomeClient
              obituaries={obituaries}
              activeCategories={activeCategories}
            />
          </Suspense>
        </div>
        <CategoryFilter className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10" />
      </div>

      {/* Mobile: Hybrid view */}
      <div className="md:hidden flex flex-col flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <MobileTimeline
            obituaries={obituaries}
            activeCategories={activeCategories}
          />
        </Suspense>
        <CategoryFilter className="sticky bottom-0 z-10" />
      </div>
    </main>
  )
}
```

---

## Tasks

### Task 1: Create MobileTimeline Component (20 min)
- [ ] Create `src/components/mobile/` directory
- [ ] Create `src/components/mobile/mobile-timeline.tsx`
- [ ] Implement component with state management (selectedObituary, dateFilter)
- [ ] Add filtering logic for categories and date range
- [ ] Integrate DensityBar, MobileCardList, and ObituaryModal
- [ ] Add TypeScript types for props
- [ ] Add 'use client' directive

### Task 2: Create DensityBar Component (30 min)
- [ ] Create `src/components/mobile/density-bar.tsx`
- [ ] Implement useMemo for density calculation by month
- [ ] Calculate year range from obituary dates
- [ ] Build density array (12 months per year)
- [ ] Render vertical bars with dynamic height (count / maxCount * 48px)
- [ ] Add tap handlers to trigger onPeriodSelect with date range
- [ ] Render year labels below bars
- [ ] Add "Clear date filter" button when activePeriod is set
- [ ] Add aria-labels for accessibility

### Task 3: Create MobileCardList Component (15 min)
- [ ] Create `src/components/mobile/mobile-card-list.tsx`
- [ ] Render scrollable container with flex-1 overflow-y-auto
- [ ] Map obituaries to ObituaryCard components
- [ ] Wrap each card in button for tap handling
- [ ] Implement empty state with message and clear filters link
- [ ] Add spacing between cards (space-y-3)

### Task 4: Modify Homepage Layout for Responsive Views (20 min)
- [ ] Open `src/app/page.tsx`
- [ ] Import MobileTimeline component
- [ ] Add desktop/tablet section: `<div className="hidden md:flex">`
- [ ] Add mobile section: `<div className="md:hidden flex">`
- [ ] Position CategoryFilter differently per breakpoint
- [ ] Desktop: fixed bottom-6 left-1/2 -translate-x-1/2
- [ ] Mobile: sticky bottom-0
- [ ] Verify both sections have proper layout (flex flex-col flex-1)

### Task 5: Verify ObituaryCard Compact Mode (10 min)
- [ ] Open `src/components/obituary/obituary-card.tsx`
- [ ] Check if `compact` prop exists
- [ ] If not, add optional compact prop for smaller cards on mobile
- [ ] Ensure card shows: claim preview, source, date, category badges
- [ ] Test card appearance in mobile view

### Task 6: Update ObituaryModal for Bottom Sheet (10 min)
- [ ] Open `src/components/obituary/obituary-modal.tsx`
- [ ] Verify `side` prop is supported (should be from Epic 3)
- [ ] Test that side="bottom" renders sheet from bottom
- [ ] Verify modal closes when tapping outside or close button
- [ ] Ensure "View full page" button still works on mobile modal

### Task 7: Test Density Bar Filtering (15 min)
- [ ] Start dev server: `pnpm dev`
- [ ] Open homepage on mobile viewport (< 768px)
- [ ] Verify density bar renders with correct heights
- [ ] Tap on a bar representing a specific month
- [ ] Verify card list filters to show only obituaries from that month
- [ ] Tap "Clear date filter" link
- [ ] Verify all obituaries are shown again
- [ ] Test with category filters active (both filters should combine)

### Task 8: Test Mobile Card List Interaction (15 min)
- [ ] Verify card list scrolls smoothly
- [ ] Tap on a card
- [ ] Verify modal opens from bottom as sheet
- [ ] Verify modal shows full obituary content
- [ ] Close modal (tap X or outside)
- [ ] Verify modal closes and card list remains
- [ ] Test empty state by applying filters that match nothing

### Task 9: Test Responsive Breakpoints (15 min)
- [ ] Resize browser from mobile (< 768px) to desktop (>= 1024px)
- [ ] At < 768px: verify mobile view (density bar + cards) is visible
- [ ] At >= 768px: verify desktop view (ScatterPlot) is visible
- [ ] Verify mobile view is hidden on desktop
- [ ] Verify desktop view is hidden on mobile
- [ ] Test on actual mobile device if available
- [ ] Verify no layout shift or jank during resize

### Task 10: Write Unit Tests for DensityBar (30 min)
- [ ] Create `tests/unit/components/mobile/density-bar.test.tsx`
- [ ] Test: density calculation by month
- [ ] Test: bar height proportional to count
- [ ] Test: year labels render correctly
- [ ] Test: clicking bar triggers onPeriodSelect with correct date range
- [ ] Test: "Clear date filter" button visible when activePeriod set
- [ ] Test: category filtering applies to density calculation

### Task 11: Write Unit Tests for MobileCardList (20 min)
- [ ] Create `tests/unit/components/mobile/mobile-card-list.test.tsx`
- [ ] Test: renders list of obituary cards
- [ ] Test: clicking card triggers onSelect
- [ ] Test: empty state shows when no obituaries
- [ ] Test: clear filters link navigates to homepage

### Task 12: Write Unit Tests for MobileTimeline (25 min)
- [ ] Create `tests/unit/components/mobile/mobile-timeline.test.tsx`
- [ ] Test: renders DensityBar and MobileCardList
- [ ] Test: filters obituaries by category
- [ ] Test: filters obituaries by date range
- [ ] Test: combines category and date filters
- [ ] Test: selecting obituary opens modal
- [ ] Test: closing modal clears selectedObituary

### Task 13: Write E2E Tests for Mobile Hybrid View (30 min)
- [ ] Create or update `tests/e2e/mobile.spec.ts`
- [ ] Test: mobile viewport shows density bar + card list
- [ ] Test: tapping density bar filters card list
- [ ] Test: tapping card opens bottom sheet modal
- [ ] Test: modal "View full page" button works
- [ ] Test: category filter combines with date filter
- [ ] Test: clear date filter restores all cards

### Task 14: Manual Testing Checklist (20 min)
- [ ] Open dev server on mobile device (or Chrome DevTools mobile mode)
- [ ] Set viewport to 375px width (iPhone SE)
- [ ] Verify density bar visible at top
- [ ] Verify bars show different heights based on count
- [ ] Verify year labels visible below bars
- [ ] Tap a bar - verify card list filters
- [ ] Verify "Clear date filter" link appears
- [ ] Click link - verify filter clears
- [ ] Scroll card list - verify smooth scrolling
- [ ] Tap a card - verify bottom sheet modal opens
- [ ] Close modal - verify card list remains
- [ ] Apply category filter - verify both filters work together
- [ ] Clear all filters - verify all obituaries shown
- [ ] Resize to desktop (>= 1024px) - verify ScatterPlot shows

### Task 15: Accessibility Testing (15 min)
- [ ] Test with VoiceOver or screen reader
- [ ] Verify density bar buttons have aria-labels
- [ ] Verify card buttons are focusable and activatable
- [ ] Verify modal has proper focus management
- [ ] Test keyboard navigation on mobile (if device supports)
- [ ] Verify color contrast for density bars

### Task 16: Performance Testing (10 min)
- [ ] Open Chrome DevTools Performance tab
- [ ] Record interaction: tap density bar, scroll list, tap card
- [ ] Verify scrolling is 60fps (no frame drops)
- [ ] Verify density calculation doesn't block UI
- [ ] Check for memory leaks when opening/closing modal multiple times

### Task 17: Run Quality Checks (5 min)
- [ ] Run TypeScript check: `pnpm tsc --noEmit`
- [ ] Run lint: `pnpm lint`
- [ ] Run tests: `pnpm test:run`
- [ ] Fix any errors or warnings from this story's changes

### Task 18: Update Sprint Status (3 min)
- [ ] Open `docs/sprint-artifacts/sprint-status.yaml`
- [ ] Find story 5-5-mobile-hybrid-view
- [ ] Update status from backlog to drafted (story file creation) or ready-for-dev (after story-context)
- [ ] Save file

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Epic 3 (Timeline Visualization) | Completed | ScatterPlot component exists, ObituaryModal with side prop |
| Epic 4 (Category System & Filtering) | Completed | CategoryFilter component, activeCategories from URL state |
| Story 3-7 (Click to Modal) | Completed | ObituaryModal component with sheet implementation |
| ObituaryCard Component | Completed | Exists from Epic 2 or Epic 3 |
| Story 4-3 (URL State with nuqs) | Completed | Filter state managed in URL |
| Tailwind CSS | Framework | Responsive breakpoints (md, lg) |
| Next.js Suspense | Framework | Server component loading states |

---

## Definition of Done

- [ ] MobileTimeline component created and integrated
- [ ] DensityBar component created with month-based visualization
- [ ] MobileCardList component created with vertical scrolling
- [ ] Homepage layout shows mobile view on < 768px, desktop view on >= 1024px
- [ ] Density bar shows visual distribution of obituaries over time
- [ ] Year labels visible below density bars
- [ ] Tapping density bar filters card list by date range
- [ ] "Clear date filter" link clears date filter
- [ ] Category filters and date filters combine correctly
- [ ] Tapping card opens ObituaryModal from bottom (side="bottom")
- [ ] Empty state shows helpful message when no matches
- [ ] Vertical scrolling is smooth (60fps)
- [ ] Unit tests pass for all new components
- [ ] E2E tests pass for mobile interactions
- [ ] Accessibility: aria-labels on density bar buttons
- [ ] No TypeScript errors from changes
- [ ] Lint passes for all modified files
- [ ] Manual testing confirms full functionality on mobile viewport

---

## Test Scenarios

### Unit Test Scenarios

1. **DensityBar Density Calculation**
   - Calculates counts by month correctly
   - Handles empty months (count = 0)
   - Calculates year range from obituary dates
   - Max count determines bar height scaling
   - Category filter affects density calculation

2. **DensityBar Rendering**
   - Renders bars with heights proportional to counts
   - Renders year labels below bars
   - Empty months render with minimum height (2px)
   - "Clear date filter" button visible when activePeriod set
   - Clicking bar calls onPeriodSelect with correct date range

3. **MobileCardList Rendering**
   - Renders list of ObituaryCard components
   - Each card wrapped in button element
   - Clicking card calls onSelect with obituary
   - Empty state shows when obituaries array is empty
   - Clear filters link points to homepage

4. **MobileTimeline Filtering**
   - Filters obituaries by activeCategories
   - Filters obituaries by dateFilter
   - Combines category and date filters
   - Selecting obituary sets selectedObituary state
   - Closing modal clears selectedObituary state

### E2E Test Scenarios

1. **Mobile View Rendering**
   - Given viewport is < 768px
   - When homepage loads
   - Then density bar is visible
   - And card list is visible
   - And ScatterPlot is hidden

2. **Density Bar Filtering**
   - Given mobile view is active
   - When I tap a density bar representing a specific month
   - Then card list shows only obituaries from that month
   - And "Clear date filter" link appears

3. **Card Interaction**
   - Given card list is displayed
   - When I tap an obituary card
   - Then bottom sheet modal opens
   - And modal shows full obituary content

4. **Combined Filters**
   - Given category filters are active
   - When I tap a density bar to filter by date
   - Then card list shows obituaries matching both filters
   - And density bar reflects category-filtered counts

### Manual Testing Checklist

- [ ] Mobile viewport (< 768px) shows density bar + card list
- [ ] Desktop viewport (>= 1024px) shows ScatterPlot
- [ ] Density bars have varying heights based on counts
- [ ] Year labels visible and correct
- [ ] Tapping density bar filters cards
- [ ] "Clear date filter" link works
- [ ] Tapping card opens bottom sheet modal
- [ ] Modal "View full page" button navigates
- [ ] Scrolling card list is smooth
- [ ] Empty state shows when no matches
- [ ] Category + date filters combine correctly
- [ ] Resize from mobile to desktop switches views smoothly

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/mobile/mobile-timeline.tsx` | Create | Container component for mobile hybrid view |
| `src/components/mobile/density-bar.tsx` | Create | Visual density indicator with tap filtering |
| `src/components/mobile/mobile-card-list.tsx` | Create | Vertical scrolling list of obituary cards |
| `src/app/page.tsx` | Modify | Add responsive layout switching (mobile vs desktop) |
| `src/components/obituary/obituary-card.tsx` | Modify (maybe) | Add compact prop if needed |
| `tests/unit/components/mobile/density-bar.test.tsx` | Create | Unit tests for DensityBar |
| `tests/unit/components/mobile/mobile-card-list.test.tsx` | Create | Unit tests for MobileCardList |
| `tests/unit/components/mobile/mobile-timeline.test.tsx` | Create | Unit tests for MobileTimeline |
| `tests/e2e/mobile.spec.ts` | Create | E2E tests for mobile hybrid view |
| `docs/sprint-artifacts/sprint-status.yaml` | Modify | Update story status |

---

## FR Coverage

This story satisfies the following Functional Requirements:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR13 | Timeline gracefully degrades to list view on mobile devices | Mobile hybrid view (< 768px) shows density bar + vertical card list instead of horizontal ScatterPlot |
| FR34 | Site is fully functional on mobile devices (320px+) | Mobile view designed for small screens with touch-friendly interactions |
| FR37 | Timeline visualization adapts appropriately per breakpoint | Homepage shows different components based on viewport width: mobile (< 768px) gets hybrid view, desktop (>= 1024px) gets full timeline |

---

## Learnings from Previous Stories

From Story 5-4 (Breadcrumb Navigation):
1. **Responsive Classes** - Use Tailwind `md:` prefix for breakpoint-specific styling
2. **Component Structure** - Keep components focused and composable
3. **Accessibility** - Add aria-labels for interactive elements

From Story 5-3 (Position Preservation):
1. **sessionStorage Pattern** - Use for ephemeral state (position), not URL
2. **useMemo for Performance** - Cache expensive calculations like density

From Story 5-2 (Previous/Next Navigation):
1. **Button Wrappers** - Wrap interactive elements in buttons for accessibility
2. **State Management** - Keep state local to component when possible

From Story 5-1 (Modal to Full Page Transition):
1. **Modal Side Prop** - ObituaryModal supports `side` prop for direction
2. **Conditional Rendering** - Use `{condition && <Component />}` pattern

From Story 4-4 (Filter Effect on Timeline):
1. **Filter Combination** - Multiple filters should combine (AND logic)
2. **Empty State** - Always provide helpful message when filters match nothing

From Story 4-3 (URL State with nuqs):
1. **URL State for Filters** - Category filters live in URL (?cat=market,bubble)
2. **Server Props** - searchParams passed to page component

From Epic 5 Tech Spec:
1. **Mobile Breakpoint** - < 768px is mobile, >= 768px is tablet/desktop
2. **Density Bar Height** - Max 48px, minimum 2px for empty months
3. **Touch Targets** - Minimum 44px for tappable elements (future story)
4. **Bottom Sheet** - Modal side="bottom" for mobile

From Architecture:
1. **Server Components** - Homepage is server component, client components marked with 'use client'
2. **Suspense Boundaries** - Wrap async components in Suspense for loading states

---

## Dev Agent Record

### Context Reference

Story Context: `docs/sprint-artifacts/story-contexts/5-5-mobile-hybrid-view-context.xml`

### Implementation Notes

[To be filled during implementation]

### Files Created

[To be filled during implementation]

### Files Modified

[To be filled during implementation]

### Deviations from Plan

[To be filled during implementation]

### Issues Encountered

[To be filled during implementation]

### Key Decisions

[To be filled during implementation]

### Test Results

[To be filled during implementation]

### Completion Timestamp

[To be filled during implementation]

---

_Story created: 2025-11-30_
_Epic: Navigation & Responsive Experience (Epic 5)_
_Sequence: 5 of 6 in Epic 5_
