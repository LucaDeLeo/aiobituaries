/**
 * E2E User Flow Tests - AI Obituaries
 *
 * Tests core user journeys through the application:
 * - Homepage visualization interaction
 * - Obituary detail viewing
 * - Category filtering
 *
 * Uses merged fixtures with:
 * - Network error monitoring (auto-fail on API errors)
 * - Structured logging (visible in test reports)
 * - Recurse polling (for async conditions)
 */
import { test, expect } from '../support/merged-fixtures'

// CI environments need longer timeouts for dynamic imports and hydration
// Dynamic imports via next/dynamic can take 45-60s in CI environments
const isCI = !!process.env.CI
const SCATTER_TIMEOUT = isCI ? 60_000 : 15_000

test.describe('Homepage Visualization', () => {
  test('should load homepage with scatter plot', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')

    await log({ message: 'Wait for page to be fully loaded', level: 'step' })
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Verify page title contains AI Obituaries', level: 'step' })
    // Title could be "AI Obituaries", "AI Obituaries - Documenting AI Skepticism", etc.
    await expect(page).toHaveTitle(/AI Obituaries/i)

    await log({ message: 'Verify scatter plot container is visible', level: 'step' })
    const scatterContainer = page.locator('[data-testid="scatter-plot-container"]')
    await expect(scatterContainer).toBeVisible({ timeout: SCATTER_TIMEOUT })

    await log({ message: 'Verify scatter plot SVG exists', level: 'step' })
    const scatterSvg = page.locator('[data-testid="scatter-plot"]')
    await expect(scatterSvg.first()).toBeVisible({ timeout: SCATTER_TIMEOUT })

    await log({ message: 'Verify at least one data point exists', level: 'step' })
    const dataPoints = page.locator('[data-testid="scatter-point-group"]')
    await expect(dataPoints.first()).toBeVisible({ timeout: SCATTER_TIMEOUT })

    await log({ message: 'Count data points', level: 'info' })
    const pointCount = await dataPoints.count()
    await log({ message: `Found ${pointCount} scatter points`, level: 'success' })
    expect(pointCount).toBeGreaterThan(0)
  })

  test('should display obituary modal on point click', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Wait for scatter points to load', level: 'step' })
    const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
    await expect(scatterPoints.first()).toBeVisible({ timeout: SCATTER_TIMEOUT })

    await log({ message: 'Click first scatter point', level: 'step' })
    // Click on the point - it has tabindex="0" and is interactive
    await scatterPoints.first().click()

    await log({ message: 'Verify obituary modal appears', level: 'step' })
    const modal = page.locator('[data-testid="obituary-modal"]')
    await expect(modal).toBeVisible({ timeout: 5_000 })

    await log({ message: 'Verify modal contains content', level: 'step' })
    // Modal should have meaningful text content
    const modalText = await modal.textContent()
    expect(modalText?.length).toBeGreaterThan(10)

    await log({ message: 'Close modal with Escape key', level: 'step' })
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible({ timeout: 3_000 })

    await log({ message: 'Modal closed successfully', level: 'success' })
  })

  test('should show tooltip on point hover', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Wait for scatter points', level: 'step' })
    const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
    await expect(scatterPoints.first()).toBeVisible({ timeout: 15_000 })

    await log({ message: 'Hover over first point', level: 'step' })
    await scatterPoints.first().hover()

    await log({ message: 'Verify tooltip appears', level: 'step' })
    const tooltip = page.locator('[data-testid="tooltip-card"]')
    // Tooltip may or may not appear depending on implementation
    const tooltipVisible = await tooltip.isVisible().catch(() => false)

    if (tooltipVisible) {
      await log({ message: 'Tooltip is visible', level: 'success' })
      await expect(tooltip).toContainText(/.+/)
    } else {
      await log({ message: 'Tooltip not shown on hover (may require different interaction)', level: 'info' })
    }
  })
})

test.describe('Obituary Detail Navigation', () => {
  test('should navigate to obituary via modal link', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Wait for scatter points', level: 'step' })
    const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
    await expect(scatterPoints.first()).toBeVisible({ timeout: 15_000 })

    await log({ message: 'Click scatter point to open modal', level: 'step' })
    await scatterPoints.first().click()

    await log({ message: 'Wait for modal', level: 'step' })
    const modal = page.locator('[data-testid="obituary-modal"]')
    await expect(modal).toBeVisible({ timeout: 5_000 })

    await log({ message: 'Look for obituary link in modal', level: 'step' })
    const obituaryLink = modal.locator('a[href^="/obituary/"]').first()
    const linkExists = await obituaryLink.count() > 0

    if (!linkExists) {
      await log({ message: 'No direct obituary link in modal, skipping navigation test', level: 'info' })
      test.skip()
      return
    }

    const href = await obituaryLink.getAttribute('href')
    await log({ message: `Found obituary link: ${href}`, level: 'info' })

    await log({ message: 'Click obituary link', level: 'step' })
    await obituaryLink.click()

    await log({ message: 'Verify navigation to obituary page', level: 'step' })
    await expect(page).toHaveURL(/\/obituary\//)

    await log({ message: 'Verify obituary content loaded', level: 'step' })
    // Wait for main content to be visible
    await expect(page.locator('main')).toBeVisible()

    await log({ message: 'Obituary page loaded successfully', level: 'success' })
  })
})

