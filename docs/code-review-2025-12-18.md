# AI Obituaries – Senior Code Review Report (2025-12-18)
Reviewed at commit `0d589962daf0e35836eeac015a69abb04507ce3a` (`git rev-parse HEAD`).

Scope: `src/**`, `scripts/**`, `tests/**`, and top-level configs under the current checkout.

This report is written for a senior engineer to validate quickly and then drive thorough remediation.
It focuses on performance, correctness, maintainability, and long-term safety.

---

## 1) Executive Summary

### What’s working well

- **Separation of concerns**: App Router pages are thin; most logic lives in `src/components/**` and `src/lib/**`.
- **Accessibility is a first-class concern**:
  - Centralized announcements via `LiveRegionProvider` (`src/components/accessibility/live-region.tsx:78`).
  - Skip link wired to `#main-content` (`src/components/accessibility/skip-link.tsx:23`, `src/app/layout.tsx:57`).
  - Keyboard-first patterns in the visualization (roving focus, explicit instructions, etc.).
  - Dedicated a11y suites in Playwright (`tests/a11y/**`).
- **Performance intent is clear**:
  - Dynamic import for the visualization to avoid SSR/hydration issues (`src/app/home-client.tsx:27`).
  - Viewport-based point virtualization in the scatter plot (`src/components/visualization/scatter-plot.tsx:337`).
  - Heavy background chart is memoized with a custom comparator (`src/components/visualization/background-chart.tsx:38`).
  - Playwright performance coverage exists (`tests/performance/**`), including FPS goals (`tests/performance/interaction.spec.ts:11`).

### P0 issues (highest priority)

These are the most likely to cause meaningful performance regressions, correctness issues, or long-term maintenance hazards:

1. **`useBreakpoint()` inside every `ScatterPoint` creates N resize listeners** (major perf issue).
2. **O(n²) work during render due to per-point `findIndex`** (render-time perf trap).
3. **Cluster membership checks are repeatedly linear** (amplifies cost when clustering is enabled).
4. **Mobile vs tablet mounts both trees and hides one via CSS** (hidden subtrees still run hooks/effects).
5. **Nested `<main>` landmarks** (a11y correctness).
6. **Epoch metrics generator overwrites a file that contains handwritten helpers** (data pipeline foot-gun).

---

## 2) Architecture & Data Flow (Context)

### 2.1 Routing and layout

- Root layout: `src/app/layout.tsx:42`
  - Wraps content with header/footer and providers (`NuqsAdapter`, `LiveRegionProvider`).
  - Owns the single top-level landmark `<main id="main-content">` (`src/app/layout.tsx:57`).
- Home page server component: `src/app/page.tsx:16`
  - Fetches data server-side once via `getObituaries()` (`src/app/page.tsx:17`).
  - Builds `mobileContent` and `desktopContent` React trees and passes them to `ClientLayoutRouter` (`src/app/page.tsx:64`) to avoid desktop/mobile double-mounting.
- Layout routing: `ClientLayoutRouter` (`src/components/layout/client-layout-router.tsx:22`)
  - Uses `useBreakpoint` (`src/lib/hooks/use-breakpoint.ts:24`) to choose which tree to mount.

### 2.2 Data fetching and caching

- Sanity query layer: `src/lib/sanity/queries.ts:61`
  - Uses `client.fetch(..., { next: { tags: [...] } })` to tag cache entries (ISR-by-tag pattern).
  - Has a mock fallback gate `shouldUseMock` (`src/lib/sanity/queries.ts:9`) intended for local/dev.
- Sanity client creation: `src/lib/sanity/client.ts:7`
  - Created at module import time via `createClient`.
  - Sanity throws if `projectId` is missing; this means “mock fallback when env missing” is not reliable unless env exists.

### 2.3 Visualization architecture

