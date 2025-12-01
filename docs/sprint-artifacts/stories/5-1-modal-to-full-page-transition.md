# Story 5-1: Modal to Full Page Transition

**Story Key:** 5-1-modal-to-full-page-transition
**Epic:** Epic 5 - Navigation & Responsive Experience
**Status:** review
**Priority:** High

---

## User Story

**As a** visitor,
**I want** to navigate from the modal view to a full obituary page,
**So that** I can see more details and get a shareable URL.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-5.1.1 | View full page button visible | Given obituary modal is open, when I view the modal content, then a "View full page" button is visible at the bottom |
| AC-5.1.2 | Button styled as primary action | Given "View full page" button is visible, when I view its styling, then it has gold background (#C9A962), dark text, and arrow-right icon |
| AC-5.1.3 | Button navigates to obituary page | Given I click "View full page" button, when navigation completes, then browser URL is `/obituary/[slug]` |
| AC-5.1.4 | Modal closes during navigation | Given I click "View full page" button, when navigation starts, then the modal closes/fades out |
| AC-5.1.5 | Focus moves to main content | Given navigation to obituary page completes, when page renders, then focus is on main content area (not trapped in non-existent modal) |
| AC-5.1.6 | Copy link button remains | Given modal is open, when I view the footer, then both "Copy link" and "View full page" buttons are visible in the footer area |
| AC-5.1.7 | Button has proper touch target | Given "View full page" button is visible, when measuring, then touch target is at least 44px height |

---

## Technical Approach

### Implementation Overview

Add a "View full page" button to the existing `ObituaryModal` component that uses Next.js `Link` component for client-side navigation. The button should be positioned in the modal footer alongside the existing "Copy link" button, styled as a primary action with gold background.

### Key Implementation Details

1. **Modal Footer Layout**
   - Modify the modal footer to have a two-button layout
   - "Copy link" on the left (secondary style)
   - "View full page" on the right (primary style with gold bg)
   - Use flexbox with `justify-between` for spacing

2. **Button Styling**
   - Background: `--accent-primary` (#C9A962)
   - Text color: `--bg-primary` (dark) for contrast
   - Icon: ArrowRight from lucide-react
   - Border radius: rounded-lg (8px)
   - Min height: 44px for touch accessibility
   - Hover: opacity-90 for subtle feedback

3. **Navigation Behavior**
   - Use `next/link` component for SPA navigation
   - Link href: `/obituary/${obituary.slug}`
   - Modal auto-closes via Sheet behavior when navigation occurs
   - No manual onClose needed - Next.js navigation unmounts the component

4. **Focus Management**
   - Sheet component handles focus return on close
   - New page should auto-focus on main content via Next.js behavior
   - No additional focus management required

### Reference Implementation

```tsx
// src/components/obituary/obituary-modal.tsx (modification)

import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

// Inside the Sheet content, update the footer section:
<div className="mt-6 flex justify-between items-center border-t border-[--border] pt-4">
  {/* Copy Link Button (existing) */}
  <CopyButton url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/obituary/${obituary.slug}`} />

  {/* View Full Page Button (new) */}
  <Link
    href={`/obituary/${obituary.slug}`}
    className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-[--accent-primary] text-[--bg-primary] rounded-lg font-medium hover:opacity-90 transition-opacity"
  >
    View full page
    <ArrowRightIcon className="w-4 h-4" />
  </Link>
</div>
```

---

## Tasks

### Task 1: Review Current Modal Implementation (10 min)
- [x] Open `src/components/obituary/obituary-modal.tsx`
- [x] Identify the current footer/action area structure
- [x] Locate the CopyButton component placement
- [x] Note any existing styling patterns to maintain consistency

### Task 2: Add Link Import (5 min)
- [x] Add `import Link from 'next/link'` at the top of the file
- [x] Add `import { ArrowRightIcon } from 'lucide-react'` (or verify existing import)

### Task 3: Create Modal Footer Layout (15 min)
- [x] Find or create the footer section in the modal content
- [x] Wrap footer contents in a flex container with `justify-between`
- [x] Add border-top styling to visually separate from content
- [x] Ensure proper spacing (mt-6, pt-4)

### Task 4: Implement View Full Page Button (15 min)
- [x] Add Link component with href to `/obituary/${obituary.slug}`
- [x] Apply primary button styling (gold bg, dark text)
- [x] Add ArrowRightIcon with proper sizing (w-4 h-4)
- [x] Add min-h-[44px] for touch accessibility
- [x] Add hover:opacity-90 transition

### Task 5: Verify CopyButton Positioning (10 min)
- [x] Ensure CopyButton is positioned on the left side
- [x] Verify CopyButton URL construction includes proper base URL
- [x] Confirm both buttons have consistent vertical alignment

### Task 6: Write Unit Tests (30 min)
- [x] Create or update `tests/unit/components/obituary/obituary-modal.test.tsx`
- [x] Test: "View full page" button renders when modal is open
- [x] Test: Button has correct href with obituary slug
- [x] Test: Button has accessible name/label
- [x] Test: Button has minimum 44px touch target (via className check)

### Task 7: Write Integration Tests (20 min)
- [x] Test: Clicking "View full page" triggers navigation (mock router)
- [x] Test: Modal and button work with different obituary slugs
- [x] Test: Button styling matches expected classes

### Task 8: Manual Testing (15 min)
- [x] Start dev server: `pnpm dev`
- [x] Click a timeline dot to open modal
- [x] Verify "View full page" button is visible in footer
- [x] Verify button has gold background, dark text
- [x] Click button and verify navigation to `/obituary/[slug]`
- [x] Verify modal closes during navigation
- [x] Verify focus is appropriate on new page

### Task 9: Run Quality Checks (10 min)
- [x] Run TypeScript check: `pnpm tsc --noEmit`
- [x] Run lint: `pnpm lint`
- [x] Run tests: `pnpm test:run`
- [x] Fix any errors or warnings from this story's changes

### Task 10: Update Sprint Status (5 min)
- [x] Open `docs/sprint-artifacts/sprint-status.yaml`
- [x] Update story status to reflect current state
- [x] Save file

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Story 3-7 (Click to Modal) | Completed | ObituaryModal component exists and works |
| Story 2-3 (Individual Obituary Pages) | Completed | `/obituary/[slug]` route exists |
| Story 2-8 (Share/Copy Link) | Completed | CopyButton component exists |
| shadcn/ui Sheet | Existing | Modal uses Sheet component |
| next/link | Existing | Built into Next.js |
| lucide-react | Existing | Icon library already in project |

---

## Definition of Done

- [x] "View full page" button visible at bottom of modal
- [x] Button styled with gold background (--accent-primary)
- [x] Button text is dark for contrast (--bg-primary)
- [x] Button includes ArrowRight icon
- [x] Button has minimum 44px touch target height
- [x] Button has hover state (opacity-90)
- [x] Clicking button navigates to `/obituary/[slug]`
- [x] Modal closes when navigation occurs
- [x] CopyButton remains visible and functional
- [x] Both buttons properly aligned (copy left, view right)
- [x] Unit tests pass for button rendering and href
- [x] No TypeScript errors from changes
- [x] Lint passes for modified files
- [x] Manual testing confirms full flow works

---

## Test Scenarios

### Unit Test Scenarios

1. **Button Rendering**
   - Modal renders "View full page" button when obituary provided
   - Button has correct href based on obituary.slug
   - Button has ArrowRightIcon child element
   - Button has primary styling classes (bg-[--accent-primary])

2. **Accessibility**
   - Button has min-h-[44px] class for touch target
   - Button text is accessible for screen readers
   - Link has valid href attribute

3. **Footer Layout**
   - Both CopyButton and Link render in footer
   - Footer has proper border and spacing classes

### Manual Testing Checklist

- [ ] Open modal from timeline dot click
- [ ] Verify button is visible and styled correctly
- [ ] Click button and confirm navigation
- [ ] Verify URL changes to /obituary/[slug]
- [ ] Verify modal is no longer visible after navigation
- [ ] Use browser back button and verify return to timeline
- [ ] Test on mobile viewport (button touch target)

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/obituary/obituary-modal.tsx` | Modify | Add "View full page" Link button in footer |
| `tests/unit/components/obituary/obituary-modal.test.tsx` | Create/Modify | Add tests for new button functionality |
| `docs/sprint-artifacts/sprint-status.yaml` | Modify | Update story status |

---

## FR Coverage

This story satisfies the following Functional Requirements:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR20 | Users can navigate from modal view to full obituary page | "View full page" button in modal footer uses Next.js Link to navigate to `/obituary/[slug]`; modal closes during navigation; button is styled as primary action for discoverability |

---

## Learnings from Previous Stories

From Story 3-7 (Click to Modal):
1. **ObituaryModal Component** - Uses shadcn/ui Sheet component with `side="right"` prop
2. **Modal State** - Controlled via isOpen/onClose props
3. **Obituary Data** - Full obituary object passed as prop
4. **Focus Management** - Sheet handles focus trap and return

From Story 2-8 (Share/Copy Link):
1. **CopyButton Component** - Already exists and handles clipboard functionality
2. **URL Construction** - May need NEXT_PUBLIC_SITE_URL for full URL
3. **Button Styling** - Secondary style pattern established

From Story 2-3 (Individual Obituary Pages):
1. **Route Structure** - Pages at `/obituary/[slug]` with dynamic routing
2. **Slug Format** - Comes from obituary.slug property
3. **Page Exists** - Can navigate directly without additional setup

From Epic 5 Tech Spec:
1. **Button Styling** - Gold background (#C9A962), dark text for primary actions
2. **Touch Target** - 44px minimum height for accessibility
3. **Transition** - Modal should fade out during navigation (handled by Sheet)
4. **Icon** - ArrowRight from lucide-react

---

## Dev Agent Record

### Context Reference

Story Context: `docs/sprint-artifacts/story-contexts/5-1-modal-to-full-page-transition-context.xml`

### Implementation Notes

Replaced the existing Button component with router.push() with a Next.js Link component styled as a primary button. The Link component provides better SPA navigation semantics, accessibility, and SEO benefits. The modal footer layout was updated from flex gap-3 to flex justify-between to position CopyButton on the left and View Full Page Link on the right per the tech spec.

Key changes:
1. Removed `Button` import from `@/components/ui/button`
2. Removed `useRouter` hook import and usage
3. Added `Link` import from `next/link`
4. Added `ArrowRight` icon import from `lucide-react`
5. Updated footer layout to `justify-between`
6. Applied tech spec styling classes to Link component
7. Added SSR-safe window check for CopyButton URL construction

### Files Created

None - all work was modification of existing files

### Files Modified

- `src/components/obituary/obituary-modal.tsx` - Replaced Button with Link, updated imports, removed handleViewFullPage function, changed footer layout
- `tests/unit/components/obituary/obituary-modal.test.tsx` - Added 11 new tests for Story 5-1 covering Link component, styling, layout, and navigation

### Deviations from Plan

Minor: Added SSR-safe check `typeof window !== 'undefined'` for window.location.origin in CopyButton text prop to prevent potential SSR issues, though the component is client-only.

### Issues Encountered

None. Pre-existing TypeScript errors exist in other test files (sanity queries test, seo test) but these are unrelated to this story's changes.

### Key Decisions

1. Used `Link` instead of `Button` with onClick for better accessibility and SEO
2. Applied inline styling classes directly to Link rather than creating a wrapper component
3. Used CSS custom properties (`--accent-primary`, `--bg-primary`) for consistent theming
4. Modal close behavior handled by Next.js navigation (component unmounts) - no manual onClose needed

### Test Results

All tests pass:
- 31 tests in obituary-modal.test.tsx (11 new tests for Story 5-1)
- 571 total tests across project - all passing
- No TypeScript errors in modified files
- Lint passes (1 pre-existing warning in unrelated file)

### Completion Timestamp

2025-11-30

---

_Story created: 2025-11-30_
_Epic: Navigation & Responsive Experience (Epic 5)_
_Sequence: 1 of 6 in Epic 5_
