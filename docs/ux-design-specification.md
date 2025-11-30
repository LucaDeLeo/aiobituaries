# AI Obituaries UX Design Specification

_Created on 2025-11-29 by Luca_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

AI Obituaries is a data-driven web archive cataloging every instance when critics, pundits, media outlets, or public figures have declared AI "dead," "overhyped," "a bubble," or otherwise dismissed its potential. Modeled after 99Bitcoins' Bitcoin Obituaries, it serves as a verifiable counter-narrative tool for the AI community.

**Target Users:**
- AI safety researchers and advocates countering skepticism
- Content creators in AI x-risk media (documentaries, podcasts, video essays)
- People engaging skeptics in debates about AI capabilities
- YouTube channel audience as a shareable resource

**Core Value Proposition:** Verifiable evidence over argument - every obituary links to original source, timestamped with contextual data (stock prices, model capabilities, benchmarks). The big number tells the story; the metadata makes it bulletproof.

**Platform:** Web application (Next.js 16, SSG/ISR, Tailwind v4, shadcn/ui, Vercel)

**Visual Direction:** Epoch AI-inspired - serious, credible, data-forward with sophistication and dynamism. Not dry/academic, not snarky/mocking.

**Desired Emotional Response:** Quietly empowered confidence—the calm assurance of having irrefutable evidence. Pattern recognition satisfaction when the density of predictions clicks. Credibility through restraint; the data is damning enough.

**Inspiration Sources:**
- **Epoch AI** — Visual authority, data sophistication, research-institute credibility
- **99Bitcoins Bitcoin Obituaries** — Archive concept, count as headline metric, price-at-time contextual anchor
- **Gap to fill** — Interactive timeline visualization neither reference has

**UX Complexity:** Moderate — single user type, one primary journey (explore → discover → share), novel timeline interaction, rich contextual data display

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Selected:** shadcn/ui + Tailwind CSS v4

**Rationale:**
- Full ownership—components copied into codebase, complete customization control
- Built on Radix UI—accessibility (keyboard nav, ARIA, screen readers) baked in
- CSS variable theming—easy dark/light mode and custom color themes
- Tailwind v4—latest utility-first CSS for sophisticated visual polish
- Covers 80% of UI needs: Card, Dialog, Tooltip, Dropdown, Button, Badge, Table

**Components from shadcn/ui:**
- Card (obituary display)
- Dialog/Sheet (obituary detail modal)
- Tooltip (timeline hover previews)
- Button, Badge (actions, category tags)
- Select/DropdownMenu (filtering)

**Custom Components Required:**
- **Timeline Visualization** — Hero component, horizontal scroll/zoom, density display
- **Obituary Card** — Extended Card with contextual data (AI capabilities, stock prices)
- **Count Display** — Animated hero metric
- **Category Filter Pills** — Extended Badge with active states

---

## 2. Core User Experience

### 2.1 Defining Experience

**One-line description:** "A visual archive where you can see every time someone declared AI dead—and what AI could actually do when they said it."

**Core Loop:**
1. **See the count** — The headline number hits immediately
2. **Explore the timeline** — Scroll through time, see density clusters
3. **Discover context** — Hover/click into specific predictions, see the receipts
4. **Share the evidence** — Copy link, use in debates

**The ONE interaction to nail:** Timeline exploration—the differentiator that makes the pattern undeniable.

### 2.2 Novel UX Patterns

#### Interactive Timeline Visualization

**Visual Representation:** Dots/circles (compact, shows density clearly)

**Density Behavior:** Expand-on-zoom, collapse when zoomed out
- Zoomed out: Overlapping dots with subtle glow showing intensity
- Zoomed in: Dots spread apart, each becomes individually clickable
- Deep zoom: Full separation with hover previews

**Time Scale:** Full range visible (2022-present) compressed to fit, scroll to pan

**Interaction Model:**