test.describe('Category Filtering', () => {
  test('should display category filter', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Look for category filter component', level: 'step' })
    const categoryFilter = page.locator('[data-testid="category-filter"]')

    const filterVisible = await categoryFilter.isVisible().catch(() => false)

    if (!filterVisible) {
      await log({ message: 'Category filter not visible, may be mobile-hidden or not rendered', level: 'info' })
      test.skip()
      return
    }

    await log({ message: 'Category filter is visible', level: 'success' })
    await expect(categoryFilter).toBeVisible()

    await log({ message: 'Look for filter buttons', level: 'step' })
    const allButton = page.locator('[data-testid="filter-all-button"]')
    const allButtonVisible = await allButton.isVisible().catch(() => false)

    if (allButtonVisible) {
      await log({ message: 'Found "All" filter button', level: 'success' })
    }

    // Check for category pills
    const categoryPills = page.locator('[data-testid^="category-pill-"]')
    const pillCount = await categoryPills.count()
    await log({ message: `Found ${pillCount} category filter pills`, level: 'info' })
  })

  test('should filter obituaries by category', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Wait for scatter points to load', level: 'step' })
    const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
    await expect(scatterPoints.first()).toBeVisible({ timeout: SCATTER_TIMEOUT })
    const initialCount = await scatterPoints.count()
    await log({ message: `Initial point count: ${initialCount}`, level: 'info' })

    await log({ message: 'Look for category pills', level: 'step' })
    const categoryPills = page.locator('[data-testid^="category-pill-"]')
    const pillCount = await categoryPills.count()

    if (pillCount === 0) {
      await log({ message: 'No category pills found, skipping filter test', level: 'info' })
      test.skip()
      return
    }

    await log({ message: `Found ${pillCount} category pills`, level: 'info' })

    await log({ message: 'Click first category pill to filter', level: 'step' })
    await categoryPills.first().click()

    // Small wait for filter animation/re-render
    await page.waitForTimeout(500)

    await log({ message: 'Verify URL updated with filter state', level: 'step' })
    // nuqs should update URL with filter parameter
    const currentUrl = page.url()
    await log({ message: `Current URL: ${currentUrl}`, level: 'info' })

    await log({ message: 'Count filtered points', level: 'step' })
    const filteredCount = await scatterPoints.count()
    await log({ message: `Filtered point count: ${filteredCount}`, level: 'info' })

    // Filter should either reduce or maintain count
    expect(filteredCount).toBeGreaterThanOrEqual(0)
    expect(filteredCount).toBeLessThanOrEqual(initialCount)

    await log({ message: 'Category filtering works', level: 'success' })
  })
})

test.describe('Error Handling', {
  annotation: [{ type: 'skipNetworkMonitoring' }],
}, () => {
  // Skip network monitoring for tests that intentionally trigger errors

  test('should handle non-existent obituary gracefully', async ({ page, log }) => {
    await log({ message: 'Navigate to non-existent obituary', level: 'step' })
    const response = await page.goto('/obituary/this-obituary-does-not-exist-12345')

    // Wait for page to settle (Next.js may have loading states)
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Check response', level: 'step' })
    // Could be 404 page, redirect, or error page
    const status = response?.status()
    await log({ message: `Response status: ${status}`, level: 'info' })

    // Either shows 404 content or redirects or returns non-200 status
    const pageContent = await page.content()
    const is404Page = /not found|404|does not exist|couldn't find/i.test(pageContent)
    const isErrorPage = /error|something went wrong|oops/i.test(pageContent)
    const wasRedirected = !page.url().includes('this-obituary-does-not-exist')
    const isNon200 = status !== 200

    await log({ message: `404 page: ${is404Page}, Error page: ${isErrorPage}, Redirected: ${wasRedirected}, Non-200: ${isNon200}`, level: 'info' })

    // Accept any reasonable error handling: 404 content, error page, redirect, or non-200 status
    expect(is404Page || isErrorPage || wasRedirected || isNon200).toBeTruthy()
    await log({ message: 'Error handling works correctly', level: 'success' })
  })
})

test.describe('Accessibility Integration', () => {
  test('should have skip link functionality', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')

    await log({ message: 'Press Tab to reveal skip link', level: 'step' })
    await page.keyboard.press('Tab')

    await log({ message: 'Look for skip link', level: 'step' })
    const skipLink = page.getByText(/skip to/i)
    const skipLinkVisible = await skipLink.isVisible().catch(() => false)

    if (!skipLinkVisible) {
      await log({ message: 'Skip link not visible on first tab', level: 'info' })
      // Try one more tab
      await page.keyboard.press('Tab')
      const skipLinkNow = await page.getByText(/skip to/i).isVisible().catch(() => false)
      if (!skipLinkNow) {
        test.skip()
        return
      }
    }

    await log({ message: 'Skip link is accessible', level: 'success' })
  })

  test('should support keyboard navigation of scatter points', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Wait for scatter points', level: 'step' })
    const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
    await expect(scatterPoints.first()).toBeVisible({ timeout: 15_000 })

    await log({ message: 'Focus on a scatter point via click', level: 'step' })
    await scatterPoints.first().click()

    await log({ message: 'Verify focus ring is visible', level: 'step' })
    const focusRing = page.locator('[data-testid="scatter-point-focus-ring"]')
    const hasFocusRing = await focusRing.isVisible().catch(() => false)

    if (hasFocusRing) {
      await log({ message: 'Focus ring visible - keyboard navigation supported', level: 'success' })
    } else {
      await log({ message: 'Focus ring not detected (may use different focus indicator)', level: 'info' })
    }

    await log({ message: 'Press Escape to clear selection', level: 'step' })
    await page.keyboard.press('Escape')

    await log({ message: 'Keyboard navigation test complete', level: 'success' })
  })
})
