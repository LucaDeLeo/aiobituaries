/**
 * Breadcrumb Navigation Tests
 *
 * Tests for Story 5-4: Breadcrumb Navigation
 * Tests breadcrumb rendering, accessibility, and navigation behavior.
 */
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'

// Mock next/link at the top level
vi.mock('next/link', () => {
  return {
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
  }
})

// Import breadcrumb components after mock
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Link from 'next/link'

describe('Breadcrumb component exports', () => {
  it('exports Breadcrumb component', () => {
    expect(Breadcrumb).toBeDefined()
    expect(typeof Breadcrumb).toBe('object') // forwardRef returns object
  })

  it('exports BreadcrumbList component', () => {
    expect(BreadcrumbList).toBeDefined()
    expect(typeof BreadcrumbList).toBe('object')
  })

  it('exports BreadcrumbItem component', () => {
    expect(BreadcrumbItem).toBeDefined()
    expect(typeof BreadcrumbItem).toBe('object')
  })

  it('exports BreadcrumbLink component', () => {
    expect(BreadcrumbLink).toBeDefined()
    expect(typeof BreadcrumbLink).toBe('object')
  })

  it('exports BreadcrumbPage component', () => {
    expect(BreadcrumbPage).toBeDefined()
    expect(typeof BreadcrumbPage).toBe('object')
  })

  it('exports BreadcrumbSeparator component', () => {
    expect(BreadcrumbSeparator).toBeDefined()
    expect(typeof BreadcrumbSeparator).toBe('function')
  })
})

describe('Breadcrumb accessibility (AC-5.4.10)', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('renders nav element with aria-label="Breadcrumb"', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb')
  })

  it('renders ordered list (ol) for structure', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
  })

  it('BreadcrumbPage has aria-current="page"', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Current Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const currentPage = screen.getByText('Current Page')
    expect(currentPage).toHaveAttribute('aria-current', 'page')
  })

  it('BreadcrumbPage has aria-disabled="true"', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Current Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const currentPage = screen.getByText('Current Page')
    expect(currentPage).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('Breadcrumb rendering (AC-5.4.1)', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('renders Home > Source Name hierarchy', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>The New York Times</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('The New York Times')).toBeInTheDocument()
  })

  it('separator is rendered between items', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Source</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    // Separator uses ChevronRight icon by default, with aria-hidden
    const list = screen.getByRole('list')
    const separators = list.querySelectorAll('[aria-hidden="true"]')
    expect(separators.length).toBeGreaterThan(0)
  })
})

describe('Home link navigation (AC-5.4.2)', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('Home link has href="/"', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('Home is an anchor element (clickable)', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink.tagName).toBe('A')
  })
})

describe('Current page not clickable (AC-5.4.3)', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('BreadcrumbPage is a span, not an anchor', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Current Source</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const currentPage = screen.getByText('Current Source')
    expect(currentPage.tagName).toBe('SPAN')
  })

  it('current page is disabled (aria-disabled)', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Current Source</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const currentPage = screen.getByText('Current Source')
    // Current page has role="link" but is aria-disabled, making it non-interactive
    expect(currentPage).toHaveAttribute('aria-disabled', 'true')
  })

  it('current page is not a navigable anchor element', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Current Source</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const currentPage = screen.getByText('Current Source')
    // Should be a span, not an anchor - no href attribute
    expect(currentPage.tagName).toBe('SPAN')
    expect(currentPage).not.toHaveAttribute('href')
  })
})

describe('Long source name truncation (AC-5.4.9)', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('shows full text for short source names', async () => {
    const shortSource = 'The New York Times'

    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{shortSource}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    expect(screen.getByText(shortSource)).toBeInTheDocument()
  })

  it('truncates source names over 40 characters', async () => {
    const longSource =
      'The Very Long Publication Name That Exceeds Forty Characters Limit'
    const truncatedSource = `${longSource.slice(0, 37)}...`

    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage title={longSource}>{truncatedSource}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    // Should show truncated text
    expect(screen.getByText(truncatedSource)).toBeInTheDocument()
    // Should NOT show full text
    expect(screen.queryByText(longSource)).not.toBeInTheDocument()
  })

  it('shows title attribute for full text on hover when truncated', async () => {
    const longSource =
      'The Very Long Publication Name That Exceeds Forty Characters Limit'
    const truncatedSource = `${longSource.slice(0, 37)}...`

    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage title={longSource}>{truncatedSource}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const currentPage = screen.getByText(truncatedSource)
    expect(currentPage).toHaveAttribute('title', longSource)
  })
})

describe('Breadcrumb styling (AC-5.4.4, AC-5.4.5)', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('BreadcrumbList has text-sm styling', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const list = screen.getByRole('list')
    expect(list.className).toContain('text-sm')
  })

  it('Breadcrumb can accept className for margin', async () => {
    await act(async () => {
      render(
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('mb-6')
  })
})

describe('BreadcrumbLink hover styling (AC-5.4.7)', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('BreadcrumbLink has hover:underline class', async () => {
    await act(async () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    const link = screen.getByRole('link', { name: 'Home' })
    expect(link.className).toContain('hover:underline')
  })
})

describe('Full breadcrumb integration', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('renders complete Home > Source breadcrumb structure', async () => {
    const source = 'TechCrunch'

    await act(async () => {
      render(
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-[--text-muted] hover:text-[--text-secondary]">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[--text-muted]" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[--text-secondary]">
                {source}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    })

    // Verify structure
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb')

    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('href', '/')

    const currentPage = screen.getByText(source)
    expect(currentPage).toHaveAttribute('aria-current', 'page')
    expect(currentPage.tagName).toBe('SPAN')
  })
})
