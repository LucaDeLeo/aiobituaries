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
import {
  useCallback,
  useMemo,
  useTransition,
  useRef,
  useEffect,
  useState,
} from 'react'
import type { Category } from '@/types/obituary'
import type { MetricType } from '@/types/metrics'
import { CATEGORY_ORDER } from '@/lib/constants/categories'
import { getMaxDataYear } from '@/data/ai-metrics'

// Valid metric types for URL parsing - derived from MetricType
const METRIC_TYPES = ['compute', 'mmlu', 'eci'] as const satisfies readonly MetricType[]

// Date range constraints - MAX_YEAR derived from actual data
const MIN_YEAR = 1950
const MAX_YEAR = getMaxDataYear()
const DEFAULT_FROM = 2010
const DEFAULT_TO = MAX_YEAR

// Debounce delay for date range slider (ms)
const DATE_RANGE_DEBOUNCE = 400

/**
 * Parser for metrics array URL parameter
 */
const metricsParser = parseAsArrayOf(
  parseAsStringLiteral(METRIC_TYPES)
).withDefault(['compute'] as MetricType[])

/**
 * Parser for category array URL parameter
 */
const categoryParser = parseAsArrayOf(
  parseAsStringLiteral(CATEGORY_ORDER)
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
 *
 * @example
 * ```tsx
 * const {
 *   metrics, setMetrics,
 *   categories, setCategories,
 *   dateRange, setDateRange,
 *   isPending,
 * } = useVisualizationState()
 * ```
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

  // Local override for date range during debounce window
  // null means use URL params, [from, to] means use local override
  const [localOverride, setLocalOverride] = useState<[number, number] | null>(null)

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Metrics setter
  const setMetrics = useCallback(
    (newMetrics: MetricType[]) => {
      startTransition(() => {
        setMetricsInternal(newMetrics.length > 0 ? newMetrics : null)
      })
    },
    [setMetricsInternal]
  )

  // Categories setter
  const setCategories = useCallback(
    (newCategories: Category[]) => {
      startTransition(() => {
        setCategoriesInternal(newCategories.length > 0 ? newCategories : null)
      })
    },
    [setCategoriesInternal]
  )

  // Date range setter with debouncing
  const setDateRange = useCallback(
    (range: [number, number]) => {
      // Validate and clamp range
      const from = Math.max(MIN_YEAR, Math.min(MAX_YEAR - 1, range[0]))
      const to = Math.max(from + 1, Math.min(MAX_YEAR, range[1]))

      // Update local override immediately for responsive UI
      setLocalOverride([from, to])

      // Clear existing debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Debounce URL update
      debounceRef.current = setTimeout(() => {
        startTransition(() => {
          setDateParams({ from, to })
        })
        // Clear local override after URL update
        setLocalOverride(null)
      }, DATE_RANGE_DEBOUNCE)
    },
    [setDateParams]
  )

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Memoized date range tuple - use local override if present, otherwise URL params
  const dateRange = useMemo<[number, number]>(() => {
    if (localOverride) {
      return localOverride
    }
    return [dateParams.from, dateParams.to]
  }, [localOverride, dateParams.from, dateParams.to])

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
