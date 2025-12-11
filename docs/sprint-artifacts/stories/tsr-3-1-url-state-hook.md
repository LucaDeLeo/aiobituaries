# Story TSR-3-1: Create URL State Hook

**Epic:** TSR-3 (Control Panel Implementation)
**Status:** drafted
**Priority:** High
**Estimation:** 3-4 hours

---

## User Story

**As a** visitor,
**I want** visualization state persisted in URL,
**So that** I can share and bookmark specific views.

---

## Context

### Background

The project already uses nuqs for URL state management with the existing `useFilters` hook (`src/lib/hooks/use-filters.ts`) which handles category filtering via `?cat=market,agi`. This story extends that pattern to create a comprehensive `useVisualizationState` hook that manages all control panel state:

- **Metrics:** Which background trend lines are enabled
- **Categories:** Which obituary categories are visible (extends existing `useFilters`)
- **Date Range:** The visible time window (new)

The hook must integrate with the existing ControlPanel shell component (Story TSR-1-2) and enable the subsequent control components (Stories 3.2-3.4) to bind to URL state.

### Epic Dependencies

- **Epic TSR-1 (Layout Foundation):** Complete - ControlPanel shell exists
- **Story TSR-1-2 (ControlPanel Shell):** Provides the component that will consume this hook
- **Stories TSR-3-2, 3-3, 3-4:** Will depend on this hook for state management

### Technical Context

**Existing Implementation (`use-filters.ts`):**
```typescript
// Current category-only URL state
const [categories, setCategories] = useQueryState('cat', categoryParser)
// URL: ?cat=market,agi
```

**Target Implementation:**
```typescript
// Comprehensive visualization state
const {
  metrics, setMetrics,        // ?metrics=compute,mmlu
  categories, setCategories,  // ?cat=market,agi
  dateRange, setDateRange,    // ?from=2010&to=2025
  isPending,
} = useVisualizationState()
```

**URL Format Examples:**
- Default view: `/` (no params - uses defaults)
- Custom view: `/?metrics=compute,mmlu&from=2015&to=2025&cat=market,agi`
- Full state: `/?metrics=compute,mmlu,eci&from=1950&to=2025&cat=market,capability,agi,dismissive`

### Key Design Decisions

1. **Debouncing:** Date range updates are debounced (400ms) to prevent URL spam during slider drag
2. **Immediate updates:** Metrics and categories update immediately (toggle interactions)
3. **Default values:** Match tech spec - metrics: ['compute'], dateRange: [2010, 2025], categories: []
4. **Shallow routing:** All updates use shallow routing (no page reload)
5. **Type safety:** Full TypeScript support with MetricType and Category types

---

## Acceptance Criteria

### AC-1: Hook Interface

**Given** `useVisualizationState` hook is imported
**When** called in a client component
**Then** returns the following interface:

```typescript
interface VisualizationState {
  // Metrics state
  metrics: MetricType[];              // Currently enabled metrics
  setMetrics: (m: MetricType[]) => void;

  // Category state
  categories: Category[];             // Selected categories (empty = all)
  setCategories: (c: Category[]) => void;

  // Date range state
  dateRange: [number, number];        // [startYear, endYear]
  setDateRange: (r: [number, number]) => void;

  // Transition state for UI feedback
  isPending: boolean;
}
```

### AC-2: Default Values

**Given** no URL parameters are present
**When** hook initializes
**Then** returns these defaults:
- `metrics`: `['compute']` (Training Compute enabled)
- `categories`: `[]` (all categories shown)
- `dateRange`: `[2010, 2025]`

### AC-3: Metrics URL Format

**Given** metrics are set via `setMetrics`
**When** URL updates
**Then** format is `?metrics=compute,mmlu,eci`

**And** validation:
- Only valid MetricType values accepted: `'compute' | 'mmlu' | 'eci'`
- Invalid values in URL are filtered out
- Empty array removes `metrics` param from URL

### AC-4: Categories URL Format

**Given** categories are set via `setCategories`
**When** URL updates
**Then** format is `?cat=market,agi,capability,dismissive`

**And** validation:
- Only valid Category values accepted: `'market' | 'capability' | 'agi' | 'dismissive'`
- Invalid values in URL are filtered out
- Empty array removes `cat` param from URL (shows all)

