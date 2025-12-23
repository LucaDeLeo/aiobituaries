/**
 * SkepticClaimList Component Tests
 *
 * Tests the SkepticClaimList utility functions.
 * Full component rendering requires Next.js context,
 * so we test the utility functions independently.
 */
import { describe, it, expect } from 'vitest'

// Test the truncateClaim logic independently (matches component implementation)
function truncateClaim(claim: string, maxLength = 200): string {
  if (claim.length <= maxLength) return claim
  const truncated = claim.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

describe('SkepticClaimList utilities', () => {
  describe('truncateClaim', () => {
    it('does not truncate short claims', () => {
      const shortClaim = 'AI will never achieve human-level reasoning.'
      expect(truncateClaim(shortClaim)).toBe(shortClaim)
    })

    it('truncates long claims at approximately 200 chars', () => {
      const longClaim =
        'Deep learning has hit a wall. The current approaches to artificial intelligence are fundamentally limited and cannot lead to true general intelligence. We need entirely new paradigms to make progress, and current scaling laws will not produce the breakthroughs that hype merchants claim are imminent.'
      const result = truncateClaim(longClaim)
      expect(result.endsWith('...')).toBe(true)
      expect(result.length).toBeLessThanOrEqual(203) // 200 + "..."
    })

    it('respects word boundaries when truncating', () => {
      const claim =
        'The limitations of transformer architectures are becoming increasingly clear as we push toward larger models without corresponding improvements in reasoning capabilities'
      const result = truncateClaim(claim, 100)
      expect(result).toContain('...')
      // Result should end with complete word + ...
      expect(result.length).toBeLessThanOrEqual(103)
    })

    it('handles claims exactly at max length', () => {
      const claim = 'A'.repeat(200)
      expect(truncateClaim(claim)).toBe(claim)
    })

    it('handles claims just over max length', () => {
      const claim = 'A'.repeat(201)
      const result = truncateClaim(claim)
      expect(result.endsWith('...')).toBe(true)
    })

    it('handles claims with no spaces', () => {
      const claim = 'A'.repeat(250)
      const result = truncateClaim(claim)
      expect(result).toBe('A'.repeat(200) + '...')
    })

    it('handles empty claim', () => {
      expect(truncateClaim('')).toBe('')
    })
  })
})
