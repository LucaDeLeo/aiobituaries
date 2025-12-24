/**
 * ObituaryContext Component Tests
 *
 * Tests the ObituaryContext component functionality including:
 * - Section heading display (AC-2.4.1)
 * - Stock prices formatting and display (AC-2.4.2, AC-2.4.9)
 * - AI model display (AC-2.4.3)
 * - Benchmark with score display (AC-2.4.4)
 * - Milestone display (AC-2.4.5)
 * - Additional note display (AC-2.4.6)
 * - Partial data handling (AC-2.4.7)
 * - Empty data handling (AC-2.4.8)
 * - Deep Archive card styling (AC-2.4.10)
 */
import React from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import type { ContextMetadata } from '@/types/context'
import { ObituaryContext } from '@/components/obituary/obituary-context'

// Mock context data for testing
const mockFullContext: ContextMetadata = {
  nvdaPrice: 450.5,
  msftPrice: 350.25,
  googPrice: 145.75,
  currentModel: 'GPT-4',
  benchmarkName: 'MMLU',
  benchmarkScore: 86.5,
  milestone: 'ChatGPT reached 100M users',
  note: 'This marked the beginning of the AI boom.',
}

const mockEmptyContext: ContextMetadata = {}

const mockPartialContext: ContextMetadata = {
  nvdaPrice: 450.5,
  currentModel: 'GPT-4',
}

const mockBenchmarkOnlyContext: ContextMetadata = {
  benchmarkName: 'MMLU',
}

const mockStockPricesOnlyContext: ContextMetadata = {
  nvdaPrice: 450.5,
  msftPrice: 350.25,
  googPrice: 145.75,
}

const mockMilestoneAndNoteContext: ContextMetadata = {
  milestone: 'ChatGPT launched',
  note: 'First AI winter reference',
}

// Default test date (when AI metrics are available)
const mockDate = '2024-01-15'

