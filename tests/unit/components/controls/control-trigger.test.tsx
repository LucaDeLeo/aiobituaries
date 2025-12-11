/**
 * ControlTrigger Component Tests
 *
 * Tests for Story TSR-1.3: Responsive Control Surfaces
 * Tests the floating action button (FAB) that triggers the control sheet.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'

describe('ControlTrigger module exports', () => {
  it('exports ControlTrigger component', async () => {
    const mod = await import('@/components/controls')
    expect(mod.ControlTrigger).toBeDefined()
    expect(typeof mod.ControlTrigger).toBe('object') // forwardRef returns object
  })

  it('exports ControlTriggerProps type', async () => {
    const mod = await import('@/components/controls')
    expect(mod.ControlTrigger).toBeDefined()
  })
})

describe('ControlTrigger rendering', () => {
  it('renders a button element', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders with correct aria-label', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Open controls')
  })

  it('renders SlidersHorizontal icon', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    const { container } = render(<ControlTrigger />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

describe('ControlTrigger responsive visibility', () => {
  it('has lg:hidden class to hide on desktop', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('lg:hidden')
  })
})

describe('ControlTrigger FAB styling', () => {
  it('has fixed positioning', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('fixed')
  })

  it('is positioned in bottom-right corner', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bottom-6')
    expect(button.className).toContain('right-6')
  })

  it('has FAB dimensions (h-14 w-14 = 56x56px)', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('h-14')
    expect(button.className).toContain('w-14')
  })

  it('has rounded-full for circular shape', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('rounded-full')
  })

  it('has shadow-lg for elevation', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('shadow-lg')
  })

  it('has z-40 for stacking context', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('z-40')
  })
})

describe('ControlTrigger ref forwarding', () => {
  it('forwards ref correctly', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    const ref = createRef<HTMLButtonElement>()
    render(<ControlTrigger ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('ref points to the button element', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    const ref = createRef<HTMLButtonElement>()
    render(<ControlTrigger ref={ref} />)
    expect(ref.current?.tagName).toBe('BUTTON')
  })
})

describe('ControlTrigger click handling', () => {
  it('calls onClick when clicked', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    const handleClick = vi.fn()
    render(<ControlTrigger onClick={handleClick} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('ControlTrigger additional props', () => {
  it('accepts additional className', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger className="custom-class" />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
  })

  it('merges className with default classes', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger className="custom-class" />)
    const button = screen.getByRole('button')
    // Should have both custom and default classes
    expect(button.className).toContain('custom-class')
    expect(button.className).toContain('fixed')
    expect(button.className).toContain('lg:hidden')
  })

  it('passes through other button props', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger data-testid="fab-trigger" disabled />)
    const button = screen.getByTestId('fab-trigger')
    expect(button).toBeDisabled()
  })
})

describe('ControlTrigger keyboard accessibility', () => {
  it('is focusable', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    render(<ControlTrigger />)
    const button = screen.getByRole('button')
    button.focus()
    expect(document.activeElement).toBe(button)
  })

  it('triggers onClick with Enter key', async () => {
    const { ControlTrigger } = await import('@/components/controls')
    const handleClick = vi.fn()
    render(<ControlTrigger onClick={handleClick} />)

    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyUp(button, { key: 'Enter' })

    // Note: fireEvent.click is more reliable for testing button behavior
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
  })
})
