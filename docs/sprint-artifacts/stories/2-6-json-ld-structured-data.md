# Story 2-6: JSON-LD Structured Data

**Status:** in-progress
**Epic:** 2 - Core Content Display
**Priority:** High

## User Story

**As a** search engine,
**I want** structured data on obituary pages,
**So that** I can display rich snippets in search results.

## Acceptance Criteria

| AC ID | Criterion | Status |
|-------|-----------|--------|
| AC-2.6.1 | JSON-LD script present with type="application/ld+json" | [ ] |
| AC-2.6.2 | @context is "https://schema.org" | [ ] |
| AC-2.6.3 | @type is "Article" for obituary pages | [ ] |
| AC-2.6.4 | headline contains claim preview | [ ] |
| AC-2.6.5 | datePublished in ISO 8601 format | [ ] |
| AC-2.6.6 | author present as Person type | [ ] |
| AC-2.6.7 | publisher present as Organization | [ ] |
| AC-2.6.8 | description present | [ ] |
| AC-2.6.9 | url is canonical URL | [ ] |
| AC-2.6.10 | Homepage has WebSite schema | [ ] |
| AC-2.6.11 | Validates with Google Rich Results Test | [ ] |

## Technical Approach

### Files to Create
- `src/components/seo/json-ld.tsx` - JSON-LD component

### Files to Modify
- `src/app/obituary/[slug]/page.tsx` - Add JsonLd component
- `src/app/page.tsx` - Add JsonLd type="website"

### Implementation Details

1. **JsonLd component**:
   - Accepts obituary prop for article pages
   - Type prop to switch between "article" and "website"
   - Uses truncate helper from seo.ts
   - Outputs `<script type="application/ld+json">`

2. **Article schema fields**:
   - @context: https://schema.org
   - @type: Article
   - headline: truncated claim (max 110 chars)
   - datePublished: obituary.date
   - author: { @type: Person, name: source }
   - publisher: { @type: Organization, name: AI Obituaries }
   - description: truncated description
   - url: canonical URL

3. **WebSite schema for homepage**:
   - @context: https://schema.org
   - @type: WebSite
   - name: AI Obituaries
   - description: site tagline
   - url: BASE_URL

## Dependencies

- Story 2.5 (SEO meta tags) - DONE

## Test Scenarios

1. Unit test that Article schema has all required fields
2. Unit test that WebSite schema has required fields
3. Test headline truncation
4. Test JSON-LD is valid JSON
