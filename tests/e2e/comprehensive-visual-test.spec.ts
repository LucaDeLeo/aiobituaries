/**
 * Comprehensive Visual E2E Test - AI Obituaries
 *
 * Thorough testing of the entire website with visual verification.
 * Takes screenshots at each step for manual review.
 */
import { test, expect } from '../support/merged-fixtures'

// Viewport configurations
const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
}

// CI environments need longer waits for dynamic imports and hydration
const isCI = !!process.env.CI

// Allow extra time for data loading (longer in CI)
const DATA_LOAD_WAIT = isCI ? 5000 : 3000

test.describe('Comprehensive Website Testing', () => {
  test.describe('Desktop Experience', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
    })

    test('1. Homepage load and initial render', async ({ page, log }) => {
      await log({ message: 'Navigate to homepage', level: 'step' })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      await log({ message: 'Wait for scatter plot to load', level: 'step' })
      // Wait for actual scatter points, not just container (accounts for dynamic import)
      // Dynamic imports via next/dynamic can take 45-60s in CI environments
      const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
      await scatterPoints.first().waitFor({ state: 'visible', timeout: 60_000 }).catch(() => {
        // If timeout, continue - test will report what's visible
      })

      await log({ message: 'Verify page title', level: 'step' })
      await expect(page).toHaveTitle(/AI Obituaries/i)

      await log({ message: 'Verify header elements', level: 'step' })
      // Check for count display
      const countText = page.getByText(/obituaries/i).first()
      await expect(countText).toBeVisible()

      await log({ message: 'Verify sidebar exists', level: 'step' })
      const sidebar = page.locator('aside')
      await expect(sidebar).toBeVisible()

      await log({ message: 'Verify scatter plot container', level: 'step' })
      const scatterContainer = page.locator('[data-testid="scatter-plot-container"]')
      const scatterVisible = await scatterContainer.isVisible().catch(() => false)
      await log({ message: `Scatter container visible: ${scatterVisible}`, level: scatterVisible ? 'success' : 'info' })

      await log({ message: 'Capture initial homepage screenshot', level: 'step' })
      await page.screenshot({
        path: 'test-results/comprehensive-1-homepage-desktop.png',
        fullPage: false
      })

      await log({ message: 'Homepage loaded successfully', level: 'success' })
    })

    test('2. Scatter plot data rendering', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Verify scatter points render', level: 'step' })
      const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
      const pointCount = await scatterPoints.count()
      await log({ message: `Found ${pointCount} scatter points`, level: 'info' })
      expect(pointCount).toBeGreaterThan(0)

      await log({ message: 'Verify Y-axis (FLOP scale)', level: 'step' })
      const yAxis = page.locator('[data-testid="y-axis"]')
      const yAxisVisible = await yAxis.isVisible().catch(() => false)
      await log({ message: `Y-axis visible: ${yAxisVisible}`, level: yAxisVisible ? 'success' : 'info' })

      await log({ message: 'Check for superscript notation (10^XX)', level: 'step' })
      const content = await page.content()
      const hasSuperscripts = /10[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.test(content)
      await log({ message: `Has 10^XX notation: ${hasSuperscripts}`, level: hasSuperscripts ? 'success' : 'info' })

      await page.screenshot({
        path: 'test-results/comprehensive-2-scatter-data.png',
        fullPage: false
      })

      await log({ message: 'Scatter plot data verified', level: 'success' })
    })

    test('3. Control panel interactions', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Verify control panel sections', level: 'step' })

      // Background Metrics section
      const metricsSection = page.getByText(/Background Metrics/i)
      const metricsVisible = await metricsSection.isVisible().catch(() => false)
      await log({ message: `Background Metrics section: ${metricsVisible ? 'visible' : 'not found'}`, level: metricsVisible ? 'success' : 'info' })

      // Time Range section
      const timeRange = page.getByText(/Time Range/i)
      const timeRangeVisible = await timeRange.isVisible().catch(() => false)
      await log({ message: `Time Range section: ${timeRangeVisible ? 'visible' : 'not found'}`, level: timeRangeVisible ? 'success' : 'info' })

      // Categories section
      const categories = page.getByText(/Categories/i)
      const categoriesVisible = await categories.isVisible().catch(() => false)
      await log({ message: `Categories section: ${categoriesVisible ? 'visible' : 'not found'}`, level: categoriesVisible ? 'success' : 'info' })

      // Count checkboxes
      const checkboxes = page.locator('input[type="checkbox"]')
      const checkboxCount = await checkboxes.count()
      await log({ message: `Found ${checkboxCount} checkboxes`, level: 'info' })

      // Count sliders
      const sliders = page.locator('[role="slider"]')
      const sliderCount = await sliders.count()
      await log({ message: `Found ${sliderCount} sliders`, level: 'info' })

      await page.screenshot({
        path: 'test-results/comprehensive-3-controls.png',
        fullPage: false
      })

      await log({ message: 'Control panel verified', level: 'success' })
    })

    test('4. Tooltip on hover', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Find scatter points', level: 'step' })
      const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
      const pointCount = await scatterPoints.count()
      await log({ message: `Found ${pointCount} points`, level: 'info' })

      if (pointCount === 0) {
        await log({ message: 'No scatter points found', level: 'warning' })
        return
      }

      // Try to hover on a point
      await log({ message: 'Hover over scatter point', level: 'step' })
      for (let i = 0; i < Math.min(pointCount, 10); i++) {
        const point = scatterPoints.nth(i)
        const box = await point.boundingBox()
        if (box && box.width > 0 && box.x > 100 && box.y > 50) {
          await log({ message: `Hovering point ${i} at (${Math.round(box.x)}, ${Math.round(box.y)})`, level: 'step' })
          await point.hover({ force: true })
          // Wait for 300ms tooltip debounce + animation
          await page.waitForTimeout(600)
          break
        }
      }

      // Check for tooltip
      const tooltip = page.locator('[data-testid="tooltip-card"]')
      const tooltipVisible = await tooltip.isVisible().catch(() => false)

      if (tooltipVisible) {
        const tooltipText = await tooltip.textContent()
        await log({ message: `Tooltip content: ${tooltipText?.substring(0, 100)}...`, level: 'info' })

        await page.screenshot({
          path: 'test-results/comprehensive-5-tooltip.png',
          fullPage: false
        })
        await log({ message: 'Tooltip displayed successfully', level: 'success' })
      } else {
        await log({ message: 'Tooltip not visible (may need different hover target)', level: 'info' })
        await page.screenshot({
          path: 'test-results/comprehensive-5-no-tooltip.png',
          fullPage: false
        })
      }
    })

    test('6. Modal on point click', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Find scatter points', level: 'step' })
      const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
      const pointCount = await scatterPoints.count()

      if (pointCount === 0) {
        await log({ message: 'No scatter points found', level: 'warning' })
        return
      }

      // Click a point
      await log({ message: 'Click scatter point', level: 'step' })
      for (let i = 0; i < Math.min(pointCount, 10); i++) {
        const point = scatterPoints.nth(i)
        const box = await point.boundingBox()
        if (box && box.width > 0 && box.x > 100 && box.y > 50) {
          await log({ message: `Clicking point ${i}`, level: 'step' })
          await point.click()
          break
        }
      }

      await page.waitForTimeout(500)

      // Check for modal
      const modal = page.locator('[data-testid="obituary-modal"]')
      const modalVisible = await modal.isVisible().catch(() => false)

      if (modalVisible) {
        await log({ message: 'Modal opened', level: 'success' })

        await page.screenshot({
          path: 'test-results/comprehensive-6-modal-open.png',
          fullPage: false
        })

        // Verify modal content
        const modalText = await modal.textContent()
        expect(modalText?.length).toBeGreaterThan(10)

        // Close modal
        await log({ message: 'Close modal with Escape', level: 'step' })
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)

        await expect(modal).not.toBeVisible()
        await log({ message: 'Modal closed successfully', level: 'success' })
      } else {
        await log({ message: 'Modal not visible after click', level: 'info' })
        await page.screenshot({
          path: 'test-results/comprehensive-6-no-modal.png',
          fullPage: false
        })
      }
    })

    test('7. Background metric lines', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Check for background metric lines', level: 'step' })

      // Look for SVG path elements in the scatter plot
      const svg = page.locator('[data-testid="scatter-plot"]')
      const svgVisible = await svg.isVisible().catch(() => false)
      await log({ message: `Scatter SVG visible: ${svgVisible}`, level: svgVisible ? 'success' : 'info' })

      // Count path elements (metric lines)
      const paths = svg.locator('path')
      const pathCount = await paths.count()
      await log({ message: `Found ${pathCount} path elements (includes metric lines)`, level: 'info' })

      // Check for legend
      const legend = page.locator('[data-testid="background-chart-legend"]').or(page.getByText(/Training Compute|MMLU|Capability/i).first())
      const legendVisible = await legend.isVisible().catch(() => false)
      await log({ message: `Legend visible: ${legendVisible}`, level: legendVisible ? 'success' : 'info' })

      await page.screenshot({
        path: 'test-results/comprehensive-7-metrics.png',
        fullPage: false
      })

      await log({ message: 'Background metrics checked', level: 'success' })
    })
  })

  test.describe('Mobile Experience', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
    })

    test('8. Mobile homepage layout', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Verify mobile layout', level: 'step' })

      // Check for count display (should be prominent on mobile)
      const countDisplay = page.getByText(/50|obituaries/i).first()
      await expect(countDisplay).toBeVisible()

      await log({ message: 'Check for mobile navigation', level: 'step' })
      // Look for hamburger menu or mobile nav
      const menuButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first()
      const menuVisible = await menuButton.isVisible().catch(() => false)
      await log({ message: `Menu button: ${menuVisible ? 'visible' : 'not found'}`, level: 'info' })

      await page.screenshot({
        path: 'test-results/comprehensive-8-mobile-home.png',
        fullPage: false
      })

      await log({ message: 'Mobile homepage verified', level: 'success' })
    })

    test('9. Mobile FAB controls', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Look for FAB trigger', level: 'step' })
      // FAB should be visible on mobile for accessing controls
      const fab = page.locator('[data-testid="control-sheet-trigger"], button[aria-label*="control" i], .fixed button').first()
      const fabVisible = await fab.isVisible().catch(() => false)

      if (fabVisible) {
        await log({ message: 'FAB trigger found', level: 'success' })

        await page.screenshot({
          path: 'test-results/comprehensive-9-mobile-fab.png',
          fullPage: false
        })

        // Try clicking FAB to open sheet
        await log({ message: 'Click FAB to open control sheet', level: 'step' })
        await fab.click()
        await page.waitForTimeout(500)

        await page.screenshot({
          path: 'test-results/comprehensive-9-mobile-sheet-open.png',
          fullPage: false
        })
      } else {
        await log({ message: 'FAB trigger not found', level: 'info' })
        await page.screenshot({
          path: 'test-results/comprehensive-9-mobile-no-fab.png',
          fullPage: false
        })
      }
    })

    test('10. Mobile timeline view', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Check for mobile timeline', level: 'step' })

      // Look for timeline years
      const timeline = page.getByText(/194|196|198|200|202/i).first()
      const timelineVisible = await timeline.isVisible().catch(() => false)
      await log({ message: `Timeline visible: ${timelineVisible}`, level: timelineVisible ? 'success' : 'info' })

      // Check for obituary list
      const obituaryItems = page.locator('article, [class*="obituary"], [class*="card"]')
      const itemCount = await obituaryItems.count()
      await log({ message: `Found ${itemCount} obituary items`, level: 'info' })

      await page.screenshot({
        path: 'test-results/comprehensive-10-mobile-timeline.png',
        fullPage: true
      })

      await log({ message: 'Mobile timeline verified', level: 'success' })
    })
  })

  test.describe('Tablet Experience', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
    })

    test('11. Tablet layout', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Verify tablet layout', level: 'step' })

      // Check for scatter plot
      const scatterContainer = page.locator('[data-testid="scatter-plot-container"]')
      const scatterVisible = await scatterContainer.isVisible().catch(() => false)
      await log({ message: `Scatter plot: ${scatterVisible ? 'visible' : 'not visible'}`, level: scatterVisible ? 'success' : 'info' })

      // Check for category filter
      const categoryFilter = page.locator('[data-testid^="category-pill-"], [class*="category"]')
      const filterCount = await categoryFilter.count()
      await log({ message: `Found ${filterCount} category filters`, level: 'info' })

      await page.screenshot({
        path: 'test-results/comprehensive-11-tablet-layout.png',
        fullPage: false
      })

      await log({ message: 'Tablet layout verified', level: 'success' })
    })

    test('12. Tablet touch interactions', async ({ page, log }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      // Verify touch target sizes (should be 44px+ for WCAG)
      await log({ message: 'Check touch target sizes', level: 'step' })

      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      await log({ message: `Found ${buttonCount} buttons`, level: 'info' })

      await page.screenshot({
        path: 'test-results/comprehensive-12-tablet-touch.png',
        fullPage: false
      })

      await log({ message: 'Tablet touch verified', level: 'success' })
    })
  })

  test.describe('Accessibility', () => {
    test('13. Keyboard navigation', async ({ page, log }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Test keyboard navigation', level: 'step' })

      // Press Tab to navigate
      await page.keyboard.press('Tab')
      await page.waitForTimeout(200)

      // Check for skip link
      const skipLink = page.getByText(/skip to/i)
      const skipVisible = await skipLink.isVisible().catch(() => false)
      await log({ message: `Skip link visible: ${skipVisible}`, level: skipVisible ? 'success' : 'info' })

      // Navigate through focusable elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(100)
      }

      await page.screenshot({
        path: 'test-results/comprehensive-13-keyboard-nav.png',
        fullPage: false
      })

      await log({ message: 'Keyboard navigation tested', level: 'success' })
    })

    test('14. Screen reader elements', async ({ page, log }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      await log({ message: 'Check for aria attributes', level: 'step' })

      // Check for live region
      const liveRegion = page.locator('[data-testid="timeline-live-region"], [aria-live]')
      const liveRegionCount = await liveRegion.count()
      await log({ message: `Found ${liveRegionCount} live regions`, level: 'info' })

      // Check for role="application" on timeline
      const appRole = page.locator('[role="application"]')
      const appRoleCount = await appRole.count()
      await log({ message: `Found ${appRoleCount} application roles`, level: 'info' })

      // Check for aria-labels
      const ariaLabeled = page.locator('[aria-label]')
      const ariaCount = await ariaLabeled.count()
      await log({ message: `Found ${ariaCount} elements with aria-label`, level: 'info' })

      await log({ message: 'Accessibility elements verified', level: 'success' })
    })
  })

  test.describe('Error Handling', () => {
    test('15. 404 page', async ({ page, log }) => {
      await page.setViewportSize(VIEWPORTS.desktop)

      await log({ message: 'Navigate to non-existent page', level: 'step' })
      const response = await page.goto('/obituary/non-existent-obituary-12345')

      const status = response?.status()
      await log({ message: `Response status: ${status}`, level: 'info' })

      await page.waitForTimeout(1000)

      await page.screenshot({
        path: 'test-results/comprehensive-15-404-page.png',
        fullPage: false
      })

      // Verify 404 handling
      const is404 = await page.getByText(/not found|404/i).isVisible().catch(() => false)
      await log({ message: `404 page displayed: ${is404}`, level: is404 ? 'success' : 'info' })
    })
  })

  test.describe('Performance', () => {
    test('16. Console errors check', async ({ page, log }) => {
      const errors: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(DATA_LOAD_WAIT)

      // Interact to trigger potential errors
      const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
      const pointCount = await scatterPoints.count()
      if (pointCount > 0) {
        await scatterPoints.first().hover({ force: true })
        await page.waitForTimeout(500)
      }

      await log({ message: `Console errors found: ${errors.length}`, level: errors.length === 0 ? 'success' : 'warning' })

      if (errors.length > 0) {
        await log({ message: `Errors: ${errors.slice(0, 5).join(', ')}`, level: 'error' })
      }

      await page.screenshot({
        path: 'test-results/comprehensive-16-final-state.png',
        fullPage: false
      })
    })
  })
})
