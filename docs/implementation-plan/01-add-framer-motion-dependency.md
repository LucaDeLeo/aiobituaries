# Step 01: Add framer-motion Dependency

## Objective
Resolve the dependency mismatch where code imports from `framer-motion` but `package.json` only has `motion`.

## Problem
- `package.json` has `"motion": "^12.23.24"`
- Source files import from `'framer-motion'`
- This works due to motion re-exporting framer-motion, but is confusing

## Solution
Add `framer-motion` as an explicit dependency alongside `motion`.

## Files to Modify

### 1. package.json
Add framer-motion to dependencies:
```json
{
  "dependencies": {
    "framer-motion": "^11.15.0",
    // ... existing deps
  }
}
```

## Implementation Steps

1. Run: `bun add framer-motion`
2. Verify package.json now includes framer-motion
3. Run build to verify no breaking changes

## Acceptance Criteria

- [ ] `framer-motion` appears in package.json dependencies
- [ ] `bun run build` passes
- [ ] No import errors

## Test Commands
```bash
bun run build
bun test:run
```

## Notes
- Keep `motion` package as well (may be used for other features)
- The framer-motion version should be compatible with motion v12
