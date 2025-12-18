# Tech-Spec: Obituary Discovery Pipeline

**Created:** 2025-12-18
**Status:** ✅ Implemented

---

## Overview

### Problem Statement

AI Obituaries currently relies on manual curation to discover and add AI doom/skepticism claims. This doesn't scale - the bottleneck is finding and entering quality content, not storing it. We need an automated discovery pipeline that:

1. **Finds** AI doom claims from tweets and news articles daily
2. **Filters** for quality - only notable people and reputable publications
3. **Classifies** content to extract claims and suggest categories
4. **Enriches** with contextual data (stock prices, AI benchmarks)
5. **Queues** for human review in Sanity CMS

### Solution

Build an Exa-powered discovery pipeline that runs daily via Vercel Cron, searches for AI doom claims across tweets and news, filters through multiple quality gates, uses Claude to classify and extract claims, auto-enriches with context data, and creates draft obituaries in Sanity for human approval.

### Scope

**In Scope:**
- Exa API integration for tweets + news search
- Publication whitelist (tiered: 30+ reputable sources)
- Notable handles whitelist (200+ curated Twitter/X accounts)
- Notability heuristics (follower count, verified, bio keywords)
- LLM classification with Claude (claim extraction, categorization, confidence)
- Context auto-enrichment (stock prices via existing metrics data)
- Sanity draft mutation (pending_review status)
- Vercel Cron trigger (daily at 9am UTC)
- Unit tests for all modules

**Out of Scope:**
- Sanity Studio UI customization for review queue
- Public submission form (future feature)
- RSS fallback (Exa covers this use case)
- Real-time/webhook-based discovery (daily batch is sufficient)
- Historical backfill scraping

---

## Context for Development

### Codebase Patterns

| Pattern | Implementation | Reference |
|---------|----------------|-----------|
| API Routes | `NextRequest`/`NextResponse`, header-based auth | `src/app/api/revalidate/route.ts` |
| Tests | Vitest, `vi.mock()`, fixtures at top, `beforeEach` cleanup | `tests/unit/lib/sanity/queries.test.ts` |
| Types | Clean TS interfaces, union types | `src/types/obituary.ts` |
| Config | Constants exported from dedicated files | `src/lib/constants/categories.ts` |
| Lib Structure | Utilities in `lib/`, domain modules in subdirs | `src/lib/sanity/`, `src/lib/utils/` |
| Error Handling | Try/catch with fallback to mock data | `src/lib/sanity/queries.ts:66-76` |

### Files to Reference

**Types (extend/follow patterns):**
- `src/types/obituary.ts` - Obituary, ObituarySummary, Category
- `src/types/context.ts` - ContextMetadata

**Data (use for enrichment):**
- `src/data/ai-metrics.ts` - `getMetricValueAtDate()`, `trainingComputeFrontier`

**Sanity (patterns for client):**
- `src/lib/sanity/client.ts` - Lazy client initialization pattern
- `src/lib/sanity/queries.ts` - GROQ query patterns

**API (follow route pattern):**
- `src/app/api/revalidate/route.ts` - POST handler, secret validation

**Config:**
- `vercel.json` - Add crons section

### Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Search API | Exa | Native `category: 'tweet'` and `'news'` support, semantic search, single SDK |
| LLM | Claude (Anthropic) | Best at nuanced classification, JSON mode for structured output |
| Cron Platform | Vercel Cron | Native to existing stack, free tier sufficient (2 crons, 1x/day) |
| Sanity Mutations | `@sanity/client` | Existing `next-sanity` is read-optimized, need write client |
| Stock Data | Skip external API | Use existing AI metrics data; stock prices can be added manually for now |
| Batch vs Real-time | Daily batch | AI doom claims don't expire; batch is simpler and cheaper |

---

## Implementation Plan

### Tasks

#### Phase 1: Foundation

- [x] **Task 1.1:** Add dependencies
  ```bash
  bun add exa-js @anthropic-ai/sdk @sanity/client
  ```

