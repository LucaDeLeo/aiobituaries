# AI Obituaries - Architecture

## Executive Summary

AI Obituaries is a data-driven web archive that visualizes AI skepticism claims against contextual evidence. The architecture centers on a **Contextual Scatter Plot** visualization built with Visx, where obituary claims are plotted against time with contextual Y-axes (stock prices, benchmarks, milestones) that vary by claim category.

The stack prioritizes performance and developer experience: Next.js 16 with Cache Components and ISR for instant page loads, Sanity CMS for flexible content management, and Motion (Framer) for smooth 60fps interactions. The architecture is intentionally simple - no auth, no user state, no complex backend - focusing all complexity on the visualization layer.

## Project Initialization

**First implementation story should execute:**

```bash
# Step 1: Create Next.js 16 project
npx create-next-app@latest aiobituaries --typescript --tailwind --eslint --app --src-dir

# Step 2: Initialize shadcn/ui
cd aiobituaries
npx shadcn@latest init

# Step 3: Install core dependencies
npm install @sanity/client @visx/visx motion nuqs date-fns

# Step 4: Install dev dependencies
npm install -D vitest @testing-library/react playwright
```

This establishes the base architecture with starter-provided decisions (TypeScript, Tailwind, ESLint, App Router).

## Decision Summary

| Category | Decision | Version | Affects FRs | Rationale |
| -------- | -------- | ------- | ----------- | --------- |
| Framework | Next.js 16 | 16.0.5 | All | Cache Components, Turbopack, ISR, React Compiler |
| Styling | Tailwind CSS | 4.1.x | FR34-37 | Utility-first, responsive design |
| Components | shadcn/ui (CLI) | 3.5.0 | All UI | Accessible, customizable, Tailwind-native |
| Data Source | @sanity/client | 6.29.1 | FR1-6 | Flexible schema, GROQ queries, webhooks for ISR |
| Visualization | Visx | 3.12.0 | FR7-13 | React-native, low-level control, tree-shakeable |
| Animation | Motion | 12.9.2 | FR46-47 | 60fps, gestures, spring physics |
| State Management | nuqs | 2.x | FR14-18 | URL-synced filters, shareable state |
| Date/Time | date-fns | 4.1.0 | All dates | Lightweight, tree-shakeable, TZ support |
| Testing | Vitest + Playwright | 3.2.4 / 1.57.0 | All | Unit + E2E coverage |
| Hosting | Vercel | — | All | Native Next.js support, edge CDN |

## Project Structure

