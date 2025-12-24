# Tech-Spec: Single-Select Benchmark with Animated Line Morph

**Created:** 2025-12-24
**Status:** ✅ Implemented & Reviewed

## Overview

### Problem Statement
The current visualization allows toggling multiple AI metrics on/off with checkboxes. This creates visual clutter when multiple metrics overlap and doesn't provide a clear "comparison baseline" experience. Users want to select ONE metric as the primary comparison trend line.

### Solution
Convert the metrics control from multi-select (checkboxes) to single-select (radio buttons). Implement animated line morphing when switching between metrics - the trend line shape interpolates from one metric to another, creating a fluid transition effect.

### Scope

**In Scope:**
- Convert `MetricsToggle` from checkboxes → radio buttons
- Change state model from `MetricType[]` → `MetricType`
- Update URL param from `?metrics=compute,arcagi` → `?metric=compute`
- Implement line morph animation between metrics
- Graceful fallback for old multi-metric URLs

**Out of Scope:**
- Adding new metrics
- Changing metric data sources
- Mobile-specific layout changes
- "No metric" option (one metric always required)

## Context for Development

### Codebase Patterns
- **URL state**: nuqs with parsers (`parseAsStringLiteral`)
- **Animation**: framer-motion for UI, CSS transitions for simple effects
- **Visx**: SVG chart rendering with `LinePath`, `AreaClosed`, `curveMonotoneX`
- **Memoization**: Heavy use of `useMemo` for perf (BackgroundChart is `React.memo`)

### Files to Modify
| File | Change |
|------|--------|
| `src/lib/hooks/use-visualization-state.ts` | Array → single value state |
| `src/components/controls/metrics-toggle.tsx` | Checkboxes → radio buttons |
| `src/components/visualization/background-chart.tsx` | Add morph animation |
| `src/components/controls/control-panel.tsx` | Update prop types |
| `src/components/visualization/scatter-plot.tsx` | Update prop passing |
| `tests/unit/components/controls/metrics-toggle.test.tsx` | Update tests |
| `tests/unit/components/visualization/background-chart-toggle.test.tsx` | Update tests |

### Technical Decisions

1. **State model**: `MetricType` (not nullable - one always required, default: `'metr'`)
2. **URL param**: Rename `metrics` → `metric` with fallback parser for old format
3. **Animation**: Line morph using resampled paths + framer-motion

## Line Morph Animation Strategy

### Challenge
Different metrics have different:
- Date ranges (compute: 1950-2025, METR: 2019-2025, ARC-AGI: 2021-2024)
- Value scales (normalized 0-1 for overlays vs actual minutes for METR)
- Point counts (varying density)

### Solution: Unified Resampling

1. **Resample to common X positions**: Generate 100 evenly-spaced dates within the visible viewport
2. **Interpolate Y values**: For each common X, interpolate Y from the metric's actual data
3. **Normalize to pixel space**: Convert to screen coordinates before animating
4. **Animate path**: Use framer-motion to tween between path `d` attributes

```
Old Metric Path → [100 resampled points in px] → animate → [100 resampled points in px] ← New Metric Path
```

### Animation Parameters
- **Duration**: 600ms (slightly longer for morph to read well)
- **Easing**: `[0.4, 0, 0.2, 1]` (Material Design ease-out)
- **Reduced motion**: Instant swap, no animation

## Implementation Plan

### Tasks

- [x] **Task 1: Update state hook** (`use-visualization-state.ts`)
  - Change `metricsParser` from `parseAsArrayOf` to `parseAsStringLiteral`
  - Add fallback: if URL has old `metrics=a,b` format, take first value
  - Rename URL param `metrics` → `metric`
  - Update type: `metrics: MetricType[]` → `metric: MetricType`
  - Update setter: `setMetrics` → `setMetric`
  - Default: `'metr'` (primary Y-axis metric)

- [x] **Task 2: Update MetricsToggle UI** (`metrics-toggle.tsx`)
  - Change `input type="checkbox"` → `type="radio"` with `name="metric-select"`
  - Update props: `enabledMetrics: MetricType[]` → `selectedMetric: MetricType`
  - Update handler: direct set instead of add/remove logic
  - Visual: selected state shows filled radio, unselected shows empty

- [x] **Task 3: Create path resampling utility** (new: `src/lib/utils/path-interpolation.ts`)
  - `resampleMetricToPoints(metric, xScale, yScale, numPoints)` → `{x, y}[]`
  - `pointsToPathD(points)` → SVG path `d` string
  - Handle edge cases: metrics with no visible data in viewport

- [x] **Task 4: Animate BackgroundChart** (`background-chart.tsx`)
  - Track `previousMetric` in state (not ref) to detect changes
  - On metric change: compute old path, new path, animate between
  - Use `requestAnimationFrame` with `easeOutQuart` for smooth animation
  - Crossfade the area fill (simpler than morphing fill)
  - Animate line stroke with path morph

- [x] **Task 5: Update prop interfaces**
  - `BackgroundChartProps.enabledMetrics` → `selectedMetric: MetricType`
  - `ScatterPlotProps.enabledMetrics` → `selectedMetric`
  - `ControlPanelProps` - same
  - Update all call sites

- [x] **Task 6: Update tests**
  - `metrics-toggle.test.tsx` - radio behavior, single selection
  - `background-chart-toggle.test.tsx` - single metric rendering
  - Add unit test for `resampleMetricToPoints`

### Acceptance Criteria

