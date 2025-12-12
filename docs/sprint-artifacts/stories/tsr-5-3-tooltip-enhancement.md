# Story TSR-5-3: Tooltip Enhancement

**Epic:** TSR-5 (Polish & Mobile)
**Status:** ready-for-dev
**Priority:** Medium
**Estimation:** 1-2 hours

---

## User Story

**As a** visitor,
**I want** the tooltip to show the FLOP value when I hover on an obituary dot,
**So that** I can see the AI progress level at each obituary's date.

---

## Context

### Background

The Timeline Visualization Redesign transformed the Y-axis to a logarithmic FLOP scale (Epic TSR-2). Each obituary is now positioned vertically based on the AI training compute frontier at the time the skeptical claim was made. The tooltip currently shows claim preview, source, and date, but does not display the underlying FLOP value that determines the point's vertical position.

Adding the FLOP value to the tooltip completes the information loop - users can see both the claim and the exact AI progress level when it was made, reinforcing the visualization's core message.

**Current Tooltip Content:**
- Claim preview (truncated to 100 chars)
- Source name
- Formatted date

**New Content to Add:**
- AI Progress: "10^24 FLOP" (formatted with superscript notation)

### Epic Dependencies

- **Story TSR-2-1 (Scale Utilities):** Complete - `formatFlopTick()` and `toSuperscript()` available
- **Story TSR-2-2 (ai-metrics.ts Helpers):** Complete - `getActualFlopAtDate()` available
- **Story TSR-2-3 (ScatterPlot Y-Axis):** Complete - Obituaries positioned on log scale

### Technical Context

**Available Utilities:**

1. **formatFlopTick** (`src/lib/utils/scales.ts`):
```typescript
export function formatFlopTick(value: number): string {
  const exp = Math.round(Math.log10(value))
  return `10${toSuperscript(exp)}`
}
// Example: formatFlopTick(1e24) returns "10^24" with superscript
```

2. **getActualFlopAtDate** (`src/data/ai-metrics.ts`):
```typescript
export function getActualFlopAtDate(series: AIMetricSeries, date: Date): number {
  const logValue = getMetricValueAtDate(series, date)
  return logToFlop(logValue) // Converts log10 to actual FLOP
}
// Example: getActualFlopAtDate(trainingComputeFrontier, new Date('2023-03-01'))
// Returns ~10^25.3 FLOP
```

3. **trainingComputeFrontier** (`src/data/ai-metrics.ts`):
```typescript
export const trainingComputeFrontier: AIMetricSeries = {
  id: 'compute',
  label: 'Training Compute',
  color: 'rgb(118, 185, 0)',
  unit: 'log10 FLOP',
  data: [ /* historical compute data */ ]
}
```

**Current TooltipCard Props:**
```typescript
export interface TooltipCardProps {
  obituary: ObituarySummary
  x: number
  y: number
  containerBounds: DOMRect
}
```

The `obituary.date` field (ISO 8601 string) provides the date needed to look up the FLOP value.

### Key Design Decisions

1. **Use existing formatFlopTick:** Consistent with Y-axis tick labels already displaying superscript notation.

2. **Label as "AI Progress":** More user-friendly than "Training Compute FLOP" and aligns with the visualization's narrative.

3. **Secondary text styling:** FLOP display should be visually subordinate to the claim - use `text-muted` color and smaller font.

4. **Position in footer:** Add below the source/date row to maintain existing visual hierarchy.

---

## Acceptance Criteria

### AC-1: FLOP Value Displays in Tooltip

**Given** user hovers on an obituary dot
**When** tooltip displays
**Then** tooltip includes new AI Progress line showing FLOP value

**And** tooltip content includes:
- Existing: claim preview (truncated to 100 chars)
- Existing: source name and formatted date
- New: "AI Progress: 10^XX FLOP" where XX is the exponent at that date

### AC-2: FLOP Value is Accurate

**Given** an obituary dated "2023-03-01"
**When** tooltip displays FLOP value
**Then** value matches `getActualFlopAtDate(trainingComputeFrontier, date)`

**And** for obituaries at different dates:
- 2010: ~10^18 FLOP
- 2015: ~10^20 FLOP
- 2020: ~10^23 FLOP
- 2023: ~10^25 FLOP

### AC-3: Superscript Formatting

**Given** FLOP value displayed
**When** rendering the exponent
**Then** uses Unicode superscript characters (e.g., "10^24" with actual superscript)
**And** matches Y-axis tick label formatting

### AC-4: Styling is Subtle

**Given** tooltip renders with FLOP value
**When** user reads content
**Then** FLOP line uses:
- `text-xs` (smaller than source/date)
- `text-[var(--text-muted)]` color
- Positioned below source/date row
- Does not increase tooltip height significantly

---

## Technical Implementation

### Files to Modify

```
src/components/visualization/tooltip-card.tsx   # Add FLOP display
```

### Implementation Approach

#### Step 1: Import Required Utilities

```typescript
// tooltip-card.tsx - add imports
import { formatFlopTick } from '@/lib/utils/scales'
import { getActualFlopAtDate, trainingComputeFrontier } from '@/data/ai-metrics'
```

#### Step 2: Calculate FLOP Value

Inside the component, calculate the FLOP value from the obituary date:

```typescript
// Inside TooltipCard component
const obituaryDate = new Date(obituary.date)
const flopValue = getActualFlopAtDate(trainingComputeFrontier, obituaryDate)
const formattedFlop = formatFlopTick(flopValue)
```

#### Step 3: Add FLOP Display to JSX

Add a new row below the existing source/date footer:

