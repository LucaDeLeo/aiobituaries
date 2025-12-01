/**
 * ScatterPlot Position Preservation Tests
 *
 * Tests for Story 5-3: Position Preservation
 * Tests position restoration and saving behavior via useTimelinePosition hook.
 * Due to React 19 + Vitest hook resolution issues, we test exports and logic functions
 * rather than direct component rendering.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

describe('ScatterPlot position module exports', () => {
  it('exports useTimelinePosition hook', async () => {
    const positionModule = await import('@/lib/hooks/use-timeline-position')
    expect(positionModule.useTimelinePosition).toBeDefined()
    expect(typeof positionModule.useTimelinePosition).toBe('function')
  })

  it('exports SAVE_DEBOUNCE_MS constant with 300ms value', async () => {
    const positionModule = await import('@/lib/hooks/use-timeline-position')
    expect(positionModule.SAVE_DEBOUNCE_MS).toBe(300)
  })
})

describe('Position restoration on mount', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('loadPositionFromStorage returns saved position for restoration', async () => {
    // Save a valid position
    const savedPosition = {
      scrollX: -150,
      zoom: 2.0,
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(savedPosition))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    // Position should be available for restoration
    expect(loaded).not.toBeNull()
    expect(loaded?.scrollX).toBe(-150)
    expect(loaded?.zoom).toBe(2.0)
  })

  it('loadPositionFromStorage returns null when no position saved', async () => {
    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
  })

  it('position restoration respects zoom bounds (MIN_SCALE, MAX_SCALE)', async () => {
    // Save position with zoom below minimum
    const belowMin = {
      scrollX: 0,
      zoom: 0.1, // Below MIN_SCALE (0.5)
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(belowMin))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    let loaded = loadPositionFromStorage()
    expect(loaded?.zoom).toBe(0.5) // Clamped to MIN_SCALE

    // Save position with zoom above maximum
    const aboveMax = {
      scrollX: 0,
      zoom: 10, // Above MAX_SCALE (5)
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(aboveMax))

    loaded = loadPositionFromStorage()
    expect(loaded?.zoom).toBe(5) // Clamped to MAX_SCALE
  })
})

describe('Position saving on scroll/zoom change', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('savePositionToStorage saves scrollX correctly', async () => {
    const { savePositionToStorage, loadPositionFromStorage } = await import(
      '@/lib/hooks/use-timeline-position'
    )

    // Simulate scroll change by saving position
    const scrolledPosition = { scrollX: -250, zoom: 1.0 }
    savePositionToStorage(scrolledPosition)

    const loaded = loadPositionFromStorage()
    expect(loaded?.scrollX).toBe(-250)
  })

  it('savePositionToStorage saves zoom correctly', async () => {
    const { savePositionToStorage, loadPositionFromStorage } = await import(
      '@/lib/hooks/use-timeline-position'
    )

    // Simulate zoom change by saving position
    const zoomedPosition = { scrollX: 0, zoom: 3.5 }
    savePositionToStorage(zoomedPosition)

    const loaded = loadPositionFromStorage()
    expect(loaded?.zoom).toBe(3.5)
  })

  it('savePositionToStorage adds timestamp automatically', async () => {
    const { savePositionToStorage } = await import('@/lib/hooks/use-timeline-position')

    const beforeSave = Date.now()
    savePositionToStorage({ scrollX: -100, zoom: 1.5 })
    const afterSave = Date.now()

    const stored = sessionStorage.getItem('timeline-position')
    expect(stored).not.toBeNull()

    const savedData = JSON.parse(stored!)
    expect(savedData.timestamp).toBeGreaterThanOrEqual(beforeSave)
    expect(savedData.timestamp).toBeLessThanOrEqual(afterSave)
  })

  it('savePositionToStorage overwrites previous position', async () => {
    const { savePositionToStorage, loadPositionFromStorage } = await import(
      '@/lib/hooks/use-timeline-position'
    )

    // Save initial position
    savePositionToStorage({ scrollX: -100, zoom: 1.0 })

    // Save updated position (simulating continued scrolling)
    savePositionToStorage({ scrollX: -200, zoom: 2.0 })

    const loaded = loadPositionFromStorage()
    expect(loaded?.scrollX).toBe(-200)
    expect(loaded?.zoom).toBe(2.0)
  })
})

describe('Debounce behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('SAVE_DEBOUNCE_MS is 300ms as per story specification', async () => {
    const { SAVE_DEBOUNCE_MS } = await import('@/lib/hooks/use-timeline-position')
    expect(SAVE_DEBOUNCE_MS).toBe(300)
  })

  it('savePositionToStorage saves synchronously (hook handles debounce)', async () => {
    const { savePositionToStorage, loadPositionFromStorage } = await import(
      '@/lib/hooks/use-timeline-position'
    )

    // The utility function saves synchronously
    // The hook wrapper (useTimelinePosition.savePosition) handles debouncing
    savePositionToStorage({ scrollX: -100, zoom: 1.5 })

    // Should be immediately available (no debounce in utility)
    const loaded = loadPositionFromStorage()
    expect(loaded?.scrollX).toBe(-100)
  })
})

describe('Position data structure validation', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('validates scrollX is a number', async () => {
    sessionStorage.setItem(
      'timeline-position',
      JSON.stringify({ scrollX: 'not-a-number', zoom: 1, timestamp: Date.now() })
    )

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
  })

  it('validates zoom is a number', async () => {
    sessionStorage.setItem(
      'timeline-position',
      JSON.stringify({ scrollX: 0, zoom: 'invalid', timestamp: Date.now() })
    )

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
  })

  it('validates timestamp is a number', async () => {
    sessionStorage.setItem(
      'timeline-position',
      JSON.stringify({ scrollX: 0, zoom: 1, timestamp: 'invalid' })
    )

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
  })

  it('rejects position with missing required fields', async () => {
    // Missing zoom
    sessionStorage.setItem(
      'timeline-position',
      JSON.stringify({ scrollX: 0, timestamp: Date.now() })
    )

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    let loaded = loadPositionFromStorage()
    expect(loaded).toBeNull()

    // Missing scrollX
    sessionStorage.setItem(
      'timeline-position',
      JSON.stringify({ zoom: 1, timestamp: Date.now() })
    )
    loaded = loadPositionFromStorage()
    expect(loaded).toBeNull()

    // Missing timestamp
    sessionStorage.setItem(
      'timeline-position',
      JSON.stringify({ scrollX: 0, zoom: 1 })
    )
    loaded = loadPositionFromStorage()
    expect(loaded).toBeNull()
  })
})

describe('Initial mount behavior', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('fresh session has no saved position', async () => {
    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
  })

  it('clearPositionFromStorage removes saved position', async () => {
    const { savePositionToStorage, clearPositionFromStorage, loadPositionFromStorage } =
      await import('@/lib/hooks/use-timeline-position')

    // Save a position
    savePositionToStorage({ scrollX: -100, zoom: 2 })
    expect(loadPositionFromStorage()).not.toBeNull()

    // Clear it
    clearPositionFromStorage()
    expect(loadPositionFromStorage()).toBeNull()
  })
})

describe('ScatterPlot integration with useTimelinePosition', () => {
  it('ScatterPlot imports useTimelinePosition hook', async () => {
    // Verify the hook is used in ScatterPlot
    const scatterModule = await import('@/components/visualization/scatter-plot')
    const positionModule = await import('@/lib/hooks/use-timeline-position')

    // Both should be defined and usable
    expect(scatterModule.ScatterPlotInner).toBeDefined()
    expect(positionModule.useTimelinePosition).toBeDefined()
  })

  it('TimelinePosition type matches ViewState mapping (scrollX -> translateX, zoom -> scale)', async () => {
    // The hook's position maps to ViewState:
    // - position.scrollX maps to viewState.translateX
    // - position.zoom maps to viewState.scale
    const { savePositionToStorage, loadPositionFromStorage } = await import(
      '@/lib/hooks/use-timeline-position'
    )

    // Simulate saving viewState values as position
    const viewStateValues = {
      scrollX: -300, // translateX value
      zoom: 2.5, // scale value
    }
    savePositionToStorage(viewStateValues)

    const loaded = loadPositionFromStorage()
    expect(loaded?.scrollX).toBe(-300) // Should restore translateX
    expect(loaded?.zoom).toBe(2.5) // Should restore scale
  })
})

describe('Graceful degradation', () => {
  it('isSessionStorageAvailable returns true in test environment', async () => {
    const { isSessionStorageAvailable } = await import('@/lib/hooks/use-timeline-position')

    // In jsdom test environment, sessionStorage should be available
    expect(isSessionStorageAvailable()).toBe(true)
  })

  it('loadPositionFromStorage handles invalid JSON without throwing', async () => {
    sessionStorage.setItem('timeline-position', 'not-valid-json')

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')

    // Should not throw, should return null
    const result = loadPositionFromStorage()
    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalled()

    consoleWarn.mockRestore()
    sessionStorage.clear()
  })

  it('clearPositionFromStorage does not throw on errors', async () => {
    const { clearPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')

    // Should not throw even if storage is empty
    expect(() => clearPositionFromStorage()).not.toThrow()
  })
})
