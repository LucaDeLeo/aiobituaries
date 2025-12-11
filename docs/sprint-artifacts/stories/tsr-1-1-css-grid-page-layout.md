# Story TSR-1.1: Create CSS Grid Page Layout

**Story Key:** tsr-1-1-css-grid-page-layout
**Epic:** TSR-1 - Layout Foundation (Timeline Visualization Redesign)
**Status:** ready-for-dev
**Priority:** Critical (Foundation Story)

---

## User Story

**As a** visitor,
**I want** the chart to dominate the page with controls in a sidebar,
**So that** I can focus on the visualization while having easy access to controls.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-1.1.1 | Desktop grid layout applies | Given viewport width >= 1024px, when homepage loads, then layout displays with chart area ~75% width (1fr) and fixed 320px sidebar on right |
| AC-1.1.2 | Chart fills viewport height | Chart height is `calc(100vh - 64px)` with minimum 500px |
| AC-1.1.3 | No gap between regions | Grid has `gap-0` - chart and sidebar are flush |
| AC-1.1.4 | Sidebar scrolls independently | Given sidebar content overflows, when scrolling sidebar, then sidebar scrolls independently while chart remains fixed |
| AC-1.1.5 | Chart container is overflow-hidden | Chart section has `overflow-hidden` to contain visualization |
| AC-1.1.6 | Sidebar has border separator | Sidebar has left border using `border-border` color |

---

## Technical Approach

### Implementation Overview

Transform the current homepage layout from a stacked vertical layout to a CSS Grid-based "hero chart + sidebar" pattern, following Epoch AI's proven visualization layout. This is a brownfield evolution - modifying existing `src/app/page.tsx` and `src/app/home-client.tsx`.

### Current State Analysis

**Current `src/app/page.tsx` structure:**
```tsx
<main className="min-h-screen flex flex-col">
  <section>CountDisplay</section>      // Hero count
  <div className="hidden md:block">    // Desktop visualization
    <HomeClient obituaries={...} />
    <ObituaryList />
  </div>
  <div className="md:hidden">          // Mobile view
    <MobileTimeline />
  </div>
</main>
```

**Current `src/app/home-client.tsx` structure:**
- Client wrapper with category filters
- ScatterPlot in a container section
- CategoryChart below
- CategoryFilter bar at bottom

### Target State

**New layout structure:**
```tsx
// Desktop (>=1024px): Grid layout
<main className="grid grid-cols-[1fr_320px] h-[calc(100vh-64px)] min-h-[500px] gap-0">
  <section className="relative overflow-hidden">
    <ScatterPlot ... />
  </section>
  <aside className="border-l border-border overflow-y-auto">
    <ControlPanel ... />  // Placeholder for Story 1.2
  </aside>
</main>

// Tablet (768-1023px): Full-width chart (responsive surfaces in Story 1.3)
// Mobile (<768px): Existing mobile view maintained
```

### Key Implementation Details

1. **CSS Grid Setup**
   - Use `grid-cols-[1fr_320px]` for fluid chart + fixed sidebar
   - Height: `h-[calc(100vh-64px)]` assuming 64px header
   - Minimum height: `min-h-[500px]` to prevent collapse
   - No gap: `gap-0` for seamless border

2. **Chart Container**
   - `relative` for positioning zoom controls (Story 5.4)
   - `overflow-hidden` to contain pan/zoom transforms
   - Full height within grid cell

3. **Sidebar Container**
   - `border-l border-border` for visual separator
   - `overflow-y-auto` for independent scrolling
   - Placeholder content until ControlPanel (Story 1.2)

4. **Responsive Breakpoints**
   - Desktop (>=1024px): Grid layout with sidebar
   - Tablet (768-1023px): Full-width chart (drawer in Story 1.3)
   - Mobile (<768px): Existing MobileTimeline component

5. **Preserve Existing Functionality**
   - Keep CountDisplay hero section above grid
   - Keep CategoryFilter working during transition
   - Maintain ObituaryList below visualization

### Reference Implementation

