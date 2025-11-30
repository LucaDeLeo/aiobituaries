# aiobituaries - Epic Breakdown

**Author:** Luca
**Date:** 2025-11-29
**Project Level:** Low Complexity Web Application
**Target Scale:** MVP with ~50 obituaries, scaling to 200+

---

## Overview

This document provides the complete epic and story breakdown for aiobituaries, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Living Document Notice:** This version incorporates full context from PRD, UX Design Specification, and Architecture documents.

**Epic Structure (6 Epics, 47 FRs):**

| Epic | Title | User Value | FRs |
|------|-------|------------|-----|
| 1 | Foundation | Project infrastructure ready for development | 5 |
| 2 | Core Content Display | Can browse, view, and share obituaries | 12 |
| 3 | Timeline Visualization | Can see the pattern visually (hero feature) | 8 |
| 4 | Category System & Filtering | Can explore by category, share filtered views | 5 |
| 5 | Navigation & Responsive Experience | Works on all devices with complete navigation | 9 |
| 6 | Accessibility & Quality | Works for everyone, performs well | 8 |

---

## Functional Requirements Inventory

**Total MVP FRs: 47**

### Data Display & Core Content (FR1-6)
| FR | Description |
|----|-------------|
| FR1 | System displays total obituary count prominently on homepage |
| FR2 | System displays list of all obituaries with claim preview, source, and date |
| FR3 | Users can view individual obituary details including full claim text, source with link, date, and category tags |
| FR4 | System displays contextual data for each obituary (AI capabilities, stock prices, benchmarks at time of claim) |
| FR5 | System loads obituary data from external JSON/API source (not hardcoded) |
| FR6 | System updates displayed data when source data changes (via ISR revalidation) |

### Timeline Visualization (FR7-13)
| FR | Description |
|----|-------------|
| FR7 | System displays obituaries on an interactive chronological timeline |
| FR8 | Users can scroll/pan the timeline horizontally to navigate through time |
| FR9 | Users can zoom in/out on timeline to adjust time scale granularity |
| FR10 | Timeline displays density visualization showing clusters of obituaries |
| FR11 | Users can hover on timeline data points to see preview tooltips |
| FR12 | Users can click timeline data points to open obituary detail modal |
| FR13 | Timeline gracefully degrades to list view on mobile devices |

### Category System & Filtering (FR14-18)
| FR | Description |
|----|-------------|
| FR14 | System categorizes obituaries into four types: Capability doubt, Market/bubble claims, AGI skepticism, Dismissive framing |
| FR15 | Users can filter obituaries by one or more categories |
| FR16 | System displays category breakdown visualization (chart showing distribution) |
| FR17 | Filtered view updates timeline and list displays in real-time |
| FR18 | System persists filter state in URL for shareability |

### Individual Obituary Pages (FR19-23)
| FR | Description |
|----|-------------|
| FR19 | Each obituary has a dedicated page with unique, semantic URL |
| FR20 | Users can navigate from modal view to full obituary page |
| FR21 | Users can navigate between obituaries (previous/next) |
| FR22 | Users can return to timeline with scroll position preserved |
| FR23 | Obituary pages include full contextual snapshot display |

### Navigation & Information Architecture (FR24-26)
| FR | Description |
|----|-------------|
| FR24 | Site has clear primary navigation (Home, Timeline, Categories, About) |
| FR25 | Users can navigate to homepage from any page |
| FR26 | System provides breadcrumb navigation on detail pages |

### SEO & Discoverability (FR27-31)
| FR | Description |
|----|-------------|
| FR27 | Each obituary page has unique meta title and description |
| FR28 | System generates Open Graph and Twitter Card meta tags for social sharing |
| FR29 | System generates JSON-LD structured data for rich search snippets |
| FR30 | System automatically generates sitemap including all obituary pages |
| FR31 | All pages are statically generated and crawlable |

### Sharing & Social (FR32-33)
| FR | Description |
|----|-------------|
| FR32 | Users can copy shareable link for any obituary |
| FR33 | Obituary pages display well when shared on social platforms (preview cards) |

### Responsive Design (FR34-37)
| FR | Description |
|----|-------------|
| FR34 | Site is fully functional on mobile devices (320px+) |
| FR35 | Site is fully functional on tablet devices (768px+) |
| FR36 | Site provides optimal experience on desktop (1024px+) |
| FR37 | Timeline visualization adapts appropriately per breakpoint |

### Accessibility (FR38-44)
| FR | Description |
|----|-------------|
| FR38 | Site meets WCAG 2.1 AA compliance standards |
| FR39 | All interactive elements are keyboard navigable |
| FR40 | Timeline is fully keyboard accessible |
| FR41 | Screen readers can access all timeline data |
| FR42 | System provides alternative table view of timeline data |
| FR43 | All images have appropriate alt text |
| FR44 | Color contrast meets 4.5:1 minimum ratio |

### Performance (FR45-47)
| FR | Description |
|----|-------------|
| FR45 | Pages load within acceptable performance thresholds (Core Web Vitals) |
| FR46 | Timeline renders smoothly without jank during interaction |
| FR47 | Animations run at 60fps |

---

## FR Coverage Map

### Epic 1: Foundation
| FR | Requirement |
|----|-------------|
| FR5 | System loads obituary data from external JSON/API source (Sanity client setup) |
| FR6 | System updates displayed data when source data changes (ISR webhook) |
| FR24 | Site has clear primary navigation (layout shell) |
| FR25 | Users can navigate to homepage from any page (navigation structure) |
| FR31 | All pages are statically generated and crawlable (Next.js SSG config) |

### Epic 2: Core Content Display
| FR | Requirement |
|----|-------------|
| FR1 | System displays total obituary count prominently on homepage |
| FR2 | System displays list of all obituaries with claim preview, source, and date |
| FR3 | Users can view individual obituary details (full claim, source, date, tags) |
| FR4 | System displays contextual data (AI capabilities, stock prices, benchmarks) |
| FR19 | Each obituary has a dedicated page with unique, semantic URL |
| FR23 | Obituary pages include full contextual snapshot display |
| FR27 | Each obituary page has unique meta title and description |
| FR28 | System generates Open Graph and Twitter Card meta tags |
| FR29 | System generates JSON-LD structured data for rich snippets |
| FR30 | System automatically generates sitemap including all obituary pages |
| FR32 | Users can copy shareable link for any obituary |
| FR33 | Obituary pages display well when shared on social platforms |

### Epic 3: Timeline Visualization
| FR | Requirement |
|----|-------------|
| FR7 | System displays obituaries on an interactive chronological timeline |
| FR8 | Users can scroll/pan the timeline horizontally |
| FR9 | Users can zoom in/out on timeline |
| FR10 | Timeline displays density visualization showing clusters |
| FR11 | Users can hover on timeline data points for preview tooltips |
| FR12 | Users can click timeline data points to open obituary modal |
| FR46 | Timeline renders smoothly without jank during interaction |
| FR47 | Animations run at 60fps |

### Epic 4: Category System & Filtering
| FR | Requirement |
|----|-------------|
| FR14 | System categorizes obituaries into four types |
| FR15 | Users can filter obituaries by one or more categories |
| FR16 | System displays category breakdown visualization |
| FR17 | Filtered view updates timeline and list in real-time |
| FR18 | System persists filter state in URL for shareability |

### Epic 5: Navigation & Responsive Experience
| FR | Requirement |
|----|-------------|
| FR13 | Timeline gracefully degrades to list view on mobile |
| FR20 | Users can navigate from modal view to full obituary page |
| FR21 | Users can navigate between obituaries (previous/next) |
| FR22 | Users can return to timeline with scroll position preserved |
| FR26 | System provides breadcrumb navigation on detail pages |
| FR34 | Site is fully functional on mobile devices (320px+) |
| FR35 | Site is fully functional on tablet devices (768px+) |
| FR36 | Site provides optimal experience on desktop (1024px+) |
| FR37 | Timeline visualization adapts appropriately per breakpoint |

### Epic 6: Accessibility & Quality
| FR | Requirement |
|----|-------------|
| FR38 | Site meets WCAG 2.1 AA compliance standards |
| FR39 | All interactive elements are keyboard navigable |
| FR40 | Timeline is fully keyboard accessible |
| FR41 | Screen readers can access all timeline data |
| FR42 | System provides alternative table view of timeline data |
| FR43 | All images have appropriate alt text |
| FR44 | Color contrast meets 4.5:1 minimum ratio |
| FR45 | Pages load within acceptable performance thresholds (Core Web Vitals) |

---

## Epic 1: Foundation

**Goal:** Project infrastructure ready for development

**FRs Covered:** FR5, FR6, FR24, FR25, FR31

**Context from Architecture:**
- Stack: Next.js 16.0.5, Tailwind CSS 4.1.x, shadcn/ui 3.5.0
- Data: Sanity CMS with @sanity/client 6.29.1
- Project structure follows Architecture doc specification

---

### Story 1.1: Project Initialization

**As a** developer,
**I want** a Next.js 16 project initialized with the core stack,
**So that** I can begin building features on a solid foundation.

**Acceptance Criteria:**

**Given** no existing project
**When** initialization commands are executed
**Then** the following is created:
- Next.js 16 project with App Router and `src/` directory
- TypeScript strict mode enabled
- Tailwind CSS v4 configured
- ESLint configured
- shadcn/ui initialized with default config
- Project runs with `npm run dev` without errors

**And** the following dependencies are installed:
- `@sanity/client@^6.29.1`
- `@visx/visx@^3.12.0`
- `motion@^12.9.2`
- `nuqs@^2.x`
- `date-fns@^4.1.0`