### AC-5: Date Range URL Format

**Given** date range is set via `setDateRange`
**When** URL updates
**Then** format is `?from=2010&to=2025`

**And** validation:
- `from` and `to` are integers in range [1950, 2025]
- `from` must be less than `to`
- Invalid values are clamped to valid bounds
- Both params required together (partial is invalid)

### AC-6: Date Range Debouncing

**Given** date range slider is being dragged
**When** `setDateRange` is called repeatedly
**Then**:
- Visual state updates immediately (for live preview)
- URL updates are debounced (400ms after drag stops)
- Only final value commits to URL

### AC-7: Shallow URL Updates

**Given** any state change
**When** URL updates
**Then**:
- No page reload occurs
- History state is pushed (back/forward works)
- Component re-renders with new state

### AC-8: Browser History Support

**Given** state has been changed multiple times
**When** browser back/forward is used
**Then**:
- State reverts to previous URL params
- UI updates to reflect historical state
- No page reload

---

## Technical Implementation

### Files to Create

```
src/lib/hooks/use-visualization-state.ts      # Main hook
tests/unit/lib/hooks/use-visualization-state.test.ts  # Tests
```

### Implementation Guide

**src/lib/hooks/use-visualization-state.ts:**

```typescript
'use client'

/**
 * useVisualizationState Hook
 *
 * Manages comprehensive URL-synced state for visualization controls.
 * Enables shareable views - when a user configures the visualization
 * and shares the URL, recipients see the same view configuration.
 *
 * URL Format:
 * - ?metrics=compute,mmlu - enabled metric trend lines
 * - ?cat=market,agi - selected categories (empty = all)
 * - ?from=2010&to=2025 - date range bounds
 *
 * Example full URL:
 * /?metrics=compute,mmlu&from=2015&to=2025&cat=market,agi
 */

import {
  useQueryState,
  useQueryStates,
  parseAsArrayOf,
  parseAsStringLiteral,
  parseAsInteger,
} from 'nuqs'
import { useCallback, useMemo, useTransition, useRef, useEffect, useState } from 'react'
import type { Category } from '@/types/obituary'
import type { MetricType } from '@/types/metrics'
// Note: CATEGORY_ORDER not imported - using local const array for parseAsStringLiteral compatibility

// Valid metric types for URL parsing - derived from MetricType
const METRIC_TYPES = ['compute', 'mmlu', 'eci'] as const satisfies readonly MetricType[]

// Date range constraints
const MIN_YEAR = 1950
const MAX_YEAR = 2025
const DEFAULT_FROM = 2010
const DEFAULT_TO = 2025

// Debounce delay for date range slider (ms)
const DATE_RANGE_DEBOUNCE = 400

/**
 * Parser for metrics array URL parameter
 */
const metricsParser = parseAsArrayOf(
  parseAsStringLiteral(METRIC_TYPES)
).withDefault(['compute'] as MetricType[])

// Category values as const array for parseAsStringLiteral
const CATEGORY_VALUES = ['capability', 'market', 'agi', 'dismissive'] as const

/**
 * Parser for category array URL parameter
 */
const categoryParser = parseAsArrayOf(
  parseAsStringLiteral(CATEGORY_VALUES)
).withDefault([])

/**
 * Parser for date range parameters
 */
const dateRangeParser = {
  from: parseAsInteger.withDefault(DEFAULT_FROM),
  to: parseAsInteger.withDefault(DEFAULT_TO),
}

/**
 * Visualization state interface
 */
export interface VisualizationState {
  /** Currently enabled background metrics */
  metrics: MetricType[]
  /** Set enabled metrics */
  setMetrics: (metrics: MetricType[]) => void

  /** Currently selected categories (empty = all) */
  categories: Category[]
  /** Set selected categories */
  setCategories: (categories: Category[]) => void

  /** Current date range [startYear, endYear] */
  dateRange: [number, number]
  /** Set date range (debounced URL update) */
  setDateRange: (range: [number, number]) => void

  /** True during URL transition */
  isPending: boolean
}

/**
 * Hook for managing comprehensive URL-synced visualization state.
 *
 * Combines metrics, categories, and date range into a single hook
 * with appropriate URL persistence behavior for each:
 * - Metrics: immediate URL update
 * - Categories: immediate URL update
 * - Date range: debounced URL update (for smooth slider interaction)
 */
export function useVisualizationState(): VisualizationState {
  const [isPending, startTransition] = useTransition()

  // Metrics state
  const [metrics, setMetricsInternal] = useQueryState('metrics', metricsParser)

  // Category state
  const [categories, setCategoriesInternal] = useQueryState('cat', categoryParser)

  // Date range state with debouncing
  const [dateParams, setDateParams] = useQueryStates(dateRangeParser, {
    shallow: true,
    history: 'push',
  })

  // Local state for immediate date range updates (debounced to URL)
  const [localDateRange, setLocalDateRange] = useState<[number, number]>([
    dateParams.from,
    dateParams.to,
  ])

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sync local state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setLocalDateRange([dateParams.from, dateParams.to])
  }, [dateParams.from, dateParams.to])

  // Metrics setter
  const setMetrics = useCallback((newMetrics: MetricType[]) => {
    startTransition(() => {
      setMetricsInternal(newMetrics.length > 0 ? newMetrics : null)
    })
  }, [setMetricsInternal])

  // Categories setter
  const setCategories = useCallback((newCategories: Category[]) => {
    startTransition(() => {
      setCategoriesInternal(newCategories.length > 0 ? newCategories : null)
    })
  }, [setCategoriesInternal])

  // Date range setter with debouncing
  const setDateRange = useCallback((range: [number, number]) => {
    // Validate and clamp range
    const from = Math.max(MIN_YEAR, Math.min(MAX_YEAR - 1, range[0]))
    const to = Math.max(from + 1, Math.min(MAX_YEAR, range[1]))

    // Update local state immediately for responsive UI
    setLocalDateRange([from, to])

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce URL update
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        setDateParams({ from, to })
      })
    }, DATE_RANGE_DEBOUNCE)
  }, [setDateParams])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Memoized date range tuple
  const dateRange = useMemo<[number, number]>(() => {
    return [localDateRange[0], localDateRange[1]]
  }, [localDateRange])

  return {
    metrics: metrics as MetricType[],
    setMetrics,
    categories: categories as Category[],
    setCategories,
    dateRange,
    setDateRange,
    isPending,
  }
}
```

