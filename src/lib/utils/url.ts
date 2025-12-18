/**
 * URL Sanitization Utilities
 *
 * Security utilities to prevent XSS attacks from untrusted URLs.
 * Used to sanitize external URLs from CMS content before rendering.
 */

/**
 * Allowed URL protocols for external links.
 * Only http and https are considered safe.
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:']

/**
 * Sanitizes a URL to prevent XSS attacks.
 *
 * Only allows http: and https: protocols. Returns '#' for:
 * - javascript: URLs (XSS vector)
 * - data: URLs (potential XSS)
 * - Invalid/malformed URLs
 * - Empty strings
 *
 * @param url - The URL to sanitize (from CMS or external source)
 * @returns The original URL if safe, '#' otherwise
 *
 * @example
 * ```ts
 * sanitizeUrl('https://example.com') // 'https://example.com'
 * sanitizeUrl('javascript:alert(1)') // '#'
 * sanitizeUrl('') // '#'
 * ```
 */
export function sanitizeUrl(url: string | undefined | null): string {
  // Handle empty/undefined values
  if (!url || typeof url !== 'string') {
    return '#'
  }

  // Trim whitespace
  const trimmed = url.trim()
  if (!trimmed) {
    return '#'
  }

  try {
    const parsed = new URL(trimmed)

    // Only allow http and https protocols
    if (ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return trimmed
    }

    // Block dangerous protocols (javascript:, data:, vbscript:, etc.)
    return '#'
  } catch {
    // URL parsing failed - could be relative path or malformed
    // For external links, we require absolute URLs with protocol
    return '#'
  }
}

/**
 * Checks if a URL is safe without modifying it.
 *
 * @param url - The URL to check
 * @returns True if the URL is safe to use as href
 */
export function isUrlSafe(url: string | undefined | null): boolean {
  return sanitizeUrl(url) !== '#'
}
