'use client'

import { useSyncExternalStore } from 'react'

/**
 * Hydration-safe hook to detect if component is mounted on client.
 * Uses useSyncExternalStore for proper React 18+ hydration handling.
 *
 * This avoids the ESLint react-hooks/set-state-in-effect rule violation
 * that occurs with the traditional useState + useEffect pattern.
 *
 * @returns true when running on the client after hydration, false during SSR
 */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {}, // subscribe - no-op since this never changes
    () => true, // getSnapshot - client always returns true
    () => false // getServerSnapshot - server always returns false
  )
}