| Action | Response |
|--------|----------|
| Scroll horizontally | Pan through time with momentum |
| Scroll vertically / Pinch | Zoom in/out—dots expand/collapse |
| Hover dot | Tooltip: claim snippet + source + date |
| Click dot | Modal with full obituary + context |
| Click cluster | Zoom into that time period |

**Visual Details:**
- Dot size: ~12-16px diameter, soft circles with subtle shadow
- Category encoding: Border color or fill tint (4 categories = 4 colors)
- Density glow: Overlapping dots create additive brightness
- Active state: 1.2x scale + ring on hover
- Time axis: Year markers prominent, months appear on zoom

### 2.3 Core Experience Principles

**Speed:** Timeline should feel instant—smooth 60fps panning and zooming, hover previews appear within 50ms

**Guidance:** Minimal hand-holding—the visualization is intuitive. Subtle onboarding hint on first visit ("scroll to explore, click for details")

**Flexibility:** One primary path (timeline → detail) but category filters add user control

**Feedback:** Quiet confidence—smooth transitions, no bouncy animations. Polish, not playfulness

---

## 3. Visual Foundation

### 3.1 Color System

**Selected Theme:** Deep Archive — Scholarly, timeless, authoritative

**Rationale:** Gold accent evokes historical record and documented evidence. Dark mode makes timeline dots pop like stars against night sky. Warm tones feel human and considered, not sterile. Quiet authority that lets the data speak.

#### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | #0C0C0F | Page background |
| `--bg-secondary` | #14141A | Section backgrounds |
| `--bg-card` | #18181F | Card surfaces |
| `--bg-tertiary` | #1C1C24 | Elevated elements |
| `--border` | #2A2A35 | Borders, dividers |
| `--text-primary` | #E8E6E3 | Headlines, body text |
| `--text-secondary` | #A8A5A0 | Secondary text |
| `--text-muted` | #6B6860 | Captions, timestamps |
| `--accent-primary` | #C9A962 | Primary actions, links, count |

#### Category Colors (Timeline Dots)

| Category | Hex | Visual |
|----------|-----|--------|
| Capability Doubt | #C9A962 | Gold — most common, ties to brand |
| Market/Bubble | #7B9E89 | Sage green — financial connotation |
| AGI Skepticism | #9E7B7B | Dusty rose — existential tone |
| Dismissive Framing | #7B7B9E | Muted lavender — casual dismissal |

#### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | #7B9E89 | Confirmations, copy success |
| `--warning` | #C9A962 | Cautions |
| `--error` | #9E5555 | Errors, broken links |
| `--info` | #7B8B9E | Informational |

### 3.2 Typography

**Font Stack:**
- Headlines/Quotes: `Instrument Serif` — editorial credibility, archival feel
- Body/UI: `Geist` — modern, highly legible sans-serif
- Monospace/Data: `Geist Mono` — counts, dates, technical data

#### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-hero` | 4rem (64px) | 1.0 | 700 | Count display (fixed position) |
| `--text-display` | 2.5rem (40px) | 1.2 | 400 | Page title "AI Obituaries" |
| `--text-h1` | 2rem (32px) | 1.3 | 400 | Section headings, obituary page claim |
| `--text-h2` | 1.5rem (24px) | 1.4 | 500 | Card titles, modal headers |
| `--text-h3` | 1.25rem (20px) | 1.4 | 500 | Subsection headings |
| `--text-body` | 1rem (16px) | 1.6 | 400 | Body text, descriptions |
| `--text-sm` | 0.875rem (14px) | 1.5 | 400 | Secondary text, meta info |
| `--text-xs` | 0.75rem (12px) | 1.4 | 500 | Labels, timestamps, category tags |
| `--text-mono-lg` | 1.5rem (24px) | 1.2 | 600 | Inline counts, stats |
| `--text-mono-sm` | 0.75rem (12px) | 1.4 | 400 | Dates, technical data |

#### Font Weight Usage

