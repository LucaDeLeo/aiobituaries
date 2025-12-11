---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
workflowStatus: complete
inputDocuments:
  - docs/prd.md
  - docs/architecture.md
  - docs/ux-design-specification.md
  - docs/sprint-artifacts/tech-spec-timeline-visualization-redesign.md
feature: Timeline Visualization Redesign
type: brownfield-evolution
---

# Timeline Visualization Redesign - Epic Breakdown

**Feature:** Timeline Visualization Redesign
**Type:** Brownfield Evolution (rework + expansion)
**Source:** `docs/sprint-artifacts/tech-spec-timeline-visualization-redesign.md`

---

## Overview

This document breaks down the Timeline Visualization Redesign into implementable epics and stories. This is a **brownfield evolution** - reworking existing visualization features and expanding capabilities.

**Core Change:** Transform the visualization to make the timeline hero element with a log-scale FLOP Y-axis, following Epoch AI's proven layout pattern.

---

## PRD Alignment Analysis

### Requirements Modified by This Feature

| Original PRD | Tech Spec Change | Impact |
|--------------|------------------|--------|
| FR7 (interactive timeline) | Hero chart ~75% width + sidebar | Layout restructure |
| FR13 (mobile list view) | Mobile keeps chart + bottom sheet | Approach change |
| FR15 (category filter) | Moved to sidebar checkboxes | UI location change |
| FR18 (URL state) | Expanded: metrics, date range, categories | Extended URL params |
| FR37 (responsive timeline) | Grid layout + responsive surfaces | Layout approach |
| Architecture ADR-003 (Contextual Y-Axis) | **REPLACED** by log-scale FLOP | Core visualization change |
| UX "The Scroll" design | **REPLACED** by grid+sidebar | Layout paradigm shift |

### New Requirements (Not in PRD)

| ID | Requirement | Source |
|----|-------------|--------|
| TSR-NEW-1 | Log-scale Y-axis with FLOP values (10^17 to 10^27) | Tech Spec AC-2 |
| TSR-NEW-2 | Scientific notation tick labels (10^18, 10^20, etc.) | Tech Spec AC-2 |
| TSR-NEW-3 | Multiple metric toggles (compute/mmlu/eci) | Tech Spec AC-4 |
| TSR-NEW-4 | Date range slider (1950-2025 adjustable) | Tech Spec AC-3 |
| TSR-NEW-5 | Right sidebar control panel (320px) | Tech Spec AC-1 |
| TSR-NEW-6 | URL state for metrics: ?metrics=compute,mmlu | Tech Spec AC-4 |
| TSR-NEW-7 | URL state for date range: ?from=YYYY&to=YYYY | Tech Spec AC-3 |

### PRD Requirements Maintained

FR8 (pan), FR9 (zoom), FR10 (density), FR11 (tooltips), FR12 (click modal), FR14 (categories), FR17 (filter updates), FR38-44 (accessibility), FR45-47 (performance)

---

## Functional Requirements Inventory

### From Tech Spec Acceptance Criteria

| ID | Requirement | AC Source |
|----|-------------|-----------|
| TSR1 | Chart occupies ~75% width on desktop (>=1024px) with fixed 320px sidebar | AC-1 |
| TSR2 | Chart height is calc(100vh - header) with min 500px | AC-1 |
| TSR3 | Tablet (768-1023px): full-width chart with slide-in drawer | AC-1 |
| TSR4 | Mobile (<768px): full-width chart with bottom sheet | AC-1 |
| TSR5 | Y-axis uses logarithmic scale (base 10) | AC-2 |
| TSR6 | Tick labels display scientific notation (10^18, 10^20) | AC-2 |
| TSR7 | Grid lines appear at each labeled tick value | AC-2 |
| TSR8 | Obituaries position correctly on log scale based on FLOP at date | AC-2 |
| TSR9 | Default time domain is 2010-2025 | AC-3 |
| TSR10 | Date range adjustable via dual-handle slider (1950-2025) | AC-3 |
| TSR11 | URL updates with ?from=YYYY&to=YYYY | AC-3 |
| TSR12 | Chart responds to date range changes in real-time | AC-3 |
| TSR13 | Training Compute enabled by default | AC-4 |
| TSR14 | MMLU Score toggleable | AC-4 |
| TSR15 | Capability Index toggleable | AC-4 |
| TSR16 | URL reflects enabled metrics: ?metrics=compute,mmlu | AC-4 |
| TSR17 | Background trend lines appear/disappear on toggle | AC-4 |
| TSR18 | Category filter via sidebar checkboxes (multi-select) | AC-5 |
| TSR19 | URL reflects categories: ?cat=market,agi | AC-5 |
| TSR20 | Points filter via opacity change | AC-5 |

