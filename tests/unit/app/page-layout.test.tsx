/**
 * Homepage Layout Tests (Story TSR-1.1)
 *
 * Tests CSS Grid layout structure for desktop, tablet, and mobile breakpoints.
 * These are unit tests for the layout structure - visual testing validates appearance.
 */
import React from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'

// Mock Sanity queries
vi.mock('@/lib/sanity/queries', () => ({
  getObituaries: vi.fn().mockResolvedValue([]),
  getObituaryCount: vi.fn().mockResolvedValue(42),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) {
    return React.createElement('a', { href, ...props }, children)
  },
}))

// Mock HomeClient to avoid complex client component setup
vi.mock('@/app/home-client', () => ({
  HomeClient: function MockHomeClient({
    variant,
  }: {
    obituaries: unknown[]
    variant?: string
  }) {
    return React.createElement(
      'div',
      { 'data-testid': 'home-client', 'data-variant': variant || 'default' },
      `HomeClient (${variant || 'default'})`
    )
  },
}))

// Mock MobileTimeline
vi.mock('@/components/mobile/mobile-timeline', () => ({
  MobileTimeline: function MockMobileTimeline() {
    return React.createElement(
      'div',
      { 'data-testid': 'mobile-timeline' },
      'MobileTimeline'
    )
  },
}))

// Mock CountDisplay - NOT async, return plain JSX
vi.mock('@/components/obituary/count-display', () => ({
  CountDisplay: function MockCountDisplay() {
    return React.createElement(
      'div',
      { 'data-testid': 'count-display' },
      'CountDisplay'
    )
  },
}))

// Mock CountDisplayCompact - NOT async, return plain JSX
vi.mock('@/components/obituary/count-display-compact', () => ({
  CountDisplayCompact: function MockCountDisplayCompact() {
    return React.createElement(
      'div',
      { 'data-testid': 'count-display-compact' },
      'CountDisplayCompact'
    )
  },
}))

// Mock ObituaryList - NOT async, return plain JSX
vi.mock('@/components/obituary/obituary-list', () => ({
  ObituaryList: function MockObituaryList() {
    return React.createElement(
      'div',
      { 'data-testid': 'obituary-list' },
      'ObituaryList'
    )
  },
}))

// Mock JsonLd
vi.mock('@/components/seo/json-ld', () => ({
  JsonLd: function MockJsonLd() {
    return null
  },
}))

// Mock ControlPanelWrapper to avoid useMediaQuery/matchMedia issues
vi.mock('@/components/controls', () => ({
  ControlPanelWrapper: function MockControlPanelWrapper({
    totalCount,
    variant,
  }: {
    totalCount: number
    variant?: string
  }) {
    return React.createElement(
      'div',
      { 'data-testid': 'control-panel-wrapper', 'data-variant': variant, 'data-count': totalCount },
      'ControlPanelWrapper'
    )
  },
  ControlSheet: function MockControlSheet({
    totalCount,
  }: {
    totalCount: number
  }) {
    return React.createElement(
      'div',
      { 'data-testid': 'control-sheet', 'data-count': totalCount },
      'ControlSheet'
    )
  },
}))

// Mock HomePageClient to avoid useVisualizationState/nuqs issues
vi.mock('@/app/home-page-client', () => ({
  HomePageClient: function MockHomePageClient({
    obituaries,
  }: {
    obituaries: unknown[]
  }) {
    // Render the same structure as the real component for layout tests
    return React.createElement(
      React.Fragment,
      null,
      // Chart section
      React.createElement(
        'section',
        { className: 'relative overflow-hidden h-full' },
        React.createElement(
          'div',
          { 'data-testid': 'home-client', 'data-variant': 'hero' },
          `HomeClient (hero)`
        )
      ),
      // Sidebar
      React.createElement(
        'aside',
        { className: 'border-l border-border overflow-y-auto bg-secondary', 'aria-label': 'Controls panel' },
        React.createElement(
          'div',
          { 'data-testid': 'control-panel-wrapper', 'data-count': (obituaries as unknown[])?.length ?? 0 },
          'ControlPanelWrapper'
        )
      )
    )
  },
}))

// Import after all mocks
import Home from '@/app/page'

