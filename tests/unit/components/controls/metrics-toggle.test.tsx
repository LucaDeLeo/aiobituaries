import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MetricsToggle } from '@/components/controls/metrics-toggle'
import type { MetricType } from '@/types/metrics'

describe('MetricsToggle', () => {
  const defaultProps = {
    enabledMetrics: ['compute'] as MetricType[],
    onMetricsChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    // Note: MetricsToggle currently only renders 'compute' metric
    // since MMLU/ECI use different scales and don't align with dot Y-positions
    it('renders the compute metric', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText('Training Compute')).toBeInTheDocument()
    })

    it('renders description for compute metric', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText(/FLOP trend line/)).toBeInTheDocument()
    })

    it('shows checked state for enabled metrics', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={['compute']}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })

      expect(computeCheckbox).toBeChecked()
    })

    it('shows unchecked state when compute is not enabled', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={[]}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })

      expect(computeCheckbox).not.toBeChecked()
    })
  })

  describe('interactions', () => {
    it('calls onMetricsChange when disabling compute', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute']}
          onMetricsChange={onMetricsChange}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      fireEvent.click(computeCheckbox)

      expect(onMetricsChange).toHaveBeenCalledWith([])
    })

    it('calls onMetricsChange when enabling compute', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={[]}
          onMetricsChange={onMetricsChange}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      fireEvent.click(computeCheckbox)

      expect(onMetricsChange).toHaveBeenCalledWith(['compute'])
    })

    it('allows disabling all metrics', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute']}
          onMetricsChange={onMetricsChange}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      fireEvent.click(computeCheckbox)

      expect(onMetricsChange).toHaveBeenCalledWith([])
    })
  })

  describe('accessibility', () => {
    it('has accessible label for checkbox', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(
        screen.getByRole('checkbox', { name: /training compute/i })
      ).toBeInTheDocument()
    })

    it('toggles on keyboard space', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute']}
          onMetricsChange={onMetricsChange}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      computeCheckbox.focus()
      fireEvent.keyDown(computeCheckbox, { key: ' ' })
      fireEvent.keyUp(computeCheckbox, { key: ' ' })
      fireEvent.click(computeCheckbox)

      expect(onMetricsChange).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles empty enabledMetrics', () => {
      render(
        <MetricsToggle {...defaultProps} enabledMetrics={[]} />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('handles compute metric enabled', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={['compute']}
        />
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('applies custom className', () => {
      const { container } = render(
        <MetricsToggle {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
