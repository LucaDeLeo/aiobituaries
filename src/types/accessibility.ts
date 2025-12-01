/**
 * Accessibility type definitions for keyboard navigation and screen reader support.
 * Created for Story 6-2 (Timeline Keyboard Access).
 */

/**
 * Navigation directions for keyboard navigation patterns.
 * Used by useRovingFocus and other keyboard navigation hooks.
 */
export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'home' | 'end'

/**
 * State interface for roving tabindex pattern.
 * Tracks current focus position within a group of items.
 */
export interface RovingFocusState {
  /** Currently focused item index */
  focusedIndex: number
  /** Total number of navigable items */
  itemCount: number
  /** Grid columns for 2D navigation (optional) */
  columns?: number
}

/**
 * Screen reader announcement configuration.
 * Used for aria-live region updates.
 */
export interface Announcement {
  /** Unique identifier for the announcement */
  id: string
  /** Message text to announce */
  message: string
  /** Politeness level for aria-live */
  politeness: 'polite' | 'assertive' | 'off'
  /** Optional delay in milliseconds before announcement */
  delay?: number
}

/**
 * Props for components with keyboard focus capability.
 * Extends native HTML attributes with accessibility enhancements.
 */
export interface KeyboardFocusableProps {
  /** Tab index for roving tabindex pattern (0 = focusable, -1 = programmatically focusable) */
  tabIndex: 0 | -1
  /** Whether this item currently has keyboard focus */
  isFocused: boolean
  /** Handler for keyboard events */
  onKeyDown: (event: React.KeyboardEvent) => void
  /** Handler for focus events */
  onFocus: () => void
}