### Non-Functional Requirements

| ID | Requirement | AC Source |
|----|-------------|-----------|
| NFR1 | No jank during pan/zoom | AC-6 |
| NFR2 | Slider drags smoothly (400ms debounced URL updates) | AC-6 |
| NFR3 | Initial paint < 1s on 4G | AC-6 |
| NFR4 | Filter changes < 100ms visual response | AC-6 |
| NFR5 | All controls keyboard accessible | AC-7 |
| NFR6 | Sliders have proper ARIA labels | AC-7 |
| NFR7 | Color contrast meets WCAG AA | AC-7 |
| NFR8 | Screen reader announces filter changes | AC-7 |
| NFR9 | Full state encoded in URL | AC-8 |
| NFR10 | Shared URLs reproduce exact view | AC-8 |
| NFR11 | Browser back/forward works correctly | AC-8 |

---

## FR Coverage Map

| Epic | Requirements Covered |
|------|---------------------|
| Epic 1: Layout Foundation | TSR1, TSR2, TSR3, TSR4 |
| Epic 2: Y-Axis Log Scale | TSR5, TSR6, TSR7, TSR8 |
| Epic 3: Control Panel | TSR9-TSR20, NFR5, NFR6 |
| Epic 4: Background Chart | TSR13-TSR17 |
| Epic 5: Polish & Mobile | NFR1-NFR4, NFR7-NFR11 |

---

## Epic List

| Epic | Title | Stories | User Value |
|------|-------|---------|------------|
| 1 | Layout Foundation | 3 | Hero chart experience, Epoch-style layout |
| 2 | Y-Axis Log Scale | 4 | Real FLOP values make AI progress tangible |
| 3 | Control Panel | 5 | User control over visualization state |
| 4 | Background Chart Updates | 2 | Multiple metrics as backdrop |
| 5 | Polish & Mobile | 4 | Complete cross-device experience |

**Total: 18 Stories**

---

## Epic 1: Layout Foundation

**Goal:** Restructure page layout to make chart the hero element with sidebar controls

**User Value:** Dominant visualization experience following Epoch AI's proven pattern

**Requirements:** TSR1, TSR2, TSR3, TSR4

**Dependencies:** None (foundation epic)

---

### Story 1.1: Create CSS Grid Page Layout

**As a** visitor,
**I want** the chart to dominate the page with controls in a sidebar,
**So that** I can focus on the visualization while having easy access to controls.

**Acceptance Criteria:**

**Given** viewport width >= 1024px (desktop)
**When** homepage loads
**Then** layout displays:
- Chart area: ~75% width (1fr in grid)
- Sidebar: fixed 320px on right
- Chart height: calc(100vh - 64px) with min 500px
- No gap between chart and sidebar

**And** grid structure:
```tsx
<main className="grid grid-cols-[1fr_320px] h-[calc(100vh-64px)] gap-0">
  <section className="relative overflow-hidden">
    <ScatterPlot ... />
  </section>
  <aside className="border-l border-border overflow-y-auto">
    <ControlPanel ... />
  </aside>
</main>
```

**Given** sidebar content overflows
**When** scrolling sidebar
**Then** sidebar scrolls independently, chart remains fixed

**Technical Notes:**
- Modify `src/app/page.tsx` for layout structure
- Modify `src/components/home-client.tsx` for client wrapper
- Use CSS Grid with fixed sidebar width
- Ensure chart fills available height

**Files Modified:**
- `src/app/page.tsx`
- `src/components/home-client.tsx`

**Prerequisites:** None

---

### Story 1.2: Create ControlPanel Shell Component

**As a** developer,
**I want** a container component for all visualization controls,
**So that** controls are organized and reusable across responsive variants.

**Acceptance Criteria:**

**Given** ControlPanel component
**When** rendered in sidebar
**Then** displays:
- Collapsible sections for each control group
- Consistent padding and spacing
- Header with "Controls" or similar label
- Stats display (total/visible obituary count)

**And** interface:
```typescript
interface ControlPanelProps {
  enabledMetrics: MetricType[];
  onMetricsChange: (metrics: MetricType[]) => void;
  selectedCategories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  dateRange: [number, number];
  onDateRangeChange: (range: [number, number]) => void;
  displayOptions: DisplayOptions;
  onDisplayOptionsChange: (options: DisplayOptions) => void;
  stats: { total: number; visible: number };
  variant?: 'sidebar' | 'sheet' | 'drawer';
}
```

**And** sections:
1. Background Metrics (toggles)
2. Time Range (slider)
3. Categories (checkboxes)
4. Display Options (toggles) - future

