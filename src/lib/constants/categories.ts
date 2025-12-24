import type { Category } from '@/types/obituary'

/**
 * Full category definition with metadata.
 */
export interface CategoryDefinition {
  /** Unique ID matching Sanity value */
  id: Category
  /** Human-readable label */
  label: string
  /** Short label for mobile (max ~10 chars) */
  shortLabel: string
  /** Short description for tooltips */
  description: string
  /** Hex color value (matches CSS variable) */
  color: string
  /** CSS variable name for color */
  colorVar: string
}

/**
 * Complete category definitions.
 *
 * IMPORTANT: Colors must match CSS variables in globals.css:
 *   --category-capability-narrow: #C9A962
 *   --category-capability-reasoning: #D4B896
 *   --category-capability: #C9A962 (legacy, maps to capability-narrow)
 *   --category-market: #7B9E89
 *   --category-agi: #9E7B7B
 *   --category-dismissive: #7B7B9E
 */
export const CATEGORIES: Record<Category, CategoryDefinition> = {
  'capability-narrow': {
    id: 'capability-narrow',
    label: 'Task Skepticism',
    shortLabel: 'Task',
    description: 'Claims AI cannot perform specific tasks',
    color: '#C9A962',
    colorVar: '--category-capability-narrow',
  },
  'capability-reasoning': {
    id: 'capability-reasoning',
    label: 'Intelligence Skepticism',
    shortLabel: 'Intel',
    description: 'Claims about AI reasoning/understanding limits',
    color: '#D4B896',
    colorVar: '--category-capability-reasoning',
  },
  capability: {
    id: 'capability',
    label: 'Capability Doubt',
    shortLabel: 'Capability',
    description: 'Claims AI cannot do specific tasks (legacy)',
    color: '#C9A962',
    colorVar: '--category-capability',
  },
  market: {
    id: 'market',
    label: 'Market/Bubble',
    shortLabel: 'Market',
    description: 'AI is overhyped or a bubble',
    color: '#7B9E89',
    colorVar: '--category-market',
  },
  agi: {
    id: 'agi',
    label: 'AGI Skepticism',
    shortLabel: 'AGI',
    description: 'AGI is impossible or very far away',
    color: '#9E7B7B',
    colorVar: '--category-agi',
  },
  dismissive: {
    id: 'dismissive',
    label: 'Dismissive Framing',
    shortLabel: 'Dismiss',
    description: 'Casual dismissal or mockery of AI',
    color: '#7B7B9E',
    colorVar: '--category-dismissive',
  },
} as const

/**
 * Ordered array of categories for consistent display.
 * Note: Legacy 'capability' is excluded from display order - use new categories.
 */
export const CATEGORY_ORDER: Category[] = [
  'capability-narrow',
  'capability-reasoning',
  'market',
  'agi',
  'dismissive',
]

/**
 * All valid categories including legacy for backwards compatibility.
 */
export const ALL_CATEGORIES: Category[] = [
  'capability-narrow',
  'capability-reasoning',
  'capability', // Legacy
  'market',
  'agi',
  'dismissive',
]

/**
 * Get category definition by ID.
 * @param id - The category ID
 * @returns The full CategoryDefinition object
 */
export function getCategory(id: Category): CategoryDefinition {
  return CATEGORIES[id]
}

/**
 * Get category color by ID.
 * @param id - The category ID
 * @returns Hex color string (e.g., '#C9A962')
 */
export function getCategoryColor(id: Category): string {
  return CATEGORIES[id].color
}

/**
 * Get category label by ID.
 * @param id - The category ID
 * @returns Human-readable label (e.g., 'Capability Doubt')
 */
export function getCategoryLabel(id: Category): string {
  return CATEGORIES[id].label
}

/**
 * Get short category label by ID (for mobile).
 * @param id - The category ID
 * @returns Short label (e.g., 'Task')
 */
export function getCategoryShortLabel(id: Category): string {
  return CATEGORIES[id].shortLabel
}

/**
 * Get all categories as an ordered array.
 * @returns Array of CategoryDefinition objects in display order
 */
export function getAllCategories(): CategoryDefinition[] {
  return CATEGORY_ORDER.map((id) => CATEGORIES[id])
}

/**
 * Check if a value is a valid category.
 * @param value - The string to check
 * @returns True if value is a valid Category, false otherwise
 */
export function isValidCategory(value: string): value is Category {
  return value in CATEGORIES
}

/**
 * Static Tailwind CSS class mappings (required for JIT - cannot use dynamic strings).
 * Note: These MUST be explicit strings, not computed, for Tailwind to find them.
 */

/**
 * Category background classes using CSS variables.
 * Use for category indicator dots.
 */
export const CATEGORY_BG_CLASSES: Record<Category, string> = {
  'capability-narrow': 'bg-[var(--category-capability-narrow)]',
  'capability-reasoning': 'bg-[var(--category-capability-reasoning)]',
  capability: 'bg-[var(--category-capability)]',
  market: 'bg-[var(--category-market)]',
  agi: 'bg-[var(--category-agi)]',
  dismissive: 'bg-[var(--category-dismissive)]',
} as const

/**
 * Category badge classes (semi-transparent bg + solid text).
 * Use for category badges/pills.
 */
export const CATEGORY_BADGE_CLASSES: Record<Category, string> = {
  'capability-narrow': 'bg-[var(--category-capability-narrow)]/20 text-[var(--category-capability-narrow)]',
  'capability-reasoning': 'bg-[var(--category-capability-reasoning)]/20 text-[var(--category-capability-reasoning)]',
  capability: 'bg-[var(--category-capability)]/20 text-[var(--category-capability)]',
  market: 'bg-[var(--category-market)]/20 text-[var(--category-market)]',
  agi: 'bg-[var(--category-agi)]/20 text-[var(--category-agi)]',
  dismissive: 'bg-[var(--category-dismissive)]/20 text-[var(--category-dismissive)]',
} as const

/**
 * Human-readable labels for each category.
 * Derived from CATEGORIES for convenience.
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  'capability-narrow': CATEGORIES['capability-narrow'].label,
  'capability-reasoning': CATEGORIES['capability-reasoning'].label,
  capability: CATEGORIES.capability.label,
  market: CATEGORIES.market.label,
  agi: CATEGORIES.agi.label,
  dismissive: CATEGORIES.dismissive.label,
} as const

/**
 * Normalize legacy category to new category system.
 * Maps 'capability' to 'capability-narrow' for backwards compatibility.
 * @param category - Category to normalize
 * @returns Normalized category (legacy 'capability' becomes 'capability-narrow')
 */
export function normalizeCategory(category: Category): Category {
  return category === 'capability' ? 'capability-narrow' : category
}

/**
 * Normalize an array of categories, mapping legacy to new.
 * @param categories - Array of categories
 * @returns Array with legacy categories normalized
 */
export function normalizeCategories(categories: Category[]): Category[] {
  return categories.map(normalizeCategory)
}
