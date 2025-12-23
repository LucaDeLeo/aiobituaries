/**
 * Lighthouse CI Configuration
 *
 * Automated performance, accessibility, and best practices auditing.
 * Run with: npx @lhci/cli@latest autorun
 *
 * Performance targets (AC-6.8.1 through AC-6.8.4):
 * - Performance score >= 90
 * - Accessibility score >= 95
 * - Best Practices score >= 90
 * - SEO score >= 90
 * - LCP < 2.5s (AC-6.8.2)
 * - CLS < 0.1 (AC-6.8.3)
 * - TBT < 300ms (AC-6.8.4)
 */

module.exports = {
  ci: {
    collect: {
      // Test both homepage and a sample obituary page
      // P2.1 fix: Use valid mock slug instead of 404-prone 'sample-slug'
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/obituary/agi-impossible-2020'
      ],
      // Run 3 times and take average to account for variance
      numberOfRuns: 3,
      settings: {
        // Desktop configuration (mobile can be added separately)
        preset: 'desktop',
        // Ensure consistent throttling
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      assertions: {
        // Category scores (AC-6.8.1)
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals - Performance metrics
        // FCP (First Contentful Paint) - should be under 1.8s
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],

        // LCP (Largest Contentful Paint) - AC-6.8.2: must be under 2.5s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],

        // CLS (Cumulative Layout Shift) - AC-6.8.3: must be under 0.1
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // TBT (Total Blocking Time) - AC-6.8.4: must be under 300ms
        'total-blocking-time': ['error', { maxNumericValue: 300 }],

        // Additional performance metrics
        'speed-index': ['error', { maxNumericValue: 3400 }],
        'interactive': ['error', { maxNumericValue: 3800 }]
      }
    },
    upload: {
      // Use temporary public storage for reports
      // Reports will be available for 7 days at a temporary URL
      target: 'temporary-public-storage'
    }
  }
}
