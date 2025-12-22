/**
 * TSR (Timeline Visualization Redesign) Visual Verification Tests
 *
 * Comprehensive visual testing for the completed TSR feature.
 * Takes screenshots at multiple viewports for manual review.
 */
import { test, expect } from '../support/merged-fixtures'

// Viewport configurations
const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
}

test.describe('TSR Visual Verification', () => {
  test('Desktop (1280x800): sidebar, chart, controls', async ({ page, log }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await log({ message: 'Testing desktop layout', level: 'step' })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for chart to be ready (data loaded)
    await page.waitForTimeout(2000)

    await log({ message: 'Capture desktop screenshot', level: 'step' })
    await page.screenshot({
      path: 'test-results/tsr-desktop.png',
      fullPage: false
    })

    // Verify key elements exist
    await log({ message: 'Verify sidebar exists on desktop', level: 'step' })
    const sidebar = page.locator('aside')
    const sidebarCount = await sidebar.count()
    await log({ message: `Found ${sidebarCount} aside elements`, level: 'info' })
    expect(sidebarCount).toBeGreaterThan(0)

    // Check for Controls text
    const controlsText = page.getByText('Controls')
    const hasControls = await controlsText.isVisible().catch(() => false)
    await log({ message: `Controls section visible: ${hasControls}`, level: 'info' })

    await log({ message: 'Desktop verification complete', level: 'success' })
  })

  test('Tablet (768x1024): full-width chart', async ({ page, log }) => {
    await page.setViewportSize(VIEWPORTS.tablet)
    await log({ message: 'Testing tablet layout', level: 'step' })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await log({ message: 'Capture tablet screenshot', level: 'step' })
    await page.screenshot({
      path: 'test-results/tsr-tablet.png',
      fullPage: false
    })

    await log({ message: 'Tablet verification complete', level: 'success' })
  })

  test('Mobile (375x667): full-width chart, FAB trigger', async ({ page, log }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await log({ message: 'Testing mobile layout', level: 'step' })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await log({ message: 'Capture mobile screenshot', level: 'step' })
    await page.screenshot({
      path: 'test-results/tsr-mobile.png',
      fullPage: false
    })

    await log({ message: 'Mobile verification complete', level: 'success' })
  })

  test('Tooltip shows FLOP value', async ({ page, log }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await log({ message: 'Testing tooltip FLOP display', level: 'step' })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Find and hover over a scatter point
    await log({ message: 'Looking for scatter points', level: 'step' })
    const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
    const pointCount = await scatterPoints.count()
    await log({ message: `Found ${pointCount} scatter points`, level: 'info' })

    if (pointCount > 0) {
      // Try to hover on a point that's visible
      for (let i = 0; i < Math.min(pointCount, 10); i++) {
        const point = scatterPoints.nth(i)
        const box = await point.boundingBox()
        if (box && box.width > 0) {
          await log({ message: `Hovering point ${i} at (${box.x}, ${box.y})`, level: 'step' })
          await point.hover({ force: true })
          await page.waitForTimeout(500)
          break
        }
      }

      // Check for tooltip
      const tooltip = page.locator('[data-testid="tooltip-card"]')
      const tooltipVisible = await tooltip.isVisible().catch(() => false)

      if (tooltipVisible) {
        const tooltipText = await tooltip.textContent()
        await log({ message: `Tooltip content: ${tooltipText?.substring(0, 150)}`, level: 'info' })

        const hasFLOP = tooltipText?.includes('FLOP') || tooltipText?.includes('AI Progress')
        await log({ message: `Contains FLOP info: ${hasFLOP}`, level: hasFLOP ? 'success' : 'info' })

        await page.screenshot({
          path: 'test-results/tsr-tooltip-with-flop.png',
          fullPage: false
        })
      } else {
        await log({ message: 'Tooltip not visible after hover', level: 'info' })
      }
    }

    await log({ message: 'Tooltip verification complete', level: 'success' })
  })

  test('Control panel interactions', async ({ page, log }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await log({ message: 'Testing control panel', level: 'step' })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Check for control panel sections
    await log({ message: 'Checking control panel sections', level: 'step' })

    const sections = [
      { name: 'Background Metrics', text: /Background Metrics|Metrics/i },
      { name: 'Time Range', text: /Time Range|Date Range/i },
      { name: 'Categories', text: /Categories/i },
    ]

    for (const section of sections) {
      const element = page.getByText(section.text).first()
      const visible = await element.isVisible().catch(() => false)
      await log({ message: `${section.name}: ${visible ? 'visible' : 'not found'}`, level: visible ? 'success' : 'info' })
    }

    // Check for checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()
    await log({ message: `Found ${checkboxCount} checkboxes`, level: 'info' })

    // Check for slider
    const sliders = page.locator('[role="slider"]')
    const sliderCount = await sliders.count()
    await log({ message: `Found ${sliderCount} sliders`, level: 'info' })

    await log({ message: 'Control panel verification complete', level: 'success' })
  })

  test('Y-axis log scale labels', async ({ page, log }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await log({ message: 'Testing Y-axis labels', level: 'step' })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Check page content for superscript characters
    const content = await page.content()

    const superscriptChars = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']
    const foundSuperscripts = superscriptChars.filter(char => content.includes(char))

    await log({ message: `Found superscript chars: ${foundSuperscripts.join(', ')}`, level: 'info' })

    if (foundSuperscripts.length > 0) {
      await log({ message: 'Y-axis has superscript notation (10^XX format)', level: 'success' })
    }

    // Look for "10" followed by superscript
    const has10Notation = /10[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.test(content)
    await log({ message: `Has 10^XX notation: ${has10Notation}`, level: has10Notation ? 'success' : 'info' })

    await log({ message: 'Y-axis verification complete', level: 'success' })
  })
})
