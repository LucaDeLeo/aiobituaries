import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

// Mock the queries module
vi.mock('@/lib/sanity/queries', () => ({
  getObituaryCount: vi.fn(),
}))

// Import after mock setup
import { getObituaryCount } from '@/lib/sanity/queries'
import { CountDisplayCompact } from '@/components/obituary/count-display-compact'

// Type the mocked function
const mockedGetObituaryCount = vi.mocked(getObituaryCount)

describe('CountDisplayCompact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with formatted count', async () => {
    mockedGetObituaryCount.mockResolvedValue(42)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('formats large numbers with commas', async () => {
    mockedGetObituaryCount.mockResolvedValue(1247)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('1,247')).toBeInTheDocument()
  })

  it('renders obituaries label', async () => {
    mockedGetObituaryCount.mockResolvedValue(50)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('Obituaries')).toBeInTheDocument()
  })

  it('applies font-mono class to number span', async () => {
    mockedGetObituaryCount.mockResolvedValue(200)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    const numberSpan = screen.getByText('200')
    expect(numberSpan.className).toContain('font-mono')
  })

  it('applies text-2xl for compact sizing', async () => {
    mockedGetObituaryCount.mockResolvedValue(300)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    const numberSpan = screen.getByText('300')
    expect(numberSpan.className).toContain('text-2xl')
  })

  it('applies text-primary class to number', async () => {
    mockedGetObituaryCount.mockResolvedValue(400)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    const numberSpan = screen.getByText('400')
    expect(numberSpan.className).toContain('text-primary')
  })

  it('handles zero count', async () => {
    mockedGetObituaryCount.mockResolvedValue(0)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('falls back to 0 when Sanity fetch fails', async () => {
    mockedGetObituaryCount.mockRejectedValue(new Error('Sanity fetch failed'))

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Obituaries')).toBeInTheDocument()
  })

  it('applies muted-foreground to label', async () => {
    mockedGetObituaryCount.mockResolvedValue(700)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    const labelElement = screen.getByText('Obituaries')
    expect(labelElement.className).toContain('text-muted-foreground')
  })

  it('renders in a flex container with gap', async () => {
    mockedGetObituaryCount.mockResolvedValue(800)

    const Component = await CountDisplayCompact()
    let container: HTMLElement
    await act(async () => {
      const result = render(Component)
      container = result.container
    })

    const wrapper = container!.firstChild as HTMLElement
    expect(wrapper.className).toContain('flex')
    expect(wrapper.className).toContain('items-center')
    expect(wrapper.className).toContain('gap-2')
  })

  it('includes screen reader accessible label', async () => {
    mockedGetObituaryCount.mockResolvedValue(100)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    const srOnly = document.querySelector('.sr-only')
    expect(srOnly).toBeInTheDocument()
    expect(srOnly).toHaveTextContent('100 AI Obituaries')
  })

  it('marks visual elements as aria-hidden', async () => {
    mockedGetObituaryCount.mockResolvedValue(150)

    const Component = await CountDisplayCompact()
    await act(async () => {
      render(Component)
    })

    const numberSpan = screen.getByText('150')
    expect(numberSpan).toHaveAttribute('aria-hidden', 'true')

    const labelSpan = screen.getByText('Obituaries')
    expect(labelSpan).toHaveAttribute('aria-hidden', 'true')
  })
})
