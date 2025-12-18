# AI Obituaries – Full Codebase Review Report
**Date:** 2025‑12‑12  
**Reviewer:** GPT‑5.2 (Codex CLI)  
**Scope:** Entire repository under `/Users/luca/dev/aiobituaries` as currently checked out.

This report is intended for senior‑level validation and then implementation planning.  
Each finding includes concrete file paths (and relevant symbols/sections) plus recommended fixes.

---

## 1. Executive Summary

The project is a Next.js App Router site that visualizes “AI is dead/overhyped” claims over exponential AI progress trends, with Sanity CMS as the primary data source and a robust local mock fallback. The codebase is overall well structured, with clear server/client separation, strong accessibility and performance intent, and comprehensive unit + e2e/a11y/perf test coverage.

However, there are **two release‑blocking issues**:

1. **Motion library dependency mismatch**: code imports `framer-motion`, but `package.json` does not depend on it (it depends on `motion` instead). Fresh installs or CI will fail.  
   - Evidence: `package.json`, multiple imports across `src/**` (see Section 4.1).
2. **Desktop/mobile layout double‑mounting**: the homepage renders both mobile and desktop trees and hides one via CSS, which still mounts hooks/components and can create performance + state side effects.  
   - Evidence: `src/app/page.tsx` (see Section 4.2).

Addressing those should be top priority before any other refactors.

---

## 2. Architecture Overview (for context)

### 2.1 App + Data Flow

- **Framework:** Next.js 16 App Router.  
  - Root layout: `src/app/layout.tsx` (fonts, global providers, header/footer, live region).
  - Homepage: `src/app/page.tsx` (fetches obituaries server‑side, routes to mobile vs desktop).
  - Dynamic obituary pages: `src/app/obituary/[slug]/page.tsx` with `generateStaticParams`.

- **CMS:** Sanity (read‑only client).
  - Client config: `src/lib/sanity/client.ts`
  - Queries & mock fallback: `src/lib/sanity/queries.ts`

- **ISR / Revalidation:**  
  - On‑demand webhook route: `src/app/api/revalidate/route.ts`
  - Cache tags used in queries: `next: { tags: ['obituaries'] }`

- **Metrics data:** Epoch AI CSVs parsed into static TS series.
  - Data file: `src/data/ai-metrics.ts`
  - Parser script: `scripts/parse-epoch-data.mjs`

### 2.2 Visualization System

- Scatter plot + background trends using Visx and Framer Motion.
  - Main component: `src/components/visualization/scatter-plot.tsx`
  - Background lines: `src/components/visualization/background-chart.tsx`
  - Points: `src/components/visualization/scatter-point.tsx`
  - Clustering: `src/lib/utils/clustering.ts`
  - Scales: `src/lib/utils/scales.ts`

### 2.3 State Management

- URL‑synced filters and controls via `nuqs`.
  - Category filters (simple): `src/lib/hooks/use-filters.ts`
  - Full visualization state (metrics, categories, date range): `src/lib/hooks/use-visualization-state.ts`

### 2.4 Testing

- Unit tests: Vitest + Testing Library (`tests/unit/**`)  
- E2E, a11y, performance: Playwright (`tests/e2e/**`, `tests/a11y/**`, `tests/performance/**`)  
- Configs: `vitest.config.ts`, `playwright.config.ts`

---

## 3. Strengths / What’s Working Well

1. **Clear server/client separation.**
   - Server data fetch + caching in `src/lib/sanity/queries.ts`, used by server pages/components (`src/app/page.tsx`, `src/components/obituary/count-display*.tsx`).
   - Client interactivity isolated to `src/components/**` and `src/lib/hooks/**`.

2. **Accessibility is first‑class.**
   - Skip link + live region providers: `src/components/accessibility/skip-link.tsx`, `src/components/accessibility/live-region.tsx`, `src/app/layout.tsx`.
   - Roving tabindex for SVG points: `src/lib/hooks/use-roving-focus.ts`, used in `src/components/visualization/scatter-plot.tsx`.
   - Focus trap for modal: `src/lib/hooks/use-focus-trap.ts`, used in `src/components/obituary/obituary-modal.tsx`.
   - Dedicated a11y tests in Playwright and Vitest.

3. **Performance intent is strong.**
   - Virtualized point rendering: `visiblePointPositions` in `src/components/visualization/scatter-plot.tsx`.
   - Memoized background lines with custom equality: `src/components/visualization/background-chart.tsx`.
   - Dev‑only perf measurement utilities: `src/lib/utils/performance.ts`.

