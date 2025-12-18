# Step 06: Add Reduced Motion Support to Filters

## Objective
Make category filter animations respect the `prefers-reduced-motion` preference.

## Problem
- `category-filter.tsx` has entrance animation without reduced motion check
- `category-pill.tsx` has hover/tap animations without reduced motion check
- Other components (tooltip-card, obituary-modal) already use `useReducedMotion`

## Files to Modify

### 1. src/components/filters/category-filter.tsx

**Add import:**
```typescript
import { motion, useReducedMotion } from 'framer-motion'
```
(Update existing import from just `motion`)

**Add hook call inside component (after other hooks):**
```typescript
const shouldReduceMotion = useReducedMotion()
```

**Update motion.div props (around line 117-119):**

**Before:**
```typescript
<motion.div
  // ...
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.3, duration: 0.3 }}
  // ...
>
```

**After:**
```typescript
<motion.div
  // ...
  initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
  animate={shouldReduceMotion ? false : { y: 0, opacity: 1 }}
  transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3, duration: 0.3 }}
  // ...
>
```

### 2. src/components/filters/category-pill.tsx

**Add import:**
```typescript
import { motion, useReducedMotion } from 'framer-motion'
```

**Add hook call inside component:**
```typescript
const shouldReduceMotion = useReducedMotion()
```

**Update motion.button props (around lines 57-58):**

**Before:**
```typescript
<motion.button
  // ...
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

**After:**
```typescript
<motion.button
  // ...
  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
>
```

## Acceptance Criteria

- [ ] `useReducedMotion` imported and used in both components
- [ ] Entrance animation disabled when reduced motion preferred
- [ ] Hover/tap animations disabled when reduced motion preferred
- [ ] Build passes
- [ ] No visual regressions for users without reduced motion preference

## Test Commands
```bash
bun run build
bun vitest run tests/unit/components/filters/
```

## Testing Reduced Motion
To test manually:
1. Enable "Reduce motion" in OS accessibility settings
2. Or use Chrome DevTools > Rendering > Emulate CSS media feature `prefers-reduced-motion: reduce`
3. Verify filter bar appears instantly without slide animation
4. Verify pills don't scale on hover/tap

## Notes
- This is an accessibility improvement (WCAG 2.1 Success Criterion 2.3.3)
- Pattern matches existing implementations in tooltip-card and obituary-modal
