'use client'

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  type ReactNode,
} from 'react'

/**
 * Context value for LiveRegion announcements.
 */
export interface LiveRegionContextValue {
  /** Announce a message with specified politeness level */
  announce: (message: string, politeness?: 'polite' | 'assertive') => void
  /** Announce a message politely (waits for idle) */
  announcePolite: (message: string) => void
  /** Announce a message assertively (interrupts) */
  announceAssertive: (message: string) => void
}

const LiveRegionContext = createContext<LiveRegionContextValue | null>(null)

/**
 * Hook to access live region announcement functions.
 * Must be used within a LiveRegionProvider.
 *
 * @example
 * ```tsx
 * const { announcePolite } = useLiveRegion()
 * announcePolite('Showing 12 obituaries in Market category')
 * ```
 */
export function useLiveRegion(): LiveRegionContextValue {
  const context = useContext(LiveRegionContext)
  if (!context) {
    throw new Error('useLiveRegion must be used within a LiveRegionProvider')
  }
  return context
}

/**
 * Optional hook that returns null if outside provider.
 * Useful for components that may or may not have LiveRegionProvider.
 */
export function useLiveRegionOptional(): LiveRegionContextValue | null {
  return useContext(LiveRegionContext)
}

export interface LiveRegionProviderProps {
  children: ReactNode
}

/**
 * Provider for centralized screen reader announcements.
 * Wrap at root layout to enable live region announcements throughout app.
 *
 * Creates two live regions:
 * - Polite (role="status"): For non-urgent updates (filter changes, counts)
 * - Assertive (role="alert"): For urgent notifications (errors)
 *
 * Messages auto-clear after 1 second to prevent duplicate announcements.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <LiveRegionProvider>
 *   {children}
 * </LiveRegionProvider>
 *
 * // In any component
 * const { announcePolite } = useLiveRegion()
 * announcePolite('Filter applied')
 * ```
 */
export function LiveRegionProvider({ children }: LiveRegionProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('')
  const [assertiveMessage, setAssertiveMessage] = useState('')
  const politeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const assertiveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const announce = useCallback(
    (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
      if (politeness === 'assertive') {
        // Clear existing assertive timeout
        if (assertiveTimeoutRef.current) {
          clearTimeout(assertiveTimeoutRef.current)
        }
        setAssertiveMessage(message)
        assertiveTimeoutRef.current = setTimeout(() => {
          setAssertiveMessage('')
        }, 1000)
      } else {
        // Clear existing polite timeout
        if (politeTimeoutRef.current) {
          clearTimeout(politeTimeoutRef.current)
        }
        setPoliteMessage(message)
        politeTimeoutRef.current = setTimeout(() => {
          setPoliteMessage('')
        }, 1000)
      }
    },
    []
  )

  const announcePolite = useCallback(
    (message: string) => {
      announce(message, 'polite')
    },
    [announce]
  )

  const announceAssertive = useCallback(
    (message: string) => {
      announce(message, 'assertive')
    },
    [announce]
  )

  return (
    <LiveRegionContext.Provider
      value={{ announce, announcePolite, announceAssertive }}
    >
      {children}

      {/* Polite live region - for non-urgent updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-region-polite"
      >
        {politeMessage}
      </div>

      {/* Assertive live region - for urgent notifications */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-region-assertive"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  )
}
