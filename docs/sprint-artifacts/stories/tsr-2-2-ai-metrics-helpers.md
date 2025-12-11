# Story TSR-2.2: AI Metrics Helpers for Log Scale

**Story Key:** tsr-2-2-ai-metrics-helpers
**Epic:** TSR-2 - Y-Axis Log Scale (Timeline Visualization Redesign)
**Status:** ready-for-dev
**Priority:** High (Required for scatter plot Y-axis)

---

## User Story

**As a** developer,
**I want** helper functions that compute Y-axis domains from AI metrics data,
**So that** I can correctly position obituaries on a log-scale FLOP Y-axis.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-2.2.1 | Get actual FLOP at date | Given a date and trainingComputeFrontier series, when `getActualFlopAtDate()` is called, then returns actual FLOP value (not log) via interpolation |
| AC-2.2.2 | Filter metrics by date range | Given a series and year range, when `filterMetricsByDateRange()` is called, then returns only data points within the range |
| AC-2.2.3 | Compute domain for single metric | Given a series and year range, when `getMetricDomain()` is called, then returns [minFlop, maxFlop] with 1 order of magnitude padding |
| AC-2.2.4 | Compute unified domain for multiple metrics | Given multiple enabled metrics and a date range, when `getUnifiedDomain()` is called, then returns domain encompassing all enabled metrics |
| AC-2.2.5 | Handle edge cases gracefully | Given empty data or out-of-range dates, when helpers are called, then returns sensible defaults without throwing |
| AC-2.2.6 | Type exports available | MetricType union type exported for use by control components |

---

## Technical Approach

### Implementation Overview

Extend `src/data/ai-metrics.ts` with helper functions that bridge the existing metric data (stored as log10 values for training compute) to actual FLOP values needed for the log-scale Y-axis. The key insight is that `trainingComputeFrontier.data` stores `log10(FLOP)` values, so we need conversion helpers.

### Current State Analysis

**Existing `src/data/ai-metrics.ts` exports:**
```typescript
// Data structures
export interface MetricDataPoint { date: string; value: number; }
export interface AIMetricSeries { id: string; label: string; color: string; unit: string; data: MetricDataPoint[]; }

// Series data
export const mmluFrontier: AIMetricSeries    // values: 25.7 - 88.1 (percentage)
export const eciFrontier: AIMetricSeries     // values: 109.8 - 154.4 (index)
export const trainingComputeFrontier: AIMetricSeries // values: 1.6 - 26.7 (log10 FLOP)

// Existing helpers
export function getMetricValueAtDate(series: AIMetricSeries, date: Date): number
export function normalizeMetricValue(series: AIMetricSeries, value: number): number
export function getNormalizedMetricAtDate(series: AIMetricSeries, date: Date): number
```

**Existing `src/lib/utils/scales.ts` exports (from Story 2.1):**
```typescript
export const LOG_TICK_VALUES: number[]
export function createLogYScale(height: number, domain: [number, number]): LogScale
export function formatFlopTick(value: number): string
export function logToFlop(logValue: number): number
export function flopToLog(flop: number): number
export function getVisibleTickValues(domain: [number, number]): number[]
```

### Target State

Add new helpers to `src/data/ai-metrics.ts`:

