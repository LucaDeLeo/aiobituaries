'use client'

import { useRouter } from 'next/navigation'
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
 * Navigates to the individual skeptic detail page on click.
 * Uses div + onClick instead of Link to avoid nested <a> tags with ProfileLinks.
 */
export function SkepticCard({ skeptic }: SkepticCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/skeptics/${skeptic.slug}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/skeptics/${skeptic.slug}`)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative block p-6 rounded-xl cursor-pointer',
        'bg-[var(--bg-card)] border border-[var(--border)]',
        'shadow-lg shadow-black/20',
        'hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--accent-primary)]/10',
        'hover:border-[var(--accent-primary)]/40',
        'transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[var(--bg-primary)]'
      )}
    >
      {/* Subtle glow on hover */}
      <div className="absolute -inset-px rounded-xl bg-[var(--accent-primary)]/0 group-hover:bg-[var(--accent-primary)]/5 transition-colors duration-300 pointer-events-none" />

      <div className="relative">
        {/* Name and claim count */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
            {skeptic.name}
          </h3>
          <span className="text-sm text-[var(--text-muted)] font-mono whitespace-nowrap">
            {skeptic.claimCount} claim{skeptic.claimCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Bio */}
        <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
          {truncateBio(skeptic.bio)}
        </p>

        {/* Profile links */}
        <ProfileLinks profiles={skeptic.profiles} />
      </div>
    </div>
  )
}
