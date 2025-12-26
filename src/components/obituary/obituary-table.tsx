'use client'

/**
 * ObituaryTable Component
 *
 * Accessible sortable data table displaying obituaries as an alternative
 * to the scatter plot timeline visualization. Features:
 * - Sortable columns: Date, Source, Category (Claim is not sortable)
 * - Clickable rows open ObituaryModal (unified UX with ScatterPlot)
 * - Standard table semantics with scope="col", aria-sort on sortable headers
 * - Rows have role="button" + tabIndex for keyboard accessibility
 * - sr-only caption describing current sort/filter state
 * - Respects category filter state from parent
 * - Empty state when no matches
 * - Interactive hover/focus states with accent color highlight
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'
import { DURATIONS } from '@/lib/utils/animation'
import type { ObituarySummary, Category } from '@/types/obituary'
import type { TableSortConfig } from '@/types/accessibility'
import { cn } from '@/lib/utils'
import { getCategoryColor, getCategoryLabel } from '@/lib/constants/categories'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { AIContextCell } from './ai-context-cell'
import { ObituaryModal } from './obituary-modal'
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

  // Modal state (mirrors ScatterPlot pattern)
  const [selectedSummary, setSelectedSummary] = useState<ObituarySummary | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clickOrigin, setClickOrigin] = useState<{ x: number; y: number } | null>(null)
  const clickedRowRef = useRef<HTMLTableRowElement | null>(null)
  const modalCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount (P2.4 fix: prevent state update on unmounted component)
  useEffect(() => {
    return () => {
      if (modalCloseTimeoutRef.current) {
        clearTimeout(modalCloseTimeoutRef.current)
      }
    }
  }, [])

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

  // Handler for row activation - opens modal (supports both mouse and keyboard)
  const handleRowActivate = useCallback(
    (obituary: ObituarySummary, element: HTMLTableRowElement, clientX?: number) => {
      // Capture click origin for animation
      const rect = element.getBoundingClientRect()
      const originX = clientX ?? rect.left + rect.width / 2 // Center if keyboard
      const originY = rect.top + rect.height / 2
      setClickOrigin({ x: originX, y: originY })

      setSelectedSummary(obituary)
      setIsModalOpen(true)
      clickedRowRef.current = element
    },
    []
  )

  // Handler for modal close (mirrors ScatterPlot pattern with proper cleanup)
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    // Clear any previous timeout
    if (modalCloseTimeoutRef.current) {
      clearTimeout(modalCloseTimeoutRef.current)
    }
    // Delay clearing selectedSummary to allow exit animation
    modalCloseTimeoutRef.current = setTimeout(() => {
      setSelectedSummary(null)
      modalCloseTimeoutRef.current = null
    }, DURATIONS.slow * 1000) // Convert seconds to ms
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
          </tr>
        </thead>

        <tbody>
          {displayData.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="py-12 text-center text-[var(--text-muted)]"
              >
                No obituaries match the selected filters.
              </td>
            </tr>
          ) : (
            displayData.map((obituary, index) => (
              <tr
                key={obituary._id}
                onClick={(e) => handleRowActivate(obituary, e.currentTarget, e.clientX)}
                className={cn(
                  'border-b border-[var(--border)] cursor-pointer transition-all duration-150',
                  'hover:bg-[var(--accent-primary)]/8 hover:shadow-[inset_2px_0_0_var(--accent-primary)]',
                  'focus-within:bg-[var(--accent-primary)]/8 focus-within:shadow-[inset_2px_0_0_var(--accent-primary)]',
                  index % 2 === 0 ? 'bg-[var(--bg-secondary)]/30' : 'bg-[var(--bg-primary)]'
                )}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    // Keyboard activation uses center of row for animation origin
                    handleRowActivate(obituary, e.currentTarget)
                  }
                }}
                aria-label={`View details for ${obituary.source} obituary`}
              >
                <td className="py-3 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                  <time dateTime={obituary.date}>
                    {formatDate(obituary.date)}
                  </time>
                </td>
                <td className="py-3 px-4 text-[var(--text-primary)] font-medium">
                  {obituary.source}
                </td>
                <td className="py-3 px-4 max-w-md">
                  <p className="line-clamp-2 text-[var(--text-primary)]">
                    {obituary.claim}
                  </p>
                </td>
                {/* AIContextCell: stopPropagation prevents row click when user clicks tooltip area.
                    Keyboard users access same info via modal. This is intentional UX separation. */}
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <AIContextCell date={obituary.date} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {obituary.categories?.map((cat) => (
                      <CategoryBadge key={cat} category={cat} />
                    ))}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>

        <tfoot className="bg-[var(--bg-tertiary)]">
          <tr>
            <td colSpan={5} className="py-3 px-4 text-[var(--text-muted)] text-sm">
              Showing {displayData.length} of {obituaries.length} obituaries
            </td>
          </tr>
        </tfoot>
        </table>
      </div>

      {/* Obituary Detail Modal - same as ScatterPlot */}
      <ObituaryModal
        selectedSummary={selectedSummary}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        triggerRef={clickedRowRef}
        clickOrigin={clickOrigin}
      />
    </TooltipProvider>
  )
}
