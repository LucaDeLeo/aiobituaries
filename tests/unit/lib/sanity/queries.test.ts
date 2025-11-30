import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Obituary, Category } from '@/types/obituary'
import type { ContextMetadata } from '@/types/context'

// Mock the client module
vi.mock('@/lib/sanity/client', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

// Import after mock setup
import { client } from '@/lib/sanity/client'
import {
  getObituaries,
  getObituaryBySlug,
  getObituaryCount,
  getAllObituarySlugs,
} from '@/lib/sanity/queries'

// Test fixtures
const mockContext: ContextMetadata = {
  nvdaPrice: 450.5,
  msftPrice: 380.25,
  googPrice: 140.0,
  benchmarkName: 'MMLU',
  benchmarkScore: 86.4,
  currentModel: 'GPT-4',
  milestone: 'ChatGPT launch',
  note: 'Test note',
}

const mockObituary: Obituary = {
  _id: 'test-id-1',
  slug: 'ai-will-never-work',
  claim: 'AI will never be able to do creative tasks',
  source: 'Tech Pundit Weekly',
  sourceUrl: 'https://example.com/article',
  date: '2023-06-15',
  categories: ['capability', 'dismissive'] as Category[],
  context: mockContext,
}

const mockObituary2: Obituary = {
  _id: 'test-id-2',
  slug: 'ai-bubble',
  claim: 'The AI bubble will burst by 2024',
  source: 'Financial Times',
  sourceUrl: 'https://example.com/ft-article',
  date: '2023-01-10',
  categories: ['market'] as Category[],
  context: {
    nvdaPrice: 220.0,
    msftPrice: 250.0,
  },
}

describe('Sanity queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getObituaries', () => {
    it('returns typed array of obituaries', async () => {
      const mockData = [mockObituary, mockObituary2]
      vi.mocked(client.fetch).mockResolvedValue(mockData)

      const result = await getObituaries()

      expect(result).toEqual(mockData)
      expect(result).toHaveLength(2)
      expect(client.fetch).toHaveBeenCalledOnce()
    })

    it('returns empty array when no obituaries exist', async () => {
      vi.mocked(client.fetch).mockResolvedValue([])

      const result = await getObituaries()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('calls fetch with correct GROQ query', async () => {
      vi.mocked(client.fetch).mockResolvedValue([])

      await getObituaries()

      const fetchCall = vi.mocked(client.fetch).mock.calls[0][0] as string
      expect(fetchCall).toContain('*[_type == "obituary"]')
      expect(fetchCall).toContain('order(date desc)')
      expect(fetchCall).toContain('"slug": slug.current')
    })
  })

  describe('getObituaryBySlug', () => {
    it('returns single obituary for valid slug', async () => {
      vi.mocked(client.fetch).mockResolvedValue(mockObituary)

      const result = await getObituaryBySlug('ai-will-never-work')

      expect(result).toEqual(mockObituary)
      expect(result?._id).toBe('test-id-1')
      expect(result?.slug).toBe('ai-will-never-work')
    })

    it('returns null for non-existent slug', async () => {
      vi.mocked(client.fetch).mockResolvedValue(null)

      const result = await getObituaryBySlug('non-existent-slug')

      expect(result).toBeNull()
    })

    it('passes slug as parameter to prevent injection', async () => {
      vi.mocked(client.fetch).mockResolvedValue(mockObituary)

      await getObituaryBySlug('test-slug')

      expect(client.fetch).toHaveBeenCalledWith(
        expect.any(String),
        { slug: 'test-slug' },
        { next: { tags: ['obituaries'] } }
      )
    })

    it('calls fetch with correct GROQ query', async () => {
      vi.mocked(client.fetch).mockResolvedValue(null)

      await getObituaryBySlug('test-slug')

      const fetchCall = vi.mocked(client.fetch).mock.calls[0][0] as string
      expect(fetchCall).toContain('slug.current == $slug')
      expect(fetchCall).toContain('[0]')
    })
  })

  describe('getAllObituarySlugs', () => {
    it('returns array of slug strings', async () => {
      const mockSlugs = ['ai-will-never-work', 'ai-bubble', 'agi-impossible']
      vi.mocked(client.fetch).mockResolvedValue(mockSlugs)

      const result = await getAllObituarySlugs()

      expect(result).toEqual(mockSlugs)
      expect(result).toHaveLength(3)
      expect(typeof result[0]).toBe('string')
    })

    it('returns empty array when no obituaries exist', async () => {
      vi.mocked(client.fetch).mockResolvedValue([])

      const result = await getAllObituarySlugs()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('calls fetch with ISR caching tag', async () => {
      vi.mocked(client.fetch).mockResolvedValue([])

      await getAllObituarySlugs()

      expect(client.fetch).toHaveBeenCalledWith(
        expect.any(String),
        {},
        { next: { tags: ['obituaries'] } }
      )
    })

    it('calls fetch with correct GROQ query for slugs', async () => {
      vi.mocked(client.fetch).mockResolvedValue([])

      await getAllObituarySlugs()

      const fetchCall = vi.mocked(client.fetch).mock.calls[0][0] as string
      expect(fetchCall).toContain('*[_type == "obituary"]')
      expect(fetchCall).toContain('slug.current')
    })
  })

  describe('getObituaryCount', () => {
    it('returns number for count', async () => {
      vi.mocked(client.fetch).mockResolvedValue(42)

      const result = await getObituaryCount()

      expect(result).toBe(42)
      expect(typeof result).toBe('number')
    })

    it('returns 0 when no obituaries exist', async () => {
      vi.mocked(client.fetch).mockResolvedValue(0)

      const result = await getObituaryCount()

      expect(result).toBe(0)
    })

    it('calls fetch with correct GROQ count query and cache tag', async () => {
      vi.mocked(client.fetch).mockResolvedValue(0)

      await getObituaryCount()

      expect(client.fetch).toHaveBeenCalledWith(
        'count(*[_type == "obituary"])',
        undefined,
        { next: { tags: ['obituary'] } }
      )
    })
  })
})

describe('Type definitions', () => {
  it('Category type accepts valid categories', () => {
    const categories: Category[] = ['market', 'capability', 'agi', 'dismissive']
    expect(categories).toHaveLength(4)
  })

  it('ContextMetadata allows all optional fields', () => {
    const emptyContext: ContextMetadata = {}
    expect(emptyContext).toEqual({})

    const fullContext: ContextMetadata = {
      nvdaPrice: 100,
      msftPrice: 200,
      googPrice: 300,
      benchmarkName: 'test',
      benchmarkScore: 90,
      currentModel: 'GPT-5',
      milestone: 'AGI achieved',
      note: 'Test note',
    }
    expect(fullContext.nvdaPrice).toBe(100)
  })

  it('Obituary interface has required fields', () => {
    const obituary: Obituary = mockObituary
    expect(obituary._id).toBeDefined()
    expect(obituary.slug).toBeDefined()
    expect(obituary.claim).toBeDefined()
    expect(obituary.source).toBeDefined()
    expect(obituary.sourceUrl).toBeDefined()
    expect(obituary.date).toBeDefined()
    expect(obituary.categories).toBeDefined()
    expect(obituary.context).toBeDefined()
  })
})
