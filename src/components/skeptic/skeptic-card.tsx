import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { SkepticSummary } from '@/types/skeptic'
import { ProfileLinks } from './profile-links'

interface SkepticCardProps {
  skeptic: SkepticSummary
}

/**
 * Truncates bio text for card display.
 */
function truncateBio(bio: string, maxLength = 120): string {
  if (bio.length <= maxLength) return bio
  const truncated = bio.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

/**
 * Skeptic card component for the index grid.
 * Displays name, claim count, truncated bio, and profile links.
 * Links to the individual skeptic detail page.
 */
export function SkepticCard({ skeptic }: SkepticCardProps) {
  return (
    <Link
      href={`/skeptics/${skeptic.slug}`}
      className={cn(
        'group relative block p-6 rounded-xl',
        'bg-[--bg-card] border border-[--border]',
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
        {/* Name and claim count */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-[--text-primary] group-hover:text-[--accent-primary] transition-colors">
            {skeptic.name}
          </h3>
          <span className="text-sm text-[--text-muted] font-mono whitespace-nowrap">
            {skeptic.claimCount} claim{skeptic.claimCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Bio */}
        <p className="text-sm text-[--text-secondary] mb-4 leading-relaxed">
          {truncateBio(skeptic.bio)}
        </p>

        {/* Profile links */}
        <ProfileLinks profiles={skeptic.profiles} />
      </div>
    </Link>
  )
}