- Visualization entry: `ScatterPlot` (`src/components/visualization/scatter-plot.tsx:1067`).
- Key performance structures:
  - Scales are memoized (`xScale` at `src/components/visualization/scatter-plot.tsx:234`, `yScale` at `src/components/visualization/scatter-plot.tsx:262`).
  - Positions are memoized per data/scale (`pointPositions` at `src/components/visualization/scatter-plot.tsx:276`).
  - Points are virtualized by X viewport (`visiblePointPositions` at `src/components/visualization/scatter-plot.tsx:337`).
  - Background chart is memoized to avoid pan/zoom rerenders (`src/components/visualization/background-chart.tsx:221`).
- URL-synced state:
  - Desktop “hero” layout uses `useVisualizationState` (`src/lib/hooks/use-visualization-state.ts:115`) and renders controls via `ControlPanelWrapper` (`src/components/controls/control-panel-wrapper.tsx:24`).
  - Mobile timeline uses `useFilters` (`src/lib/hooks/use-filters.ts:66`) + local date filter (`src/components/mobile/mobile-timeline.tsx:40`).

---

## 3) Findings & Recommendations

### P0 – Performance

#### P0.1: `useBreakpoint()` in each `ScatterPoint` creates N resize listeners

**Evidence**
- `ScatterPoint` calls `useBreakpoint()` (`src/components/visualization/scatter-point.tsx:78`).
- `useBreakpoint` registers a `resize` listener (`src/lib/hooks/use-breakpoint.ts:44`).

**Impact**
- If the chart renders 200 points (the perf test target), you can end up with ~200 `resize` listeners.
- On resize/orientation change this fans out into many state updates and rerenders.

**Recommendation**
- Remove breakpoint detection from `ScatterPoint`.
  - Compute breakpoint once in `ScatterPlotInner`.
  - Pass `touchRadius` or `isTablet` as a prop down to `ScatterPoint`.
- Alternative: refactor `useBreakpoint` to a shared subscription (`useSyncExternalStore`) so the whole app uses one listener (pattern already used in `useMediaQuery`, `src/lib/hooks/use-media-query.ts:10`).

**Validation**
- Add a unit test that spies on `window.addEventListener('resize', ...)` and ensures a single listener is installed for the chart (not per point).
- Re-run Playwright perf suite (`tests/performance/interaction.spec.ts:11`) on a dataset with 200+ points.

---

#### P0.2: O(n²) render-time cost from `findIndex` inside the point render loop

**Evidence**
- Inside render loop: `visibleData.findIndex(...)` (`src/components/visualization/scatter-plot.tsx:980`).

**Impact**
- If both `visiblePointPositions` and `visibleData` are size N, this is O(N²) per rerender.
- Pan/zoom and hover interactions can trigger frequent rerenders → this becomes a hotspot quickly.

**Recommendation**
- Precompute an ID → index map once per `visibleData`:
  - `const visibleIndexById = useMemo(() => new Map(visibleData.map((o, i) => [o._id, i])), [visibleData])`
  - In render: `const visibleIndex = visibleIndexById.get(obituary._id) ?? -1`.

**Validation**
- Confirm keyboard navigation order is unchanged.
- Confirm no behavior changes to roving focus and focus ring.

---

#### P0.3: Cluster membership checks are repeatedly linear

**Evidence**
- Cluster membership is checked during `visibleData` construction (`src/components/visualization/scatter-plot.tsx:328`) and again per point during render (`src/components/visualization/scatter-plot.tsx:975`).
- Current implementation is `clusters.some(... includes(...))` (`src/lib/utils/clustering.ts:129`).

**Impact**
- This adds avoidable repeated scanning, especially when zoomed out and clustering is enabled.

**Recommendation**
- Replace repeated membership scans with a `Set` computed once per cluster array:
  - `const clusteredIds = useMemo(() => new Set(clusters.flatMap(c => c.obituaryIds)), [clusters])`
  - Use `clusteredIds.has(id)` instead of `isPointClustered` in hot paths.

**Validation**
- Ensure clustered points remain excluded from keyboard navigation.
- Ensure individual dots remain hidden when clustered (current behavior uses `isClustered` to render `null` in `ScatterPoint`).

