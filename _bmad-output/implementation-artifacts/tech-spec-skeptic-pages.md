# Tech-Spec: Notable Skeptics Pages

**Created:** 2025-12-22
**Status:** Completed

## Overview

### Problem Statement

Notable AI skeptics (LeCun, Gary Marcus, etc.) make repeated predictions about AI's limitations. Currently there's no way to see one person's track record over time against actual AI progress metrics. Users can't easily browse "what did Gary Marcus say, and how did AI capabilities look when he said it?"

### Solution

Bitcoin Obituaries-style pages for notable skeptics. Each skeptic page shows their claims as a list, with AI metrics (MMLU, Compute, ECI) displayed alongside each claim - showing what AI capabilities were at the moment they made that prediction.

The implicit comparison: "They said AI was hitting a wall when MMLU was 67%. Today it's 89%."

### Scope

**In Scope:**
- New `skeptic` document type in Sanity (name, slug, bio, profile links)
- Link obituaries to skeptics via reference field
- `/skeptics` index page listing all notable skeptics
- `/skeptics/[slug]` detail pages with claim list + metrics
- Metrics lookup utility returning MMLU/Compute/ECI at any date
- "Current metrics" footer for comparison

**Out of Scope:**
- Photos for skeptics (explicitly excluded)
- Filtering/sorting within skeptic pages (future enhancement)
- Skeptic comparison view (future enhancement)
- Edit skeptic data from frontend

## Context for Development

### Codebase Patterns

1. **Server Components default** - Use async functions, fetch in component
2. **Data fetching pattern** - Parent fetches, passes to children via props
3. **ISR tags** - Use `{ next: { tags: ['skeptics'] } }` for cache invalidation
4. **Type files** - New types go in `src/types/skeptic.ts`
5. **Queries** - Add to `src/lib/sanity/queries.ts` or create `skeptic-queries.ts`
6. **Path alias** - Use `@/` for imports from `src/`

### Files to Reference

| File | Purpose |
|------|---------|
| `src/data/ai-metrics.ts` | `getMetricValueAtDate()` function |
| `src/data/ai-metrics.generated.ts` | Metric series data, date ranges |
| `src/types/obituary.ts` | Type patterns to follow |
| `src/lib/sanity/queries.ts` | GROQ query patterns |
| `src/components/obituary/obituary-list.tsx` | Server Component list pattern |
| `src/components/obituary/obituary-card.tsx` | Card component pattern |
| `src/app/obituary/[slug]/page.tsx` | Dynamic route pattern |

### Technical Decisions

1. **Metrics lookup** - Use existing `getMetricValueAtDate()`, return `null` for dates before metric data starts
2. **Skeptic-Obituary relationship** - Many obituaries to one skeptic (reference field in obituary)
3. **Profile links** - Array of `{ platform: string, url: string }` for flexibility
4. **Date handling** - Obituary dates are ISO strings, convert to Date for metric lookup
5. **Metric display** - Show all 3 metrics; use "--" for unavailable (e.g., ECI before Feb 2023)

## Implementation Plan

### Tasks

- [x] **Task 1: Sanity Schema** - Add `skeptic` document type and update `obituary` to reference it
  - Fields: `name` (string), `slug` (slug), `bio` (text), `profiles` (array of {platform, url})
  - Add `skeptic` reference field to obituary schema
  - Deploy schema changes via Sanity Studio (manual step required)

- [x] **Task 2: TypeScript Types** - Create `src/types/skeptic.ts`
  ```typescript
  interface SkepticProfile {
    platform: string  // 'twitter', 'substack', 'website', etc.
    url: string
  }

  interface Skeptic {
    _id: string
    name: string
    slug: string
    bio: string
    profiles: SkepticProfile[]
  }

  interface SkepticSummary {
    _id: string
    name: string
    slug: string
    claimCount: number
  }
  ```

- [x] **Task 3: Metrics Helper** - Add `getAllMetricsAtDate()` to `src/data/ai-metrics.ts`
  ```typescript
  interface MetricsSnapshot {
    mmlu: number | null      // null if before Aug 2021
    eci: number | null       // null if before Feb 2023
    compute: number          // always available (data from 1950)
    computeFormatted: string // e.g., "10^25.3"
  }

  function getAllMetricsAtDate(date: Date): MetricsSnapshot
  ```