```typescript
/**
 * Metric type identifiers for control components
 */
// Import MetricType from shared location (see Task 1)
import type { MetricType } from '@/types/metrics';

// Re-export for convenience
export type { MetricType };

/**
 * Get actual FLOP value (not log) at a date from training compute series.
 * Uses existing getMetricValueAtDate for interpolation, then converts from log.
 *
 * @param series - Must be trainingComputeFrontier (other series not in FLOP)
 * @param date - Target date
 * @returns Actual FLOP value (e.g., 1e24)
 */
export function getActualFlopAtDate(series: AIMetricSeries, date: Date): number {
  const logValue = getMetricValueAtDate(series, date);
  return logToFlop(logValue); // Use existing helper from scales.ts
}

/**
 * Filter metric data points to those within a year range.
 * Inclusive of start and end years.
 *
 * @param series - Any metric series
 * @param startYear - Start year (inclusive)
 * @param endYear - End year (inclusive)
 * @returns Filtered data points
 */
export function filterMetricsByDateRange(
  series: AIMetricSeries,
  startYear: number,
  endYear: number
): MetricDataPoint[] {
  return series.data.filter(point => {
    const year = new Date(point.date).getFullYear();
    return year >= startYear && year <= endYear;
  });
}

/**
 * Get Y-axis domain (actual FLOP values) for training compute within date range.
 * Adds 1 order of magnitude padding on each end for visual breathing room.
 *
 * @param series - Training compute series (values are log10 FLOP)
 * @param startYear - Start year
 * @param endYear - End year
 * @returns [minFlop, maxFlop] suitable for log scale domain
 */
export function getMetricDomain(
  series: AIMetricSeries,
  startYear: number,
  endYear: number
): [number, number] {
  const filtered = filterMetricsByDateRange(series, startYear, endYear);

  if (filtered.length === 0) {
    // Fallback to full series range
    const values = series.data.map(d => d.value);
    const minLog = Math.min(...values);
    const maxLog = Math.max(...values);
    return [Math.pow(10, minLog - 1), Math.pow(10, maxLog + 1)];
  }

  const values = filtered.map(d => d.value);
  const minLog = Math.min(...values);
  const maxLog = Math.max(...values);

  // Add 1 order of magnitude padding
  return [Math.pow(10, minLog - 1), Math.pow(10, maxLog + 1)];
}

/**
 * Get unified Y-axis domain encompassing all enabled metrics.
 * For now, only training compute affects the FLOP domain.
 * MMLU and ECI will need secondary Y-axis or overlay treatment (Epic 4).
 *
 * @param enabledMetrics - Array of enabled metric types
 * @param startYear - Start year
 * @param endYear - End year
 * @returns [minFlop, maxFlop] domain for log Y-axis
 */
export function getUnifiedDomain(
  enabledMetrics: MetricType[],
  startYear: number,
  endYear: number
): [number, number] {
  // Training compute is the primary metric for FLOP Y-axis
  if (enabledMetrics.includes('compute')) {
    return getMetricDomain(trainingComputeFrontier, startYear, endYear);
  }

  // Default domain if no compute metric enabled
  // Covers typical AI progress range (10^17 to 10^27)
  return [1e17, 1e27];
}

/**
 * Get metric series by type identifier.
 * Useful for dynamic metric selection.
 */
export function getMetricSeries(metricType: MetricType): AIMetricSeries {
  switch (metricType) {
    case 'compute': return trainingComputeFrontier;
    case 'mmlu': return mmluFrontier;
    case 'eci': return eciFrontier;
  }
}

/**
 * Check if a metric type uses FLOP scale (vs percentage or index).
 * Used to determine which metrics affect the Y-axis domain.
 */
export function isFlopMetric(metricType: MetricType): boolean {
  return metricType === 'compute';
}
```

### Key Implementation Details

1. **Log to Linear Conversion**
   - `trainingComputeFrontier` stores `log10(FLOP)` values (e.g., 24.4 for 10^24.4 FLOP)
   - `getActualFlopAtDate()` converts via `logToFlop()` from `@/lib/utils/scales`
   - Reuses existing helper to avoid code duplication
   - This enables correct positioning on a visx `scaleLog` axis

2. **Domain Padding**
   - Add 1 order of magnitude (10x) padding on each end
   - Example: data range 10^20 to 10^25 becomes domain [10^19, 10^26]
   - Prevents points from touching axis edges

3. **Date Filtering**
   - Year-based filtering (not exact date) for simplicity
   - Inclusive bounds: `startYear <= year <= endYear`
   - Empty result falls back to full series range

4. **MetricType Union (Shared)**
   - Matches metric series `id` values: 'compute' | 'mmlu' | 'eci'
   - Defined in `src/types/metrics.ts` to avoid duplication
   - Already exists in `control-panel.tsx` - refactor to shared location
   - Used by MetricsToggle component (Story 3.2)
   - Enables type-safe metric selection

5. **Unified Domain Strategy**
   - Only `compute` metric affects FLOP Y-axis domain
   - MMLU (percentage) and ECI (index) need different treatment
   - Background chart (Epic 4) will handle non-FLOP overlay

---

## Tasks

### Task 1: Create Shared MetricType (10 min)
**AC Coverage:** AC-2.2.6

