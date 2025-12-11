# Story TSR-3-5: Assemble Control Panel with URL State Wiring

**Epic:** TSR-3 (Control Panel Implementation)
**Status:** ready-for-dev
**Priority:** High
**Estimation:** 2-3 hours

---

## User Story

**As a** developer,
**I want** all controls assembled in ControlPanel with URL state properly wired,
**So that** the sidebar/sheet/drawer has complete functionality and the visualization responds to control changes.

---

## Context

### Background

This is the **FINAL story** in Epic TSR-3: Control Panel Implementation. All control components are now complete:

- **Story TSR-3-1:** `useVisualizationState` hook - manages metrics, categories, dateRange in URL
- **Story TSR-3-2:** `MetricsToggle` component - toggles background metric lines
- **Story TSR-3-3:** `DateRangeSlider` component - adjusts visible time window
- **Story TSR-3-4:** `CategoryCheckboxes` component - filters obituaries by category

The `ControlPanel` component (`src/components/controls/control-panel.tsx`) already has all child components integrated. The critical missing piece is **wiring the URL state hook** to flow state through the component hierarchy:

1. `ControlPanelWrapper` needs to use `useVisualizationState` to get/set state
2. `HomeClient` needs to receive state and pass to `ScatterPlot`
3. URL state changes must reflect in the visualization

### Epic Dependencies

- **Story TSR-3-1 (URL State Hook):** Complete - provides `useVisualizationState`
- **Story TSR-3-2 (MetricsToggle):** Complete - integrated in ControlPanel
- **Story TSR-3-3 (DateRangeSlider):** Complete - integrated in ControlPanel
- **Story TSR-3-4 (CategoryCheckboxes):** Complete - integrated in ControlPanel
- **Story TSR-1-2 (ControlPanel Shell):** Complete - base component exists

### Technical Context

**Current State - ControlPanelWrapper (placeholder state):**
```typescript
// src/components/controls/control-panel-wrapper.tsx
// Currently uses placeholder state - NOT wired to URL
const enabledMetrics: MetricType[] = ['compute']
const selectedCategories: Category[] = []
const dateRange: [number, number] = [2010, 2025]
const handleMetricsChange = () => {}  // No-op!
```

**Current State - HomeClient (uses old useFilters):**
```typescript
// src/app/home-client.tsx
const { categories, toggleCategory } = useFilters()  // Old hook!

<ScatterPlot
  data={obituaries}
  activeCategories={categories}
  fillContainer
/>
// Missing: enabledMetrics, dateRange props
```

**Target State - Unified URL State Flow:**
```
URL (?metrics=compute,mmlu&from=2015&to=2025&cat=market)
        |
        v
    useVisualizationState()
        |
        +---> ControlPanelWrapper ---> ControlPanel
        |                                   |
        v                                   v
    HomeClient               [MetricsToggle, DateRangeSlider, CategoryCheckboxes]
        |
        v
    ScatterPlot (filters + renders)
```

### Key Design Decisions

1. **Single source of truth:** `useVisualizationState` is called ONCE at the page level
2. **Props drilling:** State flows down via props (no context for this scope)
3. **ScatterPlot already supports props:** `enabledMetrics` and `dateRange` props exist
4. **Visible count calculation:** ControlPanel needs `stats.visible` based on filtered data
5. **Backward compatibility:** `useFilters` can be deprecated after this story

---

## Acceptance Criteria

### AC-1: ControlPanelWrapper Uses URL State

**Given** `ControlPanelWrapper` component
**When** rendered
**Then** uses `useVisualizationState` hook for:
- `enabledMetrics` from `metrics`
- `selectedCategories` from `categories`
- `dateRange` from `dateRange`
- Actual setters (not no-op handlers)

**And** no longer uses placeholder values

### AC-2: State Flows to ScatterPlot

**Given** user adjusts controls in sidebar
**When** metrics, categories, or dateRange changes
**Then** `ScatterPlot` receives updated props and re-renders

**Specific props:**
- `enabledMetrics` - affects Y-axis domain calculation
- `dateRange` - affects Y-axis domain calculation
- `activeCategories` - affects point filtering/opacity

