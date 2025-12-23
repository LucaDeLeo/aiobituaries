import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountDisplayCompact } from '@/components/obituary/count-display-compact'

// Mock useVisualizationState to avoid useSearchParams issues in tests
vi.mock('@/lib/hooks/use-visualization-state', () => ({
  useVisualizationState: () => ({
    categories: [],
    metrics: ['compute'],
    setCategories: vi.fn(),
    setMetrics: vi.fn(),
    toggleCategory: vi.fn(),
    toggleMetric: vi.fn(),
    clearFilters: vi.fn(),
  }),
}))

describe('CountDisplayCompact', () => {
  it('renders with formatted count', () => {
    render(<CountDisplayCompact count={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('formats large numbers with commas', () => {
    render(<CountDisplayCompact count={1247} />)
    expect(screen.getByText('1,247')).toBeInTheDocument()
  })

  it('renders obituaries label', () => {
    render(<CountDisplayCompact count={50} />)
    expect(screen.getByText('Obituaries')).toBeInTheDocument()
  })

  it('displays zero count', () => {
    render(<CountDisplayCompact count={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('includes sr-only text for accessibility', () => {
    render(<CountDisplayCompact count={42} />)
    expect(screen.getByText('42 AI Obituaries')).toHaveClass('sr-only')
  })

  it('has proper styling for inline display', () => {
    const { container } = render(<CountDisplayCompact count={100} />)
    const flexContainer = container.querySelector('.flex.items-center')
    expect(flexContainer).toBeInTheDocument()
  })

  it('has decorative elements marked aria-hidden', () => {
    const { container } = render(<CountDisplayCompact count={10} />)
    const ariaHiddenElements = container.querySelectorAll('[aria-hidden="true"]')
    expect(ariaHiddenElements.length).toBeGreaterThan(0)
  })

  it('uses monospace font for number', () => {
    const { container } = render(<CountDisplayCompact count={50} />)
    const monoElement = container.querySelector('.font-mono')
    expect(monoElement).toBeInTheDocument()
  })
})
