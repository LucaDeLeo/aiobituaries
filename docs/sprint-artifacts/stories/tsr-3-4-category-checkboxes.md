# Story TSR-3-4: Implement CategoryCheckboxes Component

**Epic:** TSR-3 (Control Panel Implementation)
**Status:** ready-for-dev
**Priority:** High
**Estimation:** 2-3 hours

---

## User Story

**As a** visitor,
**I want** category filters in the sidebar as checkboxes,
**So that** I can filter obituaries by claim type while viewing controls.

---

## Context

### Background

The visualization displays AI skepticism obituaries categorized into four types:
- **Capability Doubt** - Claims AI cannot do specific tasks
- **Market/Bubble** - AI is overhyped or a bubble
- **AGI Skepticism** - AGI is impossible or very far away
- **Dismissive Framing** - Casual dismissal or mockery of AI

Currently, category filtering uses a floating pill bar (`src/components/filters/category-filter.tsx`). This story creates a sidebar-compatible checkbox version for the ControlPanel, using the existing category constants.

### Epic Dependencies

- **Story TSR-3-1 (URL State Hook):** Complete - provides `categories`, `setCategories` for state management
- **Story TSR-1-2 (ControlPanel Shell):** Complete - provides container with "Categories" section placeholder
- **Story TSR-3-5 (Assemble ControlPanel):** Will integrate this component

### Technical Context

**Available State from useVisualizationState:**
```typescript
const { categories, setCategories } = useVisualizationState()
// categories: Category[] - currently selected categories (empty = show all)
// setCategories: (c: Category[]) => void - set selected categories array
```

**Category Type (from src/types/obituary.ts):**
```typescript
type Category = 'market' | 'capability' | 'agi' | 'dismissive'
```

**Category Constants (from src/lib/constants/categories.ts):**
```typescript
CATEGORY_ORDER: Category[] = ['capability', 'market', 'agi', 'dismissive']
CATEGORIES: Record<Category, CategoryDefinition> = {
  capability: { id: 'capability', label: 'Capability Doubt', color: '#C9A962', ... },
  market: { id: 'market', label: 'Market/Bubble', color: '#7B9E89', ... },
  agi: { id: 'agi', label: 'AGI Skepticism', color: '#9E7B7B', ... },
  dismissive: { id: 'dismissive', label: 'Dismissive Framing', color: '#7B7B9E', ... },
}
```

**Current ControlPanel Placeholder:**
```tsx
<CollapsibleSection title="Categories" defaultOpen>
  {/* TODO: CategoryCheckboxes - Story 3.4 */}
  <p className="text-sm text-muted-foreground">
    Filter by claim category
  </p>
</CollapsibleSection>
```

### Key Design Decisions

1. **Checkbox-based UI:** Each category gets a labeled checkbox with color-coded background when checked (matches MetricsToggle pattern - no separate color dot)
2. **Multi-select:** Multiple categories can be selected simultaneously
3. **Empty = show all:** When no categories selected, all obituaries are shown (not filtered)
4. **Immediate URL sync:** Toggling updates URL immediately (not debounced)
5. **Controlled component:** State managed externally via props, enabling reuse
6. **Follow MetricsToggle pattern:** Same visual style and implementation approach

---

## Acceptance Criteria

### AC-1: Component Renders Four Categories

