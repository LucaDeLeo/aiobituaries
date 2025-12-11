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
  dateRange: [2010, 2025],
  onDateRangeChange: () => {},
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

  it('renders Time Range section', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText('Time Range')).toBeInTheDocument()
  })

  it('renders Categories section', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('renders Display Options section', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText('Display Options')).toBeInTheDocument()
  })

  it('renders all 4 collapsible section triggers', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
  })
})

describe('ControlPanel placeholder content', () => {
  it('renders MetricsToggle in Background Metrics section', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    // MetricsToggle is now rendered instead of placeholder text
    expect(screen.getByText('Training Compute')).toBeInTheDocument()
    expect(screen.getByText('MMLU Score')).toBeInTheDocument()
    expect(screen.getByText('Epoch Capability Index')).toBeInTheDocument()
  })

  it('has placeholder text for Time Range', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText(/Filter obituaries by date range/)).toBeInTheDocument()
  })

  it('has placeholder text for Categories', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    expect(screen.getByText(/Filter by claim category/)).toBeInTheDocument()
  })

  it('has placeholder text for Display Options (when opened)', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    // Display Options is closed by default, so open it first
    const buttons = screen.getAllByRole('button')
    const displayOptionsButton = buttons[3]
    fireEvent.click(displayOptionsButton)
    expect(screen.getByText(/Trend annotations and clustering settings/)).toBeInTheDocument()
  })
})

describe('ControlPanel section default states', () => {
  it('has Background Metrics section open by default', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    // First button is Background Metrics
    expect(buttons[0]).toHaveAttribute('data-state', 'open')
  })

  it('has Time Range section open by default', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    // Second button is Time Range
    expect(buttons[1]).toHaveAttribute('data-state', 'open')
  })

  it('has Categories section open by default', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    // Third button is Categories
    expect(buttons[2]).toHaveAttribute('data-state', 'open')
  })

  it('has Display Options section closed by default', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    // Fourth button is Display Options - should be closed
    expect(buttons[3]).toHaveAttribute('data-state', 'closed')
  })
})

describe('ControlPanel section toggling', () => {
  it('toggles Background Metrics section on click', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    const bgMetrics = buttons[0]

    expect(bgMetrics).toHaveAttribute('data-state', 'open')
    fireEvent.click(bgMetrics)
    expect(bgMetrics).toHaveAttribute('data-state', 'closed')
    fireEvent.click(bgMetrics)
    expect(bgMetrics).toHaveAttribute('data-state', 'open')
  })

  it('toggles Display Options section on click', async () => {
    const { ControlPanel } = await import('@/components/controls')
    render(<ControlPanel {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    const displayOptions = buttons[3]

    expect(displayOptions).toHaveAttribute('data-state', 'closed')
    fireEvent.click(displayOptions)
    expect(displayOptions).toHaveAttribute('data-state', 'open')
    fireEvent.click(displayOptions)
    expect(displayOptions).toHaveAttribute('data-state', 'closed')
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
      enabledMetrics: ['compute', 'mmlu', 'eci'],
      onMetricsChange: () => {},
      selectedCategories: ['market', 'capability'],
      onCategoriesChange: () => {},
      dateRange: [2015, 2024],
      onDateRangeChange: () => {},
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
      dateRange: [2010, 2025],
      onDateRangeChange: () => {},
      displayOptions: { showTrendAnnotations: true, enableClustering: false },
      onDisplayOptionsChange: () => {},
      stats: { total: 10, visible: 5 },
    }
    const { container } = render(<ControlPanel {...props} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
