'use client'

/**
 * DensityBar Component (Tombstone Timeline)
 *
 * Shows distribution of obituaries over time as tombstone silhouettes.
 * Each tombstone represents a time period; height = obituary count.
 * Tapping a tombstone filters the card list to that period.
 *
 * Design: "Graveyard Plot" - embraces the dark humor of "AI Obituaries"
 * with tombstone shapes and misty ground aesthetics.
 *
 * Story 5-5: Mobile Hybrid View
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
  /** Callback when a tombstone is tapped */
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

  // Check if a tombstone is in the active period (P1.2 fix: use UTC dates)
  const isTombstoneActive = (item: DensityItem): boolean => {
    if (!activePeriod) return false
    if (item.isYearly) {
      // For yearly tombstones, check if any part of the year overlaps
      const yearStart = createUTCDate(item.year, 0, 1)
      const yearEnd = createUTCDate(item.year, 11, 31)
      return yearStart <= activePeriod.end && yearEnd >= activePeriod.start
    } else {
      const barDate = createUTCDate(item.year, item.monthNum!, 15)
      return barDate >= activePeriod.start && barDate <= activePeriod.end
    }
  }

  // Get date range for a tombstone click (P1.2 fix: use UTC dates)
  const getTombstoneDateRange = (item: DensityItem): DateRange => {
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
  const getTombstoneLabel = (item: DensityItem): string => {
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
    <div className="relative px-3 pt-2 pb-1 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
      {/* Header label */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]"
          style={{ fontVariant: 'small-caps' }}
        >
          Declared Deaths
        </span>
        {activePeriod && (
          <button
            type="button"
            onClick={() => onPeriodSelect(null)}
            className="text-[10px] text-[var(--accent-primary)] hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Tombstone graveyard */}
      <div className="relative">
        {/* Tombstones container */}
        <div
          className="flex items-end gap-[2px] h-12"
          role="group"
          aria-label="Obituary distribution over time. Tap a tombstone to filter."
          style={{ contain: 'layout style paint' }}
        >
          {density.map((item) => {
            // Scale height: yearly tombstones use year count, monthly use month count
            const scaleFactor = item.isYearly ? 4 : 1
            const normalizedCount = item.isYearly ? item.count / scaleFactor : item.count
            // Height: min 6px for empty, up to 44px for max
            const height = normalizedCount > 0 ? Math.max(10, (normalizedCount / maxCount) * 44) : 6
            const isActive = isTombstoneActive(item)
            const hasDeaths = item.count > 0

            return (
              <button
                key={item.key}
                type="button"
                className={cn(
                  'flex-1 min-w-[3px] transition-all duration-200',
                  // Tombstone shape: rounded top
                  'rounded-t-sm',
                  // Yearly tombstones slightly wider
                  item.isYearly && 'min-w-[5px]',
                  // Color states
                  hasDeaths
                    ? isActive
                      ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]'
                      : 'bg-[var(--text-muted)]/50 hover:bg-[var(--text-muted)]/70'
                    : 'bg-[var(--border)]/40',
                  // Rise effect on active
                  isActive && 'transform -translate-y-0.5'
                )}
                style={{ height: `${height}px` }}
                onClick={() => onPeriodSelect(getTombstoneDateRange(item))}
                aria-label={getTombstoneLabel(item)}
                aria-pressed={isActive}
              />
            )
          })}
        </div>

        {/* Ground/mist effect */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Year Labels */}
      <div className="flex justify-between mt-1.5 text-[9px] text-[var(--text-muted)]/70">
        {years
          .filter(
            (_, i) =>
              i === 0 ||
              i === years.length - 1 ||
              (years.length > 10 && i % Math.ceil(years.length / 5) === 0)
          )
          .map((year) => (
            <span key={year}>{year}</span>
          ))}
      </div>
    </div>
  )
}