**And** dev dependencies include:
- `vitest@^3.2.4`
- `@testing-library/react`
- `playwright@^1.57.0`

**Prerequisites:** None (first story)

**Technical Notes:**
```bash
npx create-next-app@latest aiobituaries --typescript --tailwind --eslint --app --src-dir
cd aiobituaries
npx shadcn@latest init
npm install @sanity/client @visx/visx motion nuqs date-fns
npm install -D vitest @testing-library/react playwright
```

**Files Created:**
- `src/app/layout.tsx` (root layout)
- `src/app/page.tsx` (homepage placeholder)
- `src/app/globals.css` (Tailwind directives)
- `tailwind.config.ts`
- `tsconfig.json`
- `next.config.ts`

---

### Story 1.2: Design System Setup

**As a** developer,
**I want** the Deep Archive theme implemented as CSS variables,
**So that** all components use consistent visual styling.

**Acceptance Criteria:**

**Given** an initialized project
**When** design system is configured
**Then** the following CSS variables are defined in `globals.css`:

```css
/* Deep Archive Theme */
--bg-primary: #0C0C0F;
--bg-secondary: #14141A;
--bg-card: #18181F;
--bg-tertiary: #1C1C24;
--border: #2A2A35;
--text-primary: #E8E6E3;
--text-secondary: #A8A5A0;
--text-muted: #6B6860;
--accent-primary: #C9A962;

/* Category Colors */
--category-capability: #C9A962;
--category-market: #7B9E89;
--category-agi: #9E7B7B;
--category-dismissive: #7B7B9E;

/* Semantic */
--success: #7B9E89;
--warning: #C9A962;
--error: #9E5555;
--info: #7B8B9E;
```

**And** fonts are configured:
- Headlines: Instrument Serif (Google Fonts or local)
- Body/UI: Geist (Next.js built-in or npm)
- Monospace: Geist Mono

**And** shadcn/ui components are themed to use Deep Archive colors

**And** body has `bg-[--bg-primary]` and `text-[--text-primary]`

**Prerequisites:** Story 1.1

**Technical Notes:**
- Use `next/font` for Geist (available in Next.js)
- Instrument Serif via Google Fonts or self-hosted
- Update `tailwind.config.ts` to extend with CSS variable references
- Configure shadcn/ui `components.json` for dark theme

**Files Modified:**
- `src/app/globals.css` (theme variables)
- `src/app/layout.tsx` (font configuration)
- `tailwind.config.ts` (extend colors)
- `components.json` (shadcn theme)

---

### Story 1.3: Sanity CMS Integration

**As a** developer,
**I want** Sanity CMS client configured with TypeScript types,
**So that** I can fetch obituary data with type safety.

**Acceptance Criteria:**

**Given** project with design system
**When** Sanity integration is complete
**Then** the following exists:

**And** `src/lib/sanity/client.ts` exports configured Sanity client:
```typescript
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

**And** `src/lib/sanity/queries.ts` exports GROQ queries:
- `getObituaries()` - fetch all obituaries
- `getObituaryBySlug(slug)` - fetch single obituary
- `getObituaryCount()` - fetch total count

**And** `src/types/obituary.ts` defines TypeScript interfaces:
```typescript
export interface Obituary {
  _id: string
  slug: string
  claim: string
  source: string
  sourceUrl: string
  date: string
  categories: Category[]
  context: ContextMetadata
}

export type Category = 'market' | 'capability' | 'agi' | 'dismissive'

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

**And** `.env.local.example` documents required env vars:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_TOKEN`
- `SANITY_WEBHOOK_SECRET`

**Prerequisites:** Story 1.1

**Technical Notes:**
- Sanity project must exist (created separately or via `npm create sanity@latest`)
- GROQ queries should use projection for minimal payload
- Types match Sanity schema from Architecture doc

**Files Created:**
- `src/lib/sanity/client.ts`
- `src/lib/sanity/queries.ts`
- `src/types/obituary.ts`
- `src/types/context.ts`
- `.env.local.example`

---

### Story 1.4: Layout Shell & Navigation

**As a** user,
**I want** a consistent navigation header across all pages,
**So that** I can always return home and understand where I am.

**Acceptance Criteria:**

**Given** a user on any page
**When** the page loads
**Then** a header is visible with:
- Site title "AI Obituaries" (left, links to `/`)
- Navigation links: Home, About
- Deep Archive styling (dark bg, gold accents)

**And** header is sticky/fixed at top
**And** header has subtle backdrop blur effect
**And** navigation links show active state (gold underline)
**And** logo/title uses Instrument Serif font
**And** mobile: hamburger menu (shadcn Sheet component)

**Given** a user clicks site title or "Home"
**When** navigation completes
**Then** user is on homepage (`/`)

**And** a footer exists with:
- Copyright text
- Optional: link to source/GitHub

**Prerequisites:** Story 1.2 (design system)

**Technical Notes:**
- Use shadcn/ui `Sheet` for mobile nav
- Use `next/link` for navigation
- Active state via `usePathname()` hook
- Header height ~64px, account for in page layouts

**Files Created:**
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/components/layout/nav.tsx`
- `src/components/layout/mobile-nav.tsx`

**Files Modified:**
- `src/app/layout.tsx` (wrap with Header/Footer)

---

### Story 1.5: ISR Revalidation Webhook

**As a** content editor,
**I want** the site to update automatically when I publish changes in Sanity,
**So that** new obituaries appear without manual deployment.

**Acceptance Criteria:**

**Given** a configured Sanity webhook pointing to `/api/revalidate`
**When** content is published in Sanity
**Then** the webhook receives a POST request

**And** the endpoint validates `x-sanity-webhook-secret` header
**And** returns 401 if secret is invalid
**And** revalidates the following paths on success:
- `/` (homepage)
- `/claims` (all claims page, future)
- `/obituary/[slug]` (all obituary pages)

**And** returns JSON `{ revalidated: true }` on success

**Given** an invalid or missing secret
**When** webhook is called
**Then** returns 401 `{ error: 'Invalid secret' }`

**Prerequisites:** Story 1.3 (Sanity integration)

**Technical Notes:**
- Use Next.js `revalidatePath()` from `next/cache`
- Webhook secret stored in `SANITY_WEBHOOK_SECRET` env var
- Configure Sanity webhook to fire on `obituary` document changes

**Files Created:**
- `src/app/api/revalidate/route.ts`

```typescript
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-sanity-webhook-secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  revalidatePath('/')
  revalidatePath('/claims')
  revalidatePath('/obituary/[slug]', 'page')

  return NextResponse.json({ revalidated: true })
}
```

---

### Epic 1 Summary

| Story | Title | FRs | Prerequisites |
|-------|-------|-----|---------------|
| 1.1 | Project Initialization | FR31 | None |
| 1.2 | Design System Setup | — | 1.1 |
| 1.3 | Sanity CMS Integration | FR5 | 1.1 |
| 1.4 | Layout Shell & Navigation | FR24, FR25 | 1.2 |
| 1.5 | ISR Revalidation Webhook | FR6 | 1.3 |

**Epic 1 Completion Criteria:**
- [ ] Project runs locally with `npm run dev`
- [ ] Deep Archive theme visible (dark bg, gold accent)
- [ ] Navigation header on all pages
- [ ] Sanity client fetches data (with test project)
- [ ] ISR webhook responds to POST requests

---

## Epic 2: Core Content Display

**Goal:** Users can browse, view, and share obituaries

**FRs Covered:** FR1, FR2, FR3, FR4, FR19, FR23, FR27, FR28, FR29, FR30, FR32, FR33

