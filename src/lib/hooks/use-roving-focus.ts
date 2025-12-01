'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import type { NavigationDirection } from '@/types/accessibility'

export interface UseRovingFocusOptions {
  /** Total number of items */
  itemCount: number
  /** Grid columns for 2D navigation (optional) */
  columns?: number
  /** Callback when focus changes */
  onFocusChange?: (index: number) => void
  /** Initial focused index */
  initialIndex?: number
  /** Wrap around at boundaries */
  wrap?: boolean
}

export interface UseRovingFocusReturn {
  /** Currently focused index */
  focusedIndex: number
  /** Get tabindex for an item */
  getTabIndex: (index: number) => 0 | -1
  /** Handle keyboard navigation */
  handleKeyDown: (event: React.KeyboardEvent, itemIndex: number) => void
  /** Set focus to specific index */
  setFocusedIndex: (index: number) => void
  /** Ref callback for items */
  getItemRef: (index: number) => (el: SVGGElement | HTMLElement | null) => void
  /** Reset focus to initial index */
  resetFocus: () => void
}

/**
 * Roving tabindex hook for grid/list keyboard navigation.
 * Implements the WAI-ARIA roving tabindex pattern for composite widgets.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 *
 * @example
 * ```tsx
 * const { focusedIndex, getTabIndex, handleKeyDown, getItemRef } = useRovingFocus({
 *   itemCount: items.length,
 *   onFocusChange: (index) => scrollToItem(index)
 * })
 *
 * return (
 *   <div role="listbox">
 *     {items.map((item, index) => (
 *       <div
 *         key={item.id}
 *         ref={getItemRef(index)}
 *         tabIndex={getTabIndex(index)}
 *         onKeyDown={(e) => handleKeyDown(e, index)}
 *       >
 *         {item.name}
 *       </div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export function useRovingFocus({
  itemCount,
  columns,
  onFocusChange,
  initialIndex = 0,
  wrap = true,
}: UseRovingFocusOptions): UseRovingFocusReturn {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex)
  const itemRefs = useRef<(SVGGElement | HTMLElement | null)[]>([])

  // Update refs array size when itemCount changes
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, itemCount)
  }, [itemCount])

  // Reset focused index if it becomes invalid
  // This is a legitimate use of setState in useEffect - syncing React state with
  // external data (itemCount) to ensure focusedIndex remains valid.
  useEffect(() => {
    if (focusedIndex >= itemCount && itemCount > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with prop changes
      setFocusedIndex(itemCount - 1)
    }
  }, [focusedIndex, itemCount])

  const getTabIndex = useCallback(
    (index: number): 0 | -1 => {
      return index === focusedIndex ? 0 : -1
    },
    [focusedIndex]
  )

  const moveFocus = useCallback(
    (direction: NavigationDirection) => {
      if (itemCount === 0) return

      let newIndex = focusedIndex

      switch (direction) {
        case 'left':
          newIndex = focusedIndex - 1
          if (newIndex < 0) {
            newIndex = wrap ? itemCount - 1 : 0
          }
          break
        case 'right':
          newIndex = focusedIndex + 1
          if (newIndex >= itemCount) {
            newIndex = wrap ? 0 : itemCount - 1
          }
          break
        case 'up':
          if (columns) {
            newIndex = focusedIndex - columns
            if (newIndex < 0) {
              if (wrap) {
                // Calculate position in last row
                const lastRowStart = Math.floor((itemCount - 1) / columns) * columns
                newIndex = Math.min(lastRowStart + (focusedIndex % columns), itemCount - 1)
              } else {
                newIndex = focusedIndex
              }
            }
          }
          break
        case 'down':
          if (columns) {
            newIndex = focusedIndex + columns
            if (newIndex >= itemCount) {
              if (wrap) {
                // Wrap to first row
                newIndex = focusedIndex % columns
              } else {
                newIndex = focusedIndex
              }
            }
          }
          break
        case 'home':
          newIndex = 0
          break
        case 'end':
          newIndex = itemCount - 1
          break
      }

      // Clamp to valid range (safety check)
      newIndex = Math.max(0, Math.min(newIndex, itemCount - 1))

      if (newIndex !== focusedIndex) {
        setFocusedIndex(newIndex)
        onFocusChange?.(newIndex)
        // Focus the element
        itemRefs.current[newIndex]?.focus()
      }
    },
    [focusedIndex, itemCount, columns, wrap, onFocusChange]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, itemIndex: number) => {
      // Update focused index if clicking on a different item
      if (itemIndex !== focusedIndex) {
        setFocusedIndex(itemIndex)
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          moveFocus('left')
          break
        case 'ArrowRight':
          event.preventDefault()
          moveFocus('right')
          break
        case 'ArrowUp':
          event.preventDefault()
          moveFocus('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          moveFocus('down')
          break
        case 'Home':
          event.preventDefault()
          moveFocus('home')
          break
        case 'End':
          event.preventDefault()
          moveFocus('end')
          break
      }
    },
    [focusedIndex, moveFocus]
  )

  const getItemRef = useCallback((index: number) => {
    return (el: SVGGElement | HTMLElement | null) => {
      itemRefs.current[index] = el
    }
  }, [])

  const resetFocus = useCallback(() => {
    setFocusedIndex(initialIndex)
    itemRefs.current[initialIndex]?.focus()
  }, [initialIndex])

  return {
    focusedIndex,
    getTabIndex,
    handleKeyDown,
    setFocusedIndex,
    getItemRef,
    resetFocus,
  }
}