4. **Test coverage is unusually comprehensive for a small app.**
   - Most hooks and visualization behavior have direct tests (e.g., clustering, zoom, Y‑axis domains, keyboard navigation).

---

## 4. Findings & Recommendations

### 4.1 Release Blocker: Motion Library Dependency Mismatch

**Evidence**
- `package.json` dependencies include `"motion": "^12.23.24"` but **do not include** `framer-motion`.  
  - File: `package.json`
- Many files import from `framer-motion`, e.g.:
  - `src/components/visualization/scatter-plot.tsx`
  - `src/components/visualization/scatter-point.tsx`
  - `src/components/visualization/tooltip-card.tsx`
  - `src/components/visualization/zoom-controls.tsx`
  - `src/components/filters/category-filter.tsx`
  - `src/components/filters/category-pill.tsx`
  - `src/components/obituary/obituary-modal.tsx`
  - `src/components/accessibility/skip-link.tsx`
  - `src/lib/hooks/use-zoom.ts`
  - `src/lib/utils/animation.ts`

**Impact**
- Fresh installs, CI, and Vercel builds will fail with “Cannot find module 'framer-motion'”.
- Current lockfile may mask the issue locally, but it is not reliable.

**Recommendation**
Choose **one** motion stack and align code + deps:

Option A (lowest churn):  
1. Add `framer-motion` to dependencies.  
2. Remove unused `"motion"` dependency if not required.  

Option B (forward‑looking):  
1. Migrate imports to `motion/react` (the Motion One React package).  
2. Update `src/lib/utils/animation.ts` types (`Variants`) to Motion One equivalents.  
3. Remove `framer-motion` usage entirely and keep `"motion"` dependency.  

Given current code and tests, **Option A** is likely 1‑2 hours, **Option B** could be multiple days due to API differences.

---

### 4.2 Release/Perf Risk: Homepage Double‑Mounting via CSS

**Evidence**
- Homepage renders both mobile/tablet tree and desktop tree, hiding one with Tailwind classes:
  - File: `src/app/page.tsx`
    - Mobile tree inside `<div className="lg:hidden">…</div>`
    - Desktop tree inside `<div className="hidden lg:block">…</div>`

**Impact**
- Hidden subtree still mounts and runs:
  - hooks (`nuqs`, `useBreakpoint`, `useTimelinePosition`, localStorage access)
  - heavy chart components (Visx + motion)
- Increased CPU/memory on load; potential state duplication if both trees touch shared URL/localStorage state.

**Recommendation**
- Prefer conditional rendering rather than CSS hiding.
  - Option A: move breakpoint detection to a small client wrapper and render exactly one variant:
    - Use existing `useBreakpoint` (`src/lib/hooks/use-breakpoint.ts`) to choose mobile vs desktop.
  - Option B: split routes/layouts (e.g., dedicated `/desktop` experimental), but A is simpler.

If you must keep CSS hiding, add guards so hidden trees do not initialize heavy hooks (e.g., avoid mounting `ScatterPlot` until visible).

---

### 4.3 Security: Sanity‑Sourced URL Injection

**Evidence**
- External links use raw `obituary.sourceUrl` from CMS:
  - `src/components/obituary/obituary-detail.tsx` (`href={obituary.sourceUrl}`)
  - `src/components/obituary/obituary-modal.tsx` (`href={obituary.sourceUrl}`)

**Impact**
- If CMS content is compromised (or even mistaken), `javascript:` or other dangerous schemes could be inserted → XSS on click.

**Recommendation**
- Add a small URL sanitizer/allowlist:
  - new util, e.g., `src/lib/utils/url.ts`:
    - allow only `http:`/`https:`
    - fallback to `#` or omit link if invalid.
- Apply sanitizer in both components, and add unit tests.

---

### 4.4 Security: JSON‑LD Script Breakout Risk

**Evidence**
- JSON‑LD rendered with `dangerouslySetInnerHTML`:
  - File: `src/components/seo/json-ld.tsx`
  - Data includes `obituary.claim`, `obituary.source`.

**Impact**
- If any string contains `</script>` or `<`, it could break out of the JSON‑LD script tag.
- Low probability with trusted CMS, but still a web hardening concern.

