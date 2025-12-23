# UX Audit Report: AI Obituaries

## Executive Summary

The site effectively communicates its core thesis: documenting AI skepticism against actual progress. The visualization is compelling and the data presentation is rich. However, there are several technical bugs and UX friction points that could confuse users or undermine the experience.

---

## Critical Issues (Bugs)

### 1. Duplicate Page Title on Skeptics Page
**Location:** `/skeptics`
**Issue:** Title shows "Notable AI Skeptics | AI Obituaries | AI Obituaries" - site name duplicated
**Impact:** Unprofessional appearance, SEO issue
**Fix:** Check title template composition in metadata

### 2. Nested `<a>` Tag Errors (3 Console Errors)
**Locations:**
- `src/components/skeptic/skeptic-card.tsx:27` - Card wrapped in Link contains nested social link anchors
- `src/components/skeptic/profile-links.tsx:41` - Same nested anchor issue

**Impact:**
- Invalid HTML causing hydration errors
- Potential accessibility issues
- React warnings in console

**Fix:** Either make the card non-clickable and use explicit "View" buttons, or stop event propagation on social links and use buttons styled as links

### 3. Hydration Mismatch in Metrics Toggle
**Location:** `src/components/controls/metrics-toggle.tsx:118`
**Issue:** className differs between server and client render
**Impact:** React hydration warnings, potential flash of unstyled content
**Fix:** Ensure conditional classes don't depend on client-only state during initial render

---

## UX Concerns (High Priority)

### 4. Y-Axis Meaning Not Explained on Homepage
**Issue:** First-time users see obituaries plotted against "Training Compute (FLOP)" but don't understand:
- Why vertical position matters
- What the relationship implies (claims made when AI was "lower" vs "higher")

**Suggestion:** Add a brief onboarding tooltip or subtitle like "Claims positioned by AI capability level at time of publication"

### 5. Detail Panel Obscures Visualization Context
**Issue:** Clicking a data point opens a left panel that covers part of the scatter plot, losing visual context of where the selected point is

**Suggestion:** Consider:
- Highlighting the selected point more prominently
- Using a modal overlay instead
- Sliding panel from right (where controls are) to preserve chart visibility

### 6. "AI Level" Column Unclear in Table View
**Issue:** Shows "10^26.7" with colored dot but no explanation of:
- What this number means
- What the dot color indicates

**Suggestion:** Add tooltip on column header explaining "Training compute (FLOP) at time of publication"

### 7. Missing Metric Data Looks Like Errors
**Location:** Skeptic detail pages (e.g., older Gary Marcus claims)
**Issue:** "MMLU: 0%" and "ECI: --" could mean:
- Data not available for that time period
- Actually zero/missing

**Suggestion:** Use "N/A" or "Not tracked" instead of 0% or dashes to clarify data wasn't collected

### 8. Category Colors Not Explained on Homepage
**Issue:** Scatter plot dots are color-coded but legend only appears in Controls panel (collapsed by default) or About page

**Suggestion:** Add small inline legend near visualization or make category section always visible

---

## UX Concerns (Medium Priority)

### 9. "Showing all categories" Toggle Confusing
**Issue:** Text reads as status but functions as toggle. Changes to "Show all" link when filtered.

**Suggestion:** Use clearer pattern like "All categories" checkbox that stays consistent

### 10. No Search Functionality
**Issue:** With 136+ obituaries, users can't search for specific claims, sources, or keywords

**Suggestion:** Add search input that filters both Table and Timeline views

### 11. Social Link Icons Unclear
**Location:** Skeptic cards
**Issue:** Icons (X, filled circle for Substack, "in", "W") are small and some aren't immediately recognizable

**Suggestion:** Add tooltips on hover, consider using more recognizable icons or text labels

---

## Minor Issues

### 12. Floating "N" Button
**Location:** Bottom-left corner
**Issue:** Next.js dev indicator visible - should be hidden in production

### 13. About Page Link Formatting
**Issue:** "Epoch AI:" text formatting looks odd - colon then link

---

## What Works Well

1. **Clear thesis** - Site purpose is immediately understandable
2. **Rich tooltips** - Hover states provide good context without clicking
3. **Contextual data** - "AI Progress at Time" section brilliantly shows what AI could do when claims were made
4. **Shareable URLs** - Filter state persists in URL parameters
5. **Dual views** - Timeline and Table serve different exploration needs
6. **Skeptics page** - Person-centric view is a compelling alternative entry point
7. **Thoughtful disclaimer** - "Not intended to mock individuals" shows editorial care
8. **Strong visual design** - Dark theme, gold accents, readable typography

---

## Recommended Priority Order

1. Fix nested `<a>` bugs (breaks HTML validity)
2. Fix hydration errors (console noise, potential issues)
3. Fix duplicate page title
4. Add category legend to homepage
5. Clarify "N/A" for missing metrics
6. Improve detail panel positioning
7. Add search functionality
8. Improve "AI Level" column clarity

---

*Audit conducted: December 2024*
