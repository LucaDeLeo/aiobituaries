# Story 1-3: Sanity CMS Integration

**Story Key:** 1-3-sanity-cms-integration
**Epic:** Epic 1 - Foundation
**Status:** drafted
**Priority:** P0 - Critical Path (Data Layer Foundation)

---

## User Story

**As a** developer,
**I want** Sanity CMS client configured with TypeScript types,
**So that** I can fetch obituary data with type safety.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-1.3.1 | Sanity client configured | `createClient` call with projectId, dataset, apiVersion |
| AC-1.3.2 | Environment variables documented | `.env.local.example` lists all required vars |
| AC-1.3.3 | `getObituaries()` query exported | Function returns array of Obituary type |
| AC-1.3.4 | `getObituaryBySlug()` query exported | Function accepts slug, returns single Obituary or null |
| AC-1.3.5 | `getObituaryCount()` query exported | Function returns number |
| AC-1.3.6 | Obituary interface defined | TypeScript interface matches Sanity schema |
| AC-1.3.7 | Category type defined | Type literal union of 4 categories |
| AC-1.3.8 | ContextMetadata interface defined | All optional fields typed correctly |
| AC-1.3.9 | Client uses CDN for reads | `useCdn: true` in client config |
| AC-1.3.10 | API version pinned | `apiVersion: '2024-01-01'` or later |

---

## Technical Approach

### Implementation Steps

1. **Create Sanity client configuration**
   - Create `src/lib/sanity/client.ts` with `createClient` from `@sanity/client`
   - Configure with environment variables for projectId and dataset
   - Enable CDN for production reads
   - Pin API version for stability

2. **Define TypeScript interfaces**
   - Create `src/types/obituary.ts` with Obituary interface
   - Define Category type as union literal
   - Create `src/types/context.ts` with ContextMetadata interface

3. **Implement GROQ query functions**
   - Create `src/lib/sanity/queries.ts` with typed query functions
   - Use GROQ projections for minimal payload
   - Add proper error handling and null checks

4. **Document environment variables**
   - Create `.env.local.example` with all required variables
   - Include comments explaining each variable

### Sanity Client Configuration

```typescript
// src/lib/sanity/client.ts
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

### TypeScript Type Definitions

```typescript
// src/types/obituary.ts
export interface Obituary {
  _id: string
  slug: string
  claim: string
  source: string
  sourceUrl: string
  date: string // ISO 8601
  categories: Category[]
  context: ContextMetadata
}

export type Category = 'market' | 'capability' | 'agi' | 'dismissive'

// src/types/context.ts
export interface ContextMetadata {
  nvdaPrice?: number
  msftPrice?: number
  googPrice?: number
  benchmarkName?: string
  benchmarkScore?: number
  currentModel?: string
  milestone?: string
  note?: string
}
```

### GROQ Query Functions

```typescript
// src/lib/sanity/queries.ts
import { client } from './client'
import type { Obituary } from '@/types/obituary'

export async function getObituaries(): Promise<Obituary[]> {
  return client.fetch(`
    *[_type == "obituary"] | order(date desc) {
      _id,
      "slug": slug.current,
      claim,
      source,
      sourceUrl,
      date,
      categories,
      context
    }
  `)
}

export async function getObituaryBySlug(slug: string): Promise<Obituary | null> {
  return client.fetch(`
    *[_type == "obituary" && slug.current == $slug][0] {
      _id,
      "slug": slug.current,
      claim,
      source,
      sourceUrl,
      date,
      categories,
      context
    }
  `, { slug })
}

export async function getObituaryCount(): Promise<number> {
  return client.fetch(`count(*[_type == "obituary"])`)
}
```

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/sanity/client.ts` | Create | Sanity client configuration |
| `src/lib/sanity/queries.ts` | Create | GROQ query functions |
| `src/types/obituary.ts` | Create | Obituary and Category type definitions |
| `src/types/context.ts` | Create | ContextMetadata interface |
| `.env.local.example` | Create | Environment variable template |

---

## Tasks

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Create `src/lib/sanity/` directory structure | 5 min |
| 2 | Create `src/lib/sanity/client.ts` with createClient configuration | 10 min |
| 3 | Create `src/types/obituary.ts` with Obituary interface and Category type | 10 min |
| 4 | Create `src/types/context.ts` with ContextMetadata interface | 10 min |
| 5 | Create `src/lib/sanity/queries.ts` with getObituaries() function | 15 min |
| 6 | Add getObituaryBySlug() function to queries.ts | 10 min |
| 7 | Add getObituaryCount() function to queries.ts | 5 min |
| 8 | Create `.env.local.example` with documented variables | 10 min |
| 9 | Verify TypeScript types compile without errors | 10 min |
| 10 | Test client configuration with placeholder env vars | 10 min |
| 11 | Verify `pnpm run build` succeeds with new files | 5 min |

**Total Estimated Time:** ~100 minutes

---

## Dependencies

### Story Dependencies
- **Story 1-1: Project Initialization** (COMPLETE)
  - Provides: @sanity/client dependency already installed in package.json
- **Story 1-2: Design System Setup** (COMPLETE)
  - Provides: Complete project structure and build configuration

### External Dependencies
- Sanity CMS project (must be created separately for live data testing)
- Environment variables must be configured in `.env.local` for actual data fetching

### Learnings from Story 1-2 to Apply

1. **Tailwind CSS v4 is CSS-first:** No tailwind.config.ts needed, use @theme inline directive
2. **pnpm Usage:** Continue using pnpm for all package operations
3. **Two-tier variable system:** Pattern of semantic + framework variables works well
4. **Build verification:** Always run `pnpm run build` and `pnpm run lint` before marking complete

---

## Definition of Done

- [ ] All acceptance criteria (AC-1.3.1 through AC-1.3.10) verified and passing
- [ ] Sanity client exports configured client instance
- [ ] All three query functions implemented and exported
- [ ] TypeScript interfaces define Obituary, Category, and ContextMetadata
- [ ] Environment variables documented in `.env.local.example`
- [ ] GROQ queries use projections for minimal payload
- [ ] Client uses CDN (`useCdn: true`)
- [ ] API version is pinned to stable version
- [ ] `pnpm run build` succeeds with new files
- [ ] `pnpm run lint` passes without errors
- [ ] TypeScript compilation succeeds with strict mode

---

## Dev Agent Record

### Context Reference
`docs/sprint-artifacts/story-contexts/1-3-sanity-cms-integration-context.xml`

### Implementation Notes
_To be filled during implementation_

### File List
_To be filled during implementation_

### Deviations from Plan
_To be filled during implementation_

### Verification Results
_To be filled during implementation_

### Learnings for Next Story
_To be filled during implementation_

---

## Source Document References

- **Epic Reference:** [Epic 1: Foundation](../../epics.md#epic-1-foundation)
- **Tech Spec Reference:** [Epic 1 Tech Spec - Story 1.3](../epic-tech-specs/epic-1-tech-spec.md#story-13-sanity-cms-integration)
- **Architecture Reference:** [Architecture - ADR-001 Sanity CMS](../../architecture.md)
- **FR Coverage:** FR5 - System loads obituary data from external JSON/API source (not hardcoded)

---

_Story created: 2025-11-29_
_Status: drafted_