### AC-3: Stats Show Visible Count

**Given** ControlPanel displays stats
**When** category filter is active
**Then** shows accurate "Showing X of Y" count

**Example:**
- Total: 50 obituaries
- Category filter: `['market', 'agi']`
- Visible: 23 obituaries matching those categories
- Display: "Showing 23 of 50"

### AC-4: URL Updates Reflect in Visualization

**Given** URL contains `?metrics=compute,mmlu&from=2015&to=2025&cat=market`
**When** page loads (or URL changes via browser back/forward)
**Then**:
- ControlPanel shows correct toggle/slider/checkbox states
- ScatterPlot renders with those settings applied

### AC-5: Tablet/Mobile Sheet Works

**Given** viewport < 1024px (tablet) or < 768px (mobile)
**When** control sheet is opened
**Then** state changes in sheet affect visualization
**And** URL updates appropriately

### AC-6: Replace Legacy useFilters in HomeClient

**Given** `HomeClient` component
**When** rendered in hero variant (desktop)
**Then** uses state passed from parent (page.tsx)
**And** no longer calls `useFilters()` internally for hero variant

---

## Technical Implementation

### Files to Modify

```
src/components/controls/control-panel-wrapper.tsx  # Wire useVisualizationState
src/app/home-client.tsx                             # Accept state props
src/app/page.tsx                                    # Orchestrate state flow
```

### Implementation Guide

**1. Update ControlPanelWrapper (AC-1):**

```typescript
// src/components/controls/control-panel-wrapper.tsx
'use client'

import { ControlPanel, type DisplayOptions } from './control-panel'
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import type { Category } from '@/types/obituary'

interface ControlPanelWrapperProps {
  /** Total count of obituaries */
  totalCount: number
  /** Visible count after filtering (optional - calculated if not provided) */
  visibleCount?: number
  /** Layout variant */
  variant?: 'sidebar' | 'sheet' | 'drawer'
}

/**
 * Client-side wrapper for ControlPanel that manages URL state.
 * Connects useVisualizationState hook to ControlPanel props.
 */
export function ControlPanelWrapper({
  totalCount,
  visibleCount,
  variant = 'sidebar',
}: ControlPanelWrapperProps) {
  const {
    metrics,
    setMetrics,
    categories,
    setCategories,
    dateRange,
    setDateRange,
  } = useVisualizationState()

  // Placeholder for future display options
  const displayOptions: DisplayOptions = {
    showTrendAnnotations: true,
    enableClustering: false,
  }
  const handleDisplayOptionsChange = () => {}

  return (
    <ControlPanel
      enabledMetrics={metrics}
      onMetricsChange={setMetrics}
      selectedCategories={categories}
      onCategoriesChange={setCategories}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      displayOptions={displayOptions}
      onDisplayOptionsChange={handleDisplayOptionsChange}
      stats={{
        total: totalCount,
        visible: visibleCount ?? totalCount,
      }}
      variant={variant}
    />
  )
}
```

**2. Update HomeClient Props (AC-2, AC-6):**

```typescript
// src/app/home-client.tsx - Add props for state (hero variant only)
export interface HomeClientProps {
  obituaries: ObituarySummary[]
  variant?: 'default' | 'hero'
  // New props for hero variant state from parent
  enabledMetrics?: MetricType[]
  dateRange?: [number, number]
  activeCategories?: Category[]
}

export function HomeClient({
  obituaries,
  variant = 'default',
  enabledMetrics,
  dateRange,
  activeCategories: externalCategories,
}: HomeClientProps) {
  // For hero variant, use external state if provided
  // For default variant, use internal useFilters (backward compat)
  const { categories: internalCategories, toggleCategory, clearFilters } = useFilters()

  const categories = variant === 'hero' && externalCategories !== undefined
    ? externalCategories
    : internalCategories

  // ... rest of component

  if (variant === 'hero') {
    return (
      <div className="h-full">
        {!isHydrated || mode === 'visualization' ? (
          <ScatterPlot
            data={obituaries}
            activeCategories={categories}
            enabledMetrics={enabledMetrics}
            dateRange={dateRange}
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
  // ... default variant unchanged
}
```

