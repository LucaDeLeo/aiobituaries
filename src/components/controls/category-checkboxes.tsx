'use client'

import type { Category } from '@/types/obituary'
import { CATEGORY_ORDER, CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

export interface CategoryCheckboxesProps {
  /** Currently selected categories (empty = show all) */
  selectedCategories: Category[]
  /** Callback when category selection changes */
  onCategoriesChange: (categories: Category[]) => void
  /** Optional className for container */
  className?: string
}

/**
 * CategoryCheckboxes - Checkbox list for filtering obituaries by category
 *
 * Allows users to select which categories of AI skepticism claims are visible.
 * Empty selection means "show all" - no filter applied.
 *
 * @example
 * ```tsx
 * const { categories, setCategories } = useVisualizationState()
 *
 * <CategoryCheckboxes
 *   selectedCategories={categories}
 *   onCategoriesChange={setCategories}
 * />
 * ```
 */
export function CategoryCheckboxes({
  selectedCategories,
  onCategoriesChange,
  className,
}: CategoryCheckboxesProps) {
  const handleToggle = (categoryId: Category) => {
    const isSelected = selectedCategories.includes(categoryId)

    if (isSelected) {
      // Remove category
      onCategoriesChange(selectedCategories.filter((c) => c !== categoryId))
    } else {
      // Add category
      onCategoriesChange([...selectedCategories, categoryId])
    }
  }

  const handleShowAll = () => {
    onCategoriesChange([])
  }

  const showingAll = selectedCategories.length === 0

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Show All / Clear Filters button */}
      <button
        type="button"
        onClick={handleShowAll}
        className={cn(
          'text-sm text-left px-3 py-2 rounded-md transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          showingAll
            ? 'text-foreground font-medium bg-muted/50'
            : 'text-[var(--accent-primary)] font-medium bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20'
        )}
      >
        {showingAll ? '✓ Showing all categories' : '✕ Clear filters'}
      </button>

      {/* Category checkboxes */}
      {CATEGORY_ORDER.map((categoryId) => {
        const category = CATEGORIES[categoryId]
        const isChecked = selectedCategories.includes(categoryId)
        const checkboxId = `category-${categoryId}`

        return (
          <label
            key={categoryId}
            htmlFor={checkboxId}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Custom checkbox with native input for accessibility */}
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id={checkboxId}
                checked={isChecked}
                onChange={() => handleToggle(categoryId)}
                className="peer sr-only"
              />
              {/* Visual checkbox */}
              <div
                className={cn(
                  'h-4 w-4 rounded border-2 transition-colors',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  isChecked
                    ? 'border-transparent'
                    : 'border-muted-foreground/50 group-hover:border-muted-foreground'
                )}
                style={{
                  backgroundColor: isChecked ? category.color : 'transparent',
                }}
              >
                {/* Checkmark */}
                {isChecked && (
                  <svg
                    className="h-full w-full text-white"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 8l3 3 5-6" />
                  </svg>
                )}
              </div>
            </div>

            {/* Label only - color shown via checkbox background (matches MetricsToggle pattern) */}
            <span className="text-sm">{category.label}</span>
          </label>
        )
      })}
    </div>
  )
}