---

#### P0.4: Mobile vs tablet double-mounting due to CSS hiding

**Evidence**
- Tablet subtree: `src/app/page.tsx:26` (`className="hidden md:block"`).
- Mobile subtree: `src/app/page.tsx:36` (`className="md:hidden"`).
- Both mount; one is hidden.

**Impact**
- Hidden subtree still runs hooks/effects and mounts expensive components.
- This undermines the desktop/mobile single-mount benefit already implemented with `ClientLayoutRouter`.

**Recommendation**
- Extend the routing pattern to select between **mobile** and **tablet** without mounting both.
  - Maintain server component boundaries by passing pre-built React nodes into a client router component (the same strategy already used for desktop vs mobile).
  - Consider a 3-way router: `mobile`, `tablet`, `desktop`.

**Validation**
- Add a unit test that verifies only one subtree exists in the DOM for a given breakpoint.
- Run `tests/e2e/comprehensive-visual-test.spec.ts` at tablet viewport and confirm expected layout.

---

#### P0.5: Duplicate server fetching of data already fetched in `Home`

**Evidence**
- `Home` fetches all obituaries once (`src/app/page.tsx:17`).
- `CountDisplay` fetches count again (`src/components/obituary/count-display.tsx:21`).
- `ObituaryList` fetches obituaries again (`src/components/obituary/obituary-list.tsx:26`).

**Impact**
- Extra Sanity reads (or mock reads), plus increased complexity of cache semantics and potential mismatch between “count” and “list”.

**Recommendation**
- Pass `obituaries.length` into count displays.
- Refactor `ObituaryList` to accept `obituaries` as a prop (or remove it from the page and reuse the already-fetched array directly).

**Validation**
- Confirm homepage still renders identical content and that only one Sanity read occurs on initial SSR.

---

### P0 – Correctness / UX / a11y

#### P0.6: Nested `<main>` landmarks

**Evidence**
- Root layout renders `<main id="main-content">` (`src/app/layout.tsx:57`).
- Home page returns nested `<main>` elements (`src/app/page.tsx:20`, `src/app/page.tsx:48`).

**Impact**
- Invalid/ambiguous landmark structure for screen readers; skip-link semantics become less clear.

**Recommendation**
- Replace homepage `<main>` wrappers with `<div>` or `<section>`. Keep semantics via headings and section landmarks.

**Validation**
- Run Playwright a11y suites and manually validate landmark navigation in a screen reader.

---

#### P0.7: `/about` link exists but route is missing

**Evidence**
- Desktop nav includes `/about` (`src/components/layout/nav.tsx:36`).
- Mobile nav includes `/about` (`src/components/layout/mobile-nav.tsx:22`).
- No `src/app/about/page.tsx` exists.

**Impact**
- Broken link in production (404).

**Recommendation**
- Add `src/app/about/page.tsx` (minimal) or remove the link until the page is implemented.

**Validation**
- Add a simple e2e step that verifies clicking About returns HTTP 200 (if you keep the link).

---

#### P0.8: Hero variant can get stuck in “table mode” with no toggle

**Evidence**
- Hero path chooses table vs visualization based on persisted mode (`src/app/home-client.tsx:112`).
- Toggle UI is only in default variant (`src/app/home-client.tsx:139`).
- Desktop uses hero variant (`src/app/home-page-client.tsx:63`).

**Impact**
- A user who previously selected table view (e.g., on tablet) may land on desktop and see table view with no obvious way to switch back.

**Recommendation**
- Either force hero variant to always render visualization, or render `TableViewToggle` in the hero layout (e.g., header/sidebar).

---

### P1 – Maintainability / DX

#### P1.1: Epoch metrics generator overwrites a file with handwritten helpers

**Evidence**
- Generator writes directly to `src/data/ai-metrics.ts` (`scripts/parse-epoch-data.mjs:213`).
- That file contains handwritten helpers beyond generated metric series (`src/data/ai-metrics.ts:349`, `src/data/ai-metrics.ts:428`, `src/data/ai-metrics.ts:486`).

