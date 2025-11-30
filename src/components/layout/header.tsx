import Link from 'next/link'
import { Nav } from './nav'
import { MobileNav } from './mobile-nav'

export function Header() {
  return (
    <header className="sticky top-0 h-16 bg-[--bg-primary]/80 backdrop-blur-md border-b border-[--border] z-50">
      <nav className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="font-serif text-xl text-[--text-primary]">
          AI Obituaries
        </Link>
        {/* Desktop nav - hidden on mobile */}
        <div className="hidden md:flex gap-6">
          <Nav />
        </div>
        {/* Mobile nav - visible only on mobile */}
        <div className="flex md:hidden">
          <MobileNav />
        </div>
      </nav>
    </header>
  )
}
