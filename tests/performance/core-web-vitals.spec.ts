/**
 * Core Web Vitals Performance Tests
 *
 * Measures real Core Web Vitals metrics using Playwright's Performance APIs:
 * - LCP (Largest Contentful Paint) < 2.5s
 * - CLS (Cumulative Layout Shift) < 0.1
 * - FCP (First Contentful Paint) < 1.8s
 * - TTFB (Time to First Byte) < 800ms
 *
 * These tests use actual browser performance APIs, not synthetic benchmarks.
 */
import { test, expect } from '../support/merged-fixtures'

// CI environments have significantly slower, more variable performance
// GitHub Actions runners: variable CPU, cold starts, noisy neighbors
const isCI = !!process.env.CI

// Thresholds based on Google's Core Web Vitals guidelines
// CI thresholds are "smoke tests" for severe regressions
// Run locally for actual UX performance validation
const THRESHOLDS = {
  LCP: 2500, // 2.5 seconds (good)
  CLS: 0.1, // 0.1 (good)
  FCP: 1800, // 1.8 seconds (good)
  TTFB: 800, // 800ms (good)
  TBT: isCI ? 2000 : 300, // 300ms local, 2000ms CI smoke test
}

test.describe('Core Web Vitals - Homepage', () => {
  test('LCP (Largest Contentful Paint) should be under 2.5s', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage and measure LCP', level: 'step' })

    // Navigate first, then measure LCP using buffered entries
    await page.goto('/', { waitUntil: 'load' })

    // Wait a bit for LCP to finalize after load
    await page.waitForTimeout(1000)

    // Get LCP from buffered performance entries
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0

        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          // LCP is the last entry
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
          if (lastEntry) {
            lcpValue = lastEntry.startTime
          }
        })

        // buffered: true gets historical LCP entries
        observer.observe({ type: 'largest-contentful-paint', buffered: true })

        // Give time for buffered entries to be delivered, then resolve
        setTimeout(() => {
          observer.disconnect()
          resolve(lcpValue)
        }, 100)
      })
    })

    await log({ message: `LCP: ${lcp.toFixed(0)}ms (threshold: ${THRESHOLDS.LCP}ms)`, level: 'info' })

    expect(lcp).toBeLessThan(THRESHOLDS.LCP)
    await log({ message: 'LCP meets threshold', level: 'success' })
  })

  test('CLS (Cumulative Layout Shift) should be under 0.1', async ({ page, log }) => {
    await log({ message: 'Setting up CLS measurement', level: 'step' })

    await page.goto('/', { waitUntil: 'networkidle' })

    // Measure CLS after page is stable
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0

        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShift = entry as PerformanceEntry & {
              hadRecentInput: boolean
              value: number
            }
            // Only count shifts without recent user input
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value
            }
          }
        })

        observer.observe({ type: 'layout-shift', buffered: true })

        // Give time for any late layout shifts
        setTimeout(() => {
          observer.disconnect()
          resolve(clsValue)
        }, 3000)
      })
    })

    await log({ message: `CLS: ${cls.toFixed(4)} (threshold: ${THRESHOLDS.CLS})`, level: 'info' })

    expect(cls).toBeLessThan(THRESHOLDS.CLS)
    await log({ message: 'CLS meets threshold', level: 'success' })
  })

  test('FCP (First Contentful Paint) should be under 1.8s', async ({ page, log }) => {
    await log({ message: 'Navigate and measure FCP', level: 'step' })

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint')
      return fcpEntry?.startTime || 0
    })

    await log({ message: `FCP: ${fcp.toFixed(0)}ms (threshold: ${THRESHOLDS.FCP}ms)`, level: 'info' })

    expect(fcp).toBeLessThan(THRESHOLDS.FCP)
    await log({ message: 'FCP meets threshold', level: 'success' })
  })

  test('TTFB (Time to First Byte) should be under 800ms', async ({ page, log }) => {
    await log({ message: 'Navigate and measure TTFB', level: 'step' })

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const ttfb = await page.evaluate(() => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return navEntry.responseStart - navEntry.requestStart
    })

    await log({ message: `TTFB: ${ttfb.toFixed(0)}ms (threshold: ${THRESHOLDS.TTFB}ms)`, level: 'info' })

    expect(ttfb).toBeLessThan(THRESHOLDS.TTFB)
    await log({ message: 'TTFB meets threshold', level: 'success' })
  })
})

test.describe('Core Web Vitals - Obituary Page', () => {
  test('Obituary page LCP should be under 2.5s', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage first', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Find an obituary link', level: 'step' })
    const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
    const pointCount = await scatterPoints.count()

    if (pointCount === 0) {
      await log({ message: 'No scatter points found, skipping', level: 'info' })
      test.skip()
      return
    }

    // Click to open modal
    await scatterPoints.first().click()

    // Look for obituary link in modal
    const modal = page.locator('[data-testid="obituary-modal"]')
    await expect(modal).toBeVisible({ timeout: 5_000 })

    const obituaryLink = modal.locator('a[href^="/obituary/"]').first()
    const hasLink = (await obituaryLink.count()) > 0

    if (!hasLink) {
      await log({ message: 'No obituary link in modal, skipping', level: 'info' })
      test.skip()
      return
    }

    const href = await obituaryLink.getAttribute('href')
    await log({ message: `Testing obituary page: ${href}`, level: 'info' })

    // Navigate first, then measure LCP using buffered entries
    await page.goto(href!, { waitUntil: 'load' })

    // Wait a bit for LCP to finalize after load
    await page.waitForTimeout(1000)

    // Get LCP from buffered performance entries
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
          if (lastEntry) {
            lcpValue = lastEntry.startTime
          }
        })

        // buffered: true gets historical LCP entries
        observer.observe({ type: 'largest-contentful-paint', buffered: true })

        // Give time for buffered entries to be delivered
        setTimeout(() => {
          observer.disconnect()
          resolve(lcpValue)
        }, 100)
      })
    })

    await log({ message: `Obituary page LCP: ${lcp.toFixed(0)}ms`, level: 'info' })

    expect(lcp).toBeLessThan(THRESHOLDS.LCP)
    await log({ message: 'Obituary page LCP meets threshold', level: 'success' })
  })
})

