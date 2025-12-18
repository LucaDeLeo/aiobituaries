import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { DiscoveryCandidate } from '@/types/discovery'

// Store original env
const originalEnv = process.env

// Mock message response
const mockCreate = vi.fn()

// Mock Anthropic SDK - needs to be a class
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate,
      }
    },
  }
})

describe('classifier', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-key' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isAnthropicConfigured', () => {
    it('returns true when API key is set', async () => {
      const { isAnthropicConfigured } = await import('@/lib/discovery/classifier')
      expect(isAnthropicConfigured()).toBe(true)
    })

    it('returns false when API key is not set', async () => {
      delete process.env.ANTHROPIC_API_KEY
      vi.resetModules()
      const { isAnthropicConfigured } = await import('@/lib/discovery/classifier')
      expect(isAnthropicConfigured()).toBe(false)
    })
  })

  describe('classifyCandidate', () => {
    const mockCandidate: DiscoveryCandidate = {
      url: 'https://wired.com/ai',
      title: 'AI Limitations',
      text: 'AI will never achieve true creativity',
      publishedDate: '2024-01-01',
      sourceType: 'news',
    }

    it('returns null when client not configured', async () => {
      delete process.env.ANTHROPIC_API_KEY
      vi.resetModules()
      const { classifyCandidate } = await import('@/lib/discovery/classifier')

      const result = await classifyCandidate(mockCandidate)
      expect(result).toBeNull()
    })

    it('parses valid JSON response', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              isAIDoomClaim: true,
              claimConfidence: 0.9,
              isNotable: true,
              notabilityReason: 'Major tech publication',
              extractedClaim: 'AI will never achieve creativity',
              suggestedCategory: 'capability',
              recommendation: 'approve',
            }),
          },
        ],
      })

      const { classifyCandidate } = await import('@/lib/discovery/classifier')
      const result = await classifyCandidate(mockCandidate)

      expect(result).not.toBeNull()
      expect(result?.isAIDoomClaim).toBe(true)
      expect(result?.claimConfidence).toBe(0.9)
      expect(result?.suggestedCategory).toBe('capability')
      expect(result?.recommendation).toBe('approve')
    })

    it('handles JSON in markdown code blocks', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: '```json\n{"isAIDoomClaim": true, "claimConfidence": 0.8, "isNotable": true, "notabilityReason": "Test", "extractedClaim": "AI bad", "suggestedCategory": "dismissive", "recommendation": "review"}\n```',
          },
        ],
      })

      const { classifyCandidate } = await import('@/lib/discovery/classifier')
      const result = await classifyCandidate(mockCandidate)

      expect(result?.isAIDoomClaim).toBe(true)
    })

    it('clamps confidence to 0-1 range', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              isAIDoomClaim: true,
              claimConfidence: 1.5, // Out of range
              isNotable: true,
              notabilityReason: 'Test',
              extractedClaim: 'Test claim',
              suggestedCategory: 'market',
              recommendation: 'approve',
            }),
          },
        ],
      })

      const { classifyCandidate } = await import('@/lib/discovery/classifier')
      const result = await classifyCandidate(mockCandidate)

      expect(result?.claimConfidence).toBe(1)
    })

    it('truncates long claims', async () => {
      const longClaim = 'A'.repeat(300)
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              isAIDoomClaim: true,
              claimConfidence: 0.9,
              isNotable: true,
              notabilityReason: 'Test',
              extractedClaim: longClaim,
              suggestedCategory: 'capability',
              recommendation: 'approve',
            }),
          },
        ],
      })

      const { classifyCandidate } = await import('@/lib/discovery/classifier')
      const result = await classifyCandidate(mockCandidate)

      expect(result?.extractedClaim.length).toBeLessThanOrEqual(200)
    })

    it('returns null on API error', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'))

      const { classifyCandidate } = await import('@/lib/discovery/classifier')
      const result = await classifyCandidate(mockCandidate)

      expect(result).toBeNull()
    })
  })

  describe('filterClassified', () => {
    it('filters out rejected candidates', async () => {
      const { filterClassified } = await import('@/lib/discovery/classifier')

      const classified = [
        {
          candidate: {
            url: 'https://example.com/1',
            title: 'Approved',
            text: 'Test 1',
            publishedDate: '2024-01-01',
            sourceType: 'news' as const,
          },
          result: {
            isAIDoomClaim: true,
            claimConfidence: 0.9,
            isNotable: true,
            notabilityReason: 'Test',
            extractedClaim: 'Claim 1',
            suggestedCategory: 'capability' as const,
            recommendation: 'approve' as const,
          },
        },
        {
          candidate: {
            url: 'https://example.com/2',
            title: 'Rejected',
            text: 'Test 2',
            publishedDate: '2024-01-01',
            sourceType: 'news' as const,
          },
          result: {
            isAIDoomClaim: false,
            claimConfidence: 0.2,
            isNotable: false,
            notabilityReason: 'Not notable',
            extractedClaim: 'Claim 2',
            suggestedCategory: 'dismissive' as const,
            recommendation: 'reject' as const,
          },
        },
        {
          candidate: {
            url: 'https://example.com/3',
            title: 'Review',
            text: 'Test 3',
            publishedDate: '2024-01-01',
            sourceType: 'news' as const,
          },
          result: {
            isAIDoomClaim: true,
            claimConfidence: 0.6,
            isNotable: true,
            notabilityReason: 'Test',
            extractedClaim: 'Claim 3',
            suggestedCategory: 'market' as const,
            recommendation: 'review' as const,
          },
        },
      ]

      const filtered = filterClassified(classified)

      expect(filtered).toHaveLength(2)
      expect(filtered.map((c) => c.result.recommendation)).not.toContain('reject')
    })
  })
})
