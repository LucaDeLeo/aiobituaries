/**
 * Date Utility Tests
 *
 * Tests for date formatting utilities used in tooltip display.
 */
import { describe, it, expect } from 'vitest'
import { formatDate } from '@/lib/utils/date'

describe('formatDate', () => {
  it('formats ISO date string to readable format', () => {
    const result = formatDate('2023-03-14')
    expect(result).toBe('Mar 14, 2023')
  })

  it('formats year start date correctly', () => {
    const result = formatDate('2024-01-01')
    expect(result).toBe('Jan 1, 2024')
  })

  it('formats year end date correctly', () => {
    const result = formatDate('2023-12-31')
    expect(result).toBe('Dec 31, 2023')
  })

  it('formats February date correctly', () => {
    const result = formatDate('2024-02-29')
    expect(result).toBe('Feb 29, 2024')
  })

  it('handles different years correctly', () => {
    const result2020 = formatDate('2020-06-15')
    const result2023 = formatDate('2023-06-15')

    expect(result2020).toBe('Jun 15, 2020')
    expect(result2023).toBe('Jun 15, 2023')
  })

  it('uses short month format (3 letters)', () => {
    const january = formatDate('2024-01-15')
    const september = formatDate('2024-09-15')

    expect(january).toContain('Jan')
    expect(september).toContain('Sep')
    expect(january).not.toContain('January')
    expect(september).not.toContain('September')
  })

  it('includes comma between day and year', () => {
    const result = formatDate('2023-05-20')
    expect(result).toMatch(/\d+, \d{4}/)
  })

  it('returns expected format for various dates', () => {
    const dates = [
      { input: '2022-01-15', expected: 'Jan 15, 2022' },
      { input: '2023-07-04', expected: 'Jul 4, 2023' },
      { input: '2024-11-30', expected: 'Nov 30, 2024' },
    ]

    dates.forEach(({ input, expected }) => {
      expect(formatDate(input)).toBe(expected)
    })
  })
})