**3. Update page.tsx to Orchestrate State (AC-3, AC-4):**

```typescript
// src/app/page.tsx - Create client wrapper for state orchestration
// Option A: Create HomePageClient component
// Option B: Use existing HomeClient with lifted state

// The challenge: page.tsx is a Server Component, can't call hooks
// Solution: Create HomePageClient that wraps both HomeClient and ControlPanelWrapper
```

**New File: src/app/home-page-client.tsx**

```typescript
'use client'

import { useMemo } from 'react'
import { HomeClient } from './home-client'
import { ControlPanelWrapper } from '@/components/controls'
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import type { ObituarySummary } from '@/types/obituary'

interface HomePageClientProps {
  obituaries: ObituarySummary[]
}

/**
 * Client wrapper for desktop homepage that coordinates state between
 * ControlPanel and visualization. Single source of truth for URL state.
 */
export function HomePageClient({ obituaries }: HomePageClientProps) {
  const {
    metrics,
    setMetrics,
    categories,
    setCategories,
    dateRange,
    setDateRange,
  } = useVisualizationState()

  // Calculate visible count based on category filter
  const visibleCount = useMemo(() => {
    if (categories.length === 0) return obituaries.length
    return obituaries.filter((obit) =>
      obit.categories?.some((cat) => categories.includes(cat))
    ).length
  }, [obituaries, categories])

  return (
    <>
      {/* Chart section */}
      <section className="relative overflow-hidden h-full">
        <HomeClient
          obituaries={obituaries}
          variant="hero"
          enabledMetrics={metrics}
          dateRange={dateRange}
          activeCategories={categories}
        />
      </section>

      {/* Sidebar */}
      <aside className="border-l border-border overflow-y-auto bg-secondary" aria-label="Controls panel">
        <ControlPanelWrapper
          totalCount={obituaries.length}
          visibleCount={visibleCount}
          variant="sidebar"
        />
      </aside>
    </>
  )
}
```

**4. Update page.tsx to use HomePageClient:**

```tsx
// src/app/page.tsx - Desktop section
<div className="hidden lg:block">
  <main className="flex flex-col min-h-screen">
    <header className="flex items-center px-6 py-4 border-b border-border">
      <CountDisplayCompact />
    </header>

    <div className="grid grid-cols-[1fr_320px] flex-1 min-h-[500px] gap-0">
      <Suspense fallback={null}>
        <HomePageClient obituaries={obituaries} />
      </Suspense>
    </div>
  </main>
</div>
```

### Test Verification

Manual testing checklist (no new unit tests needed for wiring):

1. **Desktop sidebar:**
   - [ ] Toggle metrics - Y-axis domain updates
   - [ ] Adjust date slider - Y-axis domain updates
   - [ ] Check/uncheck categories - points fade in/out
   - [ ] URL updates as controls change
   - [ ] Refresh page - controls restore from URL

2. **Tablet/Mobile sheet:**
   - [ ] Open sheet, toggle metric - verify visualization updates
   - [ ] Adjust slider - verify visualization updates
   - [ ] Check category - verify filtering works
   - [ ] Close sheet - changes persist

3. **Stats display:**
   - [ ] With no filter: "Showing 50 of 50"
   - [ ] With filter: "Showing 23 of 50" (actual filtered count)

4. **URL state:**
   - [ ] Navigate to `/?metrics=compute,mmlu&from=2015&to=2025&cat=market`
   - [ ] Verify controls reflect URL state
   - [ ] Verify visualization reflects URL state
   - [ ] Browser back/forward works

---

## Tasks

### Task 1: Create HomePageClient Component (AC-1, AC-2, AC-3)
- [ ] Create `src/app/home-page-client.tsx`
- [ ] Call `useVisualizationState()` once as single source of truth
- [ ] Calculate visible count based on categories filter
- [ ] Pass state to HomeClient and ControlPanelWrapper
- [ ] Add JSDoc documentation

### Task 2: Update ControlPanelWrapper (AC-1)
- [ ] Add `visibleCount` prop to interface
- [ ] Remove placeholder state
- [ ] Call `useVisualizationState()` (or receive via props)
- [ ] Wire actual setters to ControlPanel props
- [ ] Update stats.visible to use visibleCount prop

