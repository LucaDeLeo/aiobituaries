import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DateRangeSlider } from '@/components/controls/date-range-slider'

describe('DateRangeSlider', () => {
  const defaultProps = {
    value: [2010, 2025] as [number, number],
    onValueChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders current range display', () => {
      render(<DateRangeSlider {...defaultProps} />)

      expect(screen.getByText('2010 - 2025')).toBeInTheDocument()
    })

    it('renders year span', () => {
      render(<DateRangeSlider {...defaultProps} />)

      expect(screen.getByText('15 years')).toBeInTheDocument()
    })

    it('renders min and max labels', () => {
      render(<DateRangeSlider {...defaultProps} />)

      expect(screen.getByText('1950')).toBeInTheDocument()
      expect(screen.getByText('2025')).toBeInTheDocument()
    })

    it('renders two slider thumbs', () => {
      render(<DateRangeSlider {...defaultProps} />)

      const thumbs = screen.getAllByRole('slider')
      expect(thumbs).toHaveLength(2)
    })

    it('reflects custom value prop', () => {
      render(<DateRangeSlider {...defaultProps} value={[1980, 2000]} />)

      expect(screen.getByText('1980 - 2000')).toBeInTheDocument()
      expect(screen.getByText('20 years')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has accessible labels for slider thumbs', () => {
      render(<DateRangeSlider {...defaultProps} />)

      expect(
        screen.getByRole('slider', { name: /start year/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('slider', { name: /end year/i })
      ).toBeInTheDocument()
    })

    it('thumbs have correct aria values', () => {
      render(<DateRangeSlider {...defaultProps} value={[2015, 2023]} />)

      const startThumb = screen.getByRole('slider', { name: /start year/i })
      const endThumb = screen.getByRole('slider', { name: /end year/i })

      expect(startThumb).toHaveAttribute('aria-valuenow', '2015')
      expect(endThumb).toHaveAttribute('aria-valuenow', '2023')
    })

    it('thumbs have min/max aria attributes', () => {
      render(<DateRangeSlider {...defaultProps} />)

      const thumbs = screen.getAllByRole('slider')

      thumbs.forEach((thumb) => {
        expect(thumb).toHaveAttribute('aria-valuemin', '1950')
        expect(thumb).toHaveAttribute('aria-valuemax', '2025')
      })
    })
  })

  describe('edge cases', () => {
    it('handles minimum range (1 year) with singular label', () => {
      render(<DateRangeSlider {...defaultProps} value={[2024, 2025]} />)

      expect(screen.getByText('2024 - 2025')).toBeInTheDocument()
      expect(screen.getByText('1 year')).toBeInTheDocument()
    })

    it('handles full range', () => {
      render(<DateRangeSlider {...defaultProps} value={[1950, 2025]} />)

      expect(screen.getByText('1950 - 2025')).toBeInTheDocument()
      expect(screen.getByText('75 years')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <DateRangeSlider {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
