# aiobituaries - Product Requirements Document

**Author:** Luca
**Date:** 2025-11-29
**Version:** 1.0

---

## Executive Summary

AI Obituaries is a data-driven web archive that catalogs every instance when critics, pundits, media outlets, or public figures have declared AI "dead," "overhyped," "a bubble," or otherwise dismissed its potential. Modeled after 99Bitcoins' Bitcoin Obituaries, it serves as a verifiable counter-narrative tool for the AI community - documenting the recurring cycles of doubt and skepticism that have accompanied every wave of AI progress.

The site transforms scattered skepticism into a searchable, timestamped ledger where every prediction can be checked against what AI could actually do at that moment. It's proof, not polemic.

### What Makes This Special

**Verifiable evidence over argument.** Unlike typical "I told you so" content, AI Obituaries provides checkable proof:
- Every obituary links to the original source
- Each entry is timestamped with contextual data (stock prices, model capabilities, benchmarks)
- Users can verify any claim themselves in seconds

The power isn't in mocking skeptics - it's in the undeniable pattern that emerges when you see 50, 100, 200+ predictions lined up against reality. The big number tells the story; the metadata makes it bulletproof.

---

## Project Classification

**Technical Type:** Web Application (Next.js SSG/ISR)
**Domain:** General (Community/Media Tool)
**Complexity:** Low

This is a content-driven visualization site with no complex domain regulations, no user accounts, and no transactional features. The technical challenge is in the presentation layer - making data explorable and compelling - not in backend complexity.

**Stack (from brief):**
- Next.js 16 (App Router, SSG/ISR)
- Tailwind CSS v4
- shadcn/ui components
- Data: JSON files or headless CMS
- Hosting: Vercel

---

## Reference Documents

| Document | Path | Status |
|----------|------|--------|
| Product Brief | `docs/product-brief-aiobituaries-2025-11-29.md` | Complete |
| Domain Research | N/A | Not required (general domain) |

---

## Success Criteria

### What Winning Looks Like

**Primary success indicators:**

1. **Debate utility** - People share AI Obituaries links when countering AI skepticism in discussions, comments, and social media
2. **Content citation** - The site gets referenced in articles, video essays, podcasts, and documentaries about AI progress
3. **Internal resource** - Serves as a ready reference for your own YouTube channel and AI safety content

**The pattern must be undeniable.** Success isn't one viral moment - it's becoming the canonical "look, they've always been wrong" resource that the AI community reaches for.

### Launch Threshold

| Metric | MVP Target | Growth Target |
|--------|------------|---------------|
| Obituary count | ~50 entries | 200+ |
| Category coverage | All 4 categories represented | Deep coverage in each |
| Date range | 2022-present (GenAI era) | Expand to earlier AI winters |

**50 is the credibility threshold** - enough to show a pattern, not just cherry-picked examples. Below 50 feels anecdotal; above 50 feels systematic.

### Dual Impact Goal

- **For the AI community:** A ready resource to point skeptics toward - "here's the evidence"
- **For skeptics themselves:** Potentially shifts views through sheer weight of documented wrongness

---

## Product Scope

### MVP - Minimum Viable Product

**Hero Feature: Interactive Timeline**
- Visual chronological display of obituaries (inspired by solar power buildout visualizations)
- Zoomable, scrollable, interactive
- Shows density clusters during hype cycles and controversy periods
- Click-through to individual obituary details

**Core Features:**

| Feature | Description |
|---------|-------------|
| **Data-driven architecture** | Pulls from external JSON/API - no hardcoded entries. Clean separation from data pipeline. |
| **Obituary count display** | The big number, prominently displayed - the headline metric |
| **Category system** | 4 categories: Capability doubt, Market/bubble claims, AGI skepticism, Dismissive framing |
| **Category filtering** | Browse and filter by category |
| **Rich visualizations** | Category breakdown charts, timeline density |
| **Individual obituary view** | Claim, source link, date, category tags, contextual snapshot (AI capabilities, stock prices, benchmarks at time of claim) |

**Explicitly Out of Scope for MVP:**
- User submission/crowdsourcing
- Data collection pipeline (separate concern)
- API for third parties
- Comments/social features
- User accounts

### Growth Features (Post-MVP)

| Feature | Value |
|---------|-------|
| **User submissions** | "Submit an obituary" with moderation queue |
| **Embeddable widgets** | Counter badge, mini-timeline for other sites to embed |
| **Automated data gathering** | Scraping/monitoring for new doom predictions |
| **Search** | Full-text search across claims and sources |
| **Share functionality** | Deep links to specific obituaries, social cards |

### Vision (Future)

**The ultimate AI skepticism archive:**

