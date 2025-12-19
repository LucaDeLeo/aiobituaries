/**
 * Lighthouse Audit Placeholder
 *
 * NOTE: Full Lighthouse audits require either:
 * 1. playwright-lighthouse package (npm install -D playwright-lighthouse)
 * 2. Running Lighthouse CLI separately in CI
 *
 * For Core Web Vitals testing, see core-web-vitals.spec.ts which uses
 * Playwright's native Performance APIs.
 *
 * To run full Lighthouse audits in CI, add to your workflow:
 *
 * ```yaml
 * - name: Lighthouse CI
 *   uses: treosh/lighthouse-ci-action@v10
 *   with:
 *     urls: |
 *       http://localhost:3000/
 *       http://localhost:3000/obituary/sample
 *     budgetPath: ./lighthouse-budget.json
 * ```
 */
import { test } from '@playwright/test'

test.describe('Lighthouse Placeholder', () => {
  test.skip('Full Lighthouse audit requires additional setup', async () => {
    // This test is skipped - see core-web-vitals.spec.ts for actual performance tests
    // Install playwright-lighthouse for full Lighthouse integration:
    // npm install -D playwright-lighthouse
  })
})

/**
 * Example lighthouse-budget.json for CI:
 *
 * {
 *   "performance": 90,
 *   "accessibility": 95,
 *   "best-practices": 90,
 *   "seo": 90
 * }
 */