```tsx
// src/app/page.tsx - Updated structure
import { Suspense } from "react";
import { CountDisplay } from "@/components/obituary/count-display";
import { CountDisplayCompact } from "@/components/obituary/count-display-compact";
import { ObituaryList } from "@/components/obituary/obituary-list";
import { JsonLd } from "@/components/seo/json-ld";
import { homepageMetadata } from "@/lib/utils/seo";
import { getObituaries } from "@/lib/sanity/queries";
import { HomeClient } from "./home-client";
import { MobileTimeline } from "@/components/mobile/mobile-timeline";

export const metadata = homepageMetadata;

export default async function Home() {
  const obituaries = await getObituaries();

  return (
    <>
      <JsonLd type="website" />

      {/* Mobile/Tablet: Keep existing hybrid view */}
      <div className="lg:hidden">
        <main className="min-h-screen flex flex-col">
          <section className="flex flex-col items-center justify-center py-12 md:py-24 px-4">
            <CountDisplay />
          </section>

          {/* Tablet: Full-width chart */}
          <div className="hidden md:block flex-1">
            <Suspense fallback={null}>
              <HomeClient obituaries={obituaries} />
            </Suspense>
            <section className="px-4 pb-24 max-w-7xl mx-auto">
              <ObituaryList />
            </section>
          </div>

          {/* Mobile: Hybrid view */}
          <div className="md:hidden flex-1 flex flex-col min-h-0">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
              <MobileTimeline obituaries={obituaries} />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Desktop (>=1024px): New grid layout */}
      <div className="hidden lg:block">
        <main className="flex flex-col min-h-screen">
          {/* Compact header with count - uses separate async Server Component */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-border">
            <CountDisplayCompact />
          </header>

          {/* Grid: Chart + Sidebar */}
          <div className="grid grid-cols-[1fr_320px] flex-1 min-h-[500px] gap-0">
            <section className="relative overflow-hidden h-full">
              <Suspense fallback={null}>
                <HomeClient obituaries={obituaries} variant="hero" />
              </Suspense>
            </section>
            <aside className="border-l border-border overflow-y-auto bg-secondary">
              {/* ControlPanel placeholder - Story 1.2 */}
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  Controls (Story 1.2)
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
```

```tsx
// src/app/home-client.tsx - Updated with variant prop
'use client'

import { useMemo } from 'react'
import { CategoryFilter } from '@/components/filters/category-filter'
import { ScatterPlot } from '@/components/visualization/scatter-plot'
import { CategoryChart } from '@/components/visualization/category-chart'
import { BackgroundChartLegend } from '@/components/visualization/background-chart'
import { allMetrics } from '@/data/ai-metrics'
import {
  TableViewToggle,
  useViewModeStorage,
} from '@/components/obituary/table-view-toggle'
import { ObituaryTable } from '@/components/obituary/obituary-table'
import { useLiveRegionOptional } from '@/components/accessibility/live-region'
import type { ObituarySummary } from '@/types/obituary'
import { useFilters } from '@/lib/hooks/use-filters'

export interface HomeClientProps {
  obituaries: ObituarySummary[]
  /** Layout variant: 'default' for existing, 'hero' for new grid layout */
  variant?: 'default' | 'hero'
}

export function HomeClient({ obituaries, variant = 'default' }: HomeClientProps) {
  const { categories, toggleCategory, clearFilters } = useFilters()
  const { mode, setMode, isHydrated } = useViewModeStorage()
  const liveRegion = useLiveRegionOptional()

  const filteredCount = useMemo(() => {
    if (categories.length === 0) return obituaries.length
    return obituaries.filter((obit) =>
      obit.categories?.some((cat) => categories.includes(cat))
    ).length
  }, [obituaries, categories])

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode)
    liveRegion?.announcePolite(
      newMode === 'table'
        ? 'Switched to table view'
        : 'Switched to timeline view'
    )
  }

  // Hero variant: Full-height chart only (controls in sidebar)
  if (variant === 'hero') {
    return (
      <div className="h-full">
        {!isHydrated || mode === 'visualization' ? (
          <ScatterPlot
            data={obituaries}
            activeCategories={categories}
            fillContainer
          />
        ) : (
          <ObituaryTable
            obituaries={obituaries}
            activeCategories={categories}
          />
        )}
      </div>
    )
  }

  // Default variant: Existing layout
  return (
    <>
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <TableViewToggle mode={mode} onModeChange={handleModeChange} />
        </div>

        {!isHydrated || mode === 'visualization' ? (
          <>
            <ScatterPlot data={obituaries} activeCategories={categories} />
            <div className="mt-3 flex justify-center">
              <BackgroundChartLegend metrics={allMetrics} />
            </div>
          </>
        ) : (
          <ObituaryTable
            obituaries={obituaries}
            activeCategories={categories}
          />
        )}
      </section>

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

      <CategoryFilter
        activeCategories={categories}
        onToggle={toggleCategory}
        onShowAll={clearFilters}
        totalCount={obituaries.length}
        filteredCount={filteredCount}
      />
    </>
  )
}
```

