# Table View Interface Improvements

Design document for two interface enhancements to the AI Obituaries table view.

## Problem Statement

1. **Graph controls are useless in table view** - The "Background Metrics" and "AI Progress Era" controls only affect the scatter plot visualization, yet remain visible when viewing the table.

2. **Table lacks AI context** - The scatter plot shows WHERE each claim falls on the AI progress curve (via Y-axis position), but the table shows no equivalent context about AI capability at the time of each claim.

---

## 1. Animate Graph Controls Based on View Mode

### Current State
- ControlPanel has 4 sections: Background Metrics, AI Progress Era, Categories, Display Options
- All sections visible regardless of view mode (timeline vs table)
- View mode managed by `useViewModeStorage()` hook in localStorage

### Analysis: Which Controls Are Relevant?

| Section | Timeline View | Table View |
|---------|--------------|------------|
| Background Metrics | Controls trend lines | **Irrelevant** |
| AI Progress Era | Controls Y-axis domain | **Irrelevant** |
| Categories | Filters visible points | **Still relevant** (filters table rows) |
| Display Options | Future features | TBD |

### Design

**Behavior:**
- When switching to table view, smoothly collapse "Background Metrics" and "AI Progress Era"
- Keep "Categories" visible (table uses same filter)
- Show subtle hint when controls are hidden

**Animation:**
- 300ms ease-in-out transition
- Height collapses to 0 with opacity fade
- Uses framer-motion `AnimatePresence` for exit animations

**Visual hint when collapsed:**
```
┌─────────────────────────────────────┐
│ ℹ️ Chart controls hidden in table  │
│    view. Switch to Timeline to     │
│    adjust metrics and date range.  │
└─────────────────────────────────────┘
```

### Implementation

**File: `src/components/controls/control-panel-wrapper.tsx`**
```typescript
import { useViewModeStorage } from '@/components/obituary/table-view-toggle'

export function ControlPanelWrapper({ ... }) {
  const { mode, isHydrated } = useViewModeStorage()
  const isTableView = isHydrated && mode === 'table'

  return (
    <ControlPanel
      // ...existing props
      isChartControlsHidden={isTableView}
    />
  )
}
```

**File: `src/components/controls/control-panel.tsx`**
```tsx
import { motion, AnimatePresence } from 'framer-motion'

interface ControlPanelProps {
  // ...existing props
  isChartControlsHidden?: boolean
}

export function ControlPanel({ isChartControlsHidden = false, ... }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">...</div>

      <div className="flex-1 overflow-y-auto">
        {/* Chart-specific controls - animated */}
        <AnimatePresence initial={false}>
          {!isChartControlsHidden && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <CollapsibleSection title="Background Metrics" defaultOpen>
                <MetricsToggle ... />
              </CollapsibleSection>
              <CollapsibleSection title="AI Progress Era" defaultOpen>
                <DateRangeSlider ... />
              </CollapsibleSection>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint when chart controls hidden */}
        <AnimatePresence>
          {isChartControlsHidden && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-3 text-sm text-muted-foreground bg-secondary/30 border-b border-border"
            >
              Chart controls hidden in table view
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories - always visible */}
        <CollapsibleSection title="Categories" defaultOpen>
          <CategoryCheckboxes ... />
        </CollapsibleSection>

        {/* Display Options - always visible */}
        <CollapsibleSection title="Display Options" defaultOpen={false}>
          ...
        </CollapsibleSection>
      </div>
    </div>
  )
}
```

---

## 2. Show AI Capability Context in Table

### Current State
- Table columns: Date, Source, Claim, Category, Actions
- No indication of AI capability level at time of each claim
- Scatter plot communicates this via Y-axis position on FLOP scale

### Design

**New "AI Level" column** showing training compute at each claim's date:

```
┌──────────────────┐
│ 🟠 10^25.3       │
└──────────────────┘
```

**Components:**
1. Colored dot indicating capability era
2. Formatted compute value (superscript notation)
3. Hover tooltip with full metrics breakdown

**Color Scale for Dot:**

| Compute (log₁₀ FLOP) | Color | Era |
|---------------------|-------|-----|
| < 20 | Gray | Early AI (pre-2000) |
| 20-23 | Blue | Pre-LLM era |
| 23-25 | Purple | GPT-3 era |
| > 25 | Orange | Frontier (GPT-4+) |

**Tooltip Content:**
```
AI Progress at this date:
─────────────────────────
Training Compute: 10^25.3 FLOP
MMLU Score: 87.2%
Capability Index: 154

(MMLU/ECI show "Not yet measured"
for dates before their availability)
```

### Implementation

