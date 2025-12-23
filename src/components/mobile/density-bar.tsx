'use client'

/**
 * DensityBar Component
 *
 * Shows distribution of obituaries over time as a horizontal bar chart.
 * Uses adaptive granularity: yearly for historical data, monthly for recent.
 * Tapping a bar filters the card list to that time period.
 *
 * Story 5-5: Mobile Hybrid View
 * Performance: Optimized to reduce DOM elements by using yearly granularity
 * for data before MONTHLY_THRESHOLD_YEAR.
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { parseUTCDate, createUTCDate, getUTCMonthEnd } from '@/lib/utils/date'
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

// Years before this use yearly granularity, years >= this use monthly
const MONTHLY_THRESHOLD_YEAR = 2010

interface DensityItem {
  key: string
  year: number
  monthNum: number | null // null for yearly bars
  count: number
  isYearly: boolean
}

export function DensityBar({
  obituaries,
  activeCategories,
  onPeriodSelect,
  activePeriod,
}: DensityBarProps) {
  // Calculate density with adaptive granularity for performance
  const { density, years, maxCount } = useMemo(() => {
    // Count by both month and year for flexible aggregation
    const monthlyCounts: Record<string, number> = {}
    const yearlyCounts: Record<number, number> = {}

    // Apply category filter and count (P1.2 fix: use UTC date parsing)
    obituaries.forEach((ob) => {
      if (
        activeCategories.length > 0 &&
        !ob.categories?.some((c) => activeCategories.includes(c))
      ) {
        return
      }

      const date = parseUTCDate(ob.date)
      const year = date.getUTCFullYear()
      const monthKey = `${year}-${date.getUTCMonth()}`

      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1
      yearlyCounts[year] = (yearlyCounts[year] || 0) + 1
    })

    // Get year range (P1.2 fix: use UTC methods)
    const dates = obituaries.map((ob) => parseUTCDate(ob.date))
    if (dates.length === 0) {
      return { density: [], years: [], maxCount: 1 }
    }

    const minYear = Math.min(...dates.map((d) => d.getUTCFullYear()))
    const maxYear = Math.max(...dates.map((d) => d.getUTCFullYear()))
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

    // Build density array with adaptive granularity
    const density: DensityItem[] = []

    years.forEach((year) => {
      if (year < MONTHLY_THRESHOLD_YEAR) {
        // Yearly granularity for historical data (reduces DOM elements)
        density.push({
          key: `year-${year}`,
          year,
          monthNum: null,
          count: yearlyCounts[year] || 0,
          isYearly: true,
        })
      } else {
        // Monthly granularity for recent data (more precision)
        for (let month = 0; month < 12; month++) {
          const monthKey = `${year}-${month}`
          density.push({
            key: monthKey,
            year,
            monthNum: month,
            count: monthlyCounts[monthKey] || 0,
            isYearly: false,
          })
        }
      }
    })

    // Max count for scaling (use monthly max for consistency)
    const allCounts = Object.values(monthlyCounts)
    const maxCount = allCounts.length > 0 ? Math.max(...allCounts, 1) : 1

    return { density, years, maxCount }
  }, [obituaries, activeCategories])

  // Check if a bar is in the active period (P1.2 fix: use UTC dates)
  const isBarActive = (item: DensityItem): boolean => {
    if (!activePeriod) return false
    if (item.isYearly) {
      // For yearly bars, check if any part of the year overlaps
      const yearStart = createUTCDate(item.year, 0, 1)
      const yearEnd = createUTCDate(item.year, 11, 31)
      return yearStart <= activePeriod.end && yearEnd >= activePeriod.start
    } else {
      const barDate = createUTCDate(item.year, item.monthNum!, 15)
      return barDate >= activePeriod.start && barDate <= activePeriod.end
    }
  }

  // Get date range for a bar click (P1.2 fix: use UTC dates)
  const getBarDateRange = (item: DensityItem): DateRange => {
    if (item.isYearly) {
      return {
        start: createUTCDate(item.year, 0, 1),
        end: createUTCDate(item.year, 11, 31),
      }
    } else {
      return {
        start: createUTCDate(item.year, item.monthNum!, 1),
        end: getUTCMonthEnd(item.year, item.monthNum!),
      }
    }
  }

  // Get label for accessibility (P1.2 fix: use UTC date)
  const getBarLabel = (item: DensityItem): string => {
    if (item.isYearly) {
      return `${item.count} obituaries in ${item.year}. Tap to filter.`
    } else {
      const monthDate = createUTCDate(item.year, item.monthNum!)
      const monthName = monthDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
      return `${item.count} obituaries in ${monthName}. Tap to filter.`
    }
  }

  if (density.length === 0) {
    return null
  }

  return (
    <div className="px-4 py-3 bg-[--bg-secondary] border-b border-[--border]">
      {/* Density Bars - CSS containment for performance */}
      <div
        className="flex items-end gap-[2px] h-12 mb-2"
        role="group"
        aria-label="Obituary distribution over time"
        style={{ contain: 'layout style paint' }}
      >
        {density.map((item) => {
          // Scale height: yearly bars use year count, monthly use month count
          const scaleFactor = item.isYearly ? 4 : 1 // Yearly bars represent ~12 months of potential data
          const normalizedCount = item.isYearly ? item.count / scaleFactor : item.count
          const height = normalizedCount > 0 ? Math.max(4, (normalizedCount / maxCount) * 48) : 2
          const isActive = isBarActive(item)

          return (
            <button
              key={item.key}
              type="button"
              className={cn(
                'flex-1 min-w-[2px] rounded-t transition-colors',
                item.count > 0
                  ? isActive
                    ? 'bg-[--accent-primary]'
                    : 'bg-[--accent-primary]/60 hover:bg-[--accent-primary]/80'
                  : 'bg-[--border]',
                // Yearly bars are slightly wider for visual distinction
                item.isYearly && 'min-w-[4px]'
              )}
              style={{ height: `${height}px` }}
              onClick={() => onPeriodSelect(getBarDateRange(item))}
              aria-label={getBarLabel(item)}
              aria-pressed={isActive}
            />
          )
        })}
      </div>

      {/* Year Labels - show subset for readability */}
      <div className="flex justify-between text-xs text-[--text-muted]">
        {years
          .filter((_, i) => i === 0 || i === years.length - 1 || (years.length > 10 && i % Math.ceil(years.length / 5) === 0))
          .map((year) => (
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
