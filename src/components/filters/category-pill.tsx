'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CategoryDefinition } from '@/lib/constants/categories'

/**
 * Props for the CategoryPill component.
 */
export interface CategoryPillProps {
  /** Category definition with id, label, color */
  category: CategoryDefinition
  /** Whether this category is currently active */
  isActive: boolean
  /** Click handler to toggle category */
  onClick: () => void
}

/**
 * Individual category toggle pill for the filter bar.
 *
 * Displays a colored dot and label for a category with
 * active/inactive states and hover/tap animations.
 *
 * @example
 * ```tsx
 * <CategoryPill
 *   category={getCategory('capability')}
 *   isActive={activeCategories.includes('capability')}
 *   onClick={() => onToggle('capability')}
 * />
 * ```
 */
export function CategoryPill({
  category,
  isActive,
  onClick,
}: CategoryPillProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.button
      data-testid={`category-pill-${category.id}`}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Filter by ${category.label}`}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'text-sm font-medium transition-colors whitespace-nowrap',
        'min-h-[44px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]',
        isActive
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
      )}
      style={{
        backgroundColor: isActive ? `${category.color}20` : 'transparent',
      }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          backgroundColor: category.color,
          opacity: isActive ? 1 : 0.5,
        }}
        aria-hidden="true"
      />
      <span>{category.label}</span>
    </motion.button>
  )
}
