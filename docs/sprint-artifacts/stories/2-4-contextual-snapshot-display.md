# Story 2-4: Contextual Snapshot Display

**Story Key:** 2-4-contextual-snapshot-display
**Epic:** Epic 2 - Core Content Display
**Status:** drafted
**Priority:** High

---

## User Story

**As a** visitor,
**I want** to see what AI could do when each claim was made,
**So that** I can judge the prediction against reality at the time.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-2.4.1 | Context section displays on detail page | "Context at Time" section visible below main obituary content |
| AC-2.4.2 | Stock prices display if available | NVDA/MSFT/GOOG prices formatted as currency (e.g., "$145.23") |
| AC-2.4.3 | AI model info displays if available | "Latest AI Model" card shows model name (e.g., "GPT-4") |
| AC-2.4.4 | Benchmark displays if available | Benchmark name and score shown (score as percentage with gold styling) |
| AC-2.4.5 | Milestone displays if available | "AI Milestone" card shows milestone description |
| AC-2.4.6 | Additional note displays if available | Note text in muted/italic styling below cards |
| AC-2.4.7 | Graceful partial data handling | Only available fields shown; missing fields are omitted (no "N/A" or placeholder) |
| AC-2.4.8 | Graceful empty data handling | "Context data unavailable" message shown in muted text when no context exists |
| AC-2.4.9 | Currency formatting correct | Prices use `Intl.NumberFormat` with USD currency format |
| AC-2.4.10 | Section styled consistently | Uses Deep Archive card styling (bg-card, border, 12px radius) |

---

## Technical Approach

### Implementation Overview

Create the `ObituaryContext` component that displays contextual metadata about the AI landscape at the time each claim was made. This component renders below the main obituary detail and shows available data including stock prices (NVDA, MSFT, GOOG), the latest AI model at the time, benchmark scores, milestones, and additional notes. The component handles partial and empty data gracefully.

### Key Implementation Details

1. **Component Architecture**
   - Create `src/components/obituary/obituary-context.tsx` as a Server Component
   - Accept `ContextMetadata` as prop from parent ObituaryDetail page
   - Use conditional rendering to show only available fields

2. **Stock Prices Display**
   - Group NVDA, MSFT, GOOG prices in a single "Stock Prices" card
   - Format using `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
   - Display stock ticker symbols (NVDA:, MSFT:, GOOG:)

3. **AI Model Card**
   - Display current model name (e.g., "GPT-4", "Claude 2")
   - Simple text display in card format

4. **Benchmark Card**
   - Show benchmark name with score
   - Score formatted as percentage with gold accent color
   - Use Geist Mono font for score

5. **Milestone Card**
   - Display milestone description text
   - May be longer text, allow wrapping

6. **Additional Note**
   - Display below cards as muted italic text
   - Full-width, not in card format

7. **Empty State**
   - Check if all context fields are undefined/null
   - Show "Context data unavailable" in muted text if completely empty

### Reference Implementation

```tsx
// src/components/obituary/obituary-context.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ContextMetadata } from '@/types/obituary'

