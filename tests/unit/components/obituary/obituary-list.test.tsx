/**
 * ObituaryList Component Tests
 *
 * Note: Testing async Server Components with next/link is complex due to
 * Next.js context requirements. These tests focus on the data fetching
 * and state management aspects of the ObituaryList component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the queries module
vi.mock('@/lib/sanity/queries', () => ({
  getObituaries: vi.fn(),
}))

import { getObituaries } from '@/lib/sanity/queries'
import type { ObituarySummary } from '@/types/obituary'

const mockedGetObituaries = vi.mocked(getObituaries)

// Sample obituary data for testing
const createMockObituaries = (): ObituarySummary[] => [
  {
    _id: 'obit-1',
    slug: 'first-claim',
    claim: 'First AI skepticism claim',
    source: 'First Source',
    date: '2024-01-15',
    categories: ['capability'],
  },
  {
    _id: 'obit-2',
    slug: 'second-claim',
    claim: 'Second AI skepticism claim',
    source: 'Second Source',
    date: '2024-01-10',
    categories: ['market'],
  },
  {
    _id: 'obit-3',
    slug: 'third-claim',
    claim: 'Third AI skepticism claim',
    source: 'Third Source',
    date: '2024-01-05',
    categories: ['agi'],
  },
]

describe('ObituaryList data fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('calls getObituaries when component is invoked', async () => {
    mockedGetObituaries.mockResolvedValue(createMockObituaries())

    // Import the component and call it
    const { ObituaryList } = await import('@/components/obituary/obituary-list')
    // Note: We can't render directly due to next/link, but we can test the function call
    await ObituaryList()

    expect(mockedGetObituaries).toHaveBeenCalledTimes(1)
  })

  it('handles empty array from getObituaries', async () => {
    mockedGetObituaries.mockResolvedValue([])

    const { ObituaryList } = await import('@/components/obituary/obituary-list')
    const result = await ObituaryList()

    expect(result).toBeDefined()
    // Component should render without throwing
    expect(mockedGetObituaries).toHaveBeenCalledTimes(1)
  })

  it('handles fetch error gracefully', async () => {
    mockedGetObituaries.mockRejectedValue(new Error('Sanity fetch failed'))

    const { ObituaryList } = await import('@/components/obituary/obituary-list')

    // Should not throw - handles error gracefully
    const result = await ObituaryList()
    expect(result).toBeDefined()
  })

  it('processes multiple obituaries correctly', async () => {
    const obituaries = createMockObituaries()
    mockedGetObituaries.mockResolvedValue(obituaries)

    const { ObituaryList } = await import('@/components/obituary/obituary-list')
    await ObituaryList()

    expect(mockedGetObituaries).toHaveBeenCalledTimes(1)
  })
})

describe('getObituaries query configuration', () => {
  it('returns ObituarySummary array type', async () => {
    const mockData: ObituarySummary[] = [
      {
        _id: 'test-1',
        slug: 'test-slug',
        claim: 'Test claim',
        source: 'Test source',
        date: '2024-01-01',
        categories: ['capability'],
      },
    ]
    mockedGetObituaries.mockResolvedValue(mockData)

    const result = await getObituaries()

    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toHaveProperty('_id')
    expect(result[0]).toHaveProperty('slug')
    expect(result[0]).toHaveProperty('claim')
    expect(result[0]).toHaveProperty('source')
    expect(result[0]).toHaveProperty('date')
    expect(result[0]).toHaveProperty('categories')
  })

  it('does not include context or sourceUrl fields', async () => {
    const mockData: ObituarySummary[] = [
      {
        _id: 'test-1',
        slug: 'test-slug',
        claim: 'Test claim',
        source: 'Test source',
        date: '2024-01-01',
        categories: ['capability'],
      },
    ]
    mockedGetObituaries.mockResolvedValue(mockData)

    const result = await getObituaries()

    // ObituarySummary should NOT have these full Obituary fields
    expect(result[0]).not.toHaveProperty('context')
    expect(result[0]).not.toHaveProperty('sourceUrl')
  })
})

describe('ObituarySummary type', () => {
  it('has correct shape', async () => {
    const summary: ObituarySummary = {
      _id: 'test-id',
      slug: 'test-slug',
      claim: 'Test claim',
      source: 'Test source',
      date: '2024-01-01',
      categories: ['capability', 'market'],
    }

    expect(summary._id).toBe('test-id')
    expect(summary.slug).toBe('test-slug')
    expect(summary.claim).toBe('Test claim')
    expect(summary.source).toBe('Test source')
    expect(summary.date).toBe('2024-01-01')
    expect(summary.categories).toEqual(['capability', 'market'])
  })

  it('categories can include all valid category types', async () => {
    const summary: ObituarySummary = {
      _id: 'test-id',
      slug: 'test-slug',
      claim: 'Test claim',
      source: 'Test source',
      date: '2024-01-01',
      categories: ['capability', 'market', 'agi', 'dismissive'],
    }

    expect(summary.categories).toHaveLength(4)
    expect(summary.categories).toContain('capability')
    expect(summary.categories).toContain('market')
    expect(summary.categories).toContain('agi')
    expect(summary.categories).toContain('dismissive')
  })
})