**Technical Notes:**
- Create `src/components/controls/control-panel.tsx`
- Use `@radix-ui/react-collapsible` for sections
- Variant prop controls styling for different surfaces

**Files Created:**
- `src/components/controls/control-panel.tsx`
- `src/components/controls/index.ts` (barrel export)

**Prerequisites:** Story 1.1

---

### Story 1.3: Implement Responsive Control Surfaces

**As a** tablet/mobile user,
**I want** access to controls appropriate for my device,
**So that** I can use the visualization on any screen size.

**Acceptance Criteria:**

**Given** viewport width 768-1023px (tablet)
**When** page loads
**Then**:
- Chart takes full width
- Control button visible (hamburger or cog icon)
- Clicking button opens drawer from right
- Drawer contains ControlPanel with variant="drawer"

**Given** viewport width < 768px (mobile)
**When** page loads
**Then**:
- Chart takes full width
- Control button visible at bottom or floating
- Clicking button opens bottom sheet
- Sheet contains ControlPanel with variant="sheet"

**And** responsive breakpoints:
```tsx
// Desktop: sidebar always visible
<aside className="hidden lg:block">
  <ControlPanel variant="sidebar" />
</aside>

// Tablet: drawer
<Drawer className="hidden md:block lg:hidden">
  <ControlPanel variant="drawer" />
</Drawer>

// Mobile: bottom sheet
<Sheet className="md:hidden">
  <ControlPanel variant="sheet" />
</Sheet>
```

**Technical Notes:**
- Create `src/components/controls/control-sheet.tsx`
- Use shadcn Sheet component with side="bottom" for mobile
- Use shadcn Sheet with side="right" for tablet drawer
- Control visibility with Tailwind responsive classes

**Files Created:**
- `src/components/controls/control-sheet.tsx`
- `src/components/controls/control-trigger.tsx` (button to open)

**Files Modified:**
- `src/app/page.tsx` (add responsive surfaces)

**Prerequisites:** Story 1.2

---

### Epic 1 Summary

| Story | Title | Requirements | Prerequisites |
|-------|-------|--------------|---------------|
| 1.1 | CSS Grid Page Layout | TSR1, TSR2 | None |
| 1.2 | ControlPanel Shell | - | 1.1 |
| 1.3 | Responsive Control Surfaces | TSR3, TSR4 | 1.2 |

**Epic 1 Completion Criteria:**
- [ ] Desktop: Chart ~75% + 320px sidebar
- [ ] Tablet: Full-width chart + drawer
- [ ] Mobile: Full-width chart + bottom sheet
- [ ] ControlPanel renders in all variants
- [ ] Chart height fills viewport (min 500px)

---

## Epic 2: Y-Axis Log Scale

**Goal:** Convert Y-axis to logarithmic scale showing real FLOP values

**User Value:** Users see actual scale of AI progress - makes the exponential growth tangible

**Requirements:** TSR5, TSR6, TSR7, TSR8

**Dependencies:** Epic 1 (needs new layout margin for labels)

---

### Story 2.1: Create Scale Utilities

**As a** developer,
**I want** utilities for logarithmic scale operations,
**So that** FLOP calculations are consistent across components.

**Acceptance Criteria:**

**Given** scale utilities module
**When** imported
**Then** exports:

```typescript
// Log tick values (10^17 to 10^27)
export const LOG_TICK_VALUES = [
  1e17, 1e18, 1e19, 1e20, 1e21, 1e22, 1e23, 1e24, 1e25, 1e26, 1e27
];

// Create log scale for Y-axis
export function createLogYScale(height: number, domain: [number, number]) {
  return scaleLog({ domain, range: [height, 0], base: 10 });
}

// Format tick as superscript notation
export function formatFlopTick(value: number): string {
  const exp = Math.round(Math.log10(value));
  return `10${toSuperscript(exp)}`;
}

// Convert between log and linear values
export function logToFlop(logValue: number): number;
export function flopToLog(flop: number): number;
```

**And** superscript formatting:
- Uses Unicode superscript characters: ⁰¹²³⁴⁵⁶⁷⁸⁹
- Handles negative exponents if needed

**Technical Notes:**
- Create `src/lib/utils/scales.ts`
- Use `@visx/scale` scaleLog
- Test with edge cases (very small/large values)

**Files Created:**
- `src/lib/utils/scales.ts`
- `tests/unit/lib/utils/scales.test.ts`

**Prerequisites:** None (can be done in parallel with Epic 1)

---

### Story 2.2: Update ai-metrics.ts Helpers

