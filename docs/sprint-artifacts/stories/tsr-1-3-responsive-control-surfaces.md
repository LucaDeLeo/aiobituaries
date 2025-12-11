# Story TSR-1.3: Implement Responsive Control Surfaces

**Story Key:** tsr-1-3-responsive-control-surfaces
**Epic:** TSR-1 - Layout Foundation (Timeline Visualization Redesign)
**Status:** ready-for-dev
**Priority:** High (Final story in Layout Foundation epic)

---

## User Story

**As a** tablet or mobile user,
**I want** access to visualization controls appropriate for my device,
**So that** I can filter and configure the visualization on any screen size.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-1.3.1 | Tablet shows Sheet from right | Given viewport 768-1023px, when control trigger is clicked, then Sheet slides in from right containing ControlPanel with variant="drawer" |
| AC-1.3.2 | Mobile shows bottom sheet | Given viewport <768px, when control trigger is clicked, then Sheet slides up from bottom containing ControlPanel with variant="sheet" |
| AC-1.3.3 | FAB trigger is visible | Given tablet/mobile viewport, then a floating action button is visible in bottom-right corner with controls icon |
| AC-1.3.4 | FAB hidden on desktop | Given viewport >=1024px, then FAB is not visible (controls in sidebar) |
| AC-1.3.5 | Sheet closes on backdrop click | Given open sheet (tablet or mobile), when backdrop is clicked, then sheet closes |
| AC-1.3.6 | Sheet has close button | Given open sheet, then X button is visible in header that closes sheet |
| AC-1.3.7 | Control state persists | Given sheet is closed after changes, when reopened, then control state (metrics, categories, range) is preserved |
| AC-1.3.8 | Keyboard accessible | Given FAB is focused, when Enter/Space pressed, then sheet opens; given sheet is open, Escape closes it |

---

## Technical Approach

### Implementation Overview

Add responsive control surfaces for tablet (768-1023px) and mobile (<768px) viewports. Leverage existing shadcn Sheet component and ControlPanelWrapper. Create a floating action button (FAB) to trigger the sheet on non-desktop viewports.

### Current State Analysis

**From TSR-1.1 and TSR-1.2:**
- Desktop (>=1024px): Grid layout with sidebar containing `ControlPanelWrapper`
- Tablet (768-1023px): Full-width chart in existing view - **no controls currently**
- Mobile (<768px): MobileTimeline component - **no controls currently**

**Existing Components:**
```
src/components/controls/
├── control-panel.tsx           # UI with variant prop
├── control-panel-wrapper.tsx   # State management wrapper
├── collapsible-section.tsx     # Collapsible UI primitive
└── index.ts                    # Barrel exports
```

**shadcn Sheet (src/components/ui/sheet.tsx):**
- Supports `side="right"` | `"bottom"` | `"left"` | `"top"`
- Has overlay, close button, animation built-in
- Uses Radix Dialog primitives

### Target State

**Single Sheet with Dynamic Side (Recommended Approach)**

Use a `useMediaQuery` hook to determine viewport and render ONE Sheet with dynamic `side` prop:

```tsx
// Single Sheet - side determined by viewport
const isMobile = useMediaQuery('(max-width: 767px)')
const sheetSide = isMobile ? 'bottom' : 'right'
const panelVariant = isMobile ? 'sheet' : 'drawer'

<>
  {/* FAB positioned outside Sheet - always visible on tablet/mobile */}
  <Button
    onClick={() => setOpen(true)}
    className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg lg:hidden"
    aria-label="Open controls"
  >
    <SlidersHorizontal className="h-6 w-6" />
  </Button>

  {/* Single Sheet - side changes based on viewport */}
  <Sheet open={open} onOpenChange={setOpen}>
    <SheetContent
      side={sheetSide}
      className={cn(
        'p-0 flex flex-col',
        isMobile ? 'h-[80vh] max-h-[80vh] rounded-t-xl' : 'w-[320px]'
      )}
    >
      <SheetHeader className="p-4 pb-0">
        <SheetTitle className="sr-only">Visualization Controls</SheetTitle>
      </SheetHeader>
      {isMobile && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>
      )}
      <ControlPanelWrapper variant={panelVariant} totalCount={count} />
    </SheetContent>
  </Sheet>
</>
```

**Why Single Sheet (not dual)**:
- Two Sheet instances with shared `isOpen` state causes BOTH to open/animate simultaneously
- The hidden div only hides the trigger, not the Sheet portal (renders to document.body)
- Single Sheet with dynamic `side` prop is cleaner and actually works

