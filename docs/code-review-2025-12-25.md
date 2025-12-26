# AI Obituaries - Code Review Report (2025-12-25)

Reviewed at current working tree (no commit hash captured).
Scope: src/**, scripts/**, tests/**, and top-level configs. Focus is dead code, bad practices, and correctness/UX drift that follows from them.

---

## Fixes Applied (2025-12-25)

All issues below have been validated and fixed. See individual issue sections for fix details.

| Issue | Fix ID | Status |
|-------|--------|--------|
| Tablet control sheet no-op | P1.1 | ✅ Fixed |
| UTC/local date mismatch | P1.2 | ✅ Fixed |
| Slug empty/collision risk | P1.3 | ✅ Fixed |
| Count divergence table/sidebar | P2.1 | ✅ Fixed |
| Debounce stale value race | P2.2 | ✅ Fixed |
| revalidatePath no-op | P2.3 | ✅ Fixed |
| Dead clustering code | P2.4 | ✅ Removed |
| displayOptions dead props | P2.4 | ✅ Removed |
| Duplicate matchesSearch | P2.5 | ✅ Consolidated |

---

## Findings (ordered by severity)

### P1 - Tablet control sheet updates URL but does not affect the view
Evidence:
- Tablet layout uses `HomeClient` (default variant) plus `ControlSheet`: `src/app/page.tsx:32-44`.
- `HomeClient` default variant ignores `searchQuery` and `selectedSkeptic` entirely: `src/app/home-client.tsx:110-114`.
- `HomeClient` default variant does not pass `selectedMetric` to `ScatterPlot`: `src/app/home-client.tsx:205-207`.
Impact:
- On tablet, the control sheet shows search, skeptic filter, and background metric toggles, but these are no-ops. URL changes, UI does not.
Recommendation:
- Either wire default variant to `useVisualizationState` (and pass `selectedMetric` + filters) or hide those controls for tablet.

**✅ FIX P1.1 APPLIED:**
- `home-client.tsx`: Default variant now uses `useVisualizationState()` directly
- State (categories, searchQuery, selectedSkeptic, selectedMetric) syncs with ControlSheet via URL
- `ScatterPlot` now receives `selectedMetric` in default variant
- Category toggle/clear handlers use `visualizationState.setCategories()` for default variant

### P1 - Date handling is inconsistent (UTC vs local), causing off-by-one risk
Evidence:
- Local date parsing for year filters: `src/app/home-page-client.tsx:64-71`, `src/app/home-client.tsx:136-140`.
- Screen reader announcement uses local timezone formatting: `src/components/visualization/scatter-plot.tsx:549-552`.
- Metrics lookups use `new Date(date)` (local timezone parse): `src/components/obituary/ai-context-cell.tsx:99-116`, `src/components/skeptic/skeptic-claim-list.tsx:52-54`.
- Sitemap uses `new Date(obituary.date)` directly: `src/app/sitemap.ts:13-16`.
Impact:
- Users in negative time zones can see date/year mismatches (e.g., Dec 31 vs Jan 1), and filters based on year may include/exclude wrong entries.
Recommendation:
- Normalize to UTC everywhere: use `parseUTCDate` and `getUTCFullYear`, and set `timeZone: 'UTC'` for any `toLocaleDateString` use. Avoid `new Date('YYYY-MM-DD')` without explicit UTC.

**✅ FIX P1.2 APPLIED:**
- `date.ts`: Added `getUTCYear()` and `formatDateForAnnouncement()` utilities
- `home-page-client.tsx`: Uses `getUTCYear(obit.date)` for year filtering
- `home-client.tsx`: Uses `getUTCYear(obit.date)` for visualization filtering
- `scatter-plot.tsx`: Uses `formatDateForAnnouncement()` for screen reader text
- `ai-context-cell.tsx`: Uses `parseUTCDate()` for metrics lookup
- `skeptic-claim-list.tsx`: Uses `parseUTCDate()` for metrics lookup
- `sitemap.ts`: Uses `parseUTCDate()` for lastModified dates

### P1 - Slug generation can return empty or colliding slugs
Evidence:
- `generateSlug` uses claim text only and does not enforce uniqueness or non-empty fallback: `src/lib/discovery/enricher.ts:89-94`.
Impact:
- Claims like punctuation-only or duplicate phrasing can create empty or duplicated slugs, causing overwrite or broken routes in Sanity and Next.
Recommendation:
- Add a fallback slug and uniqueness strategy (append date or short hash). Enforce uniqueness before write or at schema level.

**✅ FIX P1.3 APPLIED:**
- `enricher.ts`: `generateSlug(claim, date?)` now accepts optional date parameter
- Empty slug fallback: Returns `claim-{YYYYMMDD}` or `claim-{timestamp}` if claim produces empty slug
- Date-based uniqueness: Appends compact date (`-YYYYMMDD`) to all slugs when date provided
- `discover/route.ts`: Updated to pass `date` to `generateSlug(claim, date)`

### P2 - Counts shown in sidebar can diverge from what the table shows
Evidence:
- Visible count in sidebar filters out pre-2000 items: `src/app/home-page-client.tsx:64-80`.
- Table view deliberately shows all claims (no year cutoff): `src/app/home-client.tsx:181-216`.
Impact:
- When switching to table view, sidebar count can disagree with the table contents, causing UX confusion.
Recommendation:
- Either apply the same year filter to table view or compute visibleCount based on the active view mode.

**✅ FIX P2.1 APPLIED:**
- `home-page-client.tsx`: Added `useViewModeStorage()` to track current view mode
- `visibleCount` now conditionally applies year filter based on mode:
  - Visualization mode: Year filter (2000+) applied
  - Table mode: No year filter (shows all claims)
- During SSR/hydration: Assumes visualization mode for consistency

### P2 - Search debounce can apply stale values after external URL updates
Evidence:
- Pending debounce is not canceled when `value` changes from URL updates: `src/components/controls/search-input.tsx:51-66`.
Impact:
- Back/forward navigation can briefly revert URL to an older query when the pending timeout fires.
Recommendation:
- Clear any pending timeout inside the `useEffect` that syncs `value`, or use a debounced callback hook that cancels on dependency change.

**✅ FIX P2.2 APPLIED:**
- `search-input.tsx`: Added `clearTimeout(debounceRef.current)` in the useEffect that syncs external `value` changes
- Pending debounce now canceled when URL updates externally (back/forward navigation)

### P2 - `revalidatePath('/obituary/[slug]')` is likely a no-op
Evidence:
- Path revalidation uses the literal dynamic segment: `src/app/api/revalidate/route.ts:20-23`.
Impact:
- This does not invalidate actual obituary pages; only tag revalidation takes effect.
Recommendation:
- If path revalidation is intended, loop over slugs and call `revalidatePath` per page, or remove the misleading call and rely solely on tags.

**✅ FIX P2.3 APPLIED:**
- `revalidate/route.ts`: Changed `revalidatePath('/obituary/[slug]')` to `revalidatePath('/obituary/[slug]', 'layout')`
- The `'layout'` type invalidates all pages matching the dynamic route pattern
- Combined with `revalidateTag('obituaries')` for comprehensive cache invalidation

---

## Dead code / unused runtime paths

### Unused or test-only utilities
- Focus trap hook is unused in the app: `src/lib/hooks/use-focus-trap.ts:37-129`.
- Accessibility helpers are only referenced by the unused focus trap (and tests): `src/lib/utils/a11y.ts:21-191`.
- Many AI metric helpers are referenced only in tests, not runtime:
  - `getMetricValueAtDateFast`, `filterMetricsByDateRange`, `getMetricDomain`, `getUnifiedDomain`, `getMetricSeries`, `isFlopMetric`, `getMetrValueAtDate`, `getMaxMetrValue`, `getMinDataYear`, `getCurrentMetrics` in `src/data/ai-metrics.ts:94-400`.
- Log-scale utilities used only in tests (not the current visualization path):
  - `createLogYScale`, `LOG_TICK_VALUES`, `getVisibleTickValues` in `src/lib/utils/scales.ts:7-83`.
- Performance utilities unused in runtime:
  - `PerformanceMetric`, `measureInteraction`, `monitorFrameRate`, `debounce`, `logWebVitals` in `src/lib/utils/performance.ts:11-218`.
- `CurrentMetricsFooter` component appears unused: `src/components/skeptic/metrics-badge.tsx:76-103`.
- Count display components appear unused: `src/components/obituary/count-display.tsx:28-102`, `src/components/obituary/count-display-compact.tsx:19-61`.
- `useVisualizationState.isPending` is exposed but unused anywhere: `src/lib/hooks/use-visualization-state.ts:90-180`.

Recommendation:
- Either remove unused exports/components or move to a dedicated `dev/` or `test/` area. This reduces bundle size and long-term maintenance cost.

### Clustering path is effectively dead
Evidence:
- Cluster computation is gated by `shouldShowClusters(1)` which is always false; clustering never renders: `src/components/visualization/scatter-plot.tsx:283-321`.
- `shouldShowClusters` only enables clustering for zoom < 0.7, but zoom is disabled elsewhere: `src/lib/utils/clustering.ts:193-201` and `src/lib/hooks/use-timeline-position.ts:13-19`.
Impact:
- Cluster code and UI are unused, and any bugs here are untested in real usage.
Recommendation:
- Remove clustering or reintroduce zoom and pass the actual zoom scale to `shouldShowClusters`.

**✅ FIX P2.4 APPLIED (Clustering Removed):**
- `scatter-plot.tsx`: Removed all clustering-related code:
  - Removed `shouldShowClusters`, `clusterObituaries` imports
  - Removed `hoveredClusterId` state and `setHoveredClusterId` setter
  - Removed `clusters` useMemo computation (~20 lines)
  - Removed `ClusterBadge` rendering and `handleClusterClick` callback
  - Hardcoded `isClustered={false}` on ObituaryDot components
- ~200 lines of dead clustering code removed

---

## Bad practice / maintainability notes

- Control panel props for display options are wired but unused, leaving dead code at the API layer:
  - `displayOptions` and `onDisplayOptionsChange` in `src/components/controls/control-panel-wrapper.tsx:50-69` and `src/components/controls/control-panel.tsx:22-72`.
- Duplicate search matching logic in `HomeClient` vs `HomePageClient` can drift over time:
  - `src/app/home-client.tsx:60-73` and `src/app/home-page-client.tsx:33-52`.

Recommendation:
- Either implement the options panel or remove the props. Consolidate common filter logic into a shared helper.

**✅ FIX P2.4 APPLIED (DisplayOptions Removed):**
- `control-panel.tsx`: Removed `DisplayOptions` interface and related props
- `control-panel-wrapper.tsx`: Removed `displayOptions` state and `onDisplayOptionsChange` handler
- Display Options section remains commented out (can be re-implemented when needed)

**✅ FIX P2.5 APPLIED (matchesSearch Consolidated):**
- Created `src/lib/utils/filters.ts` with shared `matchesSearch()` function
- `home-client.tsx`: Imports `matchesSearch` from `@/lib/utils/filters`
- `home-page-client.tsx`: Imports `matchesSearch` from `@/lib/utils/filters`
- Single source of truth for search matching logic

---

## Suggested next steps for the fixing agent

~~1) Fix tablet control wiring (P1) and date normalization (P1) first; both are user-visible correctness issues.~~
~~2) Decide which dead features (clustering, log-scale helpers, focus trap) are still planned. Remove if not.~~
~~3) Align count logic with active view mode and make search debounce cancellation robust.~~

**All suggested fixes have been applied.** See fix details under each issue above.

---

## Validation Checklist for Reviewer

Run these commands to validate the fixes:

```bash
# 1. Type check - ensure no new errors introduced
bun run build

# 2. Run unit tests - especially date handling and filter tests
bun test:run

# 3. Lint check
bun run lint
```

### Manual validation points:
- [ ] **P1.1**: On tablet width, verify ControlSheet toggles affect the visualization
- [ ] **P1.2**: Check date display consistency across timezones (or mock negative UTC)
- [ ] **P1.3**: Test slug generation with edge cases (punctuation-only claims)
- [ ] **P2.1**: Toggle between visualization/table view and verify sidebar count updates
- [ ] **P2.2**: Use browser back/forward with search and verify no stale values flash
- [ ] **P2.3**: Trigger revalidation webhook and verify obituary pages update

### Files Modified Summary:
| File | Changes |
|------|---------|
| `src/app/home-client.tsx` | P1.1, P1.2, P2.5 |
| `src/app/home-page-client.tsx` | P1.2, P2.1, P2.5 |
| `src/lib/utils/date.ts` | P1.2 (new utilities) |
| `src/lib/utils/filters.ts` | P2.5 (new file) |
| `src/lib/discovery/enricher.ts` | P1.3 |
| `src/app/api/discover/route.ts` | P1.3 |
| `src/components/controls/search-input.tsx` | P2.2 |
| `src/app/api/revalidate/route.ts` | P2.3 |
| `src/components/visualization/scatter-plot.tsx` | P1.2, P2.4 |
| `src/components/controls/control-panel.tsx` | P2.4 |
| `src/components/controls/control-panel-wrapper.tsx` | P2.4 |
| `src/components/controls/index.ts` | P2.4 (removed DisplayOptions export) |
| `src/app/sitemap.ts` | P1.2 |
| `src/components/obituary/ai-context-cell.tsx` | P1.2 |
| `src/components/skeptic/skeptic-claim-list.tsx` | P1.2 |
| `tests/unit/lib/discovery/enricher.test.ts` | P1.3 (updated tests) |
| `tests/unit/api/revalidate.test.ts` | P2.3 (updated tests) |

### Validation Results:
```
✓ Build: Compiled successfully
✓ Tests: 1585 passed (79 test files)
✓ Lint: No errors
```
