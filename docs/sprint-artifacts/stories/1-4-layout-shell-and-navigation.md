# Story 1-4: Layout Shell & Navigation

**Story Key:** 1-4-layout-shell-and-navigation
**Epic:** Epic 1 - Foundation
**Status:** drafted
**Priority:** P0 - Critical Path (UI Foundation)

---

## User Story

**As a** user,
**I want** a consistent navigation header across all pages,
**So that** I can always return home and understand where I am.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-1.4.1 | Header visible on all pages | Header component renders in root layout |
| AC-1.4.2 | Site title links to home | Clicking "AI Obituaries" navigates to `/` |
| AC-1.4.3 | Navigation links present | "Home" and "About" links visible |
| AC-1.4.4 | Active link styled | Current route shows gold underline |
| AC-1.4.5 | Header is sticky | Header stays at top during scroll |
| AC-1.4.6 | Backdrop blur effect | Header has `backdrop-filter: blur()` |
| AC-1.4.7 | Title uses Instrument Serif | Logo/title renders in serif font |
| AC-1.4.8 | Mobile hamburger menu visible | On viewports < 768px (md breakpoint), navigation links hidden and hamburger icon button visible |
| AC-1.4.9 | Mobile menu interaction | Clicking hamburger opens Sheet overlay with nav links; clicking a link or outside closes Sheet |
| AC-1.4.10 | Footer present | Footer renders below main content |
| AC-1.4.11 | Footer has copyright | Copyright text visible in footer |
| AC-1.4.12 | Header height consistent | Header is 64px height |

---

## Technical Approach

### Implementation Steps

1. **Create Header component**
   - Create `src/components/layout/header.tsx` with sticky positioning
   - Apply `backdrop-filter: blur(8px)` for glassmorphism effect
   - Use Deep Archive theme colors (bg-primary with opacity, border)
   - Set fixed height of 64px (h-16)