### Key Implementation Details

1. **ControlTrigger Component**
   - Floating action button (FAB) styled component
   - Position: fixed bottom-right with safe area padding
   - Icon: Sliders2 or SlidersHorizontal from lucide-react
   - Hidden on desktop (lg:hidden)
   - Visible on tablet/mobile

2. **ControlSheet Component**
   - Wraps Sheet + ControlPanelWrapper
   - Props: `side`, `variant`, `totalCount`
   - Manages open/close state internally
   - Exports trigger for separate placement if needed

3. **Sheet Sizing**
   - Tablet (side="right"): Fixed 320px width (matches desktop sidebar)
   - Mobile (side="bottom"): 80vh max-height with overflow scroll

4. **State Persistence**
   - ControlPanelWrapper already manages state
   - Sheet open/close is ephemeral UI state
   - Control values persist via parent component (currently hardcoded, URL state in Epic 3)

5. **Responsive Visibility**
   - Desktop (>=1024px): Sidebar visible, FAB hidden
   - Tablet (768-1023px): FAB visible, triggers right sheet
   - Mobile (<768px): FAB visible, triggers bottom sheet

### Reference Implementation

```tsx
// src/hooks/use-media-query.ts
'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to track media query matches.
 * Returns false during SSR to avoid hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

```tsx
// src/components/controls/control-trigger.tsx
'use client'

import { forwardRef } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ControlTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional className for positioning */
  className?: string
}

/**
 * Floating action button to trigger control sheet on tablet/mobile.
 * Position fixed in bottom-right corner.
 *
 * Note: Do NOT use size="icon" - it sets 36x36px which conflicts with FAB size.
 * FAB standard is 56x56px (h-14 w-14).
 */
export const ControlTrigger = forwardRef<HTMLButtonElement, ControlTriggerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="default"
        // NO size="icon" - conflicts with h-14 w-14 (icon gives 36x36, FAB needs 56x56)
        className={cn(
          'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg',
          'lg:hidden', // Hidden on desktop
          className
        )}
        aria-label="Open controls"
        {...props}
      >
        <SlidersHorizontal className="h-6 w-6" />
      </Button>
    )
  }
)
ControlTrigger.displayName = 'ControlTrigger'
```

```tsx
// src/components/controls/control-sheet.tsx
'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ControlPanelWrapper } from './control-panel-wrapper'
import { ControlTrigger } from './control-trigger'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