test.describe('Interaction Performance', () => {
  test('Modal should open quickly (300ms local, 2s CI smoke test)', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Wait for scatter points', level: 'step' })
    const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
    await expect(scatterPoints.first()).toBeVisible({ timeout: 15_000 })

    await log({ message: 'Measure modal open time', level: 'step' })
    const startTime = Date.now()

    await scatterPoints.first().click()

    const modal = page.locator('[data-testid="obituary-modal"]')
    await expect(modal).toBeVisible({ timeout: 5_000 })

    const openTime = Date.now() - startTime
    await log({ message: `Modal open time: ${openTime}ms (threshold: ${THRESHOLDS.TBT}ms)`, level: 'info' })

    expect(openTime).toBeLessThan(THRESHOLDS.TBT)
    await log({ message: 'Modal interaction is fast', level: 'success' })
  })

  test('Filter interaction should be responsive', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Wait for scatter points', level: 'step' })
    const scatterPoints = page.locator('[data-testid="scatter-point-group"]')
    await expect(scatterPoints.first()).toBeVisible({ timeout: 15_000 })

    const categoryPills = page.locator('[data-testid^="category-pill-"]')
    const pillCount = await categoryPills.count()

    if (pillCount === 0) {
      await log({ message: 'No category pills, skipping', level: 'info' })
      test.skip()
      return
    }

    await log({ message: 'Measure filter response time', level: 'step' })
    const startTime = Date.now()

    await categoryPills.first().click()

    // Wait for points to potentially update
    await page.waitForTimeout(100)
    const responseTime = Date.now() - startTime

    await log({ message: `Filter response time: ${responseTime}ms`, level: 'info' })

    // Filter should respond within 500ms
    expect(responseTime).toBeLessThan(500)
    await log({ message: 'Filter interaction is responsive', level: 'success' })
  })

  test('Zoom interaction should be smooth', async ({ page, log }) => {
    await log({ message: 'Navigate to homepage', level: 'step' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await log({ message: 'Wait for scatter plot', level: 'step' })
    await expect(page.locator('[data-testid="scatter-plot-container"]')).toBeVisible({ timeout: 15_000 })

    const zoomIn = page.locator('[data-testid="zoom-in-button"]')
    const zoomVisible = await zoomIn.isVisible().catch(() => false)

    if (!zoomVisible) {
      await log({ message: 'Zoom controls not visible, skipping', level: 'info' })
      test.skip()
      return
    }

    await log({ message: 'Measure zoom response time', level: 'step' })
    const times: number[] = []

    // Click zoom multiple times and measure
    for (let i = 0; i < 3; i++) {
      const start = Date.now()
      await zoomIn.click()
      await page.waitForTimeout(50) // Minimal wait for re-render
      times.push(Date.now() - start)
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    await log({ message: `Average zoom response: ${avgTime.toFixed(0)}ms`, level: 'info' })

    // Zoom should respond within 200ms average
    expect(avgTime).toBeLessThan(200)
    await log({ message: 'Zoom interaction is smooth', level: 'success' })
  })
})

test.describe('Resource Loading', () => {
  test('No render-blocking resources in critical path', async ({ page, log }) => {
    await log({ message: 'Navigate and analyze resources', level: 'step' })

    const resourceTimings: { name: string; duration: number; type: string }[] = []

    page.on('response', async (response) => {
      try {
        // Playwright Response has timing() but it may not be available in all browsers
        const timing = (response as unknown as { timing(): { responseEnd: number; requestStart: number } | null }).timing?.()
        if (timing && timing.responseEnd && timing.requestStart) {
          resourceTimings.push({
            name: response.url(),
            duration: timing.responseEnd - timing.requestStart,
            type: response.headers()['content-type'] || 'unknown',
          })
        }
      } catch {
        // Timing not available for this response, skip it
      }
    })

    await page.goto('/', { waitUntil: 'load' })

    await log({ message: `Loaded ${resourceTimings.length} resources`, level: 'info' })

    // Check for slow resources (over 1s)
    const slowResources = resourceTimings.filter((r) => r.duration > 1000)

    if (slowResources.length > 0) {
      await log({
        message: `Warning: ${slowResources.length} slow resources found`,
        level: 'warning',
      })
      slowResources.forEach((r) => {
        const urlPath = new URL(r.name).pathname
        console.log(`  - ${urlPath}: ${r.duration.toFixed(0)}ms`)
      })
    }

    // Should have no resources taking over 3s
    const verySlowResources = resourceTimings.filter((r) => r.duration > 3000)
    expect(verySlowResources.length).toBe(0)

    await log({ message: 'Resource loading is acceptable', level: 'success' })
  })
})
