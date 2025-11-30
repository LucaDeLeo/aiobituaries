import type { Category } from '@/types/obituary'

/**
 * Category color mappings using CSS variables for the Deep Archive theme.
 * Colors are defined in globals.css under :root.
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
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  capability: 'Capability Doubt',
  market: 'Market/Bubble',
  agi: 'AGI Skepticism',
  dismissive: 'Dismissive Framing',
}
