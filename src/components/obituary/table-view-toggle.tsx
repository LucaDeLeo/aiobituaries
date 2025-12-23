'use client'

/**
 * TableViewToggle Component
 *
 * Toggle button group for switching between timeline visualization
 * and accessible table view. Includes localStorage persistence
 * with hydration-safe state management.
 *
 * Hidden on mobile (< 768px) as table view is desktop/tablet only.
 *
 * @example
 * ```tsx
 * const { mode, setMode, isHydrated } = useViewModeStorage()
 * <TableViewToggle mode={mode} onModeChange={setMode} />
 * ```
 */

import { useCallback, useSyncExternalStore } from 'react'
import { Table, ScatterChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineViewMode } from '@/types/accessibility'

const STORAGE_KEY = 'timeline-view-mode'

export interface TableViewToggleProps {
  /** Current view mode */
  mode: TimelineViewMode
  /** Callback when mode changes */
  onModeChange: (mode: TimelineViewMode) => void
}

/**
 * Toggle button group for switching between timeline and table views.
 * Uses aria-pressed for accessibility. Hidden on mobile.
 */
export function TableViewToggle({ mode, onModeChange }: TableViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className="hidden md:inline-flex rounded-lg border border-[var(--border)] p-1 bg-[var(--bg-secondary)]"
    >
      <button
        type="button"
        onClick={() => onModeChange('visualization')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
          mode === 'visualization'
            ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        )}
        aria-pressed={mode === 'visualization'}
      >
        <ScatterChart className="w-4 h-4" aria-hidden="true" />
        <span>Timeline</span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange('table')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
          mode === 'table'
            ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        )}
        aria-pressed={mode === 'table'}
      >
        <Table className="w-4 h-4" aria-hidden="true" />
        <span>Table</span>
      </button>
    </div>
  )
}

// Module-level state for localStorage sync
let listeners: Array<() => void> = []
let currentMode: TimelineViewMode | null = null

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribeToStorage(callback: () => void) {
  listeners = [...listeners, callback]

  // Also listen to storage events from other tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      const newValue = e.newValue as TimelineViewMode | null
      if (newValue === 'visualization' || newValue === 'table') {
        currentMode = newValue
        emitChange()
      }
    }
  }
  window.addEventListener('storage', handleStorage)

  return () => {
    listeners = listeners.filter((l) => l !== callback)
    window.removeEventListener('storage', handleStorage)
  }
}

function getSnapshot(): TimelineViewMode | null {
  if (currentMode === null && typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'visualization' || stored === 'table') {
      currentMode = stored
    }
  }
  return currentMode
}

function getServerSnapshot(): TimelineViewMode | null {
  return null
}

/**
 * Hook for managing view mode with localStorage persistence.
 * Handles hydration safely to prevent server/client mismatch.
 * Uses useSyncExternalStore for safe external state sync.
 *
 * @param defaultMode - Default mode to use before/during hydration
 * @returns Current mode, setter function, and hydration status
 *
 * @example
 * ```tsx
 * const { mode, setMode, isHydrated } = useViewModeStorage()
 *
 * // Always render timeline during SSR, switch after hydration
 * if (!isHydrated) return <ScatterPlot ... />
 * ```
 */
export function useViewModeStorage(
  defaultMode: TimelineViewMode = 'visualization'
) {
  // Use useSyncExternalStore for safe hydration
  // On server: getServerSnapshot returns null
  // On client: getSnapshot reads from localStorage
  const storedMode = useSyncExternalStore(
    subscribeToStorage,
    getSnapshot,
    getServerSnapshot
  )

  const setModeWithPersistence = useCallback((newMode: TimelineViewMode) => {
    currentMode = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
    emitChange()
  }, [])

  // Use stored mode if available, otherwise default
  // storedMode is null during SSR, and the actual value after hydration
  const effectiveMode = storedMode ?? defaultMode

  // isHydrated: we consider hydrated when we're on client (window exists)
  // useSyncExternalStore handles the hydration mismatch prevention
  const isHydrated = typeof window !== 'undefined'

  return {
    mode: effectiveMode,
    setMode: setModeWithPersistence,
    isHydrated,
  }
}
