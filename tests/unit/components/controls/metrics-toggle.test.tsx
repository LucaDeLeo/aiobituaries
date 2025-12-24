import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MetricsToggle } from '@/components/controls/metrics-toggle'
import type { MetricType } from '@/types/metrics'

describe('MetricsToggle', () => {
  const defaultProps = {
    selectedMetric: 'metr' as MetricType,
    onMetricChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    // Note: MetricsToggle renders 'compute' and 'arcagi' metrics
    // ECI is hidden as it doesn't add meaningful visual information
    it('renders both compute and arcagi metrics', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText('Training Compute')).toBeInTheDocument()
      expect(screen.getByText('ARC-AGI Score')).toBeInTheDocument()
    })

    it('renders descriptions for metrics', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText(/Historical training compute/)).toBeInTheDocument()
      expect(screen.getByText(/Novel reasoning benchmark/)).toBeInTheDocument()
    })

    it('shows selected state for the selected metric', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          selectedMetric="compute"
        />
      )

      const computeRadio = screen.getByRole('radio', {
        name: /training compute/i,
      })

      expect(computeRadio).toBeChecked()
    })

    it('shows unselected state for non-selected metrics', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          selectedMetric="compute"
        />
      )

      const arcagiRadio = screen.getByRole('radio', {
        name: /arc-agi/i,
      })

      expect(arcagiRadio).not.toBeChecked()
    })
  })

  describe('interactions', () => {
    it('calls onMetricChange when selecting compute', () => {
      const onMetricChange = vi.fn()
      render(
        <MetricsToggle
          selectedMetric="metr"
          onMetricChange={onMetricChange}
        />
      )

      const computeRadio = screen.getByRole('radio', {
        name: /training compute/i,
      })
      fireEvent.click(computeRadio)

      expect(onMetricChange).toHaveBeenCalledWith('compute')
    })

    it('calls onMetricChange when selecting arcagi', () => {
      const onMetricChange = vi.fn()
      render(
        <MetricsToggle
          selectedMetric="compute"
          onMetricChange={onMetricChange}
        />
      )

      const arcagiRadio = screen.getByRole('radio', {
        name: /arc-agi/i,
      })
      fireEvent.click(arcagiRadio)

      expect(onMetricChange).toHaveBeenCalledWith('arcagi')
    })

    it('does not call onMetricChange when clicking already selected metric', () => {
      // Radio buttons don't fire onChange when clicking an already-selected option
      // This is standard browser behavior
      const onMetricChange = vi.fn()
      render(
        <MetricsToggle
          selectedMetric="compute"
          onMetricChange={onMetricChange}
        />
      )

      const computeRadio = screen.getByRole('radio', {
        name: /training compute/i,
      })
      fireEvent.click(computeRadio)

      // Standard radio behavior: no event when clicking already selected
      expect(onMetricChange).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has accessible labels for radio buttons', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(
        screen.getByRole('radio', { name: /training compute/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('radio', { name: /arc-agi/i })
      ).toBeInTheDocument()
    })

    it('has radiogroup role on container', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('only one radio can be selected at a time', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          selectedMetric="compute"
        />
      )

      const computeRadio = screen.getByRole('radio', {
        name: /training compute/i,
      })
      const arcagiRadio = screen.getByRole('radio', {
        name: /arc-agi/i,
      })

      expect(computeRadio).toBeChecked()
      expect(arcagiRadio).not.toBeChecked()
    })
  })

  describe('edge cases', () => {
    it('handles compute metric selected', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          selectedMetric="compute"
        />
      )

      const computeRadio = screen.getByRole('radio', {
        name: /training compute/i,
      })
      const arcagiRadio = screen.getByRole('radio', {
        name: /arc-agi/i,
      })
      expect(computeRadio).toBeChecked()
      expect(arcagiRadio).not.toBeChecked()
    })

    it('handles arcagi metric selected', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          selectedMetric="arcagi"
        />
      )

      const computeRadio = screen.getByRole('radio', {
        name: /training compute/i,
      })
      const arcagiRadio = screen.getByRole('radio', {
        name: /arc-agi/i,
      })
      expect(computeRadio).not.toBeChecked()
      expect(arcagiRadio).toBeChecked()
    })

    it('handles metr metric selected', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          selectedMetric="metr"
        />
      )

      const metrRadio = screen.getByRole('radio', {
        name: /metr task horizon/i,
      })
      expect(metrRadio).toBeChecked()
    })

    it('applies custom className', () => {
      const { container } = render(
        <MetricsToggle {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