```
aiobituaries/
├── src/
│   ├── app/                          # Next.js 16 App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Homepage (count + scatter plot)
│   │   ├── error.tsx                 # Error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   ├── globals.css               # Global styles + Tailwind
│   │   │
│   │   ├── claims/                   # Category deep-dive pages
│   │   │   ├── page.tsx              # All claims list
│   │   │   ├── market/
│   │   │   │   └── page.tsx          # Market/bubble claims (Y=stock price)
│   │   │   ├── capabilities/
│   │   │   │   └── page.tsx          # Capability claims (Y=benchmarks)
│   │   │   ├── agi/
│   │   │   │   └── page.tsx          # AGI skepticism (Y=milestones)
│   │   │   └── dismissive/
│   │   │       └── page.tsx          # Dismissive framing
│   │   │
│   │   ├── obituary/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Individual obituary page (SEO)
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx              # About page
│   │   │
│   │   └── api/
│   │       └── revalidate/
│   │           └── route.ts          # ISR on-demand revalidation webhook
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx            # Modal for obituary preview
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── nav.tsx
│   │   │
│   │   ├── visualization/            # Visx-powered components
│   │   │   ├── scatter-plot.tsx      # Main timeline visualization
│   │   │   ├── scatter-point.tsx     # Individual data point
│   │   │   ├── axis-time.tsx         # X-axis (time)
│   │   │   ├── axis-context.tsx      # Y-axis (contextual metric)
│   │   │   ├── tooltip-card.tsx      # Hover tooltip
│   │   │   ├── zoom-controls.tsx     # Zoom/pan controls
│   │   │   └── category-chart.tsx    # Category breakdown chart
│   │   │
│   │   ├── obituary/                 # Obituary-specific components
│   │   │   ├── obituary-card.tsx     # Card display
│   │   │   ├── obituary-modal.tsx    # Modal preview
│   │   │   ├── obituary-context.tsx  # Context metadata display
│   │   │   └── obituary-nav.tsx      # Prev/next navigation
│   │   │
│   │   ├── filters/                  # Filter components
│   │   │   ├── category-filter.tsx
│   │   │   └── date-range-filter.tsx
│   │   │
│   │   └── seo/                      # SEO components
│   │       ├── json-ld.tsx           # Structured data
│   │       └── og-image.tsx          # OG image generation
│   │
│   ├── lib/                          # Utilities and clients
│   │   ├── sanity/
│   │   │   ├── client.ts             # Sanity client config
│   │   │   ├── queries.ts            # GROQ queries
│   │   │   └── types.ts              # Sanity schema types
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                 # Class name utility
│   │   │   ├── dates.ts              # date-fns helpers
│   │   │   └── format.ts             # Formatting utilities
│   │   │
│   │   └── hooks/
│   │       ├── use-filters.ts        # Filter state (nuqs)
│   │       └── use-zoom.ts           # Zoom/pan state
│   │
│   └── types/
│       ├── obituary.ts               # Obituary type definitions
│       └── context.ts                # Context metadata types
│
├── sanity/                           # Sanity Studio (optional co-located)
│   ├── schemas/
│   │   ├── obituary.ts               # Obituary schema
│   │   └── context.ts                # Context metadata schema
│   └── sanity.config.ts
│
├── public/
│   ├── fonts/                        # Custom fonts if needed
│   └── og/                           # Static OG images
│
├── tests/
│   ├── unit/                         # Vitest unit tests
│   ├── components/                   # Component tests
│   └── e2e/                          # Playwright E2E tests
│
├── .env.local                        # Environment variables
├── next.config.ts                    # Next.js 16 config
├── tailwind.config.ts                # Tailwind v4 config
├── tsconfig.json
├── package.json
└── README.md
```

## FR Category to Architecture Mapping

| FR Category | FRs | Architecture Location |
|-------------|-----|----------------------|
| Data Display & Core Content | FR1-6 | `lib/sanity/`, `components/obituary/` |
| Timeline Visualization | FR7-13 | `components/visualization/` |
| Category System & Filtering | FR14-18 | `components/filters/`, `lib/hooks/use-filters.ts` |
| Individual Obituary Pages | FR19-23 | `app/obituary/[slug]/` |
| Navigation & IA | FR24-26 | `components/layout/` |
| SEO & Discoverability | FR27-31 | `components/seo/`, `app/*/page.tsx` metadata |
| Sharing & Social | FR32-33 | `components/seo/og-image.tsx` |
| Responsive Design | FR34-37 | Tailwind breakpoints throughout |
| Accessibility | FR38-44 | All components, ARIA patterns, table view |
| Performance | FR45-47 | Next.js 16 Cache Components, Visx optimization |

## Technology Stack Details

### Core Technologies

| Technology | Purpose | Key Features Used |
|------------|---------|-------------------|
| **Next.js 16** | Framework | App Router, Cache Components, ISR, `proxy.ts`, Turbopack |
| **React 19** | UI Library | Server Components, Suspense, use hook |
| **TypeScript** | Language | Strict mode, type-safe Sanity queries |
| **Tailwind CSS v4** | Styling | Utility classes, responsive design, CSS variables |
| **shadcn/ui** | Component Library | Dialog, Card, Button, accessible primitives |

### Visualization Stack

