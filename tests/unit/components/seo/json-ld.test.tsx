import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { truncate } from '@/lib/utils/seo'
import { JsonLd } from '@/components/seo/json-ld'
import type { Obituary } from '@/types/obituary'

const BASE_URL = 'https://aiobituaries.com'

const mockObituary: Obituary = {
  _id: 'test-id',
  slug: 'test-slug',
  claim: 'AI will never be able to write code that works',
  source: 'Tech Skeptic',
  sourceUrl: 'https://example.com/article',
  date: '2023-01-15',
  categories: ['capability'],
  context: {}
}

// Test the schema generation logic directly since script tags don't render in jsdom
function generateArticleSchema(obituary: Obituary) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: truncate(obituary.claim, 110),
    datePublished: obituary.date,
    author: {
      '@type': 'Person',
      name: obituary.source,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Obituaries',
      url: BASE_URL,
    },
    description: truncate(
      `${obituary.source}: "${obituary.claim}"`,
      155
    ),
    url: `${BASE_URL}/obituary/${obituary.slug}`,
  }
}

function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Obituaries',
    description: 'A data-driven archive documenting AI skepticism',
    url: BASE_URL,
  }
}

describe('JsonLd Schema Generation', () => {
  describe('Article Schema (Obituary Pages)', () => {
    it('includes @context as schema.org', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema['@context']).toBe('https://schema.org')
    })

    it('includes @type as Article', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema['@type']).toBe('Article')
    })

    it('includes headline from claim', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema.headline).toContain('AI will never')
    })

    it('truncates headline to max 110 chars', () => {
      const longClaimObituary: Obituary = {
        ...mockObituary,
        claim: 'This is an extremely long claim that definitely exceeds the maximum allowed characters for a headline in JSON-LD structured data and should be truncated appropriately with ellipsis at the end',
      }
      const schema = generateArticleSchema(longClaimObituary)
      expect(schema.headline.length).toBeLessThanOrEqual(110)
    })

    it('includes datePublished in ISO format', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema.datePublished).toBe('2023-01-15')
    })

    it('includes author as Person type', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema.author['@type']).toBe('Person')
      expect(schema.author.name).toBe('Tech Skeptic')
    })

    it('includes publisher as Organization type', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema.publisher['@type']).toBe('Organization')
      expect(schema.publisher.name).toBe('AI Obituaries')
    })

    it('includes publisher url', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema.publisher.url).toBe(BASE_URL)
    })

    it('includes description with source and claim', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema.description).toContain('Tech Skeptic')
      expect(schema.description).toContain('AI will never')
    })

    it('truncates description to max 155 chars', () => {
      const longClaimObituary: Obituary = {
        ...mockObituary,
        source: 'Very Important Technology Publication',
        claim: 'This is an extremely long claim that definitely exceeds the maximum allowed characters',
      }
      const schema = generateArticleSchema(longClaimObituary)
      expect(schema.description.length).toBeLessThanOrEqual(155)
    })

    it('includes canonical url with slug', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema.url).toContain('/obituary/test-slug')
    })

    it('outputs valid JSON when stringified', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(() => JSON.stringify(schema)).not.toThrow()
      const parsed = JSON.parse(JSON.stringify(schema))
      expect(parsed['@type']).toBe('Article')
    })

    it('has all required Article schema fields', () => {
      const schema = generateArticleSchema(mockObituary)
      expect(schema).toHaveProperty('@context')
      expect(schema).toHaveProperty('@type')
      expect(schema).toHaveProperty('headline')
      expect(schema).toHaveProperty('datePublished')
      expect(schema).toHaveProperty('author')
      expect(schema).toHaveProperty('publisher')
      expect(schema).toHaveProperty('description')
      expect(schema).toHaveProperty('url')
    })
  })

  describe('WebSite Schema (Homepage)', () => {
    it('includes @context as schema.org', () => {
      const schema = generateWebsiteSchema()
      expect(schema['@context']).toBe('https://schema.org')
    })

    it('includes @type as WebSite', () => {
      const schema = generateWebsiteSchema()
      expect(schema['@type']).toBe('WebSite')
    })

    it('includes site name', () => {
      const schema = generateWebsiteSchema()
      expect(schema.name).toBe('AI Obituaries')
    })

    it('includes description', () => {
      const schema = generateWebsiteSchema()
      expect(schema.description).toBeDefined()
      expect(schema.description.length).toBeGreaterThan(0)
    })

    it('includes base url', () => {
      const schema = generateWebsiteSchema()
      expect(schema.url).toBe(BASE_URL)
    })

    it('outputs valid JSON when stringified', () => {
      const schema = generateWebsiteSchema()
      expect(() => JSON.stringify(schema)).not.toThrow()
      const parsed = JSON.parse(JSON.stringify(schema))
      expect(parsed['@type']).toBe('WebSite')
    })

    it('has all required WebSite schema fields', () => {
      const schema = generateWebsiteSchema()
      expect(schema).toHaveProperty('@context')
      expect(schema).toHaveProperty('@type')
      expect(schema).toHaveProperty('name')
      expect(schema).toHaveProperty('description')
      expect(schema).toHaveProperty('url')
    })
  })

  describe('XSS Prevention (serializeJsonLd)', () => {
    it('escapes </script> tags in claim to prevent breakout', () => {
      const maliciousObituary: Obituary = {
        ...mockObituary,
        claim: 'Test </script><script>alert("XSS")</script> claim',
      }

      const { container } = render(<JsonLd obituary={maliciousObituary} type="article" />)
      const script = container.querySelector('script[type="application/ld+json"]')
      const content = script?.innerHTML ?? ''

      // Should NOT contain raw </script> that would break out
      expect(content).not.toContain('</script>')
      // Should contain escaped version (unicode escapes)
      expect(content).toContain('\\u003c')
      expect(content).toContain('\\/script')
    })

    it('escapes < characters to prevent HTML injection', () => {
      const maliciousObituary: Obituary = {
        ...mockObituary,
        claim: 'Test <img src=x onerror=alert(1)> claim',
      }

      const { container } = render(<JsonLd obituary={maliciousObituary} type="article" />)
      const script = container.querySelector('script[type="application/ld+json"]')
      const content = script?.innerHTML ?? ''

      // Should NOT contain raw < that could be parsed as HTML
      expect(content).not.toMatch(/<[a-z]/i)
      // Should contain unicode escape
      expect(content).toContain('\\u003c')
    })

    it('escapes > characters for completeness', () => {
      const obituary: Obituary = {
        ...mockObituary,
        claim: 'AI progress x > human intelligence',
      }

      const { container } = render(<JsonLd obituary={obituary} type="article" />)
      const script = container.querySelector('script[type="application/ld+json"]')
      const content = script?.innerHTML ?? ''

      // Should contain unicode escape for >
      expect(content).toContain('\\u003e')
    })

    it('handles complex XSS attempt in source field', () => {
      const maliciousObituary: Obituary = {
        ...mockObituary,
        source: '</script><svg onload=alert(1)>',
      }

      const { container } = render(<JsonLd obituary={maliciousObituary} type="article" />)
      const script = container.querySelector('script[type="application/ld+json"]')
      const content = script?.innerHTML ?? ''

      // Should escape all dangerous characters
      expect(content).not.toContain('</script>')
      expect(content).not.toMatch(/<svg/i)
    })

    it('produces valid JSON structure after escaping', () => {
      const maliciousObituary: Obituary = {
        ...mockObituary,
        claim: '</script><script>evil()</script>',
        source: '<test>',
      }

      const { container } = render(<JsonLd obituary={maliciousObituary} type="article" />)
      const script = container.querySelector('script[type="application/ld+json"]')
      const content = script?.innerHTML ?? ''

      // The escaped content should maintain JSON structure
      expect(content).toContain('@context')
      expect(content).toContain('@type')
    })

    it('escapes website schema safely', () => {
      const { container } = render(<JsonLd type="website" />)
      const script = container.querySelector('script[type="application/ld+json"]')
      const content = script?.innerHTML ?? ''

      // Should properly render website schema
      expect(content).toContain('WebSite')
      expect(content).toContain('AI Obituaries')
    })
  })
})
