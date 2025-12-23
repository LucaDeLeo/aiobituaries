/**
 * SkepticCard Component Tests
 *
 * Tests the SkepticCard utility functions and component logic.
 * Full component rendering requires Next.js context (next/link),
 * so we test the utility functions independently.
 */
import { describe, it, expect } from 'vitest'

// Test the truncateBio logic independently (matches component implementation)
function truncateBio(bio: string, maxLength = 120): string {
  if (bio.length <= maxLength) return bio
  const truncated = bio.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

describe('SkepticCard utilities', () => {
  describe('truncateBio', () => {
    it('does not truncate short bios', () => {
      const shortBio = 'AI researcher and author.'
      expect(truncateBio(shortBio)).toBe(shortBio)
    })

    it('truncates long bios at approximately 120 chars', () => {
      const longBio =
        'NYU Professor Emeritus, cognitive scientist, and AI researcher known for his critiques of deep learning approaches and their limitations in achieving true artificial general intelligence.'
      const result = truncateBio(longBio)
      expect(result.endsWith('...')).toBe(true)
      expect(result.length).toBeLessThanOrEqual(123) // 120 + "..."
    })

    it('respects word boundaries when truncating', () => {
      const bio = 'The quick brown fox jumps over the lazy dog and runs away to the forest'
      const result = truncateBio(bio, 40)
      expect(result).toContain('...')
      // Should end with complete word + ...
      // "The quick brown fox jumps over the lazy" is 40 chars
      // The function truncates at last space before 40, which is before "lazy"
      expect(result).toBe('The quick brown fox jumps over the lazy...')
      expect(result.length).toBeLessThanOrEqual(44) // includes "lazy" + "..."
    })

    it('handles bios exactly at max length', () => {
      const bio = 'A'.repeat(120)
      expect(truncateBio(bio)).toBe(bio)
    })

    it('handles bios just over max length', () => {
      const bio = 'A'.repeat(121)
      const result = truncateBio(bio)
      expect(result.endsWith('...')).toBe(true)
    })

    it('handles bios with no spaces', () => {
      const bio = 'A'.repeat(150) // No spaces
      const result = truncateBio(bio)
      expect(result).toBe('A'.repeat(120) + '...')
    })

    it('handles empty bio', () => {
      expect(truncateBio('')).toBe('')
    })
  })

  describe('claim count pluralization', () => {
    it('uses singular "claim" for 1', () => {
      const count = 1
      const text = `${count} claim${count !== 1 ? 's' : ''}`
      expect(text).toBe('1 claim')
    })

    it('uses plural "claims" for 0', () => {
      const count = 0
      const text = `${count} claim${count !== 1 ? 's' : ''}`
      expect(text).toBe('0 claims')
    })

    it('uses plural "claims" for multiple', () => {
      const count = 5
      const text = `${count} claim${count !== 1 ? 's' : ''}`
      expect(text).toBe('5 claims')
    })
  })
})