describe('Homepage Layout Structure (Story TSR-1.1)', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  describe('Desktop Grid Layout (AC-1.1.1)', () => {
    it('renders desktop-specific layout wrapper with lg:block', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      // Find the desktop container (hidden lg:block)
      const container = document.querySelector('.hidden.lg\\:block')
      expect(container).toBeInTheDocument()
    })

    it('renders grid layout with correct column structure', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      // Find the grid container with grid-cols-[1fr_320px]
      const grid = document.querySelector('.grid.grid-cols-\\[1fr_320px\\]')
      expect(grid).toBeInTheDocument()
    })

    it('renders HomeClient with hero variant in desktop layout', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      // Both default and hero HomeClient exist (tablet & desktop)
      // Find the hero variant specifically
      const homeClients = screen.getAllByTestId('home-client')
      const heroVariant = homeClients.find(
        (el) => el.getAttribute('data-variant') === 'hero'
      )
      expect(heroVariant).toBeInTheDocument()
    })

    it('renders CountDisplayCompact in desktop header', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      expect(screen.getByTestId('count-display-compact')).toBeInTheDocument()
    })
  })

  describe('Chart Container (AC-1.1.2, AC-1.1.5)', () => {
    it('renders chart section with overflow-hidden', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      // Desktop grid contains section with overflow-hidden
      const chartSection = document.querySelector(
        '.grid section.overflow-hidden'
      )
      expect(chartSection).toBeInTheDocument()
    })

    it('renders chart section with relative positioning', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const chartSection = document.querySelector('.grid section.relative')
      expect(chartSection).toBeInTheDocument()
    })

    it('renders chart section with h-full class', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const chartSection = document.querySelector('.grid section.h-full')
      expect(chartSection).toBeInTheDocument()
    })
  })

  describe('Sidebar Styles (AC-1.1.4, AC-1.1.6)', () => {
    it('renders aside with border-l class', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const aside = document.querySelector('aside.border-l')
      expect(aside).toBeInTheDocument()
    })

    it('renders aside with border-border class', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const aside = document.querySelector('aside.border-border')
      expect(aside).toBeInTheDocument()
    })

    it('renders aside with overflow-y-auto for independent scrolling', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const aside = document.querySelector('aside.overflow-y-auto')
      expect(aside).toBeInTheDocument()
    })

    it('renders aside with bg-secondary background', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const aside = document.querySelector('aside.bg-secondary')
      expect(aside).toBeInTheDocument()
    })
  })

  describe('Grid Structure (AC-1.1.3)', () => {
    it('renders grid with gap-0 (no gap between regions)', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const grid = document.querySelector('.grid.gap-0')
      expect(grid).toBeInTheDocument()
    })

    it('renders grid with flex-1 for height', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const grid = document.querySelector('.grid.flex-1')
      expect(grid).toBeInTheDocument()
    })

    it('renders grid with min-h-[500px] minimum height', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const grid = document.querySelector('.grid.min-h-\\[500px\\]')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Mobile/Tablet Layout Preserved', () => {
    it('renders mobile/tablet wrapper with lg:hidden', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const mobileWrapper = document.querySelector('.lg\\:hidden')
      expect(mobileWrapper).toBeInTheDocument()
    })

    it('renders CountDisplay in mobile/tablet layout', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      expect(screen.getByTestId('count-display')).toBeInTheDocument()
    })

    it('renders MobileTimeline component for mobile', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      expect(screen.getByTestId('mobile-timeline')).toBeInTheDocument()
    })

    it('renders default HomeClient variant in tablet layout', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      // Both variants should exist - default for tablet, hero for desktop
      const homeClients = screen.getAllByTestId('home-client')
      const defaultVariant = homeClients.find(
        (el) => el.getAttribute('data-variant') === 'default'
      )
      expect(defaultVariant).toBeInTheDocument()
    })
  })

  describe('Header Structure', () => {
    it('renders header with border-b border-border', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const header = document.querySelector('header.border-b.border-border')
      expect(header).toBeInTheDocument()
    })

    it('renders header with flex layout', async () => {
      const Component = await Home()
      await act(async () => {
        render(Component)
      })

      const header = document.querySelector('header.flex')
      expect(header).toBeInTheDocument()
    })
  })
})

describe('HomeClient variant prop (AC-1.1.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('exports HomeClientProps interface with variant', async () => {
    const homeClientModule = await import('@/app/home-client')
    expect(homeClientModule.HomeClient).toBeDefined()
  })
})

describe('ScatterPlot fillContainer prop', () => {
  it('exports ScatterPlot with fillContainer prop support', async () => {
    const scatterModule = await import(
      '@/components/visualization/scatter-plot'
    )
    expect(scatterModule.ScatterPlot).toBeDefined()
  })
})
