'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHydrated } from '@/lib/hooks/use-hydrated'
import type { ObituarySummary } from '@/types/obituary'

export interface SkepticOption {
  slug: string
  name: string
  claimCount: number
}

export interface SkepticFilterProps {
  /** Obituaries to derive skeptic list from */
  obituaries: ObituarySummary[]
  /** Currently selected skeptic slug */
  selectedSkeptic: string | null
  /** Callback when skeptic selection changes */
  onSkepticChange: (slug: string | null) => void
  /** Optional className for container */
  className?: string
}

/**
 * SkepticFilter - Dropdown to filter claims by skeptic
 *
 * Derives available skeptics from obituaries data and allows
 * filtering the visualization to show only claims from a specific skeptic.
 * Selection persists in URL via ?skeptic=slug parameter.
 */
export function SkepticFilter({
  obituaries,
  selectedSkeptic,
  onSkepticChange,
  className,
}: SkepticFilterProps) {
  // Track hydration state to prevent hydration mismatch
  const isHydrated = useHydrated()
  const [isOpen, setIsOpen] = useState(false)

  // Derive unique skeptics from obituaries, sorted by claim count
  const skeptics = useMemo<SkepticOption[]>(() => {
    const skepticMap = new Map<string, { name: string; count: number }>()

    for (const obit of obituaries) {
      if (obit.skeptic?.slug && obit.skeptic?.name) {
        const existing = skepticMap.get(obit.skeptic.slug)
        if (existing) {
          existing.count++
        } else {
          skepticMap.set(obit.skeptic.slug, { name: obit.skeptic.name, count: 1 })
        }
      }
    }

    return Array.from(skepticMap.entries())
      .map(([slug, { name, count }]) => ({ slug, name, claimCount: count }))
      .sort((a, b) => b.claimCount - a.claimCount)
  }, [obituaries])

  // Find selected skeptic info
  const selectedInfo = useMemo(() => {
    if (!selectedSkeptic) return null
    return skeptics.find((s) => s.slug === selectedSkeptic) ?? null
  }, [selectedSkeptic, skeptics])

  // Handle selection
  const handleSelect = (slug: string | null) => {
    onSkepticChange(slug)
    setIsOpen(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-skeptic-filter]')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  // Don't render if no skeptics in data
  if (skeptics.length === 0) {
    return null
  }

  return (
    <div className={cn('relative', className)} data-skeptic-filter>
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2',
          'text-sm bg-background border border-border rounded-md',
          'hover:bg-accent/50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedInfo ? `Filter by skeptic: ${selectedInfo.name}` : 'Filter by skeptic'}
      >
        <span className={cn(
          'truncate',
          !isHydrated || !selectedInfo ? 'text-muted-foreground' : 'text-foreground'
        )}>
          {isHydrated && selectedInfo ? selectedInfo.name : 'All skeptics'}
        </span>
        {isHydrated && selectedInfo ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleSelect(null)
            }}
            className="p-0.5 hover:bg-accent rounded"
            aria-label="Clear skeptic filter"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className={cn(
            'h-4 w-4 shrink-0 transition-transform',
            isOpen && 'rotate-180'
          )} />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full max-h-60 overflow-auto',
            'bg-popover border border-border rounded-md shadow-md',
            'py-1'
          )}
          role="listbox"
          aria-label="Select a skeptic"
        >
          {/* All skeptics option */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              'w-full px-3 py-2 text-left text-sm',
              'hover:bg-accent transition-colors',
              !selectedSkeptic && 'bg-accent/50'
            )}
            role="option"
            aria-selected={!selectedSkeptic}
          >
            All skeptics
          </button>

          {/* Divider */}
          <div className="h-px bg-border my-1" />

          {/* Skeptic options */}
          {skeptics.map((skeptic) => (
            <button
              key={skeptic.slug}
              type="button"
              onClick={() => handleSelect(skeptic.slug)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm flex items-center justify-between',
                'hover:bg-accent transition-colors',
                selectedSkeptic === skeptic.slug && 'bg-accent/50'
              )}
              role="option"
              aria-selected={selectedSkeptic === skeptic.slug}
            >
              <span className="truncate">{skeptic.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {skeptic.claimCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Active filter indicator */}
      {isHydrated && selectedInfo && (
        <p className="mt-1 text-xs text-muted-foreground">
          Showing {selectedInfo.claimCount} claim{selectedInfo.claimCount !== 1 ? 's' : ''} by {selectedInfo.name}
        </p>
      )}
    </div>
  )
}