### ScatterPlot Modification

Add `fillContainer` prop to ScatterPlot for hero mode. The current ScatterPlot wrapper uses fixed min-heights:

```tsx
// Current: src/components/visualization/scatter-plot.tsx (lines 1007-1025)
<div
  className="w-full min-h-[300px] md:min-h-[400px]"
  data-testid="scatter-plot-container"
  style={{ height: height || 'auto' }}
>
  <ParentSize>...</ParentSize>
</div>
```

**Important:** visx `ParentSize` requires the parent to have explicit dimensions. When using `h-full`, ensure the grid cell has a defined height (handled by `flex-1` on the grid container).

```tsx
// Updated: Add fillContainer prop
export interface ScatterPlotProps {
  data: ObituarySummary[]
  height?: number
  activeCategories?: Category[]
  /** Fill parent container height (for grid layout). Parent must have explicit height. */
  fillContainer?: boolean
}

export function ScatterPlot({ data, height, activeCategories = [], fillContainer }: ScatterPlotProps) {
  return (
    <div
      className={cn(
        "w-full",
        fillContainer ? "h-full" : "min-h-[300px] md:min-h-[400px]"
      )}
      data-testid="scatter-plot-container"
      style={{ height: height || 'auto' }}
    >
      <ParentSize>
        {({ width, height: parentHeight }) => (
          <ScatterPlotInner
            data={data}
            width={width}
            height={height || Math.max(parentHeight, 300)}
            activeCategories={activeCategories}
          />
        )}
      </ParentSize>
    </div>
  )
}
```

### CategoryFilter in Hero Mode

In the hero variant, CategoryFilter and CategoryChart are **omitted** (not rendered). This is intentional:
- Desktop: Filters will move to the sidebar ControlPanel (Story 1.2)
- Default variant: CategoryFilter remains at the bottom for tablet/mobile backward compatibility
- No deprecation path needed - components coexist for different breakpoints

### CountDisplayCompact Reference Implementation

Create a new async Server Component for the desktop header. This is separate from CountDisplay because:
1. CountDisplay is an async Server Component that cannot easily accept variant props
2. The compact version needs fundamentally different markup (inline vs hero block)
3. Both fetch the same count - code duplication is minimal

```tsx
// src/components/obituary/count-display-compact.tsx
import { getObituaryCount } from '@/lib/sanity/queries'

/**
 * Compact count display for desktop header.
 * Async Server Component that fetches obituary count from Sanity.
 * Displays inline with smaller styling - no decorative elements.
 */
export async function CountDisplayCompact() {
  let count: number
  try {
    count = await getObituaryCount()
  } catch {
    count = 0
  }
  const formattedCount = new Intl.NumberFormat('en-US').format(count)

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{count} AI Obituaries</span>
      <span
        aria-hidden="true"
        className="font-mono text-2xl text-primary font-semibold tracking-tight"
      >
        {formattedCount}
      </span>
      <span
        aria-hidden="true"
        className="text-sm text-muted-foreground uppercase tracking-wider"
      >
        Obituaries
      </span>
    </div>
  )
}
```

---

## Tasks

### Task 1: Update page.tsx Layout Structure (30 min)
**AC Coverage:** AC-1.1.1, AC-1.1.2, AC-1.1.3, AC-1.1.5