**Context from UX Design:**
- Count Display: Geist Mono, 4rem (64px), gold (#C9A962), subtle pulsing glow
- Cards: bg-card (#18181F), 12px radius
- Claim text: Instrument Serif for quotes

**Context from Architecture:**
- Server Components for data fetching
- Individual pages at `/obituary/[slug]`
- Sanity GROQ queries for data

---

### Story 2.1: Hero Count Display

**As a** visitor,
**I want** to see the total number of AI obituaries prominently displayed,
**So that** I immediately understand the scale of documented skepticism.

**Acceptance Criteria:**

**Given** a user lands on the homepage
**When** the page loads
**Then** a large count number is displayed prominently

**And** the count uses:
- Geist Mono font
- 4rem (64px) size on desktop, scales down on mobile
- Gold color (#C9A962)
- Subtle pulsing glow animation (3s ease-in-out infinite)
- Position: top-right area of header/hero section

**And** the count is fetched server-side from Sanity via `getObituaryCount()`
**And** displays with label "obituaries" below the number
**And** the number is formatted with locale (e.g., "1,247" not "1247")

**Given** prefers-reduced-motion is enabled
**When** page loads
**Then** pulsing glow animation is disabled

**Prerequisites:** Story 1.3 (Sanity integration), Story 1.4 (layout)

**Technical Notes:**
- Create `src/components/obituary/count-display.tsx`
- Use CSS animation with `@media (prefers-reduced-motion: reduce)` check
- Server Component - fetch count at build/request time
- Use `Intl.NumberFormat` for locale formatting

**Files Created:**
- `src/components/obituary/count-display.tsx`

---

### Story 2.2: Obituary List Display

**As a** visitor,
**I want** to see a list of all obituaries with key information,
**So that** I can browse and find interesting claims.

**Acceptance Criteria:**

**Given** a user is on the homepage or claims page
**When** obituary data loads
**Then** obituaries are displayed as cards showing:
- Claim text (truncated to ~150 chars with ellipsis)
- Source name (e.g., "Gary Marcus", "TechCrunch")
- Date formatted as "Mar 14, 2023"
- Category indicator (colored dot matching category)

**And** cards use Deep Archive styling:
- Background: `--bg-card` (#18181F)
- Border radius: 12px
- Border: 1px `--border` (#2A2A35)
- Hover: subtle lift effect (translateY -2px, shadow)

**And** cards are sorted by date (newest first by default)
**And** claim text uses Instrument Serif (italic) for quote feel
**And** clicking a card navigates to the obituary detail page

**Prerequisites:** Story 1.3, Story 2.1

**Technical Notes:**
- Create `src/components/obituary/obituary-card.tsx`
- Use shadcn/ui Card as base, extend with custom styling
- Truncation via CSS `line-clamp` or JS slice
- Use `date-fns` format for dates
- Link wraps entire card for accessibility

**Files Created:**
- `src/components/obituary/obituary-card.tsx`
- `src/components/obituary/obituary-list.tsx`

---

### Story 2.3: Individual Obituary Pages

**As a** visitor,
**I want** each obituary to have its own dedicated page,
**So that** I can view full details and share specific obituaries.

**Acceptance Criteria:**

**Given** an obituary exists with slug "gary-marcus-ai-bubble-2023"
**When** user navigates to `/obituary/gary-marcus-ai-bubble-2023`
**Then** a dedicated page displays with:
- Full claim text (no truncation, large Instrument Serif)
- Source name with external link to original article
- Publication date (full format: "March 14, 2023")
- Category tags as colored badges

**And** the page layout includes:
- Back link to homepage/timeline
- Claim as hero quote (centered, prominent)
- Source attribution below claim
- Contextual data section (Story 2.4)

**And** external source link opens in new tab with `rel="noopener noreferrer"`

**Given** slug doesn't exist
**When** user navigates to invalid URL
**Then** 404 page is displayed with link to homepage

**Prerequisites:** Story 1.3, Story 1.4

**Technical Notes:**
- Create `src/app/obituary/[slug]/page.tsx`
- Use `generateStaticParams` for SSG of all obituary pages
- Use `getObituaryBySlug(slug)` query
- Create `src/app/not-found.tsx` for 404

**Files Created:**
- `src/app/obituary/[slug]/page.tsx`
- `src/components/obituary/obituary-detail.tsx`
- `src/app/obituary/[slug]/not-found.tsx`

---

### Story 2.4: Contextual Snapshot Display

**As a** visitor,
**I want** to see what AI could do when each claim was made,
**So that** I can judge the prediction against reality at the time.

**Acceptance Criteria:**

**Given** an obituary with contextual data
**When** viewing the obituary detail page
**Then** a "Context at Time" section displays:

**And** if stock prices exist:
- NVDA: $XXX.XX
- MSFT: $XXX.XX (if available)
- GOOG: $XXX.XX (if available)

**And** if AI model info exists:
- "Latest model: GPT-4" (or whatever was current)

**And** if benchmark exists:
- Benchmark name and score

**And** if milestone exists:
- "X days after [milestone]" or milestone description

**And** if note exists:
- Additional context in muted text

**Given** contextual data is partially missing
**When** viewing the detail
**Then** only available fields are shown (graceful degradation)

**Given** no contextual data exists
**When** viewing the detail
**Then** section shows "Context data unavailable" in muted text

**Prerequisites:** Story 2.3

**Technical Notes:**
- Create `src/components/obituary/obituary-context.tsx`
- Use shadcn/ui Card for context section
- Format currency with `Intl.NumberFormat`
- Icon indicators for each data type (optional)

**Files Created:**
- `src/components/obituary/obituary-context.tsx`

---

### Story 2.5: SEO Meta Tags

**As a** content sharer,
**I want** obituary pages to have rich meta tags,
**So that** shared links look good on social media and search.

**Acceptance Criteria:**

**Given** an obituary page
**When** page is rendered
**Then** the following meta tags are present:

**Title tag:**
- Format: "[Claim preview...] - AI Obituaries"
- Max 60 chars, truncated with ellipsis if needed

**Meta description:**
- Format: "[Source] claimed '[claim preview]' on [date]. See the full context."
- Max 155 chars

**Open Graph tags:**
- `og:title` - same as title
- `og:description` - same as meta description
- `og:type` - "article"
- `og:url` - canonical URL
- `og:image` - default OG image (Story 2.5b if custom)
- `og:site_name` - "AI Obituaries"

**Twitter Card tags:**
- `twitter:card` - "summary_large_image"
- `twitter:title` - same as title
- `twitter:description` - same as meta description
- `twitter:image` - same as og:image

**And** homepage has its own meta tags:
- Title: "AI Obituaries - Documenting AI Skepticism"
- Description: "A data-driven archive of every time critics declared AI dead, overhyped, or a bubble. [count] documented predictions and counting."

**Prerequisites:** Story 2.3

**Technical Notes:**
- Use Next.js `metadata` export in page.tsx
- Use `generateMetadata` function for dynamic pages
- Create utility function for truncation
- Default OG image at `/public/og/default.png` (1200x630)

**Files Modified:**
- `src/app/obituary/[slug]/page.tsx` (add generateMetadata)
- `src/app/page.tsx` (add metadata export)
- `src/app/layout.tsx` (base metadata)

**Files Created:**
- `src/lib/utils/seo.ts` (helper functions)
- `public/og/default.png` (placeholder - design later)

---

### Story 2.6: JSON-LD Structured Data

**As a** search engine,
**I want** structured data on obituary pages,
**So that** I can display rich snippets in search results.

**Acceptance Criteria:**

**Given** an obituary page
**When** page is rendered
**Then** JSON-LD script tag is present with:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[claim preview]",
  "datePublished": "[ISO date]",
  "author": {
    "@type": "Person",
    "name": "[source]"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AI Obituaries",
    "url": "https://aiobituaries.com"
  },
  "description": "[meta description]",
  "url": "[canonical URL]"
}
```

**And** homepage has Organization structured data:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AI Obituaries",
  "description": "A data-driven archive documenting AI skepticism",
  "url": "https://aiobituaries.com"
}
```

**Prerequisites:** Story 2.5

**Technical Notes:**
- Create `src/components/seo/json-ld.tsx`
- Render as `<script type="application/ld+json">`
- Validate with Google Rich Results Test

**Files Created:**
- `src/components/seo/json-ld.tsx`

---

### Story 2.7: Sitemap Generation

**As a** search engine crawler,
**I want** a sitemap listing all obituary pages,
**So that** I can discover and index all content.

**Acceptance Criteria:**

**Given** the site is deployed
**When** `/sitemap.xml` is requested
**Then** XML sitemap is returned containing:
- Homepage URL
- About page URL
- All individual obituary page URLs
- Each URL includes `<lastmod>` date

**And** sitemap is automatically updated when obituaries change (via ISR)
**And** sitemap follows XML sitemap protocol

**And** `robots.txt` exists at `/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://aiobituaries.com/sitemap.xml
```

**Prerequisites:** Story 2.3, Story 1.5 (ISR)

**Technical Notes:**
- Create `src/app/sitemap.ts` (Next.js sitemap route)
- Create `src/app/robots.ts` (Next.js robots route)
- Fetch all obituary slugs from Sanity
- Use Next.js MetadataRoute types

**Files Created:**
- `src/app/sitemap.ts`
- `src/app/robots.ts`

---

### Story 2.8: Share/Copy Link

**As a** visitor,
**I want** to easily copy a link to share an obituary,
**So that** I can use it in debates and discussions.

**Acceptance Criteria:**

**Given** a user is viewing an obituary (modal or full page)
**When** user clicks "Copy link" button
**Then** the canonical URL is copied to clipboard

**And** a toast notification appears:
- Position: bottom-right
- Message: "Link copied to clipboard"
- Icon: checkmark
- Color: success green (#7B9E89)
- Auto-dismiss after 3 seconds

**Given** clipboard API fails (older browser)
**When** user clicks "Copy link"
**Then** toast shows error: "Couldn't copy link. Try selecting the URL manually."
**And** URL is displayed in a selectable text field as fallback

**And** copy button design:
- Icon: link/copy icon
- Label: "Copy link"
- Style: secondary button

**Prerequisites:** Story 2.3

**Technical Notes:**
- Use `navigator.clipboard.writeText()` with try/catch
- Use shadcn/ui Toast component
- Create `src/components/ui/copy-button.tsx`
- Wrap in `useCallback` for performance

**Files Created:**
- `src/components/ui/copy-button.tsx`

**Files Added (shadcn):**
- `src/components/ui/toast.tsx` (via `npx shadcn@latest add toast`)
- `src/components/ui/toaster.tsx`

---

### Epic 2 Summary

| Story | Title | FRs | Prerequisites |
|-------|-------|-----|---------------|
| 2.1 | Hero Count Display | FR1 | 1.3, 1.4 |
| 2.2 | Obituary List Display | FR2 | 1.3, 2.1 |
| 2.3 | Individual Obituary Pages | FR3, FR19 | 1.3, 1.4 |
| 2.4 | Contextual Snapshot Display | FR4, FR23 | 2.3 |
| 2.5 | SEO Meta Tags | FR27, FR28 | 2.3 |
| 2.6 | JSON-LD Structured Data | FR29 | 2.5 |
| 2.7 | Sitemap Generation | FR30 | 2.3, 1.5 |
| 2.8 | Share/Copy Link | FR32, FR33 | 2.3 |

**Epic 2 Completion Criteria:**
- [ ] Count displays prominently with gold styling
- [ ] Obituary cards show claim, source, date, category
- [ ] Individual pages load with full content
- [ ] Contextual data displays when available
- [ ] Meta tags render correctly (test with social debuggers)
- [ ] JSON-LD validates with Google tool
- [ ] Sitemap accessible at /sitemap.xml
- [ ] Copy link works with toast feedback

---

## Epic 3: Timeline Visualization

**Goal:** Users can see the PATTERN visually — the hero differentiator

**FRs Covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR46, FR47

**Context from UX Design:**
- Dots: 12-16px diameter, soft circles, subtle shadow
- Category colors: Gold (capability), Sage (market), Rose (AGI), Lavender (dismissive)
- Hover: 1.3x scale, intensified glow, cursor pointer
- Tooltip: Dark bg, gold border, 280px max-width, 300ms delay
- Time axis: Years prominent, months appear on zoom

**Context from Architecture:**
- Visx 3.12 for visualization (@visx/scale, @visx/axis, @visx/shape)
- Motion 12.9 for animations
- Contextual Y-axis pattern (market=stock, capability=benchmark, spread=jitter)

---

### Story 3.1: Scatter Plot Foundation

**As a** visitor,
**I want** to see obituaries plotted on a timeline,
**So that** I can visualize the pattern of AI skepticism over time.

**Acceptance Criteria:**

**Given** obituary data is loaded
**When** the homepage renders
**Then** a scatter plot visualization is displayed

**And** the visualization:
- Takes full width of container
- Has minimum height of 400px (desktop), 300px (mobile)
- Has dark background matching `--bg-secondary`
- Has subtle grid lines at year intervals

**And** the X-axis represents time (date)
**And** the Y-axis uses "spread" mode by default (jitter for visual distribution)

**Given** no obituaries exist
**When** visualization renders
**Then** empty state shows "No obituaries yet" message

**Prerequisites:** Epic 1 complete, Story 2.1

**Technical Notes:**
- Create `src/components/visualization/scatter-plot.tsx` (client component)
- Use Visx: `@visx/scale` (scaleTime, scaleLinear), `@visx/group`
- Import only needed Visx packages (tree-shaking)
- Use `useMemo` for scale calculations
- Responsive: use `@visx/responsive` ParentSize or ResizeObserver

**Files Created:**
- `src/components/visualization/scatter-plot.tsx`
- `src/components/visualization/types.ts`

---

### Story 3.2: Timeline Data Points

**As a** visitor,
**I want** to see each obituary as a dot on the timeline,
**So that** I can identify individual claims and their timing.

**Acceptance Criteria:**

**Given** scatter plot is rendered with obituary data
**When** data points are drawn
**Then** each obituary appears as a circle:
- Size: 14px diameter
- Shape: soft circle with subtle shadow
- Color: category color (fill)
  - Capability: #C9A962 (gold)
  - Market: #7B9E89 (sage)
  - AGI: #9E7B7B (rose)
  - Dismissive: #7B7B9E (lavender)
- Opacity: 80% default

**And** X position = date (scaled to timeline width)
**And** Y position = jitter value (deterministic based on ID, 0-1 range scaled to height)

**And** dots have subtle glow effect (box-shadow or filter)
**And** overlapping dots create additive brightness effect

**Prerequisites:** Story 3.1

**Technical Notes:**
- Create `src/components/visualization/scatter-point.tsx`
- Use `@visx/shape` Circle or custom SVG circle
- Jitter algorithm: `hashToJitter(id)` from Architecture doc
- CSS filter for glow: `filter: drop-shadow(0 0 4px currentColor)`
- Use Motion for enter animation (fade in, scale from 0)

**Files Created:**
- `src/components/visualization/scatter-point.tsx`
- `src/lib/utils/scatter-helpers.ts` (jitter algorithm)

---

### Story 3.3: Horizontal Scroll/Pan

**As a** visitor,
**I want** to scroll the timeline horizontally,
**So that** I can navigate through different time periods.

**Acceptance Criteria:**

**Given** timeline is wider than viewport (zoomed in or many data points)
**When** user scrolls horizontally (mouse wheel, trackpad, touch drag)
**Then** timeline pans smoothly with momentum

**And** pan behavior:
- Scroll wheel (shift+scroll or horizontal scroll) pans left/right
- Touch: drag gesture pans
- Mouse: click and drag pans (grab cursor)
- Momentum: continues briefly after release, decelerates smoothly

**And** visual indicators:
- Gradient fade at left/right edges when more content exists
- Cursor changes to "grab" when hovering, "grabbing" when dragging

**And** pan is bounded to data extent (can't scroll past first/last obituary)

**Prerequisites:** Story 3.2

**Technical Notes:**
- Use CSS `overflow-x: auto` with custom scrollbar styling OR
- Custom pan handler with `@visx/zoom` or Motion gestures
- Momentum via `motion` spring physics or CSS scroll-snap
- Gradient fade: CSS linear-gradient pseudo-elements

**Files Modified:**
- `src/components/visualization/scatter-plot.tsx`

---

### Story 3.4: Zoom Functionality

**As a** visitor,
**I want** to zoom in and out on the timeline,
**So that** I can see dense clusters or the full picture.

**Acceptance Criteria:**

**Given** timeline is displayed
**When** user zooms (scroll wheel, pinch gesture)
**Then** timeline scale changes smoothly

**And** zoom behavior:
- Scroll wheel (no modifier): zoom in/out
- Pinch gesture (touch): zoom in/out
- Zoom centers on cursor position
- Scale range: 0.5x (zoomed out) to 5x (zoomed in)
- Zoom is animated (spring physics, ~200ms)

**And** when zooming in:
- Time axis shows more granular markers (months, then weeks)
- Dots spread apart (less overlap)

**And** when zooming out:
- Time axis shows years only
- Dots cluster/overlap, density glow intensifies

**And** zoom controls (optional UI):
- + / - buttons in corner
- Reset button to return to 1x

**Prerequisites:** Story 3.3

**Technical Notes:**
- Use `@visx/zoom` for transform matrix management
- Or custom zoom state with Motion for animations
- Recalculate scales on zoom change
- Use `requestAnimationFrame` for smooth updates

**Files Modified:**
- `src/components/visualization/scatter-plot.tsx`

**Files Created:**
- `src/components/visualization/zoom-controls.tsx`
- `src/lib/hooks/use-zoom.ts`

---

### Story 3.5: Density Visualization

**As a** visitor,
**I want** to see where obituaries cluster densely,
**So that** I can identify periods of peak AI skepticism.

**Acceptance Criteria:**

**Given** multiple obituaries exist in a short time period
**When** dots overlap or are very close
**Then** visual density is apparent through:
- Overlapping dots create brighter glow (additive)
- At high zoom-out, dots may merge into cluster indicator
- Cluster shows count badge when containing 5+ dots

**And** density behavior at different zoom levels:
- Zoomed out (< 0.7x): Heavy clustering, count badges visible
- Normal (0.7x - 1.5x): Some overlap, glow indicates density
- Zoomed in (> 1.5x): Dots fully separated

**Given** a cluster of 10+ obituaries
**When** zoomed out
**Then** cluster shows as single glowing dot with badge "+10"

**Given** user clicks a cluster
**When** cluster is activated
**Then** timeline zooms into that time period (animated)

**Prerequisites:** Story 3.4

**Technical Notes:**
- Implement clustering algorithm (group points within X px radius)
- Dynamic cluster calculation based on zoom level
- Badge component for count display
- Click handler triggers zoom to cluster bounds

**Files Created:**
- `src/lib/utils/clustering.ts`
- `src/components/visualization/cluster-badge.tsx`

---

### Story 3.6: Hover Tooltips

**As a** visitor,
**I want** to see a preview when hovering over a dot,
**So that** I can quickly scan claims without clicking.

**Acceptance Criteria:**

**Given** user hovers over a timeline dot
**When** hover duration exceeds 300ms
**Then** a tooltip appears showing:
- Claim text (truncated to ~100 chars)
- Source name
- Date (formatted: "Mar 14, 2023")

**And** tooltip styling:
- Background: `--bg-tertiary` (#1C1C24)
- Border: 1px `--accent-primary` (#C9A962)
- Border radius: 8px
- Max width: 280px
- Position: above dot, centered (flips if near edge)
- Shadow: subtle drop shadow

**And** tooltip animation:
- Fade in (opacity 0→1, 150ms)
- Slight scale (0.95→1)

**Given** user moves mouse away from dot
**When** cursor leaves
**Then** tooltip fades out immediately (no delay)

**And** dot hover state:
- Scale: 1.3x
- Glow intensifies
- Transition: 150ms ease-out

**Prerequisites:** Story 3.2

**Technical Notes:**
- Use `@visx/tooltip` or shadcn/ui Tooltip
- Manage tooltip state in scatter-plot component
- Use `onMouseEnter`/`onMouseLeave` on points
- Debounce hover to prevent flicker (300ms delay)

**Files Created:**
- `src/components/visualization/tooltip-card.tsx`

---

### Story 3.7: Click to Modal

**As a** visitor,
**I want** to click a dot to see full obituary details,
**So that** I can explore without leaving the timeline context.

**Acceptance Criteria:**

**Given** user clicks a timeline dot
**When** click is registered
**Then** obituary modal slides in from right

**And** modal contains:
- Full claim text (Instrument Serif, italic, large)
- Source with external link
- Date
- Category tags
- Contextual snapshot (from Story 2.4)
- "View full page" button
- "Copy link" button
- Close button (X)

**And** modal behavior:
- Slides in from right edge (300ms ease-out)
- Width: ~500px on desktop, full width on mobile
- Backdrop: dark overlay with blur
- Dismissible via: X button, Escape key, click outside

**And** focus management:
- Focus moves to modal on open
- Focus trapped within modal
- Focus returns to clicked dot on close

**And** timeline remains visible (dimmed) behind modal

**Prerequisites:** Story 3.6, Story 2.4

**Technical Notes:**
- Use shadcn/ui Sheet component (side="right")
- Pass selected obituary ID to modal
- Fetch full data if not already loaded
- Use `react-focus-lock` or built-in Sheet focus management

**Files Created:**
- `src/components/obituary/obituary-modal.tsx`

---

### Story 3.8: Animation Polish

**As a** visitor,
**I want** all timeline interactions to feel smooth and responsive,
**So that** the experience feels polished and professional.

**Acceptance Criteria:**

**Given** any timeline interaction
**When** animation occurs
**Then** it runs at 60fps without jank

**And** specific animation timings:
- Hover state: 150ms ease-out
- Tooltip appear: 150ms ease-out (after 300ms delay)
- Modal open: 300ms ease-out
- Modal close: 200ms ease-in
- Zoom: spring physics (stiffness: 300, damping: 30)
- Pan momentum: spring physics (stiffness: 100, damping: 20)
- Dot enter (initial load): staggered fade-in (50ms per dot, max 500ms total)

**And** performance requirements:
- Render 200+ dots without frame drops
- Hover response < 50ms
- Click response < 100ms

**Given** prefers-reduced-motion is enabled
**When** page loads
**Then** disable: zoom animations, pan momentum, hover scale, dot glow pulse
**And** keep: instant state changes, basic transitions

**Prerequisites:** Story 3.7

**Technical Notes:**
- Use Motion `motion` components for all animations
- Use `useReducedMotion` hook from Motion
- Profile with Chrome DevTools Performance tab
- Consider virtualization if > 500 dots (react-window)
- Use `will-change: transform` sparingly
- Batch DOM updates with `requestAnimationFrame`

**Files Modified:**
- All visualization components

**Files Created:**
- `src/lib/utils/animation.ts` (shared presets)

---

### Epic 3 Summary

| Story | Title | FRs | Prerequisites |
|-------|-------|-----|---------------|
| 3.1 | Scatter Plot Foundation | FR7 | Epic 1, 2.1 |
| 3.2 | Timeline Data Points | FR7 | 3.1 |
| 3.3 | Horizontal Scroll/Pan | FR8 | 3.2 |
| 3.4 | Zoom Functionality | FR9 | 3.3 |
| 3.5 | Density Visualization | FR10 | 3.4 |
| 3.6 | Hover Tooltips | FR11 | 3.2 |
| 3.7 | Click to Modal | FR12 | 3.6, 2.4 |
| 3.8 | Animation Polish | FR46, FR47 | 3.7 |

**Epic 3 Completion Criteria:**
- [ ] Scatter plot renders with all obituaries as dots
- [ ] Dots colored by category
- [ ] Horizontal scroll/pan works smoothly
- [ ] Zoom in/out with scroll wheel/pinch
- [ ] Dense clusters show glow effect
- [ ] Hover shows tooltip with claim preview
- [ ] Click opens modal with full details
- [ ] All animations at 60fps
- [ ] Works with 200+ data points

---

## Epic 4: Category System & Filtering

**Goal:** Users can explore by category and share filtered views

**FRs Covered:** FR14, FR15, FR16, FR17, FR18

**Context from UX Design:**
- Four categories with distinct colors
- Filter bar: floating pills, bottom center, backdrop blur
- Filter effect: non-matching dots fade to 20% opacity
- Multi-select enabled
- 200ms transition for filter changes

**Context from Architecture:**
- nuqs for URL state management
- useFilters hook for filter state
- URL format: `?cat=market,agi`

---

### Story 4.1: Category Data Model

**As a** developer,
**I want** categories consistently defined across the app,
**So that** colors and labels are uniform everywhere.

**Acceptance Criteria:**

**Given** the application
**When** categories are referenced
**Then** four categories exist with consistent properties:

| ID | Label | Color | Description |
|----|-------|-------|-------------|
| `capability` | Capability Doubt | #C9A962 | Claims AI can't do X |
| `market` | Market/Bubble | #7B9E89 | AI is overhyped/bubble |
| `agi` | AGI Skepticism | #9E7B7B | AGI is impossible/far |
| `dismissive` | Dismissive Framing | #7B7B9E | Casual dismissal |

**And** a utility file exports:
- `CATEGORIES` constant with all category definitions
- `getCategoryColor(id)` function
- `getCategoryLabel(id)` function
- TypeScript `Category` type

**Prerequisites:** None (can be done early)

**Technical Notes:**
- Create `src/lib/constants/categories.ts`
- Export as const for type inference
- Use in filter components, timeline dots, badges

**Files Created:**
- `src/lib/constants/categories.ts`

---

### Story 4.2: Category Filter Bar

**As a** visitor,
**I want** to filter obituaries by category,
**So that** I can focus on specific types of skepticism.

**Acceptance Criteria:**

**Given** the homepage with timeline
**When** filter bar is visible
**Then** it displays:
- "All" button (selected by default)
- One pill button per category (dot + label)
- Positioned: bottom center, floating above content
- Style: backdrop blur, rounded pill shape, subtle border

**And** filter button design:
- Inactive: `--bg-secondary` background, `--text-secondary` text
- Active: category color background, `--text-primary` text
- Category dot: 8px circle in category color
- Touch target: 44px minimum height

**And** interaction:
- Click "All" → show all categories
- Click category → toggle that category filter
- Multiple categories can be active (multi-select)
- If all categories deselected → same as "All"

**And** filter bar is sticky on scroll (always visible)
**And** mobile: horizontal scroll if pills overflow

**Prerequisites:** Story 4.1, Story 3.1

**Technical Notes:**
- Create `src/components/filters/category-filter.tsx`
- Use shadcn/ui ToggleGroup or custom buttons
- Backdrop blur: `backdrop-filter: blur(8px)`
- Position: fixed or sticky at bottom

**Files Created:**
- `src/components/filters/category-filter.tsx`

---

### Story 4.3: URL State with nuqs

**As a** visitor,
**I want** filter state saved in the URL,
**So that** I can share filtered views and bookmark them.

**Acceptance Criteria:**

**Given** user applies category filters
**When** filters change
**Then** URL updates to reflect state:
- Single category: `?cat=market`
- Multiple categories: `?cat=market,agi`
- All categories (or none): no `cat` param

**Given** user visits URL with filter params
**When** page loads
**Then** filters are pre-applied from URL

**Given** user shares URL `?cat=market`
**When** recipient opens link
**Then** they see market category pre-filtered

**And** URL updates are:
- Shallow (no page reload)
- Replace state (no history spam)
- Debounced if rapid changes (100ms)

**Prerequisites:** Story 4.2

**Technical Notes:**
- Use nuqs `useQueryState` with `parseAsArrayOf`
- Create `src/lib/hooks/use-filters.ts`
- Configure nuqs in app layout (NuqsAdapter)
- Server Component reads `searchParams` for SSR

**Files Created:**
- `src/lib/hooks/use-filters.ts`

**Files Modified:**
- `src/app/layout.tsx` (add NuqsAdapter)

---

### Story 4.4: Filter Effect on Timeline

**As a** visitor,
**I want** the timeline to update when I filter,
**So that** I can see the pattern for specific categories.

**Acceptance Criteria:**

**Given** category filters are applied
**When** timeline re-renders
**Then** non-matching dots:
- Fade to 20% opacity
- Lose glow effect
- Become non-interactive (no hover, no click)
- Remain in position (spatial context preserved)

**And** matching dots:
- Full opacity (80%)
- Full glow effect
- Fully interactive

**And** transition:
- 200ms ease-in-out
- Smooth opacity change, no flicker

**Given** filter is removed
**When** "All" is selected
**Then** all dots return to full state with same transition

**Prerequisites:** Story 4.3, Story 3.2

**Technical Notes:**
- Pass filter state to ScatterPlot component
- Each ScatterPoint checks if its categories match filter
- Use CSS transition for opacity
- Pointer-events: none for filtered dots

**Files Modified:**
- `src/components/visualization/scatter-plot.tsx`
- `src/components/visualization/scatter-point.tsx`

---

### Story 4.5: Category Breakdown Chart

**As a** visitor,
**I want** to see the distribution of obituaries by category,
**So that** I understand what types of skepticism are most common.

**Acceptance Criteria:**

**Given** the homepage
**When** category chart is visible
**Then** it displays:
- Horizontal bar chart or donut chart
- Each category with its color
- Count and percentage for each
- Sorted by count (highest first)

**And** chart design:
- Compact (fits in sidebar or below filters)
- Labels clearly visible
- Uses category colors consistently
- Subtle animation on load (bars grow)

**And** chart is interactive:
- Hover on segment shows tooltip with exact count
- Click on segment toggles that category filter

**Given** filters are active
**When** chart displays
**Then** chart shows filtered counts (or total with filtered highlighted)

**Prerequisites:** Story 4.1, Story 2.1

**Technical Notes:**
- Use Visx (@visx/shape Pie or Bar) or simple CSS bars
- Fetch category counts from Sanity or compute client-side
- Keep chart simple - not the hero feature

**Files Created:**
- `src/components/visualization/category-chart.tsx`

---

### Epic 4 Summary

| Story | Title | FRs | Prerequisites |
|-------|-------|-----|---------------|
| 4.1 | Category Data Model | FR14 | None |
| 4.2 | Category Filter Bar | FR15 | 4.1, 3.1 |
| 4.3 | URL State with nuqs | FR18 | 4.2 |
| 4.4 | Filter Effect on Timeline | FR17 | 4.3, 3.2 |
| 4.5 | Category Breakdown Chart | FR16 | 4.1, 2.1 |

**Epic 4 Completion Criteria:**
- [ ] Four categories consistently styled
- [ ] Filter bar visible and interactive
- [ ] URL updates when filters change
- [ ] Shared URLs preserve filter state
- [ ] Non-matching dots fade correctly
- [ ] Category chart shows distribution

---

## Epic 5: Navigation & Responsive Experience

**Goal:** Works on all devices with complete navigation

**FRs Covered:** FR13, FR20, FR21, FR22, FR26, FR34, FR35, FR36, FR37

**Context from UX Design:**
- Modal: slide from right, 500px width, backdrop blur
- Mobile: density bar + vertical card list hybrid
- Touch targets: 44px minimum
- Position preservation via sessionStorage

**Context from Architecture:**
- State stored in sessionStorage for scroll position
- Responsive via Tailwind breakpoints

---

### Story 5.1: Modal to Full Page Transition

**As a** visitor,
**I want** to navigate from the modal to a full obituary page,
**So that** I can see more details and get a shareable URL.

**Acceptance Criteria:**

**Given** obituary modal is open
**When** user clicks "View full page" button
**Then** browser navigates to `/obituary/[slug]`

**And** transition:
- Modal fades out (200ms)
- Page transition occurs (Next.js default or custom)
- New page fades in

**And** "View full page" button:
- Positioned at bottom of modal
- Style: primary button (gold)
- Icon: arrow-right or external link

**Prerequisites:** Story 3.7, Story 2.3

**Technical Notes:**
- Use Next.js `Link` component in modal
- Modal closes automatically on navigation
- Consider View Transitions API (if browser support desired)

**Files Modified:**
- `src/components/obituary/obituary-modal.tsx`

---

### Story 5.2: Previous/Next Navigation

**As a** visitor,
**I want** to navigate between obituaries without returning to timeline,
**So that** I can browse sequentially.

**Acceptance Criteria:**

**Given** user is on an obituary detail page
**When** page renders
**Then** prev/next navigation is visible:
- "← Previous" link (or just arrow)
- "Next →" link (or just arrow)
- Shows obituary title/source as label

**And** navigation logic:
- Order: chronological by date
- "Previous" = older obituary
- "Next" = newer obituary
- If at first/last, that direction is disabled/hidden

**And** keyboard support:
- Left arrow = previous
- Right arrow = next

**And** positioned:
- Bottom of page, before footer
- Or floating in corners

**Prerequisites:** Story 2.3

**Technical Notes:**
- Fetch prev/next in `getObituaryBySlug` query
- GROQ: `*[_type == "obituary" && date < ^.date] | order(date desc) [0]`
- Add keyboard listener in page component
- Use `next/link` for prefetching

**Files Created:**
- `src/components/obituary/obituary-nav.tsx`

**Files Modified:**
- `src/lib/sanity/queries.ts` (add prev/next to query)
- `src/app/obituary/[slug]/page.tsx`

---

### Story 5.3: Position Preservation

**As a** visitor,
**I want** to return to my position on the timeline after viewing an obituary,
**So that** I don't lose my place.

**Acceptance Criteria:**

**Given** user clicks a dot and opens modal
**When** modal closes (X, escape, click outside)
**Then** timeline remains at same scroll/zoom position

**Given** user navigates to full obituary page
**When** user clicks "Back to timeline" or browser back
**Then** timeline restores to previous scroll/zoom position

**And** position data stored:
- Scroll X position
- Zoom level
- Active filters (already in URL)

**And** storage: sessionStorage (persists during session, clears on tab close)

**Given** user opens site fresh (no stored position)
**When** timeline loads
**Then** default position: showing most recent obituaries, 1x zoom

**Prerequisites:** Story 3.4, Story 5.1

**Technical Notes:**
- Create `src/lib/hooks/use-timeline-position.ts`
- Save position on scroll/zoom change (debounced)
- Restore position on mount if exists
- Key: `timeline-position`

**Files Created:**
- `src/lib/hooks/use-timeline-position.ts`

**Files Modified:**
- `src/components/visualization/scatter-plot.tsx`

---

### Story 5.4: Breadcrumb Navigation

**As a** visitor,
**I want** breadcrumbs on detail pages,
**So that** I understand where I am and can navigate back.

**Acceptance Criteria:**

**Given** user is on an obituary detail page
**When** page renders
**Then** breadcrumb shows:
- Home → [source name]
- Or: AI Obituaries → Obituary

**And** breadcrumb styling:
- Small text (`--text-sm`)
- Muted color (`--text-secondary`)
- Links underlined on hover
- Separator: "›" or "/"

**And** breadcrumb is positioned:
- Top of content area, below header
- Left-aligned

**Given** user clicks "Home" in breadcrumb
**When** navigation completes
**Then** user is on homepage with position preserved

**Prerequisites:** Story 2.3

**Technical Notes:**
- Create `src/components/ui/breadcrumb.tsx`
- Or use shadcn/ui Breadcrumb component
- Dynamic based on current route

**Files Created:**
- `src/components/ui/breadcrumb.tsx`

**Files Modified:**
- `src/app/obituary/[slug]/page.tsx`

---

### Story 5.5: Mobile Hybrid View

**As a** mobile user,
**I want** a usable experience on small screens,
**So that** I can explore obituaries on my phone.

**Acceptance Criteria:**

**Given** viewport width < 768px
**When** homepage loads
**Then** mobile layout displays:

**Density Bar (top):**
- Horizontal bar showing obituary density over time
- Height: ~60px
- Years labeled below
- Tappable regions to filter by time period

**Vertical Card List (below):**
- Scrollable list of obituary cards
- Cards show: claim preview, source, date, category dot
- Tap card → opens bottom sheet modal

**Count Display:**
- Moves to header area
- Smaller size (still prominent)

**Filter Pills:**
- Horizontally scrollable row
- Sticky below header

**Given** user taps a region on density bar
**When** tap is registered
**Then** list filters to that time period

**Given** user taps a card
**When** bottom sheet opens
**Then** full obituary details shown (similar to desktop modal)

**Prerequisites:** Story 2.2, Story 3.7

**Technical Notes:**
- Use Tailwind responsive classes (`md:hidden`, `hidden md:block`)
- Density bar: simplified visualization (CSS or SVG)
- Bottom sheet: shadcn/ui Sheet with `side="bottom"`
- Test on actual devices (iOS Safari, Android Chrome)

**Files Created:**
- `src/components/visualization/density-bar.tsx`
- `src/components/mobile/mobile-timeline.tsx`

**Files Modified:**
- `src/app/page.tsx` (responsive layout)

---

### Story 5.6: Tablet & Desktop Polish

**As a** tablet/desktop user,
**I want** the optimal experience for my screen size,
**So that** I can fully explore the timeline.

**Acceptance Criteria:**

**Tablet (768px - 1023px):**
- Horizontal timeline maintained
- Touch swipe for panning (no mouse hover)
- Tap for tooltip (instead of hover)
- Filter bar at bottom
- Count in header

**Desktop (1024px+):**
- Full "Scroll" experience
- Hover tooltips enabled
- Count prominent top-right
- Filter bar floating bottom-center
- Maximum timeline width: 1400px centered

**And** responsive breakpoints follow Tailwind defaults:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**And** touch vs mouse detection:
- Use `@media (hover: hover)` for hover-dependent features
- Touch devices: tap-to-reveal tooltips

**Prerequisites:** Story 5.5, Story 3.8

**Technical Notes:**
- Test with DevTools device emulation
- Use `@media (hover: hover) and (pointer: fine)` for hover features
- Consider `touch-action` CSS for gesture handling

**Files Modified:**
- Various components (responsive classes)
- `src/components/visualization/scatter-plot.tsx` (touch handling)

---

### Epic 5 Summary

| Story | Title | FRs | Prerequisites |
|-------|-------|-----|---------------|
| 5.1 | Modal to Full Page Transition | FR20 | 3.7, 2.3 |
| 5.2 | Previous/Next Navigation | FR21 | 2.3 |
| 5.3 | Position Preservation | FR22 | 3.4, 5.1 |
| 5.4 | Breadcrumb Navigation | FR26 | 2.3 |
| 5.5 | Mobile Hybrid View | FR13, FR34 | 2.2, 3.7 |
| 5.6 | Tablet & Desktop Polish | FR35, FR36, FR37 | 5.5, 3.8 |

**Epic 5 Completion Criteria:**
- [ ] "View full page" navigates from modal to detail page
- [ ] Prev/next works on detail pages
- [ ] Timeline position restored after navigation
- [ ] Breadcrumbs visible on detail pages
- [ ] Mobile shows density bar + card list
- [ ] Tablet/desktop fully responsive

---

## Epic 6: Accessibility & Quality

**Goal:** Works for everyone, performs well

**FRs Covered:** FR38, FR39, FR40, FR41, FR42, FR43, FR44, FR45

**Context from UX Design:**
- Focus ring: gold (#C9A962), 2px offset
- ARIA: timeline role="list", dots role="listitem"
- prefers-reduced-motion support
- Table view toggle

**Context from Architecture:**
- Test with Lighthouse, axe DevTools
- Screen reader testing: VoiceOver, NVDA

---

### Story 6.1: Keyboard Navigation Foundation

**As a** keyboard user,
**I want** to navigate all interactive elements with keyboard,
**So that** I can use the site without a mouse.

**Acceptance Criteria:**

**Given** user navigates with Tab key
**When** pressing Tab repeatedly
**Then** focus moves through all interactive elements in logical order:
1. Skip link (if present)
2. Header navigation links
3. Filter buttons
4. Timeline (as a single focusable region initially)
5. Footer links

**And** focus indicators:
- Visible ring on all focused elements
- Style: 2px solid `--accent-primary` (#C9A962), 2px offset
- Never remove outline (override browser defaults)

**And** all interactive elements are focusable:
- Buttons
- Links
- Filter pills
- Modal close button
- Form inputs (if any)

**And** Escape key closes any open modal/sheet

**Prerequisites:** Story 1.4

**Technical Notes:**
- Add `focus-visible` styles globally
- Use `:focus-visible` for keyboard-only focus
- Test with keyboard-only navigation
- Add skip link to main content

**Files Modified:**
- `src/app/globals.css` (focus styles)
- `src/app/layout.tsx` (skip link)

---

### Story 6.2: Timeline Keyboard Access

**As a** keyboard user,
**I want** to navigate timeline dots with keyboard,
**So that** I can explore obituaries without a mouse.

**Acceptance Criteria:**

**Given** timeline has focus
**When** user presses Tab
**Then** focus enters timeline, first dot is focused

**And** within timeline:
- Arrow Left/Right: move to adjacent dot (by date order)
- Arrow Up/Down: optional, move to nearby dot in Y
- Enter/Space: open modal for focused dot
- Escape: exit timeline focus, return to normal tab order

**And** focused dot:
- Shows hover-like state (scale, glow)
- Tooltip appears after brief delay

**And** screen reader announcement:
- Announces dot info: "Obituary: [claim preview], by [source], [date]"

**Given** dot is focused and Enter pressed
**When** modal opens
**Then** focus moves to modal

**Prerequisites:** Story 3.2, Story 6.1

**Technical Notes:**
- Make timeline container `tabindex="0"` with role="application" or role="list"
- Each dot as `tabindex="-1"` (programmatically focusable)
- Manage focus with `roving tabindex` pattern
- Use `aria-activedescendant` for current selection

**Files Modified:**
- `src/components/visualization/scatter-plot.tsx`
- `src/components/visualization/scatter-point.tsx`

---

### Story 6.3: Screen Reader Support

**As a** screen reader user,
**I want** to understand the timeline content,
**So that** I can access all information.

**Acceptance Criteria:**

**Given** screen reader is active
**When** timeline is encountered
**Then** it announces:
- "AI Obituaries timeline, [count] items"
- Or: "Interactive timeline visualization with [count] obituaries"

**And** each dot has `aria-label`:
- Format: "Obituary: [claim, truncated], Source: [source], Date: [date], Category: [category]"

**And** filter changes are announced:
- Live region: "Showing [count] obituaries in [category] category"
- Or: "Showing all [count] obituaries"

**And** modal/sheet:
- `aria-modal="true"`
- `role="dialog"`
- `aria-labelledby` pointing to modal title
- Close button has `aria-label="Close"`

**And** count display:
- `aria-live="polite"` to announce count changes
- Or static with clear label: "[count] AI obituaries documented"

**Prerequisites:** Story 6.2

**Technical Notes:**
- Use `aria-live="polite"` for filter announcements
- Test with VoiceOver (Mac) and NVDA (Windows)
- Ensure logical reading order

**Files Modified:**
- All interactive components (add ARIA attributes)

**Files Created:**
- `src/components/ui/visually-hidden.tsx` (for screen reader only text)

---

### Story 6.4: Alternative Table View

**As a** user who cannot use the visual timeline,
**I want** a table view of all obituaries,
**So that** I can access the data in a structured format.

**Acceptance Criteria:**

**Given** user is on homepage
**When** "View as table" toggle is clicked
**Then** timeline is replaced with data table:

| Date | Claim | Source | Category |
|------|-------|--------|----------|
| Mar 14, 2023 | "AI is just..." | Gary Marcus | AGI Skepticism |
| ... | ... | ... | ... |

**And** table features:
- Sortable columns (click header to sort)
- Default sort: date descending
- Category shown as colored badge
- Claim truncated with "..." (full on hover/focus)
- Row click → opens modal or navigates to detail page

**And** table accessibility:
- Proper `<table>`, `<thead>`, `<tbody>` structure
- `scope="col"` on headers
- Row selection announced

**And** toggle button:
- Position: near filter bar or header
- Icon: grid/list toggle
- Label: "View as table" / "View as timeline"
- State persisted (localStorage or URL param)

**Given** filters are active
**When** table view is shown
**Then** table respects current filters

**Prerequisites:** Story 4.4, Story 2.2

**Technical Notes:**
- Use shadcn/ui Table or Tanstack Table for sorting
- Store view preference in localStorage
- Ensure table is responsive (horizontal scroll on mobile)

**Files Created:**
- `src/components/obituary/obituary-table.tsx`
- `src/components/ui/view-toggle.tsx`

---

### Story 6.5: Color Contrast & Visual Accessibility

**As a** user with visual impairments,
**I want** sufficient color contrast,
**So that** I can read all text and see UI elements.

**Acceptance Criteria:**

**Given** the Deep Archive theme
**When** contrast is measured
**Then** all text meets WCAG AA standards:

| Element | Foreground | Background | Ratio | Pass |
|---------|------------|------------|-------|------|
| Body text | #E8E6E3 | #0C0C0F | 14.5:1 | ✓ |
| Secondary text | #A8A5A0 | #0C0C0F | 7.2:1 | ✓ |
| Muted text | #6B6860 | #0C0C0F | 4.6:1 | ✓ |
| Gold accent | #C9A962 | #0C0C0F | 7.8:1 | ✓ |
| Card text | #E8E6E3 | #18181F | 12.8:1 | ✓ |

**And** category colors are distinguishable:
- Not relying solely on color (labels present)
- Pass colorblind simulation tests (deuteranopia, protanopia)

**And** focus indicators:
- Clearly visible (not just color change)
- 3:1 contrast against adjacent colors

**And** images/icons:
- Alt text describes content
- Decorative images have `alt=""`

**Prerequisites:** Story 1.2

**Technical Notes:**
- Test with browser extensions (Stark, axe)
- Test with Windows High Contrast mode
- Ensure borders/outlines visible in all modes

**Files Modified:**
- `src/app/globals.css` (if adjustments needed)

---

### Story 6.6: Reduced Motion Support

**As a** user sensitive to motion,
**I want** animations disabled when I prefer reduced motion,
**So that** I can use the site comfortably.

**Acceptance Criteria:**

**Given** user has `prefers-reduced-motion: reduce` set
**When** page loads
**Then** the following are disabled:
- Count pulsing glow animation
- Dot hover scale animation
- Timeline pan momentum
- Zoom spring animations
- Modal slide animation (instant show/hide instead)
- Staggered dot entrance animation

**And** the following are kept (essential feedback):
- Instant state changes (opacity, color)
- Basic transitions (< 100ms, no spring)
- Focus indicator changes

**And** implementation:
- Check `window.matchMedia('(prefers-reduced-motion: reduce)')`
- Or use Motion's `useReducedMotion` hook

**Prerequisites:** Story 3.8

**Technical Notes:**
- Use CSS `@media (prefers-reduced-motion: reduce)` for CSS animations
- Use Motion's `useReducedMotion` for JS animations
- Create animation variants for reduced motion mode

**Files Modified:**
- `src/lib/utils/animation.ts`
- All animated components

---

### Story 6.7: WCAG Compliance Audit

**As a** site owner,
**I want** full WCAG 2.1 AA compliance verified,
**So that** the site is legally accessible and inclusive.

**Acceptance Criteria:**

**Given** the complete site
**When** accessibility audit is performed
**Then** no WCAG 2.1 AA violations exist

**Audit checklist (Perceivable):**
- [ ] All non-text content has text alternatives (1.1.1)
- [ ] Color not sole means of conveying info (1.4.1)
- [ ] Contrast ratio ≥ 4.5:1 for text (1.4.3)
- [ ] Text resizable to 200% without loss (1.4.4)

**Audit checklist (Operable):**
- [ ] All functionality keyboard accessible (2.1.1)
- [ ] No keyboard traps (2.1.2)
- [ ] Skip navigation available (2.4.1)
- [ ] Page titles descriptive (2.4.2)
- [ ] Focus order logical (2.4.3)
- [ ] Focus visible (2.4.7)

**Audit checklist (Understandable):**
- [ ] Language declared (3.1.1)
- [ ] Consistent navigation (3.2.3)
- [ ] Error identification (3.3.1)

**Audit checklist (Robust):**
- [ ] Valid HTML (4.1.1)
- [ ] Name, role, value for UI components (4.1.2)

**Prerequisites:** All previous stories

**Technical Notes:**
- Run Lighthouse accessibility audit
- Run axe DevTools audit
- Manual keyboard testing
- Screen reader testing (VoiceOver, NVDA)
- Document any exceptions with rationale

**Deliverables:**
- Accessibility audit report
- List of any known issues with remediation plan

---

### Story 6.8: Performance Optimization

**As a** visitor,
**I want** fast page loads and smooth interactions,
**So that** the experience is responsive and enjoyable.

**Acceptance Criteria:**

**Given** site is deployed to Vercel
**When** Core Web Vitals are measured
**Then** scores meet targets:

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | Lighthouse score |
| FID/INP | < 100ms / < 200ms | Lighthouse score |
| CLS | < 0.1 | Lighthouse score |

**And** timeline performance:
- 200+ dots render without frame drops
- Hover response < 50ms
- Filter update < 100ms
- Zoom/pan at 60fps

**And** bundle optimization:
- Visx packages tree-shaken (import specific modules)
- Code splitting for visualization (dynamic import)
- Images optimized (Next.js Image)
- Fonts preloaded

**And** caching:
- Static pages cached at CDN edge
- Sanity data cached with ISR
- Assets have cache headers

**Given** performance degrades with scale
**When** 500+ obituaries exist
**Then** virtualization is implemented (if needed)

**Prerequisites:** All previous stories

**Technical Notes:**
- Profile with Chrome DevTools Performance tab
- Use `next/bundle-analyzer` to check bundle size
- Dynamic import: `const ScatterPlot = dynamic(() => import(...))`
- Consider react-window for virtualization if needed
- Run Lighthouse in incognito mode for accurate scores

**Deliverables:**
- Lighthouse report (target: 90+ performance score)
- Bundle analysis report
- Performance optimizations documented

---

### Epic 6 Summary

| Story | Title | FRs | Prerequisites |
|-------|-------|-----|---------------|
| 6.1 | Keyboard Navigation Foundation | FR39 | 1.4 |
| 6.2 | Timeline Keyboard Access | FR40 | 3.2, 6.1 |
| 6.3 | Screen Reader Support | FR41 | 6.2 |
| 6.4 | Alternative Table View | FR42 | 4.4, 2.2 |
| 6.5 | Color Contrast & Visual Accessibility | FR44, FR43 | 1.2 |
| 6.6 | Reduced Motion Support | FR38 | 3.8 |
| 6.7 | WCAG Compliance Audit | FR38 | All |
| 6.8 | Performance Optimization | FR45 | All |

**Epic 6 Completion Criteria:**
- [ ] All elements keyboard accessible
- [ ] Timeline navigable with keyboard
- [ ] Screen reader announces all content
- [ ] Table view toggle works
- [ ] Color contrast passes WCAG AA
- [ ] Reduced motion respected
- [ ] Lighthouse accessibility score 90+
- [ ] Core Web Vitals pass

---

## FR Coverage Matrix

**All 47 FRs mapped to Stories:**

| FR | Description | Epic | Story |
|----|-------------|------|-------|
| FR1 | Display total obituary count prominently | 2 | 2.1 |
| FR2 | Display list of all obituaries | 2 | 2.2 |
| FR3 | View individual obituary details | 2 | 2.3 |
| FR4 | Display contextual data (AI capabilities, stocks, benchmarks) | 2 | 2.4 |
| FR5 | Load obituary data from external source | 1 | 1.3 |
| FR6 | Update data when source changes (ISR) | 1 | 1.5 |
| FR7 | Display obituaries on interactive timeline | 3 | 3.1, 3.2 |
| FR8 | Scroll/pan timeline horizontally | 3 | 3.3 |
| FR9 | Zoom in/out on timeline | 3 | 3.4 |
| FR10 | Display density visualization (clusters) | 3 | 3.5 |
| FR11 | Hover on data points for preview tooltips | 3 | 3.6 |
| FR12 | Click data points to open obituary modal | 3 | 3.7 |
| FR13 | Timeline degrades to list view on mobile | 5 | 5.5 |
| FR14 | Categorize obituaries into four types | 4 | 4.1 |
| FR15 | Filter obituaries by category | 4 | 4.2 |
| FR16 | Display category breakdown visualization | 4 | 4.5 |
| FR17 | Filtered view updates in real-time | 4 | 4.4 |
| FR18 | Persist filter state in URL | 4 | 4.3 |
| FR19 | Dedicated page with semantic URL per obituary | 2 | 2.3 |
| FR20 | Navigate from modal to full obituary page | 5 | 5.1 |
| FR21 | Navigate between obituaries (prev/next) | 5 | 5.2 |
| FR22 | Return to timeline with position preserved | 5 | 5.3 |
| FR23 | Obituary pages include contextual snapshot | 2 | 2.4 |
| FR24 | Clear primary navigation | 1 | 1.4 |
| FR25 | Navigate to homepage from any page | 1 | 1.4 |
| FR26 | Breadcrumb navigation on detail pages | 5 | 5.4 |
| FR27 | Unique meta title/description per obituary | 2 | 2.5 |
| FR28 | Open Graph and Twitter Card meta tags | 2 | 2.5 |
| FR29 | JSON-LD structured data | 2 | 2.6 |
| FR30 | Auto-generate sitemap | 2 | 2.7 |
| FR31 | All pages statically generated and crawlable | 1 | 1.1 |
| FR32 | Copy shareable link for any obituary | 2 | 2.8 |
| FR33 | Obituary pages display well when shared | 2 | 2.5, 2.8 |
| FR34 | Fully functional on mobile (320px+) | 5 | 5.5 |
| FR35 | Fully functional on tablet (768px+) | 5 | 5.6 |
| FR36 | Optimal experience on desktop (1024px+) | 5 | 5.6 |
| FR37 | Timeline adapts per breakpoint | 5 | 5.5, 5.6 |
| FR38 | WCAG 2.1 AA compliance | 6 | 6.6, 6.7 |
| FR39 | All interactive elements keyboard navigable | 6 | 6.1 |
| FR40 | Timeline fully keyboard accessible | 6 | 6.2 |
| FR41 | Screen readers can access timeline data | 6 | 6.3 |
| FR42 | Alternative table view of timeline data | 6 | 6.4 |
| FR43 | All images have appropriate alt text | 6 | 6.5 |
| FR44 | Color contrast meets 4.5:1 ratio | 6 | 6.5 |
| FR45 | Core Web Vitals performance | 6 | 6.8 |
| FR46 | Timeline renders smoothly (no jank) | 3 | 3.8 |
| FR47 | Animations run at 60fps | 3 | 3.8 |

**Coverage Validation:** ✅ All 47 FRs mapped to at least one story

---

## Summary

### Epic Breakdown Statistics

| Metric | Value |
|--------|-------|
| Total Epics | 6 |
| Total Stories | 35 |
| Total FRs | 47 |
| FR Coverage | 100% |

### Epic Overview

| Epic | Stories | FRs | Description |
|------|---------|-----|-------------|
| 1. Foundation | 5 | 5 | Project setup, design system, Sanity CMS, layout, ISR |
| 2. Core Content Display | 8 | 12 | Count, cards, pages, context, SEO, sharing |
| 3. Timeline Visualization | 8 | 8 | Scatter plot, pan/zoom, density, tooltips, modal |
| 4. Category System & Filtering | 5 | 5 | Categories, filters, URL state, chart |
| 5. Navigation & Responsive | 6 | 9 | Modal flow, nav, mobile/tablet/desktop |
| 6. Accessibility & Quality | 8 | 8 | Keyboard, screen reader, table view, performance |

### Implementation Path

```
Epic 1 (Foundation)
    └─► Epic 2 (Content) ─┬─► Epic 3 (Timeline) ─► Epic 4 (Filtering)
                          │                              │
                          └─────────────────────────────►├─► Epic 5 (Responsive)
                                                         │
                                                         └─► Epic 6 (A11y/Perf)
```

### Story Dependency Chain (Critical Path)

1. **1.1** Project Init → **1.2** Design System → **1.4** Layout Shell
2. **1.3** Sanity Integration → **2.1** Count Display → **2.2** List → **2.3** Pages
3. **3.1** Scatter Foundation → **3.2** Data Points → **3.3** Pan → **3.4** Zoom → **3.5** Density
4. **4.1** Categories → **4.2** Filter Bar → **4.3** URL State → **4.4** Filter Effect
5. **6.1** Keyboard Nav → **6.2** Timeline Keyboard → **6.3** Screen Reader

### Key Technical Decisions (from Architecture)

- **Framework:** Next.js 16 with App Router, Cache Components, ISR
- **Visualization:** Visx 3.12 (tree-shakeable, React-native)
- **Animation:** Motion 12.9 (60fps, spring physics)
- **State:** nuqs for URL-synced filters (shareable)
- **CMS:** Sanity with GROQ queries and webhook ISR
- **Styling:** Tailwind CSS v4 + shadcn/ui + Deep Archive theme

### Key UX Decisions (from UX Design)

- **Theme:** Deep Archive (dark #0C0C0F, gold #C9A962 accent)
- **Timeline:** Contextual scatter plot with category-colored dots
- **Mobile:** Density bar + vertical card list hybrid
- **Interactions:** 300ms hover delay, 200ms filter transitions, 60fps animations
- **Accessibility:** WCAG 2.1 AA, keyboard navigation, table view alternative

### Next Steps

1. Use `create-story` workflow to generate individual story implementation plans
2. Begin with Epic 1, Story 1.1 (Project Initialization)
3. Each story can be completed in a single dev agent session
4. Run `sprint-planning` workflow to track implementation status

---

_Generated by BMAD Create Epics and Stories Workflow_
_Date: 2025-11-29_
_For: Luca_

---

**Document incorporates full context from:**
- [PRD](./prd.md) - 47 Functional Requirements
- [UX Design Specification](./ux-design-specification.md) - Deep Archive theme, interactions
- [Architecture](./architecture.md) - Technical stack, patterns, ADRs

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document incorporates full context from PRD, UX Design Specification, and Architecture._
