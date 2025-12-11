'use client'

import { useSyncExternalStore } from 'react'

/**
 * Hook to track media query matches.
 * Uses useSyncExternalStore for proper hydration handling.
 * Returns false during SSR to avoid hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener('change', callback)
    return () => media.removeEventListener('change', callback)
  }

  const getSnapshot = () => {
    return window.matchMedia(query).matches
  }

  const getServerSnapshot = () => {
    return false // Always false during SSR
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
