import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for E2E, accessibility, and performance testing
 *
 * Timeout standards (TEA best practices):
 * - Action timeout: 15s (click, fill, type)
 * - Navigation timeout: 30s (goto, reload)
 * - Expect timeout: 10s (assertions)
 * - Test timeout: 60s (overall)
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directories - exclude unit tests (Vitest)
  testDir: './tests',
  testMatch: ['**/a11y/**/*.spec.ts', '**/e2e/**/*.spec.ts', '**/performance/**/*.spec.ts'],
  testIgnore: ['**/unit/**'],
  outputDir: './test-results',

  // Global test timeout: 120 seconds (allows for slow SSR + assertions)
  timeout: 120_000,

  // Assertion timeout: 10 seconds
  expect: {
    timeout: 10_000,
  },

  // Parallel execution
  fullyParallel: true,

  // Fail CI if .only() left in code
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  // Workers: serial in CI for stability, parallel locally
  workers: process.env.CI ? 1 : undefined,

  // Reporters: HTML for visual debugging, JUnit for CI, list for console
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  use: {
    // Base URL with env var support
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Action timeout: 15 seconds (click, fill, etc.)
    actionTimeout: 15_000,

    // Navigation timeout: 60 seconds (increased for Turbopack cold start)
    navigationTimeout: 60_000,

    // Failure artifacts - capture evidence on failure only
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Browser projects - cross-browser testing enabled
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Uncomment for Firefox testing:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

  // Server configuration - use production build when PROD_TEST is set
  webServer: {
    command: process.env.PROD_TEST ? 'bun start' : 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
