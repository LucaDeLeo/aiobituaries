'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'text-sm font-medium transition-colors pb-1',
        isActive
          ? 'text-[--accent-primary] border-b-2 border-[--accent-primary]'
          : 'text-[--text-secondary] hover:text-[--text-primary]'
      )}
    >
      {children}
    </Link>
  )
}

export function Nav() {
  return (
    <>
      {NAV_LINKS.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {link.label}
        </NavLink>
      ))}
    </>
  )
}
