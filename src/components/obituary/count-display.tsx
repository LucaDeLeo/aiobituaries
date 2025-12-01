import { getObituaryCount } from '@/lib/sanity/queries'
import { VisuallyHidden } from '@/components/accessibility/visually-hidden'

/**
 * Hero count display component.
 * Server Component that fetches obituary count from Sanity and displays it
 * prominently with gold styling and pulsing glow animation.
 *
 * Features:
 * - Geist Mono font for the number
 * - Responsive sizing (4rem on desktop, scales down on mobile)
 * - Gold accent color (#C9A962)
 * - Pulsing glow animation (disabled with prefers-reduced-motion)
 * - Locale-aware number formatting with commas
 * - Graceful fallback on fetch errors
 * - Screen reader accessible with descriptive label
 */
export async function CountDisplay() {
  let count: number
  try {
    count = await getObituaryCount()
  } catch {
    // Graceful fallback when Sanity fetch fails
    count = 0
  }
  const formattedCount = new Intl.NumberFormat('en-US').format(count)

  return (
    <div
      className="text-center"
      role="status"
      aria-label={`${count} AI obituaries documented`}
    >
      {/* Screen reader friendly full description */}
      <VisuallyHidden>{count} AI obituaries documented</VisuallyHidden>
      {/* Visual presentation (aria-hidden to avoid duplicate announcement) */}
      <span
        aria-hidden="true"
        className="font-mono text-3xl md:text-4xl lg:text-5xl text-[--accent-primary]
                   animate-pulse-glow motion-reduce:animate-none"
      >
        {formattedCount}
      </span>
      <p aria-hidden="true" className="text-[--text-secondary] mt-2 text-lg">
        obituaries
      </p>
    </div>
  )
}
