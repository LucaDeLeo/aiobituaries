import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryCheckboxes } from '@/components/controls/category-checkboxes'
import type { Category } from '@/types/obituary'

describe('CategoryCheckboxes', () => {
  const defaultProps = {
    selectedCategories: [] as Category[],
    onCategoriesChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all five categories', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      expect(screen.getByText('Task Skepticism')).toBeInTheDocument()
      expect(screen.getByText('Intelligence Skepticism')).toBeInTheDocument()
      expect(screen.getByText('Market/Bubble')).toBeInTheDocument()
      expect(screen.getByText('AGI Skepticism')).toBeInTheDocument()
      expect(screen.getByText('Dismissive Framing')).toBeInTheDocument()
    })

    it('renders All categories checkbox', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      expect(screen.getByRole('checkbox', { name: /all categories/i })).toBeInTheDocument()
    })

    it('shows All categories checkbox checked when empty selection', () => {
      render(<CategoryCheckboxes {...defaultProps} selectedCategories={[]} />)

      const allCheckbox = screen.getByRole('checkbox', { name: /all categories/i })
      expect(allCheckbox).toBeChecked()
    })

    it('shows All categories checkbox unchecked when categories selected', () => {
      render(
        <CategoryCheckboxes
          {...defaultProps}
          selectedCategories={['market']}
        />
      )

      const allCheckbox = screen.getByRole('checkbox', { name: /all categories/i })
      expect(allCheckbox).not.toBeChecked()
    })

    it('shows checked state for selected categories', () => {
      render(
        <CategoryCheckboxes
          {...defaultProps}
          selectedCategories={['market', 'agi']}
        />
      )

      const marketCheckbox = screen.getByRole('checkbox', {
        name: /market/i,
      })
      const agiCheckbox = screen.getByRole('checkbox', {
        name: /agi skepticism/i,
      })
      const taskSkepticismCheckbox = screen.getByRole('checkbox', {
        name: /task skepticism/i,
      })

      expect(marketCheckbox).toBeChecked()
      expect(agiCheckbox).toBeChecked()
      expect(taskSkepticismCheckbox).not.toBeChecked()
    })

    it('renders categories in CATEGORY_ORDER sequence', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      const labels = screen.getAllByText(
        /Task Skepticism|Intelligence Skepticism|Market\/Bubble|AGI Skepticism|Dismissive Framing/
      )

      expect(labels[0]).toHaveTextContent('Task Skepticism')
      expect(labels[1]).toHaveTextContent('Intelligence Skepticism')
      expect(labels[2]).toHaveTextContent('Market/Bubble')
      expect(labels[3]).toHaveTextContent('AGI Skepticism')
      expect(labels[4]).toHaveTextContent('Dismissive Framing')
    })
  })

  describe('interactions', () => {
    it('calls onCategoriesChange when selecting a category', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={[]}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const marketCheckbox = screen.getByRole('checkbox', {
        name: /market/i,
      })
      fireEvent.click(marketCheckbox)

      expect(onCategoriesChange).toHaveBeenCalledWith(['market'])
    })

    it('calls onCategoriesChange when adding to selection', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={['market']}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const agiCheckbox = screen.getByRole('checkbox', {
        name: /agi skepticism/i,
      })
      fireEvent.click(agiCheckbox)

      expect(onCategoriesChange).toHaveBeenCalledWith(['market', 'agi'])
    })

    it('calls onCategoriesChange when deselecting a category', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={['market', 'agi']}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const agiCheckbox = screen.getByRole('checkbox', {
        name: /agi skepticism/i,
      })
      fireEvent.click(agiCheckbox)

      expect(onCategoriesChange).toHaveBeenCalledWith(['market'])
    })

    it('calls onCategoriesChange with empty array when clicking All categories', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={['market', 'agi']}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const allCategoriesCheckbox = screen.getByRole('checkbox', { name: /all categories/i })
      fireEvent.click(allCategoriesCheckbox)

      expect(onCategoriesChange).toHaveBeenCalledWith([])
    })

    it('allows deselecting all to show all', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={['market']}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const marketCheckbox = screen.getByRole('checkbox', {
        name: /market/i,
      })
      fireEvent.click(marketCheckbox)

      expect(onCategoriesChange).toHaveBeenCalledWith([])
    })
  })

  describe('accessibility', () => {
    it('has accessible labels for all checkboxes', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      expect(
        screen.getByRole('checkbox', { name: /task skepticism/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /intelligence skepticism/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /market/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /agi skepticism/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /dismissive framing/i })
      ).toBeInTheDocument()
    })

    it('checkboxes are focusable with keyboard', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      const taskSkepticismCheckbox = screen.getByRole('checkbox', {
        name: /task skepticism/i,
      })
      taskSkepticismCheckbox.focus()

      expect(taskSkepticismCheckbox).toHaveFocus()
    })

    it('All categories checkbox is focusable', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      const allCategoriesCheckbox = screen.getByRole('checkbox', {
        name: /all categories/i,
      })
      allCategoriesCheckbox.focus()

      expect(allCategoriesCheckbox).toHaveFocus()
    })
  })

  describe('edge cases', () => {
    it('handles all categories selected', () => {
      render(
        <CategoryCheckboxes
          {...defaultProps}
          selectedCategories={['capability-narrow', 'capability-reasoning', 'market', 'agi', 'dismissive']}
        />
      )

      // All 5 category checkboxes should be checked
      expect(screen.getByRole('checkbox', { name: /task skepticism/i })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: /intelligence skepticism/i })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: /market/i })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: /agi skepticism/i })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: /dismissive framing/i })).toBeChecked()

      // But "All categories" checkbox should NOT be checked (it's only checked when empty selection)
      expect(screen.getByRole('checkbox', { name: /all categories/i })).not.toBeChecked()
    })

    it('applies custom className', () => {
      const { container } = render(
        <CategoryCheckboxes {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
