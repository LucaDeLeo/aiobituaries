# Story 1-5: ISR Revalidation Webhook

**Story Key:** 1-5-isr-revalidation-webhook
**Epic:** Epic 1 - Foundation
**Status:** review
**Priority:** High

---

## User Story

**As a** content editor,
**I want** the site to update automatically when I publish changes in Sanity,
**So that** new obituaries appear without manual deployment.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-1.5.1 | Webhook endpoint exists | POST to `/api/revalidate` returns response |
| AC-1.5.2 | Secret validation works | Request without valid secret returns 401 |
| AC-1.5.3 | Invalid secret rejected | Mismatched secret returns `{ error: 'Invalid secret' }` |
| AC-1.5.4 | Homepage revalidated | `revalidatePath('/')` called on valid request |
| AC-1.5.5 | Claims page revalidated | `revalidatePath('/claims')` called |
| AC-1.5.6 | Obituary pages revalidated | `revalidatePath('/obituary/[slug]', 'page')` called |
| AC-1.5.7 | Success response returned | Valid request returns `{ revalidated: true }` |
| AC-1.5.8 | Secret read from env | Uses `SANITY_WEBHOOK_SECRET` environment variable |

---

## Technical Approach

### Implementation Overview

Create a Next.js API route at `/api/revalidate` that receives POST requests from Sanity webhooks and triggers on-demand ISR (Incremental Static Regeneration) for all obituary-related pages.

### Key Implementation Details

1. **API Route Creation**
   - Create `src/app/api/revalidate/route.ts` using Next.js App Router conventions
   - Export async `POST` handler function
   - Use `NextRequest` and `NextResponse` from `next/server`

2. **Secret Validation**
   - Extract `x-sanity-webhook-secret` header from incoming request
   - Compare against `process.env.SANITY_WEBHOOK_SECRET`
   - Return 401 with error JSON if validation fails

3. **Path Revalidation**
   - Import `revalidatePath` from `next/cache`
   - Call for homepage: `revalidatePath('/')`
   - Call for claims page: `revalidatePath('/claims')`
   - Call for obituary dynamic routes: `revalidatePath('/obituary/[slug]', 'page')`

4. **Response Handling**
   - Return `{ revalidated: true }` on success
   - Return `{ error: 'Invalid secret' }` with status 401 on auth failure

### Reference Implementation

```typescript
// src/app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-sanity-webhook-secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // Revalidate all pages that display obituaries
  revalidatePath('/')
  revalidatePath('/claims')
  revalidatePath('/obituary/[slug]', 'page')

  return NextResponse.json({ revalidated: true })
}
```

### Sanity Webhook Configuration (Manual Step)

After deployment, configure in Sanity dashboard:
1. Go to Sanity project dashboard > API > Webhooks
2. Create webhook pointing to `https://yourdomain.com/api/revalidate`
3. Set HTTP method to POST
4. Add header: `x-sanity-webhook-secret: <your-secret>`
5. Filter: Document type = `obituary`
6. Trigger on: Create, Update, Delete

---

## Tasks

### Task 1: Create API Route File (15 min)
- [x] Create directory structure `src/app/api/revalidate/`
- [x] Create `route.ts` file with POST handler skeleton
- [x] Import required dependencies (`revalidatePath`, `NextRequest`, `NextResponse`)

### Task 2: Implement Secret Validation (15 min)
- [x] Extract `x-sanity-webhook-secret` header from request
- [x] Compare against `process.env.SANITY_WEBHOOK_SECRET`
- [x] Return 401 status with `{ error: 'Invalid secret' }` if validation fails

### Task 3: Implement Path Revalidation (15 min)
- [x] Call `revalidatePath('/')` for homepage
- [x] Call `revalidatePath('/claims')` for claims listing page
- [x] Call `revalidatePath('/obituary/[slug]', 'page')` for all obituary pages

### Task 4: Implement Success Response (10 min)
- [x] Return `{ revalidated: true }` JSON response on successful revalidation
- [x] Ensure proper content-type headers

### Task 5: Update Environment Variables Documentation (10 min)
- [x] Add `SANITY_WEBHOOK_SECRET` to `.env.local.example` if not present
- [x] Add comment explaining the variable's purpose

### Task 6: Write Unit Tests (30 min)
- [x] Test POST without secret returns 401
- [x] Test POST with invalid secret returns 401
- [x] Test POST with valid secret returns `{ revalidated: true }`
- [x] Mock `revalidatePath` and verify it's called with correct paths

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Story 1-1 (Project Initialization) | Complete | Next.js project exists |
| Story 1-2 (Design System Setup) | Complete | Not directly required but assumed complete |
| Story 1-3 (Sanity CMS Integration) | Complete | Sanity client and types configured |
| Story 1-4 (Layout Shell & Navigation) | Complete | Navigation structure in place |