```tsx
{/* Existing footer */}
<div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
  <span className="font-mono truncate max-w-[140px]">{obituary.source}</span>
  <span className="font-mono text-[var(--text-muted)]">{formatDate(obituary.date)}</span>
</div>

{/* New FLOP display */}
<div className="text-xs text-[var(--text-muted)] mt-2 font-mono">
  AI Progress: {formattedFlop} FLOP
</div>
```

### Visual Layout

```
+------------------------------------------+
|  "This is the claim preview text that    |
|   gets truncated after 100 characters... |
+------------------------------------------+
|  Source Name              Dec 15, 2023   |
+------------------------------------------+
|  AI Progress: 10^25 FLOP                 |
+------------------------------------------+
```

### Test Coverage

Add unit test for tooltip with FLOP display:

```typescript
// tests/unit/components/visualization/tooltip-card.test.tsx

describe('TooltipCard', () => {
  it('displays formatted FLOP value', () => {
    const obituary: ObituarySummary = {
      _id: 'test-1',
      slug: 'test-obituary',
      claim: 'AI will never...',
      source: 'Test Source',
      date: '2023-03-01',
      categories: ['capability'],
    }

    render(
      <TooltipCard
        obituary={obituary}
        x={100}
        y={100}
        containerBounds={mockBounds}
      />
    )

    // Should display FLOP in superscript notation
    expect(screen.getByText(/AI Progress:/)).toBeInTheDocument()
    expect(screen.getByText(/10.*FLOP/)).toBeInTheDocument()
  })

  it('calculates correct FLOP for obituary date', () => {
    // Test that FLOP calculation uses obituary.date correctly
    const earlyObituary = { ...baseObituary, date: '2015-01-01' }
    const recentObituary = { ...baseObituary, date: '2023-06-01' }

    // Early date should show lower exponent than recent date
    // (specific values depend on training compute data)
  })
})
```

---

## Tasks

### Task 1: Add Imports (AC: 1, 2, 3)
- [ ] Import `formatFlopTick` from `@/lib/utils/scales`
- [ ] Import `getActualFlopAtDate` and `trainingComputeFrontier` from `@/data/ai-metrics`

### Task 2: Calculate FLOP Value (AC: 2)
- [ ] Parse `obituary.date` to Date object
- [ ] Call `getActualFlopAtDate(trainingComputeFrontier, obituaryDate)`
- [ ] Format with `formatFlopTick(flopValue)`

### Task 3: Add FLOP Display JSX (AC: 1, 3, 4)
- [ ] Add new div below source/date footer
- [ ] Apply styling: `text-xs text-[var(--text-muted)] mt-2 font-mono`
- [ ] Display "AI Progress: {formattedFlop} FLOP"

### Task 4: Adjust Tooltip Dimensions (AC: 4)
- [ ] Increase `tooltipHeight` constant from 120px to ~140px to accommodate new FLOP line
- [ ] Verify positioning still works with edge detection (hover near top edge - tooltip should flip)

### Task 5: Add Unit Tests (AC: 1, 2)
- [ ] Update `tests/unit/components/visualization/tooltip-card.test.tsx` (file exists)
- [ ] Add test: FLOP value displays in tooltip
- [ ] Add test: formatting matches expected superscript pattern (10 + Unicode superscript)

### Task 6: Manual Verification (AC: 1, 2, 3, 4)
- [ ] Hover on obituaries from different years
- [ ] Verify FLOP values look reasonable for dates
- [ ] Confirm superscript renders correctly
- [ ] Check tooltip doesn't overflow or clip
- [ ] Verify styling is subtle/secondary

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] All tasks completed
- [ ] Tooltip shows "AI Progress: 10^XX FLOP" on hover
- [ ] FLOP value uses superscript notation matching Y-axis
- [ ] Styling is subtle (muted color, small font)
- [ ] Tooltip positioning still works correctly
- [ ] No TypeScript errors: `bun run lint`
- [ ] Tests pass: `bun test`
- [ ] Manual testing confirms correct values for various dates

---

## Dev Notes

### Unicode Superscript Characters

The `toSuperscript` function in scales.ts uses these Unicode characters:
```
0: \u2070 (zero)
1: \u00b9 (one)
2: \u00b2 (two)
3: \u00b3 (three)
4-9: \u2074-\u2079
-: \u207b (minus)
```

Example: `10^24` renders as `10` + superscript chars for `24`

### FLOP Value Ranges by Era

| Era | Approximate FLOP | Example |
|-----|------------------|---------|
| 2010-2015 | 10^18 - 10^20 | Early deep learning |
| 2015-2019 | 10^20 - 10^23 | AlphaGo, GPT-1/2 |
| 2020-2022 | 10^23 - 10^24 | GPT-3, scaling era |
| 2023+ | 10^25 - 10^27 | GPT-4, frontier models |

### Tooltip Height Adjustment

Current `tooltipHeight = 120`. Adding one more text line may require:
- Increase to ~140-150px for proper edge detection
- Or keep 120 if line fits within existing padding

Test by hovering points near top edge - tooltip should flip to below if too close to top.

### References

- [Source: docs/sprint-artifacts/epics-timeline-redesign.md - Story 5.3]
- [Source: src/lib/utils/scales.ts - formatFlopTick, toSuperscript]
- [Source: src/data/ai-metrics.ts - getActualFlopAtDate, trainingComputeFrontier]
- [Source: src/components/visualization/tooltip-card.tsx - Current implementation]

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- To be filled by dev agent -->

### Debug Log References

### Completion Notes List

### File List