- **Notable Skeptics pages** - Dedicated profile pages for serial predictors like Yann LeCun, Gary Marcus, etc. showing their prediction track record over time
- **Prediction accuracy scoring** - Rate how wrong each prediction was in hindsight
- **"Aged like milk" highlights** - Curated collection of the most spectacularly wrong predictions
- **Historical expansion** - Earlier AI winters (1970s, 1980s, 1990s doom cycles)
- **Comparative analysis** - Side-by-side: what they said vs what happened next
- **API for researchers** - Structured access for academic/research use

---

## Web Application Requirements

### Architecture

| Aspect | Decision |
|--------|----------|
| **Rendering strategy** | MPA with SSG + ISR (Incremental Static Regeneration) |
| **Update model** | On-demand revalidation - instant updates when data changes |
| **Routing** | Next.js App Router with static page generation |
| **Data fetching** | Build-time for initial, ISR for updates, API routes for dynamic needs |

### Browser Support

**Modern browsers only:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

No IE11 or legacy browser support required.

### SEO Strategy

**Individual obituaries must be indexable:**
- Each obituary gets a unique, semantic URL (e.g., `/obituary/gary-marcus-ai-bubble-2023`)
- Full meta tags per page (title, description, Open Graph, Twitter cards)
- Structured data (JSON-LD) for rich snippets
- Sitemap generation for all obituary pages
- Static generation ensures crawlability

**Target searches:**
- "[Person] AI prediction"
- "AI bubble [year]"
- "AI overhyped [source]"

### Responsive Design

| Breakpoint | Target |
|------------|--------|
| Mobile | 320px+ (timeline may simplify) |
| Tablet | 768px+ |
| Desktop | 1024px+ (full timeline experience) |

Timeline visualization should degrade gracefully on mobile - possibly switch to list view with density indicators.

### Accessibility (WCAG AA)

**Full WCAG 2.1 AA compliance required:**

- **Perceivable:** Alt text for all images, sufficient color contrast (4.5:1 minimum), text resizing support
- **Operable:** Full keyboard navigation, no keyboard traps, skip links, focus indicators
- **Understandable:** Consistent navigation, error identification, labels on all inputs
- **Robust:** Valid HTML, ARIA landmarks, screen reader compatibility

**Timeline-specific accessibility:**
- Timeline must be navigable via keyboard
- Data points must be screen-reader accessible
- Alternative text/table view of timeline data available

---

## User Experience Principles

### Visual Direction

**Reference:** Epoch AI (epochai.org)

**Tone:** Serious, credible, data-forward - but with style and dynamism. Not dry or academic; not snarky or mocking. The data makes the point; the design makes it compelling.

**Key attributes:**
- **Data clarity** - Information hierarchy is crystal clear
- **Visual sophistication** - High-quality typography, considered spacing, intentional color
- **Dynamic feel** - Smooth transitions, purposeful animation, alive not static
- **Journalistic credibility** - Feels like a well-researched resource, not a novelty site

### Interaction Patterns

**Timeline interactions:**

| Action | Response |
|--------|----------|
| Hover on data point | Preview tooltip with claim snippet + date |
| Click data point | Smooth modal with full obituary details |
| "View full page" in modal | Animated transition to dedicated obituary page |
| Scroll timeline | Smooth pan with momentum |
| Zoom timeline | Pinch/scroll zoom with animated rescale |

**Animation principles:**
- Smooth, purposeful transitions (not bouncy or playful)
- ~200-300ms duration for UI transitions
- Easing: ease-out for reveals, ease-in-out for movements
- Motion should feel polished and intentional

### Key Interactions

**Homepage flow:**
1. Land → See big count number prominently
2. See timeline below/adjacent → Visual density tells the story
3. Explore timeline → Hover for previews, click for details
4. Filter by category → Timeline updates smoothly
5. Deep dive → Modal → Full page for sharing

**Individual obituary page:**
- Shareable URL
- Full context display (claim, source, date, AI context at time)
- Navigation to previous/next obituaries
- Return to timeline with position preserved

---

## Functional Requirements

### Data Display & Core Content

- **FR1:** System displays total obituary count prominently on homepage
- **FR2:** System displays list of all obituaries with claim preview, source, and date
- **FR3:** Users can view individual obituary details including full claim text, source with link, date, and category tags
- **FR4:** System displays contextual data for each obituary (AI capabilities, stock prices, benchmarks at time of claim)
- **FR5:** System loads obituary data from external JSON/API source (not hardcoded)
- **FR6:** System updates displayed data when source data changes (via ISR revalidation)

### Timeline Visualization

- **FR7:** System displays obituaries on an interactive chronological timeline
- **FR8:** Users can scroll/pan the timeline horizontally to navigate through time
- **FR9:** Users can zoom in/out on timeline to adjust time scale granularity
- **FR10:** Timeline displays density visualization showing clusters of obituaries
- **FR11:** Users can hover on timeline data points to see preview tooltips
- **FR12:** Users can click timeline data points to open obituary detail modal
- **FR13:** Timeline gracefully degrades to list view on mobile devices

