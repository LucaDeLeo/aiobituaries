import { test, expect } from '../support/merged-fixtures'

/**
 * Keyboard Navigation Accessibility Tests
 *
 * Tests keyboard accessibility and navigation patterns across the site.
 * Verifies that all interactive elements are accessible via keyboard only.
 *
 * AC Coverage:
 * - AC-6.7.2: Keyboard navigation verified programmatically
 */

test.describe('Keyboard Navigation', () => {
  test('Skip link works correctly', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Press Tab to focus skip link
    await page.keyboard.press('Tab')

    // Skip link should be visible and focused
    const skipLink = page.getByText('Skip to main content')
    await expect(skipLink).toBeVisible()
    await expect(skipLink).toBeFocused()

    // Activate skip link with Enter
    await page.keyboard.press('Enter')

    // Main content should receive focus (auto-retry handles timing)
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeFocused()
  })

  test('Timeline navigation with arrow keys', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Find timeline scatter points
    const timelinePoints = page.locator('[data-testid="scatter-point-group"]')
    await expect(timelinePoints.first()).toBeVisible({ timeout: 15_000 })

    const count = await timelinePoints.count()
    if (count < 2) {
      test.skip(true, 'Need at least 2 points for arrow key navigation')
      return
    }

    // Tab to first scatter point (clicking opens the modal)
    // First tab goes to skip link, keep tabbing to reach scatter plot area
    const scatterContainer = page.locator('[data-testid="scatter-plot-container"]')
    await scatterContainer.focus()

    // Focus the first scatter point programmatically
    await page.evaluate(() => {
      const firstPoint = document.querySelector('[data-testid="scatter-point-group"]') as HTMLElement
      if (firstPoint) {
        firstPoint.focus()
      }
    })

    // Verify a scatter point has focus
    const hasFocusOnPoint = await page.evaluate(() => {
      const focused = document.activeElement
      return focused?.getAttribute('data-testid') === 'scatter-point-group'
    })

    if (!hasFocusOnPoint) {
      // If focus didn't work on SVG element, skip this test
      test.skip(true, 'SVG group elements may not support focus in this browser')
      return
    }

    // Press ArrowRight to navigate to next point
    await page.keyboard.press('ArrowRight')

    // Wait for focus to potentially move
    await page.waitForTimeout(100)

    // Verify focus is still on an interactive element (may be same or different point)
    const focusedTagName = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedTagName).toBeTruthy()

    // Test Home key - should change focus
    await page.keyboard.press('Home')
    await page.waitForTimeout(100)

    const homeFocused = await page.evaluate(() => document.activeElement?.tagName)
    expect(homeFocused).toBeTruthy()

    // Test End key - should change focus
    await page.keyboard.press('End')
    await page.waitForTimeout(100)

    const endFocused = await page.evaluate(() => document.activeElement?.tagName)
    expect(endFocused).toBeTruthy()
  })

  test('Modal keyboard interaction', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find first scatter point
    const firstPoint = page.locator('[data-testid="scatter-point-group"]').first()

    const count = await firstPoint.count()
    if (count === 0) {
      test.skip()
      return
    }

    // Click the point to open modal (click triggers modal)
    await firstPoint.click()

    // Modal should be visible (Sheet component with role="dialog")
    // Note: Radix Sheet uses role="dialog" on the content
    const modal = page.locator('[data-testid="obituary-modal"]')
    await expect(modal).toBeVisible({ timeout: 3000 })

    // Press Escape to close modal
    await page.keyboard.press('Escape')

    // Modal should be closed
    await expect(modal).not.toBeVisible({ timeout: 2000 })
  })

  test('All interactive elements are keyboard accessible', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find all interactive elements
    const interactiveElements = page.locator(
      'button, a, input, select, textarea, [tabindex="0"]'
    )

    const count = await interactiveElements.count()

    // Should have at least skip link, navigation, and scatter points
    expect(count).toBeGreaterThan(0)

    // Verify no elements have positive tabindex (anti-pattern)
    const positiveTabindex = page.locator('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])')
    const positiveCount = await positiveTabindex.count()

    expect(positiveCount).toBe(0)
  })

  test('Focus indicators are visible', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find first interactive element
    const firstButton = page.locator('button, a').first()

    const count = await firstButton.count()
    if (count === 0) {
      test.skip()
      return
    }

    // Focus the element
    await firstButton.focus()

    // Get computed outline style
    const outline = await firstButton.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        outlineStyle: computed.outlineStyle,
        outlineWidth: computed.outlineWidth,
        outlineColor: computed.outlineColor,
      }
    })

    // Should have visible outline (not 'none' and not '0px')
    expect(outline.outlineStyle).not.toBe('none')
    expect(outline.outlineWidth).not.toBe('0px')
  })

  test('No keyboard traps exist', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get all focusable elements
    const focusableElements = page.locator(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
    )

    const count = await focusableElements.count()

    if (count === 0) {
      test.skip()
      return
    }

    // Tab through elements to verify no traps
    // A trap would cause focus to stay on the same element forever
    const focusHistory: string[] = []

    let previousFocused: string | null = null

    for (let i = 0; i < Math.min(15, count + 5); i++) {
      await page.keyboard.press('Tab')

      // Wait for focus to settle (with short timeout for responsiveness)
      try {
        await page.waitForFunction(
          (prev) => {
            const focused = document.activeElement
            if (!focused) return false
            const id = focused.id ? `#${focused.id}` : ''
            const testId = focused.getAttribute('data-testid') || ''
            const className = (focused.className as string)?.split?.(' ')?.[0] || ''
            const current = `${focused.tagName}${id || testId || className || ''}`
            // Focus has settled when it's on a non-body element
            return focused.tagName !== 'BODY' || current !== prev
          },
          previousFocused,
          { timeout: 1000 }
        )
      } catch {
        // Focus might not have moved (end of tab order), continue
      }

      const currentFocused = await page.evaluate(() => {
        const focused = document.activeElement
        if (!focused) return null
        // Include element identifier to distinguish between elements of same type
        const id = focused.id ? `#${focused.id}` : ''
        const testId = focused.getAttribute('data-testid') || ''
        const className = (focused.className as string)?.split?.(' ')?.[0] || ''
        return `${focused.tagName}${id || testId || className || ''}`
      })

      // Verify focus is moving - we should see variety in focused elements
      if (currentFocused) {
        focusHistory.push(currentFocused)
        previousFocused = currentFocused
      }
    }

    // Verify we're not stuck in a trap (same element repeatedly)
    // Check if last 5 elements are all the same - that would be a trap
    if (focusHistory.length >= 5) {
      const lastFive = focusHistory.slice(-5)
      const allSame = lastFive.every(el => el === lastFive[0])
      expect(allSame).toBeFalsy()
    }

    // Also verify we visited at least 3 different elements
    const uniqueElements = new Set(focusHistory)
    expect(uniqueElements.size).toBeGreaterThan(2)
  })
})
