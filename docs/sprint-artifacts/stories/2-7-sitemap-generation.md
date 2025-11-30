# Story 2-7: Sitemap Generation

**Status:** in-progress
**Epic:** 2 - Core Content Display
**Priority:** High

## User Story

**As a** search engine crawler,
**I want** a sitemap listing all obituary pages,
**So that** I can discover and index all content.

## Acceptance Criteria

| AC ID | Criterion | Status |
|-------|-----------|--------|
| AC-2.7.1 | Sitemap at /sitemap.xml returns valid XML | [ ] |
| AC-2.7.2 | Homepage URL included | [ ] |
| AC-2.7.3 | All obituary URLs included | [ ] |
| AC-2.7.4 | lastmod dates present | [ ] |
| AC-2.7.5 | Valid XML sitemap format | [ ] |
| AC-2.7.6 | robots.txt exists at /robots.txt | [ ] |
| AC-2.7.7 | robots.txt allows all crawlers | [ ] |
| AC-2.7.8 | robots.txt references sitemap | [ ] |
| AC-2.7.9 | Sitemap updates with ISR | [ ] |
| AC-2.7.10 | changeFrequency and priority set appropriately | [ ] |

## Technical Approach

### Files to Create
- `src/app/sitemap.ts` - Dynamic sitemap generation
- `src/app/robots.ts` - Robots.txt generation

### Implementation Details

1. **sitemap.ts**:
   - Uses Next.js MetadataRoute.Sitemap
   - Fetches all obituaries from Sanity
   - Returns array with url, lastModified, changeFrequency, priority
   - Homepage: priority 1, daily
   - Obituaries: priority 0.8, monthly

2. **robots.ts**:
   - Uses Next.js MetadataRoute.Robots
   - User-agent: * Allow: /
   - Sitemap reference

## Dependencies

- Story 2.3 (obituary pages exist) - DONE

## Test Scenarios

- Build test that sitemap.ts compiles
- Build test that robots.ts compiles
- E2E test for /sitemap.xml response (future)
