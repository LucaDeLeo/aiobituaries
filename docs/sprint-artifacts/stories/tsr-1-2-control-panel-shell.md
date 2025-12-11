# Story TSR-1.2: Create ControlPanel Shell Component

**Story Key:** tsr-1-2-control-panel-shell
**Epic:** TSR-1 - Layout Foundation (Timeline Visualization Redesign)
**Status:** ready-for-dev
**Priority:** High (Foundation Component)

---

## User Story

**As a** developer,
**I want** a container component for all visualization controls,
**So that** controls are organized and reusable across responsive variants (sidebar, sheet, drawer).

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-1.2.1 | ControlPanel renders in sidebar | Given desktop viewport (>=1024px), when homepage loads, then ControlPanel renders inside the sidebar aside element |
| AC-1.2.2 | Collapsible sections structure | ControlPanel contains collapsible sections with headers: "Background Metrics", "Time Range", "Categories", "Display Options" |
| AC-1.2.3 | Stats display shows counts | Stats section displays "Showing X of Y" format with total and visible obituary counts |
| AC-1.2.4 | Variant prop controls styling | `variant` prop accepts 'sidebar' | 'sheet' | 'drawer' and adjusts padding/spacing accordingly |
| AC-1.2.5 | Sections expand/collapse | Each section can be expanded/collapsed with chevron indicator and smooth animation |
| AC-1.2.6 | Props interface is complete | Component accepts all required props per interface specification (metrics, categories, dateRange, displayOptions, stats) |
| AC-1.2.7 | Placeholder content for controls | Each section contains placeholder content indicating which control component will be added (Stories 3.2-3.4) |

---

## Technical Approach

### Implementation Overview

Create the ControlPanel shell component that will host all visualization controls in the sidebar. This is a structural/container component - the actual control implementations (MetricsToggle, DateRangeSlider, CategoryCheckboxes) come in Epic 3. This story establishes the foundation with collapsible sections and proper TypeScript interfaces.

### Context from Story TSR-1.1

Story 1.1 implemented:
- CSS Grid layout with 320px sidebar on right
- Sidebar container: `<aside className="border-l border-border overflow-y-auto bg-secondary">`
- Placeholder comment: `{/* ControlPanel - populated in Story TSR-1.2 */}`
- HomeClient `variant="hero"` for desktop grid layout

### Target Component Interface

```typescript
// src/components/controls/control-panel.tsx
'use client'

export type MetricType = 'compute' | 'mmlu' | 'eci';

export interface DisplayOptions {
  showTrendAnnotations: boolean;
  enableClustering: boolean;
}

export interface ControlPanelProps {
  /** Currently enabled background metrics */
  enabledMetrics: MetricType[];
  /** Callback when metrics selection changes */
  onMetricsChange: (metrics: MetricType[]) => void;
  /** Currently selected categories (empty = all) */
  selectedCategories: Category[];
  /** Callback when category selection changes */
  onCategoriesChange: (categories: Category[]) => void;
  /** Current date range [startYear, endYear] */
  dateRange: [number, number];
  /** Callback when date range changes */
  onDateRangeChange: (range: [number, number]) => void;
  /** Display options (trend annotations, clustering) */
  displayOptions: DisplayOptions;
  /** Callback when display options change */
  onDisplayOptionsChange: (options: DisplayOptions) => void;
  /** Obituary counts for stats display */
  stats: { total: number; visible: number };
  /** Layout variant - affects padding and spacing */
  variant?: 'sidebar' | 'sheet' | 'drawer';
}
```

### Component Structure

```tsx
<ControlPanel variant="sidebar" {...props}>
  {/* Header with stats */}
  <div className="p-4 border-b border-border">
    <h2 className="font-semibold">Controls</h2>
    <p className="text-sm text-muted-foreground">
      Showing {stats.visible} of {stats.total}
    </p>
  </div>

  {/* Collapsible sections */}
  <div className="flex-1 overflow-y-auto">
    <CollapsibleSection title="Background Metrics" defaultOpen>
      {/* MetricsToggle placeholder - Story 3.2 */}
    </CollapsibleSection>

    <CollapsibleSection title="Time Range" defaultOpen>
      {/* DateRangeSlider placeholder - Story 3.3 */}
    </CollapsibleSection>

    <CollapsibleSection title="Categories" defaultOpen>
      {/* CategoryCheckboxes placeholder - Story 3.4 */}
    </CollapsibleSection>

    <CollapsibleSection title="Display Options" defaultOpen={false}>
      {/* DisplayOptions placeholder - future */}
    </CollapsibleSection>
  </div>
</ControlPanel>
```