### Test Coverage Requirements

**tests/unit/lib/hooks/use-visualization-state.test.ts:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'

// Mock nuqs for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
)

describe('useVisualizationState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('default values', () => {
    it('returns default metrics when no URL param', () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })
      expect(result.current.metrics).toEqual(['compute'])
    })

    it('returns empty categories when no URL param', () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })
      expect(result.current.categories).toEqual([])
    })

    it('returns default date range when no URL params', () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })
      expect(result.current.dateRange).toEqual([2010, 2025])
    })
  })

  describe('setMetrics', () => {
    it('updates metrics state', async () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })

      act(() => {
        result.current.setMetrics(['compute', 'mmlu'])
      })

      await waitFor(() => {
        expect(result.current.metrics).toEqual(['compute', 'mmlu'])
      })
    })

    it('clears metrics param when empty array', async () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })

      act(() => {
        result.current.setMetrics([])
      })

      await waitFor(() => {
        expect(result.current.metrics).toEqual([])
      })
    })
  })

  describe('setCategories', () => {
    it('updates categories state', async () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })

      act(() => {
        result.current.setCategories(['market', 'agi'])
      })

      await waitFor(() => {
        expect(result.current.categories).toEqual(['market', 'agi'])
      })
    })
  })

  describe('setDateRange', () => {
    it('updates date range immediately for UI', () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })

      act(() => {
        result.current.setDateRange([2015, 2024])
      })

      // Immediate local update
      expect(result.current.dateRange).toEqual([2015, 2024])
    })

    it('clamps date range to valid bounds', () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })

      act(() => {
        result.current.setDateRange([1900, 2050])
      })

      expect(result.current.dateRange[0]).toBeGreaterThanOrEqual(1950)
      expect(result.current.dateRange[1]).toBeLessThanOrEqual(2025)
    })

    it('ensures from is less than to', () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })

      act(() => {
        result.current.setDateRange([2020, 2010])
      })

      expect(result.current.dateRange[0]).toBeLessThan(result.current.dateRange[1])
    })

    it('debounces URL updates', async () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })

      // Multiple rapid updates
      act(() => {
        result.current.setDateRange([2015, 2024])
        result.current.setDateRange([2016, 2023])
        result.current.setDateRange([2017, 2022])
      })

      // Only last value should persist after debounce
      act(() => {
        vi.advanceTimersByTime(400)
      })

      expect(result.current.dateRange).toEqual([2017, 2022])
    })
  })

  describe('isPending', () => {
    it('is false by default', () => {
      const { result } = renderHook(() => useVisualizationState(), { wrapper })
      expect(result.current.isPending).toBe(false)
    })
  })
})
```

---

## Tasks

### Task 1: Create Hook Module (AC: 1, 2, 3, 4, 5)
- [ ] Create `src/lib/hooks/use-visualization-state.ts`
- [ ] Implement metrics parser with `parseAsArrayOf` and `parseAsStringLiteral`
- [ ] Implement category parser (reuse pattern from `use-filters.ts`)
- [ ] Implement date range parsers with `parseAsInteger`
- [ ] Implement `useVisualizationState` hook
- [ ] Add JSDoc documentation
- [ ] Export from barrel file if exists

### Task 2: Implement Debouncing (AC: 6)
- [ ] Add local state for immediate date range updates
- [ ] Implement debounce timer with ref
- [ ] Sync local state when URL changes externally
- [ ] Clean up timer on unmount

### Task 3: Add Validation (AC: 3, 4, 5)
- [ ] Validate metrics against MetricType
- [ ] Validate categories against Category
- [ ] Validate and clamp date range to [1950, 2025]
- [ ] Ensure `from < to` constraint

### Task 4: Create Test Suite (AC: 1-8)
- [ ] Create `tests/unit/lib/hooks/use-visualization-state.test.ts`
- [ ] Test default values
- [ ] Test setMetrics state updates
- [ ] Test setCategories state updates
- [ ] Test setDateRange with immediate UI update
- [ ] Test date range validation and clamping
- [ ] Test debouncing behavior
- [ ] Test isPending state

### Task 5: Integration Verification
- [ ] Verify hook works in NuqsAdapter context (`src/app/layout.tsx`)
- [ ] Test URL param generation manually
- [ ] Verify browser back/forward works
- [ ] Run full test suite: `bun test:run`

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] All tasks completed
- [ ] Tests pass: `bun vitest tests/unit/lib/hooks/use-visualization-state.test.ts`
- [ ] No TypeScript errors: `bun run lint`
- [ ] Hook integrates with existing NuqsAdapter in layout
- [ ] URL params generate correctly: `?metrics=...&from=...&to=...&cat=...`
- [ ] Ready for Stories TSR-3-2, 3-3, 3-4 to use

---

## Dev Notes

### Relationship to Existing use-filters.ts

The existing `useFilters` hook handles only category state. Options:
1. **Keep both:** `useVisualizationState` is the new comprehensive hook; `useFilters` remains for backward compatibility
2. **Replace:** Deprecate `useFilters` and migrate all consumers to `useVisualizationState`
3. **Compose:** Have `useVisualizationState` use `useFilters` internally

**Recommended:** Option 1 - keep both initially, deprecate `useFilters` later once migration is complete.

### nuqs Configuration

The project already has nuqs configured in `src/app/layout.tsx` with `NuqsAdapter`. No additional setup needed.

### Testing with nuqs

Use `NuqsTestingAdapter` from `nuqs/adapters/testing` for unit tests. This provides isolated URL state per test.

### Performance Considerations

- Date range debouncing prevents URL spam during slider drag
- `useTransition` allows non-blocking URL updates
- Shallow routing avoids full page reloads

### References

- [Source: docs/sprint-artifacts/epics-timeline-redesign.md#Story 3.1]
- [Source: docs/sprint-artifacts/tech-spec-timeline-visualization-redesign.md#Implementation Plan]
- [Source: src/lib/hooks/use-filters.ts - existing nuqs pattern]
- [nuqs documentation: https://nuqs.47ng.com/]

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

### Completion Notes List

### File List
