'use client'

/**
 * Performance Monitoring Utilities
 *
 * Development-only utilities for tracking performance metrics and identifying
 * bottlenecks in animation-heavy interactions. All functions no-op in production
 * to ensure zero overhead in production builds.
 */

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
}

/**
 * Measure execution time of a callback function.
 * Only active in development mode to avoid production overhead.
 *
 * @param name - Descriptive name for the measurement
 * @param callback - Function to measure
 * @param threshold - Optional threshold in ms, logs warning if exceeded
 * @returns The result of the callback
 *
 * @example
 * const result = measureInteraction('scale-computation', () => {
 *   return computeExpensiveScale(data)
 * }, 10) // Warn if > 10ms
 */
export function measureInteraction<T>(
  name: string,
  callback: () => T,
  threshold?: number
): T {
  if (process.env.NODE_ENV !== 'development') {
    return callback()
  }

  const startTime = performance.now()
  const result = callback()
  const duration = performance.now() - startTime

  if (threshold && duration > threshold) {
    console.warn(
      `[Performance] ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    )
  }

  return result
}

/**
 * Mark a performance measurement point using the Performance API.
 * Used to create named timestamps for later measurement.
 * Only active in development mode.
 *
 * @param name - Unique name for the performance mark
 *
 * @example
 * markPerformance('scale-compute-start')
 * // ... expensive computation
 * markPerformance('scale-compute-end')
 * measurePerformance('scale-computation', 'scale-compute-start', 'scale-compute-end', 10)
 */
export function markPerformance(name: string): void {
  if (process.env.NODE_ENV !== 'development') return

  try {
    performance.mark(name)
  } catch (error) {
    // Performance API might not be available in all contexts (e.g., SSR)
    console.debug('[Performance] Could not mark:', name, error)
  }
}

/**
 * Measure duration between two performance marks.
 * Uses the Performance API to calculate elapsed time between marks.
 * Only active in development mode.
 *
 * @param name - Name for this measurement
 * @param startMark - Name of the start mark
 * @param endMark - Name of the end mark
 * @param threshold - Optional threshold in ms, logs warning if exceeded
 *
 * @example
 * markPerformance('render-start')
 * // ... rendering work
 * markPerformance('render-end')
 * measurePerformance('render-time', 'render-start', 'render-end', 16) // Warn if > 16ms (one frame)
 */
export function measurePerformance(
  name: string,
  startMark: string,
  endMark: string,
  threshold?: number
): void {
  if (process.env.NODE_ENV !== 'development') return

  try {
    performance.measure(name, startMark, endMark)
    const measure = performance.getEntriesByName(name)[0]

    if (measure && threshold && measure.duration > threshold) {
      console.warn(
        `[Performance] ${name} took ${measure.duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      )
    }
  } catch (error) {
    console.debug('[Performance] Could not measure:', name, error)
  }
}

/**
 * Monitor frame rate over a specified duration.
 * Useful for detecting animation jank during interactions.
 * Only active in development mode.
 *
 * @param callback - Function called with current FPS value
 * @param duration - Sampling duration in ms (default: 1000ms)
 * @returns Cleanup function to stop monitoring
 *
 * @example
 * const stopMonitoring = monitorFrameRate((fps) => {
 *   if (fps < 55) console.warn('Low FPS detected:', fps)
 * })
 * // Later...
 * stopMonitoring()
 */
export function monitorFrameRate(
  callback: (fps: number) => void,
  duration: number = 1000
): () => void {
  if (process.env.NODE_ENV !== 'development') {
    return () => {} // no-op in production
  }

  let frames = 0
  let lastTime = performance.now()
  let animationId: number

  const countFrame = (currentTime: number) => {
    frames++

    if (currentTime >= lastTime + duration) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime))
      callback(fps)
      frames = 0
      lastTime = currentTime
    }

    animationId = requestAnimationFrame(countFrame)
  }

  animationId = requestAnimationFrame(countFrame)

  return () => cancelAnimationFrame(animationId)
}

/**
 * Debounce a function to limit execution frequency.
 * Useful for high-frequency events like scroll, resize, or mouse move.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (e.g., 16ms for ~60fps)
 * @returns Debounced function
 *
 * @example
 * const debouncedScroll = debounce((scrollX: number) => {
 *   updateScrollPosition(scrollX)
 * }, 16) // ~60fps
 */
export function debounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

/**
 * Log Core Web Vitals to console (development only).
 * Useful for debugging and verifying performance improvements.
 *
 * @param metric - Web Vitals metric object
 *
 * @example
 * // In layout.tsx or page.tsx:
 * if (typeof window !== 'undefined') {
 *   import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB }) => {
 *     onCLS(logWebVitals)
 *     onFID(logWebVitals)
 *     onLCP(logWebVitals)
 *     onFCP(logWebVitals)
 *     onTTFB(logWebVitals)
 *   })
 * }
 */
export function logWebVitals(metric: {
  name: string
  value: number
  id: string
  rating?: 'good' | 'needs-improvement' | 'poor'
}): void {
  if (process.env.NODE_ENV !== 'development') return

  const color = metric.rating === 'good' ? 'green' : metric.rating === 'poor' ? 'red' : 'orange'
  console.log(
    `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating || 'unknown'})`,
    `color: ${color}; font-weight: bold`
  )
}