- [ ] Create `src/types/metrics.ts` with `MetricType` union type: `'compute' | 'mmlu' | 'eci'`
- [ ] Update `src/components/controls/control-panel.tsx` to import from `@/types/metrics`
- [ ] Re-export `MetricType` from `src/data/ai-metrics.ts` for convenience
- [ ] Verify type matches existing series `id` values

**Note:** MetricType already exists in `control-panel.tsx` (line 7). Moving to shared location avoids duplication.

### Task 2: Implement getActualFlopAtDate (15 min)
**AC Coverage:** AC-2.2.1

- [ ] Add import: `import { logToFlop } from '@/lib/utils/scales'`
- [ ] Create function using existing `getMetricValueAtDate()`
- [ ] Convert log value to actual FLOP via `logToFlop(logValue)` (reuse scales.ts helper)
- [ ] Add JSDoc with usage example
- [ ] Test with known dates from trainingComputeFrontier

### Task 3: Implement filterMetricsByDateRange (15 min)
**AC Coverage:** AC-2.2.2

- [ ] Create function accepting series, startYear, endYear
- [ ] Filter by extracting year from date strings
- [ ] Return filtered MetricDataPoint array
- [ ] Handle empty series gracefully (return empty array)

### Task 4: Implement getMetricDomain (20 min)
**AC Coverage:** AC-2.2.3, AC-2.2.5

- [ ] Create function using filterMetricsByDateRange
- [ ] Find min/max log values in filtered range
- [ ] Add 1 order of magnitude padding (minLog - 1, maxLog + 1)
- [ ] Convert to actual FLOP values for domain tuple
- [ ] Handle empty filter result with fallback to full range

### Task 5: Implement getUnifiedDomain (15 min)
**AC Coverage:** AC-2.2.4

- [ ] Create function accepting enabledMetrics array
- [ ] Check if 'compute' is in enabled metrics
- [ ] Return getMetricDomain result for compute
- [ ] Return default domain [1e17, 1e27] if no compute

### Task 6: Add Helper Utilities (10 min)
**AC Coverage:** AC-2.2.6

- [ ] Implement `getMetricSeries(metricType: MetricType)`
- [ ] Implement `isFlopMetric(metricType: MetricType)` (FLOP = Floating point OPerations)
- [ ] Export all new functions and types

### Task 7: Write Unit Tests (30 min)
**AC Coverage:** All

Create `tests/unit/data/ai-metrics-helpers.test.ts`:

- [ ] Test getActualFlopAtDate returns correct FLOP for known dates
- [ ] Test getActualFlopAtDate interpolates between data points
- [ ] Test filterMetricsByDateRange filters correctly
- [ ] Test filterMetricsByDateRange handles boundary years
- [ ] Test filterMetricsByDateRange returns empty for out-of-range
- [ ] Test getMetricDomain returns padded domain
- [ ] Test getMetricDomain handles empty filter with fallback
- [ ] Test getUnifiedDomain with compute enabled
- [ ] Test getUnifiedDomain without compute returns default
- [ ] Test getMetricSeries returns correct series
- [ ] Test isFlopMetric returns true only for compute

### Task 8: Integration Verification (10 min)

- [ ] Import helpers in a test component
- [ ] Verify TypeScript types are correct
- [ ] Verify no circular dependencies with scales.ts
- [ ] Run `bun run lint` - no errors
- [ ] Run `bun test:run` - all tests pass

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Story 2.1 | done | Scale utilities (logToFlop, flopToLog) available in scales.ts |
| src/data/ai-metrics.ts | Existing | Contains metric series data and getMetricValueAtDate |

### Downstream Dependencies

Stories that depend on these helpers:
- **Story 2.3:** ScatterPlot Y-Axis (uses getActualFlopAtDate, getMetricDomain)
- **Story 3.2:** MetricsToggle (uses MetricType)
- **Story 4.1:** BackgroundChart Toggles (uses getMetricSeries, MetricType)
- **Story 5.3:** Tooltip Enhancement (uses getActualFlopAtDate)

---

## Definition of Done

