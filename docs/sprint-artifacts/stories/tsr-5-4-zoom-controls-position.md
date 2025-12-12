# Story TSR-5-4: Update Zoom Controls Position

**Epic:** TSR-5 (Polish & Mobile)
**Status:** ready-for-dev
**Priority:** Medium
**Estimation:** 1-2 hours

---

## User Story

**As a** visitor,
**I want** zoom controls positioned appropriately for the new layout,
**So that** they don't overlap with the sidebar or mobile FAB.

---

## Context

### Background

The layout was restructured in Epic TSR-1 to include a 320px sidebar on desktop (>=1024px). The current zoom controls are positioned with `absolute bottom-4 right-4` which places them relative to their container (the ScatterPlot wrapper div). This works correctly for desktop since the chart section excludes the sidebar, but mobile positioning needs adjustment to avoid overlap with the floating control trigger button (FAB).

**Current State:**
- `ZoomControls` in `src/components/visualization/zoom-controls.tsx` positioned `absolute bottom-4 right-4`
- Container is the ScatterPlot wrapper `div` which is inside the chart `<section>` element
- Desktop: Positioned correctly within chart area (sidebar is outside this container)
- Mobile: Positioned at bottom-right, but overlaps with `ControlTrigger` FAB at `bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.5rem))] right-6`

**What This Story Changes:**
- Desktop: Move zoom controls to top-right of chart area (16px offset)
- Mobile: Position bottom-right but above the FAB trigger
- Adjust touch target sizes appropriately per device

### Epic Dependencies

- **Epic TSR-1 (Layout Foundation):** Complete - CSS Grid layout with sidebar established
- **Story TSR-5-1 (Mobile Bottom Sheet):** Complete - FAB positioned at bottom-right with safe area

### Technical Context

**Current ZoomControls Implementation:**
```typescript
// src/components/visualization/zoom-controls.tsx
return (
  <motion.div
    className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-lg border border-[--border] bg-[--bg-secondary]/80 p-1 backdrop-blur-md"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: 0.5 }}
    data-testid="zoom-controls"
  >
    {/* ... buttons ... */}
  </motion.div>
)
```

**ScatterPlot Container Structure:**
```tsx
// src/components/visualization/scatter-plot.tsx
<div ref={containerRef} className="relative h-full w-full">
  <svg width={width} height={height}>
    {/* Chart content */}
  </svg>

  {/* Zoom Controls - positioned absolute within this div */}
  <ZoomControls ... />

  {/* Tooltip */}
  {/* Modal */}
</div>
```

**ControlTrigger FAB Position:**
```typescript
// src/components/controls/control-trigger.tsx
'fixed z-40 h-14 w-14 rounded-full shadow-lg',
'right-6 bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.5rem))]',
'lg:hidden', // Hidden on desktop
```

### Key Design Decisions

1. **Desktop top-right positioning:** Matches the tech spec requirement and follows common chart UI patterns (controls in corner, out of the way of data).

2. **Mobile spacing above FAB:** The FAB is 56px (h-14) + ~24px bottom offset = ~80px from bottom. Zoom controls need to be positioned above this.

3. **Smaller mobile touch targets acceptable:** Per tech spec, zoom is less critical on mobile (pinch-to-zoom available). Keep functional but allow reduced size.

4. **Use responsive classes:** Tailwind breakpoint classes to handle desktop vs mobile positioning in a single component.

---

## Acceptance Criteria

### AC-1: Desktop Position - Top-Right of Chart Area

**Given** viewport width >= 1024px (desktop)
**When** zoom controls render
**Then** positioned:
- Top-right of chart area (not viewport)
- Offset from edge: 16px (top-4 right-4)
- Does not overlap with sidebar (already handled by container structure)
- z-index appropriate for chart area (z-20 is fine)

**Verification:**
- Zoom controls visible in top-right corner of chart
- Sidebar content does not overlap controls
- Controls remain in position during pan/zoom

### AC-2: Mobile Position - Bottom-Right Above FAB

**Given** viewport width < 1024px (tablet/mobile)
**When** zoom controls render
**Then** positioned:
- Bottom-right of chart
- Above the floating control trigger (FAB)
- Minimum spacing: 80px from bottom (FAB height + offset + gap)
- Right offset: 16px

