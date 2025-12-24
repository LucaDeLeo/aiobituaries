'use client'

/**
 * MobileTimeline Component
 *
 * Container for mobile hybrid view combining DensityBar (Tombstone Timeline) and MobileCardList.
 * Manages date filter state locally, category filters come from URL state.
 * Opens ObituaryModal as a bottom sheet when a card is tapped.
 *
 * Story 5-5: Mobile Hybrid View
 * Updated: Tombstone timeline redesign
 */

import { useState, useMemo } from 'react'
import { parseUTCDate } from '@/lib/utils/date'
import { DensityBar, type DateRange } from './density-bar'
import { MobileCardList } from './mobile-card-list'
import { ObituaryModal } from '@/components/obituary/obituary-modal'
import { CategoryFilter } from '@/components/filters/category-filter'
import { useFilters } from '@/lib/hooks/use-filters'
import type { ObituarySummary, Category } from '@/types/obituary'

export interface MobileTimelineProps {
  /** All obituaries from server */
  obituaries: ObituarySummary[]
}

export function MobileTimeline({ obituaries }: MobileTimelineProps) {
  // Get category filters from URL state
  const { categories: activeCategories, toggleCategory, clearFilters } = useFilters()

  // Local state for selected obituary (modal) and date filter
  const [selectedObituary, setSelectedObituary] = useState<ObituarySummary | null>(null)
  const [dateFilter, setDateFilter] = useState<DateRange | null>(null)

  // Filter obituaries by category and date
  const filteredObituaries = useMemo(() => {
    return obituaries.filter((ob) => {
      // Category filter (AND with categories from URL)
      if (
        activeCategories.length > 0 &&
        !ob.categories?.some((c) => activeCategories.includes(c as Category))
      ) {
        return false
      }

      // Date filter from density bar tap (P1.2 fix: use UTC date parsing)
      if (dateFilter) {
        const obDate = parseUTCDate(ob.date)
        if (obDate < dateFilter.start || obDate > dateFilter.end) {
          return false
        }
      }

      return true
    })
  }, [obituaries, activeCategories, dateFilter])

  // Clear all filters (both category and date)
  const handleClearAllFilters = () => {
    clearFilters()
    setDateFilter(null)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Density Bar at top */}
      <DensityBar
        obituaries={obituaries}
        activeCategories={activeCategories as Category[]}
        onPeriodSelect={setDateFilter}
        activePeriod={dateFilter}
      />

      {/* Card List - fills remaining space */}
      <MobileCardList
        obituaries={filteredObituaries}
        onSelect={setSelectedObituary}
        onClearFilters={handleClearAllFilters}
      />

      {/* Category Filter - handles its own positioning */}
      <div className="bg-[var(--bg-primary)] border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
        <CategoryFilter
          activeCategories={activeCategories}
          onToggle={toggleCategory}
          onShowAll={clearFilters}
          totalCount={obituaries.length}
          filteredCount={filteredObituaries.length}
          className="!sticky !bottom-0"
        />
      </div>

      {/* Modal */}
      <ObituaryModal
        selectedSummary={selectedObituary}
        isOpen={!!selectedObituary}
        onClose={() => setSelectedObituary(null)}
      />
    </div>
  )
}