**As a** developer,
**I want** metric helpers that work with log scale,
**So that** I can get actual FLOP values at any date.

**Acceptance Criteria:**

**Given** ai-metrics.ts module
**When** new helpers are called
**Then** exports:

```typescript
// Get actual FLOP value (not log) at a date
export function getActualFlopAtDate(series: AIMetricSeries, date: Date): number {
  const logValue = getMetricValueAtDate(series, date);
  return Math.pow(10, logValue);
}

// Filter metrics by date range
export function filterMetricsByDateRange(
  series: AIMetricSeries,
  startYear: number,
  endYear: number
): MetricDataPoint[];

// Get Y-axis domain for date range
export function getMetricDomain(
  series: AIMetricSeries,
  startYear: number,
  endYear: number
): [number, number];
```

**And** domain calculation:
- Finds min/max FLOP in date range
- Adds 1 order of magnitude padding on each end
- Returns domain suitable for log scale

**Technical Notes:**
- Modify `src/data/ai-metrics.ts`
- Existing `getMetricValueAtDate` returns log values
- New helpers convert to/from actual FLOP

**Files Modified:**
- `src/data/ai-metrics.ts`

**Files Created:**
- `tests/unit/data/ai-metrics.test.ts` (extend existing tests)

**Prerequisites:** Story 2.1

---

### Story 2.3: Update ScatterPlot Y-Axis

**As a** visitor,
**I want** obituaries positioned on a log scale Y-axis,
**So that** I can see their relationship to actual AI compute levels.

**Acceptance Criteria:**

**Given** scatter plot renders
**When** Y-axis is calculated
**Then**:
- Uses `scaleLog` instead of previous scale
- Domain based on date range FLOP values
- Points positioned at FLOP value for their date

**And** left margin increased:
- From ~20px to 72px to accommodate tick labels
- Space for "10²⁴" style labels

**And** point positioning:
```typescript
const yScale = useMemo(() => {
  const domain = getMetricDomain(trainingComputeFrontier, dateRange[0], dateRange[1]);
  return createLogYScale(innerHeight, domain);
}, [innerHeight, dateRange]);

const pointPositions = useMemo(() => {
  return data.map((obituary) => {
    const obituaryDate = new Date(obituary.date);
    const baseFlop = getActualFlopAtDate(trainingComputeFrontier, obituaryDate);

    // Jitter in log-space (+-0.3 orders of magnitude)
    const jitterExp = (hashToJitter(obituary._id) - 0.5) * 0.6;
    const jitteredFlop = baseFlop * Math.pow(10, jitterExp);

    return {
      obituary,
      x: xScale(obituaryDate) ?? 0,
      y: yScale(jitteredFlop) ?? 0,
      color: getCategoryColor(obituary.categories),
    };
  });
}, [data, xScale, yScale]);
```

**Technical Notes:**
- Modify `src/components/visualization/scatter-plot.tsx`
- Jitter in log-space, not linear space
- Update margin constants

**Files Modified:**
- `src/components/visualization/scatter-plot.tsx`

**Prerequisites:** Story 2.2

---

### Story 2.4: Add Y-Axis Labels and Grid

**As a** visitor,
**I want** labeled Y-axis ticks with grid lines,
**So that** I can read the actual FLOP scale.

**Acceptance Criteria:**

**Given** scatter plot renders
**When** Y-axis is drawn
**Then** displays:
- Axis line on left side
- Tick marks at LOG_TICK_VALUES within domain
- Labels in superscript notation (10¹⁸, 10²⁰, etc.)
- Labels styled: 11px, muted color, right-aligned

**And** grid lines:
- Horizontal lines at each labeled tick
- Style: `--border` color, 30% opacity
- Extend full chart width

**And** implementation:
```tsx
import { AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';

<AxisLeft
  scale={yScale}
  tickValues={LOG_TICK_VALUES.filter(v =>
    v >= yScale.domain()[0] && v <= yScale.domain()[1]
  )}
  tickFormat={formatFlopTick}
  stroke="var(--border)"
  tickStroke="var(--border)"
  tickLabelProps={() => ({
    fill: 'var(--text-secondary)',
    fontSize: 11,
    textAnchor: 'end',
    dx: -8,
    dy: 4,
  })}
/>

<GridRows
  scale={yScale}
  width={innerWidth}
  tickValues={LOG_TICK_VALUES.filter(v =>
    v >= yScale.domain()[0] && v <= yScale.domain()[1]
  )}
  stroke="var(--border)"
  strokeOpacity={0.3}
/>
```

**Technical Notes:**
- Add `@visx/axis` and `@visx/grid` imports
- Filter tick values to visible range
- Match existing X-axis styling