| Weight | Token | When to Use |
|--------|-------|-------------|
| 400 (Regular) | `font-normal` | Body text, descriptions, quotes |
| 500 (Medium) | `font-medium` | Labels, buttons, navigation, emphasis |
| 600 (Semibold) | `font-semibold` | Section headers, active states, stats |
| 700 (Bold) | `font-bold` | Hero count only |

#### Line Height Guidelines

| Context | Line Height | Rationale |
|---------|-------------|-----------|
| Headlines | 1.0–1.3 | Tight for visual impact |
| Body text | 1.6 | Optimal readability for paragraphs |
| UI elements | 1.4–1.5 | Balanced for buttons, labels, cards |
| Monospace | 1.2–1.4 | Tighter for data density |

### 3.3 Spacing & Layout

- Base unit: 4px (Tailwind default)
- Spacing scale: Tailwind defaults (1, 2, 3, 4, 6, 8, 12, 16, 24, 32...)
- Border radius: 8px default, 12px for cards, 999px for pills
- Container max-width: 1400px centered

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Approach

**Selected:** The Scroll — Timeline as the entire experience

**Concept:** The horizontal timeline IS the experience. Full-bleed, edge-to-edge exploration like unrolling an ancient document. The count floats fixed in the corner, ever-present as you journey through time.

**Rationale:**
- The timeline is the hero feature—make it THE experience, not just a component
- Horizontal scroll feels like unrolling a historical record
- Count remains visible throughout exploration (fixed position)
- Full-bleed edges create immersion
- Naturally maps to time (left = past, right = present)

**Key Layout Elements:**

```
┌─────────────────────────────────────────────────────┐
│  AI Obituaries              [filters]      247     │
│  A documented history                    obituaries │
├─────────────────────────────────────────────────────┤
│                                                     │
│  2022      ○  ○      2023    ○○○○○○    2024  ○○○  │
│            │  │              │││││││         │││   │
│ ←──────────────── horizontal scroll ───────────────→│
│                                                     │
├─────────────────────────────────────────────────────┤
│     [All] [Capability] [Market] [AGI] [Dismissive]  │
└─────────────────────────────────────────────────────┘
```

**Spatial Composition:**
- Title: Top-left, anchored
- Count: Top-right, prominent but not overwhelming
- Timeline: Full viewport height minus header/filters
- Filters: Bottom center, floating pill bar with backdrop blur
- Year markers: Vertical text integrated into timeline flow

**Visual Effects:**
- Gradient fade at edges (indicates more content)
- Vertical grid lines (subtle, indicates months/quarters)
- Dot glow on hover
- Smooth momentum scrolling

**Interactive Mockups:**

- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

#### Journey 1: Explore & Discover (Primary)

**Goal:** Grasp the pattern of AI skepticism, find compelling examples

```
LAND → SEE COUNT → SCROLL TIMELINE → HOVER DOT → CLICK DOT → VIEW MODAL
                         ↓                              ↓
                   FILTER BY CATEGORY            "View full page" →
                         ↓                              ↓
                   CONTINUE EXPLORING            DEDICATED PAGE
```

**Flow Details:**

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1. Land | Opens homepage | Count animates in, timeline visible |
| 2. Orient | Sees count + timeline | Gradient edges hint at more content |
| 3. Scroll | Horizontal scroll/drag | Timeline pans with momentum, year markers pass |
| 4. Hover | Mouse over dot | Tooltip: claim snippet + source + date |
| 5. Click | Click dot | Modal slides in with full obituary |
| 6. Explore modal | Read details | See contextual data (AI capabilities at time) |
| 7a. Close | Click outside/X/Esc | Modal closes, timeline position preserved |
| 7b. Go deeper | Click "View full page" | Navigate to dedicated obituary page |

**Filter Behavior:**
- Toggle category filter → Non-matching dots fade to 20% opacity
- Faded dots lose glow, become non-interactive
- Active dots remain full brightness
- Preserves spatial context for density comparison
- Smooth 200ms transition

#### Journey 2: Deep Dive (Obituary Page)

**Goal:** See full context, understand what AI could do when claim was made

