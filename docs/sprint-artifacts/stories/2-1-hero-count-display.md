# Story 2-1: Hero Count Display

**Story Key:** 2-1-hero-count-display
**Epic:** Epic 2 - Core Content Display
**Status:** review
**Priority:** High

---

## User Story

**As a** visitor,
**I want** to see the total number of AI obituaries prominently displayed,
**So that** I immediately understand the scale of documented skepticism.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-2.1.1 | Count displays prominently on homepage | Large number visible in hero section |
| AC-2.1.2 | Count uses Geist Mono font | Font family is monospace (Geist Mono) |
| AC-2.1.3 | Count is 4rem (64px) on desktop | Computed font-size is 64px at >= 1024px viewport |
| AC-2.1.4 | Count scales down on mobile | Font-size reduces appropriately at < 768px |
| AC-2.1.5 | Count uses gold color | Text color is `#C9A962` (--accent-primary) |
| AC-2.1.6 | Pulsing glow animation present | Box-shadow pulses with 3s ease-in-out infinite |
| AC-2.1.7 | "obituaries" label displayed | Text "obituaries" appears below the number |
| AC-2.1.8 | Count fetched server-side | `getObituaryCount()` called in Server Component |
| AC-2.1.9 | Count formatted with locale | Number displays as "1,247" not "1247" |
| AC-2.1.10 | Reduced motion disables animation | `prefers-reduced-motion: reduce` stops pulsing |

---

## Technical Approach

### Implementation Overview

Create a Server Component that fetches the obituary count from Sanity CMS and displays it prominently on the homepage with the Deep Archive theme styling - featuring a gold pulsing glow effect that respects reduced motion preferences.

### Key Implementation Details

1. **Server Component Architecture**
   - Create `src/components/obituary/count-display.tsx` as an async Server Component
   - Fetch count using `getObituaryCount()` from Sanity queries
   - No client-side JavaScript needed - pure server rendering

2. **Count Formatting**
   - Use `Intl.NumberFormat('en-US')` for locale-aware number formatting
   - Ensures proper comma separators (e.g., "1,247")

