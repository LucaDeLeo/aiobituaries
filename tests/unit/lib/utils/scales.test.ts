/**
 * Scale Utility Tests
 *
 * Tests for logarithmic scale utilities used in visualization.
 */
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
      // Compare log values to avoid floating point precision issues with large numbers
      expect(Math.log10(val)).toBeCloseTo(17 + i, 10)
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

  it('maps domain boundaries correctly', () => {
    const scale = createLogYScale(400, [1e17, 1e27])
    expect(scale(1e17)).toBeCloseTo(400) // Bottom
    expect(scale(1e27)).toBeCloseTo(0) // Top
  })
})

describe('toSuperscript', () => {
  it('converts single digits', () => {
    expect(toSuperscript(0)).toBe('\u2070')
    expect(toSuperscript(1)).toBe('\u00b9')
    expect(toSuperscript(2)).toBe('\u00b2')
    expect(toSuperscript(3)).toBe('\u00b3')
    expect(toSuperscript(4)).toBe('\u2074')
    expect(toSuperscript(5)).toBe('\u2075')
    expect(toSuperscript(6)).toBe('\u2076')
    expect(toSuperscript(7)).toBe('\u2077')
    expect(toSuperscript(8)).toBe('\u2078')
    expect(toSuperscript(9)).toBe('\u2079')
  })

  it('converts multi-digit numbers', () => {
    expect(toSuperscript(18)).toBe('\u00b9\u2078')
    expect(toSuperscript(24)).toBe('\u00b2\u2074')
    expect(toSuperscript(27)).toBe('\u00b2\u2077')
  })

  it('handles negative numbers', () => {
    const result = toSuperscript(-5)
    expect(result).toBe('\u207b\u2075') // superscript minus + 5
  })

  it('rounds decimal numbers', () => {
    expect(toSuperscript(18.4)).toBe('\u00b9\u2078') // rounds to 18
    expect(toSuperscript(18.6)).toBe('\u00b9\u2079') // rounds to 19
  })
})

describe('formatFlopTick', () => {
  it('formats power of 10 values', () => {
    expect(formatFlopTick(1e18)).toBe('10\u00b9\u2078')
    expect(formatFlopTick(1e24)).toBe('10\u00b2\u2074')
    expect(formatFlopTick(1e27)).toBe('10\u00b2\u2077')
  })

  it('rounds to nearest integer exponent', () => {
    // 5e20 is between 10^20 and 10^21, log10(5e20) ≈ 20.7, rounds to 21
    const result = formatFlopTick(5e20)
    expect(result).toBe('10\u00b2\u00b9')
  })

  it('handles exact powers of 10', () => {
    expect(formatFlopTick(1e17)).toBe('10\u00b9\u2077')
    expect(formatFlopTick(1e20)).toBe('10\u00b2\u2070')
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

  it('handles very small values', () => {
    expect(logToFlop(1)).toBe(10)
  })

  it('handles very large values', () => {
    expect(logToFlop(30)).toBe(1e30)
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
    expect(flopToLog(logToFlop(18.7))).toBeCloseTo(18.7)
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
    expect(ticks).toHaveLength(3) // 18, 19, 20
  })

  it('returns all ticks for full range', () => {
    const ticks = getVisibleTickValues([1e17, 1e27])
    expect(ticks).toHaveLength(11)
  })

  it('handles partial overlap at start', () => {
    const ticks = getVisibleTickValues([1e15, 1e19])
    expect(ticks).toEqual([1e17, 1e18, 1e19])
  })

  it('handles partial overlap at end', () => {
    const ticks = getVisibleTickValues([1e25, 1e30])
    expect(ticks).toEqual([1e25, 1e26, 1e27])
  })
})
