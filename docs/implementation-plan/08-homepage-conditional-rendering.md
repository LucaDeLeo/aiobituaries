# Step 08: Homepage Conditional Rendering

## Objective
Replace CSS-based hiding with true conditional rendering to prevent double-mounting of mobile and desktop component trees.

## Problem
- `src/app/page.tsx` renders BOTH mobile and desktop trees
- One is hidden via `lg:hidden` / `hidden lg:block`
- Both trees mount, run hooks (nuqs, localStorage, Visx), consume resources
- Potential for state conflicts between the two mounted trees

## Solution
Create a `ClientLayoutRouter` component that uses `useBreakpoint` to conditionally render only one tree.

## Files to Create

### 1. src/components/layout/client-layout-router.tsx (NEW)

```typescript
'use client'

import { Suspense, type ReactNode } from 'react'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'

interface ClientLayoutRouterProps {
  /** Content to render on mobile/tablet (< 1024px) */
  mobile: ReactNode
  /** Content to render on desktop (>= 1024px) */
  desktop: ReactNode
  /** Fallback while detecting breakpoint */
  fallback?: ReactNode
}

/**
 * Conditionally renders mobile or desktop content based on viewport width.
 * Prevents double-mounting of heavy component trees.
 *
 * Uses useBreakpoint hook which returns 'mobile' | 'tablet' | 'desktop'.
 * Only ONE tree is mounted at a time, preventing duplicate hooks and state.
 */
export function ClientLayoutRouter({
  mobile,
  desktop,
  fallback = null,
}: ClientLayoutRouterProps) {
  const breakpoint = useBreakpoint()

  // During SSR/hydration, breakpoint may be undefined briefly
  // Show fallback or desktop (most common for initial page load)
  if (!breakpoint) {
    return <>{fallback}</>;
  }

  // Desktop: lg breakpoint (1024px+)
  if (breakpoint === 'desktop') {
    return <>{desktop}</>;
  }

  // Mobile and Tablet: below lg breakpoint
  return <>{mobile}</>;
}
```

## Files to Modify

### 2. src/app/page.tsx

**Rewrite to use ClientLayoutRouter:**

**Before:**
```typescript
export default async function Home() {
  const obituaries = await getObituaries();

  return (
    <>
      <JsonLd type="website" />

      {/* Mobile/Tablet: Keep existing hybrid view */}
      <div className="lg:hidden">
        {/* ... mobile content ... */}
      </div>

      {/* Desktop (>=1024px): New grid layout */}
      <div className="hidden lg:block">
        {/* ... desktop content ... */}
      </div>
    </>
  );
}
```

**After:**
```typescript
import { ClientLayoutRouter } from '@/components/layout/client-layout-router'

export default async function Home() {
  const obituaries = await getObituaries();

  const mobileContent = (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col items-center justify-center py-12 md:py-24 px-4">
        <CountDisplay />
      </section>

      {/* Tablet: Full-width chart */}
      <div className="hidden md:block flex-1">
        <Suspense fallback={null}>
          <HomeClient obituaries={obituaries} />
        </Suspense>
        <section className="px-4 pb-24 max-w-7xl mx-auto">
          <ObituaryList />
        </section>
      </div>

      {/* Mobile: Hybrid view */}
      <div className="md:hidden flex-1 flex flex-col min-h-0">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          <MobileTimeline obituaries={obituaries} />
        </Suspense>
      </div>

      {/* Control sheet for tablet/mobile */}
      <ControlSheet totalCount={obituaries.length} />
    </main>
  )

  const desktopContent = (
    <main className="flex flex-col min-h-screen">
      <header className="flex items-center px-6 py-4 border-b border-border" aria-label="Dashboard header">
        <CountDisplayCompact />
      </header>

      <div className="grid grid-cols-[1fr_320px] flex-1 min-h-[500px] gap-0">
        <Suspense fallback={null}>
          <HomePageClient obituaries={obituaries} />
        </Suspense>
      </div>
    </main>
  )

  return (
    <>
      <JsonLd type="website" />
      <ClientLayoutRouter
        mobile={mobileContent}
        desktop={desktopContent}
        fallback={desktopContent}
      />
    </>
  );
}
```

## Handling Hydration

The `useBreakpoint` hook needs to handle SSR gracefully:

### 3. src/lib/hooks/use-breakpoint.ts

**Verify it handles SSR:**
The hook should return `undefined` or a default during SSR, then update on client.

If not already implemented, update to:
```typescript
const [breakpoint, setBreakpoint] = useState<Breakpoint | undefined>(undefined)

useEffect(() => {
  // Only run on client
  const updateBreakpoint = () => {
    const width = window.innerWidth
    if (width >= 1024) setBreakpoint('desktop')
    else if (width >= 768) setBreakpoint('tablet')
    else setBreakpoint('mobile')
  }

  updateBreakpoint()
  window.addEventListener('resize', updateBreakpoint)
  return () => window.removeEventListener('resize', updateBreakpoint)
}, [])
```

## Acceptance Criteria

- [ ] `ClientLayoutRouter` component created
- [ ] Only ONE tree rendered (mobile OR desktop)
- [ ] Hooks in hidden tree no longer run
- [ ] No flash of wrong content on load
- [ ] Resize between mobile/desktop switches content
- [ ] Build passes
- [ ] E2E tests pass

## Test Commands
```bash
bun run build
bun test:e2e
```

## Manual Testing
1. Load homepage on desktop - verify desktop layout renders
2. Resize to mobile - verify mobile layout renders
3. Check React DevTools - only one tree should be mounted
4. Verify no console errors during resize

## Notes
- Using fallback={desktopContent} for SSR since most users are desktop
- Mobile-first could use fallback={mobileContent} instead
- The slight flash during hydration is acceptable trade-off for performance gain