3. **Typography Styling**
   - Geist Mono font (already configured in project via next/font)
   - Responsive sizing: 4rem (64px) on desktop, scaling down on mobile
   - Gold color via CSS variable `--accent-primary` (#C9A962)

4. **Pulsing Glow Animation**
   - CSS keyframes animation with 3s duration, ease-in-out, infinite loop
   - Uses `text-shadow` for the glow effect
   - Respects `prefers-reduced-motion: reduce` media query to disable animation

5. **Label Display**
   - Static "obituaries" text below the count number
   - Uses `--text-secondary` color for subdued appearance

### Reference Implementation

```tsx
// src/components/obituary/count-display.tsx
import { getObituaryCount } from '@/lib/sanity/queries'

export async function CountDisplay() {
  const count = await getObituaryCount()
  const formattedCount = new Intl.NumberFormat('en-US').format(count)

  return (
    <div className="text-center">
      <span
        className="font-mono text-4xl md:text-5xl lg:text-[4rem] text-[--accent-primary]
                   animate-pulse-glow motion-reduce:animate-none"
      >
        {formattedCount}
      </span>
      <p className="text-[--text-secondary] mt-2 text-lg">obituaries</p>
    </div>
  )
}
```

### CSS Animation

```css
/* Add to src/app/globals.css */
@keyframes pulse-glow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(201, 169, 98, 0.3);
  }
  50% {
    text-shadow: 0 0 20px rgba(201, 169, 98, 0.6),
                 0 0 30px rgba(201, 169, 98, 0.3);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pulse-glow {
    animation: none;
  }
}
```

### Sanity Query Function

Ensure `getObituaryCount()` exists in `src/lib/sanity/queries.ts`:

```typescript
export async function getObituaryCount(): Promise<number> {
  const query = `count(*[_type == "obituary"])`

  return sanityClient.fetch<number>(query, {}, {
    next: { tags: ['obituaries'] }
  })
}
```

---

## Tasks

### Task 1: Add Sanity Query Function (10 min)
- [ ] Open `src/lib/sanity/queries.ts`
- [ ] Add `getObituaryCount()` function if not already present
- [ ] Use GROQ `count()` function: `count(*[_type == "obituary"])`
- [ ] Apply ISR caching with `obituaries` tag

### Task 2: Add CSS Animation Keyframes (10 min)
- [ ] Open `src/app/globals.css`
- [ ] Add `@keyframes pulse-glow` animation
- [ ] Add `.animate-pulse-glow` utility class
- [ ] Add `@media (prefers-reduced-motion: reduce)` query to disable animation

### Task 3: Create CountDisplay Component (20 min)
- [ ] Create directory `src/components/obituary/` if not exists
- [ ] Create `count-display.tsx` as async Server Component
- [ ] Import and call `getObituaryCount()` from Sanity queries
- [ ] Format count with `Intl.NumberFormat('en-US')`
- [ ] Apply Geist Mono font with `font-mono` class
- [ ] Apply responsive sizing: `text-4xl md:text-5xl lg:text-[4rem]`
- [ ] Apply gold color: `text-[--accent-primary]`
- [ ] Apply pulsing animation: `animate-pulse-glow motion-reduce:animate-none`
- [ ] Add "obituaries" label with secondary text color

### Task 4: Integrate into Homepage (15 min)
- [ ] Open `src/app/page.tsx`
- [ ] Import `CountDisplay` component
- [ ] Add CountDisplay to hero section (top portion of page)
- [ ] Ensure proper spacing and layout

### Task 5: Write Unit Tests (30 min)
- [ ] Create `tests/components/obituary/count-display.test.tsx`
- [ ] Test component renders with formatted count
- [ ] Test animation class is present
- [ ] Test responsive classes are applied
- [ ] Test Intl.NumberFormat produces expected output

### Task 6: Manual Testing (15 min)
- [ ] Verify count displays correctly on homepage
- [ ] Test responsive sizing at different breakpoints
- [ ] Test pulsing glow animation is visible
- [ ] Test animation stops with reduced motion preference
- [ ] Verify count updates after Sanity changes (via ISR)

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Story 1-1 (Project Initialization) | Complete | Next.js project with Tailwind configured |
| Story 1-2 (Design System Setup) | Complete | CSS variables and fonts configured |
| Story 1-3 (Sanity CMS Integration) | Complete | Sanity client and queries setup |
| Story 1-4 (Layout Shell & Navigation) | Complete | Homepage and layout structure in place |
| Story 1-5 (ISR Revalidation Webhook) | Complete | ISR revalidation configured |

---

## Definition of Done

- [ ] CountDisplay component exists at `src/components/obituary/count-display.tsx`
- [ ] Component fetches count from Sanity using `getObituaryCount()`
- [ ] Count displays with Geist Mono font
- [ ] Count is gold color (#C9A962 / --accent-primary)
- [ ] Count is 64px on desktop (4rem)
- [ ] Count scales down responsively on mobile
- [ ] Count is formatted with commas (e.g., "1,247")
- [ ] Pulsing glow animation plays with 3s duration
- [ ] Animation disabled when `prefers-reduced-motion: reduce` is set
- [ ] "obituaries" label appears below the count
- [ ] Component integrated into homepage
- [ ] Unit tests pass
- [ ] No TypeScript errors
- [ ] Lint passes (`npm run lint`)

---

## Test Scenarios

### Unit Test Scenarios

1. **Component Renders Count**
   - Mock `getObituaryCount()` to return 42
   - Expect component renders "42" formatted text

2. **Large Number Formatting**
   - Mock `getObituaryCount()` to return 1247
   - Expect component renders "1,247" with comma

3. **Animation Class Present**
   - Render component
   - Expect `animate-pulse-glow` class is applied

4. **Motion Reduce Class Present**
   - Render component
   - Expect `motion-reduce:animate-none` class is applied

5. **Font Class Present**
   - Render component
   - Expect `font-mono` class is applied

6. **Label Rendered**
   - Render component
   - Expect text "obituaries" is present

### Manual Testing Checklist

- [ ] Homepage displays count prominently
- [ ] Count uses monospace font (Geist Mono)
- [ ] Count is gold colored on dark background
- [ ] Glow pulses smoothly (3s cycle)
- [ ] Test at 320px width - count is smaller
- [ ] Test at 768px width - count is medium
- [ ] Test at 1024px+ width - count is 64px
- [ ] Enable reduced motion in OS settings - animation stops
- [ ] Publish new obituary in Sanity - count updates after revalidation

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/obituary/count-display.tsx` | Create | Hero count Server Component |
| `src/app/globals.css` | Modify | Add pulse-glow animation keyframes |
| `src/app/page.tsx` | Modify | Add CountDisplay to homepage |
| `src/lib/sanity/queries.ts` | Modify | Add getObituaryCount() function if needed |
| `tests/components/obituary/count-display.test.tsx` | Create | Unit tests for CountDisplay |

---

## FR Coverage

This story satisfies the following Functional Requirement:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR1 | System displays total obituary count prominently on homepage | CountDisplay component fetches count from Sanity and displays it in hero section with prominent gold styling and pulsing glow animation |

---

## Dev Agent Record

_This section is populated during implementation_

### Context Reference
`docs/sprint-artifacts/story-contexts/2-1-hero-count-display-context.xml`

### Implementation Notes
- Created CountDisplay as an async Server Component that fetches obituary count from Sanity
- Used Intl.NumberFormat('en-US') for locale-aware number formatting with comma separators
- Applied responsive font sizing: text-4xl (mobile) -> md:text-5xl (tablet) -> lg:text-[4rem] (desktop)
- Implemented pulse-glow CSS animation with 3s ease-in-out timing using text-shadow
- Added prefers-reduced-motion media query to disable animation for accessibility
- Used motion-reduce:animate-none Tailwind class for additional accessibility support

### Files Created
- `src/components/obituary/count-display.tsx` - Hero count Server Component
- `tests/unit/components/obituary/count-display.test.tsx` - 12 unit tests for CountDisplay

### Files Modified
- `src/app/globals.css` - Added @keyframes pulse-glow, .animate-pulse-glow class, and reduced motion media query
- `src/app/page.tsx` - Replaced design system test content with hero section containing CountDisplay

### Deviations from Plan
- Task 1 (Add Sanity Query Function) was already completed - getObituaryCount() existed in queries.ts
- Tests required React 19 + testing-library compatibility fixes using act() wrapper for async component rendering

### Issues Encountered
- React 19's new transitional element symbol required wrapping render() in act() for proper test execution
- Build fails with placeholder Sanity credentials (expected - requires real credentials for SSG)
- Pre-existing TypeScript errors in queries.test.ts (unrelated to this story)

### Key Decisions
- Used text-shadow instead of box-shadow for the glow effect (matches story specification)
- Applied CSS animation keyframes outside @theme inline block to avoid Tailwind v4 @layer issues
- Used both CSS media query AND Tailwind motion-reduce class for comprehensive reduced-motion support

### Test Results
- All 12 CountDisplay tests passing
- All 37 project tests passing
- Lint passes with no errors
- TypeScript compiles for new files (pre-existing errors in other test files unrelated to story)

### Completion Timestamp
2025-11-29

---

_Story created: 2025-11-29_
_Epic: Core Content Display (Epic 2)_
_Sequence: 1 of 8 in Epic 2_
