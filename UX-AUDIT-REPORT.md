# AI Obituaries: Comprehensive UX Audit Report

**Date:** December 23, 2025
**Reviewer:** Claude (AI Assistant)
**Scope:** Full site review including desktop, mobile, all pages, and interactions

---

## Executive Summary

AI Obituaries is a conceptually powerful site that documents AI skepticism claims and visualizes them against real AI progress metrics. The core insight—showing "AI is dead" predictions plotted against exponential capability growth—is unique and compelling.

**Overall Assessment:** The desktop experience effectively delivers on the site's promise. However, critical gaps exist in the mobile experience and data completeness that significantly undermine the value proposition for a portion of users.

### Key Findings

| Severity | Count | Summary |
|----------|-------|---------|
| Critical | 3 | Mobile loses core insight, missing context data, static hero count |
| Moderate | 6 | Truncation issues, unclear labels, subtle UI patterns |
| Minor | 4 | Polish items, loading states, minor inconsistencies |

### Recommended Priority Actions
1. Redesign mobile visualization to preserve AI progress context
2. Ensure "Context at Time" data is populated or hide section when unavailable
3. Make hero statistic responsive to active filters

---

## 1. Site Goal Analysis

### Inferred Primary Goal
**Document the recurring pattern of AI skepticism by visualizing pessimistic claims against objective AI progress metrics, demonstrating that "AI is dead" declarations have historically been premature.**

### How the Site Serves This Goal

| Element | Desktop | Mobile | Assessment |
|---------|---------|--------|------------|
| Scatter plot (claims vs. AI progress) | ✅ Excellent | ❌ Missing | Core differentiator |
| AI metrics background (compute, MMLU, ECI) | ✅ Present | ❌ Absent | Essential context |
| Skeptic profiles with claim history | ✅ Works well | ✅ Works well | Strong feature |
| Category filtering | ✅ URL-based, shareable | ✅ Accessible via sheet | Well implemented |
| Individual obituary detail | ⚠️ "Context unavailable" on some | ⚠️ Same issue | Undermines promise |

### Content Strategy Alignment
The site's content strategy is sound:
- Curated claims from credible sources (WSJ, MIT Tech Review, notable researchers)
- Clear categorization (Capability Doubt, Market/Bubble, AGI Skepticism, Dismissive Framing)
- Attribution to specific individuals with their credentials
- Timestamp precision enabling correlation with AI capability data

**Gap:** The "Context at Time" feature—which should be the payoff—frequently shows "unavailable."

---

## 2. Critical Issues

### 2.1 Mobile Visualization Loses Core Value Proposition

**Severity:** Critical
**Impact:** ~50%+ of users (mobile traffic) miss the entire point of the site

**Current State:**
- Desktop shows a scatter plot with claims positioned by date (X) and AI compute level (Y)
- Background trend lines show exponential AI progress (Training Compute, MMLU, ECI)
- Mobile shows only a histogram of claim counts by year—no AI progress context

**The Problem:**
The histogram tells users "there were more AI skepticism claims in 2017 and 2024" but NOT "those claims were made when AI was at X capability level and is now at Y." The insight is lost.

**Evidence:**
```
Desktop: Claims plotted against 10²⁰ to 10²⁷ FLOP scale with visible trend line
Mobile: Simple bar chart showing count per year (1965, 1978, 1991, 2004, 2017, 2025)
```

**Recommendation:**
Option A: Simplified scatter plot for mobile (compress Y-axis, larger touch targets)
Option B: Keep histogram but overlay an AI progress indicator line
Option C: Card-based view where each card shows "Claimed [X] when AI was at [Y]"

---

### 2.2 "Context at Time" Shows "Unavailable" on Key Pages

**Severity:** Critical
**Impact:** Individual obituary pages fail to deliver their core promise