- [ ] `MetricType` union type exported
- [ ] `getActualFlopAtDate()` returns actual FLOP values
- [ ] `filterMetricsByDateRange()` filters by year range
- [ ] `getMetricDomain()` returns padded domain for date range
- [ ] `getUnifiedDomain()` computes domain for enabled metrics
- [ ] `getMetricSeries()` and `isFlopMetric()` helpers work
- [ ] All edge cases handled (empty data, out-of-range)
- [ ] Unit tests pass for all new functions
- [ ] No TypeScript errors
- [ ] Lint passes (`bun run lint`)
- [ ] No circular dependencies introduced

---

## Test Scenarios

### Unit Test Scenarios

1. **getActualFlopAtDate - Known Data Point**
   ```typescript
   // trainingComputeFrontier has { date: "2023-03-01", value: 25.3 }
   const date = new Date('2023-03-01');
   const flop = getActualFlopAtDate(trainingComputeFrontier, date);
   expect(flop).toBeCloseTo(Math.pow(10, 25.3), 5);
   ```

2. **getActualFlopAtDate - Interpolation**
   ```typescript
   // Between "2022-04-01" (24.4) and "2023-03-01" (25.3)
   const date = new Date('2022-10-01');
   const flop = getActualFlopAtDate(trainingComputeFrontier, date);
   expect(flop).toBeGreaterThan(Math.pow(10, 24.4));
   expect(flop).toBeLessThan(Math.pow(10, 25.3));
   ```

3. **filterMetricsByDateRange - Boundary Inclusion**
   ```typescript
   const filtered = filterMetricsByDateRange(trainingComputeFrontier, 2020, 2022);
   // Should include 2020-01-01, 2020-05-01, 2021-*, 2022-*
   expect(filtered.length).toBeGreaterThan(0);
   filtered.forEach(point => {
     const year = new Date(point.date).getFullYear();
     expect(year).toBeGreaterThanOrEqual(2020);
     expect(year).toBeLessThanOrEqual(2022);
   });
   ```

4. **getMetricDomain - Padded Domain**
   ```typescript
   const [min, max] = getMetricDomain(trainingComputeFrontier, 2020, 2023);
   // Data range ~23.0 to ~25.3, so domain should be ~10^22 to ~10^26.3
   expect(min).toBeLessThan(1e23);
   expect(max).toBeGreaterThan(1e25);
   ```

5. **getUnifiedDomain - Default Without Compute**
   ```typescript
   const [min, max] = getUnifiedDomain(['mmlu', 'eci'], 2020, 2025);
   expect(min).toBe(1e17);
   expect(max).toBe(1e27);
   ```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/types/metrics.ts` | Create | Shared MetricType union type |
| `src/components/controls/control-panel.tsx` | Modify | Import MetricType from shared location |
| `src/data/ai-metrics.ts` | Modify | Add helper functions, import logToFlop, re-export MetricType |
| `tests/unit/data/ai-metrics-helpers.test.ts` | Create | Unit tests for new helpers |

---

## FR/TSR Coverage

| Requirement ID | Description | How Satisfied |
|----------------|-------------|---------------|
| TSR8 | Obituaries position correctly on log scale based on FLOP at date | getActualFlopAtDate provides FLOP values for positioning |

---

## Technical Notes

### Why Separate from scales.ts

- `scales.ts` contains generic log-scale utilities (visx scale creation, formatting)
- `ai-metrics.ts` contains domain-specific metric data and helpers
- Separation maintains single responsibility
- `ai-metrics.ts` imports `logToFlop` from `scales.ts` (no circular dependency since scales.ts doesn't import from ai-metrics)

### MMLU and ECI on FLOP Axis

These metrics don't represent FLOP values:
- MMLU: Percentage (25-88%)
- ECI: Index score (109-155)

For background chart visualization (Epic 4):
- Option A: Normalize to FLOP range (lose meaning)
- Option B: Separate Y-axis or overlay
- Tech spec implies shared FLOP scale, so likely normalization

Current implementation focuses on training compute for Y-axis domain. Background chart adaptation is deferred to Story 4.2.

### Performance Considerations

- `filterMetricsByDateRange` creates new array each call
- For frequently called code, consider memoization at component level
- Data sizes are small (<50 points per series), so no concern

---

## Dev Agent Record

_This section is populated during implementation_

### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

### File List

---

_Story created: 2025-12-11_
_Epic: TSR-2 - Y-Axis Log Scale (Timeline Visualization Redesign)_
_Sequence: 2 of 4 in Epic TSR-2_
_Requirements: TSR8_
