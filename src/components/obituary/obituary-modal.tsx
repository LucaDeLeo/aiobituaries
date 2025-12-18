'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { sanitizeUrl } from '@/lib/utils/url'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ObituaryContext } from '@/components/obituary/obituary-context'
import { CopyButton } from '@/components/ui/copy-button'
import { getObituaryBySlug } from '@/lib/sanity/queries'
import { formatDate } from '@/lib/utils/date'
import { modalSlideIn, DURATIONS } from '@/lib/utils/animation'
import { CATEGORY_LABELS } from '@/lib/constants/categories'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import type { Obituary, ObituarySummary, Category } from '@/types/obituary'

/**
 * Badge color mappings with semi-transparent background and solid text.
 * Matches the pattern from obituary-detail.tsx for consistency.
 */
const BADGE_COLORS: Record<Category, string> = {
  capability: 'bg-[--category-capability]/20 text-[--category-capability]',
  market: 'bg-[--category-market]/20 text-[--category-market]',
  agi: 'bg-[--category-agi]/20 text-[--category-agi]',
  dismissive: 'bg-[--category-dismissive]/20 text-[--category-dismissive]',
}

export interface ObituaryModalProps {
  /** Summary data from timeline (used to fetch full obituary) */
  selectedSummary: ObituarySummary | null
  /** Whether modal is open */
  isOpen: boolean
  /** Callback to close modal */
  onClose: () => void
  /** Optional: ref to element that opened modal (for focus restoration) */
  triggerRef?: React.RefObject<HTMLElement | null>
  /** Side of the screen to slide in from. Default: "right" */
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function ObituaryModal({
  selectedSummary,
  isOpen,
  onClose,
  triggerRef,
  side = 'right',
}: ObituaryModalProps) {
  const [obituary, setObituary] = useState<Obituary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate unique IDs for ARIA relationships
  const titleId = obituary ? `modal-title-${obituary._id}` : undefined
  const descriptionId = obituary ? `modal-desc-${obituary._id}` : undefined

  // Check reduced motion preference
  const shouldReduceMotion = useReducedMotion()

  // Restore focus to trigger element when modal closes
  const handleClose = () => {
    onClose()
    // Small delay to allow modal exit animation
    setTimeout(() => {
      triggerRef?.current?.focus()
    }, 250)
  }

  // Integrate focus trap for keyboard navigation
  const { trapRef } = useFocusTrap({
    isActive: isOpen,
    onEscape: handleClose,
  })

  // Fetch full obituary data when modal opens
  useEffect(() => {
    // Only fetch when modal is open with valid data
    if (!isOpen || !selectedSummary) {
      return
    }

    let cancelled = false

    // Use async IIFE to fetch data
    const fetchData = async () => {
      setIsLoading(true)
      setObituary(null)
      setError(null)

      try {
        const data = await getObituaryBySlug(selectedSummary.slug)
        if (cancelled) return
        if (data) {
          setObituary(data)
        } else {
          setError('Obituary not found')
        }
      } catch (err) {
        if (cancelled) return
        console.error('Error fetching obituary:', err)
        setError('Failed to load obituary')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [isOpen, selectedSummary])

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        ref={trapRef as React.RefObject<HTMLDivElement>}
        side={side}
        className={cn(
          'overflow-y-auto p-6',
          side === 'bottom' ? 'h-[85vh] max-h-[85vh]' : 'w-full sm:max-w-lg'
        )}
        data-testid="obituary-modal"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-[var(--text-secondary)] font-mono">Loading...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-[var(--text-error)] font-mono">{error}</div>
          </div>
        )}

        {obituary && !isLoading && !error && (
          <motion.div
            variants={shouldReduceMotion ? undefined : modalSlideIn}
            initial={shouldReduceMotion ? undefined : "initial"}
            animate={shouldReduceMotion ? undefined : "animate"}
            exit={shouldReduceMotion ? undefined : "exit"}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: DURATIONS.slow, ease: 'easeOut' }
            }
            style={{
              willChange: shouldReduceMotion ? 'auto' : 'transform',
            }}
            className="space-y-6"
          >
            <SheetHeader>
              <SheetTitle id={titleId} className="sr-only">
                {obituary.source}
              </SheetTitle>
              <SheetDescription id={descriptionId} className="sr-only">
                Obituary from {obituary.source} on {formatDate(obituary.date)}:{' '}
                {obituary.claim.slice(0, 100)}
                {obituary.claim.length > 100 ? '...' : ''}
              </SheetDescription>
            </SheetHeader>

            {/* Claim */}
            <div className="space-y-4">
              <blockquote className="text-xl sm:text-2xl font-serif leading-relaxed text-[var(--text-primary)]">
                &ldquo;{obituary.claim}&rdquo;
              </blockquote>

              {/* Source with external link */}
              <div className="flex items-center gap-2">
                <a
                  href={sanitizeUrl(obituary.sourceUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-mono text-[var(--accent-primary)] hover:underline"
                >
                  {obituary.source}
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>

              {/* Date and Categories */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-mono text-[var(--text-secondary)]">
                  {formatDate(obituary.date)}
                </span>
                {obituary.categories?.map((category) => (
                  <span
                    key={category}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${BADGE_COLORS[category]}`}
                  >
                    {CATEGORY_LABELS[category]}
                  </span>
                ))}
              </div>
            </div>

            {/* Context Section */}
            {obituary.context && (
              <div className="border-t border-[var(--border)] pt-4">
                <ObituaryContext context={obituary.context} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
              <CopyButton
                text={`${window.location.origin}/obituary/${obituary.slug}`}
                label="Copy link"
              />
              <Link
                href={`/obituary/${obituary.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-[--accent-primary] text-[--bg-primary] rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                View full page
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  )
}
