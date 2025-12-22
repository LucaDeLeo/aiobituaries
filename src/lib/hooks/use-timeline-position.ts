'use client'

/**
 * useTimelinePosition Hook
 *
 * Manages timeline scroll and zoom position persistence via sessionStorage.
 * Saves position on scroll/zoom changes (debounced) and restores on mount.
 * Position expires after 1 hour of inactivity.
 *
 * Story 5-3: Position Preservation
 */

import { useCallback, useEffect, useState, useRef } from 'react'
import {
  type TimelinePosition,
  TIMELINE_POSITION_STORAGE_KEY,
  TIMELINE_POSITION_EXPIRY_MS,
} from '@/types/navigation'

// Zoom is no longer supported, but we keep these for backward compatibility
// with stored positions that may have zoom values
const MIN_SCALE = 0.5
const MAX_SCALE = 5

/** Debounce delay for save operations (ms) */
export const SAVE_DEBOUNCE_MS = 300

export interface UseTimelinePositionReturn {
  /** Current position (null if not yet loaded or no saved position) */
  position: TimelinePosition | null
  /** Save new position (debounced internally) */
  savePosition: (pos: Omit<TimelinePosition, 'timestamp'>) => void
  /** Clear stored position */
  clearPosition: () => void
  /** Whether position was restored from storage */
  wasRestored: boolean
  /** Whether position loading has completed (for avoiding race conditions) */
  isLoaded: boolean
}

/**
 * Check if sessionStorage is available.
 * Exported for testing.
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const testKey = '__test_storage__'
    sessionStorage.setItem(testKey, 'test')
    sessionStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Load position from sessionStorage.
 * Returns null if no valid position exists or if expired.
 * Exported for testing.
 */
export function loadPositionFromStorage(): TimelinePosition | null {
  if (!isSessionStorageAvailable()) return null

  try {
    const stored = sessionStorage.getItem(TIMELINE_POSITION_STORAGE_KEY)
    if (!stored) return null

    const parsed: TimelinePosition = JSON.parse(stored)

    // Validate parsed data has required fields
    if (
      typeof parsed.scrollX !== 'number' ||
      typeof parsed.zoom !== 'number' ||
      typeof parsed.timestamp !== 'number'
    ) {
      // Invalid data structure, remove it
      sessionStorage.removeItem(TIMELINE_POSITION_STORAGE_KEY)
      return null
    }

    // Check expiry
    if (Date.now() - parsed.timestamp > TIMELINE_POSITION_EXPIRY_MS) {
      sessionStorage.removeItem(TIMELINE_POSITION_STORAGE_KEY)
      return null
    }

    // Clamp zoom to valid range
    const clampedZoom = Math.max(MIN_SCALE, Math.min(MAX_SCALE, parsed.zoom))

    return {
      ...parsed,
      zoom: clampedZoom,
    }
  } catch (e) {
    // JSON parse error or other issues
    console.warn('Failed to load timeline position:', e)
    try {
      sessionStorage.removeItem(TIMELINE_POSITION_STORAGE_KEY)
    } catch {
      // Ignore removal errors
    }
    return null
  }
}

/**
 * Save position to sessionStorage.
 * Handles QuotaExceededError gracefully.
 * Exported for testing.
 */
export function savePositionToStorage(
  pos: Omit<TimelinePosition, 'timestamp'>
): boolean {
  if (!isSessionStorageAvailable()) return false

  const position: TimelinePosition = {
    scrollX: pos.scrollX,
    zoom: pos.zoom,
    timestamp: Date.now(),
  }

  try {
    sessionStorage.setItem(
      TIMELINE_POSITION_STORAGE_KEY,
      JSON.stringify(position)
    )
    return true
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      console.warn('sessionStorage quota exceeded, position not saved')
    } else {
      console.warn('Failed to save timeline position:', e)
    }
    return false
  }
}

/**
 * Clear position from sessionStorage.
 * Exported for testing.
 */
export function clearPositionFromStorage(): void {
  if (!isSessionStorageAvailable()) return

  try {
    sessionStorage.removeItem(TIMELINE_POSITION_STORAGE_KEY)
  } catch {
    // Ignore removal errors
  }
}

/**
 * Hook for managing timeline position persistence.
 * Loads position from sessionStorage on mount, saves on changes (debounced).
 */
export function useTimelinePosition(): UseTimelinePositionReturn {
  const [position, setPosition] = useState<TimelinePosition | null>(null)
  const [wasRestored, setWasRestored] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load position on mount (client-side only)
  // This is a legitimate use of setState in useEffect - syncing React state with
  // sessionStorage (external system) on mount. Only runs once.
  useEffect(() => {
    const loaded = loadPositionFromStorage()
    if (loaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with external storage on mount
      setPosition(loaded)
      setWasRestored(true)
    }
    setIsLoaded(true)
  }, [])

  // Save position (debounced)
  const savePosition = useCallback(
    (pos: Omit<TimelinePosition, 'timestamp'>) => {
      // Update local state immediately
      const newPosition: TimelinePosition = {
        ...pos,
        timestamp: Date.now(),
      }
      setPosition(newPosition)

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Debounced save to storage
      saveTimeoutRef.current = setTimeout(() => {
        savePositionToStorage(pos)
      }, SAVE_DEBOUNCE_MS)
    },
    []
  )

  // Clear position
  const clearPosition = useCallback(() => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    setPosition(null)
    setWasRestored(false)
    clearPositionFromStorage()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return { position, savePosition, clearPosition, wasRestored, isLoaded }
}
