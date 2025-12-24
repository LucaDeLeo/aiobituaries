'use client'

/**
 * HomePageClient Component
 *
 * Client wrapper for desktop homepage that coordinates state between
 * ControlPanel and visualization. This serves as the single source of truth
 * for URL state, calling useVisualizationState once and passing state down
 * via props to child components.
 *
 * State flow:
 * URL (?metrics=compute,mmlu&cat=market)
 *     |
 *     v
 * useVisualizationState()
 *     |
 *     +---> ControlPanelWrapper ---> ControlPanel
 *     |                                   |
 *     v                                   v
 * HomeClient               [MetricsToggle, CategoryCheckboxes]
 *     |
 *     v
 * ScatterPlot (filters + renders)
 */

import { useMemo } from 'react'
import { HomeClient } from './home-client'
import { ControlPanelWrapper } from '@/components/controls'
import { useVisualizationState } from '@/lib/hooks/use-visualization-state'
import type { ObituarySummary } from '@/types/obituary'

interface HomePageClientProps {
  /** Obituaries data from server-side fetch */
  obituaries: ObituarySummary[]
}

/**
 * Client wrapper for desktop homepage that coordinates state between
 * ControlPanel and visualization. Single source of truth for URL state.
 */
/**
 * Helper function to check if an obituary matches a search query.
 * Searches in claim text and source name (case-insensitive).
 */
function matchesSearch(obit: ObituarySummary, query: string): boolean {
  if (!query) return true
  const lowerQuery = query.toLowerCase()
  return (
    obit.claim.toLowerCase().includes(lowerQuery) ||
    obit.source.toLowerCase().includes(lowerQuery) ||
    obit.categories?.some(cat => cat.toLowerCase().includes(lowerQuery)) ||
    false
  )
}

export function HomePageClient({ obituaries }: HomePageClientProps) {
  const {
    metric,
    categories,
    searchQuery,
    selectedSkeptic,
  } = useVisualizationState()

  // Calculate visible count based on category, search, and skeptic filters
  const visibleCount = useMemo(() => {
    return obituaries.filter((obit) => {
      // Category filter (empty = all)
      const matchesCategory = categories.length === 0 ||
        obit.categories?.some((cat) => categories.includes(cat))
      // Search filter (empty = all)
      const matchesSearchQuery = matchesSearch(obit, searchQuery)
      // Skeptic filter (null = all)
      const matchesSkeptic = !selectedSkeptic || obit.skeptic?.slug === selectedSkeptic
      return matchesCategory && matchesSearchQuery && matchesSkeptic
    }).length
  }, [obituaries, categories, searchQuery, selectedSkeptic])

  return (
    <>
      {/* Chart section - adaptive height using CSS calc with dvh for mobile browser chrome */}
      <section
        className="relative overflow-hidden"
        style={{
          height: 'calc(100dvh - var(--header-height) - 16px)',
          minHeight: '400px',
          maxHeight: '800px',
        }}
      >
        <HomeClient
          obituaries={obituaries}
          variant="hero"
          selectedMetric={metric}
          activeCategories={categories}
          searchQuery={searchQuery}
          selectedSkeptic={selectedSkeptic}
        />
      </section>

      {/* Sidebar */}
      <aside className="border-l border-border overflow-y-auto bg-secondary" aria-label="Controls panel">
        <ControlPanelWrapper
          totalCount={obituaries.length}
          visibleCount={visibleCount}
          obituaries={obituaries}
          variant="sidebar"
        />
      </aside>
    </>
  )
}