| Technology | Purpose | Key Features Used |
|------------|---------|-------------------|
| **Visx 3.12** | Data Visualization | @visx/scale, @visx/axis, @visx/shape, @visx/tooltip |
| **Motion 12.9** | Animation | motion components, gestures, spring physics |

### Data Layer

| Technology | Purpose | Key Features Used |
|------------|---------|-------------------|
| **Sanity CMS** | Content Management | GROQ queries, webhooks, real-time preview |
| **nuqs** | URL State | Type-safe query params, shareable filters |
| **date-fns** | Date Handling | format, parseISO, tree-shakeable |

### Integration Points

```
┌─────────────────┐     Webhook      ┌─────────────────┐
│   Sanity CMS    │ ───────────────► │  /api/revalidate │
│   (Content)     │                  │  (ISR trigger)   │
└────────┬────────┘                  └─────────────────┘
         │ GROQ
         ▼
┌─────────────────┐     Props        ┌─────────────────┐
│  Server         │ ───────────────► │  Client         │
│  Components     │                  │  Components     │
│  (Data Fetch)   │                  │  (Visualization)│
└─────────────────┘                  └─────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│  Vercel CDN     │                  │  Browser        │
│  (Static Pages) │                  │  (Interactivity)│
└─────────────────┘                  └─────────────────┘
```

## Novel Pattern: Contextual Scatter Plot

### Pattern Overview

The Contextual Scatter Plot is AI Obituaries' unique visualization - a scatter plot where the Y-axis meaning adapts based on claim category, showing obituary claims against contextual evidence.

```
┌─────────────────────────────────────────────────────────────┐
│  Y-Axis (contextual)                                        │
│  ▲                                                          │
│  │     ●(claim)  ●         ●●●    ← Dense clustering        │
│  │        ●    ●      ●  ●                                  │
│  │  ●       ●     ●         ●   ← Points = obituaries       │
│  │     ●       ●      ●●                                    │
│  │  ●    ●        ●      ●                                  │
│  └──────────────────────────────────────────────────────►   │
│     2022        2023        2024        2025   X-Axis       │
│                                              (time)         │
└─────────────────────────────────────────────────────────────┘
```

### Y-Axis Modes

| Mode | Y-Axis Label | Data Source | Use Case |
|------|--------------|-------------|----------|
| `market` | NVDA Stock Price | `context.stockPrices.nvda` | Market/bubble claims vs reality |
| `capability` | AI Benchmark Score | `context.benchmark.score` | Capability claims vs progress |
| `agi` | Capability Milestone | `context.milestone` | AGI skepticism vs milestones |
| `spread` | (visual only) | Jitter algorithm | Default view, all categories |

### Component Architecture

```tsx
<ScatterPlot data={obituaries} mode={yAxisMode}>
  <AxisTime />                    {/* X-axis: always date */}
  <AxisContext mode={yAxisMode} /> {/* Y-axis: varies by mode */}
  <ScatterPoints>
    {obituaries.map(ob => (
      <ScatterPoint
        key={ob._id}
        obituary={ob}
        onHover={() => showTooltip(ob)}
        onClick={() => openModal(ob)}
      />
    ))}
  </ScatterPoints>
  <ZoomControls />
  <CategoryLegend />
</ScatterPlot>
```

### Interaction States

| State | Trigger | Visual Response |
|-------|---------|-----------------|
| Default | — | Points at 80% opacity |
| Hover | Mouse over point | 100% opacity, scale 1.2x, tooltip appears |
| Selected | Click point | Modal opens, point highlighted |
| Filtered | Category toggle | Non-matching points fade to 20% |
| Zoomed | Scroll/pinch | Scale transforms, axis rescales |
| Panned | Drag | ViewBox translates |

### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard nav (FR40) | Tab through points, Enter to select |
| Screen reader (FR41) | ARIA labels: "Obituary: [claim], Date: [date]" |
| Table view (FR42) | Toggle button switches to accessible `<table>` |
| Focus indicators | Visible focus ring on active point |

### Edge Cases & Failure Modes

