# Story TSR-3-2: Implement MetricsToggle Component

**Epic:** TSR-3 (Control Panel Implementation)
**Status:** ready-for-dev
**Priority:** High
**Estimation:** 2-3 hours

---

## User Story

**As a** visitor,
**I want** to toggle which metrics appear as background lines,
**So that** I can see different measures of AI progress.

---

## Context

### Background

The visualization tracks AI progress using three distinct metrics from Epoch AI data:
- **Training Compute** - FLOP trend showing exponential compute growth
- **MMLU Score** - Benchmark accuracy frontier showing capability improvements
- **Epoch Capability Index** - Composite capability score

This story implements the UI component that allows users to toggle these metrics on/off. The underlying state management is already complete via `useVisualizationState` hook (Story TSR-3-1), which provides `metrics`, `setMetrics`, and `toggleMetric` for managing enabled metrics.

### Epic Dependencies

- **Story TSR-3-1 (URL State Hook):** Complete - provides `metrics` state and setters
- **Story TSR-1-2 (ControlPanel Shell):** Complete - provides the container with "Background Metrics" section placeholder
- **Story TSR-3-5 (Assemble ControlPanel):** Will integrate this component

### Technical Context

**Available State from useVisualizationState:**
```typescript
const { metrics, setMetrics } = useVisualizationState()
// metrics: MetricType[] - currently enabled metrics
// setMetrics: (m: MetricType[]) => void - set enabled metrics array
```

**MetricType Definition (from src/types/metrics.ts):**
```typescript
type MetricType = 'compute' | 'mmlu' | 'eci'
```

**Metric Colors (from ai-metrics.ts):**
```typescript
compute: 'rgb(118, 185, 0)'  // Green - Training Compute
mmlu: 'rgb(234, 179, 8)'      // Amber - MMLU Score
eci: 'rgb(99, 102, 241)'      // Indigo - Capability Index
```

**Current ControlPanel Placeholder:**
```tsx
<CollapsibleSection title="Background Metrics" defaultOpen>
  {/* TODO: MetricsToggle - Story 3.2 */}
  <p className="text-sm text-muted-foreground">
    Toggle compute, MMLU, and ECI trend lines
  </p>
</CollapsibleSection>
```

### Key Design Decisions

1. **Checkbox-based UI:** Each metric gets a labeled checkbox with color swatch
2. **Multi-select:** Multiple metrics can be enabled simultaneously
3. **Zero-metrics allowed:** Users can disable all metrics (hides all trend lines)
4. **Immediate URL sync:** Toggling updates URL immediately (not debounced like date range)
5. **Controlled component:** State managed externally via props, enabling reuse

---

## Acceptance Criteria

### AC-1: Component Renders Three Metrics

