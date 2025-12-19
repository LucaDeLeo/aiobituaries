/**
 * ObituaryDetail Component Tests
 *
 * Tests the ObituaryDetail component functionality including:
 * - Full claim display (AC-2.3.2, AC-2.3.7)
 * - Source with external link (AC-2.3.3, AC-2.3.8)
 * - Date formatting (AC-2.3.4)
 * - Category badges (AC-2.3.5)
 * - Back navigation (AC-2.3.6)
 *
 * Note: Testing Server Components with next/link requires mocking.
 */
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { CATEGORY_LABELS } from '@/lib/constants/categories'
import type { Obituary, Category } from '@/types/obituary'
import type { ContextMetadata } from '@/types/context'

// Mock next/link at the top level, before any imports that use it
vi.mock('next/link', () => {
  return {
    default: function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
      return React.createElement('a', { href, ...props }, children)
    },
  }
})

// Mock CopyButton to avoid client component issues in tests
vi.mock('@/components/ui/copy-button', () => {
  return {
    CopyButton: function MockCopyButton() {
      return React.createElement('button', { 'data-testid': 'copy-button' }, 'Copy link')
    },
  }
})

// Import after mock setup
import { ObituaryDetail } from '@/components/obituary/obituary-detail'

// Mock obituary for testing
const mockObituary: Obituary = {
  _id: 'test-id-1',
  slug: 'ai-will-never-work',
  claim:
    'AI will never be able to understand context, nuance, or produce creative work. It is fundamentally limited by its training data and will never achieve human-level intelligence.',
  source: 'Gary Marcus',
  sourceUrl: 'https://example.com/article',
  date: '2023-03-14',
  categories: ['capability', 'agi'] as Category[],
  context: {
    nvdaPrice: 450.5,
    currentModel: 'GPT-4',
  } as ContextMetadata,
}

