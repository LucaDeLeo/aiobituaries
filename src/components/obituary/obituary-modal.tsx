'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { sanitizeUrl } from '@/lib/utils/url'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ObituaryContext } from '@/components/obituary/obituary-context'
import { CopyButton } from '@/components/ui/copy-button'
import { formatDate } from '@/lib/utils/date'
import { modalSlideIn, DURATIONS } from '@/lib/utils/animation'
import { CATEGORY_LABELS, CATEGORY_BADGE_CLASSES } from '@/lib/constants/categories'
import type { Obituary, ObituarySummary } from '@/types/obituary'

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

  // Generate stable IDs for ARIA relationships (based on summary slug when available)
  const modalId = selectedSummary?.slug ?? 'obituary-modal'
  const titleId = `modal-title-${modalId}`
  const descriptionId = `modal-desc-${modalId}`

  // Check reduced motion preference
  const shouldReduceMotion = useReducedMotion()

  // P2.4 fix: Store timeout ref for cleanup
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
      }
    }
  }, [])

  // Restore focus to trigger element when modal closes
  // Note: Radix Sheet handles focus trap and Escape key automatically
  const handleClose = () => {
    onClose()
    // Clear any previous timeout
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current)
    }
    // Small delay to allow modal exit animation
    focusTimeoutRef.current = setTimeout(() => {
      triggerRef?.current?.focus()
      focusTimeoutRef.current = null
    }, 250)
  }

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
        const response = await fetch(`/api/obituary/${selectedSummary.slug}`)
        if (cancelled) return

        if (!response.ok) {
          if (response.status === 404) {
            setError('Obituary not found')
          } else {
            setError('Failed to load obituary')
          }
          return
        }

        const data = await response.json()
        if (cancelled) return
        setObituary(data)
      } catch (err) {
        if (cancelled) return
        console.error('Error fetching obituary:', err)
        setError('Failed to load obituary. Please check your connection.')
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
        side={side}
        className={cn(
          'overflow-y-auto p-6',
          side === 'bottom' ? 'h-[85vh] max-h-[85vh]' : 'w-full sm:max-w-lg'
        )}
        data-testid="obituary-modal"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        {/* Always-present accessible header with dynamic content */}
        {/* Uses sr-only class to visually hide while satisfying Radix's DialogTitle requirement */}
        <SheetTitle id={titleId} className="sr-only">
          {isLoading
            ? 'Loading obituary'
            : error
              ? 'Error loading obituary'
              : obituary
                ? `Obituary from ${obituary.source}`
                : 'Obituary'}
        </SheetTitle>
        <SheetDescription id={descriptionId} className="sr-only">
          {isLoading
            ? 'Loading obituary details, please wait'
            : error
              ? error
              : obituary
                ? `${formatDate(obituary.date)}: ${obituary.claim.slice(0, 100)}${obituary.claim.length > 100 ? '...' : ''}`
                : 'Obituary details'}
        </SheetDescription>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-[var(--text-secondary)] font-mono">Loading...</div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-[var(--text-error)] font-mono">{error}</div>
          </div>
        )}

        {/* Success state */}
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
                    className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_BADGE_CLASSES[category]}`}
                  >
                    {CATEGORY_LABELS[category]}
                  </span>
                ))}
              </div>
            </div>

            {/* Context Section */}
            <div className="border-t border-[var(--border)] pt-4">
              <ObituaryContext context={obituary.context} date={obituary.date} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
              <CopyButton
                text={`${window.location.origin}/obituary/${obituary.slug}`}
                label="Copy link"
              />
              <Link
                href={`/obituary/${obituary.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-lg font-medium hover:opacity-90 transition-opacity"
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
