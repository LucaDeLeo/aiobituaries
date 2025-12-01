'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AdjacentObituary } from '@/types/navigation'

interface ObituaryNavProps {
  previous: AdjacentObituary | null
  next: AdjacentObituary | null
}

/**
 * Previous/Next navigation component for obituary detail pages.
 * Provides both click and keyboard navigation (ArrowLeft/ArrowRight).
 * Navigation order is chronological by date.
 */
export function ObituaryNav({ previous, next }: ObituaryNavProps) {
  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      )
        return

      if (e.key === 'ArrowLeft' && previous) {
        window.location.href = `/obituary/${previous.slug}`
      } else if (e.key === 'ArrowRight' && next) {
        window.location.href = `/obituary/${next.slug}`
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previous, next])

  return (
    <nav
      className="flex justify-between items-stretch gap-4 mt-8 pt-6 border-t border-[--border]"
      aria-label="Obituary navigation"
    >
      {/* Previous */}
      {previous ? (
        <Link
          href={`/obituary/${previous.slug}`}
          className="group flex-1 flex items-center gap-3 p-4 rounded-lg bg-[--bg-card] border border-[--border] hover:border-[--accent-primary] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[--text-muted] group-hover:text-[--accent-primary]" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-[--text-muted] uppercase tracking-wider">
              Previous
            </span>
            <span className="text-sm text-[--text-secondary] truncate">
              {previous.source}
            </span>
          </div>
        </Link>
      ) : (
        <div className="flex-1" aria-hidden="true" />
      )}

      {/* Next */}
      {next ? (
        <Link
          href={`/obituary/${next.slug}`}
          className="group flex-1 flex items-center justify-end gap-3 p-4 rounded-lg bg-[--bg-card] border border-[--border] hover:border-[--accent-primary] transition-colors text-right"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-[--text-muted] uppercase tracking-wider">
              Next
            </span>
            <span className="text-sm text-[--text-secondary] truncate">
              {next.source}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-[--text-muted] group-hover:text-[--accent-primary]" />
        </Link>
      ) : (
        <div className="flex-1" aria-hidden="true" />
      )}
    </nav>
  )
}
