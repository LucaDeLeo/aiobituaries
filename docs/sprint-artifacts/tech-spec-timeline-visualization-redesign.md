# Tech-Spec: Timeline Visualization Redesign

**Created:** 2025-12-11
**Status:** Ready for Development
**Author:** John (PM) + Claude Code

---

## Overview

### Problem Statement

The current AI Obituaries timeline visualization fails to deliver the core narrative impact: "people declared AI dead WHILE exponential progress was happening." Specific issues:

1. **Chart is secondary, not hero** - Min-height of 400px competes with other page elements
2. **Y-axis is meaningless** - Normalized 0-1 scale tells users nothing about actual AI progress
3. **Pre-2010 data dilutes the story** - Deep learning era (2010+) is THE narrative
4. **Grid lacks context** - No visible scale numbers to anchor understanding
5. **Filter position doesn't match expectations** - Floating bottom bar vs. Epoch-style right sidebar

### Solution

Redesign the main page to make the timeline visualization the dominant element, following Epoch AI's proven layout pattern:

- **Hero chart**: ~75% page width, near-full viewport height
- **Right sidebar**: Comprehensive controls (metrics, categories, display, date range)
- **Log scale Y-axis**: Real FLOP values (10^17 to 10^27) with labeled ticks
- **2010-2025 focus**: Deep learning era as default, adjustable via slider
- **Mobile adaptation**: Bottom sheet for controls on small screens

### Scope

**In Scope:**
- Page layout restructure (CSS Grid)
- Y-axis conversion to logarithmic FLOP scale
- Right sidebar control panel component
- Metric toggle system (Training Compute, MMLU, Capability Index)
- Category filter migration to sidebar
- Date range slider with URL state
- Display options (trend annotations, clustering toggle)
- Mobile bottom sheet / tablet drawer
- URL state management via nuqs for shareability
- Performance optimizations (debouncing, memoization)

**Out of Scope:**
- New data sources or metrics
- Backend/CMS changes
- Authentication or user accounts
- Internationalization

---

## Context for Development

### Codebase Patterns

| Pattern | Convention | Example |
|---------|------------|---------|
| Client Components | `'use client'` directive at top | `scatter-plot.tsx:1` |
| State Management | URL state via nuqs, local via useState | `use-filters.ts` |
| Styling | Tailwind CSS v4 + CSS variables | `--bg-secondary`, `--border` |
| Animation | Framer Motion (`motion/react`) | `scatter-plot.tsx:4-11` |
| Data Fetching | Server Components + ISR | `page.tsx` |
| Charts | Visx (D3 wrapper) | `@visx/scale`, `@visx/axis` |
| Testing | Vitest + React Testing Library | `tests/unit/` |

### Files to Reference

**Primary (will be modified):**
```
src/app/page.tsx                           # Page layout structure
src/components/home-client.tsx             # Client wrapper, state orchestration
src/components/visualization/scatter-plot.tsx  # Main chart (1060 lines)
src/components/visualization/background-chart.tsx  # Metric trend lines
src/components/filters/category-filter.tsx # Filter component (refactor to sidebar)
src/data/ai-metrics.ts                     # Metric data + helpers
src/lib/hooks/use-filters.ts               # Filter state management
```

**Secondary (may need updates):**
```
src/components/visualization/zoom-controls.tsx  # Reposition for new layout
src/components/visualization/tooltip-card.tsx   # Add FLOP value display
src/lib/utils/clustering.ts                # Adjust for log scale if needed
src/lib/hooks/use-zoom.ts                  # Ensure works with new dimensions
```

**New files to create:**
```
src/components/controls/control-panel.tsx       # Right sidebar container
src/components/controls/metrics-toggle.tsx      # Metric checkboxes
src/components/controls/date-range-slider.tsx   # Dual-handle slider
src/components/controls/display-options.tsx     # Display toggles
src/components/controls/control-sheet.tsx       # Mobile bottom sheet
src/lib/hooks/use-visualization-state.ts        # Consolidated URL state
src/lib/utils/scales.ts                         # Log scale utilities
```

### Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Chart library | Keep Visx | Already integrated, supports log scales, good React integration |
| URL state | nuqs | Already in codebase, supports shallow routing, debouncing |
| Log scale | `@visx/scale` scaleLog | Native D3 implementation, battle-tested |
| Sidebar UI | shadcn/ui components | Consistent with existing UI, accessible |
| Mobile controls | Radix Sheet | Already available via shadcn, good a11y |
| Date slider | `@radix-ui/react-slider` | Accessible, supports dual handles |
| Animation | CSS transitions for transforms | Performance - GPU accelerated vs Framer Motion JS |

---

## Implementation Plan

### Phase 1: Layout Foundation

