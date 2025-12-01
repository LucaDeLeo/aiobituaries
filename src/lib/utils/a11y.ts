/**
 * Accessibility utility functions for keyboard navigation and focus management.
 */

/**
 * Handle common keyboard interactions with standard handlers.
 * Only calls preventDefault when a handler is provided to avoid breaking default browser behavior.
 *
 * @param event - React keyboard event
 * @param handlers - Object with optional keyboard event handlers
 *
 * @example
 * ```tsx
 * handleKeyboardNavigation(event, {
 *   onEnter: () => selectItem(),
 *   onEscape: () => closeModal(),
 *   onArrowDown: () => moveDown()
 * })
 * ```
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  handlers: {
    onEnter?: () => void
    onSpace?: () => void
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    onHome?: () => void
    onEnd?: () => void
    onTab?: () => void
  }
): void {
  const { key } = event

  switch (key) {
    case 'Enter':
      if (handlers.onEnter) {
        event.preventDefault()
        handlers.onEnter()
      }
      break
    case ' ':
      if (handlers.onSpace) {
        event.preventDefault()
        handlers.onSpace()
      }
      break
    case 'Escape':
      if (handlers.onEscape) {
        event.preventDefault()
        handlers.onEscape()
      }
      break
    case 'ArrowUp':
      if (handlers.onArrowUp) {
        event.preventDefault()
        handlers.onArrowUp()
      }
      break
    case 'ArrowDown':
      if (handlers.onArrowDown) {
        event.preventDefault()
        handlers.onArrowDown()
      }
      break
    case 'ArrowLeft':
      if (handlers.onArrowLeft) {
        event.preventDefault()
        handlers.onArrowLeft()
      }
      break
    case 'ArrowRight':
      if (handlers.onArrowRight) {
        event.preventDefault()
        handlers.onArrowRight()
      }
      break
    case 'Home':
      if (handlers.onHome) {
        event.preventDefault()
        handlers.onHome()
      }
      break
    case 'End':
      if (handlers.onEnd) {
        event.preventDefault()
        handlers.onEnd()
      }
      break
    case 'Tab':
      if (handlers.onTab) {
        // Don't preventDefault for Tab to maintain natural tab order
        handlers.onTab()
      }
      break
  }
}

/**
 * Generate unique ID for ARIA relationships (aria-labelledby, aria-describedby, etc.).
 * Uses incrementing counter to ensure uniqueness within the session.
 *
 * @param prefix - String prefix for the ID (default: 'a11y')
 * @returns Unique ID string
 *
 * @example
 * ```tsx
 * const labelId = generateId('label') // 'label-1'
 * const descId = generateId('desc')   // 'desc-2'
 * ```
 */
let idCounter = 0
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Check if an element is visible and focusable via keyboard.
 * Validates element type, visibility, and focusability attributes.
 *
 * @param element - DOM element to check
 * @returns true if element is focusable, false otherwise
 *
 * @example
 * ```tsx
 * const button = document.querySelector('button')
 * if (isFocusable(button)) {
 *   button.focus()
 * }
 * ```
 */
export function isFocusable(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false

  // Check if hidden via attribute
  if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
    return false
  }

  // Check computed style
  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false
  }

  // Check tabindex
  const tabindex = element.getAttribute('tabindex')
  if (tabindex && parseInt(tabindex) < 0) {
    return false
  }

  // Check if inherently focusable
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']
  if (focusableTags.includes(element.tagName)) {
    return !(element as HTMLButtonElement | HTMLInputElement).disabled
  }

  // Check for explicit tabindex
  return tabindex !== null
}

/**
 * Get all focusable elements within a container.
 * Returns only visible, enabled elements that can receive keyboard focus.
 *
 * @param container - Parent element to search within
 * @returns Array of focusable HTML elements
 *
 * @example
 * ```tsx
 * const modal = document.querySelector('[role="dialog"]')
 * const focusableElements = getFocusableElements(modal)
 * focusableElements[0].focus() // Focus first element
 * ```
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ].join(',')

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    isFocusable
  )
}
