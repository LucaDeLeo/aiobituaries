/**
 * MetricsBadge Component Tests
 *
 * Tests the MetricsBadge and CurrentMetricsFooter components
 * that display AI metrics on skeptic pages.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricsBadge, CurrentMetricsFooter } from '@/components/skeptic/metrics-badge'
import type { MetricsSnapshot } from '@/types/skeptic'

describe('MetricsBadge', () => {
  const fullMetrics: MetricsSnapshot = {
    mmlu: 85.5,
    eci: 145.2,
    compute: 25.3,
    computeFormatted: '10^25.3',
  }

  const partialMetrics: MetricsSnapshot = {
    mmlu: 67.2,
    eci: null, // Before Feb 2023
    compute: 24.4,
    computeFormatted: '10^24.4',
  }

  const earlyMetrics: MetricsSnapshot = {
    mmlu: null, // Before Aug 2021
    eci: null,
    compute: 20.1,
    computeFormatted: '10^20.1',
  }

  describe('displays all metrics when available', () => {
    it('shows MMLU percentage', () => {
      render(<MetricsBadge metrics={fullMetrics} />)
      expect(screen.getByText('85.5%')).toBeInTheDocument()
    })

    it('shows compute formatted', () => {
      render(<MetricsBadge metrics={fullMetrics} />)
      expect(screen.getByText('10^25.3')).toBeInTheDocument()
    })

    it('shows ECI value', () => {
      render(<MetricsBadge metrics={fullMetrics} />)
      expect(screen.getByText('145.2')).toBeInTheDocument()
    })

    it('shows all labels', () => {
      render(<MetricsBadge metrics={fullMetrics} />)
      expect(screen.getByText('MMLU:')).toBeInTheDocument()
      expect(screen.getByText('Compute:')).toBeInTheDocument()
      expect(screen.getByText('ECI:')).toBeInTheDocument()
    })
  })

  describe('handles null metrics gracefully', () => {
    it('shows -- for null ECI', () => {
      render(<MetricsBadge metrics={partialMetrics} />)
      expect(screen.getByText('--')).toBeInTheDocument()
      expect(screen.getByText('67.2%')).toBeInTheDocument()
    })

    it('shows -- for both null MMLU and ECI', () => {
      render(<MetricsBadge metrics={earlyMetrics} />)
      const dashes = screen.getAllByText('--')
      expect(dashes).toHaveLength(2) // MMLU and ECI both null
    })

    it('always shows compute (never null)', () => {
      render(<MetricsBadge metrics={earlyMetrics} />)
      expect(screen.getByText('10^20.1')).toBeInTheDocument()
    })
  })

  describe('compact mode', () => {
    it('applies compact styling', () => {
      const { container } = render(<MetricsBadge metrics={fullMetrics} compact />)
      expect(container.querySelector('.space-y-0\\.5')).toBeInTheDocument()
    })

    it('uses smaller text in compact mode', () => {
      const { container } = render(<MetricsBadge metrics={fullMetrics} compact />)
      expect(container.querySelector('.text-xs')).toBeInTheDocument()
    })
  })
})

describe('CurrentMetricsFooter', () => {
  const currentMetrics: MetricsSnapshot = {
    mmlu: 88.1,
    eci: 154.4,
    compute: 26.7,
    computeFormatted: '10^26.7',
  }

  it('displays "Today\'s AI Metrics" heading', () => {
    render(<CurrentMetricsFooter metrics={currentMetrics} />)
    expect(screen.getByText("Today's AI Metrics")).toBeInTheDocument()
  })

  it('shows all current metrics in one line', () => {
    render(<CurrentMetricsFooter metrics={currentMetrics} />)
    expect(screen.getByText(/MMLU 88.1%/)).toBeInTheDocument()
    expect(screen.getByText(/Compute 10\^26\.7/)).toBeInTheDocument()
    expect(screen.getByText(/ECI 154\.4/)).toBeInTheDocument()
  })

  it('handles null metrics with -- placeholder', () => {
    const nullMetrics: MetricsSnapshot = {
      mmlu: null,
      eci: null,
      compute: 26.7,
      computeFormatted: '10^26.7',
    }
    render(<CurrentMetricsFooter metrics={nullMetrics} />)
    expect(screen.getByText(/MMLU --/)).toBeInTheDocument()
    expect(screen.getByText(/ECI --/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <CurrentMetricsFooter metrics={currentMetrics} className="mt-8" />
    )
    expect(container.querySelector('.mt-8')).toBeInTheDocument()
  })
})
