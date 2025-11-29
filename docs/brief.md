# Product Brief: AI Obituaries

**Date:** 2025-11-29
**Author:** Luca
**Context:** AI safety awareness tool / Community resource

---

## Executive Summary

AI Obituaries is a historical tracker and curated archive that catalogs every instance when critics, pundits, media outlets, or public figures have declared AI "dead," "overhyped," "a bubble," or otherwise dismissed its potential. Modeled after 99Bitcoins' Bitcoin Obituaries, it serves as both a sentiment-history ledger and a counter-narrative tool for the AI community - documenting the recurring cycles of doubt and skepticism that have accompanied every wave of AI progress.

---

## Core Vision

### Problem Statement

The current AI boom (2022-present) is accompanied by a constant stream of dismissals, doom predictions, and "bubble bursting" declarations from critics, media, and public figures. These claims range from capability skepticism ("ChatGPT is just autocomplete") to market doubt ("AI is a bubble") to existential skepticism ("AGI will never happen"). Yet there's no systematic way to track, archive, and contextualize these predictions against what AI actually achieves over time.

Unlike Bitcoin, which has a single clear metric (price), AI progress is multidimensional - model capabilities, benchmarks, funding, adoption, stock performance - making the gap between doom predictions and reality harder to document and demonstrate.

### Proposed Solution

AI Obituaries: a curated archive tracking every "AI is dead/overhyped/doomed" declaration from the modern GenAI era (2022+). Each obituary entry includes:

- **The claim**: headline, quote, or declaration
- **Source**: link to original, author/outlet, date
- **Context metadata**: relevant AI benchmarks at time of claim, funding environment, stock prices of major AI companies (NVDA, MSFT, GOOG, etc.), model capabilities (what GPT-n could do at that moment)
- **Category**: capability doubt, market/bubble claims, AGI skepticism, dismissive framing

The rich metadata allows users to see not just *that* someone declared AI dead, but *what AI could actually do* when they said it - making the contrast visceral and data-driven.

---

## Target Users

### Primary Users

**AI Safety & X-Risk Community**
- AI safety researchers and advocates who need to counter "AI is just hype" dismissiveness
- Content creators in the AI x-risk media space (documentaries, podcasts, writers)
- People engaging in debates where skeptics dismiss AI capabilities or timelines
- The team's own YouTube channel audience (AI safety documentaries) - a direct resource to share with skeptical viewers

### Use Cases

1. **Counter-skeptic resource**: "You say AI will never do X? Here are 47 times people said that about things AI now does routinely."
2. **Documentary/content material**: Visual timeline of predictions vs reality for video essays
3. **Credibility anchor**: Establishes pattern of consistent underestimation, lending weight to taking current AI seriously
4. **Community reference**: Shareable link for the broader AI safety media ecosystem

---

## MVP Scope

### Core Features

**1. Dynamic Data-Driven Website**
- Pulls from external data source (JSON/API) - no hardcoded entries
- Data gathered separately (manual curation, scraping, etc.)
- Clean separation: data pipeline is out of scope for MVP, website consumes whatever data exists

**2. Visual Timeline**
- Chronological view of obituaries over time
- Interactive - zoom, scroll, click for details
- Shows density of predictions (cluster during hype cycles, AI winters discourse, etc.)

**3. Category System**
- Capability doubt ("AI will never do X")
- Market/bubble claims ("AI is overhyped")
- AGI skepticism ("AGI is impossible/decades away")
- Dismissive framing ("just autocomplete")
- Filter and browse by category

**4. Rich Visualizations**
- Total obituary count (the headline number)
- Category breakdown (pie/bar chart)
- Timeline density visualization
- Contextual data display (what AI could do when claim was made)

**5. Individual Obituary View**
- The claim/headline
- Source with link
- Date
- Category tags
- Contextual snapshot: AI capabilities, stock prices, benchmarks at that moment

### Out of Scope for MVP

- User submission / crowdsourcing (data gathered externally)
- API for third parties
- Comments / social features
- "Obituary generator" novelty feature
- Data collection pipeline (separate concern)

---

## Technical Preferences

**Stack:**
- Next.js 16 (App Router, SSG/ISR for performance)
- Tailwind CSS v4 for styling
- shadcn/ui component library (latest)
- Data: JSON files or headless CMS, consumed at build time or via API route

**Data Schema (per obituary):**
```
{
  id: string,
  claim: string,           // The headline/quote
  source: string,          // Publication/author
  sourceUrl: string,       // Link to original
  date: string,            // ISO date
  category: string[],      // One or more categories
  context: {               // Claim-relevant context (flexible)
    stockPrices?: {},      // NVDA, MSFT, GOOG at time
    currentModel?: string, // "GPT-3.5" / "GPT-4" / etc.
    benchmark?: {},        // Relevant benchmark scores
    milestone?: string,    // Notable AI milestone around that date
    note?: string          // Any other relevant context
  }
}
```

**Hosting:** Vercel (natural fit for Next.js)

---

_This Product Brief captures the vision and requirements for AI Obituaries._

_It was created through collaborative discovery for the AI safety/x-risk media community._

_Next: Use the PRD workflow to create detailed product requirements from this brief._
