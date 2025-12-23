'use client'

/**
 * CategoryChart Component
 *
 * Displays a horizontal bar chart showing the distribution of obituaries
 * by category. Supports click-to-filter and respects active filter state.
 *
 * Features:
 * - Counts obituaries per category (handles multi-category items)
 * - Bars sorted by count descending (highest first)
 * - Click toggles filter via onCategoryClick prop
 * - Non-active categories dimmed to 40% opacity
 * - Hover changes label text color
 * - Bars animate on mount (grow from 0 width)
 */

import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CATEGORY_ORDER, getCategory } from '@/lib/constants/categories'
import type { Category } from '@/types/obituary'

export interface CategoryChartProps {
  /** Array of objects containing category arrays */
  obituaries: { categories: Category[] }[]
  /** Currently active filter categories (empty = show all) */
  activeCategories?: Category[]
  /** Handler called when a category bar is clicked */
  onCategoryClick?: (category: Category) => void
}

/**
 * Horizontal bar chart displaying obituary category distribution.
 */
export function CategoryChart({
  obituaries,
  activeCategories = [],
  onCategoryClick,
}: CategoryChartProps) {
  // P2.1 fix: Check reduced motion preference
  const shouldReduceMotion = useReducedMotion()

  // Count obituaries per category (handles multi-category items)
  const counts = useMemo(() => {
    const result: Record<Category, number> = {
      capability: 0,
      market: 0,
      agi: 0,
      dismissive: 0,
    }

    obituaries.forEach((ob) => {
      ob.categories?.forEach((cat) => {
        if (cat in result) {
          result[cat]++
        }
      })
    })

    return result
  }, [obituaries])

  const total = obituaries.length
  const maxCount = Math.max(...Object.values(counts))

  // Sort by count descending (highest first)
  const sortedCategories = useMemo(() => {
    return [...CATEGORY_ORDER].sort((a, b) => counts[b] - counts[a])
  }, [counts])

  return (
    <div data-testid="category-chart" className="space-y-3">
      {sortedCategories.map((categoryId, index) => {
        const category = getCategory(categoryId)
        const count = counts[categoryId]
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
        const isActive =
          activeCategories.length === 0 || activeCategories.includes(categoryId)

        return (
          <motion.button
            key={categoryId}
            data-testid={`category-bar-${categoryId}`}
            className={cn(
              'w-full text-left group cursor-pointer',
              'transition-opacity',
              isActive ? 'opacity-100' : 'opacity-40'
            )}
            onClick={() => onCategoryClick?.(categoryId)}
            initial={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
            animate={shouldReduceMotion ? { opacity: isActive ? 1 : 0.4 } : { opacity: isActive ? 1 : 0.4, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.1 }}
          >
            <div className="flex justify-between mb-1">
              <span className="text-sm text-[--text-secondary] group-hover:text-[--text-primary] transition-colors">
                {category.label}
              </span>
              <span className="text-sm text-[--text-muted]">
                {count} ({percentage}%)
              </span>
            </div>
            <div className="h-2 bg-[--bg-tertiary] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: category.color }}
                initial={shouldReduceMotion ? { width: `${barWidth}%` } : { width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
