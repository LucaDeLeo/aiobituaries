# Story 2-3: Individual Obituary Pages

**Story Key:** 2-3-individual-obituary-pages
**Epic:** Epic 2 - Core Content Display
**Status:** drafted
**Priority:** High

---

## User Story

**As a** visitor,
**I want** each obituary to have its own dedicated page,
**So that** I can view full details and share specific obituaries.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-2.3.1 | Page exists at `/obituary/[slug]` | URL pattern works for valid slugs |
| AC-2.3.2 | Full claim text displayed | No truncation, large serif font |
| AC-2.3.3 | Source name with external link | Link to original article opens in new tab |
| AC-2.3.4 | Full date displayed | Format: "March 14, 2023" |
| AC-2.3.5 | Category tags as badges | Colored badges for each category |
| AC-2.3.6 | Back link to homepage | Link to navigate back |
| AC-2.3.7 | Claim displayed as hero quote | Centered, prominent styling |
| AC-2.3.8 | External link has security attrs | `rel="noopener noreferrer"` present |
| AC-2.3.9 | 404 for invalid slugs | Non-existent slug shows not-found page |
| AC-2.3.10 | Pages statically generated | `generateStaticParams` returns all slugs |

---

## Technical Approach

### Implementation Overview

Create individual obituary detail pages using Next.js dynamic routing with the `[slug]` pattern. Each page displays the full obituary content including the complete claim text, source attribution with external link, publication date, and category tags. Pages are statically generated at build time using `generateStaticParams`.

### Key Implementation Details

1. **Dynamic Route Setup**
   - Create `src/app/obituary/[slug]/page.tsx` for the detail page
   - Create `src/app/obituary/[slug]/not-found.tsx` for 404 handling
   - Use `generateStaticParams` to pre-build all obituary pages

2. **Data Fetching**
   - Use `getObituaryBySlug(slug)` query to fetch full obituary data
   - Include full context data for Story 2.4 integration
   - Call `notFound()` if obituary doesn't exist

3. **Page Layout & Styling**
   - Hero quote: Full claim text in Instrument Serif, italic, centered
   - Source: Link to original article with external link icon
   - Date: Full format using `date-fns` format "MMMM d, yyyy"
   - Category badges: Colored with semi-transparent background

4. **Back Navigation**
   - "Back to all obituaries" link with arrow icon
   - Links to homepage (`/`)

5. **External Link Security**
   - All external links use `target="_blank"`
   - Include `rel="noopener noreferrer"` for security

6. **Static Generation**
   - `generateStaticParams` fetches all slugs from Sanity
   - ISR revalidation via existing webhook (Story 1-5)

### Reference Implementation

```tsx
// src/app/obituary/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getObituaryBySlug, getAllObituarySlugs } from '@/lib/sanity/queries'
import { ObituaryDetail } from '@/components/obituary/obituary-detail'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllObituarySlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function ObituaryPage({ params }: PageProps) {
  const { slug } = await params
  const obituary = await getObituaryBySlug(slug)

  if (!obituary) {
    notFound()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <ObituaryDetail obituary={obituary} />
    </main>
  )
}
```

```tsx
// src/components/obituary/obituary-detail.tsx
import Link from 'next/link'
import { format } from 'date-fns'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import type { Obituary, Category } from '@/types/obituary'

const CATEGORY_LABELS: Record<Category, string> = {
  capability: 'Capability Doubt',
  market: 'Market/Bubble',
  agi: 'AGI Skepticism',
  dismissive: 'Dismissive Framing',
}

const CATEGORY_COLORS: Record<Category, string> = {
  capability: 'bg-[--category-capability]/20 text-[--category-capability]',
  market: 'bg-[--category-market]/20 text-[--category-market]',
  agi: 'bg-[--category-agi]/20 text-[--category-agi]',
  dismissive: 'bg-[--category-dismissive]/20 text-[--category-dismissive]',
}

interface ObituaryDetailProps {
  obituary: Obituary
}

export function ObituaryDetail({ obituary }: ObituaryDetailProps) {
  return (
    <article>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[--text-secondary]
                   hover:text-[--text-primary] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all obituaries
      </Link>

      <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl
                             text-[--text-primary] italic text-center
                             leading-relaxed mb-8">
        "{obituary.claim}"
      </blockquote>

      <div className="flex flex-col items-center gap-4 mb-8">
        <p className="text-[--text-secondary]">
          <a
            href={obituary.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[--accent-primary]
                       transition-colors underline underline-offset-4"
          >
            {obituary.source}
            <ExternalLink className="w-4 h-4" />
          </a>
        </p>
        <time
          dateTime={obituary.date}
          className="text-[--text-muted]"
        >
          {format(new Date(obituary.date), 'MMMM d, yyyy')}
        </time>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {obituary.categories.map((category) => (
          <span
            key={category}
            className={`px-3 py-1 rounded-full text-sm font-medium ${CATEGORY_COLORS[category]}`}
          >
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>
    </article>
  )
}
```

