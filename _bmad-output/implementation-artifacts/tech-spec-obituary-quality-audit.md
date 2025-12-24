# Tech-Spec: Obituary Quality Criteria & Content Audit

**Created:** 2025-12-23
**Status:** Ready for Development

## Overview

### Problem Statement

AI Obituaries lacks formal quality criteria for what belongs in the archive. The current discovery pipeline has basic filtering, but there's no comprehensive editorial standard for evaluating claims. Existing content hasn't been audited against quality criteria, and the 4-category system doesn't adequately distinguish between "narrow task" skepticism and "general intelligence" skepticism.

### Solution

1. **Quality Criteria Reference Document** - Comprehensive editorial guidelines defining what belongs in the archive
2. **Content Audit Script** - Automated scoring of existing obituaries with flagging for review
3. **Enhanced Category System** - Split `capability` into `capability-narrow` and `capability-reasoning`
4. **Claim Status Field** - Add `status: 'falsified' | 'aging' | 'pending'` to track claim state

### Scope

**In Scope:**
- Quality criteria document with scoring rubric
- Audit script to evaluate existing Sanity content
- Category system enhancement (narrow vs reasoning)
- Claim status tracking
- Updates to classifier prompt

**Out of Scope:**
- Admin dashboard UI for review workflow
- Automated re-classification of existing content
- Changes to visualization (just filter support)

## Context for Development

### Codebase Patterns

- **Types**: `src/types/obituary.ts` - `Category` type union
- **Constants**: `src/lib/constants/categories.ts` - Category definitions with colors
- **Discovery**: `src/lib/discovery/classifier.ts` - LLM classification prompt
- **Queries**: `src/lib/sanity/queries.ts` - GROQ queries for fetching obituaries
- **Config**: `src/config/sources.ts` - Whitelist and notability config

### Files to Reference

```
src/types/obituary.ts           # Category type definition
src/lib/constants/categories.ts # Category metadata
src/lib/discovery/classifier.ts # Classification prompt
src/lib/discovery/quality-filter.ts # Quality gates
src/config/sources.ts           # Source whitelists
src/types/discovery.ts          # Discovery pipeline types
```

### Technical Decisions

1. **Category Split**: `capability` becomes `capability-narrow` (task-specific) and `capability-reasoning` (general intelligence claims)
2. **Status Field**: New optional field `status` on Obituary type, defaults to `'pending'` for aging claims
3. **Quality Score**: Stored in `discoveryMetadata.qualityScore` (0-100)
4. **Audit Output**: JSON report file, not database mutations (human review required)

## Implementation Plan

### Tasks

- [ ] **Task 1: Create Quality Criteria Document**
  - Create `docs/editorial/quality-criteria.md`
  - Define inclusion criteria (hard requirements)
  - Define quality scoring rubric (falsifiability, source authority, boldness, historical value)
  - Document anti-patterns with examples
  - Define category assignment rules

- [ ] **Task 2: Update Category System**
  - Modify `src/types/obituary.ts` to expand Category type
  - Update `src/lib/constants/categories.ts` with new category definitions
  - Add CSS variables for new category colors in `globals.css`
  - Update `CATEGORY_ORDER`, `CATEGORY_BG_CLASSES`, `CATEGORY_BADGE_CLASSES`

- [ ] **Task 3: Add Claim Status Field**
  - Add `status?: 'falsified' | 'aging' | 'pending'` to Obituary type
  - Update `ObituarySummary` type
  - Update GROQ projections in queries.ts
  - Add status badge component (optional)

- [ ] **Task 4: Update Classifier Prompt**
  - Enhance `src/lib/discovery/classifier.ts` with:
    - New category options (capability-narrow, capability-reasoning)
    - Quality scoring dimensions
    - Anti-pattern detection
    - Status determination logic

- [ ] **Task 5: Create Audit Script**
  - Create `scripts/audit-obituaries.ts`
  - Fetch all obituaries from Sanity
  - Score each against quality criteria
  - Output JSON report with recommendations:
    - `keep`: Score >= 50, passes all gates
    - `review`: Score 35-49, needs human decision
    - `flag`: Score < 35 or fails inclusion criteria
    - `recategorize`: Category assignment seems wrong

- [ ] **Task 6: Update Source Config**
  - Adjust `NOTABILITY_CONFIG.minFollowers` from 25000 to 10000 (medium bar)
  - Update `verifiedMinFollowers` to 5000

### Acceptance Criteria

- [ ] AC 1: Quality criteria document exists at `docs/editorial/quality-criteria.md` with all sections (purpose, inclusion criteria, scoring rubric, categories, anti-patterns)
- [ ] AC 2: Running `bun scripts/audit-obituaries.ts` generates a JSON report scoring all existing obituaries
- [ ] AC 3: Category type includes `capability-narrow` and `capability-reasoning` without breaking existing `capability` filter (backwards compatible - treat `capability` as `capability-narrow` in legacy data)
- [ ] AC 4: Obituary type includes optional `status` field
- [ ] AC 5: Classifier prompt includes new categories and scoring logic
- [ ] AC 6: All existing tests pass (`bun test:run`)

## Additional Context

### Quality Scoring Rubric (0-100)

| Dimension | 25 pts | 20 pts | 15 pts | 10 pts | 5 pts |
|-----------|--------|--------|--------|--------|-------|
| **Falsifiability** | Specific timeline + capability | Specific capability ("will never") | General timeline | Vague but testable | Nearly unfalsifiable |
| **Source Authority** | Domain expert, tier 1 pub | Adjacent expert, journalist | Notable (10k+ followers) | Tier 2 publication | Minor source |
| **Claim Boldness** | Absolute certainty | Strong conviction | Moderate conviction | Hedged | Mild |
| **Historical Value** | Widely cited/influential | Viral reach | Notable person | Relevant expert | Artifact |

**Thresholds:**
- Score >= 50: Publish
- Score 35-49: Review
- Score < 35: Reject

### New Category Definitions

| ID | Label | Description | Example |
|----|-------|-------------|---------|
| `capability-narrow` | Task Skepticism | Claims AI can't do specific tasks | "AI will never write production code" |
| `capability-reasoning` | Intelligence Skepticism | Claims about reasoning/understanding | "LLMs are just autocomplete" |
| `market` | Market/Bubble | Financial/business claims | "AI bubble will burst by 2025" |
| `agi` | AGI Skepticism | AGI-specific claims | "AGI is impossible" |
| `dismissive` | Dismissive | General AI dismissal | "AI is just hype" |

### Anti-Patterns (Exclusions)

1. **Reasonable caution** - "We should be careful about AI" is not a doom claim
2. **Risk warnings** - "AI poses existential risk" is the OPPOSITE thesis
3. **Out-of-context quotes** - Snippets misrepresenting author's actual view
4. **Satire/jokes** - Clearly humorous takes
5. **Self-serving** - Competitors trashing each other
6. **Vague sentiments** - "I'm skeptical" without specific claim

### Dependencies

- Sanity CMS access (SANITY_WRITE_TOKEN for audit script if mutations needed)
- Anthropic API (for enhanced classifier)

### Testing Strategy

- Unit tests for quality scoring functions
- Snapshot test for classifier prompt
- Integration test for audit script (mock Sanity responses)

### Notes

- Backwards compatibility: Existing `capability` category should map to `capability-narrow` in the UI filter
- The audit script is READ-ONLY - it generates a report for human review, doesn't mutate data
- Consider running audit weekly as a cron job once stabilized
