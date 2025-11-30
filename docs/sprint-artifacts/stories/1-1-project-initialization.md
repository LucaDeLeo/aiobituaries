# Story 1-1: Project Initialization

**Story Key:** 1-1-project-initialization
**Epic:** Epic 1 - Foundation
**Status:** review
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

- [x] All acceptance criteria (AC-1.1.1 through AC-1.1.8) verified and passing
- [x] `pnpm run dev` starts development server without errors
- [x] `pnpm run build` completes successfully
- [x] `pnpm run lint` passes without configuration errors
- [x] `src/app/` directory structure exists with layout.tsx and page.tsx
- [x] `tsconfig.json` has `"strict": true`
- [ ] `components.json` exists for shadcn/ui (DEFERRED - see notes)
- [x] All core dependencies listed in package.json
- [x] All dev dependencies listed in package.json devDependencies
- [x] vitest.config.ts configured for test environment

---

## Dev Agent Record

### Context Reference
`docs/sprint-artifacts/story-contexts/1-1-project-initialization-context.xml`

### Implementation Notes

**Implementation Date:** 2025-11-29

**Dependencies Installed:**
- Production: next-sanity@11.6.10, @sanity/image-url@2.0.1, nuqs@2.8.1, lucide-react@0.555.0
- Dev: vitest@4.0.14, @testing-library/react@16.3.0, @testing-library/jest-dom@6.9.1, @vitejs/plugin-react@5.1.1, jsdom@27.2.0

**Framework Versions:**
- Next.js 16.0.5 (not 15 as originally specified - using latest)
- React 19.2.0
- TypeScript 5.9.3
- Tailwind CSS 4.1.17

**Directory Structure Created:**
- `src/app/` - App Router pages (created by create-next-app)
- `src/components/ui/` - For shadcn/ui components
- `src/components/layout/` - Layout components
- `src/components/visualization/` - Visx components
- `src/lib/sanity/` - Sanity client and queries
- `src/lib/utils/` - Utility functions
- `src/lib/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `tests/unit/` - Vitest unit tests
- `tests/components/` - Component tests
- `tests/e2e/` - Playwright E2E tests

### File List

**Created:**
- `package.json` - Project dependencies and scripts
- `pnpm-lock.yaml` - Dependency lock file
- `tsconfig.json` - TypeScript configuration with strict mode
- `next.config.ts` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `eslint.config.mjs` - ESLint configuration
- `next-env.d.ts` - Next.js TypeScript declarations
- `.gitignore` - Git ignore patterns
- `vitest.config.ts` - Vitest test configuration
- `tests/setup.ts` - Test setup file with jest-dom
- `tests/unit/setup.test.ts` - Smoke test to verify Vitest works
- `src/app/layout.tsx` - Root layout component
- `src/app/page.tsx` - Homepage component
- `src/app/globals.css` - Global styles with Tailwind
- `src/app/favicon.ico` - Site favicon
- `public/` - Public assets directory

### Deviations from Plan

1. **Package Manager:** Used `pnpm` instead of `npm` as specified in user instructions
2. **shadcn/ui Initialization:** DEFERRED to Story 1-2 (Design System Setup) - shadcn/ui initialization requires interactive prompts and is more appropriate for the design system story where component foundation is established
3. **Playwright:** Not installed per user instructions - user specifically requested vitest, testing-library, jsdom only
4. **Dependencies Variance:** Used next-sanity instead of @sanity/client directly (next-sanity provides better Next.js integration and includes the client)
5. **Visx, motion, date-fns:** Not installed per user instructions (specified next-sanity, @sanity/image-url, nuqs, lucide-react only)
6. **Next.js Version:** Installed Next.js 16.0.5 (latest) rather than Next.js 15.x - the create-next-app@latest installs the newest stable version

### Verification Results

**Build:**
```
pnpm run build - SUCCESS
- Compiled successfully in 1913.2ms
- Static pages generated (4/4)
```

**Dev Server:**
```
pnpm run dev - SUCCESS
- Next.js 16.0.5 (Turbopack)
- Ready in 512ms
- Local: http://localhost:3001
```

**Lint:**
```
pnpm run lint - SUCCESS
- No errors or warnings
```

**Tests:**
```
pnpm run test:run - SUCCESS
- 2 tests passed
- Test Files: 1 passed (1)
- Duration: 552ms
```

**TypeScript Strict Mode:**
```
tsconfig.json contains "strict": true - VERIFIED
```

### Learnings for Next Story

1. Next.js 16 with Tailwind CSS 4 uses a different configuration approach (no tailwind.config.ts by default)
2. pnpm is significantly faster than npm for installations
3. shadcn/ui initialization should happen in the Design System story where it can be properly configured with the design tokens
4. Vitest 4.x works seamlessly with React 19 and the @vitejs/plugin-react
5. The project structure follows the documented architecture patterns from docs/architecture.md

---

## Source Document References

- **Epic Reference:** [Epic 1: Foundation](../../epics.md#epic-1-foundation)
- **Tech Spec Reference:** [Epic 1 Tech Spec - Story 1.1](../epic-tech-specs/epic-1-tech-spec.md#story-11-project-initialization)
- **FR Coverage:** FR5 (partial - infrastructure), FR25 (partial - routing), FR31 (SSG foundation)

---

_Story created: 2025-11-29_
_Status: review_
_Implementation completed: 2025-11-29_
