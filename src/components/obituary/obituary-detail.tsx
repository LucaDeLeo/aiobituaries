import Link from 'next/link'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'
import { CATEGORY_LABELS, CATEGORY_BADGE_CLASSES } from '@/lib/constants/categories'
import { CopyButton } from '@/components/ui/copy-button'
import { sanitizeUrl } from '@/lib/utils/url'
import type { Obituary } from '@/types/obituary'

interface ObituaryDetailProps {
  obituary: Obituary
}

/**
 * Full obituary detail view component.
 * Server Component that displays the complete obituary including:
 * - Full claim text as centered hero quote
 * - Source with external link
 * - Formatted date
 * - Category badges
 * - Back navigation to homepage
 */
export function ObituaryDetail({ obituary }: ObituaryDetailProps) {
  return (
    <article>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[var(--text-secondary)]
                   hover:text-[var(--text-primary)] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to all obituaries
      </Link>

      <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl
                             text-[var(--text-primary)] italic text-center
                             leading-relaxed mb-8">
        &ldquo;{obituary.claim}&rdquo;
      </blockquote>

      <div className="flex flex-col items-center gap-4 mb-8">
        <p className="text-[var(--text-secondary)]">
          <a
            href={sanitizeUrl(obituary.sourceUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[var(--accent-primary)]
                       transition-colors underline underline-offset-4"
          >
            {obituary.source}
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </p>
        <time
          dateTime={obituary.date}
          className="text-[var(--text-muted)]"
        >
          {formatDate(obituary.date)}
        </time>
        {obituary.skeptic && (
          <Link
            href={`/skeptics/${obituary.skeptic.slug}`}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)]
                       transition-colors underline underline-offset-4"
          >
            View {obituary.skeptic.name}&apos;s profile →
          </Link>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {obituary.categories?.map((category) => (
          <span
            key={category}
            className={`px-3 py-1 rounded-full text-sm font-medium ${CATEGORY_BADGE_CLASSES[category]}`}
          >
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>

      <div className="flex justify-center">
        <CopyButton />
      </div>
    </article>
  )
}
