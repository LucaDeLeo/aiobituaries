'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ExternalLink } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ObituaryContext } from '@/components/obituary/obituary-context'
import { CopyButton } from '@/components/ui/copy-button'
import { getObituaryBySlug } from '@/lib/sanity/queries'
import { formatDate } from '@/lib/utils/date'
import { modalSlideIn } from '@/lib/utils/animation'
import { CATEGORY_LABELS } from '@/lib/constants/categories'
import type { Obituary, ObituarySummary, Category } from '@/types/obituary'
import { useRouter } from 'next/navigation'

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
}

export function ObituaryModal({
  selectedSummary,
  isOpen,
  onClose,
  triggerRef,
}: ObituaryModalProps) {
  const [obituary, setObituary] = useState<Obituary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

  // Restore focus to trigger element when modal closes
  const handleClose = () => {
    onClose()
    // Small delay to allow modal exit animation
    setTimeout(() => {
      triggerRef?.current?.focus()
    }, 250)
  }

  // Navigate to full page
  const handleViewFullPage = () => {
    if (obituary) {
      router.push(`/obituary/${obituary.slug}`)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-6"
        data-testid="obituary-modal"
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
            variants={modalSlideIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-6"
          >
            <SheetHeader>
              <SheetTitle className="sr-only">Obituary Details</SheetTitle>
            </SheetHeader>

            {/* Claim */}
            <div className="space-y-4">
              <blockquote className="text-xl sm:text-2xl font-serif leading-relaxed text-[var(--text-primary)]">
                &ldquo;{obituary.claim}&rdquo;
              </blockquote>

              {/* Source with external link */}
              <div className="flex items-center gap-2">
                <a
                  href={obituary.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-mono text-[var(--accent-primary)] hover:underline"
                >
                  {obituary.source}
                  <ExternalLink className="w-3 h-3" />
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
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
              <Button onClick={handleViewFullPage} className="flex-1" variant="default">
                View full page
              </Button>
              <CopyButton
                text={`${window.location.origin}/obituary/${obituary.slug}`}
                label="Copy link"
              />
            </div>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  )
}