| Scenario | Detection | Handling | User Feedback |
|----------|-----------|----------|---------------|
| **Missing context data** | `context.nvdaPrice === undefined` | Plot point on X-axis only, Y=0 | Tooltip shows "Context data unavailable" |
| **Invalid date** | `isNaN(Date.parse(date))` | Exclude from visualization | Log warning, point omitted |
| **Empty dataset** | `obituaries.length === 0` | Show empty state | "No obituaries match your filters" message |
| **Y-axis mode mismatch** | Category lacks required context field | Fall back to `spread` mode | Toast: "Switching to spread view" |
| **Sanity fetch failure** | `try/catch` in data fetching | Show cached data or error state | Error boundary with retry button |
| **Zoom out of bounds** | Scale factor < 0.1 or > 10 | Clamp to min/max bounds | Disable zoom buttons at limits |
| **Overlapping points** | Points within 5px radius | Cluster into single point with count badge | Tooltip lists all obituaries in cluster |
| **Very long claim text** | `claim.length > 200` | Truncate with ellipsis | Full text in modal/detail view |

```typescript
// src/lib/utils/scatter-helpers.ts
export function getYValue(obituary: Obituary, mode: YAxisMode): number | null {
  switch (mode) {
    case 'market':
      return obituary.context?.nvdaPrice ?? null
    case 'capability':
      return obituary.context?.benchmarkScore ?? null
    case 'agi':
      // Milestones mapped to numeric scale 1-10
      return obituary.context?.milestone ? MILESTONE_SCALE[obituary.context.milestone] : null
    case 'spread':
    default:
      // Jitter algorithm for visual distribution
      return hashToJitter(obituary._id)
  }
}

export function hashToJitter(id: string): number {
  // Deterministic pseudo-random Y position based on ID
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
  }
  return (Math.abs(hash) % 100) / 100 // Returns 0-1
}
```

## Implementation Patterns

### Naming Conventions

| Category | Convention | Example |
|----------|------------|---------|
| Files | kebab-case | `scatter-plot.tsx`, `use-filters.ts` |
| Components | PascalCase | `ScatterPlot`, `ObituaryCard` |
| Functions | camelCase | `getObituaries()`, `formatDate()` |
| Types | PascalCase | `Obituary`, `ContextMetadata` |
| Constants | SCREAMING_SNAKE | `CATEGORY_COLORS`, `DEFAULT_ZOOM` |
| URL slugs | kebab-case | `/obituary/gary-marcus-ai-bubble-2023` |

### Component Pattern

```typescript
// Server Component (default)
// src/app/obituary/[slug]/page.tsx
export default async function ObituaryPage({ params }: { params: { slug: string } }) {
  const obituary = await getObituaryBySlug(params.slug)
  return <ObituaryDetail obituary={obituary} />
}

// Client Component (when interactivity needed)
// src/components/visualization/scatter-plot.tsx
'use client'
import { motion } from 'motion/react'

export function ScatterPlot({ data }: { data: Obituary[] }) {
  // Visx + Motion implementation
}
```

### Data Fetching Pattern

```typescript
// src/lib/sanity/queries.ts
import { client } from './client'
import type { Obituary } from '@/types/obituary'

export async function getObituaries(filters?: FilterParams): Promise<Obituary[]> {
  const categoryFilter = filters?.categories?.length
    ? `&& category in $categories`
    : ''

  return client.fetch<Obituary[]>(
    `*[_type == "obituary" ${categoryFilter}] | order(date desc) {
      _id,
      "slug": slug.current,
      claim,
      source,
      sourceUrl,
      date,
      categories,
      context
    }`,
    { categories: filters?.categories }
  )
}
```

### URL State Pattern

```typescript
// src/lib/hooks/use-filters.ts
'use client'
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs'

export function useFilters() {
  const [categories, setCategories] = useQueryState(
    'cat',
    parseAsArrayOf(parseAsString).withDefault([])
  )
  const [dateFrom, setDateFrom] = useQueryState('from')
  const [dateTo, setDateTo] = useQueryState('to')

  return { categories, setCategories, dateFrom, setDateFrom, dateTo, setDateTo }
}
```

