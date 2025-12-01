import type { Category } from '@/types/obituary'

/**
 * Full category definition with metadata.
 */
export interface CategoryDefinition {
  /** Unique ID matching Sanity value */
  id: Category
  /** Human-readable label */
  label: string
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
 *   --category-capability: #C9A962
 *   --category-market: #7B9E89
 *   --category-agi: #9E7B7B
 *   --category-dismissive: #7B7B9E
 */
export const CATEGORIES: Record<Category, CategoryDefinition> = {
  capability: {
    id: 'capability',
    label: 'Capability Doubt',
    description: 'Claims AI cannot do specific tasks',
    color: '#C9A962',
    colorVar: '--category-capability',
  },
  market: {
    id: 'market',
    label: 'Market/Bubble',
    description: 'AI is overhyped or a bubble',
    color: '#7B9E89',
    colorVar: '--category-market',
  },
  agi: {
    id: 'agi',
    label: 'AGI Skepticism',
    description: 'AGI is impossible or very far away',
    color: '#9E7B7B',
    colorVar: '--category-agi',
  },
  dismissive: {
    id: 'dismissive',
    label: 'Dismissive Framing',
    description: 'Casual dismissal or mockery of AI',
    color: '#7B7B9E',
    colorVar: '--category-dismissive',
  },
} as const

/**
 * Ordered array of categories for consistent display.
 */
export const CATEGORY_ORDER: Category[] = [
  'capability',
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
 * Category color mappings using CSS variables for the Deep Archive theme.
 * Colors are defined in globals.css under :root.
 * @deprecated Use CATEGORIES[category].colorVar instead
 */
export const CATEGORY_COLORS: Record<Category, string> = {
  capability: 'bg-[--category-capability]',
  market: 'bg-[--category-market]',
  agi: 'bg-[--category-agi]',
  dismissive: 'bg-[--category-dismissive]',
}

/**
 * Human-readable labels for each category.
 * Used in UI elements like tooltips, filters, and accessibility.
 * @deprecated Use CATEGORIES[category].label or getCategoryLabel() instead
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  capability: 'Capability Doubt',
  market: 'Market/Bubble',
  agi: 'AGI Skepticism',
  dismissive: 'Dismissive Framing',
}
