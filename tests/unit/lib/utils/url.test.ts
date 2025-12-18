/**
 * URL Sanitization Tests
 *
 * Tests for security utilities that prevent XSS attacks from untrusted URLs.
 * Critical for preventing malicious URLs from CMS content.
 */
import { describe, it, expect } from 'vitest'
import { sanitizeUrl, isUrlSafe } from '@/lib/utils/url'

describe('sanitizeUrl', () => {
  describe('allows safe URLs', () => {
    it('allows https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
      expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path')
      expect(sanitizeUrl('https://example.com/path?query=value')).toBe('https://example.com/path?query=value')
    })

    it('allows http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
      expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000')
    })

    it('preserves query parameters', () => {
      const url = 'https://example.com/search?q=test&page=1'
      expect(sanitizeUrl(url)).toBe(url)
    })

    it('preserves hash fragments', () => {
      const url = 'https://example.com/page#section'
      expect(sanitizeUrl(url)).toBe(url)
    })

    it('preserves complex URLs', () => {
      const url = 'https://user:pass@example.com:8080/path?query=value#hash'
      expect(sanitizeUrl(url)).toBe(url)
    })
  })

  describe('blocks dangerous URLs', () => {
    it('blocks javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#')
      expect(sanitizeUrl('javascript:void(0)')).toBe('#')
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('#')
      expect(sanitizeUrl('JavaScript:alert(document.cookie)')).toBe('#')
    })

    it('blocks data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#')
      expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe('#')
    })

    it('blocks vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#')
    })

    it('blocks file: protocol', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBe('#')
    })
  })

  describe('handles edge cases', () => {
    it('returns # for empty string', () => {
      expect(sanitizeUrl('')).toBe('#')
    })

    it('returns # for whitespace-only string', () => {
      expect(sanitizeUrl('   ')).toBe('#')
      expect(sanitizeUrl('\t\n')).toBe('#')
    })

    it('returns # for undefined', () => {
      expect(sanitizeUrl(undefined)).toBe('#')
    })

    it('returns # for null', () => {
      expect(sanitizeUrl(null)).toBe('#')
    })

    it('returns # for malformed URLs', () => {
      expect(sanitizeUrl('not a url')).toBe('#')
      expect(sanitizeUrl('://missing-protocol.com')).toBe('#')
    })

    it('trims whitespace from valid URLs', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com')
    })

    it('returns # for relative paths (requires absolute)', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('#')
      expect(sanitizeUrl('./relative')).toBe('#')
    })
  })

  describe('XSS attack vectors', () => {
    it('blocks javascript with encoding tricks', () => {
      // Various encoding attempts
      expect(sanitizeUrl('java\tscript:alert(1)')).toBe('#')
      expect(sanitizeUrl('java\nscript:alert(1)')).toBe('#')
    })

    it('blocks URLs with embedded credentials containing scripts', () => {
      // These should be blocked because they use javascript: protocol
      expect(sanitizeUrl('javascript:alert(1)//http://example.com')).toBe('#')
    })
  })
})

describe('isUrlSafe', () => {
  it('returns true for safe URLs', () => {
    expect(isUrlSafe('https://example.com')).toBe(true)
    expect(isUrlSafe('http://localhost:3000')).toBe(true)
  })

  it('returns false for dangerous URLs', () => {
    expect(isUrlSafe('javascript:alert(1)')).toBe(false)
    expect(isUrlSafe('data:text/html,<script>')).toBe(false)
  })

  it('returns false for empty/invalid URLs', () => {
    expect(isUrlSafe('')).toBe(false)
    expect(isUrlSafe(undefined)).toBe(false)
    expect(isUrlSafe(null)).toBe(false)
  })
})