```
MODAL "View full page" → OBITUARY PAGE → EXPLORE CONTEXT → SHARE or RETURN
```

**Page Content:**
- Full claim text (large, serif, prominent)
- Source with link to original
- Date prominently displayed
- Category tags
- **Contextual Snapshot:**
  - AI capabilities at time (GPT version, benchmarks)
  - Stock prices (NVDA, MSFT, etc.)
  - Recent AI milestones
- Previous/Next obituary navigation
- "Back to timeline" with position preserved

#### Journey 3: Share Evidence

**Goal:** Get shareable link to use in debates, social media, content

```
MODAL → COPY LINK BUTTON → LINK COPIED TOAST
            or
OBITUARY PAGE → SHARE BUTTON → COPY LINK / SOCIAL OPTIONS
```

**Share Features:**
- Each obituary has semantic URL (`/obituary/gary-marcus-ai-bubble-2023`)
- Copy link button in modal and full page
- Toast confirmation: "Link copied to clipboard"
- Social meta tags (OG, Twitter Cards) for rich previews
- Optional: Share to Twitter/X with pre-filled text

### 5.2 Navigation Flow

```
                    ┌─────────────┐
                    │  Homepage   │
                    │  (Timeline) │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │ Modal   │  │ About   │  │Categories│
        │(preview)│  │         │  │ (future) │
        └────┬────┘  └─────────┘  └──────────┘
             │
             ↓
        ┌─────────┐
        │Obituary │
        │  Page   │
        └─────────┘
```

**Navigation Pattern:**
- Primary: Timeline exploration (horizontal)
- Secondary: Top nav (Home, About)
- Deep: Modal → Full page
- Return: Breadcrumb or browser back (position preserved)

### 5.3 Error States & Edge Cases

#### Network & Loading Errors

| Scenario | User Sees | Recovery Action |
|----------|-----------|-----------------|
| **Initial load fails** | Full-page error: "Unable to load obituaries. Check your connection." | Retry button + cached fallback if available |
| **Partial load (some dots fail)** | Timeline loads, failed dots show faded placeholder | Hover shows "Details unavailable" tooltip |
| **Modal content fails** | Modal opens with error state: "Couldn't load details" | Close button + "Try again" link |
| **Image/asset fails** | Placeholder or graceful degradation | No action needed |
| **Slow connection** | Skeleton loading states, then warning toast if > 5s | Auto-retry in background |

#### Data Edge Cases

| Scenario | Handling |
|----------|----------|
| **0 obituaries (empty archive)** | "No obituaries yet. The archive is being populated." + subtle animation |
| **1 obituary** | Timeline still shows, grammar adjusts ("1 obituary") |
| **Very dense clusters (50+ dots same month)** | Dots stack vertically, zoom-to-expand behavior |
| **Very sparse timeline (few dots, long gaps)** | Time axis adapts, empty regions compressed |
| **Missing source URL** | "Source link unavailable" badge, claim still visible |
| **Missing date** | Display "Date unknown", sort to end of timeline |
| **Duplicate entries** | Deduplicated at data layer, not UX concern |

#### User Action Errors

| Scenario | Response |
|----------|----------|
| **Copy link fails** | Error toast: "Couldn't copy link. Try selecting the URL manually." |
| **Share fails** | Error toast: "Share unavailable. Link copied instead." |
| **Filter returns 0 results** | "No obituaries in this category" + "Show all" button |
| **Invalid URL/deep link** | 404 page: "This obituary doesn't exist" + link to homepage |
| **Browser doesn't support feature** | Graceful degradation (e.g., no smooth scroll, basic tooltips) |

#### Accessibility Error Prevention

| Scenario | Handling |
|----------|----------|
| **Focus trap in modal** | Escape always works, focus returns to trigger element |
| **Screen reader announcement** | Live regions announce: filter changes, load states, errors |
| **Keyboard-only user hits dead end** | Skip links, clear focus order, all interactive elements reachable |
| **High contrast mode** | Colors meet contrast, borders visible, focus rings prominent |

