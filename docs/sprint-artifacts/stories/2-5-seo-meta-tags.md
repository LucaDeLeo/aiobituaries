# Story 2-5: SEO Meta Tags

**Status:** in-progress
**Epic:** 2 - Core Content Display
**Priority:** High

## User Story

**As a** content sharer,
**I want** obituary pages to have rich meta tags,
**So that** shared links look good on social media and search.

## Acceptance Criteria

| AC ID | Criterion | Status |
|-------|-----------|--------|
| AC-2.5.1 | Title tag present - Format: "[Claim preview...] - AI Obituaries" | [ ] |
| AC-2.5.2 | Title max 60 chars with truncation | [ ] |
| AC-2.5.3 | Meta description present (max 155 chars with claim and source) | [ ] |
| AC-2.5.4 | og:title present | [ ] |
| AC-2.5.5 | og:description present | [ ] |
| AC-2.5.6 | og:type is "article" for obituary pages | [ ] |
| AC-2.5.7 | og:url is canonical URL | [ ] |
| AC-2.5.8 | og:image present with default OG image | [ ] |
| AC-2.5.9 | og:site_name is "AI Obituaries" | [ ] |
| AC-2.5.10 | twitter:card is "summary_large_image" | [ ] |
| AC-2.5.11 | twitter:title present | [ ] |
| AC-2.5.12 | twitter:description present | [ ] |
| AC-2.5.13 | Homepage has custom meta (title and description) | [ ] |

## Technical Approach

### Files to Create
- `src/lib/utils/seo.ts` - SEO helper functions with truncation logic
- `public/og/default.png` - Default OG image (1200x630 placeholder)

### Files to Modify
- `src/app/page.tsx` - Add metadata export for homepage
- `src/app/obituary/[slug]/page.tsx` - Add generateMetadata function
- `src/app/layout.tsx` - Update base metadata with metadataBase

### Implementation Details

1. **seo.ts utility**:
   - `truncate(str, maxLength)` helper function
   - `generateObituaryMetadata(obituary)` returns Next.js Metadata object
   - `homepageMetadata` constant for homepage

2. **Metadata structure**:
   - Title: truncated claim + " - AI Obituaries"
   - Description: source + claim summary
   - Open Graph: article type, canonical URL, default image
   - Twitter: summary_large_image card

3. **Default OG image**:
   - 1200x630 PNG with Deep Archive theme colors
   - Will use a simple gradient placeholder

## Dependencies

- Story 2.3 (individual obituary pages) - DONE
- Story 2.4 (contextual snapshot display) - DONE

## Test Scenarios

1. Unit tests for truncation at exact boundaries
2. Unit tests for metadata generation with various claim lengths
3. Component test that generateMetadata returns expected structure
4. Verify homepage metadata export works