**Recommendation**
- Escape closing script tags / `<` before `JSON.stringify`, or use a safe serialization helper:
  - Replace `</script>` with `<\\/script>` and `<` with `\\u003c`.
  - Add a unit test in `tests/unit/components/seo/json-ld.test.tsx`.

---

### 4.5 Correctness/DX: Mock Fallback Guard Misses README Placeholder

**Evidence**
- `shouldUseMock` in `src/lib/sanity/queries.ts` checks for projectId placeholder values:
  - It treats `'placeholder'` and `'your_project_id'` as invalid.
- `.env.local.example` uses `NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here`.
  - File: `.env.local.example`
- README references a non‑existent `.env.example`:
  - File: `README.md`

**Impact**
- New devs following README will set `your_project_id_here`, which is **not recognized** by the mock guard, leading to:
  - repeated failing Sanity fetches
  - confusing dev UX

**Recommendation**
- Update mock guard to include `'your_project_id_here'`.  
  - File: `src/lib/sanity/queries.ts`
- Fix README to reference `.env.local.example` (or add `.env.example`).
  - File: `README.md`

---

### 4.6 Performance: Clustering is O(n²)

**Evidence**
- `computeClusters` filters `sortedPoints` for each point to find nearby items:
  - File: `src/lib/utils/clustering.ts`

**Impact**
- Current dataset likely small; fine today.  
- If obituaries grow into thousands, clustering will become a hotspot on zoom/pan.

**Recommendation**
- Replace naive filtering with:
  - a sliding window on sorted X to limit candidates, or
  - a simple spatial hash grid.
- Keep `ClusterConfig.threshold / zoomScale` semantics.
- Expand `tests/unit/lib/utils/clustering.test.ts` to cover any new logic.

---

### 4.7 Maintainability: Duplicated Category Source of Truth

**Evidence**
- Category values hard‑coded in multiple places:
  - Canonical order: `src/lib/constants/categories.ts` (`CATEGORY_ORDER`)
  - URL parser list: `src/lib/hooks/use-visualization-state.ts` (`CATEGORY_VALUES`)
  - Deprecated mapping still imported by UI:
    - `CATEGORY_LABELS` used in `src/components/filters/category-filter.tsx`

**Impact**
- Risk of drift if categories change; deprecated constants keep spreading.

**Recommendation**
- Import `CATEGORY_ORDER` (or derived list) everywhere; delete `CATEGORY_VALUES` literal.
  - File: `src/lib/hooks/use-visualization-state.ts`
- Replace `CATEGORY_LABELS` usage with `getCategoryLabel` or `CATEGORIES[id].label`.
  - File: `src/components/filters/category-filter.tsx`

---

### 4.8 Maintainability: Hard‑coded Year Bounds

**Evidence**
- URL state bounds fixed to 1950–2025:
  - File: `src/lib/hooks/use-visualization-state.ts` (`MIN_YEAR`, `MAX_YEAR`, defaults)

**Impact**
- Every time Epoch data updates, this constant must be manually edited or URLs clamp incorrectly.

**Recommendation**
- Derive `MAX_YEAR` (and maybe `MIN_YEAR`) from metrics series at runtime:
  - `trainingComputeFrontier.data.at(-1)` or shared helper in `src/data/ai-metrics.ts`.
- Update tests in `tests/unit/lib/hooks/use-visualization-state.test.ts`.

---

### 4.9 Typing: `any` for `xScale` in BackgroundChart

**Evidence**
- `xScale` typed as `any`:
  - File: `src/components/visualization/background-chart.tsx`

**Impact**
- Loses type safety on domain/range usage; minor but avoidable.

**Recommendation**
- Type as Visx time scale:
  - `import type { ScaleTime } from '@visx/scale'`
  - `xScale: ScaleTime<number, number>`
- Update unit tests if needed (likely no change).

---

### 4.10 Repo Hygiene: `.DS_Store` Tracked

**Evidence**
- Tracked `.DS_Store` in multiple directories (`ls` output and file list):
  - `src/.DS_Store`, `src/app/.DS_Store`, `src/components/.DS_Store`, `src/lib/.DS_Store`
  - `docs/.DS_Store`, `tests/.DS_Store`, etc.

**Impact**
- Noise in diffs/PRs; cross‑platform annoyance.

**Recommendation**
- Remove from git and ensure `.gitignore` includes `.DS_Store` (it currently does globally, but files remain tracked).
  - Files: `.gitignore`, remove tracked `.DS_Store` blobs.

---