#### Recovery Patterns

| Pattern | Implementation |
|---------|----------------|
| **Auto-retry** | Network errors retry 2x with exponential backoff (1s, 3s) |
| **Manual retry** | "Try again" button for user-initiated retry |
| **Fallback content** | Show cached/stale data with "Last updated" indicator |
| **Graceful degradation** | If JavaScript fails, static content still visible |
| **Error logging** | Silent logging to analytics for debugging (no user action) |

---

## 6. Component Library

### 6.1 Component Strategy

**Foundation:** shadcn/ui components, customized with Deep Archive theme

#### From shadcn/ui (Standard)

| Component | Usage | Customization |
|-----------|-------|---------------|
| Button | Actions, filters | Gold accent for primary |
| Badge | Category tags | Category colors, pill shape |
| Dialog/Sheet | Obituary modal | Slide-in from right, backdrop blur |
| Tooltip | Dot hover previews | Dark bg, gold border accent |
| Card | Obituary cards (list view) | Deep Archive colors |
| Toast | Copy confirmation | Bottom-right, success green |

#### Custom Components

**1. Timeline Visualization**
- Canvas-based or SVG for performance with 200+ dots
- Horizontal scroll with momentum (CSS scroll-snap or custom)
- Zoom via scroll wheel / pinch
- Year markers integrated into flow

**2. Timeline Dot**
```
States:
- Default: 14px circle, category color, subtle glow
- Hover: 1.3x scale, intensified glow, cursor pointer
- Filtered out: 20% opacity, no glow, non-interactive
- Active (clicked): Ring indicator

Props: date, category, obituaryId, isFiltered
```

**3. Count Display**
```
- Monospace font (Geist Mono), large scale
- Gold color (#C9A962)
- Subtle pulsing glow animation
- Animate on load (count up effect optional)
```

**4. Obituary Modal**
```
Sections:
- Claim (large, Instrument Serif, italic)
- Source + link
- Date
- Category tags
- Contextual snapshot (collapsible)
- Actions: Copy link, View full page, Close

Animation: Slide in from right, 300ms ease-out
Dismiss: Click outside, X button, Escape key
```

**5. Category Filter Bar**
```
- Floating pill bar, bottom center
- Backdrop blur (frosted glass effect)
- Toggle buttons with category dot + label
- "All" button for reset
- Multi-select enabled
```

**6. Contextual Snapshot Card**
```
For obituary detail, shows:
- AI Model at time (e.g., "GPT-3.5 was latest")
- Stock prices (NVDA, MSFT, etc.)
- Recent milestone (e.g., "2 weeks after GPT-4 launch")
- Benchmark scores if relevant
```

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

**Smart defaults for AI Obituaries — override if any feel wrong**