interface ObituaryContextProps {
  context: ContextMetadata
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function ObituaryContext({ context }: ObituaryContextProps) {
  const hasAnyData =
    context.nvdaPrice !== undefined ||
    context.msftPrice !== undefined ||
    context.googPrice !== undefined ||
    context.benchmarkName !== undefined ||
    context.currentModel !== undefined ||
    context.milestone !== undefined ||
    context.note !== undefined

  if (!hasAnyData) {
    return (
      <section className="mt-12 pt-8 border-t border-[--border]">
        <h2 className="text-lg font-semibold text-[--text-primary] mb-4">
          Context at Time
        </h2>
        <p className="text-[--text-muted]">Context data unavailable</p>
      </section>
    )
  }

  const hasStockPrices =
    context.nvdaPrice !== undefined ||
    context.msftPrice !== undefined ||
    context.googPrice !== undefined

  return (
    <section className="mt-12 pt-8 border-t border-[--border]">
      <h2 className="text-lg font-semibold text-[--text-primary] mb-4">
        Context at Time
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Stock Prices */}
        {hasStockPrices && (
          <Card className="bg-[--bg-card] border-[--border]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[--text-secondary]">
                Stock Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {context.nvdaPrice !== undefined && (
                <p className="text-[--text-primary]">
                  NVDA: {formatCurrency(context.nvdaPrice)}
                </p>
              )}
              {context.msftPrice !== undefined && (
                <p className="text-[--text-primary]">
                  MSFT: {formatCurrency(context.msftPrice)}
                </p>
              )}
              {context.googPrice !== undefined && (
                <p className="text-[--text-primary]">
                  GOOG: {formatCurrency(context.googPrice)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Model */}
        {context.currentModel && (
          <Card className="bg-[--bg-card] border-[--border]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[--text-secondary]">
                Latest AI Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[--text-primary]">{context.currentModel}</p>
            </CardContent>
          </Card>
        )}

        {/* Benchmark */}
        {context.benchmarkName && (
          <Card className="bg-[--bg-card] border-[--border]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[--text-secondary]">
                Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[--text-primary]">
                {context.benchmarkName}
                {context.benchmarkScore !== undefined && (
                  <span className="ml-2 text-[--accent-primary] font-mono">
                    {context.benchmarkScore}%
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Milestone */}
        {context.milestone && (
          <Card className="bg-[--bg-card] border-[--border]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[--text-secondary]">
                AI Milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[--text-primary]">{context.milestone}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Note */}
      {context.note && (
        <p className="mt-4 text-sm text-[--text-muted] italic">
          {context.note}
        </p>
      )}
    </section>
  )
}
```

### Integration with Detail Page

```tsx
// src/app/obituary/[slug]/page.tsx (modification)
import { ObituaryContext } from '@/components/obituary/obituary-context'

export default async function ObituaryPage({ params }: PageProps) {
  const { slug } = await params
  const obituary = await getObituaryBySlug(slug)

  if (!obituary) {
    notFound()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <ObituaryDetail obituary={obituary} />
      <ObituaryContext context={obituary.context} />
    </main>
  )
}
```

---

## Tasks

### Task 1: Create ObituaryContext Component (30 min)
- [ ] Create `src/components/obituary/obituary-context.tsx`
- [ ] Import shadcn/ui Card components
- [ ] Import ContextMetadata type from `@/types/obituary`
- [ ] Implement `formatCurrency` helper function
- [ ] Implement `hasAnyData` check for empty state
- [ ] Implement Stock Prices card with conditional rendering
- [ ] Implement Latest AI Model card with conditional rendering
- [ ] Implement Benchmark card with score in gold/mono styling
- [ ] Implement AI Milestone card with conditional rendering
- [ ] Implement Additional Note in muted italic styling
- [ ] Implement empty state with "Context data unavailable" message

### Task 2: Integrate with Detail Page (10 min)
- [ ] Open `src/app/obituary/[slug]/page.tsx`
- [ ] Import `ObituaryContext` component
- [ ] Add `<ObituaryContext context={obituary.context} />` after `<ObituaryDetail>`
- [ ] Verify context data is included in existing `getObituaryBySlug` query

### Task 3: Verify shadcn Card Component (5 min)
- [ ] Check if Card component exists at `src/components/ui/card.tsx`
- [ ] If not present, add via: `npx shadcn@latest add card`
- [ ] Verify Card exports: Card, CardHeader, CardTitle, CardContent

### Task 4: Write Unit Tests (30 min)
- [ ] Create `tests/unit/components/obituary/obituary-context.test.tsx`
- [ ] Test: Renders "Context at Time" heading
- [ ] Test: Shows empty state when no context data
- [ ] Test: Displays stock prices when available
- [ ] Test: Formats currency correctly (USD format)
- [ ] Test: Displays AI model when available
- [ ] Test: Displays benchmark with score in percentage
- [ ] Test: Displays milestone when available
- [ ] Test: Displays note in muted styling
- [ ] Test: Shows only available fields (partial data)
- [ ] Test: Uses correct CSS classes for Deep Archive styling

### Task 5: Manual Testing (15 min)
- [ ] Navigate to obituary with full context data
- [ ] Verify all cards display with correct content
- [ ] Verify stock prices formatted as "$XXX.XX"
- [ ] Verify benchmark score shows with "%" and gold color
- [ ] Navigate to obituary with partial context (e.g., only stock prices)
- [ ] Verify only stock prices card shows
- [ ] Navigate to obituary with no context data
- [ ] Verify "Context data unavailable" message shows
- [ ] Verify section has border-top separator
- [ ] Verify cards use correct background color (--bg-card)
- [ ] Verify responsive grid layout on mobile/desktop

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Story 2-3 (Individual Obituary Pages) | Complete | Detail page structure, context data in query |
| Story 1-2 (Design System Setup) | Complete | CSS variables for colors |
| shadcn/ui Card component | Required | May need to add if not present |

---

## Definition of Done

- [ ] `ObituaryContext` component exists at `src/components/obituary/obituary-context.tsx`
- [ ] Component integrated into obituary detail page
- [ ] Stock prices display with correct USD currency formatting
- [ ] AI model displays when available
- [ ] Benchmark displays with percentage score in gold color
- [ ] Milestone displays when available
- [ ] Additional note displays in muted italic text
- [ ] Partial data handled gracefully (only available fields shown)
- [ ] Empty state shows "Context data unavailable"
- [ ] Cards use Deep Archive styling (bg-card, border, rounded)
- [ ] Section has proper spacing and border separator
- [ ] Unit tests pass
- [ ] No TypeScript errors
- [ ] Lint passes (`npm run lint`)

---

## Test Scenarios

### Unit Test Scenarios

1. **Empty Context Shows Message**
   - Pass context with all undefined fields
   - Expect "Context data unavailable" text rendered

2. **Full Context Renders All Cards**
   - Pass context with all fields populated
   - Expect 4 cards: Stock Prices, AI Model, Benchmark, Milestone

3. **Stock Prices Format Correctly**
   - Pass context with nvdaPrice: 145.50
   - Expect "$145.50" displayed

4. **All Stock Prices Display**
   - Pass context with nvdaPrice, msftPrice, googPrice
   - Expect all three ticker symbols with prices

5. **Partial Stock Prices Display**
   - Pass context with only nvdaPrice (msftPrice, googPrice undefined)
   - Expect only NVDA price shown

6. **AI Model Card Renders**
   - Pass context with currentModel: "GPT-4"
   - Expect "GPT-4" in Latest AI Model card

7. **Benchmark With Score Renders**
   - Pass context with benchmarkName: "MMLU", benchmarkScore: 86.5
   - Expect "MMLU" text and "86.5%" in gold styling

8. **Benchmark Without Score Renders**
   - Pass context with benchmarkName: "MMLU", benchmarkScore undefined
   - Expect "MMLU" text without percentage

9. **Milestone Card Renders**
   - Pass context with milestone: "ChatGPT launched"
   - Expect milestone text in AI Milestone card

10. **Note Renders in Muted Style**
    - Pass context with note: "First AI winter reference"
    - Expect note text with muted/italic classes

11. **Section Has Border Top**
    - Render with any context data
    - Expect border-t class on section element

12. **Cards Use Deep Archive Colors**
    - Render with stock prices
    - Expect Card has bg-[--bg-card] class

13. **Partial Context Only Shows Available**
    - Pass context with only milestone and note
    - Expect only Milestone card and note, no Stock/Model/Benchmark cards

### Manual Testing Checklist

- [ ] Navigate to obituary with full context data
- [ ] All four cards visible (Stock Prices, AI Model, Benchmark, Milestone)
- [ ] Note text visible below cards
- [ ] Stock prices show dollar sign and two decimal places
- [ ] Benchmark score shows percentage with gold color
- [ ] Navigate to obituary with only stock prices
- [ ] Only Stock Prices card visible
- [ ] Navigate to obituary with no context data
- [ ] "Context data unavailable" message visible
- [ ] Cards have correct background color (darker than page bg)
- [ ] Cards have visible border
- [ ] Cards have rounded corners
- [ ] Grid layout is 2 columns on desktop
- [ ] Grid layout is 1 column on mobile
- [ ] Section separated from above content by border line

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/obituary/obituary-context.tsx` | Create | Context metadata display component |
| `src/app/obituary/[slug]/page.tsx` | Modify | Add ObituaryContext below ObituaryDetail |
| `src/components/ui/card.tsx` | Add | shadcn Card component (if not present) |
| `tests/unit/components/obituary/obituary-context.test.tsx` | Create | Component unit tests |

---

## FR Coverage

This story satisfies the following Functional Requirements:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR4 | System displays contextual data for each obituary (AI capabilities, stock prices, benchmarks at time of claim) | ObituaryContext component displays stock prices (NVDA, MSFT, GOOG), current AI model, benchmark name/score, and milestones |
| FR23 | Obituary pages include full contextual snapshot display | ObituaryContext is integrated into the obituary detail page, showing all available context metadata |

---

## Learnings from Previous Story

From Story 2-3 (Individual Obituary Pages):

1. **Category Constants Pattern** - Constants exist in `src/lib/constants/categories.ts` - follow similar pattern if needed for context labels
2. **ISR Caching Pattern** - Context data already included in `getObituaryBySlug` query with `next: { tags: ['obituaries'] }`
3. **Deep Archive Card Styling** - Use `bg-[--bg-card] border-[--border]` classes for consistent card appearance
4. **Component Location** - Follow pattern of placing obituary-related components in `src/components/obituary/`
5. **Conditional Rendering** - Story 2-3 showed good pattern for defensive checks before rendering - apply same to context fields
6. **Font Classes** - `font-mono` available for Geist Mono (use for benchmark scores), `font-serif` for Instrument Serif

---

## Dev Agent Record

_This section is populated during implementation_

### Context Reference
`docs/sprint-artifacts/story-contexts/2-4-contextual-snapshot-display-context.xml`

### Implementation Notes
_To be filled during implementation_

### Files Created
_To be filled during implementation_

### Files Modified
_To be filled during implementation_

### Deviations from Plan
_To be filled during implementation_

### Issues Encountered
_To be filled during implementation_

### Key Decisions
_To be filled during implementation_

### Test Results
_To be filled during implementation_

### Completion Timestamp
_To be filled during implementation_

---

_Story created: 2025-11-30_
_Epic: Core Content Display (Epic 2)_
_Sequence: 4 of 8 in Epic 2_