### 4.11 Minor: Category Filter Animations Don’t Respect Reduced Motion

**Evidence**
- `motion.div/button` initial/animate always run:
  - Files:
    - `src/components/filters/category-filter.tsx`
    - `src/components/filters/category-pill.tsx`

**Impact**
- Users with reduced‑motion preference still see entrance and hover scale animations.

**Recommendation**
- Use `useReducedMotion` to disable entrance animations and hover/tap scaling when preferred.
- Keep tests minimal (can be snapshot‑based or no‑op).

---

### 4.12 Minor: Tooltip uses full FLOP series even when compute hidden

**Evidence**
- Tooltip always shows FLOP value:
  - File: `src/components/visualization/tooltip-card.tsx`

**Impact**
- When compute metric is disabled in desktop controls, tooltip still references compute; could confuse users.

**Recommendation**
- Pass enabled metrics to tooltip (or a boolean) from `ScatterPlot` and hide the FLOP line when compute is off.

---

### 4.13 Minor: `useFilters` vs `useVisualizationState` duplication

**Evidence**
- Mobile/default path uses `useFilters` inside `HomeClient`:
  - File: `src/app/home-client.tsx`
- Desktop path uses `useVisualizationState` in `HomePageClient`:
  - File: `src/app/home-page-client.tsx`

**Impact**
- Two URL state systems for categories (`cat`) could diverge in behavior (defaults, parsing, history mode).

**Recommendation**
- Consider consolidating on `useVisualizationState` for both variants, or at least share parsers/constants.

---

## 5. Testing & Tooling Review

**Strengths**
- Wide unit coverage for hooks + visualization.  
  - E.g., `tests/unit/components/visualization/*`, `tests/unit/lib/hooks/*`.
- Playwright suites cover a11y, perf, and complex flows (`tests/a11y/**`, `tests/performance/**`, `tests/e2e/**`).
- Dev configs are modern and aligned with Next 16 and React 19.

**Potential gaps**
- No tests asserting safe URL schemes or JSON‑LD escaping (recommended in Sections 4.3–4.4).
- If you refactor breakpoint conditional rendering, add a shallow unit test ensuring only one tree mounts.

---

## 6. Suggested Fix Roadmap

### Phase 0 – Release blockers (same PR)
1. **Resolve motion dependency mismatch** (Section 4.1).  
2. **Remove CSS‑hidden double‑mounting on homepage** (Section 4.2).  
3. Update README/env placeholder + mock guard (Section 4.5).

### Phase 1 – Security hardening
1. Sanitize `sourceUrl` before rendering (Section 4.3).  
2. Escape JSON‑LD serialization (Section 4.4).

### Phase 2 – Maintainability & perf
1. Deduplicate category constants and deprecations (Section 4.7).  
2. Derive year bounds dynamically (Section 4.8).  
3. Tighten typing (`xScale`) (Section 4.9).  
4. Remove tracked `.DS_Store` (Section 4.10).

### Phase 3 – Nice‑to‑haves
1. Reduced‑motion compliance in filters (Section 4.11).  
2. Tooltip FLOP line conditional on compute being enabled (Section 4.12).  
3. State hook consolidation (Section 4.13).  
4. If data grows, optimize clustering (Section 4.6).

---

## 7. Appendix: Notable Files

- Core app routing/layout:
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `src/app/obituary/[slug]/page.tsx`
  - `src/app/api/revalidate/route.ts`

- Sanity + data:
  - `src/lib/sanity/client.ts`
  - `src/lib/sanity/queries.ts`
  - `src/data/ai-metrics.ts`

- Visualization:
  - `src/components/visualization/scatter-plot.tsx`
  - `src/components/visualization/background-chart.tsx`
  - `src/components/visualization/scatter-point.tsx`
  - `src/lib/utils/clustering.ts`
  - `src/lib/utils/scales.ts`

- State hooks:
  - `src/lib/hooks/use-filters.ts`
  - `src/lib/hooks/use-visualization-state.ts`
  - `src/lib/hooks/use-zoom.ts`
  - `src/lib/hooks/use-timeline-position.ts`
  - `src/lib/hooks/use-roving-focus.ts`

- Accessibility & SEO:
  - `src/components/accessibility/*`
  - `src/components/seo/json-ld.tsx`
  - `src/lib/utils/a11y.ts`

---

If you want, I can turn Phase 0 + Phase 1 into concrete patches in a follow‑up turn once you confirm which motion stack you prefer.
