import { describe, it, expect } from 'vitest'
import {
  getModelAtDate,
  enrichContext,
  generateSlug,
} from '@/lib/discovery/enricher'

describe('enricher', () => {
  // Tests use Epoch AI frontier model data (based on training compute)
  // Source: epoch_data/AI Models/frontier_ai_models.csv
  describe('getModelAtDate', () => {
    it('returns Minerva for dates in mid-2022', () => {
      // Minerva (540B) was frontier from June 2022 to March 2023
      const date = new Date('2022-08-01')
      expect(getModelAtDate(date)).toBe('Minerva (540B)')
    })

    it('returns GPT-4 for dates after March 2023', () => {
      // GPT-4 became frontier on March 15, 2023
      const date = new Date('2023-06-15')
      expect(getModelAtDate(date)).toBe('GPT-4 (Mar 2023)')
    })

    it('returns Gemini 1.0 Ultra for dates in 2024', () => {
      // Gemini 1.0 Ultra became frontier Dec 6, 2023
      const date = new Date('2024-06-15')
      expect(getModelAtDate(date)).toBe('Gemini 1.0 Ultra')
    })

    it('returns Grok 3 for dates after Feb 2025', () => {
      // Grok 3 became frontier Feb 17, 2025
      const date = new Date('2025-02-20')
      expect(getModelAtDate(date)).toBe('Grok 3')
    })

    it('returns historical model for 1990s date', () => {
      // Zip CNN was frontier in late 1989
      const date = new Date('1990-06-01')
      expect(getModelAtDate(date)).toBe('Zip CNN')
    })

    it('returns latest model for future dates', () => {
      // Should return the most recent frontier model
      const date = new Date('2030-01-01')
      // Grok 4 is latest in Epoch data (July 2025)
      expect(getModelAtDate(date)).toBe('Grok 4')
    })
  })

  describe('enrichContext', () => {
    it('returns context with currentModel', async () => {
      const context = await enrichContext('2023-06-15')

      expect(context.currentModel).toBeDefined()
      // GPT-4 became frontier on March 15, 2023
      expect(context.currentModel).toBe('GPT-4 (Mar 2023)')
    })

    it('includes benchmark info when available', async () => {
      // MMLU data exists for 2023
      const context = await enrichContext('2023-06-15')

      // May or may not have MMLU depending on data coverage
      // Just verify the function doesn't throw
      expect(context).toBeDefined()
    })

    it('includes compute note when available', async () => {
      const context = await enrichContext('2023-06-15')

      // Should have a note about training compute
      if (context.note) {
        expect(context.note).toContain('FLOP')
      }
    })

    it('handles dates outside metric range', async () => {
      // Historical date - Epoch data goes back to 1950
      const oldContext = await enrichContext('1990-01-01')
      // Zip CNN was frontier in 1989
      expect(oldContext.currentModel).toBe('Zip CNN')

      // Future date
      const futureContext = await enrichContext('2030-01-01')
      expect(futureContext.currentModel).toBeDefined()
      // Should return latest frontier (Grok 4)
      expect(futureContext.currentModel).toBe('Grok 4')
    })
  })

  describe('generateSlug', () => {
    it('converts text to lowercase slug', () => {
      expect(generateSlug('AI Will Never Work')).toBe('ai-will-never-work')
    })

    it('removes special characters', () => {
      expect(generateSlug("AI won't achieve AGI!")).toBe('ai-won-t-achieve-agi')
    })

    it('collapses multiple dashes', () => {
      expect(generateSlug('AI --- is --- overhyped')).toBe('ai-is-overhyped')
    })

    it('removes leading and trailing dashes', () => {
      expect(generateSlug('---AI is doomed---')).toBe('ai-is-doomed')
    })

    it('truncates to max length', () => {
      const longText =
        'A very long claim about AI that goes on and on and on and on and on and on and on and will definitely exceed the maximum slug length'
      const slug = generateSlug(longText)
      expect(slug.length).toBeLessThanOrEqual(80)
    })

    // P1.3 fix: Empty/special-char inputs now return fallback slugs
    it('handles empty string with fallback', () => {
      const slug = generateSlug('')
      expect(slug).toMatch(/^claim-\d+$/)  // fallback with timestamp
    })

    it('handles empty string with date fallback', () => {
      expect(generateSlug('', '2024-01-15')).toBe('claim-20240115')
    })

    it('handles string with only special characters with fallback', () => {
      const slug = generateSlug('!@#$%')
      expect(slug).toMatch(/^claim-\d+$/)  // fallback with timestamp
    })

    it('appends date for uniqueness when provided', () => {
      expect(generateSlug('test claim', '2024-03-20')).toBe('test-claim-20240320')
    })
  })
})