- [x] **AC 1**: Given the metrics control, when I click a metric, then that metric becomes selected and its trend line is visible
- [x] **AC 2**: Given metric A selected, when I click metric B, then the trend line morphs from A's shape to B's shape over 600ms
- [x] **AC 3**: Given the URL `?metric=arcagi`, when the page loads, then ARC-AGI is the selected metric
- [x] **AC 4**: Given old URL `?metrics=compute,arcagi`, when page loads, then `compute` (first) is selected
- [x] **AC 5**: Given reduced motion preference, when switching metrics, then transition is instant
- [x] **AC 6**: Only one radio button can be selected at a time in the metrics control

## Additional Context

### Dependencies
- framer-motion (already installed) - for path animation
- No new deps needed

### Testing Strategy
- Unit: state hook parser, resampling utility
- Component: radio behavior, single metric rendering
- Visual: manual QA for animation smoothness
- E2E: URL state persistence

### Performance Considerations
- Resampling runs on metric change only (not every frame)
- Path animation uses GPU-accelerated transforms
- Memoize resampled paths per metric

### Risks
- Path morphing between very different shapes may look odd (mitigated by smooth easing)
- Metrics with no data in viewport need graceful handling

---

## Implementation Notes

**Implemented:** 2025-12-24
**Reviewed:** 2025-12-24

### Files Modified

| File | Lines Changed | Description |
|------|---------------|-------------|
| `src/lib/hooks/use-visualization-state.ts` | +56/-56 | Array → single value with custom parser for legacy URLs |
| `src/components/controls/metrics-toggle.tsx` | +88/-88 | Checkboxes → radio buttons with proper ARIA |
| `src/components/visualization/background-chart.tsx` | +358/-358 | Complete animation rewrite with state-based tracking |
| `src/components/visualization/scatter-plot.tsx` | +67/-67 | Props update, METR as primary Y-axis |
| `src/components/controls/control-panel.tsx` | +20/-20 | Prop interface updates |
| `src/components/controls/control-panel-wrapper.tsx` | +8/-8 | State threading |
| `src/app/home-client.tsx` | +8/-8 | Prop updates |
| `src/app/home-page-client.tsx` | +4/-4 | State usage |
| `src/data/ai-metrics.ts` | +26 | METR helpers, max fallback constant |
| `src/data/ai-metrics.generated.ts` | +95 | METR frontier data |
| `src/lib/utils/scales.ts` | +48 | Linear scale for METR |
| `src/lib/utils/path-interpolation.ts` | +207 | **NEW** - Resampling & interpolation utilities |
| `src/types/metrics.ts` | +3/-3 | Added `'metr'` to MetricType |
| `tests/unit/lib/utils/path-interpolation.test.ts` | +207 | **NEW** - 19 unit tests |

### Technical Decisions (Refined During Implementation)

1. **Animation Approach**: Used `requestAnimationFrame` + `easeOutQuart` instead of `motion.path`
   - Reason: framer-motion doesn't natively interpolate SVG path `d` attributes
   - The resampling approach with manual RAF gives full control over morph behavior

2. **State vs Ref for Previous Metric**: Used `useState` instead of `useRef`
   - Reason: Reading refs during render (in `useMemo`) is a React anti-pattern
   - State-based tracking ensures proper reactivity and memoization

3. **Easing Function**: Used `easeOutQuart` instead of cubic-bezier
   - Reason: Simpler implementation, visually equivalent to Material Design ease-out
   - Formula: `1 - Math.pow(1 - t, 4)`

---

## Code Review Findings & Fixes

**Review Date:** 2025-12-24

### Issues Found and Resolved

| Severity | Issue | Root Cause | Fix Applied |
|----------|-------|------------|-------------|
| 🔴 CRITICAL | React ref accessed during render | `useMemo` reading `prevMetricRef.current` | Changed to `useState` for `previousMetricId` |
| 🟡 HIGH | Unused imports (`LinePath`, `motion`, `AnimatePresence`) | Spec called for framer-motion, implementation used RAF | Removed unused imports |
| 🟡 HIGH | Incorrect cubic-bezier formula | Wrong bezier approximation formula | Replaced with `easeOutQuart` function |
| 🟡 HIGH | No animation cleanup on unmount | Missing RAF cancellation | Added `animationFrameRef` with cleanup in effect |
| 🟠 MEDIUM | Unused variables (6 instances) | Dead code from refactoring | Removed all unused vars |
| 🟠 MEDIUM | Duplicated `isPrimaryMetric` | Defined in 2 files | Consolidated in `path-interpolation.ts`, exported |
| 🟠 MEDIUM | Missing path-interpolation tests | New utility file untested | Added 19 unit tests |
| 🟠 MEDIUM | Legacy URL fallback untested | AC-4 not covered | Added 6 parser tests |
| 🟢 LOW | Misleading comments | Docstring mentioned bezier, used L commands | Updated comments to match reality |
| 🟢 LOW | Magic number 300 | Hardcoded METR max fallback | Added `METR_MAX_FALLBACK_MINUTES` constant |

### Verification Results

```
Lint:       ✅ 0 errors, 0 warnings
TypeScript: ✅ No type errors
Tests:      ✅ 1528 passing (25 new tests added)
```

### Architecture Improvements from Review

1. **Reactive Animation State**: `previousMetricId` tracked in React state, updated AFTER animation completes. This ensures `useMemo` dependencies work correctly.

2. **Proper Effect Cleanup**: `animationFrameRef` stores current animation frame ID, canceled on unmount or metric change mid-animation.

3. **Unified Reduced Motion**: Uses same `requestAnimationFrame` code path with `duration=0`, avoiding synchronous setState in effect (which triggers React lint errors).

4. **Testable Utilities**: `isPrimaryMetric`, `resampleMetricToPoints`, `pointsToPathD`, `interpolatePoints` all exported and unit tested.