```tsx
// src/app/obituary/[slug]/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-serif text-[--text-primary] mb-4">
        Obituary Not Found
      </h1>
      <p className="text-[--text-secondary] mb-8">
        This obituary doesn't exist or may have been removed.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[--accent-primary] text-[--bg-primary]
                   rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Return to Homepage
      </Link>
    </div>
  )
}
```

### Sanity Query Functions

The following queries are needed (add if not already present):

```typescript
// src/lib/sanity/queries.ts

/**
 * Fetch a single obituary by slug with full context data.
 * Returns null if not found.
 */
export async function getObituaryBySlug(slug: string): Promise<Obituary | null> {
  const query = `*[_type == "obituary" && slug.current == $slug][0] {
    _id,
    "slug": slug.current,
    claim,
    source,
    sourceUrl,
    date,
    categories,
    context {
      nvdaPrice,
      msftPrice,
      googPrice,
      currentModel,
      benchmarkName,
      benchmarkScore,
      milestone,
      note
    },
    _createdAt,
    _updatedAt
  }`

  return sanityClient.fetch<Obituary | null>(query, { slug }, {
    next: { tags: ['obituaries'] }
  })
}

/**
 * Fetch all obituary slugs for static generation.
 * Used by generateStaticParams().
 */
export async function getAllObituarySlugs(): Promise<string[]> {
  const query = `*[_type == "obituary"].slug.current`

  return sanityClient.fetch<string[]>(query, {}, {
    next: { tags: ['obituaries'] }
  })
}
```

---

## Tasks

### Task 1: Add Sanity Query Functions (15 min)
- [ ] Open `src/lib/sanity/queries.ts`
- [ ] Add `getObituaryBySlug(slug)` function
- [ ] Add `getAllObituarySlugs()` function
- [ ] Ensure both use ISR caching with `obituaries` tag
- [ ] Verify TypeScript types match Obituary interface

### Task 2: Create ObituaryDetail Component (30 min)
- [ ] Create `src/components/obituary/obituary-detail.tsx`
- [ ] Import lucide-react icons (ArrowLeft, ExternalLink)
- [ ] Accept `Obituary` as prop
- [ ] Implement back link with arrow icon
- [ ] Display full claim as centered blockquote with Instrument Serif
- [ ] Display source with external link (target="_blank", rel="noopener noreferrer")
- [ ] Format date as "MMMM d, yyyy" (e.g., "March 14, 2023")
- [ ] Display category badges with colors and labels
- [ ] Add proper accessibility attributes

### Task 3: Create Dynamic Route Page (20 min)
- [ ] Create `src/app/obituary/[slug]/page.tsx`
- [ ] Import `notFound` from `next/navigation`
- [ ] Implement `generateStaticParams` to fetch all slugs
- [ ] Fetch obituary data with `getObituaryBySlug`
- [ ] Call `notFound()` if obituary is null
- [ ] Render ObituaryDetail component
- [ ] Add proper layout wrapper (max-width, padding)

### Task 4: Create 404 Not Found Page (10 min)
- [ ] Create `src/app/obituary/[slug]/not-found.tsx`
- [ ] Display friendly error message
- [ ] Include link to return to homepage
- [ ] Style consistently with Deep Archive theme

### Task 5: Write Unit Tests (30 min)
- [ ] Create `tests/unit/components/obituary/obituary-detail.test.tsx`
- [ ] Test claim text renders without truncation
- [ ] Test source link has correct attributes (target, rel)
- [ ] Test date formatting ("MMMM d, yyyy")
- [ ] Test category badges render with correct labels/colors
- [ ] Test back link points to homepage
- [ ] Create `tests/unit/lib/sanity/queries-detail.test.ts`
- [ ] Test `getObituaryBySlug` returns obituary or null
- [ ] Test `getAllObituarySlugs` returns array of strings

### Task 6: Manual Testing (15 min)
- [ ] Navigate to valid obituary URL (e.g., `/obituary/test-slug`)
- [ ] Verify full claim displays without truncation
- [ ] Verify source link opens in new tab
- [ ] Verify date shows full format (e.g., "March 14, 2023")
- [ ] Verify category badges show with correct colors
- [ ] Test back link navigates to homepage
- [ ] Navigate to invalid slug (e.g., `/obituary/does-not-exist`)
- [ ] Verify 404 page displays
- [ ] Test keyboard navigation (Tab through links)
- [ ] Verify pages are statically generated (check build output)

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Story 1-3 (Sanity CMS Integration) | Complete | Sanity client and base types |
| Story 1-4 (Layout Shell & Navigation) | Complete | Header/Footer layout |
| Story 2-2 (Obituary List Display) | Complete | ObituarySummary type, cards link to these pages |

---

## Definition of Done

