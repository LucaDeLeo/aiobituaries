import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { DiscoveryCandidate } from '@/types/discovery'

// Mock the Exa client module
vi.mock('@/lib/exa/client', () => ({
  getExaClient: vi.fn(),
}))

// Import after mock
import { getExaClient } from '@/lib/exa/client'
import { searchTweets, searchNews, discoverCandidates } from '@/lib/exa/queries'

// Mock Exa client instance
const mockSearchAndContents = vi.fn()
const mockClient = {
  searchAndContents: mockSearchAndContents,
}

describe('exa/queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getExaClient).mockReturnValue(mockClient as never)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('searchTweets', () => {
    it('returns empty array when client not configured', async () => {
      vi.mocked(getExaClient).mockReturnValue(null)

      const result = await searchTweets(new Date())

      expect(result).toEqual([])
      expect(mockSearchAndContents).not.toHaveBeenCalled()
    })

    it('calls Exa with tweet category', async () => {
      mockSearchAndContents.mockResolvedValue({ results: [] })
      const since = new Date('2024-01-01')

      await searchTweets(since)

      expect(mockSearchAndContents).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          category: 'tweet',
          startPublishedDate: since.toISOString(),
          numResults: 50,
          text: true,
        })
      )
    })

    it('transforms results to candidates', async () => {
      mockSearchAndContents.mockResolvedValue({
        results: [
          {
            url: 'https://twitter.com/GaryMarcus/status/123',
            title: 'Test Tweet',
            text: 'AI will never achieve true creativity',
            publishedDate: '2024-01-15T12:00:00Z',
            author: 'Gary Marcus',
            score: 0.95,
          },
        ],
      })

      const result = await searchTweets(new Date())

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        url: 'https://twitter.com/GaryMarcus/status/123',
        title: 'Test Tweet',
        text: 'AI will never achieve true creativity',
        sourceType: 'tweet',
        author: {
          name: 'Gary Marcus',
          handle: 'GaryMarcus',
        },
      })
    })

    it('extracts handle from twitter URL', async () => {
      mockSearchAndContents.mockResolvedValue({
        results: [
          {
            url: 'https://x.com/someuser/status/456',
            title: 'Test',
            author: 'Some User',
          },
        ],
      })

      const result = await searchTweets(new Date())

      expect(result[0].author?.handle).toBe('someuser')
    })

    it('handles API errors gracefully', async () => {
      mockSearchAndContents.mockRejectedValue(new Error('API Error'))

      const result = await searchTweets(new Date())

      expect(result).toEqual([])
    })
  })

  describe('searchNews', () => {
    it('returns empty array when client not configured', async () => {
      vi.mocked(getExaClient).mockReturnValue(null)

      const result = await searchNews(new Date())

      expect(result).toEqual([])
    })

    it('calls Exa with news category and whitelisted domains', async () => {
      mockSearchAndContents.mockResolvedValue({ results: [] })
      const since = new Date('2024-01-01')

      await searchNews(since)

      expect(mockSearchAndContents).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          category: 'news',
          includeDomains: expect.arrayContaining(['nytimes.com', 'wired.com']),
          startPublishedDate: since.toISOString(),
          numResults: 50,
          text: true,
        })
      )
    })

    it('transforms news results to candidates', async () => {
      mockSearchAndContents.mockResolvedValue({
        results: [
          {
            url: 'https://wired.com/story/ai-doom',
            title: 'AI Doom Article',
            text: 'The AI bubble is about to burst',
            publishedDate: '2024-01-20T10:00:00Z',
          },
        ],
      })

      const result = await searchNews(new Date())

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        url: 'https://wired.com/story/ai-doom',
        sourceType: 'news',
      })
    })
  })

  describe('discoverCandidates', () => {
    it('combines results from tweets and news', async () => {
      // Setup separate responses
      mockSearchAndContents
        .mockResolvedValueOnce({
          results: [
            { url: 'https://twitter.com/user/1', title: 'Tweet', text: 'Tweet content' },
          ],
        })
        .mockResolvedValueOnce({
          results: [
            { url: 'https://wired.com/article', title: 'News', text: 'News content' },
          ],
        })

      const result = await discoverCandidates(new Date())

      expect(result).toHaveLength(2)
      expect(result.find((c) => c.sourceType === 'tweet')).toBeDefined()
      expect(result.find((c) => c.sourceType === 'news')).toBeDefined()
    })

    it('returns empty array when both searches fail', async () => {
      vi.mocked(getExaClient).mockReturnValue(null)

      const result = await discoverCandidates(new Date())

      expect(result).toEqual([])
    })
  })
})