**Impact**
- Running `node scripts/parse-epoch-data.mjs` can delete critical application logic silently.

**Recommendation**
- Split generated output into `src/data/ai-metrics.generated.ts`, keep handwritten helpers in `src/data/ai-metrics.ts`.
- Update generator to only touch the generated file.

**Validation**
- Run the generator and confirm only the generated file changes.
- Ensure imports in `ScatterPlot` / tooltip / scale utils continue working.

---

#### P1.2: Sanity client is created eagerly and throws if env is missing

**Evidence**
- `createClient` is called at module import (`src/lib/sanity/client.ts:7`).
- Sanity throws if `projectId` is missing; this defeats the “mock fallback if env missing” intention in `src/lib/sanity/queries.ts:9`.

**Impact**
- Fresh dev setup without `.env.local` can fail at import-time instead of falling back to mock.

**Recommendation**
- Lazily construct the client (export a function `getSanityClient()`), and return `null` when env is absent/placeholder.
- Keep all “mock vs CMS” routing decisions centralized in the query layer.

**Validation**
- Start dev server with no env and confirm mock data renders.

---

#### P1.3: Year bounds inconsistent between URL state and slider

**Evidence**
- URL state max year is derived from data (`src/lib/hooks/use-visualization-state.ts:44`).
- Slider hard-codes `MAX_YEAR = 2025` (`src/components/controls/date-range-slider.tsx:8`).

**Impact**
- Updating Epoch data past 2025 produces UI that can’t represent the full data range.

**Recommendation**
- Use `getMaxDataYear()` from `src/data/ai-metrics.ts:486` in the slider too.
- Prefer a single source of truth for bounds.

---

#### P1.4: Category metadata duplication + deprecated constants still used

**Evidence**
- Canonical category definitions: `src/lib/constants/categories.ts:28`.
- Duplicate hex colors for scatter plot: `src/lib/utils/scatter-helpers.ts:7`.
- Deprecated maps still used:
  - `CATEGORY_COLORS`: `src/components/obituary/obituary-card.tsx:4`, `src/components/mobile/mobile-card-list.tsx:14`
  - `CATEGORY_LABELS`: `src/components/mobile/mobile-card-list.tsx:14`, `src/components/obituary/obituary-detail.tsx:4`

**Impact**
- Drift risk (labels/colors updated in one place, not the other).
- “Deprecated” APIs continue to propagate.

**Recommendation**
- Consolidate on `CATEGORIES`/`getCategoryLabel`/`getCategoryColor`.
- If Tailwind class maps are needed, keep them in one supported module and remove deprecated exports from use sites.

---

#### P1.5: Clustering comment doesn’t match implementation; algorithm is O(n²)

**Evidence**
- Comment claims “grid-based approach” (`src/lib/utils/clustering.ts:34`).
- Implementation uses `.filter` over all points for each point (`src/lib/utils/clustering.ts:59`).

**Impact**
- Misleading documentation.
- Scaling risk if obituary count grows.

**Recommendation**
- Either correct the comment, or implement actual spatial hashing / grid bucketing / sliding-window scan.

---

#### P1.6: Revalidation strategy and paths are inconsistent

**Evidence**
- Webhook route uses `revalidatePath('/')`, `revalidatePath('/claims')`, `revalidatePath('/obituary/[slug]', 'page')` (`src/app/api/revalidate/route.ts:14`).
- `/claims` route does not exist.
- Fetches are tagged with `obituaries` (`src/lib/sanity/queries.ts:70`) but webhook does not use `revalidateTag`.

**Impact**
- Confusing invalidation model; dead code; potential staleness in derived pages (e.g., sitemap).

**Recommendation**
- Prefer `revalidateTag('obituaries')` and ensure all reads use the same tag.
- If keeping `revalidatePath`, ensure paths exist and cover `/sitemap.xml` if necessary.
- Update unit tests that currently assert `/claims` revalidation (`tests/unit/api/revalidate.test.ts:98`).