- [x] **Task 4: Sanity Queries** - Add skeptic queries to `src/lib/sanity/queries.ts`
  - `getSkeptics()` - All skeptics with claim counts
  - `getSkepticBySlug(slug)` - Single skeptic with full obituary list
  - `getSkepticSlugs()` - For `generateStaticParams()`

- [x] **Task 5: Skeptic Index Page** - Create `src/app/skeptics/page.tsx`
  - Server Component
  - Grid of skeptic cards (name, claim count, bio preview)
  - Link to individual skeptic pages

- [x] **Task 6: Skeptic Card Component** - Create `src/components/skeptic/skeptic-card.tsx`
  - Name, claim count, truncated bio
  - Profile link icons
  - Link to `/skeptics/[slug]`

- [x] **Task 7: Skeptic Detail Page** - Create `src/app/skeptics/[slug]/page.tsx`
  - Header: name, bio, profile links
  - Claim list with metrics sidebar
  - Footer: current metrics for comparison
  - `generateStaticParams()` for SSG
  - `generateMetadata()` for SEO

- [x] **Task 8: Claim List Component** - Create `src/components/skeptic/skeptic-claim-list.tsx`
  - List of obituaries for this skeptic
  - Each row: claim text, source, date | MMLU, Compute, ECI
  - Sorted by date (newest first or oldest first - TBD)

- [x] **Task 9: Metrics Badge Component** - Create `src/components/skeptic/metrics-badge.tsx`
  - Displays MMLU %, Compute (log), ECI
  - Handles null values with "--" placeholder
  - Consistent styling across list items

- [x] **Task 10: Navigation** - Add /skeptics to nav
  - Update `src/components/layout/nav.tsx`
  - Add to mobile nav if exists

### Acceptance Criteria

- [x] **AC 1:** Given a user visits `/skeptics`, they see a grid of notable skeptics with names, claim counts, and bio previews
- [x] **AC 2:** Given a user clicks a skeptic card, they navigate to `/skeptics/[slug]` showing that skeptic's profile
- [x] **AC 3:** Given a user views a skeptic page, they see all claims attributed to that skeptic in a list format
- [x] **AC 4:** Given a claim in the list, the right side shows MMLU %, Training Compute, and ECI values at that claim's date
- [x] **AC 5:** Given a claim from before Aug 2021, MMLU shows "--" (data unavailable)
- [x] **AC 6:** Given a claim from before Feb 2023, ECI shows "--" (data unavailable)
- [x] **AC 7:** Given a skeptic page, a footer displays current/latest metric values for comparison
- [x] **AC 8:** Given a skeptic with profile links, icons link to their Twitter/Substack/website
- [x] **AC 9:** Pages are statically generated (SSG) with ISR revalidation via 'skeptics' tag

## Additional Context

### Dependencies

- Sanity schema changes must be deployed first (Task 1)
- Some obituaries need to be linked to skeptics in Sanity before pages show data
- Consider adding a few skeptics (LeCun, Gary Marcus) as seed data

### Testing Strategy

- Unit tests for `getAllMetricsAtDate()` - edge cases around metric start dates
- Unit tests for GROQ queries with mock data
- Component tests for SkepticCard, MetricsBadge
- E2E test: navigate to /skeptics, click card, verify claim list renders

### Notes

**Metric Data Ranges:**
- MMLU: 2021-08-01 to present (25.7% → 88.1%)
- ECI: 2023-02-01 to present (109.8 → 154.4)
- Compute: 1950-07-01 to present (1.6 → 26.7 log₁₀ FLOP)

**Example Display:**
```
┌─────────────────────────────────────┬─────────────────┐
│ "Deep learning is hitting a wall"   │ MMLU:    67.2%  │
│ Wired · Mar 15, 2022                │ Compute: 24.4   │
│                                     │ ECI:     --     │
├─────────────────────────────────────┼─────────────────┤
│ "LLMs can't actually reason"        │ MMLU:    86.4%  │
│ Substack · Mar 20, 2023             │ Compute: 25.3   │
│                                     │ ECI:     125.9  │
└─────────────────────────────────────┴─────────────────┘

Today: MMLU 88.1% · Compute 26.7 · ECI 154.4
```

**Profile Platforms to Support:**
- Twitter/X
- Substack
- Personal website
- LinkedIn
- Wikipedia (for notable figures)
