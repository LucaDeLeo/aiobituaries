/**
 * ControlPanelWrapper Component Tests
 *
 * Tests for Story TSR-1.2: ControlPanel Shell Component
 * Updated for Story TSR-3.5: Tests wrapper with URL state wiring.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock useVisualizationState hook
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

describe('ControlPanelWrapper module exports', () => {
  it('exports ControlPanelWrapper component', async () => {
    const mod = await import('@/components/controls')
    expect(mod.ControlPanelWrapper).toBeDefined()
    expect(typeof mod.ControlPanelWrapper).toBe('function')
  })
})

describe('ControlPanelWrapper rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders ControlPanel with totalCount in stats', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={42} />)
    expect(screen.getByText('Showing 42 of 42')).toBeInTheDocument()
  })

  it('renders with different totalCount', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={100} />)
    expect(screen.getByText('Showing 100 of 100')).toBeInTheDocument()
  })

  it('renders Controls heading', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={50} />)
    expect(screen.getByText('Controls')).toBeInTheDocument()
  })

  it('renders 2 collapsible sections', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={25} />)
    expect(screen.getByText('Background Metrics')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('applies sidebar variant by default', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    const { container } = render(<ControlPanelWrapper totalCount={10} />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('p-0')
  })

  it('applies sheet variant when specified', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    const { container } = render(<ControlPanelWrapper totalCount={10} variant="sheet" />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('p-2')
  })

  it('handles zero totalCount', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={0} />)
    expect(screen.getByText('Showing 0 of 0')).toBeInTheDocument()
  })

  it('uses visibleCount when provided', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={100} visibleCount={42} />)
    expect(screen.getByText('Showing 42 of 100')).toBeInTheDocument()
  })
})
