import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Automated Accessibility Tests with axe-core
 *
 * Tests WCAG 2.1 Level A and AA compliance across all major page types
 * and interactive components using the axe accessibility engine.
 *
 * AC Coverage:
 * - AC-6.7.1: Automated axe tests pass with zero violations
 * - AC-6.7.8: Homepage passes axe automated checks
 * - AC-6.7.9: Obituary page passes axe automated checks
 * - AC-6.7.10: Modal dialog passes axe automated checks
 * - AC-6.7.11: Table view passes axe automated checks
 */

test.describe('Accessibility Audit with axe-core', () => {
  test('Homepage passes automated accessibility checks', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Run axe accessibility scan with WCAG 2.1 AA tags
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Assert zero violations (AC-6.7.8)
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Obituary detail page passes automated accessibility checks', async ({ page }) => {
    // Navigate to homepage first
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get first obituary link
    const firstLink = page.locator('a[href^="/obituary/"]').first()

    // Check if obituary links exist
    const count = await firstLink.count()
    if (count === 0) {
      test.skip()
      return
    }

    const href = await firstLink.getAttribute('href')

    // Navigate to obituary detail page
    await page.goto(href!)
    await page.waitForLoadState('networkidle')

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Assert zero violations (AC-6.7.9)
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Modal dialog passes automated accessibility checks', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find and click first scatter point to open modal
    const scatterPoint = page.locator('[data-obituary-id]').first()

    // Check if scatter points exist
    const count = await scatterPoint.count()
    if (count === 0) {
      test.skip()
      return
    }

    await scatterPoint.click()

    // Wait for modal to be visible
    const modal = page.locator('[role="dialog"]')
    await modal.waitFor({ state: 'visible', timeout: 5000 })

    // Run axe accessibility scan scoped to modal
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Assert zero violations (AC-6.7.10)
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Table view passes automated accessibility checks', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for table view toggle button
    const tableToggle = page.getByRole('button', { name: /table/i })

    // Check if table view exists
    const count = await tableToggle.count()
    if (count === 0) {
      // Table view might not be implemented yet, skip test
      test.skip()
      return
    }

    // Switch to table view
    await tableToggle.click()

    // Wait for view transition
    await page.waitForTimeout(500)

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Assert zero violations (AC-6.7.11)
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Category filter passes automated accessibility checks', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for category filter component
    const filterComponent = page.locator('[data-testid="category-filter"]')

    const count = await filterComponent.count()

    if (count > 0) {
      // Run axe scan scoped to filter component
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="category-filter"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    } else {
      // Filter component might use different selector, scan whole page
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      // Should have no violations regardless
      expect(accessibilityScanResults.violations).toEqual([])
    }
  })
})