### Category System & Filtering

- **FR14:** System categorizes obituaries into four types: Capability doubt, Market/bubble claims, AGI skepticism, Dismissive framing
- **FR15:** Users can filter obituaries by one or more categories
- **FR16:** System displays category breakdown visualization (chart showing distribution)
- **FR17:** Filtered view updates timeline and list displays in real-time
- **FR18:** System persists filter state in URL for shareability

### Individual Obituary Pages

- **FR19:** Each obituary has a dedicated page with unique, semantic URL
- **FR20:** Users can navigate from modal view to full obituary page
- **FR21:** Users can navigate between obituaries (previous/next)
- **FR22:** Users can return to timeline with scroll position preserved
- **FR23:** Obituary pages include full contextual snapshot display

### Navigation & Information Architecture

- **FR24:** Site has clear primary navigation (Home, Timeline, Categories, About)
- **FR25:** Users can navigate to homepage from any page
- **FR26:** System provides breadcrumb navigation on detail pages

### SEO & Discoverability

- **FR27:** Each obituary page has unique meta title and description
- **FR28:** System generates Open Graph and Twitter Card meta tags for social sharing
- **FR29:** System generates JSON-LD structured data for rich search snippets
- **FR30:** System automatically generates sitemap including all obituary pages
- **FR31:** All pages are statically generated and crawlable

### Sharing & Social

- **FR32:** Users can copy shareable link for any obituary
- **FR33:** Obituary pages display well when shared on social platforms (preview cards)

### Responsive Design

- **FR34:** Site is fully functional on mobile devices (320px+)
- **FR35:** Site is fully functional on tablet devices (768px+)
- **FR36:** Site provides optimal experience on desktop (1024px+)
- **FR37:** Timeline visualization adapts appropriately per breakpoint

### Accessibility

- **FR38:** Site meets WCAG 2.1 AA compliance standards
- **FR39:** All interactive elements are keyboard navigable
- **FR40:** Timeline is fully keyboard accessible
- **FR41:** Screen readers can access all timeline data
- **FR42:** System provides alternative table view of timeline data
- **FR43:** All images have appropriate alt text
- **FR44:** Color contrast meets 4.5:1 minimum ratio

### Performance

- **FR45:** Pages load within acceptable performance thresholds (Core Web Vitals)
- **FR46:** Timeline renders smoothly without jank during interaction
- **FR47:** Animations run at 60fps

---

### Post-MVP Functional Requirements (Growth)

- **FR-G1:** Users can submit new obituary suggestions via form
- **FR-G2:** System provides moderation queue for submitted obituaries
- **FR-G3:** Users can search obituaries by keyword
- **FR-G4:** System provides embeddable counter widget for external sites
- **FR-G5:** System provides embeddable mini-timeline widget
- **FR-G6:** Users can subscribe to notifications for new obituaries

---

## Non-Functional Requirements

### Performance

**Core Web Vitals targets:**

| Metric | Target | Rationale |
|--------|--------|-----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Primary content visible quickly |
| **FID** (First Input Delay) | < 100ms | Timeline responds immediately to interaction |
| **CLS** (Cumulative Layout Shift) | < 0.1 | No jarring shifts as content loads |
| **INP** (Interaction to Next Paint) | < 200ms | Smooth filtering and navigation |

**Timeline-specific performance:**

| Aspect | Requirement |
|--------|-------------|
| **Animation frame rate** | 60fps during scroll, zoom, pan |
| **Hover response** | Tooltip appears within 50ms |
| **Filter application** | UI updates within 100ms |
| **Modal open** | Transition completes within 300ms |
| **Data point rendering** | Handle 200+ obituaries without degradation |

**Static generation benefits:**
- Pages served from CDN edge (Vercel)
- No server-side computation at request time
- ISR handles updates without full rebuild

---

## Summary

| Metric | Count |
|--------|-------|
| **Functional Requirements (MVP)** | 47 |
| **Functional Requirements (Growth)** | 6 |
| **Non-Functional Requirements** | Performance-focused |

### What This PRD Captures

AI Obituaries is a data-driven counter-narrative tool that documents AI skepticism through verifiable, timestamped evidence. The core value proposition is **credibility through transparency** - every claim is checkable, every prediction contextualized against what AI could actually do at that moment.

**Key differentiators:**
- The big number (count) as the headline metric
- Rich contextual metadata (stock prices, capabilities, benchmarks)
- Epoch-inspired visual sophistication with smooth, dynamic interactions
- Full accessibility and SEO for maximum reach and credibility

### Product Value Summary

*AI Obituaries transforms scattered AI skepticism into a searchable, verifiable archive - proving through data, not argument, that critics have consistently underestimated AI progress.*

---

_This PRD captures the essence of AI Obituaries._

_Created through collaborative discovery between Luca and AI facilitator._

_Next: Architecture workflow for technical design, then epic breakdown for implementation._