**Given** CategoryCheckboxes component is rendered
**When** it appears in the "Categories" section
**Then** displays four checkboxes with:
- "Capability Doubt" - gold (#C9A962) checkbox background when checked
- "Market/Bubble" - sage (#7B9E89) checkbox background when checked
- "AGI Skepticism" - rose (#9E7B7B) checkbox background when checked
- "Dismissive Framing" - slate (#7B7B9E) checkbox background when checked

**And** categories appear in CATEGORY_ORDER sequence
**And** uses single-line labels only (no description line, unlike MetricsToggle - categories are self-explanatory)

### AC-2: Checkboxes Reflect Current State

**Given** categories prop contains `['market', 'agi']`
**When** component renders
**Then**:
- Capability Doubt checkbox is unchecked
- Market/Bubble checkbox is checked
- AGI Skepticism checkbox is checked
- Dismissive Framing checkbox is unchecked

### AC-3: Toggle Updates Categories Array

**Given** current categories are `['market']`
**When** user clicks AGI Skepticism checkbox
**Then** `onCategoriesChange` is called with `['market', 'agi']`

**Given** current categories are `['market', 'agi']`
**When** user clicks AGI Skepticism checkbox again
**Then** `onCategoriesChange` is called with `['market']`

### AC-4: Empty Array Shows All

**Given** current categories are `['market']`
**When** user unchecks Market/Bubble
**Then** `onCategoriesChange` is called with `[]`

**And** the visualization shows all obituaries (no filter applied)

### AC-5: "Show All" Button Clears Selection

**Given** current categories are `['market', 'agi']`
**When** user clicks "Show All" button
**Then** `onCategoriesChange` is called with `[]`

**And** all checkboxes become unchecked

### AC-6: Keyboard Accessibility

**Given** focus is on a checkbox
**When** user presses Space or Enter
**Then** checkbox toggles state

**And** focus ring is visible when navigating with keyboard

### AC-7: Screen Reader Support

**Given** screen reader is active
**When** navigating the component
**Then**:
- Each checkbox has accessible label
- Checked/unchecked state is announced
- "Show All" button has accessible label
- Color information is not relied upon for meaning (labels provide context)

---

## Technical Implementation

### Files to Create

```
src/components/controls/category-checkboxes.tsx    # Main component
tests/unit/components/controls/category-checkboxes.test.tsx  # Tests
```

### Files to Modify

```
src/components/controls/control-panel.tsx    # Wire up component
```

### Implementation Guide

**src/components/controls/category-checkboxes.tsx:**

```tsx
'use client'

import type { Category } from '@/types/obituary'
import { CATEGORY_ORDER, CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

export interface CategoryCheckboxesProps {
  /** Currently selected categories (empty = show all) */
  selectedCategories: Category[]
  /** Callback when category selection changes */
  onCategoriesChange: (categories: Category[]) => void
  /** Optional className for container */
  className?: string
}

/**
 * CategoryCheckboxes - Checkbox list for filtering obituaries by category
 *
 * Allows users to select which categories of AI skepticism claims are visible.
 * Empty selection means "show all" - no filter applied.
 *
 * @example
 * ```tsx
 * const { categories, setCategories } = useVisualizationState()
 *
 * <CategoryCheckboxes
 *   selectedCategories={categories}
 *   onCategoriesChange={setCategories}
 * />
 * ```
 */
export function CategoryCheckboxes({
  selectedCategories,
  onCategoriesChange,
  className,
}: CategoryCheckboxesProps) {
  const handleToggle = (categoryId: Category) => {
    const isSelected = selectedCategories.includes(categoryId)

    if (isSelected) {
      // Remove category
      onCategoriesChange(selectedCategories.filter((c) => c !== categoryId))
    } else {
      // Add category
      onCategoriesChange([...selectedCategories, categoryId])
    }
  }

  const handleShowAll = () => {
    onCategoriesChange([])
  }

  const showingAll = selectedCategories.length === 0

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Show All button */}
      <button
        type="button"
        onClick={handleShowAll}
        className={cn(
          'text-sm text-left px-2 py-1 rounded transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          showingAll
            ? 'text-foreground font-medium'
            : 'text-muted-foreground'
        )}
      >
        {showingAll ? 'Showing all categories' : 'Show all'}
      </button>

      {/* Category checkboxes */}
      {CATEGORY_ORDER.map((categoryId) => {
        const category = CATEGORIES[categoryId]
        const isChecked = selectedCategories.includes(categoryId)
        const checkboxId = `category-${categoryId}`

        return (
          <label
            key={categoryId}
            htmlFor={checkboxId}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Custom checkbox with native input for accessibility */}
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id={checkboxId}
                checked={isChecked}
                onChange={() => handleToggle(categoryId)}
                className="peer sr-only"
              />
              {/* Visual checkbox */}
              <div
                className={cn(
                  'h-4 w-4 rounded border-2 transition-colors',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                  isChecked
                    ? 'border-transparent'
                    : 'border-muted-foreground/50 group-hover:border-muted-foreground'
                )}
                style={{
                  backgroundColor: isChecked ? category.color : 'transparent',
                }}
              >
                {/* Checkmark */}
                {isChecked && (
                  <svg
                    className="h-full w-full text-white"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 8l3 3 5-6" />
                  </svg>
                )}
              </div>
            </div>

            {/* Label only - color shown via checkbox background (matches MetricsToggle pattern) */}
            <span className="text-sm">{category.label}</span>
          </label>
        )
      })}
    </div>
  )
}
```

### Test Coverage Requirements

**tests/unit/components/controls/category-checkboxes.test.tsx:**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryCheckboxes } from '@/components/controls/category-checkboxes'
import type { Category } from '@/types/obituary'

describe('CategoryCheckboxes', () => {
  const defaultProps = {
    selectedCategories: [] as Category[],
    onCategoriesChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all four categories', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      expect(screen.getByText('Capability Doubt')).toBeInTheDocument()
      expect(screen.getByText('Market/Bubble')).toBeInTheDocument()
      expect(screen.getByText('AGI Skepticism')).toBeInTheDocument()
      expect(screen.getByText('Dismissive Framing')).toBeInTheDocument()
    })

    it('renders Show All button', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      expect(screen.getByRole('button', { name: /show/i })).toBeInTheDocument()
    })

    it('shows "Showing all categories" when empty selection', () => {
      render(<CategoryCheckboxes {...defaultProps} selectedCategories={[]} />)

      expect(screen.getByText('Showing all categories')).toBeInTheDocument()
    })

    it('shows "Show all" when categories selected', () => {
      render(
        <CategoryCheckboxes
          {...defaultProps}
          selectedCategories={['market']}
        />
      )

      expect(screen.getByText('Show all')).toBeInTheDocument()
    })

    it('shows checked state for selected categories', () => {
      render(
        <CategoryCheckboxes
          {...defaultProps}
          selectedCategories={['market', 'agi']}
        />
      )

      const marketCheckbox = screen.getByRole('checkbox', {
        name: /market/i,
      })
      const agiCheckbox = screen.getByRole('checkbox', {
        name: /agi skepticism/i,
      })
      const capabilityCheckbox = screen.getByRole('checkbox', {
        name: /capability doubt/i,
      })

      expect(marketCheckbox).toBeChecked()
      expect(agiCheckbox).toBeChecked()
      expect(capabilityCheckbox).not.toBeChecked()
    })
  })

  describe('interactions', () => {
    it('calls onCategoriesChange when selecting a category', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={[]}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const marketCheckbox = screen.getByRole('checkbox', {
        name: /market/i,
      })
      fireEvent.click(marketCheckbox)

      expect(onCategoriesChange).toHaveBeenCalledWith(['market'])
    })

    it('calls onCategoriesChange when adding to selection', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={['market']}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const agiCheckbox = screen.getByRole('checkbox', {
        name: /agi skepticism/i,
      })
      fireEvent.click(agiCheckbox)

      expect(onCategoriesChange).toHaveBeenCalledWith(['market', 'agi'])
    })

    it('calls onCategoriesChange when deselecting a category', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={['market', 'agi']}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const agiCheckbox = screen.getByRole('checkbox', {
        name: /agi skepticism/i,
      })
      fireEvent.click(agiCheckbox)

      expect(onCategoriesChange).toHaveBeenCalledWith(['market'])
    })

    it('calls onCategoriesChange with empty array when clicking Show All', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={['market', 'agi']}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const showAllButton = screen.getByRole('button', { name: /show all/i })
      fireEvent.click(showAllButton)

      expect(onCategoriesChange).toHaveBeenCalledWith([])
    })

    it('allows deselecting all to show all', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={['market']}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const marketCheckbox = screen.getByRole('checkbox', {
        name: /market/i,
      })
      fireEvent.click(marketCheckbox)

      expect(onCategoriesChange).toHaveBeenCalledWith([])
    })
  })

  describe('accessibility', () => {
    it('has accessible labels for all checkboxes', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      expect(
        screen.getByRole('checkbox', { name: /capability doubt/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /market/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /agi skepticism/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /dismissive framing/i })
      ).toBeInTheDocument()
    })

    it('checkboxes are focusable with keyboard', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      const capabilityCheckbox = screen.getByRole('checkbox', {
        name: /capability doubt/i,
      })
      capabilityCheckbox.focus()

      expect(capabilityCheckbox).toHaveFocus()
    })
  })

  describe('edge cases', () => {
    it('handles all categories selected', () => {
      render(
        <CategoryCheckboxes
          {...defaultProps}
          selectedCategories={['capability', 'market', 'agi', 'dismissive']}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked()
      })
    })
  })
})
```

---

## Tasks

### Task 1: Create CategoryCheckboxes Component (AC: 1, 2, 3, 4)
- [ ] Create `src/components/controls/category-checkboxes.tsx`
- [ ] Import CATEGORY_ORDER and CATEGORIES from constants
- [ ] Implement checkbox list rendering using CATEGORY_ORDER
- [ ] Implement color-coded checkbox background (color shown when checked)
- [ ] Implement toggle logic (add/remove from array)
- [ ] Add JSDoc documentation

### Task 2: Implement Show All Button (AC: 5)
- [ ] Add "Show All" / "Showing all categories" button at top
- [ ] Toggle text based on selection state
- [ ] Call onCategoriesChange([]) on click
- [ ] Style to match section aesthetic

### Task 3: Style Component (AC: 1)
- [ ] Style checkbox with custom appearance (follow MetricsToggle pattern)
- [ ] Add color-coded background when checked
- [ ] Add checkmark SVG for checked state
- [ ] Add hover states for better UX
- [ ] NOTE: Use single-line labels only (no description line) - categories are self-explanatory unlike metrics

### Task 4: Accessibility (AC: 6, 7)
- [ ] Use native checkbox input for keyboard support
- [ ] Add proper label association via htmlFor
- [ ] Add focus-visible ring styles
- [ ] Ensure color information is not relied upon alone (labels provide context)
- [ ] Test with keyboard navigation

### Task 5: Create Test Suite (AC: 1-7)
- [ ] Create `tests/unit/components/controls/category-checkboxes.test.tsx`
- [ ] Test rendering of all four categories
- [ ] Test checked/unchecked state reflection
- [ ] Test enable/disable interactions
- [ ] Test Show All button functionality
- [ ] Test accessibility (labels, roles)

### Task 6: Integration with ControlPanel
- [ ] Import CategoryCheckboxes in control-panel.tsx
- [ ] Add `selectedCategories` and `onCategoriesChange` to the function destructuring (props already exist in ControlPanelProps interface but are not yet destructured in the function body)
- [ ] Replace placeholder in "Categories" section with CategoryCheckboxes component
- [ ] Wire up selectedCategories and onCategoriesChange props
- [ ] Verify visual appearance in sidebar

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] All tasks completed
- [ ] Tests pass: `bun vitest tests/unit/components/controls/category-checkboxes.test.tsx`
- [ ] No TypeScript errors: `bun run lint`
- [ ] Component renders correctly in ControlPanel
- [ ] Keyboard navigation works (Tab, Space)
- [ ] Checkbox colors match category colors when checked
- [ ] Show All clears selection
- [ ] Ready for Story TSR-3-5 integration

---

## Dev Notes

### Color Values

The colors come from `src/lib/constants/categories.ts` and should match existing category visualization:
- Capability Doubt: `#C9A962` - gold/amber tone
- Market/Bubble: `#7B9E89` - sage green
- AGI Skepticism: `#9E7B7B` - dusty rose
- Dismissive Framing: `#7B7B9E` - slate purple

