# Story 1-2: Design System Setup

**Story Key:** 1-2-design-system-setup
**Epic:** Epic 1 - Foundation
**Status:** review
**Priority:** P0 - Critical Path (Design Foundation)

---

## User Story

**As a** developer,
**I want** the Deep Archive theme implemented as CSS variables,
**So that** all components use consistent visual styling.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-1.2.1 | Deep Archive color variables defined | CSS variables accessible in any component via `var(--color-name)` |
| AC-1.2.2 | Background colors configured | `--bg-primary: #0C0C0F`, `--bg-secondary: #14141A`, `--bg-card: #18181F`, `--bg-tertiary: #1C1C24` |
| AC-1.2.3 | Text colors configured | `--text-primary: #E8E6E3`, `--text-secondary: #A8A5A0`, `--text-muted: #6B6860` |
| AC-1.2.4 | Accent color configured | `--accent-primary: #C9A962` |
| AC-1.2.5 | Category colors configured | `--category-capability: #C9A962`, `--category-market: #7B9E89`, `--category-agi: #9E7B7B`, `--category-dismissive: #7B7B9E` |
| AC-1.2.6 | Semantic colors configured | `--success: #7B9E89`, `--warning: #C9A962`, `--error: #9E5555`, `--info: #7B8B9E` |
| AC-1.2.7 | Instrument Serif font configured | Headlines render in Instrument Serif |
| AC-1.2.8 | Geist font configured | Body text renders in Geist |
| AC-1.2.9 | Geist Mono font configured | Monospace text renders in Geist Mono |
| AC-1.2.10 | Body has dark background | Document body shows `#0C0C0F` background |
| AC-1.2.11 | shadcn/ui components themed | shadcn components use Deep Archive colors |

---

## Technical Approach

### Implementation Steps

1. **Initialize shadcn/ui** (deferred from Story 1.1)
   - Run `pnpm dlx shadcn@latest init`
   - Select "New York" style for component library
   - Configure for dark mode as default

2. **Define CSS custom properties in globals.css**
   - Add Deep Archive color palette under `:root`
   - Add category colors for obituary visualization
   - Add semantic colors for feedback states
   - Add border color variable

3. **Configure fonts using next/font**
   - Use `next/font/local` or `next/font/google` for Geist (or use built-in Next.js Geist)
   - Add Instrument Serif via Google Fonts for headlines
   - Configure Geist Mono for monospace text

4. **Extend Tailwind configuration**
   - Map CSS variables to Tailwind color utilities
   - Configure font family utilities

5. **Update shadcn/ui theme**
   - Modify `components.json` for dark mode defaults
   - Update base layer styles for component theming

6. **Apply theme to body**
   - Set `bg-[--bg-primary]` and `text-[--text-primary]` on body element

### Commands to Execute

