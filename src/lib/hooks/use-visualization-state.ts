'use client'

/**
 * useVisualizationState Hook
 *
 * Manages comprehensive URL-synced state for visualization controls.
 * Enables shareable views - when a user configures the visualization
 * and shares the URL, recipients see the same view configuration.
 *
 * URL Format:
 * - ?metric=metr - single selected metric trend line
 * - ?cat=market,agi - selected categories (empty = all)
 * - ?q=search+term - search query filter
 * - ?skeptic=slug - filter by skeptic's claims
 *
 * Example full URL:
 * /?metric=metr&cat=market,agi&q=climate&skeptic=gary-marcus
 */

import {
  useQueryState,
  parseAsArrayOf,
  parseAsStringLiteral,
  parseAsString,
  createParser,
} from 'nuqs'
import {
  useCallback,
  useTransition,
} from 'react'
import type { Category } from '@/types/obituary'
import type { MetricType } from '@/types/metrics'
import { CATEGORY_ORDER } from '@/lib/constants/categories'

// Valid metric types for URL parsing - derived from MetricType
const METRIC_TYPES = ['compute', 'mmlu', 'arcagi', 'eci', 'metr'] as const satisfies readonly MetricType[]

/**
 * Parser for single metric URL parameter.
 * Default 'metr' - the primary Y-axis metric.
 * Handles legacy ?metrics=a,b format by taking first value.
 */
const metricParser = createParser({
  parse: (value: string) => {
    // Handle legacy comma-separated format (e.g., "compute,arcagi" → "compute")
    const firstValue = value.split(',')[0] as MetricType
    return METRIC_TYPES.includes(firstValue) ? firstValue : null
  },
  serialize: (value: MetricType) => value,
}).withDefault('metr' as MetricType)

/**
 * Parser for category array URL parameter
 */
const categoryParser = parseAsArrayOf(
  parseAsStringLiteral(CATEGORY_ORDER)
).withDefault([])

/**
 * Parser for search query URL parameter.
 * Empty string is treated as null (no search).
 */
const searchParser = parseAsString.withDefault('')

/**
 * Parser for skeptic filter URL parameter.
 * Null means no skeptic filter applied.
 */
const skepticParser = parseAsString

/**
 * Visualization state interface
 */
export interface VisualizationState {
  /** Currently selected background metric */
  metric: MetricType
  /** Set selected metric */
  setMetric: (metric: MetricType) => void

  /** Currently selected categories (empty = all) */
  categories: Category[]
  /** Set selected categories */
  setCategories: (categories: Category[]) => void

  /** Current search query (empty = no search filter) */
  searchQuery: string
  /** Set search query */
  setSearchQuery: (query: string) => void

  /** Currently selected skeptic slug (null = no filter) */
  selectedSkeptic: string | null
  /** Set selected skeptic */
  setSelectedSkeptic: (slug: string | null) => void

  /** True during URL transition */
  isPending: boolean
}

/**
 * Hook for managing comprehensive URL-synced visualization state.
 *
 * Combines metric and categories into a single hook
 * with immediate URL persistence behavior.
 *
 * @example
 * ```tsx
 * const {
 *   metric, setMetric,
 *   categories, setCategories,
 *   isPending,
 * } = useVisualizationState()
 * ```
 */
export function useVisualizationState(): VisualizationState {
  const [isPending, startTransition] = useTransition()

  // Single metric state (URL param: ?metric=metr)
  // Also handles legacy ?metrics=a,b format via parser
  const [metric, setMetricInternal] = useQueryState('metric', metricParser)

  // Category state
  const [categories, setCategoriesInternal] = useQueryState('cat', categoryParser)

  // Search query state
  const [searchQuery, setSearchQueryInternal] = useQueryState('q', searchParser)

  // Skeptic filter state
  const [selectedSkeptic, setSelectedSkepticInternal] = useQueryState('skeptic', skepticParser)

  // Metric setter - one metric always required
  const setMetric = useCallback(
    (newMetric: MetricType) => {
      startTransition(() => {
        setMetricInternal(newMetric)
      })
    },
    [setMetricInternal]
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

  // Search query setter - empty string clears URL param
  const setSearchQuery = useCallback(
    (query: string) => {
      startTransition(() => {
        setSearchQueryInternal(query.trim() || null)
      })
    },
    [setSearchQueryInternal]
  )

  // Skeptic setter - null clears the filter
  const setSelectedSkeptic = useCallback(
    (slug: string | null) => {
      startTransition(() => {
        setSelectedSkepticInternal(slug)
      })
    },
    [setSelectedSkepticInternal]
  )

  return {
    metric: metric as MetricType,
    setMetric,
    categories: categories as Category[],
    setCategories,
    searchQuery: searchQuery ?? '',
    setSearchQuery,
    selectedSkeptic,
    setSelectedSkeptic,
    isPending,
  }
}