- [x] **Task 1.2:** Create `src/config/sources.ts` - source whitelists
  ```typescript
  // Tiered publication domains for news search
  export const PUBLICATION_TIERS = {
    tier1: string[],  // ~15 gold standard sources
    tier2: string[],  // ~15 high signal sources
  }

  // Curated Twitter/X handles by category
  export const NOTABLE_HANDLES = {
    aiResearchers: string[],
    techExecs: string[],
    vcs: string[],
    journalists: string[],
    academics: string[],
  }

  // Notability heuristics config
  export const NOTABILITY_CONFIG = {
    minFollowers: 25000,
    bioKeywords: RegExp,
  }
  ```

- [x] **Task 1.3:** Create `src/types/discovery.ts` - pipeline types
  ```typescript
  export interface DiscoveryCandidate {
    url: string
    title: string
    text: string
    publishedDate: string
    author?: AuthorMetadata
    sourceType: 'tweet' | 'news'
  }

  export interface AuthorMetadata {
    name: string
    handle?: string
    bio?: string
    followers?: number
    verified?: boolean
  }

  export interface ClassificationResult {
    isAIDoomClaim: boolean
    claimConfidence: number
    isNotable: boolean
    notabilityReason: string
    extractedClaim: string
    suggestedCategory: Category
    recommendation: 'approve' | 'review' | 'reject'
  }

  export interface ObituaryDraft {
    _type: 'obituary'
    claim: string
    source: string
    sourceUrl: string
    date: string
    categories: Category[]
    context: ContextMetadata
    _status: 'pending_review'
    _metadata: {
      discoveredAt: string
      confidence: number
      notabilityReason: string
    }
  }
  ```

#### Phase 2: Core Modules

- [x] **Task 2.1:** Create `src/lib/exa/client.ts` - Exa client
  ```typescript
  import Exa from 'exa-js'

  let _client: Exa | null = null

  export function getExaClient(): Exa | null {
    const apiKey = process.env.EXA_API_KEY
    if (!apiKey) return null

    if (!_client) {
      _client = new Exa(apiKey)
    }
    return _client
  }
  ```

- [x] **Task 2.2:** Create `src/lib/exa/queries.ts` - search functions
  ```typescript
  export async function searchTweets(since: Date): Promise<DiscoveryCandidate[]>
  export async function searchNews(since: Date): Promise<DiscoveryCandidate[]>
  export async function discoverCandidates(since: Date): Promise<DiscoveryCandidate[]>
  ```

  Implementation details:
  - Tweets: Use `category: 'tweet'`, query for AI doom keywords
  - News: Use `category: 'news'`, `includeDomains` with tier1+tier2
  - Both: `startPublishedDate: since.toISOString()`, `numResults: 50`, `text: true`

- [x] **Task 2.3:** Create `src/lib/discovery/quality-filter.ts` - quality gates
  ```typescript
  export function isWhitelistedHandle(handle: string): boolean
  export function isWhitelistedPublication(domain: string): boolean
  export function passesNotabilityHeuristics(author: AuthorMetadata): boolean
  export function filterCandidates(candidates: DiscoveryCandidate[]): DiscoveryCandidate[]
  ```

- [x] **Task 2.4:** Create `src/lib/discovery/classifier.ts` - LLM classification
  ```typescript
  import Anthropic from '@anthropic-ai/sdk'

  export async function classifyCandidate(
    candidate: DiscoveryCandidate
  ): Promise<ClassificationResult>

  export async function classifyCandidates(
    candidates: DiscoveryCandidate[]
  ): Promise<Array<{ candidate: DiscoveryCandidate; result: ClassificationResult }>>
  ```

  Implementation details:
  - Use Claude claude-sonnet-4-20250514 for cost efficiency
  - JSON mode for structured output
  - Batch candidates to reduce API calls
  - Prompt evaluates: is doom claim? is notable? extract claim, suggest category

