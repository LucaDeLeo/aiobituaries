/**
 * Not Found Page Tests (AC-2.3.9)
 *
 * Tests the 404 page for invalid obituary slugs.
 */
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'

// Mock next/link at the top level
vi.mock('next/link', () => {
  return {
    default: function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
      return React.createElement('a', { href, ...props }, children)
    },
  }
})

// Import after mock
import NotFound from '@/app/obituary/[slug]/not-found'

describe('NotFound Page (AC-2.3.9)', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  it('renders "Obituary Not Found" heading', async () => {
    await act(async () => {
      render(<NotFound />)
    })

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Obituary Not Found')
  })

  it('renders descriptive paragraph', async () => {
    await act(async () => {
      render(<NotFound />)
    })

    expect(
      screen.getByText(/doesn't exist or may have been removed/i)
    ).toBeInTheDocument()
  })

  it('renders return link with href="/"', async () => {
    await act(async () => {
      render(<NotFound />)
    })

    const returnLink = screen.getByRole('link', { name: /return to homepage/i })
    expect(returnLink).toHaveAttribute('href', '/')
  })

  it('applies serif font to heading', async () => {
    await act(async () => {
      render(<NotFound />)
    })

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('font-serif')
  })

  it('applies Deep Archive theme colors', async () => {
    await act(async () => {
      render(<NotFound />)
    })

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.className).toContain('text-[--text-primary]')
  })
})
