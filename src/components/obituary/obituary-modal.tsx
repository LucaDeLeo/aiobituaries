'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ExternalLink, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { sanitizeUrl } from '@/lib/utils/url'
import * as Dialog from '@radix-ui/react-dialog'
import { ObituaryContext } from '@/components/obituary/obituary-context'
import { CopyButton } from '@/components/ui/copy-button'
import { formatDate } from '@/lib/utils/date'
import { DURATIONS } from '@/lib/utils/animation'
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
  /** Click origin coordinates for animation (viewport-relative) */
  clickOrigin?: { x: number; y: number } | null
}

export function ObituaryModal({
  selectedSummary,
  isOpen,
  onClose,
  triggerRef,
  clickOrigin,
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
  const handleClose = useCallback(() => {
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
  }, [onClose, triggerRef])

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

  // Calculate transform origin based on click position
  // Default to center if no origin provided
  const getTransformOrigin = () => {
    if (!clickOrigin) return 'center center'
    // Convert viewport coordinates to relative position
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1080
    const xPercent = (clickOrigin.x / vw) * 100
    const yPercent = (clickOrigin.y / vh) * 100
    return `${xPercent}% ${yPercent}%`
  }

  // Animation variants for origin-based scale animation
  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as const

  const contentVariants = {
    initial: {
      opacity: 0,
      scale: 0.85,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: DURATIONS.fast,
        ease: 'easeIn' as const,
      },
    },
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Backdrop overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                variants={shouldReduceMotion ? undefined : overlayVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: DURATIONS.fast }}
              />
            </Dialog.Overlay>

            {/* Dialog content with origin animation */}
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                  'w-[calc(100%-2rem)] max-w-lg max-h-[85vh]',
                  'overflow-y-auto rounded-xl shadow-2xl',
                  'bg-[var(--bg-primary)] border border-[var(--border)]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]'
                )}
                variants={shouldReduceMotion ? undefined : contentVariants}
                initial={shouldReduceMotion ? undefined : 'initial'}
                animate={shouldReduceMotion ? undefined : 'animate'}
                exit={shouldReduceMotion ? undefined : 'exit'}
                style={{
                  transformOrigin: getTransformOrigin(),
                  willChange: shouldReduceMotion ? 'auto' : 'transform, opacity',
                }}
                data-testid="obituary-modal"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
              >
                {/* Header with close button */}
                <div className="sticky top-0 z-10 flex justify-end p-3 bg-[var(--bg-primary)] border-b border-[var(--border)]">
                  <Dialog.Close asChild>
                    <button
                      className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Accessible title (visually hidden) */}
                <Dialog.Title id={titleId} className="sr-only">
                  {isLoading
                    ? 'Loading obituary'
                    : error
                      ? 'Error loading obituary'
                      : obituary
                        ? `Obituary from ${obituary.source}`
                        : 'Obituary'}
                </Dialog.Title>
                <Dialog.Description id={descriptionId} className="sr-only">
                  {isLoading
                    ? 'Loading obituary details, please wait'
                    : error
                      ? error
                      : obituary
                        ? `${formatDate(obituary.date)}: ${obituary.claim.slice(0, 100)}${obituary.claim.length > 100 ? '...' : ''}`
                        : 'Obituary details'}
                </Dialog.Description>

                {/* Content area */}
                <div className="p-6">
                  {/* Loading state */}
                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-[var(--text-secondary)] font-mono animate-pulse">
                        Loading...
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {error && !isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-[var(--text-error)] font-mono">{error}</div>
                    </div>
                  )}

                  {/* Success state */}
                  {obituary && !isLoading && !error && (
                    <div className="space-y-6">
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
                          text={`${typeof window !== 'undefined' ? window.location.origin : ''}/obituary/${obituary.slug}`}
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
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