---

### P2 – Accessibility / UX polish

#### P2.1: Reduced motion is inconsistent across animated components

**Evidence**
- Some components respect reduced motion (`CategoryFilter`: `src/components/filters/category-filter.tsx:66`, tooltip: `src/components/visualization/tooltip-card.tsx:39`).
- Others always animate (examples):
  - `CategoryChart` (`src/components/visualization/category-chart.tsx:89`)
  - `ZoomControls` (`src/components/visualization/zoom-controls.tsx:67`)
  - `ClusterBadge` (`src/components/visualization/cluster-badge.tsx:40`)

**Impact**
- Users with reduced-motion preference still see motion.

**Recommendation**
- Add `useReducedMotion` gating in remaining animated components and disable transitions/entrances when preferred.

---

#### P2.2: Keyboard navigation guardrails in `ObituaryNav`

**Evidence**
- Keyboard handler only ignores `INPUT` and `TEXTAREA` (`src/components/obituary/obituary-nav.tsx:23`).

**Impact**
- Arrow keys could unexpectedly navigate while interacting with other focusable widgets (selects, contenteditable, etc.).

**Recommendation**
- Expand guard conditions to include `SELECT`, contenteditable, and potentially `[role="textbox"]`.
- Prefer Next navigation APIs (`useRouter().push`) over `window.location.href` for SPA behavior.

---

## 4) Suggested Remediation Roadmap

### Phase 0 (P0: stabilize perf + correctness)

- Fix breakpoint listener explosion: remove `useBreakpoint` from `ScatterPoint` (`src/components/visualization/scatter-point.tsx:78`).
- Remove O(n²) `findIndex` in render (`src/components/visualization/scatter-plot.tsx:980`).
- Replace repeated cluster membership scans with a `Set` (`src/lib/utils/clustering.ts:129`, `src/components/visualization/scatter-plot.tsx:328`).
- Replace CSS-hidden tablet/mobile branching with conditional mounting (`src/app/page.tsx:26`).
- Remove nested mains (`src/app/page.tsx:20`).
- Fix `/about` link vs route mismatch (`src/components/layout/nav.tsx:36`).

### Phase 1 (P1: maintainability + data correctness)

- Split generated metrics from handwritten helpers (`scripts/parse-epoch-data.mjs:213`, `src/data/ai-metrics.ts:1`).
- Unify year bounds between slider and URL state (`src/components/controls/date-range-slider.tsx:8`, `src/lib/hooks/use-visualization-state.ts:44`).
- Standardize revalidation strategy (tag-based vs path-based) (`src/app/api/revalidate/route.ts:14`).
- Consolidate category constants and remove deprecated usage (`src/lib/constants/categories.ts:118`).

### Phase 2 (P2: polish)

- Reduced-motion parity across animations.
- Keyboard navigation refinements and SPA navigation in `ObituaryNav`.
- Reduce duplicate server fetching on homepage by passing already-fetched data through.

---

## 5) Validation Checklist

### Functional
- Desktop: chart + sidebar controls work; URL reflects metrics/categories/date range (`src/lib/hooks/use-visualization-state.ts:115`).
- Tablet: chart + list + controls work without mounting mobile timeline.
- Mobile: density bar + card list + modal behave correctly; category filter updates URL.

### Performance
- Only one breakpoint subscription is active for the chart.
- Pan/zoom rerenders do not contain O(n²) logic.
- Playwright performance tests pass (or have reliable fixtures to avoid skipping due to low point count): `tests/performance/interaction.spec.ts:11`.

### Accessibility
- Single `<main>` landmark; skip link behavior remains correct (`src/app/layout.tsx:57`).
- Reduced-motion disables non-essential animation across the app.
- Keyboard navigation doesn’t hijack arrow keys inside interactive controls.

### Data pipeline
- Running `node scripts/parse-epoch-data.mjs` does not delete handwritten helpers.