**Files Modified:**
- `src/components/visualization/scatter-plot.tsx`

**Prerequisites:** Story 2.3

---

### Epic 2 Summary

| Story | Title | Requirements | Prerequisites |
|-------|-------|--------------|---------------|
| 2.1 | Scale Utilities | TSR5 | None |
| 2.2 | ai-metrics.ts Helpers | TSR8 | 2.1 |
| 2.3 | ScatterPlot Y-Axis | TSR5, TSR8 | 2.2 |
| 2.4 | Y-Axis Labels and Grid | TSR6, TSR7 | 2.3 |

**Epic 2 Completion Criteria:**
- [ ] Y-axis uses logarithmic scale
- [ ] Tick labels show 10^XX notation
- [ ] Grid lines at each tick
- [ ] Obituaries positioned at correct FLOP values
- [ ] Left margin accommodates labels (72px)

---

## Epic 3: Control Panel Implementation

**Goal:** Implement all control panel components with URL state management

**User Value:** Full control over visualization: date range, metrics, categories

**Requirements:** TSR9-TSR20, NFR5, NFR6

**Dependencies:** Epic 1 (ControlPanel shell)

---

### Story 3.1: Create URL State Hook

**As a** visitor,
**I want** visualization state persisted in URL,
**So that** I can share and bookmark specific views.

**Acceptance Criteria:**

**Given** useVisualizationState hook
**When** called
**Then** returns:
```typescript
{
  metrics: MetricType[];        // ['compute'] default
  setMetrics: (m: MetricType[]) => void;
  categories: Category[];       // [] = all
  setCategories: (c: Category[]) => void;
  dateRange: [number, number];  // [2010, 2025] default
  setDateRange: (r: [number, number]) => void;
  isPending: boolean;           // transition state
}
```

**And** URL format:
- `?metrics=compute,mmlu` - enabled metrics
- `?cat=market,agi` - selected categories
- `?from=2010&to=2025` - date range

**And** behavior:
- Shallow updates (no page reload)
- Date range debounced (400ms) to avoid URL spam
- Categories/metrics update immediately
- Empty arrays omit param from URL

**Technical Notes:**
- Create `src/lib/hooks/use-visualization-state.ts`
- Use nuqs `parseAsArrayOf`, `parseAsInteger`
- Use `useTransition` for pending state

**Files Created:**
- `src/lib/hooks/use-visualization-state.ts`
- `tests/unit/lib/hooks/use-visualization-state.test.ts`

**Prerequisites:** Story 1.2

---

### Story 3.2: Implement MetricsToggle Component

**As a** visitor,
**I want** to toggle which metrics appear as background lines,
**So that** I can see different measures of AI progress.

**Acceptance Criteria:**

