/**
 * Shared navigation links for desktop and mobile nav components.
 * P1.1 fix: Centralized to prevent feature parity gaps.
 */

export interface NavLink {
  href: string
  label: string
}

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/skeptics', label: 'Skeptics' },
  { href: '/about', label: 'About' },
]