- [x] **Task 2.5:** Create `src/lib/discovery/enricher.ts` - context enrichment
  ```typescript
  import { getMetricValueAtDate, trainingComputeFrontier } from '@/data/ai-metrics'

  export async function enrichContext(date: string): Promise<ContextMetadata>
  ```

  Implementation details:
  - Get AI compute value at date from existing metrics
  - Set benchmarkName, currentModel based on date (hardcoded timeline)
  - Return partial ContextMetadata (stock prices left for manual entry)

- [x] **Task 2.6:** Create `src/lib/sanity/mutations.ts` - write client
  ```typescript
  import { createClient } from '@sanity/client'

  export function getSanityWriteClient(): SanityClient | null
  export async function createObituaryDraft(draft: ObituaryDraft): Promise<string>
  export async function createObituaryDrafts(drafts: ObituaryDraft[]): Promise<string[]>
  ```

  Implementation details:
  - Requires `SANITY_WRITE_TOKEN` env var (different from read API)
  - Use `client.create()` with `_type: 'obituary'`
  - Generate slug from claim using existing pattern
  - Return created document IDs

#### Phase 3: Integration

- [x] **Task 3.1:** Create `src/app/api/discover/route.ts` - cron endpoint
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'

  export async function POST(request: NextRequest) {
    // 1. Verify cron secret (CRON_SECRET header)
    // 2. Calculate "since" date (24 hours ago)
    // 3. Run discovery pipeline:
    //    a. discoverCandidates(since)
    //    b. filterCandidates(candidates)
    //    c. classifyCandidates(filtered)
    //    d. Filter to recommendation !== 'reject'
    //    e. enrichContext for each
    //    f. createObituaryDrafts(drafts)
    // 4. Return summary: { discovered, filtered, classified, created }
  }
  ```

- [x] **Task 3.2:** Update `vercel.json` - add cron
  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "framework": "nextjs",
    "installCommand": "bun install",
    "crons": [{
      "path": "/api/discover",
      "schedule": "0 9 * * *"
    }]
  }
  ```

#### Phase 4: Testing

- [x] **Task 4.1:** Create `tests/unit/config/sources.test.ts`
  - Test whitelist exports are arrays with expected length
  - Test heuristic functions

- [x] **Task 4.2:** Create `tests/unit/lib/exa/queries.test.ts`
  - Mock Exa client
  - Test search query parameters
  - Test date filtering

- [x] **Task 4.3:** Create `tests/unit/lib/discovery/quality-filter.test.ts`
  - Test whitelist matching
  - Test notability heuristics
  - Test filter function with mixed input

- [x] **Task 4.4:** Create `tests/unit/lib/discovery/classifier.test.ts`
  - Mock Anthropic client
  - Test classification prompt structure
  - Test result parsing

- [x] **Task 4.5:** Create `tests/unit/lib/discovery/enricher.test.ts`
  - Test context enrichment for various dates
  - Test fallback for dates outside metric range

- [x] **Task 4.6:** Create `tests/unit/lib/sanity/mutations.test.ts`
  - Mock Sanity write client
  - Test draft creation
  - Test slug generation

- [x] **Task 4.7:** Create `tests/unit/api/discover.test.ts`
  - Mock all dependencies
  - Test auth validation
  - Test pipeline orchestration
  - Test error handling

#### Phase 5: Environment

- [x] **Task 5.1:** Document required environment variables
  ```env
  # Exa API (get from dashboard.exa.ai)
  EXA_API_KEY=xxx

  # Anthropic API (get from console.anthropic.com)
  ANTHROPIC_API_KEY=xxx

  # Sanity write token (different from read - get from sanity.io/manage)
  SANITY_WRITE_TOKEN=xxx

  # Cron secret (generate random string)
  CRON_SECRET=xxx
  ```

- [x] **Task 5.2:** Add to `.env.example` (if exists) or `README.md`

---

## Acceptance Criteria

### AC1: Discovery runs successfully
- **Given:** EXA_API_KEY is configured and valid
- **When:** /api/discover receives POST with valid CRON_SECRET
- **Then:** Returns JSON with `{ discovered: number, filtered: number, classified: number, created: number }`

