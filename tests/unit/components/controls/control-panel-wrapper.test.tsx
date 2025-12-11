/**
 * ControlPanelWrapper Component Tests
 *
 * Tests for Story TSR-1.2: ControlPanel Shell Component
 * Tests the wrapper component that handles state for Server Component integration.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('ControlPanelWrapper module exports', () => {
  it('exports ControlPanelWrapper component', async () => {
    const mod = await import('@/components/controls')
    expect(mod.ControlPanelWrapper).toBeDefined()
    expect(typeof mod.ControlPanelWrapper).toBe('function')
  })
})

describe('ControlPanelWrapper rendering', () => {
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

  it('renders all 4 collapsible sections', async () => {
    const { ControlPanelWrapper } = await import('@/components/controls')
    render(<ControlPanelWrapper totalCount={25} />)
    expect(screen.getByText('Background Metrics')).toBeInTheDocument()
    expect(screen.getByText('Time Range')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Display Options')).toBeInTheDocument()
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
})
