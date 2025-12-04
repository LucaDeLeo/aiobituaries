/**
 * Merged Fixtures for Playwright Tests
 *
 * Combines playwright-utils fixtures with custom project fixtures.
 * Import { test, expect } from this file instead of @playwright/test.
 *
 * Features enabled:
 * - Network error monitoring (auto-fail on 4xx/5xx)
 * - Structured logging to test reports
 * - Recurse polling for async conditions
 *
 * @see https://github.com/seontechnologies/playwright-utils
 */
import { mergeTests } from '@playwright/test'
import { test as networkErrorMonitorFixture } from '@seontechnologies/playwright-utils/network-error-monitor/fixtures'
import { test as logFixture } from '@seontechnologies/playwright-utils/log/fixtures'
import { test as recurseFixture } from '@seontechnologies/playwright-utils/recurse/fixtures'

// Merge all fixtures into a single test object
export const test = mergeTests(
  networkErrorMonitorFixture,
  logFixture,
  recurseFixture
)

// Re-export expect for convenience
export { expect } from '@playwright/test'

/**
 * Usage in tests:
 *
 * ```typescript
 * import { test, expect } from '../support/merged-fixtures'
 *
 * test('my test', async ({ page, log, recurse }) => {
 *   // Log with message and level
 *   await log({ message: 'Navigate to homepage', level: 'step' })
 *   await page.goto('/')
 *
 *   // Log levels: 'info' | 'step' | 'success' | 'warning' | 'error' | 'debug'
 *   await log({ message: 'Found data', level: 'success' })
 *
 *   // Network errors auto-detected and fail test
 *   // Use annotation to opt-out for validation tests:
 *   // test('validation', { annotation: [{ type: 'skipNetworkMonitoring' }] }, ...)
 *
 *   // Recurse for polling async conditions
 *   await recurse(
 *     () => page.locator('.status').textContent(),
 *     (text) => text === 'Ready'
 *   )
 * })
 * ```
 */
