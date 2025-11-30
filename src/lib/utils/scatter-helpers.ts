import type { Category } from '@/types/obituary'

/**
 * Category colors as hex values for SVG fill.
 * These match the CSS variables defined in globals.css.
 */
export const CATEGORY_HEX_COLORS: Record<Category, string> = {
  capability: '#C9A962', // Gold
  market: '#7B9E89', // Sage
  agi: '#9E7B7B', // Rose
  dismissive: '#7B7B9E', // Lavender
}

/**
 * Deterministic jitter algorithm.
 * Produces consistent Y position for same ID (reproducible across renders).
 *
 * @param id - Unique identifier (obituary._id)
 * @returns Number between 0 and 1 for Y-axis scaling
 */
export function hashToJitter(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0 // Convert to 32-bit integer
  }
  return (Math.abs(hash) % 100) / 100
}

/**
 * Get color for obituary based on primary category.
 * Uses first category in array.
 *
 * @param categories - Array of categories
 * @returns Hex color string
 */
export function getCategoryColor(categories: Category[]): string {
  const primary = categories[0] || 'capability'
  return CATEGORY_HEX_COLORS[primary]
}
