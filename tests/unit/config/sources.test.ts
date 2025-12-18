import { describe, it, expect } from 'vitest'
import {
  PUBLICATION_TIERS,
  ALL_WHITELISTED_DOMAINS,
  NOTABLE_HANDLES,
  ALL_NOTABLE_HANDLES,
  NOTABILITY_CONFIG,
  AI_DOOM_KEYWORDS,
  EXCLUSION_PATTERNS,
} from '@/config/sources'

describe('sources config', () => {
  describe('PUBLICATION_TIERS', () => {
    it('tier1 contains major publications', () => {
      expect(PUBLICATION_TIERS.tier1).toContain('nytimes.com')
      expect(PUBLICATION_TIERS.tier1).toContain('wsj.com')
      expect(PUBLICATION_TIERS.tier1).toContain('bloomberg.com')
      expect(PUBLICATION_TIERS.tier1.length).toBeGreaterThanOrEqual(10)
    })

    it('tier2 contains tech-focused publications', () => {
      expect(PUBLICATION_TIERS.tier2).toContain('wired.com')
      expect(PUBLICATION_TIERS.tier2).toContain('techcrunch.com')
      expect(PUBLICATION_TIERS.tier2).toContain('arstechnica.com')
      expect(PUBLICATION_TIERS.tier2.length).toBeGreaterThanOrEqual(10)
    })
  })

  describe('ALL_WHITELISTED_DOMAINS', () => {
    it('combines all tiers', () => {
      expect(ALL_WHITELISTED_DOMAINS.length).toBe(
        PUBLICATION_TIERS.tier1.length + PUBLICATION_TIERS.tier2.length
      )
    })

    it('includes domains from both tiers', () => {
      expect(ALL_WHITELISTED_DOMAINS).toContain('nytimes.com')
      expect(ALL_WHITELISTED_DOMAINS).toContain('wired.com')
    })
  })

  describe('NOTABLE_HANDLES', () => {
    it('has categorized handles', () => {
      expect(NOTABLE_HANDLES.aiResearchers).toBeDefined()
      expect(NOTABLE_HANDLES.techExecs).toBeDefined()
      expect(NOTABLE_HANDLES.vcs).toBeDefined()
      expect(NOTABLE_HANDLES.journalists).toBeDefined()
      expect(NOTABLE_HANDLES.academics).toBeDefined()
    })

    it('aiResearchers contains known critics', () => {
      expect(NOTABLE_HANDLES.aiResearchers).toContain('GaryMarcus')
      expect(NOTABLE_HANDLES.aiResearchers).toContain('emilymbender')
    })

    it('handles do not have @ prefix', () => {
      for (const category of Object.values(NOTABLE_HANDLES)) {
        for (const handle of category) {
          expect(handle.startsWith('@')).toBe(false)
        }
      }
    })
  })

  describe('ALL_NOTABLE_HANDLES', () => {
    it('is a Set for O(1) lookup', () => {
      expect(ALL_NOTABLE_HANDLES).toBeInstanceOf(Set)
    })

    it('contains handles from all categories', () => {
      expect(ALL_NOTABLE_HANDLES.has('GaryMarcus')).toBe(true)
      expect(ALL_NOTABLE_HANDLES.has('paulg')).toBe(true)
    })
  })

  describe('NOTABILITY_CONFIG', () => {
    it('has required fields', () => {
      expect(NOTABILITY_CONFIG.minFollowers).toBeDefined()
      expect(NOTABILITY_CONFIG.bioKeywords).toBeDefined()
      expect(NOTABILITY_CONFIG.verifiedMinFollowers).toBeDefined()
    })

    it('minFollowers is a reasonable threshold', () => {
      expect(NOTABILITY_CONFIG.minFollowers).toBeGreaterThanOrEqual(10000)
      expect(NOTABILITY_CONFIG.minFollowers).toBeLessThanOrEqual(100000)
    })

    it('verifiedMinFollowers is lower than minFollowers', () => {
      expect(NOTABILITY_CONFIG.verifiedMinFollowers).toBeLessThan(
        NOTABILITY_CONFIG.minFollowers
      )
    })

    it('bioKeywords matches relevant terms', () => {
      const regex = NOTABILITY_CONFIG.bioKeywords
      expect(regex.test('AI researcher')).toBe(true)
      expect(regex.test('Machine Learning PhD')).toBe(true)
      expect(regex.test('CEO at startup')).toBe(true)
      expect(regex.test('just a random person')).toBe(false)
    })
  })

  describe('AI_DOOM_KEYWORDS', () => {
    it('contains search keywords', () => {
      expect(AI_DOOM_KEYWORDS.length).toBeGreaterThan(0)
    })

    it('includes capability skepticism keywords', () => {
      expect(AI_DOOM_KEYWORDS.some((k) => k.includes('never'))).toBe(true)
      expect(AI_DOOM_KEYWORDS.some((k) => k.includes('cannot'))).toBe(true)
    })

    it('includes market skepticism keywords', () => {
      expect(AI_DOOM_KEYWORDS.some((k) => k.includes('bubble'))).toBe(true)
    })
  })

  describe('EXCLUSION_PATTERNS', () => {
    it('contains regex patterns', () => {
      expect(EXCLUSION_PATTERNS.length).toBeGreaterThan(0)
      expect(EXCLUSION_PATTERNS[0]).toBeInstanceOf(RegExp)
    })

    it('matches spam content', () => {
      const spam = 'Click here to buy now!'
      expect(EXCLUSION_PATTERNS.some((p) => p.test(spam))).toBe(true)
    })

    it('does not match legitimate content', () => {
      // Must be > 50 chars to pass the length check
      const legitimate =
        'AI will never achieve true general intelligence - it is fundamentally limited by current architectures'
      expect(EXCLUSION_PATTERNS.some((p) => p.test(legitimate))).toBe(false)
    })
  })
})
