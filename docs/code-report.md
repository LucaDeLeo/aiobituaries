# AI Obituaries Codebase Review

Date: 2025-12-18

Scope: src/**, tests/**, scripts/**, and top-level config files (Next.js, TS, ESLint, Vite/Vitest, Playwright).

## Executive summary

Strengths
- Clear separation between data, hooks, and UI components. The App Router pages are thin and most logic lives in reusable modules.
- Accessibility has first-class treatment (skip link, live region, roving focus, a11y tests).
- Performance intent is visible (dynamic imports, virtualization, memoization, perf utilities).
- Test coverage is strong for visualization behavior, a11y, and performance baselines.

## High priority findings

1) Date formatting can be off by one day in non-UTC timezones
- Several components format ISO date strings via `new Date(obituary.date)` and `date-fns` or local `toLocaleDateString`, which uses the local timezone. For users west of UTC, dates can render as the previous day.
- Standardize on the UTC-safe formatter in `src/lib/utils/date.ts` or adopt `date-fns-tz` for all date display.
- Files: `src/components/obituary/obituary-card.tsx:2`, `src/components/obituary/obituary-card.tsx:76`, `src/components/obituary/obituary-detail.tsx:2`, `src/components/obituary/obituary-detail.tsx:68`, `src/components/obituary/obituary-table.tsx:250`, `src/components/mobile/mobile-card-list.tsx:89`, `src/components/visualization/scatter-point.tsx:115`.

2) Metrics toggle allows empty selection but URL defaults force compute back on
- `useVisualizationState` defaults metrics to `['compute']` and resets empty selections to null, which rehydrates to compute. This conflicts with the UI which allows unchecking all metrics.
- Decide on one behavior: enforce at least one metric in UI, or allow empty by changing parser defaults and downstream domain logic.
- Files: `src/lib/hooks/use-visualization-state.ts:54`, `src/lib/hooks/use-visualization-state.ts:141`, `src/components/controls/metrics-toggle.tsx:9`, `src/components/controls/metrics-toggle.tsx:66`.

3) Time Range slider label does not match actual behavior
- The control is labeled "Time Range" but `dateRange` only affects the Y-axis domain for compute, not the X-axis timeline or filtering.
- Either rename to clarify (e.g., "Compute domain range") or apply the range to `xScale`/visible data to make it a real time filter.
- Files: `src/components/controls/control-panel.tsx:77`, `src/components/visualization/scatter-plot.tsx:266`.

## Performance and scalability

1) Per-point reduced-motion hook adds overhead
- `ScatterPoint` calls `useReducedMotion` for every point, even though the parent already computes a single `shouldReduceMotion` value and passes it down.
- Remove the per-point hook and rely on the prop to avoid N subscriptions and reduce render cost at high point counts.
- Files: `src/components/visualization/scatter-point.tsx:85`, `src/components/visualization/scatter-plot.tsx:210`.

2) Duplicate count fetches on homepage
- `CountDisplay` and `CountDisplayCompact` each fetch counts from Sanity, while `Home` already has the full list. Because all breakpoint branches are built server-side, this can trigger multiple reads per request.
- Fetch the count once in `Home` (or derive from `obituaries.length`) and pass it into both components.
- Files: `src/app/page.tsx:23`, `src/components/obituary/count-display.tsx:18`, `src/components/obituary/count-display-compact.tsx:8`.

3) Clustering is O(n^2) with sqrt in inner loop
- `computeClusters` scans all points with a per-point filter and `Math.sqrt` in the hot path. This will not scale if the dataset grows.
- Consider grid bucketing or a spatial index (d3-quadtree) and compare squared distances.
- File: `src/lib/utils/clustering.ts:34`.

4) Tooltip FLOP value computed even when not shown
- `TooltipCard` computes FLOP value regardless of `showFlop`. Guard the computation to avoid unnecessary work.
- File: `src/components/visualization/tooltip-card.tsx:72`.

## Maintainability and clarity

1) Category metadata is duplicated in multiple places
- There are multiple sources of truth for category colors and labels (constants, scatter helpers, local component maps).
- Consolidate on `CATEGORIES` and helper functions to avoid drift.
- Files: `src/lib/constants/categories.ts:28`, `src/lib/utils/scatter-helpers.ts:7`, `src/components/obituary/obituary-detail.tsx:13`, `src/components/obituary/obituary-card.tsx:6`.

2) Metric metadata is duplicated between data and UI
- `MetricsToggle` defines its own metric list (labels, colors) while `allMetrics` already provides this data.
- Consider deriving the toggle list from `allMetrics` to keep labels and colors in sync.
- Files: `src/components/controls/metrics-toggle.tsx:9`, `src/data/ai-metrics.generated.ts:29`.

3) Client hooks use NodeJS.Timeout types
- `useVisualizationState` and `useTimelinePosition` use `NodeJS.Timeout` in the browser. Prefer `ReturnType<typeof setTimeout>` to avoid Node-specific typing in client code.
- Files: `src/lib/hooks/use-visualization-state.ts:135`, `src/lib/hooks/use-timeline-position.ts:156`.

4) Staggered animation docs do not match implementation
- Comment claims total stagger is capped at 500ms, but the implementation uses a fixed 50ms per child. With many points this can create long animations.
- Update the comment or compute a dynamic `staggerChildren` to cap total duration.
- File: `src/lib/utils/animation.ts:93`.

5) Focus trapping may be redundant in the modal
- `ObituaryModal` uses a custom `useFocusTrap` while Radix Dialog (Sheet) already provides focus trapping. Consider relying on Radix and using `onOpenAutoFocus` / `onCloseAutoFocus` to restore focus instead of a second trap.
- Files: `src/components/obituary/obituary-modal.tsx:76`, `src/components/ui/sheet.tsx:1`.

## Pipeline and backend

1) Sanity draft writes and duplicate checks are per-item
- `createObituaryDrafts` is sequential and `filterNewDrafts` issues one query per draft. As volume grows, this becomes slow.
- Consider batching: query all URLs in a single GROQ call and use a transaction or `createIfNotExists` to reduce round trips.
- File: `src/lib/sanity/mutations.ts:91`.

2) Whitelist handle lookup can be simplified
- `isWhitelistedHandle` lowercases by scanning the full set each call.
- Precompute a lowercase Set for O(1) lookups and clarity.
- File: `src/lib/discovery/quality-filter.ts:24`.

## Testing notes

- Strong coverage for visualization, accessibility, and performance. Consider adding a regression test for UTC-safe date formatting and a unit test covering the metrics toggle empty-state behavior.

## Suggested next steps

1) Fix date formatting across UI and ARIA strings by standardizing on the UTC helper.
2) Decide on metrics toggle empty-state behavior and align parser + UI.
3) Consolidate category and metric metadata to single sources of truth.
4) Reduce per-point hook overhead in scatter points.
5) Batch Sanity duplicate checks and writes if discovery volume grows.

---

# Functionality Test Report (December 19, 2025)

**Tested On:** http://localhost:3001 (Next.js 16.0.7 dev server)

## Critical Bug Found

### CORS Error Blocks Obituary Detail Fetch

**Severity:** Critical
**Impact:** Users cannot view full obituary details - core functionality broken

#### Symptoms
- Clicking any data point in the scatter plot shows "Obituary not found"
- Same issue affects mobile card list clicks

#### Root Cause
The `ObituaryModal` component (a Client Component with `'use client'`) calls `getObituaryBySlug()` which attempts to fetch directly from Sanity's CDN API from the browser. The Sanity project's CORS settings don't include `localhost:3001` as an allowed origin.

**Console Error:**
```
Access to XMLHttpRequest at 'https://4vkuqzjq.apicdn.sanity.io/...' from origin
'http://localhost:3001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin'
header is present on the requested resource.
```

#### Why Initial Load Works
The initial page load fetches obituaries in a Server Component (`src/app/page.tsx`), which runs on the server and bypasses CORS restrictions.

#### Recommended Fixes

**Option A: Add CORS Origins (Quick Fix)**
1. Go to Sanity Manage > Project > API > CORS origins
2. Add `http://localhost:3000` and `http://localhost:3001`
3. For production, add your production domain

**Option B: Server-Side API Route (Production-Ready)**
Create a Next.js API route to proxy the Sanity request:

```typescript
// src/app/api/obituary/[slug]/route.ts
import { getObituaryBySlug } from '@/lib/sanity/queries'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const obituary = await getObituaryBySlug(params.slug)
  if (!obituary) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(obituary)
}
```

Then update the modal to fetch from `/api/obituary/[slug]` instead.

---

### Additional Issues Found

#### Issue #2 - Missing DialogTitle for Accessibility

**Severity:** Medium
**Console Warning:** `DialogContent requires a DialogTitle for screen reader users`

The modal has `SheetTitle` but only renders it when obituary data is loaded. Ensure it's present in loading/error states too.

#### Issue #3 - Inconsistent Obituary Count Display

**Severity:** Low
Header always shows "51 OBITUARIES" but control panel correctly shows "29 of 51" when filtered.

---

## Features Working Correctly

| Feature | Status |
|---------|--------|
| Scatter Plot Visualization | ✅ |
| Tooltips on Hover | ✅ |
| Zoom In/Out/Reset | ✅ |
| Category Filters | ✅ |
| Date Range Slider | ✅ |
| Background Metrics Toggle | ✅ |
| Mobile Card Layout | ✅ |
| Mobile Navigation Menu | ✅ |
| About Page | ✅ |
| URL State Persistence | ✅ |
| Keyboard Navigation | ✅ |