**Given** MetricsToggle component
**When** rendered
**Then** displays:
- "Background Metrics" header
- Checkbox for each metric:
  - Training Compute (green #76b900)
  - MMLU Score (yellow #eab308)
  - Capability Index (indigo #6366f1)
- Color swatch next to each label
- Brief description below each

**And** interaction:
- Check/uncheck toggles metric
- At least one metric should remain enabled (or allow none?)
- onChange called with updated array

**And** implementation per tech spec:
```tsx
const METRICS = [
  { id: 'compute', label: 'Training Compute',
    description: 'FLOP trend line', color: 'rgb(118, 185, 0)' },
  { id: 'mmlu', label: 'MMLU Score',
    description: 'Benchmark accuracy', color: 'rgb(234, 179, 8)' },
  { id: 'eci', label: 'Capability Index',
    description: 'Epoch composite', color: 'rgb(99, 102, 241)' },
] as const;
```

**Technical Notes:**
- Create `src/components/controls/metrics-toggle.tsx`
- Use shadcn Checkbox component
- Accessible: proper labels, keyboard support

**Files Created:**
- `src/components/controls/metrics-toggle.tsx`

**Prerequisites:** Story 3.1

---

### Story 3.3: Implement DateRangeSlider Component

**As a** visitor,
**I want** to adjust the visible time range,
**So that** I can focus on specific eras of AI development.

**Acceptance Criteria:**

**Given** DateRangeSlider component
**When** rendered
**Then** displays:
- "Time Range" header
- Current range display: "2010 - 2025"
- Dual-handle slider
- Min/max labels: "1950" / "2025"

**And** slider behavior:
- Two handles: start year, end year
- Range: 1950 to 2025
- Minimum gap: 1 year
- Step: 1 year

**And** interaction:
- Drag handles to adjust range
- onChange called during drag (for live preview)
- URL updates debounced (400ms after drag stops)
- Keyboard: arrow keys to adjust

**And** implementation per tech spec:
```tsx
<Slider.Root
  value={value}
  onValueChange={(v) => onChange(v as [number, number])}
  min={1950}
  max={2025}
  step={1}
  minStepsBetweenThumbs={1}
>
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.Thumb aria-label="Start year" />
  <Slider.Thumb aria-label="End year" />
</Slider.Root>
```

**Technical Notes:**
- Create `src/components/controls/date-range-slider.tsx`
- Use `@radix-ui/react-slider`
- ARIA labels for accessibility

**Files Created:**
- `src/components/controls/date-range-slider.tsx`

**Prerequisites:** Story 3.1

---

### Story 3.4: Migrate CategoryFilter to Checkboxes

**As a** visitor,
**I want** category filters in the sidebar,
**So that** I can filter obituaries while viewing controls.

**Acceptance Criteria:**

**Given** CategoryCheckboxes component
**When** rendered
**Then** displays:
- "Categories" header
- Checkbox for each category with color dot + label
- Count of obituaries per category (optional)
- "All" toggle or clear button

**And** four categories:
- Capability Doubt (#C9A962)
- Market/Bubble (#7B9E89)
- AGI Skepticism (#9E7B7B)
- Dismissive (#7B7B9E)

**And** interaction:
- Multi-select (multiple categories can be active)
- Empty selection = show all
- onChange called with selected array

**And** migrates behavior from existing `category-filter.tsx`:
- Keep existing filter logic
- Just move UI to checkbox format
- URL state: `?cat=market,agi`

**Technical Notes:**
- Create `src/components/controls/category-checkboxes.tsx`
- Reuse category constants from existing filter
- May keep `category-filter.tsx` for backward compatibility or deprecate

**Files Created:**
- `src/components/controls/category-checkboxes.tsx`

**Files Modified:**
- `src/components/filters/category-filter.tsx` (may deprecate)

**Prerequisites:** Story 3.1

---

### Story 3.5: Assemble ControlPanel

**As a** developer,
**I want** all controls assembled in ControlPanel,
**So that** the sidebar/sheet/drawer has complete functionality.

**Acceptance Criteria:**

**Given** ControlPanel component
**When** rendered with all props
**Then** displays sections:
1. Stats header (visible/total obituaries)
2. Background Metrics (collapsible, expanded default)
3. Time Range (collapsible, expanded default)
4. Categories (collapsible, expanded default)
5. Display Options (future - collapsed or hidden)

**And** collapsible sections:
- Use `@radix-ui/react-collapsible`
- Chevron icon indicates state
- Smooth expand/collapse animation

**And** variant styling:
- sidebar: full padding, scroll shadows
- sheet: reduced padding, closer spacing
- drawer: similar to sidebar

**And** connects all controls:
```tsx
<ControlPanel
  enabledMetrics={metrics}
  onMetricsChange={setMetrics}
  selectedCategories={categories}
  onCategoriesChange={setCategories}
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
  stats={{ total, visible }}
  variant="sidebar"
/>
```

**Technical Notes:**
- Update `src/components/controls/control-panel.tsx`
- Add Collapsible from Radix
- Wire up all child components

**Files Modified:**
- `src/components/controls/control-panel.tsx`

**Prerequisites:** Stories 3.2, 3.3, 3.4

---

### Epic 3 Summary

| Story | Title | Requirements | Prerequisites |
|-------|-------|--------------|---------------|
| 3.1 | URL State Hook | TSR11, TSR16, TSR19, NFR9-11 | 1.2 |
| 3.2 | MetricsToggle | TSR13-TSR15 | 3.1 |
| 3.3 | DateRangeSlider | TSR9, TSR10, TSR12, NFR6 | 3.1 |
| 3.4 | CategoryCheckboxes | TSR18, TSR19, TSR20 | 3.1 |
| 3.5 | Assemble ControlPanel | All control TSRs | 3.2, 3.3, 3.4 |

**Epic 3 Completion Criteria:**
- [ ] URL state hook manages all params
- [ ] Metrics toggle works with URL sync
- [ ] Date slider adjusts range (debounced)
- [ ] Category checkboxes filter obituaries
- [ ] All controls in collapsible sections
- [ ] Shared URLs reproduce exact view

---

## Epic 4: Background Chart Updates

**Goal:** Connect background metric visualization to new control system

**User Value:** See multiple AI progress metrics as toggleable backdrop

**Requirements:** TSR13-TSR17

**Dependencies:** Epic 2 (log scale), Epic 3 (metric toggles)

---

### Story 4.1: Support Metric Toggles in BackgroundChart

**As a** visitor,
**I want** background metric lines to appear/disappear based on toggles,
**So that** I control which progress metrics are visible.

**Acceptance Criteria:**

**Given** BackgroundChart component
**When** enabledMetrics prop changes
**Then** only enabled metrics render trend lines

**And** updated interface:
```typescript
interface BackgroundChartProps {
  enabledMetrics: MetricType[];
  xScale: ScaleTime<number, number>;
  yScale: ScaleLogarithmic<number, number>;
  innerHeight: number;
  dateRange: [number, number];
}
```

**And** behavior:
- Smooth fade transition when metrics toggle (200ms)
- Empty array = no background lines
- Each metric has distinct color per MetricsToggle

**Technical Notes:**
- Modify `src/components/visualization/background-chart.tsx`
- Add enabledMetrics filtering
- Update types for log scale compatibility

**Files Modified:**
- `src/components/visualization/background-chart.tsx`

**Prerequisites:** Epic 2, Story 3.2

---

### Story 4.2: Adapt BackgroundChart to Log Scale

**As a** developer,
**I want** background chart to work with log scale Y-axis,
**So that** metric lines align with scatter plot scale.

**Acceptance Criteria:**

**Given** BackgroundChart receives log scale yScale
**When** rendering metric lines
**Then**:
- Uses actual FLOP values (not normalized 0-1)
- Area/line paths work correctly with log scale
- Lines stay within chart bounds

**And** data transformation:
- Current implementation normalizes to 0-1
- New implementation uses getActualFlopAtDate()
- Y positions via yScale(flopValue)

**And** for non-FLOP metrics (MMLU, ECI):
- Need separate Y-scale or normalized overlay
- Or convert to FLOP-equivalent range
- Tech spec implies all share FLOP scale

**Technical Notes:**
- Modify `src/components/visualization/background-chart.tsx`
- May need to handle MMLU/ECI differently
- Check tech spec Task 4.2 for guidance

**Files Modified:**
- `src/components/visualization/background-chart.tsx`

**Prerequisites:** Story 4.1

---

### Epic 4 Summary

| Story | Title | Requirements | Prerequisites |
|-------|-------|--------------|---------------|
| 4.1 | Metric Toggles Support | TSR13-TSR17 | Epic 2, 3.2 |
| 4.2 | Log Scale Adaptation | TSR17 | 4.1 |

**Epic 4 Completion Criteria:**
- [ ] Metric toggles show/hide background lines
- [ ] Lines render correctly on log scale
- [ ] Smooth transitions when toggling
- [ ] Training Compute enabled by default

---

## Epic 5: Polish & Mobile

**Goal:** Complete experience across devices with performance optimization

**User Value:** Works everywhere, smooth interactions, fully shareable

**Requirements:** NFR1-NFR4, NFR7-NFR11, TSR3, TSR4

**Dependencies:** All previous epics

---

### Story 5.1: Implement Mobile Bottom Sheet

**As a** mobile user,
**I want** controls in a bottom sheet,
**So that** I can access them with one hand.

**Acceptance Criteria:**

**Given** viewport < 768px
**When** control trigger is tapped
**Then** bottom sheet opens with ControlPanel variant="sheet"

**And** sheet behavior:
- Opens from bottom
- ~80% viewport height max
- Drag handle for expansion/dismissal
- Backdrop dims chart
- Swipe down to dismiss

**And** trigger button:
- Floating action button style
- Position: bottom-right, above safe area
- Icon: sliders/filter icon
- Badge showing active filter count (optional)

**Technical Notes:**
- Use shadcn Sheet with side="bottom"
- Style for mobile: rounded top corners, drag indicator
- Ensure proper touch handling

**Files Modified:**
- `src/components/controls/control-sheet.tsx`

**Prerequisites:** Story 1.3

---

### Story 5.2: Performance Optimizations

**As a** visitor,
**I want** smooth 60fps interactions,
**So that** the visualization feels responsive.

**Acceptance Criteria:**

**Given** timeline interactions
**When** panning, zooming, filtering
**Then** no frame drops (60fps target)

**And** optimizations:
1. Replace Framer Motion `motion.g` with CSS transitions for main transform
2. Add `will-change: transform` to panning group
3. Ensure debouncing on all slider interactions (400ms)
4. Memoize expensive calculations

**And** performance metrics:
- Initial paint < 1s on 4G
- Filter changes < 100ms visual response
- Slider drag: smooth (no URL update jank)

**And** implementation:
```tsx
// Before: Framer Motion for transform
<motion.g style={{ transform: ... }}>

// After: CSS transition
<g
  style={{ transform: ... }}
  className="transition-transform duration-200 will-change-transform"
>
```

**Technical Notes:**
- Profile with Chrome DevTools
- Focus on transform animations
- Keep Framer Motion for point animations

**Files Modified:**
- `src/components/visualization/scatter-plot.tsx`

**Prerequisites:** Epic 2, Epic 3

---

### Story 5.3: Tooltip Enhancement

**As a** visitor,
**I want** tooltip to show FLOP value,
**So that** I see the AI progress level at each obituary's date.

**Acceptance Criteria:**

**Given** hover on obituary dot
**When** tooltip displays
**Then** includes:
- Existing: claim preview, source, date
- New: "AI Progress: 10²⁴ FLOP" (formatted)

**And** FLOP value:
- Shows actual FLOP at obituary date
- Formatted with superscript notation
- Subtle styling (secondary text color)

**Technical Notes:**
- Modify `src/components/visualization/tooltip-card.tsx`
- Use formatFlopTick from scales.ts
- Add getActualFlopAtDate call

**Files Modified:**
- `src/components/visualization/tooltip-card.tsx`

**Prerequisites:** Story 2.2

---

### Story 5.4: Update Zoom Controls Position

**As a** visitor,
**I want** zoom controls positioned for new layout,
**So that** they don't overlap with sidebar.

**Acceptance Criteria:**

**Given** desktop layout with sidebar
**When** zoom controls render
**Then** positioned:
- Top-right of **chart area** (not viewport)
- Offset from edge: 16px
- Doesn't overlap with sidebar

**And** mobile:
- Bottom-right of chart
- Above floating control trigger
- Smaller touch targets OK (zoom less critical on mobile)

**Technical Notes:**
- Modify `src/components/visualization/zoom-controls.tsx`
- Position relative to chart container, not viewport
- Update z-index if needed

**Files Modified:**
- `src/components/visualization/zoom-controls.tsx`

**Prerequisites:** Story 1.1

---

### Epic 5 Summary

| Story | Title | Requirements | Prerequisites |
|-------|-------|--------------|---------------|
| 5.1 | Mobile Bottom Sheet | TSR4 | 1.3 |
| 5.2 | Performance Optimization | NFR1-NFR4 | Epic 2, 3 |
| 5.3 | Tooltip Enhancement | - | 2.2 |
| 5.4 | Zoom Controls Position | - | 1.1 |

**Epic 5 Completion Criteria:**
- [ ] Mobile bottom sheet works smoothly
- [ ] No jank during pan/zoom
- [ ] Filter changes < 100ms
- [ ] Tooltip shows FLOP value
- [ ] Zoom controls properly positioned

---

## Implementation Order

```
Epic 1: Layout Foundation
    Story 1.1 → Story 1.2 → Story 1.3
                    ↓
Epic 2: Y-Axis Log Scale (can start 2.1 in parallel)
    Story 2.1 → Story 2.2 → Story 2.3 → Story 2.4
                    ↓
Epic 3: Control Panel (depends on 1.2)
    Story 3.1 → Story 3.2 ─┐
              → Story 3.3 ─┼→ Story 3.5
              → Story 3.4 ─┘
                    ↓
Epic 4: Background Chart (depends on Epic 2, 3.2)
    Story 4.1 → Story 4.2
                    ↓
Epic 5: Polish & Mobile (depends on all)
    Story 5.1, 5.2, 5.3, 5.4 (can parallelize)
```

---

## Summary

| Metric | Value |
|--------|-------|
| Total Epics | 5 |
| Total Stories | 18 |
| New Requirements | 7 |
| Modified PRD FRs | 6 |
| Estimated Complexity | Medium-High |

### Critical Path

1. **Layout Foundation** (Epic 1) - unlocks all other work
2. **Y-Axis Log Scale** (Epic 2) - core visualization change
3. **Control Panel** (Epic 3) - user-facing controls
4. **Background Chart** (Epic 4) - connects to new system
5. **Polish** (Epic 5) - final refinements

### Key Technical Risks

1. **Log scale positioning** - Ensuring obituaries position correctly with jitter in log-space
2. **Performance** - CSS transitions vs Framer Motion trade-off
3. **URL state complexity** - Multiple params with debouncing
4. **Background chart adaptation** - Non-FLOP metrics (MMLU, ECI) on FLOP scale

### PRD Update Recommendations

After implementing this feature, update:
- Architecture doc: ADR-003 updated or superseded
- UX Design doc: Layout section updated
- PRD: Note FR7, FR13, FR15, FR37 implementations differ from original

---

_Generated by BMAD Create Epics and Stories Workflow_
_Date: 2025-12-11_
_Feature: Timeline Visualization Redesign_
_For: Luca_
