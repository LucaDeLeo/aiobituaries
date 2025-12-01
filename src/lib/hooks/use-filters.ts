'use client'

/**
 * useFilters Hook
 *
 * Manages URL-synced filter state using nuqs.
 * Enables shareable filtered views - when a user filters to specific
 * categories and shares the URL, recipients see the same filtered state.
 *
 * URL Format:
 * - Single category: ?cat=market
 * - Multiple categories: ?cat=market,agi
 * - No filter (show all): no cat param
 * - Invalid values are silently ignored
 */

import { useQueryState, parseAsArrayOf, parseAsStringLiteral } from 'nuqs'
import { useCallback, useMemo } from 'react'
import type { Category } from '@/types/obituary'
import { CATEGORY_ORDER } from '@/lib/constants/categories'

/**
 * Parser for category array URL parameter.
 * Uses parseAsStringLiteral to validate against CATEGORY_ORDER,
 * automatically rejecting invalid category values.
 */
const categoryParser = parseAsArrayOf(
  parseAsStringLiteral(CATEGORY_ORDER)
).withDefault([])

/**
 * Filter state interface returned by useFilters hook.
 */
export interface FilterState {
  /** Currently active category filters (empty = show all) */
  categories: Category[]
  /** Set categories directly */
  setCategories: (categories: Category[]) => void
  /** Toggle a category on/off */
  toggleCategory: (category: Category) => void
  /** Clear all filters (show all) */
  clearFilters: () => void
  /** True if any category filter is active */
  hasActiveFilters: boolean
  /** Check if a category is active (true if no filters OR category is in array) */
  isCategoryActive: (category: Category) => boolean
}

/**
 * Hook for managing URL-synced filter state.
 *
 * Uses nuqs to persist filter state in URL query params,
 * enabling shareable and bookmarkable filtered views.
 *
 * @example
 * ```tsx
 * const { categories, toggleCategory, clearFilters } = useFilters()
 *
 * <CategoryFilter
 *   activeCategories={categories}
 *   onToggle={toggleCategory}
 *   onShowAll={clearFilters}
 * />
 * ```
 */
export function useFilters(): FilterState {
  const [categories, setCategories] = useQueryState('cat', categoryParser)

  const toggleCategory = useCallback((category: Category) => {
    setCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      }
      return [...prev, category]
    })
  }, [setCategories])

  const clearFilters = useCallback(() => {
    setCategories([])
  }, [setCategories])

  const hasActiveFilters = useMemo(() => {
    return categories.length > 0
  }, [categories])

  const isCategoryActive = useCallback((category: Category) => {
    return categories.length === 0 || categories.includes(category)
  }, [categories])

  return {
    categories,
    setCategories,
    toggleCategory,
    clearFilters,
    hasActiveFilters,
    isCategoryActive,
  }
}