---

## Definition of Done

- [x] API route exists at `src/app/api/revalidate/route.ts`
- [x] POST requests without valid secret return 401 status
- [x] POST requests with valid secret return `{ revalidated: true }`
- [x] `revalidatePath` is called for `/`, `/claims`, and `/obituary/[slug]`
- [x] `.env.local.example` documents `SANITY_WEBHOOK_SECRET`
- [x] Unit tests pass for all acceptance criteria
- [x] Code follows project coding standards
- [x] No TypeScript errors
- [x] Lint passes (`npm run lint`)

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/revalidate/route.ts` | Create | ISR webhook endpoint |
| `.env.local.example` | Modify | Add SANITY_WEBHOOK_SECRET documentation |
| `tests/unit/api/revalidate.test.ts` | Create | Unit tests for webhook endpoint |

---

## Testing Notes

### Unit Test Scenarios

1. **Auth Failure - Missing Secret**
   - Send POST with no `x-sanity-webhook-secret` header
   - Expect: 401 status, `{ error: 'Invalid secret' }` body

2. **Auth Failure - Wrong Secret**
   - Send POST with incorrect secret value
   - Expect: 401 status, `{ error: 'Invalid secret' }` body

3. **Success Case**
   - Send POST with correct secret
   - Mock `revalidatePath` from `next/cache`
   - Expect: 200 status, `{ revalidated: true }` body
   - Verify `revalidatePath` called 3 times with correct paths

### Manual Testing

```bash
# Test without secret (should fail)
curl -X POST http://localhost:3000/api/revalidate

# Test with invalid secret (should fail)
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-sanity-webhook-secret: wrong-secret"

# Test with valid secret (should succeed)
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-sanity-webhook-secret: your-actual-secret"
```

---

## FR Coverage

This story satisfies the following Functional Requirement:

| FR ID | Requirement | How Satisfied |
|-------|-------------|---------------|
| FR6 | System updates displayed data when source data changes (via ISR revalidation) | Webhook triggers `revalidatePath()` for all obituary-related pages when Sanity content changes |

---

## Dev Agent Record

_This section is populated during implementation_

### Context Reference
`docs/sprint-artifacts/story-contexts/1-5-isr-revalidation-webhook-context.xml`

### Implementation Notes
- Created `/api/revalidate` POST endpoint using Next.js App Router conventions
- Implemented secret validation using `x-sanity-webhook-secret` header
- Revalidates 3 paths: `/`, `/claims`, `/obituary/[slug]`
- Added comprehensive environment variable documentation with security notes
- Wrote 10 unit tests covering authentication and revalidation scenarios

### Files Created
- `src/app/api/revalidate/route.ts` - ISR webhook endpoint (19 lines)
- `tests/unit/api/revalidate.test.ts` - Unit tests (158 lines, 10 tests)

### Files Modified
- `.env.local.example` - Added SANITY_WEBHOOK_SECRET with documentation
- `docs/sprint-artifacts/sprint-status.yaml` - Status: ready-for-dev -> in-progress -> review

### Deviations from Plan
- None. Implementation follows the reference implementation exactly.

### Issues Encountered
- None. Implementation was straightforward.

### Key Decisions
- Used strict equality check for secret validation (no undefined/null coercion issues)
- Added edge case test for empty string secret
- Added test verifying behavior when env var is unset

### Test Results
- 10/10 tests passing
- All acceptance criteria verified through unit tests
- Build successful with route visible in output

### Manual Testing Commands
```bash
# Test without secret (returns 401)
curl -X POST http://localhost:3000/api/revalidate

# Test with valid secret (returns 200)
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-sanity-webhook-secret: $SANITY_WEBHOOK_SECRET"
```

### Post-Deployment Note
Sanity webhook must be configured manually in dashboard after deployment:
1. Go to Sanity project > API > Webhooks
2. Create webhook pointing to `https://yourdomain.com/api/revalidate`
3. Add header: `x-sanity-webhook-secret: <your-secret>`
4. Filter: Document type = `obituary`
5. Trigger on: Create, Update, Delete

### Completion Timestamp
2025-11-29

---

_Story created: 2025-11-29_
_Epic: Foundation (Epic 1)_
_Sequence: 5 of 5 in Epic 1_
