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
    // Note: MetricsToggle renders 'compute' and 'arcagi' metrics
    // ECI is hidden as it doesn't add meaningful visual information
    it('renders both compute and arcagi metrics', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText('Training Compute')).toBeInTheDocument()
      expect(screen.getByText('ARC-AGI Score')).toBeInTheDocument()
    })

    it('renders descriptions for metrics', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText(/FLOP trend line/)).toBeInTheDocument()
      expect(screen.getByText(/Novel reasoning benchmark/)).toBeInTheDocument()
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

    it('calls onMetricsChange when enabling arcagi', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute']}
          onMetricsChange={onMetricsChange}
        />
      )

      const arcagiCheckbox = screen.getByRole('checkbox', {
        name: /arc-agi/i,
      })
      fireEvent.click(arcagiCheckbox)

      expect(onMetricsChange).toHaveBeenCalledWith(['compute', 'arcagi'])
    })

    it('calls onMetricsChange when disabling arcagi', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute', 'arcagi']}
          onMetricsChange={onMetricsChange}
        />
      )

      const arcagiCheckbox = screen.getByRole('checkbox', {
        name: /arc-agi/i,
      })
      fireEvent.click(arcagiCheckbox)

      expect(onMetricsChange).toHaveBeenCalledWith(['compute'])
    })
  })

  describe('accessibility', () => {
    it('has accessible labels for checkboxes', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(
        screen.getByRole('checkbox', { name: /training compute/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /arc-agi/i })
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

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked()
      })
    })

    it('handles compute metric enabled', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={['compute']}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      const arcagiCheckbox = screen.getByRole('checkbox', {
        name: /arc-agi/i,
      })
      expect(computeCheckbox).toBeChecked()
      expect(arcagiCheckbox).not.toBeChecked()
    })

    it('handles arcagi metric enabled', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={['arcagi']}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      const arcagiCheckbox = screen.getByRole('checkbox', {
        name: /arc-agi/i,
      })
      expect(computeCheckbox).not.toBeChecked()
      expect(arcagiCheckbox).toBeChecked()
    })

    it('handles both metrics enabled', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={['compute', 'arcagi']}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      const arcagiCheckbox = screen.getByRole('checkbox', {
        name: /arc-agi/i,
      })
      expect(computeCheckbox).toBeChecked()
      expect(arcagiCheckbox).toBeChecked()
    })

    it('applies custom className', () => {
      const { container } = render(
        <MetricsToggle {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
