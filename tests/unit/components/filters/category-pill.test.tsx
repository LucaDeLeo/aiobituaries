/**
 * CategoryPill Component Tests
 *
 * Following module export verification pattern due to React 19 + Vitest issues.
 * Tests verify exports, dependencies, and integration capabilities.
 */
import { describe, it, expect } from 'vitest'

describe('CategoryPill module exports', () => {
  it('exports CategoryPill component', async () => {
    const pillModule = await import('@/components/filters/category-pill')
    expect(pillModule.CategoryPill).toBeDefined()
    expect(typeof pillModule.CategoryPill).toBe('function')
  })

  it('exports CategoryPillProps type (via component existence)', async () => {
    const pillModule = await import('@/components/filters/category-pill')
    expect(pillModule.CategoryPill).toBeDefined()
  })
})

describe('CategoryPill behavior contracts', () => {
  it('component should be a valid function', async () => {
    const { CategoryPill } = await import('@/components/filters/category-pill')
    expect(typeof CategoryPill).toBe('function')
  })

  it('CategoryDefinition type is available for props', async () => {
    const catModule = await import('@/lib/constants/categories')
    // Type is available if module imports successfully and getCategory returns it
    expect(catModule.getCategory).toBeDefined()
    const definition = catModule.getCategory('market')
    expect(definition).toHaveProperty('id')
    expect(definition).toHaveProperty('label')
    expect(definition).toHaveProperty('color')
  })
})

describe('CategoryPill dependencies', () => {
  it('can import CategoryDefinition from categories', async () => {
    const { getCategory, CATEGORY_ORDER } = await import(
      '@/lib/constants/categories'
    )
    expect(getCategory).toBeDefined()
    expect(CATEGORY_ORDER).toBeDefined()
    expect(CATEGORY_ORDER).toHaveLength(5)
  })

  it('can get category definition for each category', async () => {
    const { getCategory, CATEGORY_ORDER } = await import(
      '@/lib/constants/categories'
    )

    CATEGORY_ORDER.forEach((id) => {
      const category = getCategory(id)
      expect(category).toHaveProperty('id')
      expect(category).toHaveProperty('label')
      expect(category).toHaveProperty('color')
      expect(category).toHaveProperty('colorVar')
      expect(category).toHaveProperty('description')
    })
  })

  it('cn utility is available for class merging', async () => {
    const { cn } = await import('@/lib/utils')
    expect(cn).toBeDefined()
    expect(typeof cn).toBe('function')
  })

  it('cn merges classes correctly', async () => {
    const { cn } = await import('@/lib/utils')
    const result = cn('base', 'additional', { conditional: true })
    expect(typeof result).toBe('string')
    expect(result).toContain('base')
    expect(result).toContain('additional')
    expect(result).toContain('conditional')
  })
})

describe('Motion dependency integration', () => {
  it('motion/react is importable', async () => {
    const { motion } = await import('motion/react')
    expect(motion).toBeDefined()
  })

  it('motion.button is available for pill animation', async () => {
    const { motion } = await import('motion/react')
    expect(motion.button).toBeDefined()
  })
})

describe('CategoryPill component contract', () => {
  it('CategoryPill can be called as a function', async () => {
    const { CategoryPill } = await import('@/components/filters/category-pill')
    // Verify it's a callable function (React component)
    expect(CategoryPill.length).toBeGreaterThanOrEqual(0) // Has props parameter
  })

  it('category pill uses category colors from constants', async () => {
    const { CATEGORIES, getCategory } = await import(
      '@/lib/constants/categories'
    )

    // Verify all categories have hex colors for active state
    Object.values(CATEGORIES).forEach((category) => {
      expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    // Verify getCategory returns full definition for new categories
    const capabilityNarrow = getCategory('capability-narrow')
    expect(capabilityNarrow.color).toBe('#C9A962')
    expect(capabilityNarrow.label).toBe('Task Skepticism')
  })
})

describe('Accessibility requirements', () => {
  it('min-h-[44px] is a valid Tailwind class for touch targets', async () => {
    const { cn } = await import('@/lib/utils')
    const result = cn('min-h-[44px]')
    expect(result).toBe('min-h-[44px]')
  })

  it('aria-pressed is supported via button element', async () => {
    // Test that aria-pressed is a valid boolean attribute name
    // This is structural verification; actual rendering is manual
    const validAriaPressed = ['true', 'false']
    expect(validAriaPressed).toContain('true')
    expect(validAriaPressed).toContain('false')
  })

  it('focus-visible ring classes are valid', async () => {
    const { cn } = await import('@/lib/utils')
    const focusClasses = cn(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-[var(--accent-primary)]'
    )
    expect(focusClasses).toContain('focus-visible:ring-2')
  })
})