**New File: `src/components/obituary/ai-context-cell.tsx`**
```tsx
'use client'

import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getAllMetricsAtDate } from '@/data/ai-metrics'

interface AIContextCellProps {
  date: string
}

/**
 * Get color based on training compute level.
 * Maps log₁₀ FLOP to era-based colors.
 */
function getComputeColor(logFlop: number): string {
  if (logFlop < 20) return 'var(--text-muted)'     // Early AI
  if (logFlop < 23) return '#3b82f6'               // Blue - pre-LLM
  if (logFlop < 25) return '#8b5cf6'               // Purple - GPT-3 era
  return '#f59e0b'                                  // Orange - frontier
}

/**
 * Format compute value with superscript notation.
 * "10^24.3" → "10²⁴·³"
 */
function formatComputeCompact(logFlop: number): string {
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '.': '·'
  }
  const exp = logFlop.toFixed(1)
  const superExp = exp.split('').map(c => superscripts[c] || c).join('')
  return `10${superExp}`
}

export function AIContextCell({ date }: AIContextCellProps) {
  const metrics = useMemo(
    () => getAllMetricsAtDate(new Date(date)),
    [date]
  )

  const dotColor = getComputeColor(metrics.compute)
  const compactValue = formatComputeCompact(metrics.compute)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: dotColor }}
              aria-hidden="true"
            />
            <span className="font-mono text-xs text-[--text-secondary]">
              {compactValue}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px]">
          <div className="text-xs space-y-1.5">
            <div className="font-medium text-[--text-primary]">
              AI Progress at this date
            </div>
            <div className="space-y-0.5 text-[--text-secondary]">
              <div>Compute: {metrics.computeFormatted} FLOP</div>
              <div>
                MMLU: {metrics.mmlu !== null
                  ? `${metrics.mmlu}%`
                  : 'Not yet measured'}
              </div>
              <div>
                ECI: {metrics.eci !== null
                  ? metrics.eci
                  : 'Not yet measured'}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

**Update: `src/components/obituary/obituary-table.tsx`**

Add column header:
```tsx
<tr className="border-b border-[--border]">
  <SortableHeader column="date" ...>Date</SortableHeader>
  <SortableHeader column="source" ...>Source</SortableHeader>
  <th scope="col" className="py-3 px-4 text-[--text-secondary] font-medium">
    Claim
  </th>
  {/* New AI Level column */}
  <th scope="col" className="py-3 px-4 text-[--text-secondary] font-medium">
    AI Level
  </th>
  <SortableHeader column="category" ...>Category</SortableHeader>
  <th scope="col" className="py-3 px-4">
    <VisuallyHidden>Actions</VisuallyHidden>
  </th>
</tr>
```

Add column cell:
```tsx
<td className="py-3 px-4">
  <AIContextCell date={obituary.date} />
</td>
```

Update colSpan for empty state and footer:
```tsx
<td colSpan={6} ...>  {/* was 5 */}
```

### Optional: Make AI Level Sortable

If sorting is desired, pre-compute metrics to avoid O(n²) comparisons:

```typescript
const dataWithMetrics = useMemo(() => {
  return displayData.map(ob => ({
    ...ob,
    _aiCompute: getAllMetricsAtDate(new Date(ob.date)).compute
  }))
}, [displayData])

// In sort switch:
case 'aiLevel':
  return multiplier * (a._aiCompute - b._aiCompute)
```

Note: Since date and AI level are strongly correlated (later = higher compute), date sorting effectively provides the same ordering. Making AI Level sortable is optional.

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/components/controls/control-panel.tsx` | Add `isChartControlsHidden` prop, AnimatePresence wrapper |
| `src/components/controls/control-panel-wrapper.tsx` | Import `useViewModeStorage`, pass view mode state |
| `src/components/obituary/ai-context-cell.tsx` | **New file** - AI metrics cell with tooltip |
| `src/components/obituary/obituary-table.tsx` | Add AI Level column |

---

## Accessibility Considerations

1. **Control Panel Animation**
   - Uses `prefers-reduced-motion` via framer-motion defaults
   - Hidden hint text is still accessible to screen readers

2. **AI Context Cell**
   - Tooltip triggered on focus (keyboard accessible)
   - Color is decorative (info available in tooltip)
   - `cursor-help` indicates interactive element

3. **Table Semantics**
   - Column count updated for proper grid semantics
   - New column has descriptive header

---

## Future Enhancements

1. **Era badges** - Show "GPT-4 Era" text instead of just compute value
2. **Frontier model name** - Use `getFrontierModelAtDate()` to show "GPT-4" in tooltip
3. **Mini sparkline** - Tiny inline chart showing position on progress curve
4. **Filter by AI level** - Add AI era filter to Categories section
