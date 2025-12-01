'use client'

/**
 * DensityBar Component
 *
 * Shows distribution of obituaries over time as a horizontal bar chart.
 * Each bar represents a month, with height proportional to count.
 * Tapping a bar filters the card list to that time period.
 *
 * Story 5-5: Mobile Hybrid View
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { ObituarySummary, Category } from '@/types/obituary'

export interface DateRange {
  start: Date
  end: Date
}

export interface DensityBarProps {
  /** All obituaries (unfiltered by date) */
  obituaries: ObituarySummary[]
  /** Active category filters from URL */
  activeCategories: Category[]
  /** Callback when a bar is tapped */
  onPeriodSelect: (period: DateRange | null) => void
  /** Currently active period filter */
  activePeriod: DateRange | null
}

export function DensityBar({
  obituaries,
  activeCategories,
  onPeriodSelect,
  activePeriod,
}: DensityBarProps) {
  // Calculate density by month with memoization
  const { density, years, maxCount } = useMemo(() => {
    const counts: Record<string, number> = {}

    // Apply category filter and count by month
    obituaries.forEach((ob) => {
      // Skip if category filter is active and doesn't match
      if (
        activeCategories.length > 0 &&
        !ob.categories.some((c) => activeCategories.includes(c))
      ) {
        return
      }

      const date = new Date(ob.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      counts[key] = (counts[key] || 0) + 1
    })

    // Get year range from all obituaries
    const dates = obituaries.map((ob) => new Date(ob.date))
    if (dates.length === 0) {
      return { density: [], years: [], maxCount: 1 }
    }

    const minYear = Math.min(...dates.map((d) => d.getFullYear()))
    const maxYear = Math.max(...dates.map((d) => d.getFullYear()))
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

    // Build density array (12 months per year)
    const density: { month: string; year: number; monthNum: number; count: number }[] = []
    years.forEach((year) => {
      for (let month = 0; month < 12; month++) {
        const key = `${year}-${month}`
        density.push({
          month: key,
          year,
          monthNum: month,
          count: counts[key] || 0,
        })
      }
    })

    const maxCount = Math.max(...Object.values(counts), 1)

    return { density, years, maxCount }
  }, [obituaries, activeCategories])

  // Check if a bar is in the active period
  const isBarActive = (year: number, monthNum: number): boolean => {
    if (!activePeriod) return false
    const barDate = new Date(year, monthNum, 15)
    return barDate >= activePeriod.start && barDate <= activePeriod.end
  }

  if (density.length === 0) {
    return null
  }

  return (
    <div className="px-4 py-3 bg-[--bg-secondary] border-b border-[--border]">
      {/* Density Bars */}
      <div
        className="flex items-end gap-[2px] h-12 mb-2"
        role="group"
        aria-label="Obituary distribution over time"
      >
        {density.map(({ month, year, monthNum, count }) => {
          const height = count > 0 ? Math.max(4, (count / maxCount) * 48) : 2
          const monthDate = new Date(year, monthNum)
          const monthName = monthDate.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })
          const isActive = isBarActive(year, monthNum)

          return (
            <button
              key={month}
              type="button"
              className={cn(
                'flex-1 min-w-[2px] rounded-t transition-colors',
                count > 0
                  ? isActive
                    ? 'bg-[--accent-primary]'
                    : 'bg-[--accent-primary]/60 hover:bg-[--accent-primary]/80'
                  : 'bg-[--border]'
              )}
              style={{ height: `${height}px` }}
              onClick={() => {
                const start = new Date(year, monthNum, 1)
                const end = new Date(year, monthNum + 1, 0) // Last day of month
                onPeriodSelect({ start, end })
              }}
              aria-label={`${count} obituaries in ${monthName}. Tap to filter.`}
              aria-pressed={isActive}
            />
          )
        })}
      </div>

      {/* Year Labels */}
      <div className="flex justify-between text-xs text-[--text-muted]">
        {years.map((year) => (
          <span key={year}>{year}</span>
        ))}
      </div>

      {/* Active period indicator */}
      {activePeriod && (
        <button
          type="button"
          onClick={() => onPeriodSelect(null)}
          className="mt-2 text-xs text-[--accent-primary] underline"
        >
          Clear date filter
        </button>
      )}
    </div>
  )
}
