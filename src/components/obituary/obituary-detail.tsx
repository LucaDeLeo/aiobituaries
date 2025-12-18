import Link from 'next/link'
import { format } from 'date-fns'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/constants/categories'
import { CopyButton } from '@/components/ui/copy-button'
import { sanitizeUrl } from '@/lib/utils/url'
import type { Obituary, Category } from '@/types/obituary'

/**
 * Badge color mappings with semi-transparent background and solid text.
 * Uses /20 opacity modifier for background with full opacity text.
 */
const BADGE_COLORS: Record<Category, string> = {
  capability: 'bg-[--category-capability]/20 text-[--category-capability]',
  market: 'bg-[--category-market]/20 text-[--category-market]',
  agi: 'bg-[--category-agi]/20 text-[--category-agi]',
  dismissive: 'bg-[--category-dismissive]/20 text-[--category-dismissive]',
}

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
        className="inline-flex items-center gap-2 text-[--text-secondary]
                   hover:text-[--text-primary] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to all obituaries
      </Link>

      <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl
                             text-[--text-primary] italic text-center
                             leading-relaxed mb-8">
        &ldquo;{obituary.claim}&rdquo;
      </blockquote>

      <div className="flex flex-col items-center gap-4 mb-8">
        <p className="text-[--text-secondary]">
          <a
            href={sanitizeUrl(obituary.sourceUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[--accent-primary]
                       transition-colors underline underline-offset-4"
          >
            {obituary.source}
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </p>
        <time
          dateTime={obituary.date}
          className="text-[--text-muted]"
        >
          {format(new Date(obituary.date), 'MMMM d, yyyy')}
        </time>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {obituary.categories?.map((category) => (
          <span
            key={category}
            className={`px-3 py-1 rounded-full text-sm font-medium ${BADGE_COLORS[category]}`}
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