**Current State:**
The obituary detail page has a "Context at Time" section that should show AI metrics at the moment of the claim. For many entries (including recent ones like Yann LeCun's Oct 2024 quote), this shows:

```
Context at Time
Context data unavailable
```

**The Problem:**
This is the most important piece of information on the detail page. If a user clicks through to learn more about a claim, the context is literally what they came for.

**Contrast with Skeptic Pages:**
Interestingly, the individual skeptic pages (e.g., `/skeptics/emily-bender`) DO show metrics:
```
MMLU: 88.1%
Compute: 10^26.4
ECI: 141.8
```

This suggests the data exists but isn't being surfaced on the obituary detail pages.

**Recommendation:**
1. Investigate data pipeline—why is context available on skeptic pages but not obituary pages?
2. If data truly unavailable, hide the section entirely rather than showing "unavailable"
3. Consider adding a fallback: "AI at this time could [capability description]"

---

### 2.3 Hero Statistic Doesn't Respond to Filters

**Severity:** Critical
**Impact:** Users cannot trust the displayed count; creates cognitive dissonance

**Current State:**
- Header always shows `136 OBITUARIES` regardless of active filters
- Controls panel correctly shows `Showing 55 of 136` when filtered
- Table view correctly displays only matching results

**The Problem:**
When a user filters to "Capability Doubt" (55 results), they see:
- Big hero: **136 OBITUARIES**
- Sidebar: "Showing 55 of 136"
- Actual content: 55 items

This disconnect creates confusion: "Am I seeing everything? Did the filter work?"

**Recommendation:**
Dynamic hero that responds to filters:
- Unfiltered: `136 OBITUARIES`
- Filtered: `55 OBITUARIES` (with subtle "of 136 total" or filter indicator)

Alternative: Keep 136 static but add clear "Filtered: Capability Doubt (55)" badge near it.

---

## 3. Moderate Issues

### 3.1 Duplicate Page Title on Skeptic Detail Pages

**Severity:** Moderate
**Impact:** Poor SEO, unprofessional appearance in browser tabs

**Current State:**
```
Browser tab: "Emily M. Bender | AI Obituaries | AI Obituaries"
Expected:    "Emily M. Bender | AI Obituaries"
```

**Location:** Likely in `src/app/skeptics/[slug]/page.tsx` metadata generation

**Recommendation:** Review metadata template concatenation logic.

---

### 3.2 Tooltip Truncates Author/Source Names

**Severity:** Moderate
**Impact:** Users can't see full attribution without clicking through

**Current State:**
On hover, tooltips show truncated text:
```
"Worries about AI's existential threat are complete B.S."
Yann LeCun, Th...    Oct 12, 2024
AI Progress: 10^x FLOP
```

"Th..." is "The Wall Street Journal" — important context.

**Recommendation:**
- Increase tooltip max-width
- Or use multi-line layout for source attribution
- Consider showing publication separately from author

---

### 3.3 Y-Axis Has No Label

**Severity:** Moderate
**Impact:** First-time visitors don't understand what the vertical axis represents

**Current State:**
Y-axis shows: `10²⁷`, `10²⁶`, `10²⁵`... with no label

**The Problem:**
Users must either:
1. Guess this is "Training Compute"
2. Notice the checked "Training Compute" option in controls
3. Read the About page

Most won't do any of these on first visit.

**Recommendation:**
Add rotated Y-axis label: "Training Compute (FLOP)" or brief label like "AI Compute →"

---

### 3.4 "AI Progress: 10^x FLOP" in Tooltips is Cryptic

**Severity:** Moderate
**Impact:** Non-technical users don't understand the metric

**Current State:**
Tooltips show `AI Progress: 10²⁶ FLOP` without explanation.

**The Problem:**
- "FLOP" is jargon (Floating Point Operations)
- The exponential notation is intimidating
- There's no sense of scale or comparison

**Recommendation:**
Option A: Plain English — "AI Progress: Very High (frontier model level)"
Option B: Comparative — "AI Progress: 10²⁶ FLOP (GPT-4 era)"
Option C: Simplified — "AI Capability Level: 96/100"

---

### 3.5 Category Filter "Show All" Link is Subtle

**Severity:** Moderate
**Impact:** Users may not realize how to clear filters

**Current State:**
When filtered, "Showing all categories" changes to "Show all" — a small text link.

**Recommendation:**
- More prominent "Clear filters" button
- Or "✕ Capability Doubt" chip that can be clicked to remove filter

---

### 3.6 Table View "AI Level" Column is Hard to Read

**Severity:** Moderate
**Impact:** Key data point is visually inaccessible

**Current State:**
The AI Level column shows a small colored dot with superscript notation:
```
● 10²⁶·⁷
```

**Problems:**
- Superscript numbers are tiny
- Dot color meaning isn't explained in table context
- Column header "AI Level" doesn't match "Training Compute" terminology

**Recommendation:**
- Larger, more readable number format
- Tooltip on column header explaining the metric
- Consider progress bar or simpler visualization

---

## 4. Minor Issues

### 4.1 No Loading States

**Severity:** Minor
**Impact:** Slight perception of sluggishness during data fetches

**Observation:** When switching between Timeline and Table views or applying filters, there's no skeleton UI or loading indicator.

**Recommendation:** Add subtle loading states for view transitions.

---

### 4.2 Desktop Drawer Shifts Controls Panel

**Severity:** Minor
**Impact:** Slight layout jumpiness

**Observation:** When clicking an obituary point, the detail drawer appears at the top-right and pushes the Controls panel down.

**Recommendation:** Consider overlay drawer that doesn't affect layout, or fixed controls position.

---

### 4.3 Mobile Category Bar Truncation

**Severity:** Minor
**Impact:** Users can't see all category options at a glance

**Current State:**
```
● Capability Dou...Market/Bubble...AGI Skepticism...Dism...
```

**Recommendation:**
- Horizontal scroll with visible scroll indicator
- Or collapsed "Categories ▼" button

---

### 4.4 Mixed Future/Past Dates in Data

**Severity:** Minor (or data issue)
**Impact:** Potential user confusion about data currency

**Observation:** Data includes entries dated "Dec 22, 2025" which is in the future (relative to my knowledge cutoff, though may be current for you).

**Recommendation:** Verify data pipeline is pulling real, timestamped entries.

---

## 5. What Works Well

### 5.1 Core Visualization Concept ✓
The scatter plot showing claims against AI progress is the killer feature. No other site visualizes AI skepticism this way. The exponential growth line makes the "premature pessimism" pattern viscerally obvious.

### 5.2 Timeline/Table View Toggle ✓
Excellent flexibility. Visual learners use Timeline; data-oriented users prefer Table. Both share the same filter state.

### 5.3 URL-Based Filter State ✓
`?cat=capability` in the URL means filtered views are shareable. This is critical for social sharing ("look at all the capability doubt claims!").

### 5.4 Skeptics Page Concept ✓
Brilliant organizational choice. Letting users explore by person (Gary Marcus: 11 claims) adds narrative depth and accountability.

### 5.5 Individual Skeptic Pages with Metrics ✓
Showing AI capability metrics alongside each claim on skeptic pages delivers on the core promise (when the data is present).

### 5.6 Previous/Next Navigation on Detail Pages ✓
Enables browsing through obituaries without returning to the main view.

### 5.7 About Page Clarity ✓
Clear explanation of:
- What each metric means
- What each category represents (with color coding)
- Data sources (Epoch AI)
- Editorial disclaimer ("not intended to mock individuals")

### 5.8 Visual Design ✓
- Dark theme fits the "obituary" metaphor
- Gold accent color is distinctive
- Typography is readable
- Consistent component styling

### 5.9 Mobile Filter Sheet ✓
All desktop controls are accessible via the slide-up sheet. No functionality is lost (except the visualization itself).

### 5.10 Footer Quote ✓
> "The reports of my death have been greatly exaggerated."
> — AI, probably

Clever, memorable, reinforces the site's thesis.

---

## 6. Information Architecture Assessment

### Site Map
```
AI Obituaries
├── Home (/)
│   ├── Timeline View (default)
│   │   └── [Click obituary] → Detail drawer
│   └── Table View
│       └── [Click "View details"] → Detail drawer OR full page
├── Skeptics (/skeptics)
│   └── [Skeptic] (/skeptics/[slug])
│       └── Claims list with metrics
├── About (/about)
└── [Obituary Detail] (/obituary/[slug])
    └── Context, source link, prev/next nav
```

### Navigation Assessment

| Path | Clarity | Issues |
|------|---------|--------|
| Home → Obituary Detail | Good | Drawer is optional (can go to full page) |
| Home → Skeptics | Good | Clear nav link |
| Skeptics → Skeptic → Claims | Excellent | Natural drill-down |
| Obituary → Related Skeptic | Missing | No link from obituary to skeptic profile |
| Any → Home | Good | Logo links home |

**Gap Identified:** No connection from individual obituary page to the skeptic's profile page. If I'm reading a Yann LeCun quote, I might want to see his other claims.

---

## 7. Desktop vs. Mobile Comparison

| Feature | Desktop | Mobile | Parity |
|---------|---------|--------|--------|
| Scatter plot | ✅ Full | ❌ Histogram | **BROKEN** |
| AI progress lines | ✅ Visible | ❌ Absent | **BROKEN** |
| Filter controls | ✅ Sidebar | ✅ Sheet | ✅ OK |
| Obituary list | ✅ Table/points | ✅ Cards | ✅ OK |
| Category filters | ✅ Checkboxes | ✅ Bottom bar + sheet | ✅ OK |
| Date range slider | ✅ Present | ✅ In sheet | ✅ OK |
| Navigation | ✅ Header links | ✅ Hamburger menu | ✅ OK |
| Obituary detail | ✅ Drawer + page | ✅ Full page | ✅ OK |
| Skeptics page | ✅ Grid | ✅ Stacked | ✅ OK |

### Mobile-Specific Observations

**Positive:**
- "A memorial to the ever-dying predictions of AI doom" subtitle (only on mobile) is excellent copy
- Card-based obituary list is thumb-friendly
- Filter button (⚙) is well-positioned

**Negative:**
- Histogram provides zero insight about AI capability context
- Category bar text truncation
- No way to see the "AI at time of claim" relationship

---

## 8. Accessibility Observations

| Aspect | Status | Notes |
|--------|--------|-------|
| Keyboard navigation | ⚠️ Partial | Timeline SVG has `role="application"` with arrow key support |
| Color contrast | ✅ Good | Gold on dark gray passes WCAG AA |
| Screen reader | ⚠️ Unknown | SVG visualization likely needs ARIA improvements |
| Focus indicators | ✅ Present | Visible focus rings on interactive elements |
| Skip link | ✅ Present | "Skip to main content" link exists |

**Recommendation:** Conduct dedicated a11y audit with actual screen reader testing.

---

## 9. Performance Observations

| Metric | Observation |
|--------|-------------|
| Initial load | Fast (Turbopack + ISR) |
| View switching | Near-instant |
| Filter application | Near-instant |
| Data fetching | Pre-fetched via Server Components |
| Image optimization | N/A (no images in core UI) |

No significant performance concerns observed during review.

---

## 10. Recommendations Summary

### Tier 1: Critical (Do Immediately)

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 1 | Mobile visualization shows histogram instead of AI-progress-aware view | High | Very High |
| 2 | "Context at Time" unavailable on obituary detail pages | Medium | Very High |
| 3 | Hero stat doesn't update when filtered | Low | High |

### Tier 2: Important (Do Soon)

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 4 | Add Y-axis label to scatter plot | Low | Medium |
| 5 | Fix duplicate page title on skeptic pages | Low | Medium |
| 6 | Expand tooltip to show full source name | Low | Medium |
| 7 | Improve "AI Level" column readability in table | Medium | Medium |
| 8 | Make "Show all" filter reset more prominent | Low | Medium |

### Tier 3: Nice to Have (Do When Possible)

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 9 | Add loading states for view transitions | Low | Low |
| 10 | Link obituary detail to skeptic profile | Low | Medium |
| 11 | Fix mobile category bar truncation | Low | Low |
| 12 | Make tooltip metrics human-readable | Medium | Medium |

---

## 11. Conclusion

AI Obituaries has a strong conceptual foundation and executes well on desktop. The scatter plot visualization is genuinely novel and delivers a powerful insight about the historical pattern of AI skepticism.

**The mobile experience is the critical gap.** With potentially half or more of traffic coming from mobile devices, the current histogram-only view fundamentally fails to communicate the site's core message. This should be the top priority.

Secondary priorities include ensuring the "Context at Time" data is surfaced consistently and making the filtered state more obvious in the UI.

The site's design, performance, and content quality are all strong. With the recommended fixes, AI Obituaries would deliver a consistently compelling experience across all devices.

---

## Appendix: Pages Reviewed

1. **Home** (`/`) — Timeline and Table views, filters, obituary drawer
2. **Obituary Detail** (`/obituary/[slug]`) — Individual claim page
3. **Skeptics** (`/skeptics`) — Grid of notable skeptics
4. **Skeptic Detail** (`/skeptics/[slug]`) — Individual skeptic with claims
5. **About** (`/about`) — Methodology and explanations

## Appendix: Devices Tested

- Desktop: 1440×900 viewport
- Mobile: 390×844 viewport (iPhone 14 Pro equivalent)

---

*Report generated by Claude during interactive browser review session.*