export interface ControlSheetProps {
  /** Total obituary count for stats */
  totalCount: number
  /** Optional: control open state externally */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Responsive control sheet for tablet and mobile.
 *
 * - Tablet (768-1023px): Sheet from right, 320px wide
 * - Mobile (<768px): Sheet from bottom, 80vh max height
 *
 * Uses SINGLE Sheet with dynamic `side` prop based on viewport.
 * FAB is positioned outside Sheet to avoid dual-trigger issues.
 *
 * IMPORTANT: Do NOT use two Sheet instances with shared state.
 * Sheet portals render to document.body - both would animate when opened.
 */
export function ControlSheet({ totalCount, open, onOpenChange }: ControlSheetProps) {
  // Internal state if not controlled externally
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const handleOpenChange = onOpenChange ?? setInternalOpen

  // Determine viewport - mobile is <768px (md breakpoint)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const sheetSide = isMobile ? 'bottom' : 'right'
  const panelVariant = isMobile ? 'sheet' : 'drawer'

  return (
    <>
      {/* FAB trigger - positioned OUTSIDE Sheet, hidden on desktop */}
      <ControlTrigger onClick={() => handleOpenChange(true)} />

      {/* Single Sheet with dynamic side prop */}
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side={sheetSide}
          className={cn(
            'p-0 flex flex-col',
            isMobile
              ? 'h-[80vh] max-h-[80vh] rounded-t-xl pb-safe'
              : 'w-[320px]'
          )}
        >
          {/* SheetHeader visible, only SheetTitle is sr-only for a11y */}
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="sr-only">Visualization Controls</SheetTitle>
          </SheetHeader>

          {/* Drag handle indicator - mobile only */}
          {isMobile && (
            <div className="flex justify-center pt-1 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>
          )}

          <ControlPanelWrapper
            totalCount={totalCount}
            variant={panelVariant}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
```

### Integration in page.tsx

```tsx
// src/app/page.tsx - Add to mobile/tablet section
import { ControlSheet } from '@/components/controls/control-sheet'

// Inside the mobile/tablet wrapper div
<div className="lg:hidden">
  <main className="min-h-screen flex flex-col">
    {/* ... existing content ... */}
  </main>

  {/* Control sheet for tablet/mobile - renders FAB + sheet */}
  <ControlSheet totalCount={obituaries.length} />
</div>
```

### Bottom Sheet Specifics (Mobile)

The mobile bottom sheet should feel native:
- Rounded top corners (rounded-t-xl)
- Drag handle indicator (visual affordance)
- Max height 80vh to keep some chart visible
- Swipe-to-dismiss handled by Radix Dialog (built-in)
- Safe area padding for notched devices (pb-safe if needed)

### ControlPanel Variant Styling Updates

The ControlPanel `variant` prop already exists. Verify/update styling:

```tsx
// src/components/controls/control-panel.tsx
const variantStyles = {
  sidebar: 'p-0',        // Desktop sidebar - no extra padding
  sheet: 'p-2 pb-safe',  // Mobile bottom sheet - compact + safe area
  drawer: 'p-0',         // Tablet drawer - matches sidebar
}
```

**REQUIRED:** Add safe area padding for bottom sheet on notched devices:
```css
/* In src/app/globals.css - ADD THIS */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

This utility is used by the mobile bottom sheet (see ControlSheet reference implementation).

---

## Tasks

### Task 1: Create ControlTrigger Component (20 min)
**AC Coverage:** AC-1.3.3, AC-1.3.4, AC-1.3.8

- [ ] Create `src/components/controls/control-trigger.tsx`
- [ ] Implement as forwardRef to work with SheetTrigger asChild
- [ ] Style as FAB: fixed position, bottom-right, rounded-full, shadow
- [ ] Use SlidersHorizontal icon from lucide-react
- [ ] Add `lg:hidden` to hide on desktop
- [ ] Add aria-label="Open controls" for accessibility
- [ ] Export from `src/components/controls/index.ts`

### Task 1.5: Create useMediaQuery Hook (10 min)
**AC Coverage:** AC-1.3.1, AC-1.3.2

- [ ] Create `src/hooks/use-media-query.ts`
- [ ] Implement hook that tracks window.matchMedia
- [ ] Return false during SSR (useState default) to avoid hydration mismatch
- [ ] Add cleanup for event listener
- [ ] Export from hook file

### Task 2: Create ControlSheet Component (30 min)
**AC Coverage:** AC-1.3.1, AC-1.3.2, AC-1.3.5, AC-1.3.6, AC-1.3.7

- [ ] Create `src/components/controls/control-sheet.tsx`
- [ ] Import Sheet components from `@/components/ui/sheet`
- [ ] Import useMediaQuery hook
- [ ] Use SINGLE Sheet with dynamic `side` prop (NOT two Sheet instances)
- [ ] Determine side via `useMediaQuery('(max-width: 767px)')` - mobile=bottom, tablet=right
- [ ] Position FAB (ControlTrigger) OUTSIDE the Sheet component
- [ ] Configure tablet mode: side="right", w-[320px]
- [ ] Configure mobile mode: side="bottom", h-[80vh] max-h-[80vh], rounded-t-xl, pb-safe
- [ ] Add drag handle indicator div for mobile only (conditional render)
- [ ] Put sr-only on SheetTitle only (NOT on SheetHeader container)
- [ ] Pass correct variant to ControlPanelWrapper (drawer/sheet based on isMobile)
- [ ] Export from `src/components/controls/index.ts`

**IMPORTANT:** Do NOT use two Sheet instances with shared open state.
Sheet portals render to document.body - both would animate simultaneously.

### Task 3: Integrate ControlSheet in page.tsx (15 min)
**AC Coverage:** AC-1.3.1, AC-1.3.2, AC-1.3.3

- [ ] Import ControlSheet in `src/app/page.tsx`
- [ ] Add ControlSheet inside the `lg:hidden` wrapper div
- [ ] Position after `</main>` but inside the wrapper
- [ ] Pass `totalCount={obituaries.length}` prop
- [ ] Verify FAB appears on tablet/mobile only

### Task 4: Update ControlPanel Variant Styles (10 min)
**AC Coverage:** AC-1.3.7

- [ ] Review `src/components/controls/control-panel.tsx` variantStyles
- [ ] Add `pb-safe` utility class for bottom sheet safe area
- [ ] Ensure sheet variant has appropriate spacing for mobile
- [ ] Test collapsible sections work in sheet context

### Task 5: Add Safe Area CSS Utility (5 min) - REQUIRED
**AC Coverage:** AC-1.3.2

- [ ] Add `.pb-safe` utility to `src/app/globals.css` (REQUIRED, not optional)
- [ ] CSS: `.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0); }`
- [ ] This is used by mobile bottom sheet for notched devices (iPhone X+)

### Task 6: Write Unit Tests (25 min)

- [ ] Create `tests/unit/components/controls/control-trigger.test.tsx`
  - Test: Renders button with correct aria-label
  - Test: Has lg:hidden class
  - Test: Forwards ref correctly
- [ ] Create `tests/unit/components/controls/control-sheet.test.tsx`
  - Test: Tablet sheet has side="right"
  - Test: Mobile sheet has side="bottom"
  - Test: Opens when trigger clicked
  - Test: Closes when backdrop clicked
  - Test: Contains ControlPanelWrapper

### Task 7: Visual and Manual Testing (20 min)

- [ ] Desktop (>=1024px): Verify FAB is NOT visible
- [ ] Desktop: Verify sidebar controls still work
- [ ] Tablet (768-1023px): Verify FAB is visible
- [ ] Tablet: Click FAB - sheet slides from right
- [ ] Tablet: Verify sheet is 320px wide
- [ ] Tablet: Click backdrop - sheet closes
- [ ] Tablet: Press Escape - sheet closes
- [ ] Mobile (<768px): Verify FAB is visible
- [ ] Mobile: Tap FAB - sheet slides from bottom
- [ ] Mobile: Verify sheet has rounded top corners
- [ ] Mobile: Verify drag handle is visible
- [ ] Mobile: Verify max height ~80vh
- [ ] Mobile: Tap backdrop - sheet closes
- [ ] Resize: Test transitions between breakpoints

### Task 8: Accessibility Testing (10 min)
**AC Coverage:** AC-1.3.8

- [ ] Tab to FAB - focus visible
- [ ] Press Enter on FAB - sheet opens
- [ ] Focus trapped inside open sheet
- [ ] Press Escape - sheet closes
- [ ] Focus returns to FAB after close
- [ ] Screen reader: FAB announces "Open controls"
- [ ] Screen reader: Sheet announces title

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| TSR-1.1 CSS Grid Layout | Story | Done | Provides responsive layout structure |
| TSR-1.2 ControlPanel Shell | Story | Done | Provides ControlPanel with variant prop |
| shadcn Sheet | Component | Exists | `src/components/ui/sheet.tsx` |
| lucide-react icons | Package | Installed | For FAB icon |

### Downstream Dependencies

Stories that depend on responsive control surfaces:
- **Story 5.1:** Mobile Bottom Sheet (extends mobile sheet styling)
- **Epic 3 stories:** Will wire up actual control state to URL

---

## Definition of Done

- [ ] useMediaQuery hook created in `src/hooks/`
- [ ] ControlTrigger component created with FAB styling (NO size="icon")
- [ ] ControlSheet uses SINGLE Sheet with dynamic side prop (not two instances)
- [ ] FAB visible only on tablet/mobile (lg:hidden works)
- [ ] Tablet sheet slides from right with 320px width
- [ ] Mobile sheet slides from bottom with 80vh max height
- [ ] Mobile sheet has rounded top corners and drag handle
- [ ] Sheet closes on backdrop click
- [ ] Sheet closes on Escape key
- [ ] ControlPanelWrapper receives correct variant prop
- [ ] pb-safe utility added to globals.css (REQUIRED)
- [ ] Safe area padding applied for notched devices
- [ ] All unit tests pass
- [ ] Visual testing confirms behavior at all breakpoints
- [ ] Keyboard navigation works (Enter/Space opens, Escape closes)
- [ ] Screen reader accessible (sr-only on SheetTitle only, not SheetHeader)
- [ ] No TypeScript errors
- [ ] Lint passes (`bun run lint`)
- [ ] Existing desktop sidebar unchanged

---

## Test Scenarios

### Unit Test Scenarios

1. **ControlTrigger Renders Correctly**
   - Render ControlTrigger
   - Expect button with aria-label="Open controls"
   - Expect SlidersHorizontal icon

2. **ControlTrigger Hidden on Desktop**
   - Render ControlTrigger
   - Expect className contains "lg:hidden"

3. **ControlSheet Tablet Configuration**
   - Render ControlSheet at tablet width
   - Expect Sheet with side="right"
   - Expect content width 320px

4. **ControlSheet Mobile Configuration**
   - Render ControlSheet at mobile width
   - Expect Sheet with side="bottom"
   - Expect drag handle element

5. **ControlSheet Opens on Trigger Click**
   - Render ControlSheet
   - Click trigger button
   - Expect sheet content visible

6. **ControlSheet Passes Correct Variant**
   - Render tablet ControlSheet
   - Expect ControlPanelWrapper with variant="drawer"
   - Render mobile ControlSheet
   - Expect ControlPanelWrapper with variant="sheet"

### Manual Testing Checklist

- [ ] Desktop: No FAB visible, sidebar works
- [ ] Tablet portrait: FAB visible, right sheet works
- [ ] Tablet landscape: FAB visible, right sheet works
- [ ] Mobile portrait: FAB visible, bottom sheet works
- [ ] Mobile landscape: FAB visible, bottom sheet works
- [ ] Resize from desktop to tablet: FAB appears
- [ ] Resize from tablet to mobile: Sheet side changes
- [ ] iPhone with notch: Safe area padding visible
- [ ] Android: No safe area issues

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/use-media-query.ts` | **Create** | Hook for viewport detection |
| `src/components/controls/control-trigger.tsx` | **Create** | FAB component for triggering sheet |
| `src/components/controls/control-sheet.tsx` | **Create** | Responsive sheet wrapper (single Sheet, dynamic side) |
| `src/components/controls/index.ts` | Modify | Add new exports |
| `src/app/page.tsx` | Modify | Add ControlSheet to mobile/tablet section |
| `src/components/controls/control-panel.tsx` | Modify | Update variant styles if needed |
| `src/app/globals.css` | Modify | Add pb-safe utility (REQUIRED) |
| `tests/unit/components/controls/control-trigger.test.tsx` | Create | Unit tests |
| `tests/unit/components/controls/control-sheet.test.tsx` | Create | Unit tests |

---

## FR/TSR Coverage

| Requirement ID | Description | How Satisfied |
|----------------|-------------|---------------|
| TSR3 | Tablet (768-1023px): full-width chart with slide-in drawer | Sheet side="right" with ControlPanel variant="drawer" |
| TSR4 | Mobile (<768px): full-width chart with bottom sheet | Sheet side="bottom" with ControlPanel variant="sheet" |

---

## Technical Notes

### Why Single Sheet with useMediaQuery (NOT Two Instances)

**DO NOT use two Sheet instances with shared open state.** This was the original approach but it has a critical flaw:

**The Problem:**
- Sheet renders via portal to `document.body`
- When `open={true}`, BOTH sheets animate and render (overlay + content)
- The `hidden md:block` wrapper only hides the trigger, not the portal content
- Result: Two overlapping sheets, broken animations, z-index conflicts

**The Solution:**
- Single Sheet with dynamic `side` prop via `useMediaQuery`
- FAB positioned outside Sheet (not as SheetTrigger child)
- Conditional styling based on `isMobile` state

**Hydration Note:**
- `useMediaQuery` returns `false` during SSR
- First render shows tablet mode (side="right") on all viewports
- After hydration, correct side is applied based on actual viewport
- This is acceptable since the sheet is closed initially anyway

### Sheet vs Drawer Naming

In shadcn/ui, "Sheet" is the component name. We use "drawer" as the variant name for the tablet right-side sheet to distinguish from the mobile "sheet" (bottom). This is a naming convention choice, not a separate component.

### Safe Area Handling

For notched devices (iPhone X+), the bottom sheet needs safe area inset padding. Options:
1. CSS `env(safe-area-inset-bottom)` - most compatible
2. Tailwind plugin `tailwindcss-safe-area` - if already installed
3. Manual padding on case-by-case basis

### Animation Timing

The shadcn Sheet has default animations:
- Open: 500ms slide-in
- Close: 300ms slide-out

These are good defaults. If snappier response is desired, can be adjusted in sheet.tsx via:
```tsx
data-[state=closed]:duration-200 data-[state=open]:duration-300
```

### Z-Index Stacking

- FAB: z-40 (above content, below sheet)
- Sheet overlay: z-50 (above FAB)
- Sheet content: z-50 (matches overlay)

This ensures the FAB doesn't show above the open sheet.

---

## Dev Agent Record

_This section is populated during implementation_

### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

### File List

---

_Story created: 2025-12-11_
_Epic: TSR-1 - Layout Foundation (Timeline Visualization Redesign)_
_Sequence: 3 of 3 in Epic TSR-1 (Final Story)_
_Requirements: TSR3, TSR4_
