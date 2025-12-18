import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ObituaryDraft } from '@/types/discovery'

// Store original env
const originalEnv = process.env

// Mock functions
const mockCreate = vi.fn()
const mockFetch = vi.fn()

// Mock @sanity/client
vi.mock('@sanity/client', () => ({
  createClient: vi.fn(() => ({
    create: mockCreate,
    fetch: mockFetch,
  })),
}))

describe('sanity/mutations', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'test-project',
      NEXT_PUBLIC_SANITY_DATASET: 'test-dataset',
      SANITY_WRITE_TOKEN: 'test-token',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getSanityWriteClient', () => {
    it('returns client when configured', async () => {
      const { getSanityWriteClient } = await import('@/lib/sanity/mutations')
      const client = getSanityWriteClient()
      expect(client).not.toBeNull()
    })

    it('returns null when project ID is missing', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
      vi.resetModules()
      const { getSanityWriteClient } = await import('@/lib/sanity/mutations')
      const client = getSanityWriteClient()
      expect(client).toBeNull()
    })

    it('returns null when write token is missing', async () => {
      delete process.env.SANITY_WRITE_TOKEN
      vi.resetModules()
      const { getSanityWriteClient } = await import('@/lib/sanity/mutations')
      const client = getSanityWriteClient()
      expect(client).toBeNull()
    })

    it('returns null for placeholder project ID', async () => {
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'placeholder'
      vi.resetModules()
      const { getSanityWriteClient } = await import('@/lib/sanity/mutations')
      const client = getSanityWriteClient()
      expect(client).toBeNull()
    })
  })

  describe('isSanityWriteConfigured', () => {
    it('returns true when configured', async () => {
      const { isSanityWriteConfigured } = await import('@/lib/sanity/mutations')
      expect(isSanityWriteConfigured()).toBe(true)
    })

    it('returns false when not configured', async () => {
      delete process.env.SANITY_WRITE_TOKEN
      vi.resetModules()
      const { isSanityWriteConfigured } = await import('@/lib/sanity/mutations')
      expect(isSanityWriteConfigured()).toBe(false)
    })
  })

  describe('createObituaryDraft', () => {
    const mockDraft: ObituaryDraft = {
      _type: 'obituary',
      claim: 'AI will never achieve creativity',
      source: 'Test Publication',
      sourceUrl: 'https://example.com/article',
      date: '2024-01-15',
      categories: ['capability'],
      context: { currentModel: 'GPT-4' },
      slug: { _type: 'slug', current: 'ai-will-never-achieve-creativity' },
      discoveryMetadata: {
        discoveredAt: '2024-01-16T00:00:00Z',
        confidence: 0.9,
        notabilityReason: 'Major publication',
        sourceType: 'news',
      },
    }

    it('returns document ID on success', async () => {
      mockCreate.mockResolvedValue({ _id: 'created-doc-123' })

      const { createObituaryDraft } = await import('@/lib/sanity/mutations')
      const id = await createObituaryDraft(mockDraft)

      expect(id).toBe('created-doc-123')
      expect(mockCreate).toHaveBeenCalledWith(mockDraft)
    })

    it('returns null when client not configured', async () => {
      delete process.env.SANITY_WRITE_TOKEN
      vi.resetModules()

      const { createObituaryDraft } = await import('@/lib/sanity/mutations')
      const id = await createObituaryDraft(mockDraft)

      expect(id).toBeNull()
    })

    it('returns null on API error', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'))

      const { createObituaryDraft } = await import('@/lib/sanity/mutations')
      const id = await createObituaryDraft(mockDraft)

      expect(id).toBeNull()
    })
  })

  describe('createObituaryDrafts', () => {
    const mockDrafts: ObituaryDraft[] = [
      {
        _type: 'obituary',
        claim: 'Claim 1',
        source: 'Source 1',
        sourceUrl: 'https://example.com/1',
        date: '2024-01-15',
        categories: ['capability'],
        context: {},
        slug: { _type: 'slug', current: 'claim-1' },
        discoveryMetadata: {
          discoveredAt: '2024-01-16T00:00:00Z',
          confidence: 0.9,
          notabilityReason: 'Test',
          sourceType: 'news',
        },
      },
      {
        _type: 'obituary',
        claim: 'Claim 2',
        source: 'Source 2',
        sourceUrl: 'https://example.com/2',
        date: '2024-01-16',
        categories: ['market'],
        context: {},
        slug: { _type: 'slug', current: 'claim-2' },
        discoveryMetadata: {
          discoveredAt: '2024-01-17T00:00:00Z',
          confidence: 0.8,
          notabilityReason: 'Test',
          sourceType: 'tweet',
        },
      },
    ]

    it('returns all created IDs on success', async () => {
      mockCreate
        .mockResolvedValueOnce({ _id: 'doc-1' })
        .mockResolvedValueOnce({ _id: 'doc-2' })

      const { createObituaryDrafts } = await import('@/lib/sanity/mutations')
      const { createdIds, failedIndices } = await createObituaryDrafts(mockDrafts)

      expect(createdIds).toEqual(['doc-1', 'doc-2'])
      expect(failedIndices).toEqual([])
    })

    it('tracks failed indices', async () => {
      mockCreate
        .mockResolvedValueOnce({ _id: 'doc-1' })
        .mockRejectedValueOnce(new Error('Failed'))

      const { createObituaryDrafts } = await import('@/lib/sanity/mutations')
      const { createdIds, failedIndices } = await createObituaryDrafts(mockDrafts)

      expect(createdIds).toEqual(['doc-1'])
      expect(failedIndices).toEqual([1])
    })
  })

  describe('obituaryExistsByUrl', () => {
    it('returns true when document exists', async () => {
      mockFetch.mockResolvedValue(1)

      const { obituaryExistsByUrl } = await import('@/lib/sanity/mutations')
      const exists = await obituaryExistsByUrl('https://example.com/article')

      expect(exists).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'count(*[_type == "obituary" && sourceUrl == $url])',
        { url: 'https://example.com/article' }
      )
    })

    it('returns false when document does not exist', async () => {
      mockFetch.mockResolvedValue(0)

      const { obituaryExistsByUrl } = await import('@/lib/sanity/mutations')
      const exists = await obituaryExistsByUrl('https://example.com/new')

      expect(exists).toBe(false)
    })

    it('returns false when client not configured', async () => {
      delete process.env.SANITY_WRITE_TOKEN
      vi.resetModules()

      const { obituaryExistsByUrl } = await import('@/lib/sanity/mutations')
      const exists = await obituaryExistsByUrl('https://example.com/article')

      expect(exists).toBe(false)
    })
  })

  describe('filterNewDrafts', () => {
    it('filters out existing drafts', async () => {
      mockFetch
        .mockResolvedValueOnce(1) // First URL exists
        .mockResolvedValueOnce(0) // Second URL is new

      const drafts: ObituaryDraft[] = [
        {
          _type: 'obituary',
          claim: 'Existing',
          source: 'Source',
          sourceUrl: 'https://example.com/existing',
          date: '2024-01-01',
          categories: ['capability'],
          context: {},
          slug: { _type: 'slug', current: 'existing' },
          discoveryMetadata: {
            discoveredAt: '2024-01-02T00:00:00Z',
            confidence: 0.9,
            notabilityReason: 'Test',
            sourceType: 'news',
          },
        },
        {
          _type: 'obituary',
          claim: 'New',
          source: 'Source',
          sourceUrl: 'https://example.com/new',
          date: '2024-01-01',
          categories: ['market'],
          context: {},
          slug: { _type: 'slug', current: 'new' },
          discoveryMetadata: {
            discoveredAt: '2024-01-02T00:00:00Z',
            confidence: 0.8,
            notabilityReason: 'Test',
            sourceType: 'news',
          },
        },
      ]

      const { filterNewDrafts } = await import('@/lib/sanity/mutations')
      const newDrafts = await filterNewDrafts(drafts)

      expect(newDrafts).toHaveLength(1)
      expect(newDrafts[0].claim).toBe('New')
    })
  })
})
