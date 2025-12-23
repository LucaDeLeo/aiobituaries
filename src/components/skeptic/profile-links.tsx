'use client'

import { cn } from '@/lib/utils'
import type { SkepticProfile } from '@/types/skeptic'

interface ProfileLinksProps {
  profiles?: SkepticProfile[] | null
  className?: string
}

/**
 * Maps platform names to display labels and icons.
 */
const platformConfig: Record<string, { label: string; icon: string }> = {
  twitter: { label: 'Twitter/X', icon: '𝕏' },
  substack: { label: 'Substack', icon: '◉' },
  website: { label: 'Website', icon: '🌐' },
  linkedin: { label: 'LinkedIn', icon: 'in' },
  wikipedia: { label: 'Wikipedia', icon: 'W' },
}

/**
 * Displays a row of profile link icons/badges.
 * Each link opens in a new tab to prevent navigation away from the skeptic page.
 */
export function ProfileLinks({ profiles, className }: ProfileLinksProps) {
  if (!profiles || profiles.length === 0) return null

  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {profiles.map((profile) => {
        const config = platformConfig[profile.platform] || {
          label: profile.platform,
          icon: '🔗',
        }

        return (
          <a
            key={`${profile.platform}-${profile.url}`}
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-md',
              'text-xs font-medium',
              'bg-[var(--bg-secondary)] text-[var(--text-muted)]',
              'hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]',
              'transition-colors duration-150'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <span aria-hidden="true">{config.icon}</span>
            <span className="sr-only">{config.label}</span>
          </a>
        )
      })}
    </div>
  )
}

/**
 * Larger profile links for the skeptic detail page header.
 */
export function ProfileLinksLarge({ profiles, className }: ProfileLinksProps) {
  if (!profiles || profiles.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {profiles.map((profile) => {
        const config = platformConfig[profile.platform] || {
          label: profile.platform,
          icon: '🔗',
        }

        return (
          <a
            key={`${profile.platform}-${profile.url}`}
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
              'text-sm font-medium',
              'bg-[var(--bg-secondary)] text-[var(--text-secondary)]',
              'hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-primary)]',
              'border border-[var(--border)]',
              'transition-colors duration-150'
            )}
          >
            <span aria-hidden="true">{config.icon}</span>
            <span>{config.label}</span>
          </a>
        )
      })}
    </div>
  )
}
