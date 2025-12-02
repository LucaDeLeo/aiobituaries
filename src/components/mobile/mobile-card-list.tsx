'use client'

/**
 * MobileCardList Component
 *
 * Vertical scrollable list of obituary cards for mobile view.
 * Each card is tappable to open the modal.
 *
 * Story 5-5: Mobile Hybrid View
 */

import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants/categories'
import type { ObituarySummary, Category } from '@/types/obituary'

export interface MobileCardListProps {
  /** Filtered obituaries to display */
  obituaries: ObituarySummary[]
  /** Callback when a card is tapped */
  onSelect: (obituary: ObituarySummary) => void
  /** Callback to clear all filters */
  onClearFilters: () => void
}

/**
 * Truncates claim text for mobile card display.
 */
function truncateClaim(claim: string, maxLength = 100): string {
  if (claim.length <= maxLength) return claim
  const truncated = claim.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

export function MobileCardList({
  obituaries,
  onSelect,
  onClearFilters,
}: MobileCardListProps) {
  if (obituaries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <p className="text-[--text-muted]">
          No obituaries match your filters.
          <br />
          <button
            type="button"
            onClick={onClearFilters}
            className="text-[--accent-primary] underline mt-2"
          >
            Clear filters
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {obituaries.map((obituary) => {
        const primaryCategory = obituary.categories?.[0]
        const categoryColorClass = primaryCategory
          ? CATEGORY_COLORS[primaryCategory]
          : 'bg-[--text-muted]'

        return (
          <button
            key={obituary._id}
            type="button"
            onClick={() => onSelect(obituary)}
            className={cn(
              'w-full text-left p-4 rounded-lg relative group',
              'bg-[--bg-card] border border-[--border]',
              'shadow-md shadow-black/10',
              'active:scale-[0.98] active:shadow-sm transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[--ring] focus-visible:ring-offset-2',
              'focus-visible:ring-offset-[--bg-primary]'
            )}
          >
            {/* Date and category indicator */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn('w-2 h-2 rounded-full shrink-0', categoryColorClass)}
                aria-hidden="true"
              />
              <span className="text-xs text-[--text-muted]">
                {format(new Date(obituary.date), 'MMM d, yyyy')}
              </span>
              {primaryCategory && (
                <span className="text-xs text-[--text-muted] opacity-60">
                  {CATEGORY_LABELS[primaryCategory]}
                </span>
              )}
            </div>

            {/* Claim preview */}
            <p className="font-serif italic text-sm text-[--text-primary] mb-2 leading-relaxed">
              &ldquo;{truncateClaim(obituary.claim)}&rdquo;
            </p>

            {/* Source */}
            <p className="text-xs text-[--text-secondary]">{obituary.source}</p>
          </button>
        )
      })}
    </div>
  )
}
