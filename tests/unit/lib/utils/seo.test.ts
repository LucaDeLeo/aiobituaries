import { describe, it, expect } from 'vitest'
import { truncate, generateObituaryMetadata, homepageMetadata } from '@/lib/utils/seo'
import type { Obituary } from '@/types/obituary'

describe('truncate', () => {
  it('returns string unchanged if under max length', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns string unchanged if exactly max length', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates string with ellipsis if over max length', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
  })

  it('handles max length of 3 (minimum for ellipsis)', () => {
    expect(truncate('hello', 3)).toBe('...')
  })

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('')
  })

  it('truncates at exactly the right boundary', () => {
    const result = truncate('12345678901234567890', 10)
    expect(result.length).toBe(10)
    expect(result).toBe('1234567...')
  })
})

describe('generateObituaryMetadata', () => {
  const mockObituary: Obituary = {
    _id: 'test-id',
    slug: 'test-slug',
    claim: 'AI will never be able to write code',
    source: 'Tech Pundit',
    sourceUrl: 'https://example.com/article',
    date: '2023-01-15',
    categories: ['capability'],
    context: {}
  }

  it('generates title with claim (layout template adds site name)', () => {
    const metadata = generateObituaryMetadata(mockObituary)
    expect(metadata.title).toContain('AI will never be able to write code')
    // Note: "AI Obituaries" suffix is added by layout.tsx template
  })

  it('generates description with source and claim', () => {
    const metadata = generateObituaryMetadata(mockObituary)
    expect(metadata.description).toContain('Tech Pundit')
    expect(metadata.description).toContain('AI will never')
  })

  it('truncates long claims in title to max 60 chars', () => {
    const longClaimObituary: Obituary = {
      ...mockObituary,
      claim: 'This is a very long claim that definitely exceeds the maximum allowed characters for a title tag and should be truncated appropriately',
    }
    const metadata = generateObituaryMetadata(longClaimObituary)
    expect(String(metadata.title).length).toBeLessThanOrEqual(60)
  })

  it('truncates long descriptions to max 155 chars', () => {
    const longClaimObituary: Obituary = {
      ...mockObituary,
      source: 'Very Important Technology Publication',
      claim: 'This is a very long claim that definitely exceeds the maximum allowed characters for a description meta tag and should be truncated appropriately with ellipsis',
    }
    const metadata = generateObituaryMetadata(longClaimObituary)
    expect(String(metadata.description).length).toBeLessThanOrEqual(155)
  })

  it('includes openGraph metadata', () => {
    const metadata = generateObituaryMetadata(mockObituary)
    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph?.type).toBe('article')
    expect(metadata.openGraph?.siteName).toBe('AI Obituaries')
  })

  it('includes correct openGraph URL', () => {
    const metadata = generateObituaryMetadata(mockObituary)
    expect(metadata.openGraph?.url).toContain('/obituary/test-slug')
  })

  it('includes openGraph image', () => {
    const metadata = generateObituaryMetadata(mockObituary)
    expect(metadata.openGraph?.images).toBeDefined()
    const images = metadata.openGraph?.images as Array<{ url: string; width: number; height: number }>
    expect(images[0].url).toContain('/og/default.png')
    expect(images[0].width).toBe(1200)
    expect(images[0].height).toBe(630)
  })

  it('includes twitter card metadata', () => {
    const metadata = generateObituaryMetadata(mockObituary)
    expect(metadata.twitter).toBeDefined()
    expect(metadata.twitter?.card).toBe('summary_large_image')
  })

  it('includes twitter title and description', () => {
    const metadata = generateObituaryMetadata(mockObituary)
    expect(metadata.twitter?.title).toBeDefined()
    expect(metadata.twitter?.description).toBeDefined()
  })

  it('includes twitter image', () => {
    const metadata = generateObituaryMetadata(mockObituary)
    const images = metadata.twitter?.images as string[]
    expect(images[0]).toContain('/og/default.png')
  })

  it('includes canonical URL in alternates', () => {
    const metadata = generateObituaryMetadata(mockObituary)
    expect(metadata.alternates?.canonical).toContain('/obituary/test-slug')
  })
})

describe('homepageMetadata', () => {
  it('has title (layout template adds site name)', () => {
    expect(homepageMetadata.title).toBe('Documenting AI Skepticism')
    // Note: "AI Obituaries" suffix is added by layout.tsx template
  })

  it('has description', () => {
    expect(homepageMetadata.description).toBeDefined()
    expect(homepageMetadata.description).toContain('archive')
  })

  it('has openGraph type website', () => {
    expect(homepageMetadata.openGraph?.type).toBe('website')
  })

  it('has openGraph site name', () => {
    expect(homepageMetadata.openGraph?.siteName).toBe('AI Obituaries')
  })

  it('has openGraph image', () => {
    expect(homepageMetadata.openGraph?.images).toBeDefined()
    const images = homepageMetadata.openGraph?.images as Array<{ url: string }>
    expect(images[0].url).toContain('/og/default.png')
  })

  it('has twitter card summary_large_image', () => {
    expect(homepageMetadata.twitter?.card).toBe('summary_large_image')
  })

  it('has twitter title and description', () => {
    expect(homepageMetadata.twitter?.title).toBeDefined()
    expect(homepageMetadata.twitter?.description).toBeDefined()
  })
})
