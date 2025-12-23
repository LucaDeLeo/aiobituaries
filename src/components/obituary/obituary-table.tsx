'use client'

/**
 * ObituaryTable Component
 *
 * Accessible sortable data table displaying obituaries as an alternative
 * to the scatter plot timeline visualization. Features:
 * - Sortable columns: Date, Source, Category (Claim is not sortable)
 * - Proper ARIA semantics: role="grid", scope="col", aria-sort on th elements
 * - sr-only caption describing current state
 * - Respects category filter state
 * - Empty state when no matches
 * - Alternating row colors for readability
 *
 * CRITICAL: ObituarySummary does NOT have sourceUrl, so Source column
 * displays plain text. Actions column links to /obituary/[slug] detail page.
 */

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'
import type { ObituarySummary, Category } from '@/types/obituary'
import type { TableSortConfig } from '@/types/accessibility'
import { cn } from '@/lib/utils'
import { getCategoryColor, getCategoryLabel } from '@/lib/constants/categories'
import { VisuallyHidden } from '@/components/accessibility/visually-hidden'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { AIContextCell } from './ai-context-cell'
import { Info } from 'lucide-react'

export interface ObituaryTableProps {
  /** Obituary data to display */
  obituaries: ObituarySummary[]
  /** Active category filters */
  activeCategories: Category[]
}

/**
 * Inline category badge for table display.
 * Uses CategoryPill-style styling without creating a separate component.
 */
function CategoryBadge({ category }: { category: Category }) {
  const color = getCategoryColor(category)
  const label = getCategoryLabel(category)

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
      style={{ backgroundColor: `${color}20` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

/**
 * Props for sortable column header.
 */
interface SortableHeaderProps {
  column: TableSortConfig['column']
  currentColumn: TableSortConfig['column']
  direction: TableSortConfig['direction']
  onSort: (column: TableSortConfig['column']) => void
  children: React.ReactNode
}

/**
 * Sortable column header with proper aria-sort on th element.
 * Extracted outside ObituaryTable to avoid ESLint static-components error.
 */
function SortableHeader({
  column,
  currentColumn,
  direction,
  onSort,
  children,
}: SortableHeaderProps) {
  const isActive = currentColumn === column
  const ariaSortValue: 'ascending' | 'descending' | 'none' = isActive
    ? direction === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none'

  return (
    <th scope="col" className="py-3 px-4" aria-sort={ariaSortValue}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          'flex items-center gap-1 font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-tertiary)]',
          isActive
            ? 'text-[var(--accent-primary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        )}
      >
        {children}
        {isActive &&
          (direction === 'asc' ? (
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ArrowDown className="w-4 h-4" aria-hidden="true" />
          ))}
      </button>
    </th>
  )
}

/**
 * Accessible sortable data table for obituary display.
 */
export function ObituaryTable({
  obituaries,
  activeCategories,
}: ObituaryTableProps) {
  const [sortConfig, setSortConfig] = useState<TableSortConfig>({
    column: 'date',
    direction: 'desc',
  })

  // Filter and sort data
  const displayData = useMemo(() => {
    let filtered = obituaries

    // Apply category filter
    if (activeCategories.length > 0) {
      filtered = obituaries.filter((ob) =>
        ob.categories?.some((c) => activeCategories.includes(c))
      )
    }

    // Sort
    return [...filtered].sort((a, b) => {
      const multiplier = sortConfig.direction === 'asc' ? 1 : -1

      switch (sortConfig.column) {
        case 'date':
          return (
            multiplier *
            (new Date(a.date).getTime() - new Date(b.date).getTime())
          )
        case 'source':
          return multiplier * a.source.localeCompare(b.source)
        case 'category':
          return (
            multiplier *
            (a.categories?.[0] || '').localeCompare(b.categories?.[0] || '')
          )
        default:
          return 0
      }
    })
  }, [obituaries, activeCategories, sortConfig])

  const handleSort = useCallback((column: TableSortConfig['column']) => {
    setSortConfig((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }, [])

  // Build caption text for screen readers
  const captionText = useMemo(() => {
    const sortText = `sorted by ${sortConfig.column} in ${
      sortConfig.direction === 'desc' ? 'descending' : 'ascending'
    } order`
    const filterText =
      activeCategories.length > 0
        ? `. Filtered to show ${activeCategories.map((c) => getCategoryLabel(c)).join(', ')} categories`
        : ''
    const countText = `. ${displayData.length} of ${obituaries.length} obituaries shown`

    return `AI Obituaries ${sortText}${filterText}${countText}`
  }, [sortConfig, activeCategories, displayData.length, obituaries.length])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table
        className="w-full text-left border-collapse"
        role="grid"
        aria-label="AI Obituaries"
      >
        <caption className="sr-only">{captionText}</caption>

        <thead className="bg-[var(--bg-tertiary)]">
          <tr className="border-b border-[var(--border)]">
            <SortableHeader
              column="date"
              currentColumn={sortConfig.column}
              direction={sortConfig.direction}
              onSort={handleSort}
            >
              Date
            </SortableHeader>
            <SortableHeader
              column="source"
              currentColumn={sortConfig.column}
              direction={sortConfig.direction}
              onSort={handleSort}
            >
              Source
            </SortableHeader>
            <th
              scope="col"
              className="py-3 px-4 text-[var(--text-secondary)] font-medium"
            >
              Claim
            </th>
            <th
              scope="col"
              className="py-3 px-4 text-[var(--text-secondary)] font-medium"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1.5 cursor-help">
                    AI Level
                    <Info className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[240px]">
                  <p className="text-xs">
                    Training compute (FLOP) at time of publication. Higher values indicate
                    more advanced AI capabilities existed when the claim was made.
                  </p>
                </TooltipContent>
              </Tooltip>
            </th>
            <SortableHeader
              column="category"
              currentColumn={sortConfig.column}
              direction={sortConfig.direction}
              onSort={handleSort}
            >
              Category
            </SortableHeader>
            <th scope="col" className="py-3 px-4">
              <VisuallyHidden>Actions</VisuallyHidden>
            </th>
          </tr>
        </thead>

        <tbody>
          {displayData.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="py-12 text-center text-[var(--text-muted)]"
              >
                No obituaries match the selected filters.
              </td>
            </tr>
          ) : (
            displayData.map((obituary, index) => (
              <tr
                key={obituary._id}
                className={cn(
                  'border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors',
                  index % 2 === 0 ? 'bg-[var(--bg-secondary)]/30' : 'bg-[var(--bg-primary)]'
                )}
              >
                <td className="py-3 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                  <time dateTime={obituary.date}>
                    {formatDate(obituary.date)}
                  </time>
                </td>
                <td className="py-3 px-4 text-[var(--text-primary)]">
                  {obituary.source}
                </td>
                <td className="py-3 px-4 max-w-md">
                  <p className="line-clamp-2 text-[var(--text-primary)]">
                    {obituary.claim}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <AIContextCell date={obituary.date} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {obituary.categories?.map((cat) => (
                      <CategoryBadge key={cat} category={cat} />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/obituary/${obituary.slug}`}
                    className="text-sm text-[var(--accent-primary)] hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] rounded"
                  >
                    View details
                    <VisuallyHidden>
                      {' '}
                      for {obituary.source} obituary
                    </VisuallyHidden>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>

        <tfoot className="bg-[var(--bg-tertiary)]">
          <tr>
            <td colSpan={6} className="py-3 px-4 text-[var(--text-muted)] text-sm">
              Showing {displayData.length} of {obituaries.length} obituaries
            </td>
          </tr>
        </tfoot>
        </table>
      </div>
    </TooltipProvider>
  )
}
