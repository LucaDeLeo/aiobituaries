# Story 2-8: Share/Copy Link

**Status:** in-progress
**Epic:** 2 - Core Content Display
**Priority:** Medium

## User Story

**As a** visitor,
**I want** to easily copy a link to share an obituary,
**So that** I can use it in debates and discussions.

## Acceptance Criteria

| AC ID | Criterion | Status |
|-------|-----------|--------|
| AC-2.8.1 | Copy button visible on detail page | [ ] |
| AC-2.8.2 | Click copies URL to clipboard | [ ] |
| AC-2.8.3 | Success toast appears | [ ] |
| AC-2.8.4 | Toast positioned bottom-right | [ ] |
| AC-2.8.5 | Toast has checkmark icon | [ ] |
| AC-2.8.6 | Toast uses success color | [ ] |
| AC-2.8.7 | Toast auto-dismisses after 3 seconds | [ ] |
| AC-2.8.8 | Error handling for clipboard failure | [ ] |
| AC-2.8.9 | Button has link/copy icon | [ ] |
| AC-2.8.10 | Button uses outline variant with gold hover | [ ] |

## Technical Approach

### Files to Create
- `src/components/ui/toast.tsx` - Toast primitive component
- `src/components/ui/toaster.tsx` - Toast container
- `src/hooks/use-toast.ts` - Toast hook
- `src/components/ui/copy-button.tsx` - Copy link button

### Files to Modify
- `src/app/layout.tsx` - Add Toaster component
- `src/components/obituary/obituary-detail.tsx` - Add CopyButton

### Implementation Details

1. **Toast system**:
   - Simple toast with title, description
   - Auto-dismiss after duration
   - Bottom-right positioning
   - Uses React context for state management

2. **CopyButton**:
   - Client component with 'use client'
   - Uses navigator.clipboard.writeText()
   - Shows Link2 icon, changes to Check on success
   - Outline variant with gold hover

## Dependencies

- Story 2.3 (detail pages) - DONE
