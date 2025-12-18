import { describe, it, expect } from 'vitest'
import {
  isWhitelistedHandle,
  isWhitelistedPublication,
  extractDomain,
  passesNotabilityHeuristics,
  passesContentQuality,
  passesQualityGates,
  filterCandidates,
} from '@/lib/discovery/quality-filter'
import type { DiscoveryCandidate, AuthorMetadata } from '@/types/discovery'

describe('quality-filter', () => {
  describe('isWhitelistedHandle', () => {
    it('returns true for whitelisted handle', () => {
      expect(isWhitelistedHandle('GaryMarcus')).toBe(true)
    })

    it('is case insensitive', () => {
      expect(isWhitelistedHandle('garymarcus')).toBe(true)
      expect(isWhitelistedHandle('GARYMARCUS')).toBe(true)
    })

    it('handles @ prefix', () => {
      expect(isWhitelistedHandle('@GaryMarcus')).toBe(true)
    })

    it('returns false for unknown handle', () => {
      expect(isWhitelistedHandle('random_user_123')).toBe(false)
    })
  })

  describe('isWhitelistedPublication', () => {
    it('returns true for tier1 publication', () => {
      expect(isWhitelistedPublication('https://nytimes.com/article')).toBe(true)
    })

    it('returns true for tier2 publication', () => {
      expect(isWhitelistedPublication('https://wired.com/story/test')).toBe(true)
    })

    it('handles www prefix', () => {
      expect(isWhitelistedPublication('https://www.bloomberg.com/news')).toBe(true)
    })

    it('returns false for non-whitelisted domain', () => {
      expect(isWhitelistedPublication('https://sketchy-blog.xyz/post')).toBe(false)
    })

    it('returns false for invalid URL', () => {
      expect(isWhitelistedPublication('not a url')).toBe(false)
    })
  })

  describe('extractDomain', () => {
    it('extracts domain from URL', () => {
      expect(extractDomain('https://wired.com/story/ai')).toBe('wired.com')
    })

    it('removes www prefix', () => {
      expect(extractDomain('https://www.nytimes.com/article')).toBe('nytimes.com')
    })

    it('returns null for invalid URL', () => {
      expect(extractDomain('not a url')).toBeNull()
    })
  })

  describe('passesNotabilityHeuristics', () => {
    it('returns true for verified account with sufficient followers', () => {
      const author: AuthorMetadata = {
        name: 'Test User',
        followers: 15000,
        verified: true,
      }
      expect(passesNotabilityHeuristics(author)).toBe(true)
    })

    it('returns true for high follower count', () => {
      const author: AuthorMetadata = {
        name: 'Popular User',
        followers: 50000,
      }
      expect(passesNotabilityHeuristics(author)).toBe(true)
    })

    it('returns true for relevant bio with moderate followers', () => {
      const author: AuthorMetadata = {
        name: 'AI Researcher',
        bio: 'AI researcher at Stanford',
        followers: 15000,
      }
      expect(passesNotabilityHeuristics(author)).toBe(true)
    })

    it('returns false for low follower count with no bio', () => {
      const author: AuthorMetadata = {
        name: 'Random Person',
        followers: 500,
      }
      expect(passesNotabilityHeuristics(author)).toBe(false)
    })

    it('returns false for no follower data', () => {
      const author: AuthorMetadata = {
        name: 'Unknown',
      }
      expect(passesNotabilityHeuristics(author)).toBe(false)
    })
  })

  describe('passesContentQuality', () => {
    it('returns true for substantive content', () => {
      const candidate: DiscoveryCandidate = {
        url: 'https://example.com',
        title: 'Test',
        text: 'AI will never achieve true general intelligence because of fundamental limitations in current architectures.',
        publishedDate: '2024-01-01',
        sourceType: 'news',
      }
      expect(passesContentQuality(candidate)).toBe(true)
    })

    it('returns false for too short content', () => {
      const candidate: DiscoveryCandidate = {
        url: 'https://example.com',
        title: 'Short',
        text: 'AI bad.',
        publishedDate: '2024-01-01',
        sourceType: 'news',
      }
      expect(passesContentQuality(candidate)).toBe(false)
    })

    it('returns false for spam content', () => {
      const candidate: DiscoveryCandidate = {
        url: 'https://example.com',
        title: 'Clickbait',
        text: 'Click here to see why AI is doomed! Subscribe now for more content!',
        publishedDate: '2024-01-01',
        sourceType: 'news',
      }
      expect(passesContentQuality(candidate)).toBe(false)
    })

    it('falls back to title if text is empty', () => {
      const candidate: DiscoveryCandidate = {
        url: 'https://example.com',
        title: 'A substantive title about AI limitations that is long enough to pass quality checks',
        text: '',
        publishedDate: '2024-01-01',
        sourceType: 'news',
      }
      expect(passesContentQuality(candidate)).toBe(true)
    })
  })

  describe('passesQualityGates', () => {
    it('passes news from whitelisted publication', () => {
      const candidate: DiscoveryCandidate = {
        url: 'https://wired.com/story/ai-doom',
        title: 'AI Doom',
        text: 'The AI bubble is about to burst according to experts who have analyzed the market thoroughly.',
        publishedDate: '2024-01-01',
        sourceType: 'news',
      }
      expect(passesQualityGates(candidate)).toBe(true)
    })

    it('fails news from non-whitelisted publication', () => {
      const candidate: DiscoveryCandidate = {
        url: 'https://random-blog.xyz/ai-doom',
        title: 'AI Doom',
        text: 'The AI bubble is about to burst according to experts who have analyzed the market thoroughly.',
        publishedDate: '2024-01-01',
        sourceType: 'news',
      }
      expect(passesQualityGates(candidate)).toBe(false)
    })

    it('passes tweet from whitelisted handle', () => {
      const candidate: DiscoveryCandidate = {
        url: 'https://twitter.com/GaryMarcus/status/123',
        title: 'Tweet',
        text: 'AI will never achieve true creativity - it fundamentally lacks the ability to innovate.',
        publishedDate: '2024-01-01',
        sourceType: 'tweet',
        author: {
          name: 'Gary Marcus',
          handle: 'GaryMarcus',
        },
      }
      expect(passesQualityGates(candidate)).toBe(true)
    })

    it('passes tweet from notable non-whitelisted account', () => {
      const candidate: DiscoveryCandidate = {
        url: 'https://twitter.com/someone/status/123',
        title: 'Tweet',
        text: 'AI will never achieve true creativity - it fundamentally lacks the ability to innovate.',
        publishedDate: '2024-01-01',
        sourceType: 'tweet',
        author: {
          name: 'Notable Person',
          handle: 'someone',
          followers: 100000,
          verified: true,
        },
      }
      expect(passesQualityGates(candidate)).toBe(true)
    })

    it('fails tweet from non-notable unknown account', () => {
      const candidate: DiscoveryCandidate = {
        url: 'https://twitter.com/random/status/123',
        title: 'Tweet',
        text: 'AI will never achieve true creativity - it fundamentally lacks the ability to innovate.',
        publishedDate: '2024-01-01',
        sourceType: 'tweet',
        author: {
          name: 'Random Person',
          handle: 'random',
          followers: 100,
        },
      }
      expect(passesQualityGates(candidate)).toBe(false)
    })
  })

  describe('filterCandidates', () => {
    it('filters out low quality candidates', () => {
      const candidates: DiscoveryCandidate[] = [
        {
          url: 'https://wired.com/story/ai',
          title: 'Good Article',
          text: 'A substantive article about AI limitations with detailed analysis and expert opinions.',
          publishedDate: '2024-01-01',
          sourceType: 'news',
        },
        {
          url: 'https://random.xyz/spam',
          title: 'Spam',
          text: 'Click here! Subscribe now!',
          publishedDate: '2024-01-01',
          sourceType: 'news',
        },
        {
          url: 'https://twitter.com/GaryMarcus/1',
          title: 'Good Tweet',
          text: 'A thoughtful critique of AI capabilities with specific examples and reasoning.',
          publishedDate: '2024-01-01',
          sourceType: 'tweet',
          author: { name: 'Gary Marcus', handle: 'GaryMarcus' },
        },
        {
          url: 'https://twitter.com/random/2',
          title: 'Random Tweet',
          text: 'Random thoughts about AI from someone nobody knows and has no expertise.',
          publishedDate: '2024-01-01',
          sourceType: 'tweet',
          author: { name: 'Random', handle: 'random', followers: 50 },
        },
      ]

      const filtered = filterCandidates(candidates)

      expect(filtered).toHaveLength(2)
      expect(filtered.map((c) => c.url)).toContain('https://wired.com/story/ai')
      expect(filtered.map((c) => c.url)).toContain('https://twitter.com/GaryMarcus/1')
    })
  })
})