#### Task 1.1: Create CSS Grid page layout
**Files:** `src/app/page.tsx`, `src/components/home-client.tsx`

```tsx
// New layout structure
<main className="grid grid-cols-[1fr_320px] h-[calc(100vh-64px)] gap-0">
  <section className="relative overflow-hidden">
    {/* Chart area */}
    <ScatterPlot ... />
    <DateRangeSlider ... />
  </section>
  <aside className="border-l border-border overflow-y-auto">
    {/* Control panel */}
    <ControlPanel ... />
  </aside>
</main>
```

Responsive breakpoints:
- Desktop (≥1024px): Grid layout as above
- Tablet (768-1023px): Full-width chart, slide-in drawer
- Mobile (<768px): Full-width chart, bottom sheet

#### Task 1.2: Create ControlPanel shell component
**Files:** `src/components/controls/control-panel.tsx`

```tsx
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

#### Task 1.3: Implement responsive control surfaces
**Files:** `src/components/controls/control-sheet.tsx`

- Use `@radix-ui/react-dialog` Sheet for mobile
- Use CSS transition drawer for tablet
- Desktop: always-visible sidebar

---

### Phase 2: Y-Axis Log Scale

#### Task 2.1: Create scale utilities
**Files:** `src/lib/utils/scales.ts`

```typescript
import { scaleLog, scaleTime } from '@visx/scale';

export const LOG_TICK_VALUES = [
  1e17, 1e18, 1e19, 1e20, 1e21, 1e22, 1e23, 1e24, 1e25, 1e26, 1e27
];

export function createLogYScale(height: number, domain: [number, number]) {
  return scaleLog({
    domain,
    range: [height, 0],
    base: 10,
  });
}

export function formatFlopTick(value: number): string {
  const exp = Math.round(Math.log10(value));
  return `10${toSuperscript(exp)}`;
}

function toSuperscript(n: number): string {
  const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return String(n).split('').map(d => superscripts[parseInt(d)]).join('');
}

export function logToFlop(logValue: number): number {
  return Math.pow(10, logValue);
}

export function flopToLog(flop: number): number {
  return Math.log10(flop);
}
```

#### Task 2.2: Update ai-metrics.ts helpers
**Files:** `src/data/ai-metrics.ts`

Add:
```typescript
export function getActualFlopAtDate(series: AIMetricSeries, date: Date): number {
  const logValue = getMetricValueAtDate(series, date);
  return Math.pow(10, logValue);
}

export function filterMetricsByDateRange(
  series: AIMetricSeries,
  startYear: number,
  endYear: number
): MetricDataPoint[] {
  return series.data.filter(d => {
    const year = new Date(d.date).getFullYear();
    return year >= startYear && year <= endYear;
  });
}

export function getMetricDomain(
  series: AIMetricSeries,
  startYear: number,
  endYear: number
): [number, number] {
  const filtered = filterMetricsByDateRange(series, startYear, endYear);
  const flopValues = filtered.map(d => Math.pow(10, d.value));
  const min = Math.min(...flopValues);
  const max = Math.max(...flopValues);
  // Add 1 order of magnitude padding
  return [min / 10, max * 10];
}
```

#### Task 2.3: Update ScatterPlot Y-axis
**Files:** `src/components/visualization/scatter-plot.tsx`

Key changes:
1. Replace `scaleLinear` with `scaleLog` for Y-axis
2. Increase left margin from 20px to 72px for tick labels
3. Add `<AxisLeft>` component with formatted ticks
4. Update `pointPositions` calculation for log scale positioning

```typescript
// New Y-scale
const yScale = useMemo(() => {
  const domain = getMetricDomain(trainingComputeFrontier, dateRange[0], dateRange[1]);
  return createLogYScale(innerHeight, domain);
}, [innerHeight, dateRange]);

