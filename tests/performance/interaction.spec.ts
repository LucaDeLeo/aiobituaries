/**
 * Performance Interaction Tests
 *
 * Tests for runtime performance (AC-6.8.5 and AC-6.8.6):
 * - Timeline scroll maintains 60fps (>55fps acceptable)
 * - Modal opens within 300ms
 */

import { test, expect } from '@playwright/test'

test.describe('Timeline Scroll Performance (AC-6.8.5)', () => {
  test('Timeline maintains 55+ fps during scroll with 200+ points', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/')

    // Wait for timeline to load with data
    await page.waitForSelector('[data-testid="scatter-plot"]')

    // Count number of data points
    const pointCount = await page.locator('[data-testid="scatter-point"]').count()
    console.log(`Timeline has ${pointCount} points`)

    // We need at least 200 points for this test
    if (pointCount < 200) {
      test.skip(true, `Need 200+ points for FPS test, have ${pointCount}`)
      return
    }

    // Measure FPS during scroll
    const fpsData = await page.evaluate(() => {
      return new Promise<{ avgFps: number; minFps: number }>((resolve) => {
        let frameCount = 0
        const startTime = performance.now()
        let minFrameTime = Infinity
        let lastTime = startTime

        const measureFrames = () => {
          const currentTime = performance.now()
          const frameTime = currentTime - lastTime

          if (frameTime > 0) {
            minFrameTime = Math.min(minFrameTime, frameTime)
          }

          lastTime = currentTime
          frameCount++

          // Measure for 2 seconds
          if (currentTime - startTime < 2000) {
            requestAnimationFrame(measureFrames)
          } else {
            const duration = currentTime - startTime
            const avgFps = Math.round((frameCount * 1000) / duration)
            const minFps = Math.round(1000 / minFrameTime)
            resolve({ avgFps, minFps })
          }
        }

        // Start measuring
        requestAnimationFrame(measureFrames)

        // Trigger scroll by dispatching wheel events
        const timeline = document.querySelector('[data-testid="scatter-plot"]')
        if (timeline) {
          let scrollAmount = 0
          const scrollInterval = setInterval(() => {
            const wheelEvent = new WheelEvent('wheel', {
              deltaX: 50,
              deltaY: 0,
              bubbles: true,
              cancelable: true,
            })
            timeline.dispatchEvent(wheelEvent)
            scrollAmount += 50

            // Stop scrolling after 2 seconds
            if (scrollAmount > 2000) {
              clearInterval(scrollInterval)
            }
          }, 16) // ~60fps scroll events
        }
      })
    })

    console.log(`Average FPS: ${fpsData.avgFps}, Minimum FPS: ${fpsData.minFps}`)

    // AC-6.8.5: FPS should be > 55 (close to 60fps target)
    expect(fpsData.avgFps).toBeGreaterThanOrEqual(55)
    expect(fpsData.minFps).toBeGreaterThan(30) // Allow some variance but not below 30
  })
})

test.describe('Modal Performance (AC-6.8.6)', () => {
  test('Modal opens within 300ms from click', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/')

    // Wait for timeline to load
    await page.waitForSelector('[data-testid="scatter-plot"]')

    // Get first visible point
    const firstPoint = page.locator('[data-testid="scatter-point"]').first()
    await firstPoint.waitFor({ state: 'visible' })

    // Measure modal open time
    const openDuration = await page.evaluate(async () => {
      const startTime = performance.now()

      // Click the point
      const point = document.querySelector('[data-testid="scatter-point"]') as HTMLElement
      if (point) {
        point.click()
      }

      // Wait for modal to appear
      await new Promise<void>((resolve) => {
        const checkModal = () => {
          const modal = document.querySelector('[role="dialog"]')
          if (modal && window.getComputedStyle(modal).opacity === '1') {
            resolve()
          } else {
            requestAnimationFrame(checkModal)
          }
        }
        checkModal()
      })

      const endTime = performance.now()
      return endTime - startTime
    })

    console.log(`Modal opened in ${openDuration.toFixed(2)}ms`)

    // AC-6.8.6: Modal should open in < 300ms
    expect(openDuration).toBeLessThan(300)
  })

  test('Multiple modal opens maintain consistent performance', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await page.waitForSelector('[data-testid="scatter-plot"]')

    const durations: number[] = []
    const points = await page.locator('[data-testid="scatter-point"]').all()

    // Test first 5 points
    for (let i = 0; i < Math.min(5, points.length); i++) {
      const duration = await page.evaluate(() => {
        const start = performance.now()

        return new Promise<number>((resolve) => {
          const checkAndClick = () => {
            const point = document.querySelectorAll('[data-testid="scatter-point"]')[0] as HTMLElement
            if (point) {
              point.click()

              const waitForModal = () => {
                const modal = document.querySelector('[role="dialog"]')
                if (modal && window.getComputedStyle(modal).opacity === '1') {
                  const end = performance.now()

                  // Close modal
                  const closeButton = modal.querySelector('[aria-label*="Close"]') as HTMLElement
                  if (closeButton) {
                    closeButton.click()
                  }

                  setTimeout(() => resolve(end - start), 100)
                } else {
                  requestAnimationFrame(waitForModal)
                }
              }
              waitForModal()
            }
          }

          setTimeout(checkAndClick, 100)
        })
      })

      durations.push(duration)
      console.log(`Modal open ${i + 1}: ${duration.toFixed(2)}ms`)
    }

    // All modal opens should be < 300ms
    durations.forEach((duration) => {
      expect(duration).toBeLessThan(300)
    })

    // Average should be well under threshold
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    console.log(`Average modal open time: ${avgDuration.toFixed(2)}ms`)
    expect(avgDuration).toBeLessThan(250)
  })
})
