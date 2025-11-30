# Story 1-1: Project Initialization

**Story Key:** 1-1-project-initialization
**Epic:** Epic 1 - Foundation
**Status:** drafted
**Priority:** P0 - Critical Path (First Story)

---

## User Story

**As a** developer,
**I want** a Next.js 16 project initialized with the core stack,
**So that** I can begin building features on a solid foundation.

---

## Acceptance Criteria

| AC ID | Criterion | Testable Condition |
|-------|-----------|-------------------|
| AC-1.1.1 | Next.js 16 project created with App Router | `npm run dev` starts without errors; `src/app/` directory exists |
| AC-1.1.2 | TypeScript strict mode enabled | `tsconfig.json` has `"strict": true` |
| AC-1.1.3 | Tailwind CSS v4 configured | Tailwind classes render correctly; color variables applied in globals.css |
| AC-1.1.4 | ESLint configured | `npm run lint` executes without configuration errors |
| AC-1.1.5 | shadcn/ui initialized | `components.json` exists; can add shadcn components |
| AC-1.1.6 | Core dependencies installed | All packages from dependency list present in `package.json` |
| AC-1.1.7 | Dev dependencies installed | Vitest, Testing Library, Playwright in devDependencies |
| AC-1.1.8 | Project builds successfully | `npm run build` completes without errors |

---

## Technical Approach

### Implementation Steps

1. **Create Next.js 16 project** using create-next-app with TypeScript, Tailwind, ESLint, App Router, and src directory
2. **Initialize shadcn/ui** with default configuration for component library foundation
3. **Install core dependencies** for data fetching, visualization, animation, and utilities
4. **Install dev dependencies** for testing infrastructure
5. **Verify project builds and runs** without errors

### Commands to Execute

```bash
# Step 1: Create Next.js 16 project
npx create-next-app@latest aiobituaries --typescript --tailwind --eslint --app --src-dir

# Step 2: Initialize shadcn/ui
cd aiobituaries
npx shadcn@latest init

# Step 3: Install core dependencies
npm install @sanity/client @visx/visx motion nuqs date-fns

# Step 4: Install dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright jsdom

# Step 5: Verify build
npm run build
npm run dev
```

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/app/layout.tsx` | Create | Root layout with html lang attribute |
| `src/app/page.tsx` | Create | Homepage placeholder |
| `src/app/globals.css` | Create | Tailwind directives |
| `tailwind.config.ts` | Create | Tailwind configuration |
| `tsconfig.json` | Create | TypeScript configuration with strict mode |
| `next.config.ts` | Create | Next.js configuration |
| `components.json` | Create | shadcn/ui configuration |
| `package.json` | Create | Dependencies manifest |
| `vitest.config.ts` | Create | Vitest test configuration |

### Core Dependencies

**Production:**
- `@sanity/client@^6.29.1` - CMS data fetching
- `@visx/visx@^3.12.0` - Visualization library (for later epics)
- `motion@^12.9.2` - Animation library (for later epics)
- `nuqs@^2.x` - URL state management
- `date-fns@^4.1.0` - Date formatting utilities

**Development:**
- `vitest@^3.2.4` - Unit testing framework
- `@testing-library/react` - Component testing
- `@testing-library/jest-dom` - DOM matchers
- `playwright@^1.57.0` - E2E testing
- `jsdom` - DOM environment for tests

---

## Tasks

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Run create-next-app with all required flags | 5 min |
| 2 | Initialize shadcn/ui with prompts | 5 min |
| 3 | Install core production dependencies | 5 min |
| 4 | Install dev dependencies | 5 min |
| 5 | Configure vitest.config.ts for testing | 10 min |
| 6 | Verify tsconfig.json has strict: true | 5 min |
| 7 | Run npm run build to verify setup | 5 min |
| 8 | Run npm run dev to verify dev server | 5 min |
| 9 | Run npm run lint to verify ESLint | 5 min |
| 10 | Document any deviations from expected setup | 5 min |

**Total Estimated Time:** ~55 minutes

---

## Dependencies

### Story Dependencies
- **None** - This is the first story in Epic 1

### External Dependencies
- Node.js 20+ LTS installed
- npm available

---

## Definition of Done

- [ ] All acceptance criteria (AC-1.1.1 through AC-1.1.8) verified and passing
- [ ] `npm run dev` starts development server without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes without configuration errors
- [ ] `src/app/` directory structure exists with layout.tsx and page.tsx
- [ ] `tsconfig.json` has `"strict": true`
- [ ] `components.json` exists for shadcn/ui
- [ ] All core dependencies listed in package.json
- [ ] All dev dependencies listed in package.json devDependencies
- [ ] vitest.config.ts configured for test environment

---

## Dev Agent Record

### Implementation Notes
<!-- To be filled during implementation -->

### Deviations from Plan
<!-- Document any changes from the technical approach -->

### Verification Results
<!-- Record test outputs and build results -->

### Learnings for Next Story
<!-- Insights to carry forward -->

---

## Source Document References

- **Epic Reference:** [Epic 1: Foundation](../../epics.md#epic-1-foundation)
- **Tech Spec Reference:** [Epic 1 Tech Spec - Story 1.1](../epic-tech-specs/epic-1-tech-spec.md#story-11-project-initialization)
- **FR Coverage:** FR5 (partial - infrastructure), FR25 (partial - routing), FR31 (SSG foundation)

---

_Story created: 2025-11-29_
_Status: drafted_
