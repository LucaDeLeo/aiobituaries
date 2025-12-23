import type { Metadata } from 'next'
import { getSkeptics } from '@/lib/sanity/queries'
import { SkepticCard } from '@/components/skeptic/skeptic-card'

export const metadata: Metadata = {
  title: 'Notable AI Skeptics | AI Obituaries',
  description:
    'Track record of notable AI skeptics and their predictions about AI limitations over time.',
  openGraph: {
    title: 'Notable AI Skeptics | AI Obituaries',
    description:
      'Track record of notable AI skeptics and their predictions about AI limitations.',
    type: 'website',
  },
}

/**
 * Skeptics index page.
 * Displays a grid of notable AI skeptics with their claim counts.
 * Each card links to the individual skeptic detail page.
 */
export default async function SkepticsPage() {
  const skeptics = await getSkeptics()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
          Notable AI Skeptics
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
          Tracking predictions about AI&apos;s limitations against actual
          progress. Click any skeptic to see their claims alongside the AI
          capabilities at the time.
        </p>
      </div>

      {/* Skeptics grid */}
      {skeptics.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {skeptics.map((skeptic) => (
            <SkepticCard key={skeptic._id} skeptic={skeptic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[var(--text-muted)]">No skeptics added yet.</p>
        </div>
      )}
    </div>
  )
}
