'use client'

/**
 * MobileTimeline Component
 *
 * Container for mobile hybrid view combining DensityBar and MobileCardList.
 * Manages date filter state locally, category filters come from URL state.
 * Opens ObituaryModal as a bottom sheet when a card is tapped.
 *
 * Story 5-5: Mobile Hybrid View
 */

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { DateRange } from './density-bar'

// Dynamic import with ssr: false prevents hydration mismatch
// DensityBar uses adaptive granularity that must be consistent client-side
const DensityBar = dynamic(() => import('./density-bar').then((mod) => mod.DensityBar), {
  ssr: false,
  loading: () => <div className="h-[88px] bg-[--bg-secondary] border-b border-[--border]" />,
})
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
        !ob.categories.some((c) => activeCategories.includes(c as Category))
      ) {
        return false
      }

      // Date filter from density bar tap
      if (dateFilter) {
        const obDate = new Date(ob.date)
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

      {/* Sticky Category Filter at bottom */}
      <div className="sticky bottom-0 z-10 bg-[--bg-primary] border-t border-[--border] p-2">
        <CategoryFilter
          activeCategories={activeCategories}
          onToggle={toggleCategory}
          onShowAll={clearFilters}
          totalCount={obituaries.length}
          filteredCount={filteredObituaries.length}
        />
      </div>

      {/* Bottom Sheet Modal */}
      <ObituaryModal
        selectedSummary={selectedObituary}
        isOpen={!!selectedObituary}
        onClose={() => setSelectedObituary(null)}
        side="bottom"
      />
    </div>
  )
}
