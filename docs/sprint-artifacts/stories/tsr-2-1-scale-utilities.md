# Story TSR-2-1: Create Scale Utilities

**Epic:** TSR-2 (Y-Axis Log Scale)
**Status:** drafted
**Priority:** High
**Estimation:** 2-3 hours

---

## User Story

**As a** developer,
**I want** utilities for logarithmic scale operations,
**So that** FLOP calculations are consistent across visualization components.

---

## Context

### Background

The current ScatterPlot uses a linear Y-axis with normalized 0-1 values (see `scatter-plot.tsx:247-252`). This fails to convey the actual scale of AI progress - training compute spans from 10^17 to 10^27 FLOP, representing 10 orders of magnitude.

This story creates the foundational utilities needed for logarithmic scale support:
- Scale creation functions using `@visx/scale`'s `scaleLog`
- Tick value constants for consistent labeling
- Formatting functions for scientific notation (superscript)
- Conversion helpers between log and linear values

### Epic Dependencies

- **Epic TSR-1 (Layout Foundation):** Complete - new layout accommodates wider left margin for Y-axis labels
- **Story TSR-2-2 (ai-metrics helpers):** Depends on this story's scale utilities

### Technical Context

**Current Implementation:**
```typescript
// scatter-plot.tsx:247-252 - Linear Y scale
const yScale = useMemo(() => {
  return scaleLinear({
    domain: [0, 1],
    range: [innerHeight, 0],
  })
}, [innerHeight])
```

**Target Implementation:**
```typescript
// Using new scale utilities
import { createLogYScale, LOG_TICK_VALUES } from '@/lib/utils/scales'

const yScale = useMemo(() => {
  return createLogYScale(innerHeight, [1e17, 1e27])
}, [innerHeight])
```

**Data Range:**
- Training compute data in `ai-metrics.ts` uses log10 values: 1.6 to 26.7
- Actual FLOP range: 10^1.6 (~40) to 10^26.7 (~5x10^26)
- Display tick range: 10^17 to 10^27 (relevant for modern AI era)

---

## Acceptance Criteria

### AC-1: LOG_TICK_VALUES Constant

**Given** the scales module is imported
**When** accessing `LOG_TICK_VALUES`
**Then** it exports an array of FLOP values at integer powers of 10:
```typescript
export const LOG_TICK_VALUES = [
  1e17, 1e18, 1e19, 1e20, 1e21, 1e22, 1e23, 1e24, 1e25, 1e26, 1e27
]
```

### AC-2: createLogYScale Function

**Given** `createLogYScale(height: number, domain: [number, number])`
**When** called with chart height and FLOP domain
**Then** returns a visx scaleLog configured for Y-axis:
- Domain: [minFlop, maxFlop] (actual FLOP values, not log)
- Range: [height, 0] (inverted for SVG coordinates)
- Base: 10

**Example:**
```typescript
const scale = createLogYScale(400, [1e17, 1e27])
scale(1e22) // returns ~200 (middle of 400px range)
scale.domain() // returns [1e17, 1e27]
```

### AC-3: formatFlopTick Function

**Given** `formatFlopTick(value: number)`
**When** called with a FLOP value
**Then** returns string with superscript notation

**Test cases:**
- `formatFlopTick(1e18)` returns `"10^18"` (superscript 18)
- `formatFlopTick(1e24)` returns `"10^24"` (superscript 24)
- `formatFlopTick(5e20)` returns `"10^21"` (rounded to nearest integer exponent)

### AC-4: toSuperscript Helper

**Given** `toSuperscript(n: number)`
**When** called with an integer
**Then** returns Unicode superscript string

**Test cases:**
- `toSuperscript(18)` returns `"^18"` (using Unicode chars)
- `toSuperscript(0)` returns `"^0"`
- `toSuperscript(27)` returns `"^27"`

### AC-5: Conversion Functions

**Given** conversion utilities
**When** converting between log and FLOP values
**Then** roundtrip correctly:

```typescript
// Log to FLOP
logToFlop(24) // returns 1e24 (10^24)
logToFlop(18.5) // returns ~3.16e18

// FLOP to Log
flopToLog(1e24) // returns 24
flopToLog(3.16e18) // returns ~18.5

// Roundtrip
flopToLog(logToFlop(23.5)) // returns 23.5
```

### AC-6: Edge Case Handling

**Given** scale utilities
**When** handling edge cases
**Then** behaves correctly:

- **Zero value:** `flopToLog(0)` returns `-Infinity` (caller should guard)
- **Negative value:** `flopToLog(-1)` returns `NaN` (caller should guard)
- **Very small value:** `logToFlop(1)` returns 10 (valid)
- **Very large value:** `logToFlop(30)` returns 1e30 (valid)

---

## Technical Implementation

### Files to Create