2. **Create desktop navigation**
   - Create `src/components/layout/nav.tsx` for desktop navigation links
   - Use `next/link` for navigation
   - Implement active state detection with `usePathname()` hook
   - Style active link with gold (#C9A962) underline

3. **Create mobile navigation**
   - Install shadcn/ui Sheet component
   - Create `src/components/layout/mobile-nav.tsx` with hamburger trigger
   - Sheet slides from right with full navigation links
   - Close sheet on link click or outside click

4. **Create Footer component**
   - Create `src/components/layout/footer.tsx`
   - Include copyright text with current year
   - Optional: Add GitHub/source link

5. **Integrate into root layout**
   - Modify `src/app/layout.tsx` to include Header and Footer
   - Ensure main content area accounts for header height

### Component Structure

```tsx
// src/components/layout/header.tsx structure
<header className="sticky top-0 h-16 bg-[--bg-primary]/80 backdrop-blur-md border-b border-[--border] z-50">
  <nav className="container mx-auto px-4 h-full flex items-center justify-between">
    <Link href="/" className="font-serif text-xl text-[--text-primary]">
      AI Obituaries
    </Link>
    {/* Desktop nav - hidden on mobile */}
    <div className="hidden md:flex gap-6">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/about">About</NavLink>
    </div>
    {/* Mobile nav - visible only on mobile */}
    <MobileNav />
  </nav>
</header>
```

### NavLink Active State Pattern

```tsx
// src/components/layout/nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors',
        isActive
          ? 'text-[--accent-primary] border-b-2 border-[--accent-primary]'
          : 'text-[--text-secondary] hover:text-[--text-primary]'
      )}
    >
      {children}
    </Link>
  )
}
```

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/layout/header.tsx` | Create | Main header component with sticky positioning |
| `src/components/layout/footer.tsx` | Create | Footer component with copyright |
| `src/components/layout/nav.tsx` | Create | Desktop navigation links with active state |
| `src/components/layout/mobile-nav.tsx` | Create | Mobile Sheet navigation with hamburger |
| `src/app/layout.tsx` | Modify | Add Header and Footer to layout |
| `src/components/ui/sheet.tsx` | Add | shadcn Sheet component (via CLI) |

---

## Tasks

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Create `src/components/layout/` directory if not exists | 2 min |
| 2 | Install shadcn/ui Sheet component (`npx shadcn@latest add sheet`) | 5 min |
| 3 | Create `src/components/layout/nav.tsx` with NavLink component | 15 min |
| 4 | Create `src/components/layout/header.tsx` with sticky header | 20 min |
| 5 | Create `src/components/layout/mobile-nav.tsx` with Sheet and hamburger | 20 min |
| 6 | Create `src/components/layout/footer.tsx` with copyright | 10 min |
| 7 | Modify `src/app/layout.tsx` to include Header and Footer | 10 min |
| 8 | Test desktop navigation and active link styling | 10 min |
| 9 | Test mobile hamburger menu opens/closes correctly | 10 min |
| 10 | Verify sticky header with backdrop blur on scroll | 5 min |
| 11 | Verify header height is consistent (64px) | 5 min |
| 12 | Run `pnpm run build` and `pnpm run lint` | 5 min |

**Total Estimated Time:** ~115 minutes

---

## Dependencies

### Story Dependencies
- **Story 1-1: Project Initialization** (COMPLETE)
  - Provides: Next.js project structure, shadcn/ui setup
- **Story 1-2: Design System Setup** (COMPLETE)
  - Provides: Deep Archive theme CSS variables, font configuration (Instrument Serif, Geist)
- **Story 1-3: Sanity CMS Integration** (COMPLETE)
  - Provides: Complete data layer (not directly used but establishes project patterns)

### External Dependencies
- None for this story

### Learnings from Previous Stories to Apply

1. **Tailwind CSS v4 is CSS-first:** Use CSS variables directly (e.g., `bg-[--bg-primary]`) rather than tailwind.config.ts mappings
2. **pnpm Usage:** Continue using pnpm for all package operations including shadcn
3. **Theme variables available:** All Deep Archive colors are defined as CSS variables
4. **Font classes:** Instrument Serif available via font-serif class, Geist via font-sans
5. **Build verification:** Always run `pnpm run build` and `pnpm run lint` before marking complete

---

## Definition of Done

- [ ] All acceptance criteria (AC-1.4.1 through AC-1.4.12) verified and passing
- [ ] Header renders on all pages with site title and navigation
- [ ] Site title "AI Obituaries" links to homepage
- [ ] Desktop nav shows Home and About links
- [ ] Active navigation link shows gold underline styling
- [ ] Header is sticky (stays at top during scroll)
- [ ] Header has backdrop blur effect
- [ ] Site title uses Instrument Serif font
- [ ] Mobile hamburger menu visible below md breakpoint
- [ ] Mobile Sheet menu opens/closes correctly
- [ ] Footer renders with copyright text
- [ ] Header height is 64px (h-16)
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run lint` passes without errors

---

## Dev Agent Record

### Context Reference
`docs/sprint-artifacts/story-contexts/1-4-layout-shell-and-navigation-context.xml`

### Implementation Notes
_To be filled during implementation_

### File List
_To be filled during implementation_

### Deviations from Plan
_To be filled during implementation_

### Verification Results
_To be filled during implementation_

### Learnings for Next Story
_To be filled during implementation_

---

## Source Document References

- **Epic Reference:** [Epic 1: Foundation](../../epics.md#epic-1-foundation)
- **Tech Spec Reference:** [Epic 1 Tech Spec - Story 1.4](../epic-tech-specs/epic-1-tech-spec.md#story-14-layout-shell--navigation)
- **UX Design Reference:** [UX Design Specification - Navigation](../../ux-design-specification.md)
- **FR Coverage:**
  - FR24 - Site has clear primary navigation (Home, Timeline, Categories, About)
  - FR25 - Users can navigate to homepage from any page

---

_Story created: 2025-11-29_
_Status: drafted_
