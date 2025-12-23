/**
 * AIContextCell Component Tests
 *
 * Tests for the AI context cell that displays training compute level
 * with era-based coloring and tooltip in the obituary table.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  AIContextCell,
  getComputeColor,
  formatComputeCompact,
} from '@/components/obituary/ai-context-cell'
import { TooltipProvider } from '@/components/ui/tooltip'

// Wrapper with TooltipProvider (required by AIContextCell)
function renderWithProvider(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

describe('getComputeColor', () => {
  describe('era thresholds', () => {
    it('returns early era color for compute < 20', () => {
      expect(getComputeColor(15)).toBe('var(--text-muted)')
      expect(getComputeColor(19.9)).toBe('var(--text-muted)')
      expect(getComputeColor(0)).toBe('var(--text-muted)')
    })

    it('returns pre-LLM color for compute 20-23', () => {
      expect(getComputeColor(20)).toBe('var(--era-pre-llm, #3b82f6)')
      expect(getComputeColor(22)).toBe('var(--era-pre-llm, #3b82f6)')
      expect(getComputeColor(22.9)).toBe('var(--era-pre-llm, #3b82f6)')
    })

    it('returns GPT-3 era color for compute 23-25', () => {
      expect(getComputeColor(23)).toBe('var(--era-gpt3, #8b5cf6)')
      expect(getComputeColor(24)).toBe('var(--era-gpt3, #8b5cf6)')
      expect(getComputeColor(24.9)).toBe('var(--era-gpt3, #8b5cf6)')
    })

    it('returns frontier color for compute >= 25', () => {
      expect(getComputeColor(25)).toBe('var(--era-frontier, #f59e0b)')
      expect(getComputeColor(26)).toBe('var(--era-frontier, #f59e0b)')
      expect(getComputeColor(30)).toBe('var(--era-frontier, #f59e0b)')
    })
  })

  describe('boundary conditions', () => {
    it('handles exact threshold boundaries correctly', () => {
      // < 20 means 19.999... is early, 20 is pre-LLM
      expect(getComputeColor(19.999)).toBe('var(--text-muted)')
      expect(getComputeColor(20)).toBe('var(--era-pre-llm, #3b82f6)')

      // < 23 means 22.999... is pre-LLM, 23 is GPT-3
      expect(getComputeColor(22.999)).toBe('var(--era-pre-llm, #3b82f6)')
      expect(getComputeColor(23)).toBe('var(--era-gpt3, #8b5cf6)')

      // < 25 means 24.999... is GPT-3, 25 is frontier
      expect(getComputeColor(24.999)).toBe('var(--era-gpt3, #8b5cf6)')
      expect(getComputeColor(25)).toBe('var(--era-frontier, #f59e0b)')
    })

    it('handles negative values (early era)', () => {
      expect(getComputeColor(-5)).toBe('var(--text-muted)')
    })
  })
})

describe('formatComputeCompact', () => {
  describe('valid numbers', () => {
    it('formats integer exponents correctly', () => {
      expect(formatComputeCompact(24)).toBe('10²⁴·⁰')
      expect(formatComputeCompact(25)).toBe('10²⁵·⁰')
    })

    it('formats decimal exponents correctly', () => {
      expect(formatComputeCompact(24.3)).toBe('10²⁴·³')
      expect(formatComputeCompact(25.7)).toBe('10²⁵·⁷')
    })

    it('rounds to one decimal place', () => {
      expect(formatComputeCompact(24.35)).toBe('10²⁴·⁴') // rounds up
      expect(formatComputeCompact(24.34)).toBe('10²⁴·³') // rounds down
    })

    it('handles all digits 0-9', () => {
      expect(formatComputeCompact(10.0)).toBe('10¹⁰·⁰')
      expect(formatComputeCompact(21.1)).toBe('10²¹·¹')
      expect(formatComputeCompact(32.2)).toBe('10³²·²')
      expect(formatComputeCompact(43.3)).toBe('10⁴³·³')
      expect(formatComputeCompact(54.4)).toBe('10⁵⁴·⁴')
      expect(formatComputeCompact(65.5)).toBe('10⁶⁵·⁵')
      expect(formatComputeCompact(76.6)).toBe('10⁷⁶·⁶')
      expect(formatComputeCompact(87.7)).toBe('10⁸⁷·⁷')
      expect(formatComputeCompact(98.8)).toBe('10⁹⁸·⁸')
      expect(formatComputeCompact(99.9)).toBe('10⁹⁹·⁹')
    })

    it('handles small numbers', () => {
      expect(formatComputeCompact(5.0)).toBe('10⁵·⁰')
      expect(formatComputeCompact(0.0)).toBe('10⁰·⁰')
    })

    it('handles negative exponents', () => {
      expect(formatComputeCompact(-1.5)).toBe('10⁻¹·⁵')
    })
  })

  describe('invalid numbers', () => {
    it('returns N/A for NaN', () => {
      expect(formatComputeCompact(NaN)).toBe('N/A')
    })

    it('returns N/A for Infinity', () => {
      expect(formatComputeCompact(Infinity)).toBe('N/A')
      expect(formatComputeCompact(-Infinity)).toBe('N/A')
    })
  })
})

describe('AIContextCell', () => {
  describe('rendering with valid dates', () => {
    it('renders compute value for valid date', () => {
      renderWithProvider(<AIContextCell date="2023-03-15" />)

      // Should render the superscript notation
      const cell = screen.getByText(/10/)
      expect(cell).toBeInTheDocument()
    })

    it('renders colored dot indicator', () => {
      const { container } = renderWithProvider(
        <AIContextCell date="2023-03-15" />
      )

      const dot = container.querySelector('.rounded-full')
      expect(dot).toBeInTheDocument()
      expect(dot).toHaveAttribute('aria-hidden', 'true')
    })

    it('has cursor-help for tooltip hint', () => {
      const { container } = renderWithProvider(
        <AIContextCell date="2023-03-15" />
      )

      const trigger = container.querySelector('.cursor-help')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('rendering with invalid dates', () => {
    it('renders dash for invalid date string', () => {
      renderWithProvider(<AIContextCell date="invalid" />)

      const dash = screen.getByText('—')
      expect(dash).toBeInTheDocument()
      expect(dash).toHaveAttribute('aria-label', 'Invalid date')
    })

    it('renders dash for empty string', () => {
      renderWithProvider(<AIContextCell date="" />)

      const dash = screen.getByText('—')
      expect(dash).toBeInTheDocument()
    })

    it('renders dash for malformed date', () => {
      renderWithProvider(<AIContextCell date="not-a-date" />)

      const dash = screen.getByText('—')
      expect(dash).toBeInTheDocument()
    })
  })

  describe('tooltip trigger', () => {
    it('renders tooltip trigger with data-state attribute', () => {
      const { container } = renderWithProvider(
        <AIContextCell date="2023-03-15" />
      )

      // TooltipTrigger with asChild renders a div with data-state
      const trigger = container.querySelector('[data-state]')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('data-state', 'closed')
    })
  })

  describe('era colors for different dates', () => {
    it('uses frontier color for recent dates (2024+)', () => {
      const { container } = renderWithProvider(
        <AIContextCell date="2024-06-01" />
      )

      const dot = container.querySelector('.rounded-full')
      expect(dot).toHaveStyle({
        backgroundColor: 'var(--era-frontier, #f59e0b)',
      })
    })

    it('uses early era color for very old dates', () => {
      const { container } = renderWithProvider(
        <AIContextCell date="1990-01-01" />
      )

      const dot = container.querySelector('.rounded-full')
      expect(dot).toHaveStyle({ backgroundColor: 'var(--text-muted)' })
    })
  })
})
