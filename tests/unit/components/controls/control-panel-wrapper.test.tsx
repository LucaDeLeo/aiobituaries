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
    searchQuery: '',
    setSearchQuery: vi.fn(),
    selectedSkeptic: null,
    setSelectedSkeptic: vi.fn(),
    isPending: false,
  })),
}))

// Mock obituaries data for SkepticFilter
const mockObituaries = [
  { slug: 'test-1', date: '2024-01-01', claim: 'Test claim 1', categories: ['market'] },
  { slug: 'test-2', date: '2024-01-02', claim: 'Test claim 2', categories: ['capability'] },
]

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
    render(<ControlPanelWrapper totalCount={42} obituaries={mockObituaries} />)
    expect(screen.getByText('Showing 42 of 42')).toBeInTheDocument()
  })

  it('renders with different totalCount', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={100} obituaries={mockObituaries} />)
    expect(screen.getByText('Showing 100 of 100')).toBeInTheDocument()
  })

  it('renders Controls heading', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={50} obituaries={mockObituaries} />)
    expect(screen.getByText('Controls')).toBeInTheDocument()
  })

  it('renders 3 collapsible sections', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={25} obituaries={mockObituaries} />)
    expect(screen.getByText('Background Metrics')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Filter by Skeptic')).toBeInTheDocument()
  })

  it('applies sidebar variant by default', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    const { container } = render(<ControlPanelWrapper totalCount={10} obituaries={mockObituaries} />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('p-0')
  })

  it('applies sheet variant when specified', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    const { container } = render(<ControlPanelWrapper totalCount={10} obituaries={mockObituaries} variant="sheet" />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('p-2')
  })

  it('handles zero totalCount', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={0} obituaries={mockObituaries} />)
    expect(screen.getByText('Showing 0 of 0')).toBeInTheDocument()
  })

  it('uses visibleCount when provided', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={100} obituaries={mockObituaries} visibleCount={42} />)
    expect(screen.getByText('Showing 42 of 100')).toBeInTheDocument()
  })
})
