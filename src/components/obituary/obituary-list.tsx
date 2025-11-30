import { getObituaries } from '@/lib/sanity/queries'
import { ObituaryCard } from './obituary-card'
import type { ObituarySummary } from '@/types/obituary'

/**
 * Obituary list component displaying a grid of obituary cards.
 * Async Server Component that fetches obituaries from Sanity CMS.
 * Renders a responsive grid: 1 column mobile, 2 tablet, 3 desktop.
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
      <div className="text-center py-12">
        <p className="text-[--text-secondary] text-lg">No obituaries found.</p>
        <p className="text-[--text-muted] text-sm mt-2">
          Check back later for new entries.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {obituaries.map((obituary) => (
        <ObituaryCard key={obituary._id} obituary={obituary} />
      ))}
    </div>
  )
}
