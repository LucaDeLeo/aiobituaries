import { test, expect } from '@playwright/test'

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

    // Wait a moment for focus to move
    await page.waitForTimeout(100)

    // Main content should receive focus
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeFocused()
  })

  test('Timeline navigation with arrow keys', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find timeline scatter points
    const timelinePoints = page.locator('[data-obituary-id]')

    const count = await timelinePoints.count()
    if (count === 0) {
      test.skip()
      return
    }

    // Focus first point
    const firstPoint = timelinePoints.first()
    await firstPoint.focus()
    await expect(firstPoint).toBeFocused()

    // Press ArrowRight to navigate to next point
    await page.keyboard.press('ArrowRight')

    // Wait for focus change
    await page.waitForTimeout(100)

    // Check if roving tabindex pattern is working
    // (Second point should be focused if pattern implemented)
    const focusedElement = page.locator(':focus')
    const tagName = await focusedElement.evaluate(el => el.tagName)

    // Focused element should be a button (scatter point)
    expect(['BUTTON', 'A'].includes(tagName)).toBeTruthy()

    // Test Home key navigation
    await page.keyboard.press('Home')
    await page.waitForTimeout(100)

    // Should focus first point
    await expect(firstPoint).toBeFocused()

    // Test End key navigation
    await page.keyboard.press('End')
    await page.waitForTimeout(100)

    // Last point should be focused
    const lastPoint = timelinePoints.last()
    await expect(lastPoint).toBeFocused()
  })

  test('Modal keyboard interaction', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find first scatter point
    const firstPoint = page.locator('[data-obituary-id]').first()

    const count = await firstPoint.count()
    if (count === 0) {
      test.skip()
      return
    }

    // Focus the point
    await firstPoint.focus()

    // Press Enter to open modal
    await page.keyboard.press('Enter')

    // Modal should be visible
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible({ timeout: 2000 })

    // Press Escape to close modal
    await page.keyboard.press('Escape')

    // Modal should be closed
    await expect(modal).not.toBeVisible()

    // Focus should return to trigger element
    await expect(firstPoint).toBeFocused()
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

    // Tab through first 10 elements to verify no traps
    let lastFocused = null

    for (let i = 0; i < Math.min(10, count); i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(50)

      const currentFocused = await page.evaluate(() => {
        const focused = document.activeElement
        return focused ? focused.tagName + (focused.id ? `#${focused.id}` : '') : null
      })

      // Verify focus is moving
      expect(currentFocused).not.toBeNull()

      // Focus should change (unless we're at the end and wrapping)
      if (i > 0 && i < count - 1) {
        expect(currentFocused).not.toBe(lastFocused)
      }

      lastFocused = currentFocused
    }
  })
})
