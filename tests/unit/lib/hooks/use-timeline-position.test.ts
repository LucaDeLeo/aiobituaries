/**
 * useTimelinePosition Hook Tests
 *
 * Tests for Story 5-3: Position Preservation
 * Tests module exports and position persistence utilities.
 * Due to React 19 + Vitest hook resolution issues, we test exports and logic functions
 * rather than direct hook rendering.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useTimelinePosition module exports', () => {
  it('exports useTimelinePosition hook', async () => {
    const positionModule = await import('@/lib/hooks/use-timeline-position')
    expect(positionModule.useTimelinePosition).toBeDefined()
    expect(typeof positionModule.useTimelinePosition).toBe('function')
  })

  it('exports isSessionStorageAvailable helper', async () => {
    const positionModule = await import('@/lib/hooks/use-timeline-position')
    expect(positionModule.isSessionStorageAvailable).toBeDefined()
    expect(typeof positionModule.isSessionStorageAvailable).toBe('function')
  })

  it('exports loadPositionFromStorage helper', async () => {
    const positionModule = await import('@/lib/hooks/use-timeline-position')
    expect(positionModule.loadPositionFromStorage).toBeDefined()
    expect(typeof positionModule.loadPositionFromStorage).toBe('function')
  })

  it('exports savePositionToStorage helper', async () => {
    const positionModule = await import('@/lib/hooks/use-timeline-position')
    expect(positionModule.savePositionToStorage).toBeDefined()
    expect(typeof positionModule.savePositionToStorage).toBe('function')
  })

  it('exports clearPositionFromStorage helper', async () => {
    const positionModule = await import('@/lib/hooks/use-timeline-position')
    expect(positionModule.clearPositionFromStorage).toBeDefined()
    expect(typeof positionModule.clearPositionFromStorage).toBe('function')
  })

  it('exports SAVE_DEBOUNCE_MS constant', async () => {
    const positionModule = await import('@/lib/hooks/use-timeline-position')
    expect(positionModule.SAVE_DEBOUNCE_MS).toBe(300)
  })
})

describe('navigation.ts exports', () => {
  it('exports TimelinePosition type and constants', async () => {
    const navigationModule = await import('@/types/navigation')
    expect(navigationModule.TIMELINE_POSITION_STORAGE_KEY).toBe('timeline-position')
    expect(navigationModule.TIMELINE_POSITION_EXPIRY_MS).toBe(60 * 60 * 1000)
  })
})

// Tests that use sessionStorage - run with real sessionStorage (jsdom provides it)
describe('isSessionStorageAvailable', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns true when sessionStorage is available', async () => {
    const { isSessionStorageAvailable } = await import('@/lib/hooks/use-timeline-position')
    expect(isSessionStorageAvailable()).toBe(true)
  })
})

describe('loadPositionFromStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns null when storage is empty', async () => {
    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    expect(loadPositionFromStorage()).toBeNull()
  })

  it('returns position when valid data exists', async () => {
    const validPosition = {
      scrollX: -100,
      zoom: 2,
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(validPosition))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).not.toBeNull()
    expect(loaded?.scrollX).toBe(-100)
    expect(loaded?.zoom).toBe(2)
  })

  it('returns null and removes expired position (>1 hour old)', async () => {
    const expiredPosition = {
      scrollX: -100,
      zoom: 2,
      timestamp: Date.now() - (61 * 60 * 1000), // 61 minutes ago
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(expiredPosition))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
    expect(sessionStorage.getItem('timeline-position')).toBeNull()
  })

  it('accepts positions within 1 hour', async () => {
    const recentPosition = {
      scrollX: -50,
      zoom: 1.5,
      timestamp: Date.now() - (30 * 60 * 1000), // 30 minutes ago
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(recentPosition))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).not.toBeNull()
    expect(loaded?.scrollX).toBe(-50)
  })

  it('clamps zoom to MIN_SCALE when below minimum', async () => {
    const positionWithLowZoom = {
      scrollX: 0,
      zoom: 0.1, // Below MIN_SCALE (0.5)
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(positionWithLowZoom))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded?.zoom).toBe(0.5) // Should be clamped to MIN_SCALE
  })

  it('clamps zoom to MAX_SCALE when above maximum', async () => {
    const positionWithHighZoom = {
      scrollX: 0,
      zoom: 10, // Above MAX_SCALE (5)
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(positionWithHighZoom))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded?.zoom).toBe(5) // Should be clamped to MAX_SCALE
  })

  it('handles invalid JSON gracefully', async () => {
    sessionStorage.setItem('timeline-position', 'not valid json')

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
    expect(consoleWarn).toHaveBeenCalled()
    expect(sessionStorage.getItem('timeline-position')).toBeNull()

    consoleWarn.mockRestore()
  })

  it('handles missing required fields gracefully', async () => {
    const incompleteData = { scrollX: 100 } // Missing zoom and timestamp
    sessionStorage.setItem('timeline-position', JSON.stringify(incompleteData))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
  })

  it('handles wrong field types gracefully', async () => {
    const wrongTypes = {
      scrollX: 'not a number',
      zoom: 2,
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(wrongTypes))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
  })
})

describe('savePositionToStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('saves position with current timestamp', async () => {
    const { savePositionToStorage } = await import('@/lib/hooks/use-timeline-position')

    const beforeSave = Date.now()
    const result = savePositionToStorage({ scrollX: -200, zoom: 1.5 })
    const afterSave = Date.now()

    expect(result).toBe(true)

    const stored = sessionStorage.getItem('timeline-position')
    expect(stored).not.toBeNull()

    const savedData = JSON.parse(stored!)
    expect(savedData.scrollX).toBe(-200)
    expect(savedData.zoom).toBe(1.5)
    expect(savedData.timestamp).toBeGreaterThanOrEqual(beforeSave)
    expect(savedData.timestamp).toBeLessThanOrEqual(afterSave)
  })
})

describe('clearPositionFromStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('removes position from storage', async () => {
    sessionStorage.setItem('timeline-position', JSON.stringify({ scrollX: 0, zoom: 1, timestamp: Date.now() }))

    const { clearPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    clearPositionFromStorage()

    expect(sessionStorage.getItem('timeline-position')).toBeNull()
  })
})

describe('position expiry logic', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('accepts position at exactly 59 minutes', async () => {
    const position = {
      scrollX: 0,
      zoom: 1,
      timestamp: Date.now() - (59 * 60 * 1000),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(position))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).not.toBeNull()
  })

  it('rejects position at exactly 61 minutes', async () => {
    const position = {
      scrollX: 0,
      zoom: 1,
      timestamp: Date.now() - (61 * 60 * 1000),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(position))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded).toBeNull()
  })
})

describe('position restoration flow', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('complete save and load roundtrip works', async () => {
    const { savePositionToStorage, loadPositionFromStorage } = await import(
      '@/lib/hooks/use-timeline-position'
    )

    // Save position
    savePositionToStorage({ scrollX: -150, zoom: 2.5 })

    // Load position
    const loaded = loadPositionFromStorage()

    expect(loaded).not.toBeNull()
    expect(loaded?.scrollX).toBe(-150)
    expect(loaded?.zoom).toBe(2.5)
  })

  it('clear removes saved position', async () => {
    const {
      savePositionToStorage,
      loadPositionFromStorage,
      clearPositionFromStorage,
    } = await import('@/lib/hooks/use-timeline-position')

    // Save position
    savePositionToStorage({ scrollX: -100, zoom: 2 })

    // Clear position
    clearPositionFromStorage()

    // Load should return null
    const loaded = loadPositionFromStorage()
    expect(loaded).toBeNull()
  })
})

describe('zoom bounds validation', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('accepts zoom at MIN_SCALE boundary', async () => {
    const position = {
      scrollX: 0,
      zoom: 0.5, // MIN_SCALE
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(position))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded?.zoom).toBe(0.5)
  })

  it('accepts zoom at MAX_SCALE boundary', async () => {
    const position = {
      scrollX: 0,
      zoom: 5, // MAX_SCALE
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(position))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded?.zoom).toBe(5)
  })

  it('accepts zoom in valid range', async () => {
    const position = {
      scrollX: 0,
      zoom: 2.5,
      timestamp: Date.now(),
    }
    sessionStorage.setItem('timeline-position', JSON.stringify(position))

    const { loadPositionFromStorage } = await import('@/lib/hooks/use-timeline-position')
    const loaded = loadPositionFromStorage()

    expect(loaded?.zoom).toBe(2.5)
  })
})