```
src/lib/utils/scales.ts        # Main scale utilities
tests/unit/lib/utils/scales.test.ts  # Comprehensive tests
```

### Implementation Guide

**src/lib/utils/scales.ts:**

```typescript
import { scaleLog } from '@visx/scale'

/**
 * Standard tick values for FLOP Y-axis (10^17 to 10^27)
 * Covers the range relevant for modern AI training compute
 */
export const LOG_TICK_VALUES = [
  1e17, 1e18, 1e19, 1e20, 1e21, 1e22, 1e23, 1e24, 1e25, 1e26, 1e27,
] as const

/**
 * Create logarithmic Y-scale for FLOP values
 * @param height - Chart inner height in pixels
 * @param domain - [minFlop, maxFlop] actual FLOP values (not log)
 * @returns visx ScaleLog configured for Y-axis rendering
 */
export function createLogYScale(height: number, domain: [number, number]) {
  return scaleLog({
    domain,
    range: [height, 0], // Inverted: high FLOP at top (y=0)
    base: 10,
  })
}

/**
 * Unicode superscript characters for digits 0-9
 */
const SUPERSCRIPTS = '\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079'

/**
 * Convert integer to Unicode superscript string
 * @param n - Integer to convert
 * @returns String with superscript digits
 */
export function toSuperscript(n: number): string {
  const str = String(Math.abs(Math.round(n)))
  const prefix = n < 0 ? '\u207b' : '' // Superscript minus
  return prefix + str.split('').map(d => SUPERSCRIPTS[parseInt(d)]).join('')
}

/**
 * Format FLOP value as tick label with superscript notation
 * @param value - FLOP value (e.g., 1e24)
 * @returns Formatted string (e.g., "10^24" with superscript)
 */
export function formatFlopTick(value: number): string {
  const exp = Math.round(Math.log10(value))
  return `10${toSuperscript(exp)}`
}

/**
 * Convert log10 value to actual FLOP
 * @param logValue - Log base 10 of FLOP (e.g., 24 for 10^24)
 * @returns Actual FLOP value
 */
export function logToFlop(logValue: number): number {
  return Math.pow(10, logValue)
}

/**
 * Convert actual FLOP to log10 value
 * @param flop - Actual FLOP value
 * @returns Log base 10 of FLOP
 * @note Returns -Infinity for 0, NaN for negative values
 */
export function flopToLog(flop: number): number {
  return Math.log10(flop)
}

/**
 * Filter LOG_TICK_VALUES to only those within a domain
 * Useful for rendering only visible axis ticks
 * @param domain - [min, max] FLOP values
 * @returns Filtered tick values within domain
 */
export function getVisibleTickValues(domain: [number, number]): number[] {
  return LOG_TICK_VALUES.filter(v => v >= domain[0] && v <= domain[1])
}
```

### Test Coverage Requirements

**tests/unit/lib/utils/scales.test.ts:**