### Animation Presets

```typescript
// src/lib/utils/animation.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 }
}

export const scaleOnHover = {
  whileHover: { scale: 1.1 },
  transition: { type: 'spring', stiffness: 300 }
}

export const modalTransition = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 }
}
```

### Import Order

```typescript
// 1. React/Next.js
import { Suspense } from 'react'
import Link from 'next/link'

// 2. Third-party libraries
import { motion } from 'motion/react'
import { format } from 'date-fns'

// 3. Internal: lib/utils
import { cn } from '@/lib/utils/cn'
import { getObituaries } from '@/lib/sanity/queries'

// 4. Internal: components
import { ScatterPlot } from '@/components/visualization/scatter-plot'

// 5. Internal: types
import type { Obituary } from '@/types/obituary'
```

### Communication Patterns

#### Component-to-Component Communication

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| **Props (down)** | Parent → Child data | Standard React props |
| **Callbacks (up)** | Child → Parent events | `onSelect`, `onFilter` props |
| **URL State** | Cross-component filters | nuqs `useQueryState` |
| **Server → Client** | Initial data hydration | Props from Server Components |

#### Event Handling

```typescript
// Callback pattern for visualization events
// src/components/visualization/scatter-plot.tsx
interface ScatterPlotProps {
  data: Obituary[]
  onPointSelect?: (obituary: Obituary) => void
  onPointHover?: (obituary: Obituary | null) => void
  onZoomChange?: (scale: number) => void
}

// Usage in parent
<ScatterPlot
  data={obituaries}
  onPointSelect={(ob) => setSelectedObituary(ob)}
  onPointHover={(ob) => setHoveredObituary(ob)}
/>
```

#### State Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│  URL State (nuqs)                                           │
│  - categories[], dateFrom, dateTo, selectedSlug            │
│  - Source of truth for filters                              │
│  - Shareable, bookmarkable                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Server Component (page.tsx)                                │
│  - Reads URL state via searchParams                         │
│  - Fetches filtered data from Sanity                        │
│  - Passes data as props to Client Components                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Client Component (ScatterPlot)                             │
│  - Local UI state only (hover, zoom, pan)                   │
│  - Calls URL setters for filter changes                     │
│  - No fetch calls (data comes from props)                   │
└─────────────────────────────────────────────────────────────┘
```

#### Format Patterns

| Data Type | Display Format | Function |
|-----------|----------------|----------|
| Dates | "Jan 15, 2024" | `format(date, 'MMM d, yyyy')` |
| Dates (short) | "Jan 2024" | `format(date, 'MMM yyyy')` |
| Stock prices | "$145.23" | `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` |
| Percentages | "85%" | `Math.round(value) + '%'` |
| Large numbers | "1.2M" | `Intl.NumberFormat('en-US', { notation: 'compact' })` |

## Consistency Rules

### Code Organization

- **Server Components** are the default; only use `'use client'` when interactivity is required
- **Visualization components** are always client components (Visx needs DOM)
- **Data fetching** happens in Server Components or via Sanity client
- **Shared logic** goes in `lib/`, **shared UI** goes in `components/`

### Error Handling

```typescript
// src/app/error.tsx
'use client'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Try again
      </button>
    </div>
  )
}
```

### Logging Strategy

- **Development**: `console.log/warn/error` for debugging
- **Production**: No client-side logging; errors captured by Vercel

### Testing Patterns

#### Test Organization

```
tests/
├── unit/                    # Vitest unit tests
│   ├── lib/
│   │   ├── sanity/
│   │   │   └── queries.test.ts
│   │   └── utils/
│   │       ├── dates.test.ts
│   │       └── scatter-helpers.test.ts
│   └── hooks/
│       └── use-filters.test.ts
├── components/              # Component tests with Testing Library
│   ├── visualization/
│   │   ├── scatter-plot.test.tsx
│   │   └── scatter-point.test.tsx
│   └── obituary/
│       └── obituary-card.test.tsx
└── e2e/                     # Playwright E2E tests
    ├── homepage.spec.ts
    ├── filters.spec.ts
    └── obituary-detail.spec.ts