// New point positioning
const pointPositions = useMemo(() => {
  return data.map((obituary) => {
    const obituaryDate = new Date(obituary.date);
    const baseFlop = getActualFlopAtDate(trainingComputeFrontier, obituaryDate);

    // Jitter in log-space (±0.3 orders of magnitude)
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

#### Task 2.4: Add Y-axis labels
**Files:** `src/components/visualization/scatter-plot.tsx`

```tsx
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { LOG_TICK_VALUES, formatFlopTick } from '@/lib/utils/scales';

// In render:
<AxisLeft
  scale={yScale}
  tickValues={LOG_TICK_VALUES.filter(v => v >= yScale.domain()[0] && v <= yScale.domain()[1])}
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
  tickValues={LOG_TICK_VALUES.filter(v => v >= yScale.domain()[0] && v <= yScale.domain()[1])}
  stroke="var(--border)"
  strokeOpacity={0.3}
/>
```

---

### Phase 3: Control Panel Implementation

#### Task 3.1: Create URL state hook
**Files:** `src/lib/hooks/use-visualization-state.ts`

```typescript
import { useQueryState, parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs';
import { useTransition } from 'react';

export type MetricType = 'compute' | 'mmlu' | 'eci';
export type Category = 'market' | 'capability' | 'agi' | 'dismissive';

export function useVisualizationState() {
  const [isPending, startTransition] = useTransition();

  const transitionOptions = { startTransition, shallow: true };

  const [metrics, setMetrics] = useQueryState(
    'metrics',
    parseAsArrayOf(parseAsString)
      .withDefault(['compute'])
      .withOptions(transitionOptions)
  );

  const [categories, setCategories] = useQueryState(
    'cat',
    parseAsArrayOf(parseAsString)
      .withDefault([])
      .withOptions(transitionOptions)
  );

  const [startYear, setStartYear] = useQueryState(
    'from',
    parseAsInteger
      .withDefault(2010)
      .withOptions({ ...transitionOptions, debounceMs: 400 })
  );

  const [endYear, setEndYear] = useQueryState(
    'to',
    parseAsInteger
      .withDefault(2025)
      .withOptions({ ...transitionOptions, debounceMs: 400 })
  );

  return {
    metrics: metrics as MetricType[],
    setMetrics,
    categories: categories as Category[],
    setCategories,
    dateRange: [startYear, endYear] as [number, number],
    setDateRange: (range: [number, number]) => {
      setStartYear(range[0]);
      setEndYear(range[1]);
    },
    isPending,
  };
}
```

#### Task 3.2: Implement MetricsToggle component
**Files:** `src/components/controls/metrics-toggle.tsx`

```tsx
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { MetricType } from '@/lib/hooks/use-visualization-state';

const METRICS = [
  { id: 'compute', label: 'Training Compute', description: 'FLOP trend line', color: 'rgb(118, 185, 0)' },
  { id: 'mmlu', label: 'MMLU Score', description: 'Benchmark accuracy', color: 'rgb(234, 179, 8)' },
  { id: 'eci', label: 'Capability Index', description: 'Epoch composite', color: 'rgb(99, 102, 241)' },
] as const;

interface MetricsToggleProps {
  enabled: MetricType[];
  onChange: (metrics: MetricType[]) => void;
}

export function MetricsToggle({ enabled, onChange }: MetricsToggleProps) {
  const handleToggle = (metricId: MetricType, checked: boolean) => {
    if (checked) {
      onChange([...enabled, metricId]);
    } else {
      onChange(enabled.filter(id => id !== metricId));
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Background Metrics</h3>
      <div className="space-y-2">
        {METRICS.map(metric => (
          <div key={metric.id} className="flex items-start gap-3">
            <Checkbox
              id={metric.id}
              checked={enabled.includes(metric.id)}
              onCheckedChange={(checked) => handleToggle(metric.id, !!checked)}
            />
            <div className="grid gap-0.5">
              <Label htmlFor={metric.id} className="flex items-center gap-2">
                <span
                  className="h-2 w-4 rounded"
                  style={{ backgroundColor: metric.color }}
                />
                {metric.label}
              </Label>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Task 3.3: Implement DateRangeSlider component
**Files:** `src/components/controls/date-range-slider.tsx`

```tsx
'use client';

import * as Slider from '@radix-ui/react-slider';

interface DateRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
}

export function DateRangeSlider({
  value,
  onChange,
  min = 1950,
  max = 2025,
}: DateRangeSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Time Range</span>
        <span className="text-muted-foreground">{value[0]} - {value[1]}</span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        min={min}
        max={max}
        step={1}
        minStepsBetweenThumbs={1}
      >
        <Slider.Track className="bg-secondary relative grow rounded-full h-1">
          <Slider.Range className="absolute bg-primary rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-background border-2 border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Start year"
        />
        <Slider.Thumb
          className="block w-4 h-4 bg-background border-2 border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="End year"
        />
      </Slider.Root>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
```

#### Task 3.4: Migrate CategoryFilter to checkboxes
**Files:** `src/components/controls/category-checkboxes.tsx`

Refactor existing category filter logic into checkbox format for sidebar.

#### Task 3.5: Assemble ControlPanel
**Files:** `src/components/controls/control-panel.tsx`

Compose all control components with collapsible sections using `@radix-ui/react-collapsible`.

---

### Phase 4: Background Chart Updates

#### Task 4.1: Support metric toggles
**Files:** `src/components/visualization/background-chart.tsx`

```tsx
interface BackgroundChartProps {
  enabledMetrics: MetricType[];
  xScale: ScaleTime<number, number>;
  yScale: ScaleLog<number, number>;
  innerHeight: number;
  dateRange: [number, number];
}
```

Only render metrics that are in `enabledMetrics` array.

#### Task 4.2: Adapt to log scale
Ensure area/line paths work with log scale. The current implementation normalizes to 0-1; need to use actual FLOP values.

---

### Phase 5: Polish & Mobile

#### Task 5.1: Implement mobile bottom sheet
**Files:** `src/components/controls/control-sheet.tsx`

Use shadcn Sheet component with `side="bottom"`.

#### Task 5.2: Performance optimizations
- Replace Framer Motion `motion.g` with CSS transitions for main transform
- Add `will-change: transform` to panning group
- Ensure debouncing on all slider interactions

#### Task 5.3: Tooltip enhancements
Add FLOP value to tooltip display:
```
AI Progress: 10²⁴ FLOP
```

#### Task 5.4: Update zoom controls position
Reposition for new layout - top-right of chart area.

---

### Acceptance Criteria

#### AC-1: Layout
- [ ] Chart occupies ~75% width on desktop (≥1024px)
- [ ] Sidebar is fixed 320px on right
- [ ] Chart height is `calc(100vh - header)` with min 500px
- [ ] Tablet shows full-width chart with slide-in drawer
- [ ] Mobile shows full-width chart with bottom sheet

#### AC-2: Y-Axis
- [ ] Y-axis uses logarithmic scale
- [ ] Tick labels show scientific notation (10¹⁸, 10²⁰, etc.)
- [ ] Grid lines appear at each labeled tick
- [ ] Obituaries position correctly on log scale

#### AC-3: Date Range
- [ ] Default domain is 2010-2025
- [ ] Slider allows adjustment from 1950-2025
- [ ] URL updates with `?from=YYYY&to=YYYY`
- [ ] Chart responds to date range changes

#### AC-4: Metrics
- [ ] Training Compute enabled by default
- [ ] MMLU and Capability Index toggleable
- [ ] URL reflects enabled metrics: `?metrics=compute,mmlu`
- [ ] Background lines appear/disappear on toggle

#### AC-5: Categories
- [ ] Category filter works from sidebar
- [ ] Multi-select with checkboxes
- [ ] URL reflects: `?cat=market,agi`
- [ ] Points filter correctly (opacity change)

#### AC-6: Performance
- [ ] No jank during pan/zoom
- [ ] Slider drags smoothly (debounced URL updates)
- [ ] Initial paint < 1s on 4G
- [ ] Filter changes feel instant (< 100ms visual response)

#### AC-7: Accessibility
- [ ] All controls keyboard accessible
- [ ] Sliders have proper ARIA labels
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader announces filter changes

#### AC-8: Shareability
- [ ] Full state encoded in URL
- [ ] Shared URLs reproduce exact view
- [ ] Browser back/forward works correctly

---

## Additional Context

### Dependencies

**Existing (no changes):**
- `@visx/scale` - Already supports scaleLog
- `@visx/axis` - Already supports custom tick formatting
- `@visx/grid` - Already supports custom tick values
- `nuqs` - Already in use for filter state
- `motion/react` - Keep for point animations, remove for transforms

**New:**
- `@radix-ui/react-slider` - For dual-handle date slider
- `@radix-ui/react-collapsible` - For sidebar sections

### Testing Strategy

**Unit Tests:**
```
tests/unit/lib/utils/scales.test.ts
  - createLogYScale returns correct domain/range
  - formatFlopTick formats correctly (10^24 → "10²⁴")
  - logToFlop/flopToLog roundtrip correctly

tests/unit/components/controls/date-range-slider.test.tsx
  - Renders with initial value
  - Calls onChange on drag
  - Respects min/max bounds

tests/unit/components/controls/metrics-toggle.test.tsx
  - Toggles metrics on/off
  - Calls onChange with correct array
```

**Integration Tests:**
```
tests/integration/visualization-state.test.tsx
  - URL params update on control changes
  - Chart responds to URL param changes
  - Shared URL restores full state
```

**E2E Tests (Playwright):**
```
tests/e2e/timeline-redesign.spec.ts
  - Desktop layout shows sidebar
  - Mobile layout shows bottom sheet trigger
  - Date slider updates chart
  - Metric toggles show/hide lines
  - Category filters work
  - Shareable URL test
```

### Notes

1. **Backward Compatibility:** Old URLs with `?cat=market` format should continue working. The nuqs migration is additive.

2. **SEO:** Chart is client-rendered but page shell is server-rendered. No SEO impact since obituary content is in server components.

3. **Bundle Size:** Adding Radix slider adds ~5kb gzipped. Acceptable trade-off for accessibility.

4. **Future Considerations:**
   - Could add "Compare years" feature (side-by-side charts)
   - Could add data export (CSV/PNG)
   - Could add annotation system for notable events

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-11 | John (PM) | Initial spec created |