- [ ] Dynamic route `src/app/obituary/[slug]/page.tsx` exists
- [ ] `ObituaryDetail` component exists at `src/components/obituary/obituary-detail.tsx`
- [ ] Not-found page exists at `src/app/obituary/[slug]/not-found.tsx`
- [ ] `getObituaryBySlug()` query function exists in queries.ts
- [ ] `getAllObituarySlugs()` query function exists in queries.ts
- [ ] Full claim text displays without truncation in Instrument Serif
- [ ] Source displays with external link (new tab, noopener noreferrer)
- [ ] Date displays in full format ("March 14, 2023")
- [ ] Category badges display with correct colors and labels
- [ ] Back link navigates to homepage
- [ ] Invalid slugs show 404 page
- [ ] Pages statically generated via generateStaticParams
- [ ] Unit tests pass
- [ ] No TypeScript errors
- [ ] Lint passes (`npm run lint`)

---

## Test Scenarios

### Unit Test Scenarios

1. **Detail Renders Full Claim**
   - Pass obituary with full claim text
   - Expect claim displayed without truncation

2. **Detail Renders Claim in Quotes**
   - Pass obituary with claim
   - Expect claim wrapped in quotation marks

3. **Detail Renders Source with External Link**
   - Pass obituary with source "Gary Marcus" and sourceUrl
   - Expect link with target="_blank"
   - Expect rel="noopener noreferrer"

4. **Detail Renders External Link Icon**
   - Pass obituary with source
   - Expect ExternalLink icon component rendered

5. **Detail Formats Date Correctly**
   - Pass obituary with date "2023-03-14"
   - Expect "March 14, 2023" displayed

6. **Detail Renders Category Badges**
   - Pass obituary with categories: ['capability', 'agi']
   - Expect two badges with labels "Capability Doubt" and "AGI Skepticism"

7. **Detail Renders Badge with Correct Color Class**
   - Pass obituary with categories: ['market']
   - Expect badge has class containing "category-market"

8. **Detail Renders Back Link**
   - Render ObituaryDetail
   - Expect link with href="/" and "Back to all obituaries" text

9. **getObituaryBySlug Returns Obituary**
   - Mock Sanity to return obituary data
   - Call getObituaryBySlug("valid-slug")
   - Expect obituary object returned

10. **getObituaryBySlug Returns Null for Invalid**
    - Mock Sanity to return null
    - Call getObituaryBySlug("invalid-slug")
    - Expect null returned

11. **getAllObituarySlugs Returns Array**
    - Mock Sanity to return ["slug-1", "slug-2"]
    - Call getAllObituarySlugs()
    - Expect array of strings

12. **Not Found Page Renders Message**
    - Render NotFound component
    - Expect "Obituary Not Found" heading

13. **Not Found Page Has Return Link**
    - Render NotFound component
    - Expect link with href="/"

### Manual Testing Checklist

- [ ] Navigate to `/obituary/[valid-slug]`
- [ ] Full claim text visible (not truncated)
- [ ] Claim text in serif italic font
- [ ] Source name visible with external link icon
- [ ] Click source link opens new tab
- [ ] Date shows full format (e.g., "March 14, 2023")
- [ ] Category badges visible with colors
- [ ] Back link visible with arrow icon
- [ ] Click back link returns to homepage
- [ ] Navigate to `/obituary/invalid-slug`
- [ ] 404 page displays
- [ ] Return to Homepage button works
- [ ] Tab through page - focus visible on links/buttons
- [ ] Check build output shows static pages generated

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/app/obituary/[slug]/page.tsx` | Create | Dynamic route page |
| `src/app/obituary/[slug]/not-found.tsx` | Create | 404 page for invalid slugs |
| `src/components/obituary/obituary-detail.tsx` | Create | Full detail view component |
| `src/lib/sanity/queries.ts` | Modify | Add getObituaryBySlug, getAllObituarySlugs |
| `tests/unit/components/obituary/obituary-detail.test.tsx` | Create | Detail component tests |
| `tests/unit/lib/sanity/queries-detail.test.ts` | Create | Query function tests |

---

## FR Coverage

This story satisfies the following Functional Requirements:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR3 | Users can view individual obituary details including full claim text, source with link, date, and category tags | ObituaryDetail component displays full claim without truncation, source with external link (new tab), formatted date, and category badges with colors/labels |
| FR19 | Each obituary has a dedicated page with unique, semantic URL | Dynamic route at `/obituary/[slug]` where slug is semantic identifier from Sanity CMS |

---

## Learnings from Previous Story

From Story 2-2 (Obituary List Display):

1. **Defensive Category Handling** - Always check for undefined/empty categories array before accessing `[0]` - same pattern needed for detail page badges
2. **Word-Boundary Truncation** - Story 2-2 implemented smart truncation; for detail page we show full text so this doesn't apply
3. **Instrument Serif Font** - Already configured in layout.tsx as `font-serif` class - reuse for claim blockquote
4. **CATEGORY_COLORS/LABELS** - Constants exist in `src/lib/constants/categories.ts` - import from there for badges
5. **ISR Caching Pattern** - Use `next: { tags: ['obituaries'] }` for query caching consistent with other queries

---

## Dev Agent Record

_This section is populated during implementation_

### Context Reference
`docs/sprint-artifacts/story-contexts/2-3-individual-obituary-pages-context.xml`

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
_Sequence: 3 of 8 in Epic 2_
