'use client'

/**
 * HomeClient Component
 *
 * Client wrapper for the homepage that enables URL-synced filter state.
 * This component uses the useFilters hook to manage category filters
 * and passes the state to the CategoryFilter component.
 *
 * The homepage server component fetches data and passes it here;
 * this client component handles interactivity and filter state.
 */

import { CategoryFilter } from '@/components/filters/category-filter'
import { ScatterPlot } from '@/components/visualization/scatter-plot'
import { CategoryChart } from '@/components/visualization/category-chart'
import type { ObituarySummary } from '@/types/obituary'
import { useFilters } from '@/lib/hooks/use-filters'

export interface HomeClientProps {
  /** Obituary data from server-side fetch */
  obituaries: ObituarySummary[]
}

/**
 * Client-side portion of the homepage.
 * Manages filter state and passes it to visualization components.
 */
export function HomeClient({ obituaries }: HomeClientProps) {
  const { categories, toggleCategory, clearFilters } = useFilters()

  return (
    <>
      {/* Timeline Visualization */}
      <section className="container mx-auto px-4 py-8">
        <ScatterPlot data={obituaries} activeCategories={categories} />
      </section>

      {/* Category Breakdown Chart */}
      <section className="max-w-md mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold mb-4 text-[--text-primary]">
          Category Breakdown
        </h2>
        <CategoryChart
          obituaries={obituaries}
          activeCategories={categories}
          onCategoryClick={toggleCategory}
        />
      </section>

      {/* Category Filter Bar */}
      <CategoryFilter
        activeCategories={categories}
        onToggle={toggleCategory}
        onShowAll={clearFilters}
      />
    </>
  )
}
