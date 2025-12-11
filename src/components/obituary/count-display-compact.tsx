import { getObituaryCount } from '@/lib/sanity/queries'

/**
 * Compact count display for desktop header.
 * Async Server Component that fetches obituary count from Sanity.
 * Displays inline with smaller styling - no decorative elements.
 */
export async function CountDisplayCompact() {
  let count: number
  try {
    count = await getObituaryCount()
  } catch {
    count = 0
  }
  const formattedCount = new Intl.NumberFormat('en-US').format(count)

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{count} AI Obituaries</span>
      <span
        aria-hidden="true"
        className="font-mono text-2xl text-primary font-semibold tracking-tight"
      >
        {formattedCount}
      </span>
      <span
        aria-hidden="true"
        className="text-sm text-muted-foreground uppercase tracking-wider"
      >
        Obituaries
      </span>
    </div>
  )
}