### Task 3: Update HomeClient (AC-2, AC-6)
- [ ] Add optional props: `enabledMetrics`, `dateRange`, `activeCategories`
- [ ] For hero variant, use external state props if provided
- [ ] Pass `enabledMetrics` and `dateRange` to ScatterPlot
- [ ] Keep backward compatibility for default variant (uses useFilters)

### Task 4: Update page.tsx (AC-4)
- [ ] Import HomePageClient
- [ ] Replace desktop grid contents with HomePageClient
- [ ] Remove direct ControlPanelWrapper from page.tsx (now in HomePageClient)
- [ ] Ensure Suspense boundary wraps correctly

### Task 5: Update ControlSheet for Mobile (AC-5)
- [ ] Verify ControlSheet uses useVisualizationState correctly
- [ ] Ensure sheet variant passes state to visualization
- [ ] Test mobile/tablet state synchronization

### Task 6: Manual Testing & Verification (AC-1-6)
- [ ] Run `bun dev` and test all desktop controls
- [ ] Test tablet drawer controls
- [ ] Test mobile bottom sheet controls
- [ ] Verify URL state persistence
- [ ] Verify stats visible count accuracy
- [ ] Run `bun run lint` - no TypeScript errors
- [ ] Run `bun test:run` - existing tests pass

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] All tasks completed
- [ ] `useVisualizationState` is single source of truth for control state
- [ ] ControlPanel changes reflect in ScatterPlot visualization
- [ ] URL state persists and restores correctly
- [ ] Stats show accurate visible/total counts
- [ ] Desktop, tablet, and mobile all work
- [ ] No TypeScript errors: `bun run lint`
- [ ] Existing tests pass: `bun test:run`
- [ ] Epic TSR-3 is COMPLETE

---

## Dev Notes

### Architecture Decision: Single Hook Call

The key architectural decision is WHERE to call `useVisualizationState()`:

**Option A (Chosen): HomePageClient orchestrator**
- Single hook call in HomePageClient
- Props drill to HomeClient and ControlPanelWrapper
- Clear data flow, easy to reason about

**Option B: Both components call hook**
- ControlPanelWrapper calls hook
- HomeClient calls hook
- nuqs ensures sync via URL
- More coupling, less explicit

Option A is preferred for explicit data flow and easier debugging.

### ControlSheet Consideration

The `ControlSheet` component (tablet/mobile) may need similar treatment:
- Currently uses ControlPanelWrapper which will now call useVisualizationState
- This should "just work" since nuqs syncs via URL
- Verify in testing

### Visible Count Calculation

The visible count is calculated by filtering obituaries:
```typescript
const visibleCount = useMemo(() => {
  if (categories.length === 0) return obituaries.length
  return obituaries.filter((obit) =>
    obit.categories?.some((cat) => categories.includes(cat))
  ).length
}, [obituaries, categories])
```

Note: Only categories affect visible count (not metrics or dateRange), because:
- Metrics toggle background lines, not points
- DateRange affects Y-axis domain, not which points render

### ScatterPlot Props Recap

ScatterPlot already accepts these props (from previous stories):
```typescript
interface ScatterPlotProps {
  data: ObituarySummary[]
  activeCategories?: Category[]     // Filters points by category
  enabledMetrics?: MetricType[]     // Affects Y-axis domain calculation
  dateRange?: [number, number]      // Affects Y-axis domain calculation
  fillContainer?: boolean
}
```

### Backward Compatibility

The default variant of HomeClient (used on tablet/mobile) keeps using `useFilters` internally for now. This maintains backward compatibility. Future story can unify.

### References

- [Source: docs/sprint-artifacts/epics-timeline-redesign.md#Story 3.5]
- [Source: src/lib/hooks/use-visualization-state.ts - URL state hook]
- [Source: src/components/controls/control-panel.tsx - ControlPanel with all controls]
- [Source: src/components/visualization/scatter-plot.tsx - ScatterPlot props]
- [Source: src/app/page.tsx - Current page structure]
- [Source: src/app/home-client.tsx - HomeClient component]

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

### Completion Notes List

### File List