#### Button Hierarchy
| Type | Style | Usage |
|------|-------|-------|
| Primary | Gold fill (#C9A962), dark text | Main CTAs: "View full page", "Copy link" |
| Secondary | Dark fill, light border | Alternative actions |
| Ghost | Transparent, text only | Close, navigation |
| Filter Active | Gold fill | Selected category filter |
| Filter Inactive | Dark fill, subtle border | Unselected filter |

#### Feedback Patterns
| Scenario | Pattern |
|----------|---------|
| Success (link copied) | Toast, bottom-right, 3s auto-dismiss, green accent |
| Error (source unavailable) | Inline message in modal, red accent |
| Loading | Skeleton shimmer for timeline, no spinners |
| Hover feedback | Scale + glow (dots), background shift (buttons) |

#### Modal Patterns
| Aspect | Decision |
|--------|----------|
| Size | Medium width (~500px), full height slide-in from right |
| Dismiss | Click outside, X button, Escape key |
| Focus | Auto-focus close button for accessibility |
| Backdrop | Dark overlay with blur |
| Animation | Slide in 300ms ease-out, fade backdrop |

#### Navigation Patterns
| Aspect | Decision |
|--------|----------|
| Active state | Gold underline or fill for current page |
| Back behavior | Browser back works, preserves timeline position |
| Deep linking | Full URL support for obituary pages |
| Breadcrumbs | Not needed (shallow hierarchy) |

#### Empty States
| Scenario | Display |
|----------|---------|
| No filter results | "No obituaries in this category" + reset button |
| Loading | Skeleton timeline with placeholder dots |

#### Animation Principles
| Type | Duration | Easing |
|------|----------|--------|
| Hover states | 150ms | ease-out |
| Modal open/close | 300ms | ease-out / ease-in |
| Filter transitions | 200ms | ease-in-out |
| Dot glow pulse | 3s | ease-in-out infinite |
| Page transitions | 200ms | ease-out |

#### Tooltip Behavior
- Delay: 300ms before showing
- Position: Above dot, centered
- Content: Claim snippet (truncated), source, date
- Style: Dark bg, subtle gold border, max-width 280px

#### Form Patterns

| Element | Specification |
|---------|---------------|
| **Labels** | Above input, `--text-sm`, `--text-secondary` color |
| **Inputs** | 44px min height, `--bg-tertiary` fill, `--border` stroke, 8px radius |
| **Focus state** | `--accent-primary` border, 3px ring with 15% opacity |
| **Placeholder** | `--text-muted` color, italic style |
| **Error state** | `--error` border, error message below in `--text-xs` |
| **Help text** | Below input, `--text-xs`, `--text-muted` |
| **Required indicator** | Gold asterisk after label |

**Validation timing:**
- Validate on blur (not on every keystroke)
- Show error immediately on submit if invalid
- Clear error when user starts typing in errored field

#### Confirmation Patterns

| Action Type | Confirmation Required? | Method |
|-------------|----------------------|--------|
| **Destructive** (delete, clear) | Yes | Modal dialog |
| **Irreversible** (submit report) | Yes | Modal dialog |
| **Reversible** (filter, navigate) | No | Immediate action |
| **External** (open source link) | No | New tab indicator |

**Confirmation dialog spec:**
- Title: Action verb + object ("Clear all filters?")
- Body: Consequence explanation (1 sentence max)
- Primary action: Destructive color for destructive actions
- Secondary action: "Cancel" (always available)
- Escape key: Cancels
- Click outside: Cancels

#### Notification Patterns (Toast)

| Aspect | Specification |
|--------|---------------|
| **Position** | Bottom-right, 24px from edges |
| **Width** | 320px max |
| **Duration** | Success: 3s, Error: 5s (or manual dismiss), Info: 4s |
| **Stacking** | Max 3 visible, newest on top, 8px gap |
| **Animation** | Slide in from right (200ms), fade out (150ms) |

**Toast types:**
| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| Success | ✓ | `--success` | Link copied, action completed |
| Error | ! | `--error` | Network error, source unavailable |
| Warning | ⚠ | `--warning` | Slow connection, partial data |
| Info | i | `--info` | New obituaries added, update available |

**Priority rules:**
- Errors interrupt and stay until dismissed
- Success toasts auto-dismiss, can be manually dismissed early
- Only one error toast at a time (newest replaces)
- Success/info can stack up to 3

#### Search Patterns

*Note: Search is not in MVP scope. If added later:*

| Aspect | Specification |
|--------|---------------|
| **Trigger** | Magnifying glass icon in header, or keyboard shortcut (Cmd/Ctrl + K) |
| **Interface** | Command palette style modal, centered |
| **Scope** | Search claims, sources, dates |
| **Results** | Show top 8 matches, grouped by category |
| **No results** | "No obituaries match '[query]'" + suggestion to browse timeline |
| **Keyboard nav** | Arrow keys to navigate, Enter to select, Escape to close |

#### Date/Time Patterns

| Context | Format | Example |
|---------|--------|---------|
| **Timeline axis** | Year only | 2023 |
| **Tooltip preview** | Month Day, Year | Mar 14, 2023 |
| **Card display** | Month Day, Year | Mar 14, 2023 |
| **Full page** | Full date | March 14, 2023 |
| **Relative (recent)** | Relative if < 7 days | "2 days ago" |
| **Data export** | ISO 8601 | 2023-03-14 |

**Timezone handling:**
- Store all dates in UTC
- Display in user's local timezone
- Show "(UTC)" indicator on hover for precision

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

#### Breakpoints

| Breakpoint | Width | Layout Adaptation |
|------------|-------|-------------------|
| Desktop | 1024px+ | Full "Scroll" experience, horizontal timeline |
| Tablet | 768px–1023px | Horizontal timeline (touch swipe), condensed header |
| Mobile | 320px–767px | Hybrid: density bar + vertical list |

#### Desktop (1024px+)
- Full horizontal scroll timeline
- Count display top-right (large)
- Filter bar bottom-center (floating)
- Year markers in timeline flow
- Hover tooltips enabled

#### Tablet (768px–1023px)
- Horizontal timeline maintained (touch swipe)
- Count moves to header (smaller)
- Filter bar becomes scrollable horizontal pills
- Touch targets increased to 44px minimum
- Hover disabled, tap for tooltips

#### Mobile (320px–767px)
**Hybrid approach:**
```
┌─────────────────────────┐
│ AI Obituaries      247  │
├─────────────────────────┤
│ ▁▂▅▇▅▃▂▁▂▄▆▅▃▂         │  ← Density visualization bar
│ 2022    2023    2024    │
├─────────────────────────┤
│ [All] [Cap] [Mkt] [AGI] │  ← Filter chips
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ "AI is just..."     │ │  ← Vertical obituary cards
│ │ Gary Marcus • 2023  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ "The bubble..."     │ │
│ │ TechCrunch • 2024   │ │
│ └─────────────────────┘ │
│         ...             │
└─────────────────────────┘
```

**Mobile adaptations:**
- Density bar replaces interactive timeline (shows pattern at glance)
- Tap density bar region to filter to that time period
- Vertical scrolling list of obituary cards
- Cards show: claim preview, source, date, category dot
- Tap card → full-screen modal (sheet from bottom)
- Filter chips horizontally scrollable

### 8.2 Accessibility (WCAG 2.1 AA)

#### Compliance Target: **WCAG 2.1 Level AA**

#### Color & Contrast
| Element | Contrast Ratio | Status |
|---------|---------------|--------|
| Body text (#E8E6E3) on bg (#0C0C0F) | 14.5:1 | ✓ Exceeds 4.5:1 |
| Secondary text (#A8A5A0) on bg | 7.2:1 | ✓ Exceeds 4.5:1 |
| Gold accent (#C9A962) on bg | 7.8:1 | ✓ Exceeds 4.5:1 |
| Category colors | Tested per combination | Must verify |

**Color independence:**
- Categories distinguished by color AND label text
- Filter pills include text labels, not just dots
- Tooltips include full text, not just visual position

#### Keyboard Navigation
| Element | Keys | Behavior |
|---------|------|----------|
| Timeline dots | Tab, Arrow keys | Navigate between dots |
| Dot activation | Enter, Space | Open modal |
| Modal | Tab through elements | Focus trapped in modal |
| Modal close | Escape | Close and return focus |
| Filters | Tab, Enter | Toggle filter |

**Focus indicators:**
- Visible focus ring on all interactive elements
- Gold outline (#C9A962) with 2px offset
- Never remove focus outlines

#### Screen Reader Support
- Timeline has `role="list"` with dots as `role="listitem"`
- Each dot has `aria-label`: "Obituary: [claim snippet], [source], [date]"
- Modal has `aria-modal="true"`, `role="dialog"`
- Live region announces filter changes
- Alternative table view available (accessible data display)

#### Alternative Timeline View
For users who cannot use visual timeline:
- "View as table" link in header
- Full list/table of all obituaries
- Sortable by date, source, category
- All data accessible without visualization

#### Touch Targets
- Minimum 44x44px for all interactive elements
- Timeline dots: 44px touch target (visual 14px, padding extends)
- Buttons: 44px minimum height
- Filter pills: 44px height

#### Motion & Animation
- Respect `prefers-reduced-motion` media query
- Disable: glow pulse, hover scale, timeline momentum
- Keep: essential feedback (modal open/close simplified)

#### Testing Strategy
| Method | Tools |
|--------|-------|
| Automated | Lighthouse, axe DevTools |
| Manual | Keyboard-only navigation test |
| Screen reader | VoiceOver (Mac), NVDA (Windows) |
| Color | Stark contrast checker |

---

## 9. Implementation Guidance

### 9.1 Summary of Decisions

| Area | Decision |
|------|----------|
| **Design System** | shadcn/ui + Tailwind v4 |
| **Theme** | Deep Archive (dark, gold accent, scholarly) |
| **Typography** | Instrument Serif (headlines), Geist (body), Geist Mono (data) |
| **Design Direction** | The Scroll — horizontal timeline as the experience |
| **Core Interaction** | Dots expand on zoom, hover preview, click for modal |
| **Filter Behavior** | Non-matching dots fade to 20% opacity |
| **Modal Pattern** | Slide-in from right, "View full page" option |
| **Mobile** | Hybrid: density bar + vertical card list |
| **Accessibility** | WCAG 2.1 AA, keyboard nav, screen reader support |

### 9.2 Key Files Created

| File | Description |
|------|-------------|
| `docs/ux-design-specification.md` | This document — complete UX spec |
| `docs/ux-color-themes.html` | Interactive color theme explorer (4 options) |
| `docs/ux-design-directions.html` | 6 design direction mockups |

### 9.3 Implementation Priority

**Phase 1: Core Experience**
1. Homepage with count display
2. Horizontal scrollable timeline (desktop)
3. Timeline dots with category colors
4. Hover tooltips on dots
5. Click → obituary modal

**Phase 2: Filtering & Navigation**
1. Category filter bar
2. Filter fade effect on dots
3. Individual obituary pages
4. "View full page" from modal
5. Share/copy link functionality

**Phase 3: Polish & Responsive**
1. Mobile hybrid view (density bar + list)
2. Tablet adaptations
3. Animation refinements
4. Accessibility audit
5. Performance optimization (200+ dots)

### 9.4 Technical Notes for Development

**Timeline Implementation Options:**
- CSS `overflow-x: scroll` with `scroll-snap` for basic
- Custom scroll handler for momentum + zoom
- Consider virtualization if 500+ dots (react-window or similar)

**Zoom Behavior:**
- Scroll wheel / pinch gesture
- Recalculate dot positions based on zoom level
- Cluster dots when zoomed out, spread when zoomed in

**State Management:**
- URL params for filter state (shareable filtered views)
- Session storage for timeline scroll position (preserve on return)

**Data Structure:**
```typescript
interface Obituary {
  id: string;
  claim: string;
  source: string;
  sourceUrl: string;
  date: string; // ISO
  categories: Category[];
  context: {
    aiModel?: string;
    stockPrices?: Record<string, number>;
    benchmark?: string;
    milestone?: string;
  };
}

type Category =
  | 'capability-doubt'
  | 'market-bubble'
  | 'agi-skepticism'
  | 'dismissive-framing';
```

---

## Appendix

### Related Documents

- Product Requirements: `docs/prd.md`
- Product Brief: `docs/brief.md`

### Core Interactive Deliverables

- **Color Theme Visualizer**: `docs/ux-color-themes.html`
- **Design Direction Mockups**: `docs/ux-design-directions.html`

### Version History

| Date | Version | Changes | Author |
| ---- | ------- | ------- | ------ |
| 2025-11-29 | 1.0 | Initial UX Design Specification | Luca |

---

_This UX Design Specification was created through collaborative design facilitation._