**Given** MetricsToggle component is rendered
**When** it appears in the "Background Metrics" section
**Then** displays three checkboxes with:
- "Training Compute" - with green (#76b900) color swatch
- "MMLU Score" - with amber (#eab308) color swatch
- "Epoch Capability Index" - with indigo (#6366f1) color swatch

**And** each item shows:
- Color swatch (small square matching metric color)
- Metric label
- Optional: brief description below label

### AC-2: Checkboxes Reflect Current State

**Given** metrics prop contains `['compute', 'mmlu']`
**When** component renders
**Then**:
- Training Compute checkbox is checked
- MMLU Score checkbox is checked
- Capability Index checkbox is unchecked

### AC-3: Toggle Updates Metrics Array

**Given** current metrics are `['compute']`
**When** user clicks MMLU checkbox
**Then** `onMetricsChange` is called with `['compute', 'mmlu']`

**Given** current metrics are `['compute', 'mmlu']`
**When** user clicks MMLU checkbox again
**Then** `onMetricsChange` is called with `['compute']`

### AC-4: All Metrics Can Be Disabled

**Given** current metrics are `['compute']`
**When** user unchecks Training Compute
**Then** `onMetricsChange` is called with `[]`

**And** the visualization should handle empty metrics array gracefully (shows no trend lines)

### AC-5: Keyboard Accessibility

**Given** focus is on a checkbox
**When** user presses Space or Enter
**Then** checkbox toggles state

**And** focus ring is visible when navigating with keyboard

### AC-6: Screen Reader Support

**Given** screen reader is active
**When** navigating the component
**Then**:
- Each checkbox has accessible label
- Checked/unchecked state is announced
- Color information is not relied upon for meaning (labels provide context)

---

## Technical Implementation

### Files to Create

```
src/components/controls/metrics-toggle.tsx    # Main component
tests/unit/components/controls/metrics-toggle.test.tsx  # Tests
```

### Implementation Guide

**src/components/controls/metrics-toggle.tsx:**

```tsx
'use client'

import type { MetricType } from '@/types/metrics'
import { cn } from '@/lib/utils'

/**
 * Metric configuration for display
 */
const METRICS = [
  {
    id: 'compute' as const,
    label: 'Training Compute',
    description: 'FLOP trend line',
    color: 'rgb(118, 185, 0)',
  },
  {
    id: 'mmlu' as const,
    label: 'MMLU Score',
    description: 'Benchmark accuracy',
    color: 'rgb(234, 179, 8)',
  },
  {
    id: 'eci' as const,
    label: 'Epoch Capability Index',
    description: 'Composite capability',
    color: 'rgb(99, 102, 241)',
  },
] satisfies Array<{
  id: MetricType
  label: string
  description: string
  color: string
}>

export interface MetricsToggleProps {
  /** Currently enabled metrics */
  enabledMetrics: MetricType[]
  /** Callback when metrics selection changes */
  onMetricsChange: (metrics: MetricType[]) => void
  /** Optional className for container */
  className?: string
}

/**
 * MetricsToggle - Checkbox list for toggling background metric trend lines
 *
 * Allows users to select which AI progress metrics are displayed as
 * background trend lines in the visualization. Each metric has a distinct
 * color that matches its trend line.
 *
 * @example
 * ```tsx
 * const { metrics, setMetrics } = useVisualizationState()
 *
 * <MetricsToggle
 *   enabledMetrics={metrics}
 *   onMetricsChange={setMetrics}
 * />
 * ```
 */
export function MetricsToggle({
  enabledMetrics,
  onMetricsChange,
  className,
}: MetricsToggleProps) {
  const handleToggle = (metricId: MetricType) => {
    const isEnabled = enabledMetrics.includes(metricId)

    if (isEnabled) {
      // Remove metric
      onMetricsChange(enabledMetrics.filter((m) => m !== metricId))
    } else {
      // Add metric
      onMetricsChange([...enabledMetrics, metricId])
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {METRICS.map((metric) => {
        const isChecked = enabledMetrics.includes(metric.id)
        const checkboxId = `metric-${metric.id}`

        return (
          <label
            key={metric.id}
            htmlFor={checkboxId}
            className="flex items-start gap-3 cursor-pointer group"
          >
            {/* Custom checkbox with native input for accessibility */}
            <div className="relative flex items-center justify-center pt-0.5">
              <input
                type="checkbox"
                id={checkboxId}
                checked={isChecked}
                onChange={() => handleToggle(metric.id)}
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
                  backgroundColor: isChecked ? metric.color : 'transparent',
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

            {/* Label and description */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium leading-none">
                {metric.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {metric.description}
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}
```

### Test Coverage Requirements

**tests/unit/components/controls/metrics-toggle.test.tsx:**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MetricsToggle } from '@/components/controls/metrics-toggle'
import type { MetricType } from '@/types/metrics'

describe('MetricsToggle', () => {
  const defaultProps = {
    enabledMetrics: ['compute'] as MetricType[],
    onMetricsChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all three metrics', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText('Training Compute')).toBeInTheDocument()
      expect(screen.getByText('MMLU Score')).toBeInTheDocument()
      expect(screen.getByText('Epoch Capability Index')).toBeInTheDocument()
    })

    it('renders descriptions for each metric', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText('FLOP trend line')).toBeInTheDocument()
      expect(screen.getByText('Benchmark accuracy')).toBeInTheDocument()
      expect(screen.getByText('Composite capability')).toBeInTheDocument()
    })

    it('shows checked state for enabled metrics', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={['compute', 'mmlu']}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      const eciCheckbox = screen.getByRole('checkbox', {
        name: /capability index/i,
      })

      expect(computeCheckbox).toBeChecked()
      expect(mmluCheckbox).toBeChecked()
      expect(eciCheckbox).not.toBeChecked()
    })
  })

  describe('interactions', () => {
    it('calls onMetricsChange when enabling a metric', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute']}
          onMetricsChange={onMetricsChange}
        />
      )

      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      fireEvent.click(mmluCheckbox)

      expect(onMetricsChange).toHaveBeenCalledWith(['compute', 'mmlu'])
    })

    it('calls onMetricsChange when disabling a metric', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute', 'mmlu']}
          onMetricsChange={onMetricsChange}
        />
      )

      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      fireEvent.click(mmluCheckbox)

      expect(onMetricsChange).toHaveBeenCalledWith(['compute'])
    })

    it('allows disabling all metrics', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute']}
          onMetricsChange={onMetricsChange}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      fireEvent.click(computeCheckbox)

      expect(onMetricsChange).toHaveBeenCalledWith([])
    })
  })

  describe('accessibility', () => {
    it('has accessible labels for all checkboxes', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(
        screen.getByRole('checkbox', { name: /training compute/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /mmlu score/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /capability index/i })
      ).toBeInTheDocument()
    })

    it('toggles on keyboard space', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute']}
          onMetricsChange={onMetricsChange}
        />
      )

      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      mmluCheckbox.focus()
      fireEvent.keyDown(mmluCheckbox, { key: ' ', code: 'Space' })

      // Native checkbox handles this, but verify it's focusable
      expect(mmluCheckbox).toHaveFocus()
    })
  })

  describe('edge cases', () => {
    it('handles empty enabledMetrics', () => {
      render(<MetricsToggle {...defaultProps} enabledMetrics={[]} />)

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      const eciCheckbox = screen.getByRole('checkbox', {
        name: /capability index/i,
      })

      expect(computeCheckbox).not.toBeChecked()
      expect(mmluCheckbox).not.toBeChecked()
      expect(eciCheckbox).not.toBeChecked()
    })

    it('handles all metrics enabled', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={['compute', 'mmlu', 'eci']}
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

### Task 1: Create MetricsToggle Component (AC: 1, 2, 3, 4)
- [ ] Create `src/components/controls/metrics-toggle.tsx`
- [ ] Define METRICS constant with id, label, description, color
- [ ] Implement checkbox list rendering
- [ ] Implement color swatch with metric-specific colors
- [ ] Implement toggle logic (add/remove from array)
- [ ] Add JSDoc documentation

### Task 2: Style Component (AC: 1)
- [ ] Style checkbox with custom appearance
- [ ] Add color-coded background when checked
- [ ] Add checkmark SVG for checked state
- [ ] Style label and description text
- [ ] Add hover states for better UX

### Task 3: Accessibility (AC: 5, 6)
- [ ] Use native checkbox input for keyboard support
- [ ] Add proper label association via htmlFor
- [ ] Add focus-visible ring styles
- [ ] Ensure color is not sole indicator of state
- [ ] Test with keyboard navigation

### Task 4: Create Test Suite (AC: 1-6)
- [ ] Create `tests/unit/components/controls/metrics-toggle.test.tsx`
- [ ] Test rendering of all three metrics
- [ ] Test checked/unchecked state reflection
- [ ] Test enable/disable interactions
- [ ] Test empty array handling
- [ ] Test accessibility (labels, roles)

### Task 5: Integration with ControlPanel
- [ ] Import MetricsToggle in control-panel.tsx
- [ ] Replace placeholder in "Background Metrics" section
- [ ] Wire up props from ControlPanelProps
- [ ] Verify visual appearance in sidebar

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] All tasks completed
- [ ] Tests pass: `bun vitest tests/unit/components/controls/metrics-toggle.test.tsx`
- [ ] No TypeScript errors: `bun run lint`
- [ ] Component renders correctly in ControlPanel
- [ ] Keyboard navigation works (Tab, Space)
- [ ] Color swatches match metric colors
- [ ] Ready for Story TSR-3-5 integration

---

## Dev Notes

### Color Values

The colors come from `src/data/ai-metrics.ts` and should match exactly:
- Compute: `rgb(118, 185, 0)` - bright green for NVIDIA/compute association
- MMLU: `rgb(234, 179, 8)` - amber for benchmark/scoring
- ECI: `rgb(99, 102, 241)` - indigo for composite/index

### Native vs Custom Checkbox

Using native `<input type="checkbox">` with `sr-only` class:
- Provides proper keyboard handling out of the box
- Screen readers announce state correctly
- Custom visual styling via sibling div with peer-* classes
- Focus ring on custom visual via peer-focus-visible

### Integration Pattern

The component is fully controlled - state lives in parent (ControlPanel or page):

```tsx
// In ControlPanel or parent component
const { metrics, setMetrics } = useVisualizationState()

<MetricsToggle
  enabledMetrics={metrics}
  onMetricsChange={setMetrics}
/>
```

### References

- [Source: docs/sprint-artifacts/epics-timeline-redesign.md#Story 3.2]
- [Source: src/lib/hooks/use-visualization-state.ts - metrics state]
- [Source: src/data/ai-metrics.ts - metric colors and definitions]
- [Radix Checkbox: https://www.radix-ui.com/primitives/docs/components/checkbox]

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

### Completion Notes List

### File List
