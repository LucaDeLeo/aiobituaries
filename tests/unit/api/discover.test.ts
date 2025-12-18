import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock all dependencies
vi.mock('@/lib/exa/queries', () => ({
  discoverCandidates: vi.fn(),
}))

vi.mock('@/lib/discovery/quality-filter', () => ({
  filterCandidates: vi.fn(),
  extractDomain: vi.fn((url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return null
    }
  }),
}))

vi.mock('@/lib/discovery/classifier', () => ({
  classifyCandidates: vi.fn(),
  filterClassified: vi.fn(),
}))

vi.mock('@/lib/discovery/enricher', () => ({
  enrichContext: vi.fn(),
  generateSlug: vi.fn((claim: string) => claim.toLowerCase().replace(/\s+/g, '-')),
}))

vi.mock('@/lib/sanity/mutations', () => ({
  createObituaryDrafts: vi.fn(),
  filterNewDrafts: vi.fn((drafts) => drafts),
}))

// Import mocked modules
import { discoverCandidates } from '@/lib/exa/queries'
import { filterCandidates } from '@/lib/discovery/quality-filter'
import { classifyCandidates, filterClassified } from '@/lib/discovery/classifier'
import { enrichContext } from '@/lib/discovery/enricher'
import { createObituaryDrafts } from '@/lib/sanity/mutations'

// Store original env
const originalEnv = process.env

describe('discover API route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env = { ...originalEnv, CRON_SECRET: 'test-secret' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('POST /api/discover', () => {
    it('returns 401 without valid auth header', async () => {
      const { POST } = await import('@/app/api/discover/route')

      const request = new NextRequest('http://localhost/api/discover', {
        method: 'POST',
        headers: {},
      })

      const response = await POST(request)
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 401 with wrong secret', async () => {
      const { POST } = await import('@/app/api/discover/route')

      const request = new NextRequest('http://localhost/api/discover', {
        method: 'POST',
        headers: {
          authorization: 'Bearer wrong-secret',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('succeeds with valid auth header', async () => {
      vi.mocked(discoverCandidates).mockResolvedValue([])

      const { POST } = await import('@/app/api/discover/route')

      const request = new NextRequest('http://localhost/api/discover', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-secret',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.discovered).toBe(0)
    })

    it('skips auth when CRON_SECRET not set', async () => {
      delete process.env.CRON_SECRET
      vi.resetModules()
      vi.mocked(discoverCandidates).mockResolvedValue([])

      const { POST } = await import('@/app/api/discover/route')

      const request = new NextRequest('http://localhost/api/discover', {
        method: 'POST',
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('runs full pipeline with candidates', async () => {
      const mockCandidates = [
        {
          url: 'https://wired.com/ai',
          title: 'AI Doom',
          text: 'AI will never work',
          publishedDate: '2024-01-15',
          sourceType: 'news' as const,
        },
      ]

      const mockClassified = [
        {
          candidate: mockCandidates[0],
          result: {
            isAIDoomClaim: true,
            claimConfidence: 0.9,
            isNotable: true,
            notabilityReason: 'Major publication',
            extractedClaim: 'AI will never work',
            suggestedCategory: 'capability' as const,
            recommendation: 'approve' as const,
          },
        },
      ]

      vi.mocked(discoverCandidates).mockResolvedValue(mockCandidates)
      vi.mocked(filterCandidates).mockReturnValue(mockCandidates)
      vi.mocked(classifyCandidates).mockResolvedValue(mockClassified)
      vi.mocked(filterClassified).mockReturnValue(mockClassified)
      vi.mocked(enrichContext).mockResolvedValue({ currentModel: 'GPT-4' })
      vi.mocked(createObituaryDrafts).mockResolvedValue({
        createdIds: ['doc-123'],
        failedIndices: [],
      })

      const { POST } = await import('@/app/api/discover/route')

      const request = new NextRequest('http://localhost/api/discover', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-secret',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.discovered).toBe(1)
      expect(data.filtered).toBe(1)
      expect(data.classified).toBe(1)
      expect(data.created).toBe(1)
      expect(data.createdIds).toEqual(['doc-123'])
    })

    it('returns early when no candidates found', async () => {
      vi.mocked(discoverCandidates).mockResolvedValue([])

      const { POST } = await import('@/app/api/discover/route')

      const request = new NextRequest('http://localhost/api/discover', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-secret',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.discovered).toBe(0)
      expect(data.filtered).toBe(0)
      expect(data.classified).toBe(0)
      expect(data.created).toBe(0)
      expect(filterCandidates).not.toHaveBeenCalled()
    })

    it('returns early when all filtered out', async () => {
      vi.mocked(discoverCandidates).mockResolvedValue([
        {
          url: 'https://example.com',
          title: 'Test',
          text: 'Test content',
          publishedDate: '2024-01-15',
          sourceType: 'news',
        },
      ])
      vi.mocked(filterCandidates).mockReturnValue([])

      const { POST } = await import('@/app/api/discover/route')

      const request = new NextRequest('http://localhost/api/discover', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-secret',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.discovered).toBe(1)
      expect(data.filtered).toBe(0)
      expect(data.classified).toBe(0)
      expect(classifyCandidates).not.toHaveBeenCalled()
    })

    it('handles API errors gracefully', async () => {
      vi.mocked(discoverCandidates).mockRejectedValue(new Error('Exa API Error'))

      const { POST } = await import('@/app/api/discover/route')

      const request = new NextRequest('http://localhost/api/discover', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-secret',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBe('Discovery pipeline failed')
      expect(data.details).toBe('Exa API Error')
    })
  })

  describe('GET /api/discover', () => {
    it('returns status information', async () => {
      process.env.EXA_API_KEY = 'test'
      process.env.ANTHROPIC_API_KEY = 'test'
      process.env.SANITY_WRITE_TOKEN = 'test'
      vi.resetModules()

      const { GET } = await import('@/app/api/discover/route')
      const response = await GET()

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.status).toBe('ok')
      expect(data.configured).toBeDefined()
    })

    it('reports unconfigured services', async () => {
      delete process.env.EXA_API_KEY
      delete process.env.ANTHROPIC_API_KEY
      delete process.env.SANITY_WRITE_TOKEN
      vi.resetModules()

      const { GET } = await import('@/app/api/discover/route')
      const response = await GET()

      const data = await response.json()
      expect(data.configured.exa).toBe(false)
      expect(data.configured.anthropic).toBe(false)
      expect(data.configured.sanity).toBe(false)
    })
  })
})