### Following MetricsToggle Pattern

This component follows the same visual pattern as MetricsToggle:
- Native checkbox with sr-only class for accessibility
- Custom visual div using peer-* Tailwind classes
- Color-coded background when checked
- SVG checkmark icon
- Single-line labels (no description line) - categories are self-explanatory unlike metrics which need FLOP/benchmark context

### Empty = Show All Semantics

Unlike MetricsToggle (where empty might mean "no metrics"), for categories:
- Empty array (`[]`) = show ALL obituaries (no filter applied)
- This matches the existing CategoryFilter behavior
- URL param `?cat=` is omitted when empty

### Integration Pattern

The component is fully controlled - state lives in parent:

```tsx
// In ControlPanel or parent component
const { categories, setCategories } = useVisualizationState()

<CategoryCheckboxes
  selectedCategories={categories}
  onCategoriesChange={setCategories}
/>
```

### Relationship to Existing CategoryFilter

- `src/components/filters/category-filter.tsx` - floating pill bar (kept for backward compatibility)
- `src/components/controls/category-checkboxes.tsx` - sidebar checkboxes (this story)

Both share:
- Same Category type
- Same CATEGORY_ORDER and CATEGORIES constants
- Same filter semantics (empty = all)

Future consideration: may unify or deprecate the floating filter after sidebar controls are complete.

### References

- [Source: docs/sprint-artifacts/epics-timeline-redesign.md#Story 3.4]
- [Source: src/lib/hooks/use-visualization-state.ts - categories state]
- [Source: src/lib/constants/categories.ts - category definitions]
- [Source: src/components/controls/metrics-toggle.tsx - visual pattern reference]
- [Source: src/components/filters/category-filter.tsx - existing filter behavior]

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

### Completion Notes List

### File List
