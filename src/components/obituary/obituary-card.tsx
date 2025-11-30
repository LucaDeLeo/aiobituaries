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
        'block p-6 rounded-xl',
        'bg-[--bg-card] border border-[--border]',
        'hover:-translate-y-0.5 hover:shadow-lg',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[--ring] focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[--bg-primary]'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn('w-2 h-2 rounded-full', categoryColorClass)}
          aria-hidden="true"
        />
        <span className="text-sm text-[--text-muted]">
          {format(new Date(obituary.date), 'MMM d, yyyy')}
        </span>
      </div>
      <p className="font-serif italic text-[--text-primary] mb-3 leading-relaxed">
        &ldquo;{truncateClaim(obituary.claim)}&rdquo;
      </p>
      <p className="text-sm text-[--text-secondary]">
        {obituary.source}
      </p>
    </Link>
  )
}
