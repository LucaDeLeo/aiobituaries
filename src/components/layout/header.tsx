import Link from 'next/link'
import { Nav } from './nav'
import { MobileNav } from './mobile-nav'

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      {/* Gradient fade background for editorial feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)]/95 to-transparent pointer-events-none" />

      {/* Top decorative border with gold accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/30 to-transparent" />

      <nav className="relative container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Masthead logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
        >
          {/* Decorative corner flourish */}
          <span className="hidden sm:block text-[var(--accent-primary)]/40 text-lg" aria-hidden="true">
            ✦
          </span>
          <span className="font-serif text-xl sm:text-2xl tracking-wide">
            AI Obituaries
          </span>
          <span className="hidden sm:block text-[var(--accent-primary)]/40 text-lg" aria-hidden="true">
            ✦
          </span>
        </Link>

        {/* Desktop nav - hidden on mobile */}
        <div className="hidden md:flex gap-8">
          <Nav />
        </div>

        {/* Mobile nav - visible only on mobile */}
        <div className="flex md:hidden">
          <MobileNav />
        </div>
      </nav>

      {/* Bottom decorative border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
    </header>
  )
}
