import { describe, it, expect } from 'vitest'
import { hashToJitter, getCategoryColor } from '@/lib/utils/scatter-helpers'

describe('hashToJitter', () => {
  it('produces deterministic output for same input', () => {
    expect(hashToJitter('abc')).toBe(hashToJitter('abc'))
  })

  it('produces different values for different inputs', () => {
    expect(hashToJitter('abc')).not.toBe(hashToJitter('xyz'))
  })

  it('returns value between 0 and 1', () => {
    const result = hashToJitter('test-id')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('handles empty string', () => {
    const result = hashToJitter('')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('handles long strings', () => {
    const result = hashToJitter('very-long-id-string-that-goes-on-and-on')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('distributes values across the range', () => {
    // Test that different IDs produce varied results
    const ids = ['id-1', 'id-2', 'id-3', 'id-4', 'id-5']
    const results = ids.map(hashToJitter)
    const uniqueResults = new Set(results)
    // Should have at least some variation
    expect(uniqueResults.size).toBeGreaterThan(1)
  })
})

describe('getCategoryColor', () => {
  it('returns gold for capability', () => {
    expect(getCategoryColor(['capability'])).toBe('#C9A962')
  })

  it('returns sage for market', () => {
    expect(getCategoryColor(['market'])).toBe('#7B9E89')
  })

  it('returns rose for agi', () => {
    expect(getCategoryColor(['agi'])).toBe('#9E7B7B')
  })

  it('returns lavender for dismissive', () => {
    expect(getCategoryColor(['dismissive'])).toBe('#7B7B9E')
  })

  it('returns first category color for multiple categories', () => {
    expect(getCategoryColor(['market', 'capability'])).toBe('#7B9E89')
  })

  it('returns capability color as default for empty array', () => {
    expect(getCategoryColor([])).toBe('#C9A962')
  })
})

// CATEGORY_HEX_COLORS was moved to categories.ts - colors now derived from there