```

#### Naming Conventions

| Test Type | File Pattern | Example |
|-----------|--------------|---------|
| Unit tests | `*.test.ts` | `dates.test.ts` |
| Component tests | `*.test.tsx` | `scatter-plot.test.tsx` |
| E2E tests | `*.spec.ts` | `homepage.spec.ts` |

#### Test Structure

```typescript
// tests/unit/lib/utils/scatter-helpers.test.ts
import { describe, it, expect } from 'vitest'
import { getYValue, hashToJitter } from '@/lib/utils/scatter-helpers'

describe('getYValue', () => {
  it('returns nvdaPrice for market mode', () => {
    const obituary = { context: { nvdaPrice: 145.50 } } as Obituary
    expect(getYValue(obituary, 'market')).toBe(145.50)
  })

  it('returns null when context data is missing', () => {
    const obituary = { context: {} } as Obituary
    expect(getYValue(obituary, 'market')).toBeNull()
  })

  it('returns jitter value for spread mode', () => {
    const obituary = { _id: 'test-123' } as Obituary
    const result = getYValue(obituary, 'spread')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })
})

describe('hashToJitter', () => {
  it('produces deterministic output', () => {
    expect(hashToJitter('abc')).toBe(hashToJitter('abc'))
  })

  it('produces different values for different inputs', () => {
    expect(hashToJitter('abc')).not.toBe(hashToJitter('xyz'))
  })
})
```

#### Component Testing with nuqs

```typescript
// tests/components/filters/category-filter.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { CategoryFilter } from '@/components/filters/category-filter'

