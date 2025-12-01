'use client'

import { useRef, useCallback, useEffect } from 'react'
import { getFocusableElements } from '@/lib/utils/a11y'

export interface UseFocusTrapOptions {
  /** Callback when Escape is pressed */
  onEscape?: () => void
  /** Whether trap is currently active */
  isActive?: boolean
}

/**
 * Focus trap hook for keyboard navigation within modals and dialogs.
 * Traps Tab/Shift+Tab within container and handles Escape to close.
 *
 * @param options - Configuration options
 * @returns Object with trapRef to attach to container element
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const { trapRef } = useFocusTrap({
 *     isActive: isOpen,
 *     onEscape: onClose
 *   })
 *
 *   return (
 *     <div ref={trapRef} role="dialog">
 *       <button>First</button>
 *       <button>Last</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useFocusTrap({
  onEscape,
  isActive = false,
}: UseFocusTrapOptions = {}) {
  const trapRef = useRef<HTMLElement>(null)
  const triggerElementRef = useRef<HTMLElement | null>(null)
  const isActiveRef = useRef(isActive)

  // Keep isActiveRef in sync with isActive prop
  useEffect(() => {
    isActiveRef.current = isActive
  }, [isActive])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActiveRef.current || !trapRef.current) return

      // Handle Escape
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }

      // Handle Tab
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(trapRef.current)
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          // Shift+Tab: wrap from first to last
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab: wrap from last to first
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    },
    [onEscape]
  )

  const activate = useCallback(() => {
    // Store trigger element for focus return
    triggerElementRef.current = document.activeElement as HTMLElement

    // Focus first element
    if (trapRef.current) {
      const focusableElements = getFocusableElements(trapRef.current)
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const deactivate = useCallback(() => {
    // Remove event listener
    document.removeEventListener('keydown', handleKeyDown)

    // Return focus to trigger element
    triggerElementRef.current?.focus()
    triggerElementRef.current = null
  }, [handleKeyDown])

  // Auto activate/deactivate based on isActive prop
  useEffect(() => {
    if (isActive) {
      activate()
    } else {
      deactivate()
    }

    return () => {
      deactivate()
    }
  }, [isActive, activate, deactivate])

  return {
    trapRef,
    activate,
    deactivate,
  }
}