### Collapsible Section Implementation

Use `@radix-ui/react-collapsible` for accessible expand/collapse behavior:

```tsx
// src/components/controls/collapsible-section.tsx
'use client'

import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen} className="group border-b border-border">
      <Collapsible.Trigger className="flex w-full items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="px-4 pb-4">
          {children}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
```

### Variant Styling

```tsx
const variantStyles = {
  sidebar: 'p-0',           // Full padding via sections
  sheet: 'p-2',             // Reduced padding for bottom sheet
  drawer: 'p-0',            // Same as sidebar
};
```

### Animation Keyframes

Add to `src/app/globals.css`:

```css
/* Collapsible section animations (Story TSR-1.2) */
@keyframes collapsible-down {
  from { height: 0; }
  to { height: var(--radix-collapsible-content-height); }
}

@keyframes collapsible-up {
  from { height: var(--radix-collapsible-content-height); }
  to { height: 0; }
}

.animate-collapsible-down {
  animation: collapsible-down 0.2s ease-out;
}

.animate-collapsible-up {
  animation: collapsible-up 0.2s ease-out;
}
```

**Note:** The project uses Tailwind v4 with `@import "tailwindcss"` and `tw-animate-css`. Custom animation classes must be defined in globals.css since there's no tailwind.config.js.

### Integration Point

Update `src/app/page.tsx` to render ControlPanel in sidebar. The sidebar currently contains only a placeholder comment:

```tsx
{/* Current state in page.tsx - sidebar with placeholder comment */}
<aside className="border-l border-border overflow-y-auto bg-secondary" aria-label="Controls panel">
  {/* ControlPanel - populated in Story TSR-1.2 */}
</aside>
```

Replace the comment with ControlPanel:

```tsx
{/* After this story - sidebar with ControlPanel */}
<aside className="border-l border-border overflow-y-auto bg-secondary" aria-label="Controls panel">
  <ControlPanel
    enabledMetrics={['compute']}
    onMetricsChange={() => {}}
    selectedCategories={[]}
    onCategoriesChange={() => {}}
    dateRange={[2010, 2025]}
    onDateRangeChange={() => {}}
    displayOptions={{ showTrendAnnotations: true, enableClustering: false }}
    onDisplayOptionsChange={() => {}}
    stats={{ total: obituaries.length, visible: obituaries.length }}
    variant="sidebar"
  />
</aside>
```

**Note:** Props are hardcoded placeholders in this story. Story 3.1 (URL State Hook) will wire up actual state management.

---

## Tasks

### Task 1: Install Radix Collapsible (5 min)
**AC Coverage:** AC-1.2.5

- [ ] Run `bun add @radix-ui/react-collapsible`
- [ ] Verify installation in package.json

### Task 2: Create CollapsibleSection Component (25 min)
**AC Coverage:** AC-1.2.5

- [ ] Create `src/components/controls/collapsible-section.tsx`
- [ ] Add `'use client'` directive at top (uses Radix state)
- [ ] Import and configure `@radix-ui/react-collapsible`
- [ ] Add `group` class to Root for Tailwind v4 data-attribute selectors
- [ ] Add chevron icon with `group-data-[state=open]:rotate-180` rotation
- [ ] Add smooth height animation for content
- [ ] Support `defaultOpen` prop
- [ ] Add keyboard accessibility (Enter/Space to toggle)

### Task 3: Add Animation Keyframes (10 min)
**AC Coverage:** AC-1.2.5

- [ ] Add collapsible-down keyframe animation to `src/app/globals.css`
- [ ] Add collapsible-up keyframe animation
- [ ] Add `.animate-collapsible-down` and `.animate-collapsible-up` classes (Tailwind v4 has no config file)

### Task 4: Create ControlPanel Component (30 min)
**AC Coverage:** AC-1.2.2, AC-1.2.3, AC-1.2.4, AC-1.2.6, AC-1.2.7

