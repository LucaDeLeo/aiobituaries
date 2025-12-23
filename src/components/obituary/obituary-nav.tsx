'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AdjacentObituary } from '@/types/navigation'

interface ObituaryNavProps {
  previous: AdjacentObituary | null
  next: AdjacentObituary | null
}

/**
 * Check if an element is an interactive control that should block arrow key navigation.
 * P2.2 fix: Expanded guard conditions beyond just INPUT/TEXTAREA.
 */
function isInteractiveElement(element: Element | null): boolean {
  if (!element) return false

  const tagName = element.tagName
  // Guard against common interactive elements
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true
  }

  // Guard against contenteditable elements
  if (element.getAttribute('contenteditable') === 'true') {
    return true
  }

  // Guard against elements with textbox role (e.g., custom inputs)
  if (element.getAttribute('role') === 'textbox') {
    return true
  }

  // Guard against elements with listbox/combobox roles (dropdown menus)
  const role = element.getAttribute('role')
  if (role === 'listbox' || role === 'combobox' || role === 'menu') {
    return true
  }

  return false
}

/**
 * Previous/Next navigation component for obituary detail pages.
 * Provides both click and keyboard navigation (ArrowLeft/ArrowRight).
 * Navigation order is chronological by date.
 */
export function ObituaryNav({ previous, next }: ObituaryNavProps) {
  const router = useRouter()

  // Keyboard navigation - P2.2 fix: use Next.js router for SPA navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if focus is on interactive elements
      if (isInteractiveElement(document.activeElement)) {
        return
      }

      if (e.key === 'ArrowLeft' && previous) {
        router.push(`/obituary/${previous.slug}`)
      } else if (e.key === 'ArrowRight' && next) {
        router.push(`/obituary/${next.slug}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previous, next, router])

  return (
    <nav
      className="flex justify-between items-stretch gap-4 mt-8 pt-6 border-t border-[var(--border)]"
      aria-label="Obituary navigation"
    >
      {/* Previous */}
      {previous ? (
        <Link
          href={`/obituary/${previous.slug}`}
          className="group flex-1 flex items-center gap-3 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent-primary)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Previous
            </span>
            <span className="text-sm text-[var(--text-secondary)] truncate">
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
          className="group flex-1 flex items-center justify-end gap-3 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent-primary)] transition-colors text-right"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Next
            </span>
            <span className="text-sm text-[var(--text-secondary)] truncate">
              {next.source}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
        </Link>
      ) : (
        <div className="flex-1" aria-hidden="true" />
      )}
    </nav>
  )
}
