import { getObituaryCount } from '@/lib/sanity/queries'

/**
 * Hero count display component.
 * Server Component that fetches obituary count from Sanity and displays it
 * prominently with gold styling and pulsing glow animation.
 *
 * Features:
 * - Massive, dramatic number display (dominates viewport)
 * - Geist Mono font for the number with tight tracking
 * - Editorial "OBITUARIES" label with wide letter spacing
 * - Gold accent color (#C9A962) with enhanced glow
 * - Decorative horizontal rules for archival aesthetic
 * - Responsive sizing scaling from mobile to large desktop
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
    <div className="text-center relative">
      {/* Decorative top line */}
      <div className="flex items-center justify-center gap-4 mb-6" aria-hidden="true">
        <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-[--accent-primary]/50" />
        <div className="w-1.5 h-1.5 rotate-45 border border-[--accent-primary]/50" />
        <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-[--accent-primary]/50" />
      </div>

      {/* Main h1 heading - MASSIVE number */}
      <h1 className="relative">
        <span className="sr-only">{count} AI Obituaries</span>

        {/* The giant number */}
        <span
          aria-hidden="true"
          className="block font-mono text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[14rem]
                     text-[--accent-primary] animate-pulse-glow motion-reduce:animate-none
                     tracking-tighter leading-none"
        >
          {formattedCount}
        </span>

        {/* Editorial label with wide tracking */}
        <span
          aria-hidden="true"
          className="block mt-2 md:mt-4 text-sm sm:text-base md:text-xl lg:text-2xl
                     tracking-[0.25em] md:tracking-[0.35em] uppercase
                     text-[--text-secondary] font-sans font-light"
        >
          Obituaries
        </span>
      </h1>

      {/* Decorative bottom line */}
      <div className="flex items-center justify-center gap-4 mt-6" aria-hidden="true">
        <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-[--accent-primary]/50" />
        <div className="w-1.5 h-1.5 rotate-45 border border-[--accent-primary]/50" />
        <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-[--accent-primary]/50" />
      </div>

      {/* Tagline */}
      <p className="mt-6 md:mt-8 text-xs md:text-sm text-[--text-muted] font-serif italic max-w-md mx-auto">
        A memorial to the ever-dying predictions of AI doom
      </p>
    </div>
  )
}