- [ ] Create `src/components/controls/control-panel.tsx`
- [ ] Add `'use client'` directive at top (uses CollapsibleSection which has client state)
- [ ] Define `MetricType` and `DisplayOptions` types
- [ ] Define complete `ControlPanelProps` interface
- [ ] Implement header section with stats display
- [ ] Add 4 CollapsibleSection components:
  - Background Metrics (defaultOpen)
  - Time Range (defaultOpen)
  - Categories (defaultOpen)
  - Display Options (defaultOpen=false)
- [ ] Add placeholder content in each section with TODO comments
- [ ] Implement variant prop styling (sidebar/sheet/drawer)

### Task 5: Create Barrel Export (5 min)
**AC Coverage:** AC-1.2.1

- [ ] Create `src/components/controls/index.ts`
- [ ] Export ControlPanel component
- [ ] Export CollapsibleSection component
- [ ] Export types (MetricType, DisplayOptions, ControlPanelProps)

### Task 6: Integrate into page.tsx (15 min)
**AC Coverage:** AC-1.2.1

- [ ] Import ControlPanel in `src/app/page.tsx`
- [ ] Replace `{/* ControlPanel - populated in Story TSR-1.2 */}` comment with ControlPanel component
- [ ] Pass hardcoded props (actual state management in Story 3.1)
- [ ] Pass obituaries.length for stats.total
- [ ] Verify renders correctly in sidebar

### Task 7: Write Unit Tests (30 min)
**AC Coverage:** All ACs

- [ ] Create `tests/unit/components/controls/control-panel.test.tsx`
- [ ] Test: ControlPanel renders with all required sections
- [ ] Test: Stats display shows correct format
- [ ] Test: Sections are collapsible (can toggle open/closed)
- [ ] Test: Variant prop applies correct styling
- [ ] Create `tests/unit/components/controls/collapsible-section.test.tsx`
- [ ] Test: CollapsibleSection starts open when defaultOpen=true
- [ ] Test: CollapsibleSection starts closed when defaultOpen=false
- [ ] Test: Clicking trigger toggles content visibility

### Task 8: Visual Testing (15 min)
**AC Coverage:** AC-1.2.1, AC-1.2.2, AC-1.2.4

- [ ] Test desktop layout - ControlPanel visible in sidebar
- [ ] Test collapsible sections expand/collapse with animation
- [ ] Test chevron icon rotates correctly
- [ ] Test stats display formatting
- [ ] Test section borders and spacing

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Story TSR-1.1 | Upstream | CSS Grid layout provides sidebar container |
| @radix-ui/react-collapsible | Package | New dependency for collapsible sections |
| lucide-react | Package | Already installed, for ChevronDown icon |

### Downstream Dependencies

Stories that depend on this shell:
- **Story 3.1:** URL State Hook (will wire up state to ControlPanel)
- **Story 3.2:** MetricsToggle (will replace placeholder in Background Metrics section)
- **Story 3.3:** DateRangeSlider (will replace placeholder in Time Range section)
- **Story 3.4:** CategoryCheckboxes (will replace placeholder in Categories section)
- **Story 3.5:** Assemble ControlPanel (will finalize with all controls)
- **Story 1.3:** Responsive Control Surfaces (will use variant prop for sheet/drawer)

---

## Definition of Done

- [ ] ControlPanel component created with complete TypeScript interface
- [ ] CollapsibleSection component created with Radix Collapsible
- [ ] 4 collapsible sections implemented (Background Metrics, Time Range, Categories, Display Options)
- [ ] Stats display shows "Showing X of Y" format
- [ ] Variant prop controls padding/spacing
- [ ] Sections animate smoothly on expand/collapse
- [ ] Chevron icon rotates to indicate state
- [ ] Placeholder content in each section with TODO comments
- [ ] ControlPanel integrated into page.tsx sidebar
- [ ] Barrel export created at `src/components/controls/index.ts`
- [ ] Unit tests pass for ControlPanel and CollapsibleSection
- [ ] No TypeScript errors
- [ ] Lint passes (`bun run lint`)
- [ ] Visual testing confirms appearance in sidebar

---

## Test Scenarios

### Unit Test Scenarios

1. **ControlPanel Renders All Sections**
   - Render ControlPanel with required props
   - Expect 4 collapsible sections with correct titles

