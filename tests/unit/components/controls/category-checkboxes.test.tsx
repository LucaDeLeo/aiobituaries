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
    it('renders all four categories', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      expect(screen.getByText('Capability Doubt')).toBeInTheDocument()
      expect(screen.getByText('Market/Bubble')).toBeInTheDocument()
      expect(screen.getByText('AGI Skepticism')).toBeInTheDocument()
      expect(screen.getByText('Dismissive Framing')).toBeInTheDocument()
    })

    it('renders Show All button', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      expect(screen.getByRole('button', { name: /show/i })).toBeInTheDocument()
    })

    it('shows "Showing all categories" when empty selection', () => {
      render(<CategoryCheckboxes {...defaultProps} selectedCategories={[]} />)

      expect(screen.getByText('Showing all categories')).toBeInTheDocument()
    })

    it('shows "Show all" when categories selected', () => {
      render(
        <CategoryCheckboxes
          {...defaultProps}
          selectedCategories={['market']}
        />
      )

      expect(screen.getByText('Show all')).toBeInTheDocument()
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
      const capabilityCheckbox = screen.getByRole('checkbox', {
        name: /capability doubt/i,
      })

      expect(marketCheckbox).toBeChecked()
      expect(agiCheckbox).toBeChecked()
      expect(capabilityCheckbox).not.toBeChecked()
    })

    it('renders categories in CATEGORY_ORDER sequence', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      const labels = screen.getAllByText(
        /Capability Doubt|Market\/Bubble|AGI Skepticism|Dismissive Framing/
      )

      expect(labels[0]).toHaveTextContent('Capability Doubt')
      expect(labels[1]).toHaveTextContent('Market/Bubble')
      expect(labels[2]).toHaveTextContent('AGI Skepticism')
      expect(labels[3]).toHaveTextContent('Dismissive Framing')
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

    it('calls onCategoriesChange with empty array when clicking Show All', () => {
      const onCategoriesChange = vi.fn()
      render(
        <CategoryCheckboxes
          selectedCategories={['market', 'agi']}
          onCategoriesChange={onCategoriesChange}
        />
      )

      const showAllButton = screen.getByRole('button', { name: /show all/i })
      fireEvent.click(showAllButton)

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
        screen.getByRole('checkbox', { name: /capability doubt/i })
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

      const capabilityCheckbox = screen.getByRole('checkbox', {
        name: /capability doubt/i,
      })
      capabilityCheckbox.focus()

      expect(capabilityCheckbox).toHaveFocus()
    })

    it('Show All button is focusable', () => {
      render(<CategoryCheckboxes {...defaultProps} />)

      const showAllButton = screen.getByRole('button', {
        name: /showing all categories/i,
      })
      showAllButton.focus()

      expect(showAllButton).toHaveFocus()
    })
  })

  describe('edge cases', () => {
    it('handles all categories selected', () => {
      render(
        <CategoryCheckboxes
          {...defaultProps}
          selectedCategories={['capability', 'market', 'agi', 'dismissive']}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked()
      })
    })

    it('applies custom className', () => {
      const { container } = render(
        <CategoryCheckboxes {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