describe('CategoryFilter', () => {
  it('updates URL when category is toggled', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn()

    render(<CategoryFilter />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter onUrlUpdate={onUrlUpdate}>
          {children}
        </NuqsTestingAdapter>
      )
    })

    await user.click(screen.getByRole('checkbox', { name: /market/i }))
    expect(onUrlUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        queryString: expect.stringContaining('cat=market')
      })
    )
  })
})
```

#### E2E Testing

```typescript
// tests/e2e/filters.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Filter functionality', () => {
  test('filters obituaries by category', async ({ page }) => {
    await page.goto('/')

    // Click market category filter
    await page.getByRole('checkbox', { name: /market/i }).click()

    // URL should update
    await expect(page).toHaveURL(/cat=market/)

    // Only market obituaries should be visible (full opacity)
    const points = page.locator('[data-category="market"]')
    await expect(points.first()).toHaveCSS('opacity', '1')
  })

  test('shares filtered view via URL', async ({ page, context }) => {
    await page.goto('/?cat=market&from=2024-01-01')

    // Filter should be pre-applied
    await expect(page.getByRole('checkbox', { name: /market/i })).toBeChecked()
  })
})
```

#### What to Test

| Layer | What to Test | What NOT to Test |
|-------|--------------|------------------|
| **Utils** | Pure functions, edge cases, error handling | Third-party library internals |
| **Hooks** | State changes, URL updates, side effects | React internals |
| **Components** | User interactions, accessibility, rendering | Implementation details |
| **E2E** | Critical user flows, cross-page navigation | Every possible path |

#### Coverage Expectations

- **Unit tests**: 80%+ coverage on `lib/utils/` and `lib/hooks/`
- **Component tests**: All interactive components, focus on accessibility
- **E2E tests**: Happy path for each major user flow

## Data Architecture

### Obituary Schema (Sanity)

```typescript
// sanity/schemas/obituary.ts
export default {
  name: 'obituary',
  title: 'Obituary',
  type: 'document',
  fields: [
    { name: 'claim', type: 'text', title: 'Claim' },
    { name: 'source', type: 'string', title: 'Source' },
    { name: 'sourceUrl', type: 'url', title: 'Source URL' },
    { name: 'date', type: 'date', title: 'Date' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'claim' } },
    {
      name: 'categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Market/Bubble', value: 'market' },
          { title: 'Capability Doubt', value: 'capability' },
          { title: 'AGI Skepticism', value: 'agi' },
          { title: 'Dismissive Framing', value: 'dismissive' }
        ]
      }
    },
    {
      name: 'context',
      type: 'object',
      fields: [
        { name: 'nvdaPrice', type: 'number', title: 'NVDA Stock Price' },
        { name: 'msftPrice', type: 'number', title: 'MSFT Stock Price' },
        { name: 'googPrice', type: 'number', title: 'GOOG Stock Price' },
        { name: 'benchmarkName', type: 'string', title: 'Benchmark Name' },
        { name: 'benchmarkScore', type: 'number', title: 'Benchmark Score' },
        { name: 'currentModel', type: 'string', title: 'Current AI Model' },
        { name: 'milestone', type: 'string', title: 'AI Milestone' },
        { name: 'note', type: 'text', title: 'Additional Context' }
      ]
    }
  ]
}
```

### TypeScript Types

```typescript
// src/types/obituary.ts
export interface Obituary {
  _id: string
  slug: string
  claim: string
  source: string
  sourceUrl: string
  date: string  // ISO 8601
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

export type YAxisMode = 'market' | 'capability' | 'agi' | 'spread'
```

## API Contracts

### Sanity GROQ Queries

```groq
// Get all obituaries
*[_type == "obituary"] | order(date desc) {
  _id,
  "slug": slug.current,
  claim,
  source,
  sourceUrl,
  date,
  categories,
  context
}

// Get obituary by slug
*[_type == "obituary" && slug.current == $slug][0] {
  _id,
  "slug": slug.current,
  claim,
  source,
  sourceUrl,
  date,
  categories,
  context
}

// Get obituaries by category
*[_type == "obituary" && $category in categories] | order(date desc) {
  _id,
  "slug": slug.current,
  claim,
  source,
  sourceUrl,
  date,
  categories,
  context
}
```

### ISR Revalidation Webhook

```typescript
// src/app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-sanity-webhook-secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // Revalidate all pages that display obituaries
  revalidatePath('/')
  revalidatePath('/claims')
  revalidatePath('/obituary/[slug]', 'page')

  return NextResponse.json({ revalidated: true })
}
```

## Security Architecture

| Concern | Implementation |
|---------|----------------|
| **No Auth Required** | Public content site, no user data |
| **API Protection** | Webhook secret for ISR revalidation |
| **XSS Prevention** | React's default escaping, no dangerouslySetInnerHTML |
| **External Links** | `rel="noopener noreferrer"` on all external links |
| **Environment Variables** | Sanity project ID, webhook secret in `.env.local` |

## Performance Considerations

### Core Web Vitals Strategy

| Metric | Target | Implementation |
|--------|--------|----------------|
| **LCP < 2.5s** | SSG + CDN edge delivery, optimized images |
| **FID < 100ms** | Minimal client JS, deferred hydration |
| **CLS < 0.1** | Reserved space for visualization, skeleton loaders |
| **INP < 200ms** | Optimized event handlers, Motion spring physics |

### Visualization Performance

| Technique | Implementation |
|-----------|----------------|
| **SVG virtualization** | Only render visible points in viewport |
| **Debounced zoom/pan** | 16ms debounce on transform updates |
| **Memoized calculations** | useMemo for scale computations |
| **RequestAnimationFrame** | Smooth 60fps animations |

### Bundle Optimization

- **Tree-shaking**: Import specific Visx packages (`@visx/scale`, not `@visx/visx`)
- **Code splitting**: Dynamic imports for heavy visualization code
- **Font optimization**: Next.js font optimization for custom fonts

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │  Edge   │  │  Edge   │  │  Edge   │  │  Edge   │    │
│  │  (US)   │  │  (EU)   │  │  (Asia) │  │  (...)  │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
│       └────────────┴────────────┴────────────┘          │
│                         │                                │
│                    ┌────▼────┐                          │
│                    │ Vercel  │                          │
│                    │ Runtime │                          │
│                    └────┬────┘                          │
└─────────────────────────┼───────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
        ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
        │  Sanity   │ │ ISR   │ │  Static   │
        │  API      │ │ Cache │ │  Assets   │
        └───────────┘ └───────┘ └───────────┘
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_read_token
SANITY_WEBHOOK_SECRET=your_webhook_secret
```

