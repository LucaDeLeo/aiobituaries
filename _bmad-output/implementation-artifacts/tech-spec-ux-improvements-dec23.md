# Tech-Spec: UX Improvements - Counter Removal, Skeptic Filter, Modal Animation, ARC-AGI

**Created:** 2024-12-23
**Status:** Ready for Development

## Overview

### Problem Statement

The current UI has several friction points:
1. The "104 Obituaries" counter takes prominent space without adding value
2. The skeptics page is disconnected from the main visualization - users must leave the chart to explore a skeptic's claims
3. The modal slides in from the left, feeling disconnected from the data point that triggered it
4. ARC-AGI benchmark data exists but isn't visualized, missing an opportunity to show dramatic AI capability progress (0% → 87.5% in 2024)

### Solution

1. Remove the obituary counter from all breakpoints
2. Replace `/skeptics` page with a sidebar filter that shows a skeptic's claims directly on the chart
3. Change modal to scale/morph from the clicked circle for a connected feel
4. Add ARC-AGI as a toggleable background metric line

### Scope

**In Scope:**
- Remove `CountDisplay` and `CountDisplayCompact` from main page
- Add skeptic dropdown to existing filter sidebar
- Implement modal origin animation (Dialog replacing Sheet)
- Enable ARC-AGI metric toggle in visualization
- Delete `/skeptics` and `/skeptics/[slug]` routes

**Out of Scope:**
- Changes to mobile layout beyond counter removal
- New skeptic data entry in Sanity
- Additional benchmarks (HLE, FrontierMath, etc.) - can add later

## Context for Development

### Codebase Patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| Server data fetching | `src/lib/sanity/queries.ts` | GROQ queries with ISR tags |
| URL state management | `useVisualizationState()` hook | nuqs for shareable filters |
| Responsive components | `ClientLayoutRouter` | Mobile/tablet/desktop variants |
| Modal pattern | Radix Sheet → needs to become Dialog | Lazy-loads full data via API |
| Metrics toggle | `MetricsToggle` component | Checkbox-style multi-select |

### Files to Reference

**Counter removal:**
- `src/app/page.tsx` - Lines 44, 60, 80 (CountDisplay usage)
- `src/components/obituary/count-display.tsx` - Component to remove

**Skeptic filter:**
- `src/lib/sanity/queries.ts` - Add `getSkeptics()` for dropdown data
- `src/components/ui/control-panel.tsx` or similar - Add dropdown
- `src/hooks/use-visualization-state.ts` - Add `selectedSkeptic` state
- `src/app/skeptics/` - Delete entire directory

**Modal animation:**
- `src/components/obituary/obituary-modal.tsx` - Replace Sheet with Dialog
- `src/components/visualization/scatter-plot.tsx` - Pass click coordinates
- Need to capture `getBoundingClientRect()` of clicked point

**ARC-AGI metric:**
- `src/data/ai-metrics.generated.ts` - `arcagiFrontier` already exists
- `src/data/ai-metrics.ts` - May need to export it
- `src/components/visualization/background-chart.tsx` - Render the line
- `src/components/ui/metrics-toggle.tsx` - Add checkbox option

### Technical Decisions

1. **Modal animation approach:** Use CSS `transform-origin` set dynamically to clicked point's viewport coordinates. Framer Motion for smooth spring animation.

2. **Skeptic filter state:** Add to existing `useVisualizationState` hook as `?skeptic=slug` URL param for shareability.

3. **Filtering logic:** When skeptic selected, filter `obituaries` array to only those where `skeptic.slug === selectedSkeptic`.

4. **ARC-AGI scale:** It's a percentage (0-100%) like MMLU was. Needs secondary Y-axis or normalized overlay.

## Implementation Plan

### Tasks

- [ ] **Task 1: Remove obituary counter**
  - Delete `CountDisplay` imports and JSX from `page.tsx`
  - Delete `CountDisplayCompact` usage from header
  - Keep component files (may be useful later) or delete if clean break preferred

- [ ] **Task 2: Add skeptic dropdown filter**
  - Create `getSkeptics()` query returning `{_id, name, slug, claimCount}`
  - Add `SkepticFilter` component with shadcn Select
  - Wire to `useVisualizationState` with `selectedSkeptic` param
  - Filter scatter plot data when skeptic selected
  - Show "Showing N claims by [Name]" indicator

- [ ] **Task 3: Delete skeptics pages**
  - Remove `src/app/skeptics/` directory entirely
  - Update any internal links pointing to `/skeptics`

- [ ] **Task 4: Implement modal origin animation**
  - Replace Radix `Sheet` with `Dialog` in `obituary-modal.tsx`
  - Capture click target's bounding rect in `scatter-plot.tsx`
  - Pass coordinates to modal via context or props
  - Use Framer Motion `layoutId` or custom transform-origin animation
  - Ensure reduced-motion preference respected

- [ ] **Task 5: Add ARC-AGI to visualization**
  - Export `arcagiFrontier` from `ai-metrics.ts`
  - Add 'arcagi' to `MetricType` union
  - Add checkbox to `MetricsToggle` component
  - Render line in `BackgroundChart` with amber color
  - Handle dual Y-axis (FLOP vs percentage) or normalize

### Acceptance Criteria

- [ ] AC 1: Homepage loads without any obituary counter visible at any breakpoint
- [ ] AC 2: Sidebar contains "Filter by Skeptic" dropdown with all skeptics listed
- [ ] AC 3: Selecting a skeptic filters the scatter plot to only their claims
- [ ] AC 4: Skeptic filter state persists in URL (`?skeptic=elon-musk`)
- [ ] AC 5: `/skeptics` and `/skeptics/[slug]` return 404
- [ ] AC 6: Clicking a claim circle causes modal to animate outward from that point
- [ ] AC 7: Modal animation respects `prefers-reduced-motion`
- [ ] AC 8: Metrics toggle includes "ARC-AGI Score" option
- [ ] AC 9: Enabling ARC-AGI shows amber line on chart with percentage values

## Additional Context

### Dependencies

- Radix Dialog (already installed via shadcn)
- Framer Motion (already installed)
- No new dependencies required

### Testing Strategy

- Unit test: `getSkeptics()` query returns expected shape
- Unit test: Skeptic filter correctly filters obituaries array
- Integration: Modal opens with correct positioning data
- Visual: Screenshot comparison for modal animation
- E2E: Full flow - select skeptic → see filtered claims → click → modal opens from point

### Notes

- The `arcagiFrontier` data in `ai-metrics.generated.ts` currently has a different structure than the parse script outputs - appears to have been manually edited. May want to regenerate from `arc_agi_external.csv` for consistency.

- Consider adding a "Clear filter" button or clicking the selected skeptic again to deselect.

- Modal animation complexity: If `transform-origin` approach is janky, fallback to simpler "scale from center with faster timing" which still feels more connected than slide-in.
