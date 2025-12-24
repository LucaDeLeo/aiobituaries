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
 * - ?q=search+term - search query filter
 * - ?skeptic=slug - filter by skeptic's claims
 *
 * Example full URL:
 * /?metrics=compute,mmlu&cat=market,agi&q=climate&skeptic=gary-marcus
 */

import {
  useQueryState,
  parseAsArrayOf,
  parseAsStringLiteral,
  parseAsString,
} from 'nuqs'
import {
  useCallback,
  useTransition,
} from 'react'
import type { Category } from '@/types/obituary'
import type { MetricType } from '@/types/metrics'
import { CATEGORY_ORDER } from '@/lib/constants/categories'

// Valid metric types for URL parsing - derived from MetricType
const METRIC_TYPES = ['compute', 'arcagi', 'eci'] as const satisfies readonly MetricType[]

/**
 * Parser for metrics array URL parameter.
 * Default ['compute'] for first-time visitors.
 * Empty array is valid and will persist in URL (shows no background metrics).
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
  /** Currently enabled background metrics */
  metrics: MetricType[]
  /** Set enabled metrics */
  setMetrics: (metrics: MetricType[]) => void

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
 * Combines metrics and categories into a single hook
 * with immediate URL persistence behavior.
 *
 * @example
 * ```tsx
 * const {
 *   metrics, setMetrics,
 *   categories, setCategories,
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

  // Search query state
  const [searchQuery, setSearchQueryInternal] = useQueryState('q', searchParser)

  // Skeptic filter state
  const [selectedSkeptic, setSelectedSkepticInternal] = useQueryState('skeptic', skepticParser)

  // Metrics setter - empty array is valid (no background metrics shown)
  const setMetrics = useCallback(
    (newMetrics: MetricType[]) => {
      startTransition(() => {
        // Keep empty arrays as-is (don't reset to null/default)
        setMetricsInternal(newMetrics)
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
    metrics: metrics as MetricType[],
    setMetrics,
    categories: categories as Category[],
    setCategories,
    searchQuery: searchQuery ?? '',
    setSearchQuery,
    selectedSkeptic,
    setSelectedSkeptic,
    isPending,
  }
}
