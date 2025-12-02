import { getObituaries } from '@/lib/sanity/queries'
import { ObituaryCard } from './obituary-card'
import type { ObituarySummary } from '@/types/obituary'

/**
 * Get animation delay class based on index for staggered entrance.
 * Uses CSS classes defined in globals.css for server-side compatible animations.
 */
function getStaggerClass(index: number): string {
  // Use modulo to cycle through 5 delay levels for visible items
  const delayLevel = (index % 6) + 1
  if (delayLevel > 5) return 'animate-fade-up'
  return `animate-fade-up animate-fade-up-delay-${delayLevel}`
}

/**
 * Obituary list component displaying a grid of obituary cards.
 * Async Server Component that fetches obituaries from Sanity CMS.
 * Renders a responsive grid: 1 column mobile, 2 tablet, 3 desktop.
 *
 * Features staggered entrance animation via CSS (prefers-reduced-motion safe).
 */
export async function ObituaryList() {
  let obituaries: ObituarySummary[]
  try {
    obituaries = await getObituaries()
  } catch {
    // Graceful fallback when Sanity fetch fails
    obituaries = []
  }

  if (obituaries.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-up">
        <p className="text-[--text-secondary] text-lg">No obituaries found.</p>
        <p className="text-[--text-muted] text-sm mt-2">
          Check back later for new entries.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {obituaries.map((obituary, index) => (
        <div key={obituary._id} className={getStaggerClass(index)}>
          <ObituaryCard obituary={obituary} />
        </div>
      ))}
    </div>
  )
}
