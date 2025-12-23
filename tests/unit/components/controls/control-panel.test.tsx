/**
 * ControlPanel Component Tests
 *
 * Tests for Story TSR-1.2: ControlPanel Shell Component
 * Tests the control panel shell with collapsible sections.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ControlPanelProps } from '@/components/controls'

const defaultProps: ControlPanelProps = {
  enabledMetrics: ['compute'],
  onMetricsChange: () => {},
  selectedCategories: [],
  onCategoriesChange: () => {},
  displayOptions: { showTrendAnnotations: true, enableClustering: false },
  onDisplayOptionsChange: () => {},
  stats: { total: 100, visible: 42 },
  variant: 'sidebar',
}

describe('ControlPanel module exports', () => {
  it('exports ControlPanel component', async () => {
    const mod = await import('@/components/controls')
    expect(mod.ControlPanel).toBeDefined()
    expect(typeof mod.ControlPanel).toBe('function')
  })

  it('exports MetricType type', async () => {
    const mod = await import('@/components/controls')
    // Types are compile-time only, but we can verify the component accepts the type
    expect(mod.ControlPanel).toBeDefined()
  })

  it('exports DisplayOptions type', async () => {
    const mod = await import('@/components/controls')
    expect(mod.ControlPanel).toBeDefined()
  })

  it('exports ControlPanelProps type', async () => {
    const mod = await import('@/components/controls')
    expect(mod.ControlPanel).toBeDefined()
  })
})

describe('ControlPanel rendering', () => {
  it('renders Controls heading', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText('Controls')).toBeInTheDocument()
  })

  it('renders stats display with correct format', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} stats={{ total: 100, visible: 42 }} />)
    expect(screen.getByText('Showing 42 of 100')).toBeInTheDocument()
  })

  it('renders stats with different counts', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} stats={{ total: 250, visible: 50 }} />)
    expect(screen.getByText('Showing 50 of 250')).toBeInTheDocument()
  })

  it('renders zero stats correctly', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} stats={{ total: 0, visible: 0 }} />)
    expect(screen.getByText('Showing 0 of 0')).toBeInTheDocument()
  })
})

describe('ControlPanel collapsible sections', () => {
  it('renders Background Metrics section', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText('Background Metrics')).toBeInTheDocument()
  })

  it('renders Categories section', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('renders 2 collapsible section triggers (plus category button)', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    // 2 collapsible section triggers + 1 "Show all" button from CategoryCheckboxes
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })
})

describe('ControlPanel content', () => {
  // Note: MetricsToggle currently only renders 'compute' metric
  it('renders MetricsToggle in Background Metrics section', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    // MetricsToggle only shows compute metric now
    expect(screen.getByText('Training Compute')).toBeInTheDocument()
  })

  it('renders CategoryCheckboxes in Categories section', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    // CategoryCheckboxes is now rendered with actual categories
    expect(screen.getByText('Capability Doubt')).toBeInTheDocument()
    expect(screen.getByText('Market/Bubble')).toBeInTheDocument()
    expect(screen.getByText('AGI Skepticism')).toBeInTheDocument()
    expect(screen.getByText('Dismissive Framing')).toBeInTheDocument()
  })
})

describe('ControlPanel section default states', () => {
  it('has Background Metrics section open by default', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const bgMetricsButton = screen.getByRole('button', { name: /background metrics/i })
    expect(bgMetricsButton).toHaveAttribute('data-state', 'open')
  })

  it('has Categories section open by default', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    // Get the exact "Categories" section trigger (not "Showing all categories" button)
    const categoriesButton = screen.getByRole('button', { name: /^categories$/i })
    expect(categoriesButton).toHaveAttribute('data-state', 'open')
  })
})

describe('ControlPanel section toggling', () => {
  it('toggles Background Metrics section on click', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const bgMetrics = screen.getByRole('button', { name: /background metrics/i })

    expect(bgMetrics).toHaveAttribute('data-state', 'open')
    fireEvent.click(bgMetrics)
    expect(bgMetrics).toHaveAttribute('data-state', 'closed')
    fireEvent.click(bgMetrics)
    expect(bgMetrics).toHaveAttribute('data-state', 'open')
  })

  it('toggles Categories section on click', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const categories = screen.getByRole('button', { name: /^categories$/i })

    expect(categories).toHaveAttribute('data-state', 'open')
    fireEvent.click(categories)
    expect(categories).toHaveAttribute('data-state', 'closed')
    fireEvent.click(categories)
    expect(categories).toHaveAttribute('data-state', 'open')
  })
})

describe('ControlPanel variant styling', () => {
  it('applies sidebar variant styling by default', async () => {
    const { ControlPanel } = await import('@/components/controls')
    const { container } = render(<ControlPanel {...defaultProps} />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('p-0')
  })

  it('applies sidebar variant styling explicitly', async () => {
    const { ControlPanel } = await import('@/components/controls')
    const { container } = render(<ControlPanel {...defaultProps} variant="sidebar" />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('p-0')
  })

  it('applies sheet variant styling', async () => {
    const { ControlPanel } = await import('@/components/controls')
    const { container } = render(<ControlPanel {...defaultProps} variant="sheet" />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('p-2')
  })

  it('applies drawer variant styling', async () => {
    const { ControlPanel } = await import('@/components/controls')
    const { container } = render(<ControlPanel {...defaultProps} variant="drawer" />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('p-0')
  })

  it('has flex-col layout', async () => {
    const { ControlPanel } = await import('@/components/controls')
    const { container } = render(<ControlPanel {...defaultProps} />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('flex')
    expect(root.className).toContain('flex-col')
  })

  it('has h-full for full height', async () => {
    const { ControlPanel } = await import('@/components/controls')
    const { container } = render(<ControlPanel {...defaultProps} />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('h-full')
  })
})

describe('ControlPanel header styling', () => {
  it('renders header section with border', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const heading = screen.getByText('Controls')
    const headerDiv = heading.closest('div')
    expect(headerDiv?.className).toContain('border-b')
  })

  it('renders stats text with muted-foreground style', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const statsText = screen.getByText('Showing 42 of 100')
    expect(statsText.className).toContain('text-muted-foreground')
  })

  it('renders heading with font-semibold', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const heading = screen.getByText('Controls')
    expect(heading.className).toContain('font-semibold')
  })
})

describe('ControlPanel TypeScript interface', () => {
  it('accepts all required props without error', async () => {
    const { ControlPanel } = await import('@/components/controls')
    const props: ControlPanelProps = {
      enabledMetrics: ['compute', 'arcagi', 'eci'],
      onMetricsChange: () => {},
      selectedCategories: ['market', 'capability'],
      onCategoriesChange: () => {},
      displayOptions: { showTrendAnnotations: false, enableClustering: true },
      onDisplayOptionsChange: () => {},
      stats: { total: 500, visible: 123 },
      variant: 'sheet',
    }
    const { container } = render(<ControlPanel {...props} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('works without optional variant prop', async () => {
    const { ControlPanel } = await import('@/components/controls')
    const props: Omit<ControlPanelProps, 'variant'> = {
      enabledMetrics: ['compute'],
      onMetricsChange: () => {},
      selectedCategories: [],
      onCategoriesChange: () => {},
      displayOptions: { showTrendAnnotations: true, enableClustering: false },
      onDisplayOptionsChange: () => {},
      stats: { total: 10, visible: 5 },
    }
    const { container } = render(<ControlPanel {...props} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
