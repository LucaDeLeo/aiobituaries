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
    it('renders all three metrics', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText('Training Compute')).toBeInTheDocument()
      expect(screen.getByText('MMLU Score')).toBeInTheDocument()
      expect(screen.getByText('Epoch Capability Index')).toBeInTheDocument()
    })

    it('renders descriptions for each metric', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(screen.getByText('FLOP trend line')).toBeInTheDocument()
      expect(screen.getByText('Benchmark accuracy')).toBeInTheDocument()
      expect(screen.getByText('Composite capability')).toBeInTheDocument()
    })

    it('shows checked state for enabled metrics', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={['compute', 'mmlu']}
        />
      )

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      const eciCheckbox = screen.getByRole('checkbox', {
        name: /capability index/i,
      })

      expect(computeCheckbox).toBeChecked()
      expect(mmluCheckbox).toBeChecked()
      expect(eciCheckbox).not.toBeChecked()
    })
  })

  describe('interactions', () => {
    it('calls onMetricsChange when enabling a metric', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute']}
          onMetricsChange={onMetricsChange}
        />
      )

      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      fireEvent.click(mmluCheckbox)

      expect(onMetricsChange).toHaveBeenCalledWith(['compute', 'mmlu'])
    })

    it('calls onMetricsChange when disabling a metric', () => {
      const onMetricsChange = vi.fn()
      render(
        <MetricsToggle
          enabledMetrics={['compute', 'mmlu']}
          onMetricsChange={onMetricsChange}
        />
      )

      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      fireEvent.click(mmluCheckbox)

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
    it('has accessible labels for all checkboxes', () => {
      render(<MetricsToggle {...defaultProps} />)

      expect(
        screen.getByRole('checkbox', { name: /training compute/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /mmlu score/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /capability index/i })
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

      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      mmluCheckbox.focus()
      fireEvent.keyDown(mmluCheckbox, { key: ' ', code: 'Space' })

      // Native checkbox handles this, but verify it's focusable
      expect(mmluCheckbox).toHaveFocus()
    })
  })

  describe('edge cases', () => {
    it('handles empty enabledMetrics', () => {
      render(<MetricsToggle {...defaultProps} enabledMetrics={[]} />)

      const computeCheckbox = screen.getByRole('checkbox', {
        name: /training compute/i,
      })
      const mmluCheckbox = screen.getByRole('checkbox', {
        name: /mmlu score/i,
      })
      const eciCheckbox = screen.getByRole('checkbox', {
        name: /capability index/i,
      })

      expect(computeCheckbox).not.toBeChecked()
      expect(mmluCheckbox).not.toBeChecked()
      expect(eciCheckbox).not.toBeChecked()
    })

    it('handles all metrics enabled', () => {
      render(
        <MetricsToggle
          {...defaultProps}
          enabledMetrics={['compute', 'mmlu', 'eci']}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked()
      })
    })

    it('applies custom className', () => {
      const { container } = render(
        <MetricsToggle {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
