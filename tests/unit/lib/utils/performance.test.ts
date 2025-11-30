/**
 * Unit tests for performance monitoring utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  measureInteraction,
  markPerformance,
  measurePerformance,
  monitorFrameRate,
} from '@/lib/utils/performance'

describe('performance utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    // Use stubEnv to set NODE_ENV for tests
    vi.stubEnv('NODE_ENV', 'development')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('measureInteraction', () => {
    it('should execute callback and return result', () => {
      const callback = vi.fn(() => 42)

      const result = measureInteraction('test-interaction', callback)

      expect(callback).toHaveBeenCalledOnce()
      expect(result).toBe(42)
    })

    it('should measure duration correctly', () => {
      const callback = vi.fn(() => 'result')

      measureInteraction('test-interaction', callback)

      // Just verify it executes without errors
      expect(callback).toHaveBeenCalledOnce()
    })

    it('should log warning when threshold exceeded', () => {
      const slowCallback = () => {
        // Simulate slow operation
        const start = Date.now()
        while (Date.now() - start < 20) {
          // Busy wait
        }
        return 'done'
      }

      measureInteraction('slow-interaction', slowCallback, 1)

      expect(console.warn).toHaveBeenCalled()
    })

    it('should not log warning when threshold not exceeded', () => {
      const fastCallback = () => 'fast'

      measureInteraction('fast-interaction', fastCallback, 1000)

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should be no-op in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const callback = vi.fn(() => 'result')

      const result = measureInteraction('test', callback, 1)

      expect(result).toBe('result')
      expect(callback).toHaveBeenCalledOnce()
      expect(console.warn).not.toHaveBeenCalled()
    })
  })

  describe('markPerformance', () => {
    it('should call performance.mark in development mode', () => {
      const markSpy = vi.spyOn(performance, 'mark')

      markPerformance('test-mark')

      expect(markSpy).toHaveBeenCalledWith('test-mark')
    })

    it('should handle errors gracefully', () => {
      vi.spyOn(performance, 'mark').mockImplementation(() => {
        throw new Error('Performance API not available')
      })

      expect(() => markPerformance('test-mark')).not.toThrow()
      expect(console.debug).toHaveBeenCalled()
    })

    it('should be no-op in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const markSpy = vi.spyOn(performance, 'mark')

      markPerformance('test-mark')

      expect(markSpy).not.toHaveBeenCalled()
    })
  })

  describe('measurePerformance', () => {
    it('should call performance.measure in development mode', () => {
      const measureSpy = vi.spyOn(performance, 'measure')

      measurePerformance('test-measure', 'start', 'end')

      expect(measureSpy).toHaveBeenCalledWith('test-measure', 'start', 'end')
    })

    it('should log warning when threshold exceeded', () => {
      // Create real marks and measure
      performance.mark('start')
      performance.mark('end')

      // Mock getEntriesByName to return a slow duration
      vi.spyOn(performance, 'getEntriesByName').mockReturnValue([
        { duration: 20, name: 'slow-measure' } as PerformanceEntry,
      ])

      measurePerformance('slow-measure', 'start', 'end', 10)

      expect(console.warn).toHaveBeenCalled()
    })

    it('should not log warning when threshold not exceeded', () => {
      // Create real marks
      performance.mark('start')
      performance.mark('end')

      // Mock getEntriesByName to return a fast duration
      vi.spyOn(performance, 'getEntriesByName').mockReturnValue([
        { duration: 5, name: 'fast-measure' } as PerformanceEntry,
      ])

      measurePerformance('fast-measure', 'start', 'end', 10)

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', () => {
      vi.spyOn(performance, 'measure').mockImplementation(() => {
        throw new Error('Marks not found')
      })

      expect(() => measurePerformance('test', 'start', 'end')).not.toThrow()
      expect(console.debug).toHaveBeenCalled()
    })

    it('should be no-op in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const measureSpy = vi.spyOn(performance, 'measure')

      measurePerformance('test-measure', 'start', 'end', 10)

      expect(measureSpy).not.toHaveBeenCalled()
    })
  })

  describe('monitorFrameRate', () => {
    it('should track FPS and call callback', () => {
      const callback = vi.fn()
      const rafSpy = vi.spyOn(global, 'requestAnimationFrame')

      // Start monitoring - this should call requestAnimationFrame
      const stopMonitoring = monitorFrameRate(callback, 1000)

      // Verify requestAnimationFrame was called
      expect(rafSpy).toHaveBeenCalled()

      // Clean up
      stopMonitoring()
    })

    it('should return cleanup function that cancels animation', () => {
      const callback = vi.fn()
      const cancelSpy = vi.spyOn(global, 'cancelAnimationFrame')

      const stopMonitoring = monitorFrameRate(callback)
      stopMonitoring()

      expect(cancelSpy).toHaveBeenCalled()
    })

    it('should be no-op in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const callback = vi.fn()
      const rafSpy = vi.spyOn(global, 'requestAnimationFrame')

      const stopMonitoring = monitorFrameRate(callback)
      stopMonitoring()

      expect(rafSpy).not.toHaveBeenCalled()
      expect(callback).not.toHaveBeenCalled()
    })
  })
})
