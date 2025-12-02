import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CATEGORY_COLORS } from '@/lib/constants/categories'
import type { ObituarySummary } from '@/types/obituary'

interface ObituaryCardProps {
  obituary: ObituarySummary
}

/**
 * Truncates claim text for card display.
 * Uses character-based truncation at ~150 chars with word boundary respect.
 */
function truncateClaim(claim: string, maxLength = 150): string {
  if (claim.length <= maxLength) return claim
  // Find last space before maxLength to avoid cutting words
  const truncated = claim.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

/**
 * Obituary card component for list/grid views.
 * Server Component that displays a summary of an obituary with
 * truncated claim, source, date, and category indicator.
 * Links to the individual obituary detail page.
 *
 * Features dramatic lift effect with layered shadows on hover.
 */
export function ObituaryCard({ obituary }: ObituaryCardProps) {
  // Defensive: handle empty categories array
  const primaryCategory = obituary.categories?.[0]
  const categoryColorClass = primaryCategory
    ? CATEGORY_COLORS[primaryCategory]
    : 'bg-[--text-muted]' // fallback for missing category

  return (
    <Link
      href={`/obituary/${obituary.slug}`}
      className={cn(
        'group relative block p-6 rounded-xl',
        'bg-[--bg-card] border border-[--border]',
        // Dramatic lift and shadow on hover
        'shadow-lg shadow-black/20',
        'hover:-translate-y-1 hover:shadow-xl hover:shadow-[--accent-primary]/10',
        'hover:border-[--accent-primary]/40',
        'transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[--ring] focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[--bg-primary]'
      )}
    >
      {/* Subtle glow on hover */}
      <div className="absolute -inset-px rounded-xl bg-[--accent-primary]/0 group-hover:bg-[--accent-primary]/5 transition-colors duration-300 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          {/* Category dot with subtle glow */}
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full shadow-sm',
              categoryColorClass,
              'group-hover:shadow-md group-hover:shadow-current/30 transition-shadow'
            )}
            aria-hidden="true"
          />
          <span className="text-sm text-[--text-muted] font-mono">
            {format(new Date(obituary.date), 'MMM d, yyyy')}
          </span>
        </div>
        <p className="font-serif italic text-[--text-primary] mb-3 leading-relaxed text-lg">
          &ldquo;{truncateClaim(obituary.claim)}&rdquo;
        </p>
        <p className="text-sm text-[--text-secondary] group-hover:text-[--accent-primary] transition-colors">
          {obituary.source}
        </p>
      </div>
    </Link>
  )
}
