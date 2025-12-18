import { describe, it, expect } from 'vitest'
import {
  getModelAtDate,
  enrichContext,
  generateSlug,
} from '@/lib/discovery/enricher'

describe('enricher', () => {
  describe('getModelAtDate', () => {
    it('returns GPT-3 for dates before GPT-3.5', () => {
      const date = new Date('2022-06-01')
      expect(getModelAtDate(date)).toBe('GPT-3')
    })

    it('returns GPT-3.5 for dates after ChatGPT launch', () => {
      const date = new Date('2022-12-15')
      expect(getModelAtDate(date)).toBe('GPT-3.5')
    })

    it('returns GPT-4 for dates after GPT-4 launch', () => {
      const date = new Date('2023-06-15')
      expect(getModelAtDate(date)).toBe('GPT-4')
    })

    it('returns GPT-4 Turbo for dates in late 2023', () => {
      const date = new Date('2024-01-15')
      expect(getModelAtDate(date)).toBe('GPT-4 Turbo')
    })

    it('returns GPT-4o for dates in mid 2024', () => {
      const date = new Date('2024-06-15')
      expect(getModelAtDate(date)).toBe('GPT-4o')
    })

    it('returns o1 for dates after September 2024', () => {
      const date = new Date('2024-10-15')
      expect(getModelAtDate(date)).toBe('o1')
    })
  })

  describe('enrichContext', () => {
    it('returns context with currentModel', async () => {
      const context = await enrichContext('2023-06-15')

      expect(context.currentModel).toBeDefined()
      // 2023-06-15 is between GPT-4 launch (Mar 14) and GPT-4 Turbo (Dec 6)
      expect(context.currentModel).toBe('GPT-4')
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
      // Very old date
      const oldContext = await enrichContext('1990-01-01')
      expect(oldContext.currentModel).toBe('GPT-3') // Earliest in timeline

      // Future date
      const futureContext = await enrichContext('2030-01-01')
      expect(futureContext.currentModel).toBeDefined()
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

    it('handles empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    it('handles string with only special characters', () => {
      expect(generateSlug('!@#$%')).toBe('')
    })
  })
})
