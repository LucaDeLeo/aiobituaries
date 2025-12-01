import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

// Mock the queries module - vi.fn() goes inside factory to avoid hoisting issues
vi.mock('@/lib/sanity/queries', () => ({
  getObituaryCount: vi.fn(),
}))

// Import after mock setup
import { getObituaryCount } from '@/lib/sanity/queries'
import { CountDisplay } from '@/components/obituary/count-display'

// Type the mocked function
const mockedGetObituaryCount = vi.mocked(getObituaryCount)

describe('CountDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with formatted count', async () => {
    mockedGetObituaryCount.mockResolvedValue(42)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('formats large numbers with commas', async () => {
    mockedGetObituaryCount.mockResolvedValue(1247)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('1,247')).toBeInTheDocument()
  })

  it('formats very large numbers correctly', async () => {
    mockedGetObituaryCount.mockResolvedValue(1234567)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('renders obituaries label', async () => {
    mockedGetObituaryCount.mockResolvedValue(50)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('obituaries')).toBeInTheDocument()
  })

  it('applies font-mono class to count', async () => {
    mockedGetObituaryCount.mockResolvedValue(200)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    const countElement = screen.getByText('200')
    expect(countElement.className).toContain('font-mono')
  })

  it('applies responsive text sizing classes', async () => {
    mockedGetObituaryCount.mockResolvedValue(300)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    const countElement = screen.getByText('300')
    // Updated for Story 5-6: mobile 2rem (text-3xl), tablet 2.5rem (text-4xl), desktop 3rem (text-5xl)
    expect(countElement.className).toContain('text-3xl')
    expect(countElement.className).toContain('md:text-4xl')
    expect(countElement.className).toContain('lg:text-5xl')
  })

  it('applies gold accent color class', async () => {
    mockedGetObituaryCount.mockResolvedValue(400)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    const countElement = screen.getByText('400')
    expect(countElement.className).toContain('text-[--accent-primary]')
  })

  it('applies animate-pulse-glow class', async () => {
    mockedGetObituaryCount.mockResolvedValue(500)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    const countElement = screen.getByText('500')
    expect(countElement.className).toContain('animate-pulse-glow')
  })

  it('applies motion-reduce class for accessibility', async () => {
    mockedGetObituaryCount.mockResolvedValue(600)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    const countElement = screen.getByText('600')
    expect(countElement.className).toContain('motion-reduce:animate-none')
  })

  it('handles zero count', async () => {
    mockedGetObituaryCount.mockResolvedValue(0)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('falls back to 0 when Sanity fetch fails', async () => {
    mockedGetObituaryCount.mockRejectedValue(new Error('Sanity fetch failed'))

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('obituaries')).toBeInTheDocument()
  })

  it('applies secondary text color to label', async () => {
    mockedGetObituaryCount.mockResolvedValue(700)

    const Component = await CountDisplay()
    await act(async () => {
      render(Component)
    })

    const labelElement = screen.getByText('obituaries')
    expect(labelElement.className).toContain('text-[--text-secondary]')
  })

  it('renders in a centered container', async () => {
    mockedGetObituaryCount.mockResolvedValue(800)

    const Component = await CountDisplay()
    let container: HTMLElement
    await act(async () => {
      const result = render(Component)
      container = result.container
    })

    const wrapper = container!.firstChild as HTMLElement
    expect(wrapper.className).toContain('text-center')
  })
})