### AC2: Quality filtering works correctly
- **Given:** Raw search results containing:
  - Tweet from @GaryMarcus (whitelisted)
  - Tweet from @random_user_123 with 500 followers (not notable)
  - News from wired.com (tier 1)
  - News from sketchy-blog.xyz (not whitelisted)
- **When:** Results pass through filterCandidates()
- **Then:** Only @GaryMarcus tweet and wired.com article remain

### AC3: LLM classification extracts claims
- **Given:** Text content: "AI will never achieve true creativity - it's fundamentally limited to pattern matching"
- **When:** classifyCandidate() processes content
- **Then:** Returns:
  ```json
  {
    "isAIDoomClaim": true,
    "claimConfidence": 0.85,
    "extractedClaim": "AI will never achieve true creativity",
    "suggestedCategory": "capability",
    "recommendation": "approve"
  }
  ```

### AC4: Context enrichment works
- **Given:** Date string "2023-06-15"
- **When:** enrichContext("2023-06-15") runs
- **Then:** Returns ContextMetadata with:
  - benchmarkName populated (e.g., "MMLU")
  - currentModel populated (e.g., "GPT-4")
  - compute metric value from trainingComputeFrontier

### AC5: Sanity draft creation works
- **Given:** Classified and enriched obituary candidate
- **When:** createObituaryDraft() runs
- **Then:**
  - Document created in Sanity with `_type: 'obituary'`
  - Status field indicates pending review
  - Metadata includes discovery timestamp and confidence

### AC6: End-to-end pipeline works
- **Given:** All modules configured, Vercel cron enabled
- **When:** Cron fires at 9am UTC
- **Then:**
  - Pipeline discovers ~50-100 raw candidates
  - Filters to ~15-30 quality candidates
  - Classifies and filters to ~5-10 high-confidence candidates
  - Creates draft documents in Sanity
  - Returns success response

---

## Additional Context

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `exa-js` | latest | Exa search API client |
| `@anthropic-ai/sdk` | latest | Claude classification |
| `@sanity/client` | latest | Sanity write mutations |

### Testing Strategy

1. **Unit tests** for each module with mocked external dependencies
2. **Integration test** for full pipeline with all mocks
3. **Manual testing** with real API keys in development
4. No E2E tests (cron triggers are hard to test automatically)

### Notes

**Rate Limits:**
- Exa: 1000 searches/month free tier (we use ~120/month = 4 queries × 30 days)
- Anthropic: Pay per token, ~$0.01-0.05 per classification
- Sanity: Generous free tier for writes

**Error Handling:**
- If Exa fails: Log error, return empty candidates, don't create drafts
- If Anthropic fails: Skip classification for that candidate, don't create draft
- If Sanity fails: Log error, return partial success with failed IDs

**Future Enhancements:**
- Public submission form with URL input
- Webhook from Exa Websets for real-time discovery
- Stock price API integration for auto-enrichment
- Sanity Studio customization for review queue UI

---

## File Tree (New Files)

```
src/
├── config/
│   └── sources.ts                    # Publication + handle whitelists
├── types/
│   └── discovery.ts                  # Pipeline types
├── lib/
│   ├── exa/
│   │   ├── client.ts                 # Exa client initialization
│   │   └── queries.ts                # Search functions
│   ├── discovery/
│   │   ├── quality-filter.ts         # Quality gates
│   │   ├── classifier.ts             # LLM classification
│   │   └── enricher.ts               # Context enrichment
│   └── sanity/
│       └── mutations.ts              # Write client + mutations
└── app/
    └── api/
        └── discover/
            └── route.ts              # Cron endpoint

tests/unit/
├── config/
│   └── sources.test.ts
├── lib/
│   ├── exa/
│   │   └── queries.test.ts
│   ├── discovery/
│   │   ├── quality-filter.test.ts
│   │   ├── classifier.test.ts
│   │   └── enricher.test.ts
│   └── sanity/
│       └── mutations.test.ts
└── api/
    └── discover.test.ts

vercel.json                           # Updated with crons
```
