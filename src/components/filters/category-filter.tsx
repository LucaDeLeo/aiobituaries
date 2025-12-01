'use client'

import { motion } from 'motion/react'
import { CATEGORY_ORDER, getCategory } from '@/lib/constants/categories'
import { CategoryPill } from './category-pill'
import { cn } from '@/lib/utils'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'
import type { Category } from '@/types/obituary'

/**
 * Props for the CategoryFilter component.
 */
export interface CategoryFilterProps {
  /** Active categories from filter state */
  activeCategories: Category[]
  /** Callback to toggle category */
  onToggle: (category: Category) => void
  /** Callback to show all (clear filters) */
  onShowAll: () => void
  /** Optional className for container */
  className?: string
}

/**
 * Floating filter bar for filtering obituaries by category.
 *
 * Positioned at the bottom center of the viewport with backdrop blur.
 * Contains an "All" button and pills for each category.
 * Supports multi-select - multiple categories can be active simultaneously.
 *
 * @example
 * ```tsx
 * const [activeCategories, setActiveCategories] = useState<Category[]>([])
 *
 * <CategoryFilter
 *   activeCategories={activeCategories}
 *   onToggle={(cat) => {
 *     setActiveCategories(prev =>
 *       prev.includes(cat)
 *         ? prev.filter(c => c !== cat)
 *         : [...prev, cat]
 *     )
 *   }}
 *   onShowAll={() => setActiveCategories([])}
 * />
 * ```
 */
export function CategoryFilter({
  activeCategories,
  onToggle,
  onShowAll,
  className,
}: CategoryFilterProps) {
  const showingAll = activeCategories.length === 0
  const breakpoint = useBreakpoint()

  // Position class based on breakpoint
  const positionClass =
    breakpoint === 'desktop'
      ? 'fixed bottom-6 left-1/2 -translate-x-1/2'
      : 'sticky bottom-0'

  // Touch target size based on breakpoint
  const pillPadding = breakpoint === 'tablet' ? 'px-4 py-3' : 'px-3 py-1.5'

  return (
    <motion.div
      data-testid="category-filter"
      className={cn(
        positionClass,
        'z-50',
        'flex items-center gap-2 px-4 py-2',
        'bg-[--bg-secondary]/80 backdrop-blur-md',
        'border border-[--border] rounded-full',
        'shadow-lg',
        'overflow-x-auto scrollbar-hide',
        'max-w-[calc(100vw-2rem)]',
        className
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      role="group"
      aria-label="Category filters"
    >
      <button
        data-testid="filter-all-button"
        onClick={onShowAll}
        aria-pressed={showingAll}
        className={cn(
          pillPadding,
          'rounded-full text-sm font-medium transition-colors',
          'min-h-[44px] flex items-center justify-center',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent-primary] focus-visible:ring-offset-2 focus-visible:ring-offset-[--bg-secondary]',
          showingAll
            ? 'bg-[--accent-primary]/20 text-[--text-primary]'
            : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-tertiary]'
        )}
      >
        All
      </button>

      {CATEGORY_ORDER.map((categoryId) => (
        <CategoryPill
          key={categoryId}
          category={getCategory(categoryId)}
          isActive={activeCategories.includes(categoryId)}
          onClick={() => onToggle(categoryId)}
        />
      ))}
    </motion.div>
  )
}
