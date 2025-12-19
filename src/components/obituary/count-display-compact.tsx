export interface CountDisplayCompactProps {
  /** Obituary count to display (passed from parent to avoid duplicate fetches) */
  count: number
}

/**
 * Compact count display for desktop header.
 * Displays inline with smaller styling - no decorative elements.
 */
export function CountDisplayCompact({ count }: CountDisplayCompactProps) {
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