**Implementation:**
```tsx
// Responsive positioning
className={cn(
  'absolute right-4 z-20',
  'lg:top-4',                    // Desktop: top-right
  'top-auto lg:bottom-auto',    // Reset opposite property
  'bottom-[calc(80px+1rem)]',   // Mobile: above FAB (56px FAB + 24px offset + 16px gap)
)}
```

### AC-3: Mobile Touch Targets

**Given** viewport < 1024px
**When** zoom controls render on mobile/tablet
**Then**:
- Touch targets remain functional (minimum 44px per WCAG 2.5.5 or 32px minimum)
- Smaller size acceptable (zoom less critical on mobile - pinch-to-zoom available)
- Current breakpoint-based sizing preserved (tablet: 48px, desktop: 32px)
- Mobile breakpoint (`< 768px`) uses same sizing as tablet (48px)

**Note:** Current implementation already handles this via `useBreakpoint()`:
```typescript
const buttonSize = breakpoint === 'tablet' ? 'h-12 w-12' : 'h-8 w-8'
// Note: 'mobile' breakpoint (<768px) falls into else branch getting 32px
// Consider: mobile should also get 48px for touch targets
```

### AC-4: Animation Preserved

**Given** page loads with scatter plot
**When** zoom controls appear
**Then** fade-in animation plays correctly
**And** initial position reflects new responsive position (top vs bottom)

**Verification:**
- Controls animate in smoothly (0.2s delay 0.5s)
- No position jump after animation completes

### AC-5: Hidden on Mobile (Optional Enhancement)

**Given** zoom is less critical on mobile (pinch-to-zoom available)
**When** viewport < 768px (mobile)
**Then** consider hiding zoom controls entirely

**Note:** This is optional. If kept visible, use AC-2 positioning. Decision: implement with visibility, can hide later if desired.

---

## Technical Implementation

### Files to Modify

```
src/components/visualization/zoom-controls.tsx    # Update positioning classes
```

### Implementation Approach

**Update ZoomControls positioning with responsive Tailwind classes:**

```typescript
// src/components/visualization/zoom-controls.tsx
export function ZoomControls({ ... }: ZoomControlsProps) {
  const breakpoint = useBreakpoint()
  const isDesktop = breakpoint === 'desktop'

  // Touch target size based on breakpoint
  // IMPORTANT: mobile (<768px) AND tablet (768-1023px) get larger touch targets
  const buttonSize = breakpoint === 'desktop' ? 'h-8 w-8' : 'h-12 w-12'
  const iconSize = breakpoint === 'desktop' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <motion.div
      className={cn(
        // Base styles
        'absolute z-20 flex items-center gap-1 rounded-lg border border-[--border] bg-[--bg-secondary]/80 p-1 backdrop-blur-md',
        // Horizontal position - always right
        'right-4',
        // Vertical position - responsive
        'lg:top-4 lg:bottom-auto',           // Desktop: top-right
        'bottom-[calc(80px+1rem)] top-auto', // Mobile/tablet: above FAB
      )}
      initial={{ opacity: 0, y: isDesktop ? -10 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.5 }}
      data-testid="zoom-controls"
    >
      {/* ... existing button content ... */}
    </motion.div>
  )
}
```

**Key Changes from Current Implementation:**

1. **Mobile touch targets:** Change condition from `breakpoint === 'tablet'` to `breakpoint === 'desktop'` for button sizing, so both mobile AND tablet get larger 48px touch targets.

2. **Animation direction:** Use `isDesktop` boolean to determine animation direction (from top on desktop, from bottom on mobile/tablet).

### Test Coverage

No additional unit tests required. Existing tests verify ZoomControls renders with correct test IDs. Positioning is a CSS concern validated visually.

Visual verification:
- [ ] Desktop (1024px+): Controls in top-right of chart
- [ ] Tablet (768-1023px): Controls bottom-right, above FAB
- [ ] Mobile (<768px): Controls bottom-right, above FAB, with safe area consideration

---

## Tasks