```typescript
import { describe, it, expect } from 'vitest'
import {
  LOG_TICK_VALUES,
  createLogYScale,
  formatFlopTick,
  toSuperscript,
  logToFlop,
  flopToLog,
  getVisibleTickValues,
} from '@/lib/utils/scales'

describe('LOG_TICK_VALUES', () => {
  it('contains 11 values from 1e17 to 1e27', () => {
    expect(LOG_TICK_VALUES).toHaveLength(11)
    expect(LOG_TICK_VALUES[0]).toBe(1e17)
    expect(LOG_TICK_VALUES[10]).toBe(1e27)
  })

  it('values are powers of 10', () => {
    LOG_TICK_VALUES.forEach((val, i) => {
      expect(val).toBe(Math.pow(10, 17 + i))
    })
  })
})

describe('createLogYScale', () => {
  it('creates scale with correct domain and range', () => {
    const scale = createLogYScale(400, [1e17, 1e27])
    expect(scale.domain()).toEqual([1e17, 1e27])
    expect(scale.range()).toEqual([400, 0])
  })

  it('maps values correctly on log scale', () => {
    const scale = createLogYScale(400, [1e17, 1e27])
    // Middle of domain (1e22) should map to middle of range
    const midValue = 1e22
    const result = scale(midValue)
    expect(result).toBeCloseTo(200, 0) // ~200px
  })

  it('handles different heights', () => {
    const scale = createLogYScale(800, [1e17, 1e27])
    expect(scale.range()).toEqual([800, 0])
  })
})

describe('toSuperscript', () => {
  it('converts single digits', () => {
    expect(toSuperscript(0)).toBe('\u2070')
    expect(toSuperscript(1)).toBe('\u00b9')
    expect(toSuperscript(2)).toBe('\u00b2')
  })

  it('converts multi-digit numbers', () => {
    expect(toSuperscript(18)).toContain('\u00b9')
    expect(toSuperscript(24)).toContain('\u00b2')
  })

  it('handles negative numbers', () => {
    const result = toSuperscript(-5)
    expect(result).toContain('\u207b') // superscript minus
  })
})

describe('formatFlopTick', () => {
  it('formats power of 10 values', () => {
    expect(formatFlopTick(1e18)).toContain('10')
    expect(formatFlopTick(1e24)).toContain('10')
  })

  it('rounds to nearest integer exponent', () => {
    // 5e20 is between 10^20 and 10^21, closer to 10^21
    const result = formatFlopTick(5e20)
    expect(result).toContain('10')
  })
})

describe('logToFlop', () => {
  it('converts log values to FLOP', () => {
    expect(logToFlop(24)).toBe(1e24)
    expect(logToFlop(18)).toBe(1e18)
    expect(logToFlop(0)).toBe(1)
  })

  it('handles decimal exponents', () => {
    expect(logToFlop(18.5)).toBeCloseTo(3.16e18, -17)
  })
})

describe('flopToLog', () => {
  it('converts FLOP values to log', () => {
    expect(flopToLog(1e24)).toBe(24)
    expect(flopToLog(1e18)).toBe(18)
    expect(flopToLog(1)).toBe(0)
  })

  it('roundtrips correctly', () => {
    expect(flopToLog(logToFlop(23.5))).toBeCloseTo(23.5)
  })

  it('returns -Infinity for zero', () => {
    expect(flopToLog(0)).toBe(-Infinity)
  })

  it('returns NaN for negative values', () => {
    expect(flopToLog(-1)).toBeNaN()
  })
})

describe('getVisibleTickValues', () => {
  it('filters ticks within domain', () => {
    const ticks = getVisibleTickValues([1e20, 1e24])
    expect(ticks).toEqual([1e20, 1e21, 1e22, 1e23, 1e24])
  })

  it('returns empty for out-of-range domain', () => {
    const ticks = getVisibleTickValues([1e10, 1e15])
    expect(ticks).toEqual([])
  })

  it('includes boundary values', () => {
    const ticks = getVisibleTickValues([1e18, 1e20])
    expect(ticks).toContain(1e18)
    expect(ticks).toContain(1e20)
  })
})
```

---

## Tasks

### Task 1: Create scales.ts Module
- [ ] Create `src/lib/utils/scales.ts`
- [ ] Implement `LOG_TICK_VALUES` constant
- [ ] Implement `createLogYScale` function
- [ ] Implement `toSuperscript` helper
- [ ] Implement `formatFlopTick` function
- [ ] Implement `logToFlop` function
- [ ] Implement `flopToLog` function
- [ ] Implement `getVisibleTickValues` helper
- [ ] Add JSDoc comments for all exports

### Task 2: Create Test Suite
- [ ] Create `tests/unit/lib/utils/scales.test.ts`
- [ ] Test `LOG_TICK_VALUES` structure and values
- [ ] Test `createLogYScale` domain/range/mapping
- [ ] Test `toSuperscript` for all digits and negative numbers
- [ ] Test `formatFlopTick` formatting
- [ ] Test `logToFlop` conversions
- [ ] Test `flopToLog` conversions and edge cases
- [ ] Test `getVisibleTickValues` filtering
- [ ] Verify all tests pass: `bun vitest tests/unit/lib/utils/scales.test.ts`

### Task 3: Integration Verification
- [ ] Verify module exports correctly via barrel file if needed
- [ ] Verify @visx/scale scaleLog is available (already installed)
- [ ] Run full test suite: `bun test:run`

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] All tasks completed
- [ ] Tests pass: `bun vitest tests/unit/lib/utils/scales.test.ts`
- [ ] No TypeScript errors: `bun run lint`
- [ ] Code reviewed for correctness
- [ ] Ready for Story TSR-2-2 (ai-metrics helpers) to build upon

---

## Notes

### Unicode Superscript Characters

The superscript characters used for tick labels:
- `^0` = `\u2070`
- `^1` = `\u00b9`
- `^2` = `\u00b2`
- `^3` = `\u00b3`
- `^4-9` = `\u2074` - `\u2079`
- `^-` = `\u207b` (superscript minus)

These render correctly in modern browsers and provide better visual appearance than using `<sup>` tags in SVG text elements.

### Why Not Start at 10^0?

The `LOG_TICK_VALUES` starts at 10^17 because:
1. Early AI models (1950s-1980s) used 10^1 to 10^13 FLOP
2. The 10^17+ range covers the deep learning era (2010+)
3. This aligns with the tech spec's 2010-2025 default focus
4. Domain can be dynamically adjusted for historical views

### Visx ScaleLog Behavior

The `@visx/scale` `scaleLog` function wraps D3's log scale. Key behaviors:
- Does NOT handle zero or negative values (will throw or return NaN)
- Callers must ensure domain values are positive
- The `base: 10` ensures log10 behavior