## Development Environment

### Prerequisites

- Node.js 20+ (LTS)
- npm 10+ or pnpm
- Git

### Setup Commands

```bash
# Clone and install
git clone <repo>
cd aiobituaries
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Sanity credentials

# Run development server
npm run dev

# Run tests
npm run test        # Unit tests
npm run test:e2e    # E2E tests

# Build for production
npm run build
```

### Available Scripts

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest",
  "test:e2e": "playwright test",
  "sanity": "sanity dev"
}
```

## Architecture Decision Records (ADRs)

### ADR-001: Sanity CMS over JSON Files

**Context:** Data source for obituary content.

**Decision:** Use Sanity CMS instead of static JSON files.

**Rationale:**
- Content editor UI for easier management
- Webhook support for instant ISR updates
- GROQ query language for flexible filtering
- Scalable for 200+ obituaries

**Consequences:** Additional service dependency, but simplified content workflow.

---

### ADR-002: Visx over vis-timeline

**Context:** Visualization library for scatter plot.

**Decision:** Use Visx (low-level React primitives) instead of vis-timeline (batteries-included).

**Rationale:**
- Epoch AI-style aesthetic requires custom design
- Contextual Y-axis needs flexible axis configuration
- Tree-shakeable for smaller bundles
- React-native (no DOM conflicts)

**Consequences:** More implementation effort, but complete design control.

---

### ADR-003: Contextual Y-Axis Pattern

**Context:** How to show "claim vs reality" contrast.

**Decision:** Y-axis meaning changes based on claim category (stock price, benchmarks, milestones).

**Rationale:**
- Market claims are best contrasted with stock prices
- Capability claims are best contrasted with benchmarks
- Single visualization supports multiple narrative lenses

**Consequences:** Requires category-specific data in each obituary, more complex axis rendering.

---

### ADR-004: URL State with nuqs

**Context:** Managing filter state for shareability.

**Decision:** Use nuqs for URL-synced filter state.

**Rationale:**
- Filters should be shareable (e.g., `?cat=market`)
- URL is the source of truth for filters
- nuqs provides type-safe query params

**Consequences:** URL changes on filter update, which is the desired behavior.

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-29_
_For: Luca_

---

## Version Verification Log

| Technology | Version | Verified Date | Source |
|------------|---------|---------------|--------|
| Next.js | 16.0.5 | 2025-11-29 | endoflife.date, nextjs.org |
| Tailwind CSS | 4.1.x | 2025-11-29 | tailwindcss.com |
| shadcn CLI | 3.5.0 | 2025-11-29 | github.com/shadcn-ui/ui |
| @sanity/client | 6.29.1 | 2025-11-29 | npmjs.com |
| Visx | 3.12.0 | 2025-11-29 | npmjs.com |
| Motion | 12.9.2 | 2025-11-29 | npmjs.com |
| nuqs | 2.x | 2025-11-29 | npmjs.com, nuqs.dev |
| date-fns | 4.1.0 | 2025-11-29 | npmjs.com |
| Vitest | 3.2.4 | 2025-11-29 | npmjs.com |
| Playwright | 1.57.0 | 2025-11-29 | npmjs.com |