2. **Stats Display Format**
   - Render ControlPanel with stats={{ total: 100, visible: 42 }}
   - Expect "Showing 42 of 100" text

3. **Variant Styling Applied**
   - Render ControlPanel with variant="sheet"
   - Expect reduced padding classes

4. **CollapsibleSection Default Open**
   - Render CollapsibleSection with defaultOpen={true}
   - Expect content to be visible

5. **CollapsibleSection Default Closed**
   - Render CollapsibleSection with defaultOpen={false}
   - Expect content to be hidden

6. **CollapsibleSection Toggle**
   - Render CollapsibleSection
   - Click trigger button
   - Expect content visibility to toggle

### Manual Testing Checklist

- [ ] Desktop: ControlPanel visible in sidebar
- [ ] Stats show correct count (matches obituaries array length)
- [ ] Click section header - content collapses with animation
- [ ] Click again - content expands with animation
- [ ] Chevron rotates 180 degrees when section opens
- [ ] Keyboard: Tab to section header, press Enter - toggles
- [ ] Display Options section starts collapsed (others open)
- [ ] Placeholder text visible in each section

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/controls/control-panel.tsx` | **Create** | Main ControlPanel shell component |
| `src/components/controls/collapsible-section.tsx` | **Create** | Reusable collapsible section component |
| `src/components/controls/index.ts` | **Create** | Barrel export for controls |
| `src/app/page.tsx` | Modify | Integrate ControlPanel in sidebar |
| `src/app/globals.css` | Modify | Add collapsible animation keyframes + classes (Tailwind v4, no config file) |
| `tests/unit/components/controls/control-panel.test.tsx` | Create | Unit tests for ControlPanel |
| `tests/unit/components/controls/collapsible-section.test.tsx` | Create | Unit tests for CollapsibleSection |

---

## FR/TSR Coverage

| Requirement ID | Description | How Satisfied |
|----------------|-------------|---------------|
| TSR-NEW-5 | Right sidebar control panel (320px) | ControlPanel shell component renders in sidebar |
| - | Component architecture for controls | Collapsible sections establish UI pattern for all controls |

**Note:** This is a developer-focused story establishing component architecture. User-facing requirements (TSR9-TSR20) are satisfied by Stories 3.1-3.5 which implement actual controls.

---

## Technical Notes

### Why Create Shell First?

1. **Separation of concerns** - Structure vs. functionality
2. **Parallel development** - Epic 2 (Y-Axis) can proceed while Epic 3 builds on this shell
3. **Type-first design** - Complete interface enables downstream stories to code against it
4. **Testing foundation** - Shell tests verify structure; control tests verify behavior

### Radix Collapsible vs. Custom

Using `@radix-ui/react-collapsible` because:
- Built-in accessibility (ARIA attributes, keyboard support)
- Data-state attributes for CSS animations
- Consistent with existing shadcn/Radix patterns
- Handles edge cases (rapid toggling, animation interruption)

### Tailwind v4 Data-Attribute Selector Pattern

For chevron rotation based on Radix's `data-state` attribute, use the **group pattern**:

```tsx
// Root gets 'group' class
<Collapsible.Root className="group border-b border-border">
  // Child uses group-data-[state=open]:* selector
  <ChevronDown className="group-data-[state=open]:rotate-180" />
</Collapsible.Root>
```

**Why not `[[data-state=open]>&]:rotate-180`?** This arbitrary selector syntax is not valid in Tailwind v4. The `group-data-[attr=value]:*` pattern is the correct approach for styling children based on parent data attributes.

**Content animations** work directly since they target the element itself:
```tsx
<Collapsible.Content className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
```

### Placeholder Props Strategy

Props are hardcoded in this story:
```tsx
enabledMetrics={['compute']}
dateRange={[2010, 2025]}
stats={{ total: obituaries.length, visible: obituaries.length }}
```

This allows:
- Visual testing of ControlPanel structure
- Type checking of interface
- Story 3.1 to implement actual state management
- No runtime errors from undefined callbacks

### Category Import

Import Category type from existing types:
```typescript
import type { Category } from '@/types/obituary';
```

This ensures consistency with existing filter implementation.

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
_Sequence: 2 of 3 in Epic TSR-1_
_Dependencies: Story TSR-1.1 (CSS Grid Layout)_
