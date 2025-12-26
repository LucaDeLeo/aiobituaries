import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDate, parseUTCDate } from '@/lib/utils/date'
import { getAllMetricsAtDate } from '@/data/ai-metrics'
import { MetricsBadge } from './metrics-badge'
import type { ObituarySummary } from '@/types/obituary'

interface SkepticClaimListProps {
  claims: ObituarySummary[]
  className?: string
}

/**
 * Truncates claim text for list display.
 */
function truncateClaim(claim: string, maxLength = 200): string {
  if (claim.length <= maxLength) return claim
  const truncated = claim.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

/**
 * Displays a list of claims (obituaries) attributed to a skeptic.
 * Each row shows the claim text, source, date on the left,
 * and AI metrics at that date on the right.
 *
 * Claims are sorted newest first (already sorted by query).
 */
export function SkepticClaimList({ claims, className }: SkepticClaimListProps) {
  if (!claims || claims.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-[var(--text-muted)]">No claims recorded yet.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {claims.map((claim) => (
        <ClaimRow key={claim._id} claim={claim} />
      ))}
    </div>
  )
}

interface ClaimRowProps {
  claim: ObituarySummary
}

function ClaimRow({ claim }: ClaimRowProps) {
  // P1.2 fix: Use parseUTCDate for consistent date parsing
  const claimDate = parseUTCDate(claim.date)
  const metrics = getAllMetricsAtDate(claimDate)

  return (
    <Link
      href={`/obituary/${claim.slug}`}
      className={cn(
        'group block rounded-lg border border-[var(--border)]',
        'bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)]',
        'hover:border-[var(--accent-primary)]/40',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[var(--bg-primary)]'
      )}
    >
      <div className="flex flex-col md:flex-row md:items-stretch">
        {/* Claim content */}
        <div className="flex-1 p-4 md:border-r md:border-[var(--border)]">
          <p className="font-serif italic text-[var(--text-primary)] mb-2 leading-relaxed group-hover:text-[var(--accent-primary)] transition-colors">
            &ldquo;{truncateClaim(claim.claim)}&rdquo;
          </p>
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span>{claim.source}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={claim.date} className="font-mono">
              {formatDate(claim.date)}
            </time>
          </div>
        </div>

        {/* Metrics sidebar */}
        <div className="px-4 py-3 md:w-36 md:flex md:items-center bg-[var(--bg-secondary)]/50 md:bg-transparent rounded-b-lg md:rounded-none">
          <MetricsBadge metrics={metrics} compact />
        </div>
      </div>
    </Link>
  )
}
