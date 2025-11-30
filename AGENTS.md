# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Obituaries is a curated archive tracking "AI is dead/overhyped/doomed" declarations. It visualizes these claims against contextual evidence (stock prices, benchmarks, milestones) using a scatter plot where the Y-axis meaning adapts based on claim category.

Stack: Next.js 16 (App Router), React 19, Tailwind CSS v4, Sanity CMS, Visx (planned), shadcn/ui, Vitest.

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
- `src/components/` - React components (ui/, layout/, obituary/, seo/)
- `src/lib/sanity/` - Sanity client and GROQ queries
- `src/lib/utils/` - Utility functions
- `src/types/` - TypeScript types (Obituary, ContextMetadata, Category)
- `tests/unit/` - Vitest unit tests mirroring src/ structure

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

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WEBHOOK_SECRET=xxx
```
