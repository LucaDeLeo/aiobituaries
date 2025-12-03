# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Obituaries is a curated archive tracking "AI is dead/overhyped/doomed" declarations. It visualizes these claims against real AI progress metrics (training compute, benchmarks, capability indices) using a scatter plot with background trend lines showing exponential AI growth.

Stack: Next.js 16 (App Router), React 19, Tailwind CSS v4, Sanity CMS, Visx, shadcn/ui, Vitest.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm test         # Run Vitest in watch mode
pnpm test:run     # Run tests once
pnpm test:coverage # Run tests with coverage
```

Run a single test file:
```bash
pnpm vitest tests/unit/lib/sanity/queries.test.ts
```

## Architecture

### Data Flow
```
Sanity CMS → GROQ queries (src/lib/sanity/) → Server Components → Client Components
                                                      ↓
                                              ISR via /api/revalidate webhook
```

### Key Directories
- `src/app/` - Next.js App Router pages
- `src/components/` - React components (ui/, layout/, obituary/, visualization/)
- `src/components/visualization/` - ScatterPlot, BackgroundChart, ZoomControls, etc.
- `src/data/` - Static data (ai-metrics.ts generated from Epoch AI)
- `src/lib/sanity/` - Sanity client and GROQ queries
- `src/lib/utils/` - Utility functions
- `src/types/` - TypeScript types (Obituary, ContextMetadata, Category)
- `tests/unit/` - Vitest unit tests mirroring src/ structure
- `epoch_data/` - Raw Epoch AI datasets (CSV) - not committed, download from epoch.ai
- `scripts/` - Data processing scripts (parse-epoch-data.mjs)

### Patterns
- **Server Components default** - Only use `'use client'` when interactivity needed
- **Data fetching** - Always in Server Components via `src/lib/sanity/queries.ts`
- **ISR tags** - Use `{ next: { tags: ['obituaries'] } }` for cache invalidation
- **URL state** - nuqs for shareable filter state (planned for visualization)
- **Path alias** - Use `@/` for imports from `src/`

### Category Types
```typescript
type Category = 'market' | 'capability' | 'agi' | 'dismissive'
```

### Test Structure
Tests mirror source structure: `tests/unit/components/obituary/` maps to `src/components/obituary/`. Setup file: `tests/setup.tsx`.

## AI Metrics Data

The visualization uses real AI progress data from [Epoch AI](https://epoch.ai/data):

- **Training Compute** - Frontier model compute (log₁₀ FLOP), 1950-2025
- **MMLU Score** - Benchmark accuracy frontier, 2021-2024
- **Epoch Capability Index** - Composite capability score, 2023-2025

To update metrics data:
```bash
# 1. Download fresh CSVs from epoch.ai to epoch_data/
# 2. Regenerate TypeScript data:
node scripts/parse-epoch-data.mjs
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WEBHOOK_SECRET=xxx
```
