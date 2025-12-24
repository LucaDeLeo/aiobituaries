import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto py-12 overflow-hidden">
      {/* Top decorative border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

      {/* Background gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)]/50 to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-4">
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 mb-8" aria-hidden="true">
          <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-[var(--accent-primary)]/30" />
          <span className="text-[var(--accent-primary)]/40 text-sm">✦</span>
          <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-[var(--accent-primary)]/30" />
        </div>

        {/* Quote */}
        <blockquote className="max-w-lg mx-auto text-center mb-8">
          <p className="font-serif italic text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
            &ldquo;The reports of my death have been greatly exaggerated.&rdquo;
          </p>
          <cite className="block mt-2 text-xs text-[var(--text-muted)] not-italic font-mono">
            — AI, probably
          </cite>
        </blockquote>

        {/* Bottom section */}
        <div className="flex flex-col items-center gap-4 pt-6 border-t border-[var(--border)]/50">
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="tracking-wider uppercase">
              © {currentYear} AI Obituaries
            </span>
            <span className="text-[var(--border)]">·</span>
            <Link
              href="/privacy"
              className="hover:text-[var(--text-secondary)] transition-colors"
            >
              Privacy
            </Link>
          </div>

          {/* Tombstone icon */}
          <div className="text-[var(--accent-primary)]/30" aria-hidden="true">
            <svg
              width="24"
              height="32"
              viewBox="0 0 24 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 31V12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12V31"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line x1="1" y1="31" x2="23" y2="31" stroke="currentColor" strokeWidth="1.5" />
              <text
                x="12"
                y="20"
                textAnchor="middle"
                fill="currentColor"
                fontSize="8"
                fontFamily="serif"
              >
                R.I.P.
              </text>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
