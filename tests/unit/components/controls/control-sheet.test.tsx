/**
 * ControlSheet Component Tests
 *
 * Tests for Story TSR-1.3: Responsive Control Surfaces
 * Tests the responsive sheet wrapper for tablet/mobile control panels.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock useMediaQuery hook
let mockIsMobile = false
vi.mock('@/lib/hooks/use-media-query', () => ({
  useMediaQuery: (query: string) => {
    // Return mock value based on query
    if (query === '(max-width: 767px)') {
      return mockIsMobile
    }
    return false
  },
}))

// Mock useVisualizationState hook (used by ControlPanelWrapper)
vi.mock('@/lib/hooks/use-visualization-state', () => ({
  useVisualizationState: vi.fn(() => ({
    metrics: ['compute'],
    setMetrics: vi.fn(),
    categories: [],
    setCategories: vi.fn(),
    dateRange: [2010, 2025] as [number, number],
    setDateRange: vi.fn(),
    isPending: false,
  })),
}))

describe('ControlSheet module exports', () => {
  it('exports ControlSheet component', async () => {
    const mod = await import('@/components/controls')
    expect(mod.ControlSheet).toBeDefined()
    expect(typeof mod.ControlSheet).toBe('function')
  })

  it('exports ControlSheetProps type', async () => {
    const mod = await import('@/components/controls')
    expect(mod.ControlSheet).toBeDefined()
  })
})

describe('ControlSheet rendering', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('renders the FAB trigger button', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)
    expect(screen.getByRole('button', { name: 'Open controls' })).toBeInTheDocument()
  })

  it('does not render sheet content when closed', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)
    // Sheet title is sr-only but exists in the DOM when open
    expect(screen.queryByText('Visualization Controls')).not.toBeInTheDocument()
  })
})

describe('ControlSheet tablet mode (side="right")', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('opens sheet from right on trigger click', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Visualization Controls')).toBeInTheDocument()
    })
  })

  it('renders sheet with w-[320px] width class', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      const sheetContent = document.querySelector('[data-slot="sheet-content"]')
      expect(sheetContent).toBeInTheDocument()
      expect(sheetContent?.className).toContain('w-[320px]')
    })
  })

  it('does not render drag handle in tablet mode', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      // Drag handle has specific dimensions - should not be present
      const dragHandle = document.querySelector('.w-12.h-1\\.5')
      expect(dragHandle).not.toBeInTheDocument()
    })
  })
})

describe('ControlSheet mobile mode (side="bottom")', () => {
  beforeEach(() => {
    mockIsMobile = true
  })

  afterEach(() => {
    mockIsMobile = false
  })

  it('renders sheet with h-[80vh] height class', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      const sheetContent = document.querySelector('[data-slot="sheet-content"]')
      expect(sheetContent).toBeInTheDocument()
      expect(sheetContent?.className).toContain('h-[80vh]')
    })
  })

  it('renders sheet with rounded-t-2xl for rounded top corners', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      const sheetContent = document.querySelector('[data-slot="sheet-content"]')
      // Story TSR-5-1: Enhanced rounded corners with 2xl
      expect(sheetContent?.className).toContain('rounded-t-2xl')
    })
  })

  it('renders sheet with safe area bottom padding for notched devices', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      const sheetContent = document.querySelector('[data-slot="sheet-content"]')
      // Story TSR-5-1: Uses CSS env() for safe area with 16px fallback
      expect(sheetContent?.className).toContain('pb-[env(safe-area-inset-bottom,16px)]')
    })
  })

  it('renders drag handle indicator in mobile mode', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      // Drag handle has specific dimensions
      const dragHandle = document.querySelector('.w-12.h-1\\.5')
      expect(dragHandle).toBeInTheDocument()
    })
  })
})

describe('ControlSheet open/close behavior', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('opens when trigger is clicked', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Visualization Controls')).toBeInTheDocument()
    })
  })

  it('closes when close button is clicked', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    // Open the sheet
    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Visualization Controls')).toBeInTheDocument()
    })

    // Click close button
    const closeButton = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Visualization Controls')).not.toBeInTheDocument()
    })
  })

  it('closes when Escape key is pressed', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    // Open the sheet
    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Visualization Controls')).toBeInTheDocument()
    })

    // Press Escape
    fireEvent.keyDown(document.body, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Visualization Controls')).not.toBeInTheDocument()
    })
  })
})

describe('ControlSheet controlled mode', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('accepts controlled open state', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} open={true} onOpenChange={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Visualization Controls')).toBeInTheDocument()
    })
  })

  it('calls onOpenChange when state changes', async () => {
    const { ControlSheet } = await import('@/components/controls')
    const handleOpenChange = vi.fn()
    render(<ControlSheet totalCount={100} open={false} onOpenChange={handleOpenChange} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    expect(handleOpenChange).toHaveBeenCalledWith(true)
  })

  it('stays closed when open prop is false', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} open={false} onOpenChange={() => {}} />)

    expect(screen.queryByText('Visualization Controls')).not.toBeInTheDocument()
  })
})

describe('ControlSheet contains ControlPanelWrapper', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('renders Controls heading when open', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Controls')).toBeInTheDocument()
    })
  })

  it('passes totalCount to ControlPanelWrapper', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={42} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      // ControlPanelWrapper shows stats
      expect(screen.getByText(/of 42/)).toBeInTheDocument()
    })
  })
})

describe('ControlSheet accessibility', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('has sr-only on SheetHeader for screen readers', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      const title = screen.getByText('Visualization Controls')
      // SheetHeader (parent) has sr-only, not the title itself
      expect(title.parentElement?.className).toContain('sr-only')
    })
  })

  it('has accessible close button', async () => {
    const { ControlSheet } = await import('@/components/controls')
    render(<ControlSheet totalCount={100} />)

    const trigger = screen.getByRole('button', { name: 'Open controls' })
    fireEvent.click(trigger)

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: 'Close' })
      expect(closeButton).toBeInTheDocument()
    })
  })
})
