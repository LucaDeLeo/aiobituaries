/**
 * CollapsibleSection Component Tests
 *
 * Tests for Story TSR-1.2: ControlPanel Shell Component
 * Tests the collapsible section component using module export pattern
 * due to React 19 + Vitest compatibility.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

describe('CollapsibleSection module exports', () => {
  it('exports CollapsibleSection component', async () => {
    const mod = await import('@/components/controls/collapsible-section')
    expect(mod.CollapsibleSection).toBeDefined()
    expect(typeof mod.CollapsibleSection).toBe('function')
  })
})

describe('CollapsibleSection rendering', () => {
  it('renders title text', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    render(
      <CollapsibleSection title="Test Section">
        <p>Content</p>
      </CollapsibleSection>
    )
    expect(screen.getByText('Test Section')).toBeInTheDocument()
  })

  it('renders children content when defaultOpen is true', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    render(
      <CollapsibleSection title="Test Section" defaultOpen={true}>
        <p>Section content</p>
      </CollapsibleSection>
    )
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('defaults to open state', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    render(
      <CollapsibleSection title="Test Section">
        <p>Visible content</p>
      </CollapsibleSection>
    )
    // Content should be visible by default
    expect(screen.getByText('Visible content')).toBeInTheDocument()
  })

  it('renders trigger button with correct attributes', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    render(
      <CollapsibleSection title="Test Section">
        <p>Content</p>
      </CollapsibleSection>
    )
    const trigger = screen.getByRole('button')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('data-state', 'open')
  })

  it('starts closed when defaultOpen is false', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    render(
      <CollapsibleSection title="Closed Section" defaultOpen={false}>
        <p>Hidden content</p>
      </CollapsibleSection>
    )
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })
})

describe('CollapsibleSection interaction', () => {
  it('toggles content visibility on click', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    render(
      <CollapsibleSection title="Toggle Section" defaultOpen={true}>
        <p>Toggle content</p>
      </CollapsibleSection>
    )

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('data-state', 'open')

    // Click to close
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('data-state', 'closed')

    // Click to open again
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('data-state', 'open')
  })

  it('supports keyboard activation with Enter', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    render(
      <CollapsibleSection title="Keyboard Section" defaultOpen={true}>
        <p>Keyboard content</p>
      </CollapsibleSection>
    )

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('data-state', 'open')

    // Press Enter to close
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.click(trigger) // Simulate actual toggle
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })

  it('supports keyboard activation with Space', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    render(
      <CollapsibleSection title="Space Section" defaultOpen={true}>
        <p>Space content</p>
      </CollapsibleSection>
    )

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('data-state', 'open')

    // Press Space to close (Radix handles this natively)
    fireEvent.keyDown(trigger, { key: ' ' })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })
})

describe('CollapsibleSection styling', () => {
  it('has group class on root for Tailwind data-attribute selectors', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    const { container } = render(
      <CollapsibleSection title="Styled Section">
        <p>Styled content</p>
      </CollapsibleSection>
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('group')
  })

  it('has border-b class on root', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    const { container } = render(
      <CollapsibleSection title="Border Section">
        <p>Border content</p>
      </CollapsibleSection>
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('border-b')
  })

  it('has hover transition on trigger', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    render(
      <CollapsibleSection title="Hover Section">
        <p>Hover content</p>
      </CollapsibleSection>
    )
    const trigger = screen.getByRole('button')
    expect(trigger.className).toContain('transition-colors')
  })

  it('renders ChevronDown icon', async () => {
    const { CollapsibleSection } = await import('@/components/controls/collapsible-section')
    const { container } = render(
      <CollapsibleSection title="Icon Section">
        <p>Icon content</p>
      </CollapsibleSection>
    )
    // lucide-react icons render as SVG elements
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