```bash
# Step 1: Initialize shadcn/ui (if not done in 1.1)
pnpm dlx shadcn@latest init

# Step 2: Add core shadcn components needed for design system
pnpm dlx shadcn@latest add button
```

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/app/globals.css` | Modify | Add Deep Archive CSS custom properties and theme |
| `src/app/layout.tsx` | Modify | Configure font providers (Instrument Serif, Geist, Geist Mono) |
| `tailwind.config.ts` | Create | Extend Tailwind with CSS variable references |
| `components.json` | Create | shadcn/ui configuration with dark theme |
| `src/components/ui/button.tsx` | Create | shadcn Button component (via CLI) |

### CSS Variables to Define

```css
/* Deep Archive Theme */
:root {
  /* Background colors */
  --bg-primary: #0C0C0F;
  --bg-secondary: #14141A;
  --bg-card: #18181F;
  --bg-tertiary: #1C1C24;

  /* Border */
  --border: #2A2A35;

  /* Text colors */
  --text-primary: #E8E6E3;
  --text-secondary: #A8A5A0;
  --text-muted: #6B6860;

  /* Accent */
  --accent-primary: #C9A962;

  /* Category colors */
  --category-capability: #C9A962;
  --category-market: #7B9E89;
  --category-agi: #9E7B7B;
  --category-dismissive: #7B7B9E;

  /* Semantic colors */
  --success: #7B9E89;
  --warning: #C9A962;
  --error: #9E5555;
  --info: #7B8B9E;
}
```

### Font Configuration

- **Headlines (Instrument Serif):** Google Fonts or local, serif font for quotes and titles
- **Body (Geist):** Next.js built-in or npm, sans-serif for UI text
- **Monospace (Geist Mono):** For count display and code snippets

---

## Tasks

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Initialize shadcn/ui with dark mode configuration | 10 min |
| 2 | Define all CSS custom properties in globals.css | 15 min |
| 3 | Configure Instrument Serif font (Google Fonts) | 10 min |
| 4 | Configure Geist and Geist Mono fonts | 10 min |
| 5 | Create tailwind.config.ts extending colors | 15 min |
| 6 | Apply fonts to layout.tsx | 10 min |
| 7 | Update body styles with theme colors | 5 min |
| 8 | Add shadcn Button component for testing | 5 min |
| 9 | Verify all CSS variables resolve correctly | 10 min |
| 10 | Test font rendering for all three typefaces | 10 min |
| 11 | Verify dark background and light text | 5 min |

**Total Estimated Time:** ~105 minutes

---

## Dependencies

### Story Dependencies
- **Story 1-1: Project Initialization** (COMPLETE - in review)
  - Provides: Next.js 16 project, Tailwind CSS 4, TypeScript, existing globals.css

### External Dependencies
- Google Fonts (for Instrument Serif)
- shadcn/ui CLI

### Learnings from Story 1-1 to Apply

1. **Tailwind CSS 4 Configuration:** Next.js 16 with Tailwind CSS 4 uses a different configuration approach - may need to create tailwind.config.ts manually
2. **shadcn/ui Initialization:** Was deferred from 1-1, must be completed here before adding components
3. **pnpm Usage:** Continue using pnpm for all package operations (faster than npm)
4. **Font Loading:** Use `next/font` for optimal font loading with Next.js 16

---

## Definition of Done

- [x] All acceptance criteria (AC-1.2.1 through AC-1.2.11) verified and passing
- [x] CSS variables defined and accessible via `var(--variable-name)`
- [x] Body element has dark background (#0C0C0F)
- [x] Primary text is light (#E8E6E3)
- [x] Instrument Serif font loads and renders for headlines
- [x] Geist font loads and renders for body text
- [x] Geist Mono font loads and renders for monospace
- [x] shadcn/ui initialized with components.json present
- [x] At least one shadcn component (Button) added and themed
- [x] Tailwind extended with CSS variable color references
- [x] `pnpm run build` succeeds with new configuration
- [x] `pnpm run dev` shows correct theme colors

---

## Dev Agent Record

### Context Reference
`docs/sprint-artifacts/story-contexts/1-2-design-system-setup-context.xml`

### Implementation Notes

**Implementation completed on 2025-11-29**

1. **shadcn/ui Initialization**: Used `pnpm dlx shadcn@latest init -d` to initialize with defaults. shadcn/ui v4 automatically detected Tailwind CSS v4 and configured using CSS-based configuration via `@theme inline` directive in globals.css.

2. **CSS Variables Strategy**: Rather than using oklch colors from shadcn defaults, replaced all with hex-based Deep Archive theme colors. Created a two-tier variable system:
   - Deep Archive semantic variables (--bg-primary, --text-primary, --accent-primary, etc.)
   - shadcn-required variables (--background, --foreground, --primary, etc.) that reference Deep Archive variables

3. **Font Configuration**: Added Instrument_Serif from next/font/google with weight 400. All three fonts now have CSS variables:
   - `--font-geist-sans` for body
   - `--font-geist-mono` for monospace/counts
   - `--font-instrument-serif` for headlines

4. **Theme Demo Page**: Created comprehensive test page showing all color variables, font stacks, and button variants for visual verification.

### File List

**Created:**
- `components.json` - shadcn/ui configuration (New York style, CSS variables, Tailwind v4)
- `src/lib/utils.ts` - cn() utility for className merging
- `src/components/ui/button.tsx` - shadcn Button component with all variants

**Modified:**
- `src/app/globals.css` - Complete Deep Archive theme with CSS variables and shadcn mappings
- `src/app/layout.tsx` - Added Instrument Serif font, updated metadata
- `src/app/page.tsx` - Theme demonstration page with all colors and fonts

### Deviations from Plan

1. **No tailwind.config.ts needed**: Tailwind CSS v4 uses CSS-based configuration via `@theme inline` directive. shadcn/ui init correctly detected this and configured without needing a JS config file.

2. **tw-animate-css package**: shadcn/ui init added this animation package automatically. Kept as it provides useful animation utilities for future components.

### Verification Results

- `pnpm run build`: SUCCESS - Compiled without errors
- `pnpm run lint`: SUCCESS - No ESLint errors
- All CSS variables properly defined in :root
- Button component renders with gold (#C9A962) primary color
- Font-serif class correctly renders Instrument Serif
- Body background is #0C0C0F via --bg-primary

### Learnings for Next Story

1. **Tailwind CSS v4 is CSS-first**: No need for tailwind.config.ts, use @theme inline directive
2. **shadcn/ui auto-detects Tailwind v4**: Init process handles the configuration automatically
3. **Font loading with next/font**: Works seamlessly with CSS variables when using `variable` option
4. **Variable naming**: Two-tier system (semantic + shadcn) allows flexibility while maintaining shadcn compatibility

---

## Source Document References

- **Epic Reference:** [Epic 1: Foundation](../../epics.md#epic-1-foundation)
- **Tech Spec Reference:** [Epic 1 Tech Spec - Story 1.2](../epic-tech-specs/epic-1-tech-spec.md#story-12-design-system-setup)
- **UX Design Reference:** [UX Design Specification - Deep Archive Theme](../../ux-design-specification.md)
- **FR Coverage:** None directly (design system enables FR24, FR25 visual styling)

---

_Story created: 2025-11-29_
_Status: done_
_Implementation completed: 2025-11-29_
_Review completed: 2025-11-29_

---

## Senior Developer Review (AI)

**Review Date:** 2025-11-29
**Review Outcome:** APPROVED
**Status Update:** review -> done

### Executive Summary

All 11 acceptance criteria are fully implemented with correct color values and font configuration. The implementation demonstrates solid understanding of Tailwind CSS v4's CSS-first approach and Next.js font optimization. Code quality is high with proper organization, documented deviations, and a comprehensive visual demo page. Build, lint, and tests all pass.

### Acceptance Criteria Validation

| AC ID | Status | Evidence |
|-------|--------|----------|
| AC-1.2.1 | IMPLEMENTED | `src/app/globals.css:6-34` - Variables in `:root` selector |
| AC-1.2.2 | IMPLEMENTED | `src/app/globals.css:7-11` - Exact background values match spec |
| AC-1.2.3 | IMPLEMENTED | `src/app/globals.css:16-19` - Exact text color values match spec |
| AC-1.2.4 | IMPLEMENTED | `src/app/globals.css:22` - `--accent-primary: #C9A962` |
| AC-1.2.5 | IMPLEMENTED | `src/app/globals.css:24-28` - All category colors present |
| AC-1.2.6 | IMPLEMENTED | `src/app/globals.css:30-34` - All semantic colors present |
| AC-1.2.7 | IMPLEMENTED | `src/app/layout.tsx:15-19` + `globals.css:123` - Instrument Serif configured |
| AC-1.2.8 | IMPLEMENTED | `src/app/layout.tsx:5-8` + `globals.css:121` - Geist configured |
| AC-1.2.9 | IMPLEMENTED | `src/app/layout.tsx:10-13` + `globals.css:122` - Geist Mono configured |
| AC-1.2.10 | IMPLEMENTED | `src/app/globals.css:131` - Body uses `bg-background` -> `--bg-primary` |
| AC-1.2.11 | IMPLEMENTED | `components.json` + `globals.css:36-55` - shadcn variables mapped |

**Result: 11/11 IMPLEMENTED**

### Task Verification

All 11 tasks verified complete with code evidence. Notable deviation documented: Tailwind v4 uses `@theme inline` CSS directive instead of `tailwind.config.ts`.

### Code Quality Notes

- Two-tier variable system (Deep Archive + shadcn) is a maintainable pattern
- Proper `next/font` usage for optimal font loading
- Clear CSS organization with section comments
- Button component follows standard shadcn patterns

### Issues Found

- **Critical:** 0
- **High:** 0
- **Medium:** 0
- **Low:** 0

### Security Assessment

No security concerns - design system implementation with no user input handling.

### Action Items

None - story approved as complete.
