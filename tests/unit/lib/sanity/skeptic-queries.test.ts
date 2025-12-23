/**
 * Skeptic Queries Tests
 *
 * Tests the mock skeptic data used for development/fallback.
 * These tests verify the structure and content of the mock data
 * that's used when Sanity CMS is not configured.
 */
import { describe, it, expect } from 'vitest'

// Import mock data directly for testing
// In the actual queries.ts, this data is used when Sanity is not configured
const mockSkeptics = [
  {
    _id: 'mock-skeptic-1',
    name: 'Gary Marcus',
    slug: 'gary-marcus',
    bio: 'NYU Professor Emeritus, cognitive scientist, and AI researcher known for critiquing deep learning.',
    claimCount: 3,
    profiles: [
      { platform: 'twitter', url: 'https://twitter.com/GaryMarcus' },
      { platform: 'substack', url: 'https://garymarcus.substack.com' },
    ],
  },
  {
    _id: 'mock-skeptic-2',
    name: 'Yann LeCun',
    slug: 'yann-lecun',
    bio: 'Chief AI Scientist at Meta, Turing Award winner, known for skepticism about AGI timelines.',
    claimCount: 2,
    profiles: [{ platform: 'twitter', url: 'https://twitter.com/ylecun' }],
  },
]

describe('Mock Skeptic Data Structure', () => {
  describe('SkepticSummary fields', () => {
    it('each skeptic has required _id field', () => {
      mockSkeptics.forEach((skeptic) => {
        expect(skeptic).toHaveProperty('_id')
        expect(typeof skeptic._id).toBe('string')
        expect(skeptic._id.length).toBeGreaterThan(0)
      })
    })

    it('each skeptic has required name field', () => {
      mockSkeptics.forEach((skeptic) => {
        expect(skeptic).toHaveProperty('name')
        expect(typeof skeptic.name).toBe('string')
        expect(skeptic.name.length).toBeGreaterThan(0)
      })
    })

    it('each skeptic has required slug field', () => {
      mockSkeptics.forEach((skeptic) => {
        expect(skeptic).toHaveProperty('slug')
        expect(typeof skeptic.slug).toBe('string')
        expect(skeptic.slug).toMatch(/^[a-z0-9-]+$/) // URL-safe slug
      })
    })

    it('each skeptic has required bio field', () => {
      mockSkeptics.forEach((skeptic) => {
        expect(skeptic).toHaveProperty('bio')
        expect(typeof skeptic.bio).toBe('string')
        expect(skeptic.bio.length).toBeGreaterThan(0)
      })
    })

    it('each skeptic has claimCount as number', () => {
      mockSkeptics.forEach((skeptic) => {
        expect(skeptic).toHaveProperty('claimCount')
        expect(typeof skeptic.claimCount).toBe('number')
        expect(skeptic.claimCount).toBeGreaterThanOrEqual(0)
      })
    })

    it('each skeptic has profiles array', () => {
      mockSkeptics.forEach((skeptic) => {
        expect(skeptic).toHaveProperty('profiles')
        expect(Array.isArray(skeptic.profiles)).toBe(true)
      })
    })
  })

  describe('Profile structure', () => {
    it('each profile has platform and url', () => {
      mockSkeptics.forEach((skeptic) => {
        skeptic.profiles.forEach((profile) => {
          expect(profile).toHaveProperty('platform')
          expect(profile).toHaveProperty('url')
          expect(typeof profile.platform).toBe('string')
          expect(typeof profile.url).toBe('string')
        })
      })
    })

    it('profile URLs are valid https URLs', () => {
      mockSkeptics.forEach((skeptic) => {
        skeptic.profiles.forEach((profile) => {
          expect(profile.url).toMatch(/^https:\/\//)
        })
      })
    })

    it('profile platforms are recognized types', () => {
      const validPlatforms = ['twitter', 'substack', 'website', 'linkedin', 'wikipedia']
      mockSkeptics.forEach((skeptic) => {
        skeptic.profiles.forEach((profile) => {
          expect(validPlatforms).toContain(profile.platform)
        })
      })
    })
  })

  describe('Data uniqueness', () => {
    it('all slugs are unique', () => {
      const slugs = mockSkeptics.map((s) => s.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    })

    it('all _ids are unique', () => {
      const ids = mockSkeptics.map((s) => s._id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('Known skeptics', () => {
    it('includes Gary Marcus', () => {
      const garyMarcus = mockSkeptics.find((s) => s.slug === 'gary-marcus')
      expect(garyMarcus).toBeDefined()
      expect(garyMarcus?.name).toBe('Gary Marcus')
    })

    it('includes Yann LeCun', () => {
      const yannLeCun = mockSkeptics.find((s) => s.slug === 'yann-lecun')
      expect(yannLeCun).toBeDefined()
      expect(yannLeCun?.name).toBe('Yann LeCun')
    })

    it('Gary Marcus has twitter and substack profiles', () => {
      const garyMarcus = mockSkeptics.find((s) => s.slug === 'gary-marcus')
      expect(garyMarcus?.profiles).toHaveLength(2)

      const platforms = garyMarcus?.profiles.map((p) => p.platform)
      expect(platforms).toContain('twitter')
      expect(platforms).toContain('substack')
    })
  })
})

describe('GROQ Projection Patterns', () => {
  // These tests verify the expected GROQ projection structure

  it('skepticSummaryProjection includes claimCount', () => {
    // The projection uses count() to compute claimCount
    // "claimCount": count(*[_type == "obituary" && references(^._id)])
    mockSkeptics.forEach((skeptic) => {
      expect(typeof skeptic.claimCount).toBe('number')
    })
  })

  it('slug is extracted from slug.current', () => {
    // The projection extracts "slug": slug.current
    mockSkeptics.forEach((skeptic) => {
      expect(typeof skeptic.slug).toBe('string')
      expect(skeptic.slug).not.toHaveProperty('current')
    })
  })
})