describe('ObituaryContext', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  describe('Section Heading (AC-2.4.1)', () => {
    it('renders "Context at Time" heading when data exists', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      expect(screen.getByRole('heading', { name: /context at time/i })).toBeInTheDocument()
    })

    it('renders "Context at Time" heading even when empty', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockEmptyContext} date={mockDate} />)
      })

      expect(screen.getByRole('heading', { name: /context at time/i })).toBeInTheDocument()
    })
  })

  describe('Empty CMS Context (AC-2.4.8)', () => {
    it('shows computed AI metrics when CMS context is empty', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockEmptyContext} date={mockDate} />)
      })

      // Even with empty CMS context, computed AI metrics are always shown
      expect(screen.getByText('AI Progress')).toBeInTheDocument()
      expect(screen.getByText('Frontier Model')).toBeInTheDocument()
    })

    it('does not show CMS-only cards when context is empty', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockEmptyContext} date={mockDate} />)
      })

      // CMS-specific cards should not appear
      expect(screen.queryByText('Stock Prices')).not.toBeInTheDocument()
      expect(screen.queryByText('Benchmark')).not.toBeInTheDocument()
      expect(screen.queryByText('AI Milestone')).not.toBeInTheDocument()
    })

    it('shows CMS cards when any CMS data exists', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockPartialContext} date={mockDate} />)
      })

      // Should show computed cards plus CMS cards with data
      expect(screen.getByText('AI Progress')).toBeInTheDocument()
      expect(screen.getByText('Stock Prices')).toBeInTheDocument()
    })
  })

  describe('Stock Prices (AC-2.4.2, AC-2.4.9)', () => {
    it('displays stock prices when available', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockStockPricesOnlyContext} date={mockDate} />)
      })

      expect(screen.getByText(/NVDA:/)).toBeInTheDocument()
      expect(screen.getByText(/MSFT:/)).toBeInTheDocument()
      expect(screen.getByText(/GOOG:/)).toBeInTheDocument()
    })

    it('formats currency correctly as USD', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockStockPricesOnlyContext} date={mockDate} />)
      })

      // Check for proper USD formatting: $XXX.XX
      expect(screen.getByText(/\$450\.50/)).toBeInTheDocument()
      expect(screen.getByText(/\$350\.25/)).toBeInTheDocument()
      expect(screen.getByText(/\$145\.75/)).toBeInTheDocument()
    })

    it('displays Stock Prices card title', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockStockPricesOnlyContext} date={mockDate} />)
      })

      expect(screen.getByText('Stock Prices')).toBeInTheDocument()
    })

    it('only shows available stock prices (partial)', async () => {
      const partialStocks: ContextMetadata = {
        nvdaPrice: 450.5,
      }
      await act(async () => {
        render(<ObituaryContext context={partialStocks} date={mockDate} />)
      })

      expect(screen.getByText(/NVDA:/)).toBeInTheDocument()
      expect(screen.queryByText(/MSFT:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/GOOG:/)).not.toBeInTheDocument()
    })

    it('handles zero stock price correctly (0 is valid)', async () => {
      const zeroPrice: ContextMetadata = {
        nvdaPrice: 0,
      }
      await act(async () => {
        render(<ObituaryContext context={zeroPrice} date={mockDate} />)
      })

      expect(screen.getByText(/NVDA:/)).toBeInTheDocument()
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument()
    })

    it('does not show Stock Prices card when no prices exist', async () => {
      const noStocks: ContextMetadata = {
        currentModel: 'GPT-4',
      }
      await act(async () => {
        render(<ObituaryContext context={noStocks} date={mockDate} />)
      })

      expect(screen.queryByText('Stock Prices')).not.toBeInTheDocument()
    })
  })

  describe('AI Model (AC-2.4.3)', () => {
    it('displays AI model when available', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockPartialContext} date={mockDate} />)
      })

      expect(screen.getByText('GPT-4')).toBeInTheDocument()
    })

    it('displays Frontier Model card title', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockPartialContext} date={mockDate} />)
      })

      expect(screen.getByText('Frontier Model')).toBeInTheDocument()
    })

    it('always shows Frontier Model card when date is provided', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockStockPricesOnlyContext} date={mockDate} />)
      })

      // Frontier Model is always computed from date, so it should be present
      expect(screen.getByText('Frontier Model')).toBeInTheDocument()
    })
  })

  describe('Benchmark (AC-2.4.4)', () => {
    it('displays benchmark name and score when available', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      // CMS benchmark card should show the CMS benchmark name and score
      expect(screen.getByText('Benchmark')).toBeInTheDocument()
      // There may be multiple MMLU elements (CMS card + computed AI Progress), just check one exists
      expect(screen.getAllByText(/MMLU/).length).toBeGreaterThanOrEqual(1)
      // There may be multiple 86.5% elements if computed metrics coincide with CMS data
      expect(screen.getAllByText(/86\.5%/).length).toBeGreaterThanOrEqual(1)
    })

    it('displays Benchmark card title', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      expect(screen.getByText('Benchmark')).toBeInTheDocument()
    })

    it('displays CMS benchmark card when name is provided', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockBenchmarkOnlyContext} date={mockDate} />)
      })

      // CMS benchmark card shows the benchmark name
      expect(screen.getByText('Benchmark')).toBeInTheDocument()
      // MMLU may appear in both CMS card and computed AI Progress card
      expect(screen.getAllByText(/MMLU/).length).toBeGreaterThanOrEqual(1)
    })

    it('applies gold color and mono font to benchmark score', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      // Find the CMS Benchmark card specifically to avoid matching computed AI Progress metrics
      const benchmarkCard = screen.getByText('Benchmark').closest('[data-slot="card"]')
      expect(benchmarkCard).not.toBeNull()
      const scoreElement = benchmarkCard!.querySelector('.font-mono')
      expect(scoreElement).not.toBeNull()
      expect(scoreElement).toHaveClass('text-[var(--accent-primary)]')
      expect(scoreElement).toHaveClass('font-mono')
      expect(scoreElement?.textContent).toContain('86.5%')
    })

    it('does not show Benchmark card when no benchmark exists', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockPartialContext} date={mockDate} />)
      })

      expect(screen.queryByText('Benchmark')).not.toBeInTheDocument()
    })

    it('handles zero benchmark score correctly (0 is valid)', async () => {
      const zeroBenchmark: ContextMetadata = {
        benchmarkName: 'MMLU',
        benchmarkScore: 0,
      }
      await act(async () => {
        render(<ObituaryContext context={zeroBenchmark} date={mockDate} />)
      })

      expect(screen.getByText(/0%/)).toBeInTheDocument()
    })
  })

  describe('Milestone (AC-2.4.5)', () => {
    it('displays milestone when available', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      expect(screen.getByText('ChatGPT reached 100M users')).toBeInTheDocument()
    })

    it('displays AI Milestone card title', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockMilestoneAndNoteContext} date={mockDate} />)
      })

      expect(screen.getByText('AI Milestone')).toBeInTheDocument()
    })

    it('does not show Milestone card when no milestone exists', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockStockPricesOnlyContext} date={mockDate} />)
      })

      expect(screen.queryByText('AI Milestone')).not.toBeInTheDocument()
    })
  })

  describe('Additional Note (AC-2.4.6)', () => {
    it('displays note when available', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      expect(screen.getByText('This marked the beginning of the AI boom.')).toBeInTheDocument()
    })

    it('applies muted and italic styling to note', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockMilestoneAndNoteContext} date={mockDate} />)
      })

      const noteElement = screen.getByText('First AI winter reference')
      expect(noteElement).toHaveClass('text-[var(--text-muted)]')
      expect(noteElement).toHaveClass('italic')
    })

    it('does not show note when note does not exist', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockStockPricesOnlyContext} date={mockDate} />)
      })

      // Note element should not be present
      const noteElements = document.querySelectorAll('.italic')
      expect(noteElements.length).toBe(0)
    })
  })

  describe('Partial Data Handling (AC-2.4.7)', () => {
    it('shows CMS fields and computed AI metrics together', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockMilestoneAndNoteContext} date={mockDate} />)
      })

      // Should show CMS milestone and note
      expect(screen.getByText('AI Milestone')).toBeInTheDocument()
      expect(screen.getByText('ChatGPT launched')).toBeInTheDocument()
      expect(screen.getByText('First AI winter reference')).toBeInTheDocument()

      // Should NOT show stock prices or CMS benchmark (not in context)
      expect(screen.queryByText('Stock Prices')).not.toBeInTheDocument()
      expect(screen.queryByText('Benchmark')).not.toBeInTheDocument()

      // But computed AI cards (AI Progress, Frontier Model) should always be present
      expect(screen.getByText('AI Progress')).toBeInTheDocument()
      expect(screen.getByText('Frontier Model')).toBeInTheDocument()
    })

    it('renders full context with all cards', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      // Computed AI metrics cards (always present when date is provided)
      expect(screen.getByText('AI Progress')).toBeInTheDocument()
      expect(screen.getByText('Frontier Model')).toBeInTheDocument()

      // CMS-based cards (present when context has them)
      expect(screen.getByText('Stock Prices')).toBeInTheDocument()
      expect(screen.getByText('Benchmark')).toBeInTheDocument()
      expect(screen.getByText('AI Milestone')).toBeInTheDocument()
    })
  })

  describe('Deep Archive Styling (AC-2.4.10)', () => {
    it('section has border-top separator', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      const section = document.querySelector('section')
      expect(section).toHaveClass('border-t')
      expect(section).toHaveClass('border-[var(--border)]')
    })

    it('cards use Deep Archive background color', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockStockPricesOnlyContext} date={mockDate} />)
      })

      const card = document.querySelector('[data-slot="card"]')
      expect(card).toHaveClass('bg-[var(--bg-card)]')
    })

    it('cards use Deep Archive border color', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockStockPricesOnlyContext} date={mockDate} />)
      })

      const card = document.querySelector('[data-slot="card"]')
      expect(card).toHaveClass('border-[var(--border)]')
    })

    it('section heading uses primary text color', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      const heading = screen.getByRole('heading', { name: /context at time/i })
      expect(heading).toHaveClass('text-[var(--text-primary)]')
    })

    it('card titles use secondary text color', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockStockPricesOnlyContext} date={mockDate} />)
      })

      const cardTitle = document.querySelector('[data-slot="card-title"]')
      expect(cardTitle).toHaveClass('text-[var(--text-secondary)]')
    })

    it('grid has responsive layout', async () => {
      await act(async () => {
        render(<ObituaryContext context={mockFullContext} date={mockDate} />)
      })

      const grid = document.querySelector('.grid')
      expect(grid).toHaveClass('md:grid-cols-2')
      expect(grid).toHaveClass('gap-4')
    })
  })
})