- [ ] Create responsive wrapper divs for mobile/tablet vs desktop
- [ ] Implement CSS Grid layout for desktop (>=1024px)
- [ ] Set grid columns to `[1fr_320px]`
- [ ] Set height to `calc(100vh - 64px)` with `min-h-[500px]`
- [ ] Apply `gap-0` for no gap between regions
- [ ] Add chart section with `relative overflow-hidden`
- [ ] Add sidebar aside with placeholder content
- [ ] Preserve existing mobile/tablet layouts

### Task 2: Update home-client.tsx with Variant Prop (25 min)
**AC Coverage:** AC-1.1.1, AC-1.1.5

- [ ] Add `variant` prop with 'default' | 'hero' options
- [ ] Implement hero variant rendering (chart only, full height)
- [ ] Keep default variant for tablet/mobile backward compatibility
- [ ] Remove CategoryFilter and CategoryChart from hero variant
- [ ] Test both variants render correctly

### Task 3: Add Sidebar Styles (15 min)
**AC Coverage:** AC-1.1.4, AC-1.1.6

**CSS Variable Note:** `--bg-secondary` exists in globals.css (defined as `#14141A`). Use Tailwind's mapped class `bg-secondary` (mapped via `--color-secondary: var(--bg-secondary)` in @theme).

- [ ] Add `border-l border-border` to sidebar
- [ ] Add `overflow-y-auto` for independent scrolling
- [ ] Add `bg-secondary` for consistent background (uses Tailwind mapped variable)
- [ ] Add placeholder ControlPanel content with padding
- [ ] Test sidebar scrolls independently of chart

### Task 4: Update ScatterPlot for Fill Container Mode (20 min)
**AC Coverage:** AC-1.1.2

**Note:** ScatterPlot uses visx `ParentSize` which requires the parent container to have an explicit height. When using `h-full`, the parent grid cell must also have a defined height (which it will via `flex-1` or the grid layout).

- [ ] Add `fillContainer?: boolean` prop to ScatterPlotProps interface
- [ ] Conditionally apply `h-full` class to wrapper div when `fillContainer` is true
- [ ] Default behavior (no prop or false): keep existing `min-h-[300px] md:min-h-[400px]`
- [ ] Verify ParentSize correctly reports height when parent has `h-full` with grid layout
- [ ] Test chart fills available grid cell height (may need explicit height fallback)

### Task 5: Create CountDisplayCompact Component (25 min)
**AC Coverage:** AC-1.1.1

**Note:** CountDisplay is an async Server Component that fetches from Sanity. Rather than modifying it to accept a variant prop (which would require significant refactoring), create a new `CountDisplayCompact` component.

- [ ] Create `src/components/obituary/count-display-compact.tsx`
- [ ] Make it an async Server Component (like CountDisplay)
- [ ] Fetch count using `getObituaryCount()`
- [ ] Style for inline header display: horizontal layout, smaller text, no decorative elements
- [ ] Include screen reader accessible label
- [ ] Export from component barrel file if one exists

### Task 6: Write Unit Tests (30 min)

- [ ] Create `tests/unit/app/page-layout.test.tsx`
- [ ] Test: Desktop viewport shows grid layout
- [ ] Test: Tablet viewport shows full-width chart
- [ ] Test: Mobile viewport shows MobileTimeline
- [ ] Test: Grid has correct column structure
- [ ] Test: Sidebar has border-l class
- [ ] Test: Chart section has overflow-hidden

### Task 7: Visual Testing (20 min)

- [ ] Test desktop layout (>=1024px) - chart + sidebar visible
- [ ] Test sidebar scrolling is independent
- [ ] Test chart fills viewport height minus header
- [ ] Test minimum height (500px) when viewport is small
- [ ] Test tablet layout (768-1023px) - full-width chart
- [ ] Test mobile layout (<768px) - existing behavior
- [ ] Test responsive transitions between breakpoints

### Task 8: Accessibility Check (10 min)

- [ ] Verify landmark roles (main, aside)
- [ ] Ensure focus order is logical (chart -> sidebar)
- [ ] Test keyboard navigation between regions
- [ ] Verify screen reader announces layout regions

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| None | - | Foundation story, no prerequisites |

### Downstream Dependencies

