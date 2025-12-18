# Step 02: Fix Mock Guard Placeholder

## Objective
Fix the mock fallback guard to recognize the placeholder value from `.env.local.example`, and update README to reference the correct file.

## Problem
- `.env.local.example` uses `NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here`
- `shouldUseMock` in queries.ts only checks for `'placeholder'` and `'your_project_id'`
- New devs following setup will get confusing errors
- README references non-existent `.env.example`

## Files to Modify

### 1. src/lib/sanity/queries.ts

Update `shouldUseMock` check (around line 9-15):

**Before:**
```typescript
const shouldUseMock =
  process.env.NODE_ENV !== 'test' &&
  (!projectId ||
    projectId === 'placeholder' ||
    projectId === 'your_project_id' ||
    !dataset ||
    dataset === 'placeholder')
```

**After:**
```typescript
const shouldUseMock =
  process.env.NODE_ENV !== 'test' &&
  (!projectId ||
    projectId === 'placeholder' ||
    projectId === 'your_project_id' ||
    projectId === 'your_project_id_here' ||
    !dataset ||
    dataset === 'placeholder')
```

### 2. README.md

Update the setup instructions (around line 40):

**Before:**
```bash
cp .env.example .env.local
```

**After:**
```bash
cp .env.local.example .env.local
```

## Acceptance Criteria

- [ ] `shouldUseMock` includes `'your_project_id_here'`
- [ ] README references `.env.local.example`
- [ ] Build passes
- [ ] Tests pass (especially sanity query tests)

## Test Commands
```bash
bun run build
bun vitest run tests/unit/lib/sanity/
```

## Notes
- This is a DX fix to help new developers get started smoothly
- Mock data will be used until they configure real Sanity credentials