describe('ObituaryDetail', () => {
  afterEach(async () => {
    await act(async () => {
      cleanup()
    })
  })

  describe('Claim Display (AC-2.3.2, AC-2.3.7)', () => {
    it('renders full claim text without truncation', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      // Full claim should be present, not truncated
      expect(screen.getByText(/AI will never be able to understand context/)).toBeInTheDocument()
      expect(
        screen.getByText(/will never achieve human-level intelligence/)
      ).toBeInTheDocument()
    })

    it('wraps claim in quotation marks', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      const blockquote = screen.getByRole('blockquote')
      // The claim should be wrapped in curly quotes (Unicode characters: ldquo/rdquo)
      expect(blockquote.textContent).toMatch(/^[\u201C"].*[\u201D"]$/)
    })

    it('applies serif font styling to claim', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      const blockquote = screen.getByRole('blockquote')
      expect(blockquote).toHaveClass('font-serif')
      expect(blockquote).toHaveClass('italic')
      expect(blockquote).toHaveClass('text-center')
    })
  })

  describe('Source Display (AC-2.3.3, AC-2.3.8)', () => {
    it('renders source name', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      expect(screen.getByText('Gary Marcus')).toBeInTheDocument()
    })

    it('renders source as external link with correct href', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      const sourceLink = screen.getByRole('link', { name: /Gary Marcus/i })
      expect(sourceLink).toHaveAttribute('href', 'https://example.com/article')
    })

    it('opens source link in new tab (target="_blank")', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      const sourceLink = screen.getByRole('link', { name: /Gary Marcus/i })
      expect(sourceLink).toHaveAttribute('target', '_blank')
    })

    it('has security attributes rel="noopener noreferrer"', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      const sourceLink = screen.getByRole('link', { name: /Gary Marcus/i })
      expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Date Display (AC-2.3.4)', () => {
    it('formats date as "MMM d, yyyy" (Mar 14, 2023)', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      // formatDate uses short month format
      expect(screen.getByText('Mar 14, 2023')).toBeInTheDocument()
    })

    it('renders date in a time element with ISO datetime', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      const timeElement = screen.getByRole('time')
      expect(timeElement).toHaveAttribute('datetime', '2023-03-14')
    })

    it('handles different dates correctly', async () => {
      const januaryObituary = {
        ...mockObituary,
        date: '2024-01-01',
      }
      await act(async () => {
        render(<ObituaryDetail obituary={januaryObituary} />)
      })

      // formatDate uses short month format: "Jan 1, 2024"
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument()
    })
  })

  describe('Category Badges (AC-2.3.5)', () => {
    it('renders badges for each category', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      expect(screen.getByText('Capability Doubt')).toBeInTheDocument()
      expect(screen.getByText('AGI Skepticism')).toBeInTheDocument()
    })

    it('renders correct label for capability category', async () => {
      const capabilityObituary = {
        ...mockObituary,
        categories: ['capability'] as Category[],
      }
      await act(async () => {
        render(<ObituaryDetail obituary={capabilityObituary} />)
      })

      expect(screen.getByText('Capability Doubt')).toBeInTheDocument()
    })

    it('renders correct label for market category', async () => {
      const marketObituary = {
        ...mockObituary,
        categories: ['market'] as Category[],
      }
      await act(async () => {
        render(<ObituaryDetail obituary={marketObituary} />)
      })

      expect(screen.getByText('Market/Bubble')).toBeInTheDocument()
    })

    it('renders correct label for agi category', async () => {
      const agiObituary = {
        ...mockObituary,
        categories: ['agi'] as Category[],
      }
      await act(async () => {
        render(<ObituaryDetail obituary={agiObituary} />)
      })

      expect(screen.getByText('AGI Skepticism')).toBeInTheDocument()
    })

    it('renders correct label for dismissive category', async () => {
      const dismissiveObituary = {
        ...mockObituary,
        categories: ['dismissive'] as Category[],
      }
      await act(async () => {
        render(<ObituaryDetail obituary={dismissiveObituary} />)
      })

      expect(screen.getByText('Dismissive Framing')).toBeInTheDocument()
    })

    it('applies correct color classes to badges', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      const capabilityBadge = screen.getByText('Capability Doubt')
      const agiBadge = screen.getByText('AGI Skepticism')

      expect(capabilityBadge.className).toContain('category-capability')
      expect(agiBadge.className).toContain('category-agi')
    })

    it('handles empty categories array gracefully', async () => {
      const noCategories = {
        ...mockObituary,
        categories: [] as Category[],
      }

      // Should not throw
      await act(async () => {
        render(<ObituaryDetail obituary={noCategories} />)
      })

      // No badges should be rendered
      expect(screen.queryByText('Capability Doubt')).not.toBeInTheDocument()
      expect(screen.queryByText('Market/Bubble')).not.toBeInTheDocument()
    })

    it('handles undefined categories gracefully', async () => {
      const undefinedCategories = {
        ...mockObituary,
        categories: undefined as unknown as Category[],
      }

      // Should not throw
      await act(async () => {
        render(<ObituaryDetail obituary={undefinedCategories} />)
      })
    })
  })

  describe('Back Navigation (AC-2.3.6)', () => {
    it('renders back link to homepage', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      const backLink = screen.getByRole('link', { name: /back to all obituaries/i })
      expect(backLink).toHaveAttribute('href', '/')
    })

    it('displays "Back to all obituaries" text', async () => {
      await act(async () => {
        render(<ObituaryDetail obituary={mockObituary} />)
      })

      expect(screen.getByText(/back to all obituaries/i)).toBeInTheDocument()
    })
  })
})

describe('CATEGORY_LABELS', () => {
  it('has all four category labels', () => {
    expect(CATEGORY_LABELS.capability).toBe('Capability Doubt')
    expect(CATEGORY_LABELS.market).toBe('Market/Bubble')
    expect(CATEGORY_LABELS.agi).toBe('AGI Skepticism')
    expect(CATEGORY_LABELS.dismissive).toBe('Dismissive Framing')
  })
})
