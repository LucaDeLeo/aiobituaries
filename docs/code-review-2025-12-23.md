# AI Obituaries - Comprehensive Code Review Report (2025-12-23)
Reviewed at commit `9892d78ce3712732f2cda77f1af6a81e4d614029`.

Scope: `src/**`, `scripts/**`, `tests/**`, and top-level configs under the current checkout.
This review focuses on correctness, performance, accessibility, maintainability, and testing quality.

---

## Findings (ordered by severity)

### P0 -- Accessibility / Correctness

**P0.1 Keyboard activation of scatter points fails (Enter/Space no-op)**
- Evidence: `pointRefs` is declared but never populated, yet used for keyboard activation.
  - `src/components/visualization/scatter-plot.tsx:315-489` (declared and read)
  - `src/components/visualization/scatter-plot.tsx:865-889` (refs use `getItemRef`, not `pointRefs`)
- Impact: Keyboard users can focus points but cannot open the modal, breaking WCAG 2.1.1/2.1.2 for core interactions.
- Recommendation: Use `event.currentTarget` when handling Enter/Space, or store the same ref in both roving focus and activation. Remove `pointRefs` if redundant.

---

### P1 -- Correctness / UX / Performance

**P1.1 Mobile navigation omits the Skeptics page**
- Evidence: `src/components/layout/mobile-nav.tsx:22-25` only includes Home and About.
- Impact: `/skeptics` is reachable on desktop but not mobile, creating a feature parity gap.
- Recommendation: Centralize nav links (e.g., `NAV_LINKS`) and reuse in both desktop and mobile navs.

**P1.2 Mobile date filtering mixes UTC and local dates**
- Evidence:
  - `src/components/mobile/mobile-timeline.tsx:54-57` uses `new Date(ob.date)` for comparisons.
  - `src/components/mobile/density-bar.tsx:67-145` builds ranges with local-time constructors (`new Date(year, month, day)`).
- Impact: Users in negative time zones can see off-by-one-day behavior at month/year boundaries; filters may include/exclude edge entries incorrectly.
- Recommendation: Normalize to UTC everywhere (e.g., `new Date(ob.date + 'T00:00:00Z')` and `new Date(Date.UTC(year, month, day))`) or reuse a shared UTC helper.

**P1.3 Metric interpolation is O(n) with repeated Date parsing in hot paths**
- Evidence: `src/data/ai-metrics.generated.ts:505-522` loops linearly and constructs `Date` per point on each call.
- Impact: `ScatterPlot` calls `getActualFlopAtDate` per obituary, leading to O(n*m) work and repeated parsing; this can cause jank as the dataset grows.
- Recommendation: Precompute timestamp arrays once (handwritten helper or generator change) and use binary search for interpolation. Cache min/max for `normalizeMetricValue`.

---

### P2 -- Testing / Maintainability / Polishing

**P2.1 Lighthouse CI targets a likely 404 slug**
- Evidence: `lighthouserc.js:21-24` uses `/obituary/sample-slug`.
- Impact: Lighthouse results can be skewed by 404 pages, hiding real performance issues or failing CI for the wrong reasons.
- Recommendation: Point to a known slug from mock data or seed data, or generate a slug during CI setup.

**P2.2 Route params typed as `Promise` (non-standard in Next app router)**
- Evidence:
  - `src/app/obituary/[slug]/page.tsx:22-24`
  - `src/app/skeptics/[slug]/page.tsx:18-20`
  - `src/app/api/obituary/[slug]/route.ts:11-14`
- Impact: Confusing types and unnecessary `await` usage; future refactors can introduce subtle mistakes.
- Recommendation: Use `params: { slug: string }` and reference `params.slug` directly. Remove the unused `request` parameter in the API route if not needed.

**P2.3 Unused direct dependency**
- Evidence: `package.json:46` includes `motion`, but no imports exist in `src/**`.
- Impact: Unnecessary install size and potential confusion vs `framer-motion`.
- Recommendation: Remove `motion` if unused, or document why it must remain (e.g., if required by Sanity tooling).

**P2.4 Timeouts without cleanup in modal close paths**
- Evidence: `src/components/obituary/obituary-modal.tsx:56-61` and `src/components/visualization/scatter-plot.tsx:422-427`.
- Impact: Low risk, but timeouts can fire after unmount and cause state updates in edge cases.
- Recommendation: Store timeout IDs in refs and clear on unmount/close, or use `requestAnimationFrame` for focus restore.

---

## Strengths
- Clear separation between server data fetching and client interactivity (`src/app/page.tsx`, `src/app/home-client.tsx`).
- Strong accessibility patterns (live region, skip link, roving focus, reduced motion handling).
- Performance intent is visible (dynamic import of the visualization, virtualization of points, memoized background chart).
- Robust Sanity fallback logic and mock data for local/dev.

---

## Open Questions / Assumptions
- Should `/skeptics` be part of the mobile nav? (Assumed yes, given desktop nav.)
- Is mobile date filtering intended to be timezone-agnostic? (Assumed yes, since dates are stored as YYYY-MM-DD.)
- Is the metric series size small enough that linear interpolation is acceptable? (Assumed no for future scale.)

---

## Testing Notes
- Tests not run (not requested).
- If you address P0/P1 items, re-run `pnpm test` and Playwright a11y/perf suites to confirm no regressions.