### Task 1: Update ZoomControls Positioning Classes (AC: 1, 2)
- [ ] Replace `bottom-4 right-4` with responsive positioning in className
- [ ] Add `lg:top-4 lg:bottom-auto` for desktop (top-right of chart)
- [ ] Add `bottom-[calc(80px+1rem)] top-auto` for mobile/tablet (above FAB)
- [ ] Keep `right-4` for horizontal positioning (unchanged)
- [ ] Verify `top-auto`/`bottom-auto` resets work correctly across breakpoints

### Task 2: Update Touch Target Sizing (AC: 3)
- [ ] Change buttonSize logic: `breakpoint === 'desktop' ? 'h-8 w-8' : 'h-12 w-12'`
- [ ] Change iconSize logic: `breakpoint === 'desktop' ? 'h-4 w-4' : 'h-5 w-5'`
- [ ] This ensures BOTH mobile AND tablet get 48px touch targets

### Task 3: Update Animation Direction (AC: 4)
- [ ] Add `const isDesktop = breakpoint === 'desktop'`
- [ ] Update `initial` prop: `{ opacity: 0, y: isDesktop ? -10 : 10 }`
- [ ] Desktop: slides in from top (y: -10 -> 0)
- [ ] Mobile/tablet: slides in from bottom (y: 10 -> 0)
- [ ] Test animation plays smoothly on both

### Task 4: Visual Testing (AC: 1, 2, 3)
- [ ] Test on desktop (1280px viewport)
- [ ] Test on tablet (768px viewport)
- [ ] Test on mobile (375px viewport)
- [ ] Verify no overlap with sidebar on desktop
- [ ] Verify no overlap with FAB on mobile/tablet
- [ ] Verify touch targets are functional

### Task 5: Optional - Mobile Visibility Decision (AC: 5)
- [ ] Evaluate if zoom controls should be hidden on mobile
- [ ] If yes: add `md:flex hidden` to hide on <768px
- [ ] If no: document decision and keep visible

---

## Definition of Done

- [ ] All acceptance criteria verified (AC-1 through AC-5)
- [ ] All tasks completed (Task 1 through Task 5)
- [ ] Desktop (>=1024px): Zoom controls in top-right of chart area
- [ ] Mobile/tablet (<1024px): Zoom controls above FAB, no overlap
- [ ] Touch targets: 48px on mobile/tablet, 32px on desktop
- [ ] Animation direction matches position (from top on desktop, from bottom on mobile)
- [ ] No TypeScript errors: `bun run lint`
- [ ] Visual testing on 3 viewport sizes (1280px, 768px, 375px)

---

## Dev Notes

### Z-Index Stack

```
z-20: ZoomControls (within chart container)
z-30: Tooltip (within chart container)
z-40: FAB ControlTrigger (fixed, viewport level)
z-50: Sheet/Drawer (portal, viewport level)
```

ZoomControls at z-20 is appropriate as it's within the chart container and below tooltips.

### FAB Dimensions Reference

```
FAB (ControlTrigger):
- Size: 56x56px (h-14 w-14)
- Position: right-6 (24px), bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.5rem))]
- Minimum bottom: 24px, with safe area: 24px + env()

Zoom Controls clearance calculation:
- FAB bottom offset: ~24px minimum
- FAB height: 56px
- Gap between FAB and zoom controls: 16px
- Total: 24 + 56 + 16 = 96px, round to calc(80px+1rem) for flexibility
```

### Breakpoint Reference

```
useBreakpoint() returns:
- 'mobile': <768px
- 'tablet': 768-1023px
- 'desktop': >=1024px

Tailwind breakpoints:
- md: 768px
- lg: 1024px
```

### Future Consideration

If zoom controls feel cluttered on mobile, they can be moved into the ControlPanel as an additional section. This would:
- Remove visual clutter from chart area
- Group all controls together
- Require adding zoom state props to ControlPanel

For now, keep external positioning as specified in epic.

### References

- [Source: docs/sprint-artifacts/epics-timeline-redesign.md#Story 5.4]
- [Source: src/components/visualization/zoom-controls.tsx - Current implementation]
- [Source: src/components/controls/control-trigger.tsx - FAB positioning reference]
- [Source: src/components/visualization/scatter-plot.tsx - Container structure]

---

_Generated by BMAD Story Creator_
_Date: 2025-12-11_
_Epic: TSR-5 (Polish & Mobile)_