Stories that depend on this layout:
- **Story 1.2:** ControlPanel Shell Component (needs sidebar container)
- **Story 1.3:** Responsive Control Surfaces (needs grid layout)
- **Story 5.4:** Zoom Controls Position (needs chart container)

---

## Definition of Done

- [ ] Desktop (>=1024px) shows CSS Grid layout with ~75% chart + 320px sidebar
- [ ] Chart height is `calc(100vh - 64px)` with min 500px
- [ ] Sidebar scrolls independently of chart
- [ ] Sidebar has left border separator
- [ ] Chart container has `overflow-hidden`
- [ ] Tablet (768-1023px) shows full-width chart
- [ ] Mobile (<768px) shows existing MobileTimeline
- [ ] HomeClient supports `variant` prop
- [ ] ScatterPlot supports `fillContainer` prop
- [ ] CountDisplayCompact component created and working
- [ ] All unit tests pass
- [ ] Visual testing confirms layout at all breakpoints
- [ ] No TypeScript errors
- [ ] Lint passes (`bun run lint`)
- [ ] Existing functionality preserved

---

## Test Scenarios

### Unit Test Scenarios

1. **Desktop Grid Layout Renders**
   - Render page at 1024px width
   - Expect grid container with `grid-cols-[1fr_320px]`

2. **Sidebar Has Border**
   - Render desktop layout
   - Expect aside element with `border-l` class

3. **Chart Section Has Overflow Hidden**
   - Render desktop layout
   - Expect section element with `overflow-hidden`

4. **Hero Variant Renders Chart Only**
   - Render HomeClient with variant="hero"
   - Expect ScatterPlot, no CategoryFilter or CategoryChart

5. **Mobile Layout Unchanged**
   - Render page at 767px width
   - Expect MobileTimeline component visible

### Manual Testing Checklist

- [ ] Desktop: Chart dominates ~75% of viewport
- [ ] Desktop: Sidebar fixed at 320px on right
- [ ] Desktop: Scroll sidebar - chart stays fixed
- [ ] Desktop: No gap between chart and sidebar
- [ ] Desktop: Chart height fills viewport (minus header)
- [ ] Tablet: Full-width chart, no sidebar
- [ ] Mobile: MobileTimeline renders as before
- [ ] Resize window: Layout transitions smoothly
- [ ] Very short viewport: Min 500px height maintained

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/app/page.tsx` | Modify | Add CSS Grid layout for desktop |
| `src/app/home-client.tsx` | Modify | Add variant prop, hero mode |
| `src/components/visualization/scatter-plot.tsx` | Modify | Add fillContainer prop |
| `src/components/obituary/count-display-compact.tsx` | **Create** | New compact async Server Component for desktop header |
| `tests/unit/app/page-layout.test.tsx` | Create | Layout unit tests |
| `tests/unit/components/obituary/count-display-compact.test.tsx` | Create | Tests for compact count display |

---

## FR/TSR Coverage

| Requirement ID | Description | How Satisfied |
|----------------|-------------|---------------|
| TSR1 | Chart occupies ~75% width on desktop with fixed 320px sidebar | CSS Grid `grid-cols-[1fr_320px]` |
| TSR2 | Chart height is calc(100vh - header) with min 500px | `h-[calc(100vh-64px)] min-h-[500px]` |

---

## Technical Notes

### Why CSS Grid vs Flexbox

CSS Grid is ideal here because:
1. Fixed sidebar width (320px) with fluid chart (1fr)
2. No gap needed (`gap-0`)
3. Independent scrolling regions (sidebar scroll doesn't affect chart)
4. Simple responsive override (remove grid on tablet)

### Header Height Assumption

Using 64px header height (`calc(100vh-64px)`). If header height differs:
- Check actual header height in layout component
- Update calc value accordingly
- Consider CSS custom property for maintainability

### Backward Compatibility

This is an additive change:
- Tablet/mobile layouts unchanged
- HomeClient default variant preserves existing behavior
- No breaking changes to existing components

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
_Epic: TSR-1 - Layout Foundation (Timeline Visualization Redesign)_
_Sequence: 1 of 3 in Epic TSR-1_
_Requirements: TSR1, TSR2_
