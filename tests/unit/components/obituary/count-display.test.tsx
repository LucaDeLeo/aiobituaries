import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountDisplay } from '@/components/obituary/count-display'

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

describe('CountDisplay', () => {
  it('renders with formatted count', () => {
    render(<CountDisplay count={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('formats large numbers with commas', () => {
    render(<CountDisplay count={1247} />)
    expect(screen.getByText('1,247')).toBeInTheDocument()
  })

  it('formats very large numbers correctly', () => {
    render(<CountDisplay count={1234567} />)
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('displays zero count', () => {
    render(<CountDisplay count={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders obituaries label', () => {
    render(<CountDisplay count={50} />)
    expect(screen.getByText('Obituaries')).toBeInTheDocument()
  })

  it('includes sr-only text with count for accessibility', () => {
    render(<CountDisplay count={42} />)
    expect(screen.getByText('42 AI Obituaries')).toHaveClass('sr-only')
  })

  it('has decorative elements marked aria-hidden', () => {
    const { container } = render(<CountDisplay count={10} />)
    const ariaHiddenElements = container.querySelectorAll('[aria-hidden="true"]')
    // Should have decorative lines and the visual number
    expect(ariaHiddenElements.length).toBeGreaterThan(0)
  })

  it('renders within h1 heading', () => {
    render(<CountDisplay count={100} />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('applies proper styling classes for animation', () => {
    const { container } = render(<CountDisplay count={50} />)
    const animatedElement = container.querySelector('.animate-pulse-glow')
    expect(animatedElement).toBeInTheDocument()
  })

  it('has motion-reduce class for reduced motion preference', () => {
    const { container } = render(<CountDisplay count={50} />)
    const element = container.querySelector('.motion-reduce\\:animate-none')
    expect(element).toBeInTheDocument()
  })
})
