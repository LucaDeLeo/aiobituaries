'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CATEGORY_ORDER, getCategory, getCategoryLabel } from '@/lib/constants/categories'
import { CategoryPill } from './category-pill'
import { cn } from '@/lib/utils'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'
import { useLiveRegionOptional } from '@/components/accessibility/live-region'
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
  /** Total count of items (for announcements) */
  totalCount?: number
  /** Filtered count of items (for announcements) */
  filteredCount?: number
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
  totalCount,
  filteredCount,
}: CategoryFilterProps) {
  const showingAll = activeCategories.length === 0
  const breakpoint = useBreakpoint()
  const liveRegion = useLiveRegionOptional()
  const isInitialMount = useRef(true)
  const shouldReduceMotion = useReducedMotion()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Check scroll position and update indicators
  const updateScrollIndicators = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 2)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2)
  }, [])

  // Check scroll indicators on mount and resize
  useEffect(() => {
    updateScrollIndicators()
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', updateScrollIndicators, { passive: true })
    window.addEventListener('resize', updateScrollIndicators)
    return () => {
      container.removeEventListener('scroll', updateScrollIndicators)
      window.removeEventListener('resize', updateScrollIndicators)
    }
  }, [updateScrollIndicators])

  // Announce filter changes to screen readers
  useEffect(() => {
    // Skip announcement on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Only announce if we have counts and live region available
    if (!liveRegion || filteredCount === undefined) return

    let message: string
    if (showingAll) {
      message = `Showing all ${totalCount ?? filteredCount} obituaries`
    } else if (activeCategories.length === 1) {
      const categoryLabel = getCategoryLabel(activeCategories[0])
      message = `Showing ${filteredCount} obituaries in ${categoryLabel} category`
    } else {
      const categoryLabels = activeCategories
        .map((cat) => getCategoryLabel(cat))
        .join(' and ')
      message = `Showing ${filteredCount} obituaries in ${categoryLabels} categories`
    }

    liveRegion.announcePolite(message)
  }, [activeCategories, showingAll, filteredCount, totalCount, liveRegion])

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
        'relative',
        'max-w-[calc(100vw-2rem)]',
        className
      )}
      initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
      animate={shouldReduceMotion ? false : { y: 0, opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3, duration: 0.3 }}
      role="group"
      aria-label="Category filters"
    >
      {/* Left scroll indicator */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-8 z-10',
          'bg-gradient-to-r from-[var(--bg-secondary)] to-transparent',
          'rounded-l-full pointer-events-none',
          'transition-opacity duration-200',
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />

      {/* Scrollable content with snap scrolling */}
      <div
        ref={scrollContainerRef}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2',
          'bg-[var(--bg-secondary)]/90 backdrop-blur-md',
          'border border-[var(--border)] rounded-full',
          'shadow-lg',
          'overflow-x-auto scrollbar-hide',
          'snap-x snap-mandatory scroll-px-3'
        )}
      >
        <button
          data-testid="filter-all-button"
          onClick={onShowAll}
          aria-pressed={showingAll}
          className={cn(
            pillPadding,
            'snap-start rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            'min-h-[44px] flex items-center justify-center',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]',
            showingAll
              ? 'bg-[var(--accent-primary)]/20 text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
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
      </div>

      {/* Right scroll indicator */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-8 z-10',
          'bg-gradient-to-l from-[var(--bg-secondary)] to-transparent',
          'rounded-r-full pointer-events-none',
          'transition-opacity duration-200',
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />
    </motion.div>
  )
}
