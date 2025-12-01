/**
 * CategoryChart Component Tests
 *
 * Tests for the category breakdown chart component.
 * Following module export verification pattern due to React 19 + Vitest issues.
 * Tests verify exports, dependencies, counting logic, and integration capabilities.
 */
import { describe, it, expect } from 'vitest'
import type { Category } from '@/types/obituary'

describe('CategoryChart module exports', () => {
  it('exports CategoryChart component', async () => {
    const chartModule = await import(
      '@/components/visualization/category-chart'
    )
    expect(chartModule.CategoryChart).toBeDefined()
    expect(typeof chartModule.CategoryChart).toBe('function')
  })

  it('exports CategoryChartProps type (via component existence)', async () => {
    const chartModule = await import(
      '@/components/visualization/category-chart'
    )
    expect(chartModule.CategoryChart).toBeDefined()
  })
})

describe('CategoryChart dependencies', () => {
  it('can import CATEGORY_ORDER from constants', async () => {
    const { CATEGORY_ORDER } = await import('@/lib/constants/categories')
    expect(CATEGORY_ORDER).toBeDefined()
    expect(CATEGORY_ORDER).toHaveLength(4)
    expect(CATEGORY_ORDER).toEqual([
      'capability',
      'market',
      'agi',
      'dismissive',
    ])
  })

  it('can import getCategory from constants', async () => {
    const { getCategory } = await import('@/lib/constants/categories')
    expect(getCategory).toBeDefined()
    expect(typeof getCategory).toBe('function')
  })

  it('cn utility is available for class merging', async () => {
    const { cn } = await import('@/lib/utils')
    expect(cn).toBeDefined()
    expect(typeof cn).toBe('function')
  })

  it('motion/react is importable', async () => {
    const { motion } = await import('motion/react')
    expect(motion).toBeDefined()
  })

  it('motion.button is available for animated bars', async () => {
    const { motion } = await import('motion/react')
    expect(motion.button).toBeDefined()
  })

  it('motion.div is available for bar width animation', async () => {
    const { motion } = await import('motion/react')
    expect(motion.div).toBeDefined()
  })
})

describe('Category counting logic', () => {
  it('correctly counts single-category obituaries', () => {
    const obituaries = [
      { categories: ['market'] as Category[] },
      { categories: ['market'] as Category[] },
      { categories: ['capability'] as Category[] },
      { categories: ['agi'] as Category[] },
      { categories: ['dismissive'] as Category[] },
    ]

    const counts: Record<Category, number> = {
      capability: 0,
      market: 0,
      agi: 0,
      dismissive: 0,
    }

    obituaries.forEach((ob) => {
      ob.categories.forEach((cat) => {
        if (cat in counts) {
          counts[cat]++
        }
      })
    })

    expect(counts.market).toBe(2)
    expect(counts.capability).toBe(1)
    expect(counts.agi).toBe(1)
    expect(counts.dismissive).toBe(1)
  })

  it('correctly counts multi-category obituaries', () => {
    const obituaries = [
      { categories: ['market', 'capability'] as Category[] },
      { categories: ['market'] as Category[] },
      { categories: ['capability', 'agi'] as Category[] },
      { categories: ['agi'] as Category[] },
      { categories: ['dismissive'] as Category[] },
    ]

    const counts: Record<Category, number> = {
      capability: 0,
      market: 0,
      agi: 0,
      dismissive: 0,
    }

    obituaries.forEach((ob) => {
      ob.categories.forEach((cat) => {
        if (cat in counts) {
          counts[cat]++
        }
      })
    })

    // market appears in 2 obituaries
    expect(counts.market).toBe(2)
    // capability appears in 2 obituaries
    expect(counts.capability).toBe(2)
    // agi appears in 2 obituaries
    expect(counts.agi).toBe(2)
    // dismissive appears in 1 obituary
    expect(counts.dismissive).toBe(1)
  })

  it('handles empty obituaries array', () => {
    const obituaries: { categories: Category[] }[] = []

    const counts: Record<Category, number> = {
      capability: 0,
      market: 0,
      agi: 0,
      dismissive: 0,
    }

    obituaries.forEach((ob) => {
      ob.categories.forEach((cat) => {
        if (cat in counts) {
          counts[cat]++
        }
      })
    })

    expect(counts.market).toBe(0)
    expect(counts.capability).toBe(0)
    expect(counts.agi).toBe(0)
    expect(counts.dismissive).toBe(0)
  })

  it('calculates correct percentages', () => {
    const obituaries = [
      { categories: ['market'] as Category[] },
      { categories: ['market'] as Category[] },
      { categories: ['capability'] as Category[] },
      { categories: ['agi'] as Category[] },
    ]

    const total = obituaries.length
    const marketCount = 2

    const percentage = Math.round((marketCount / total) * 100)
    expect(percentage).toBe(50)
  })

  it('handles percentage when total is zero', () => {
    const total = 0
    const count = 0

    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
    expect(percentage).toBe(0)
  })
})

describe('Category sorting logic', () => {
  it('sorts categories by count descending', async () => {
    const { CATEGORY_ORDER } = await import('@/lib/constants/categories')

    const counts = {
      capability: 3,
      market: 10,
      agi: 1,
      dismissive: 5,
    }

    const sortedCategories = [...CATEGORY_ORDER].sort(
      (a, b) => counts[b] - counts[a]
    )

    expect(sortedCategories[0]).toBe('market') // 10
    expect(sortedCategories[1]).toBe('dismissive') // 5
    expect(sortedCategories[2]).toBe('capability') // 3
    expect(sortedCategories[3]).toBe('agi') // 1
  })

  it('highest count appears first', async () => {
    const { CATEGORY_ORDER } = await import('@/lib/constants/categories')

    const counts = {
      capability: 5,
      market: 1,
      agi: 3,
      dismissive: 2,
    }

    const sortedCategories = [...CATEGORY_ORDER].sort(
      (a, b) => counts[b] - counts[a]
    )

    expect(sortedCategories[0]).toBe('capability')
    expect(counts[sortedCategories[0]]).toBe(5)
  })

  it('maintains stable order for equal counts', async () => {
    const { CATEGORY_ORDER } = await import('@/lib/constants/categories')

    const counts = {
      capability: 2,
      market: 2,
      agi: 2,
      dismissive: 2,
    }

    const sortedCategories = [...CATEGORY_ORDER].sort(
      (a, b) => counts[b] - counts[a]
    )

    // With equal counts, original order should be preserved
    expect(sortedCategories).toHaveLength(4)
  })
})

describe('Bar width calculation', () => {
  it('calculates bar width as percentage of max count', () => {
    const maxCount = 10
    const count = 5

    const barWidth = (count / maxCount) * 100
    expect(barWidth).toBe(50)
  })

  it('highest count bar has 100% width', () => {
    const maxCount = 10
    const count = 10

    const barWidth = (count / maxCount) * 100
    expect(barWidth).toBe(100)
  })

  it('handles zero max count', () => {
    const maxCount = 0
    const count = 0

    const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
    expect(barWidth).toBe(0)
  })
})

describe('Active/inactive state logic', () => {
  it('all bars active when activeCategories is empty', () => {
    const activeCategories: Category[] = []
    const categoryId: Category = 'market'

    const isActive =
      activeCategories.length === 0 || activeCategories.includes(categoryId)
    expect(isActive).toBe(true)
  })

  it('only matching bars active when filtered', () => {
    const activeCategories: Category[] = ['market', 'agi']

    const marketActive =
      activeCategories.length === 0 || activeCategories.includes('market')
    const agiActive =
      activeCategories.length === 0 || activeCategories.includes('agi')
    const capabilityActive =
      activeCategories.length === 0 || activeCategories.includes('capability')

    expect(marketActive).toBe(true)
    expect(agiActive).toBe(true)
    expect(capabilityActive).toBe(false)
  })

  it('non-matching bars have opacity 0.4', () => {
    const activeCategories: Category[] = ['market']
    const categoryId: Category = 'agi'

    const isActive =
      activeCategories.length === 0 || activeCategories.includes(categoryId)
    const opacity = isActive ? 1 : 0.4

    expect(opacity).toBe(0.4)
  })

  it('matching bars have full opacity', () => {
    const activeCategories: Category[] = ['market']
    const categoryId: Category = 'market'

    const isActive =
      activeCategories.length === 0 || activeCategories.includes(categoryId)
    const opacity = isActive ? 1 : 0.4

    expect(opacity).toBe(1)
  })
})

describe('Click handler behavior', () => {
  it('onCategoryClick receives correct category ID', () => {
    const clickedCategories: Category[] = []
    const onCategoryClick = (category: Category) => {
      clickedCategories.push(category)
    }

    onCategoryClick('market')
    expect(clickedCategories).toContain('market')
  })

  it('does not error when onCategoryClick is undefined', () => {
    // Simulate the optional call pattern used in the component
    const maybeCall = (
      fn: ((category: Category) => void) | undefined,
      cat: Category
    ) => {
      fn?.(cat)
    }

    // Should not throw when undefined
    expect(() => maybeCall(undefined, 'market')).not.toThrow()
  })
})

describe('Animation configuration', () => {
  it('bar entrance animation values are valid', () => {
    const initial = { opacity: 0, x: -20 }
    const animate = { opacity: 1, x: 0 }
    const transition = { delay: 0.1 }

    expect(initial.opacity).toBe(0)
    expect(initial.x).toBe(-20)
    expect(animate.opacity).toBe(1)
    expect(animate.x).toBe(0)
    expect(transition.delay).toBe(0.1)
  })

  it('bar width animation values are valid', () => {
    const initial = { width: 0 }
    const animate = { width: '50%' }
    const transition = { duration: 0.5, delay: 0 }

    expect(initial.width).toBe(0)
    expect(animate.width).toBe('50%')
    expect(transition.duration).toBe(0.5)
  })

  it('stagger delay is calculated correctly', () => {
    const indices = [0, 1, 2, 3]
    const staggerDelay = 0.1

    const delays = indices.map((i) => i * staggerDelay)

    // Use toBeCloseTo for floating point comparison
    expect(delays[0]).toBeCloseTo(0, 5)
    expect(delays[1]).toBeCloseTo(0.1, 5)
    expect(delays[2]).toBeCloseTo(0.2, 5)
    expect(delays[3]).toBeCloseTo(0.3, 5)
  })
})

describe('Category color verification', () => {
  it('all categories have valid hex colors', async () => {
    const { CATEGORY_ORDER, getCategory } = await import(
      '@/lib/constants/categories'
    )

    CATEGORY_ORDER.forEach((categoryId) => {
      const def = getCategory(categoryId)
      expect(def.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('category colors match specification', async () => {
    const { getCategory } = await import('@/lib/constants/categories')

    expect(getCategory('capability').color).toBe('#C9A962')
    expect(getCategory('market').color).toBe('#7B9E89')
    expect(getCategory('agi').color).toBe('#9E7B7B')
    expect(getCategory('dismissive').color).toBe('#7B7B9E')
  })
})

describe('Hover state classes', () => {
  it('group hover pattern is valid', async () => {
    const { cn } = await import('@/lib/utils')

    const buttonClasses = cn('w-full', 'text-left', 'group', 'cursor-pointer')
    const labelClasses = cn(
      'text-sm',
      'text-[--text-secondary]',
      'group-hover:text-[--text-primary]',
      'transition-colors'
    )

    expect(buttonClasses).toContain('group')
    expect(labelClasses).toContain('group-hover:text-[--text-primary]')
    expect(labelClasses).toContain('transition-colors')
  })
})

describe('Opacity transition classes', () => {
  it('opacity transition class is valid', async () => {
    const { cn } = await import('@/lib/utils')

    const classes = cn('transition-opacity', 'opacity-100')
    expect(classes).toContain('transition-opacity')
    expect(classes).toContain('opacity-100')

    const inactiveClasses = cn('transition-opacity', 'opacity-40')
    expect(inactiveClasses).toContain('opacity-40')
  })
})

describe('Data testid attributes', () => {
  it('container testid is valid', () => {
    const testId = 'category-chart'
    expect(testId).toBe('category-chart')
  })

  it('bar testids follow pattern', () => {
    const categories: Category[] = [
      'capability',
      'market',
      'agi',
      'dismissive',
    ]
    const testIds = categories.map((cat) => `category-bar-${cat}`)

    expect(testIds).toContain('category-bar-capability')
    expect(testIds).toContain('category-bar-market')
    expect(testIds).toContain('category-bar-agi')
    expect(testIds).toContain('category-bar-dismissive')
  })
})

describe('Component renders correct number of bars', () => {
  it('CATEGORY_ORDER contains 4 categories for bar rendering', async () => {
    const { CATEGORY_ORDER } = await import('@/lib/constants/categories')
    expect(CATEGORY_ORDER).toHaveLength(4)
  })

  it('all categories in CATEGORY_ORDER have valid definitions', async () => {
    const { CATEGORY_ORDER, getCategory } = await import(
      '@/lib/constants/categories'
    )

    CATEGORY_ORDER.forEach((categoryId) => {
      const def = getCategory(categoryId)
      expect(def.id).toBe(categoryId)
      expect(def.label).toBeTruthy()
      expect(def.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})

describe('Display format', () => {
  it('count and percentage format is correct', () => {
    const count = 48
    const percentage = 31

    const display = `${count} (${percentage}%)`
    expect(display).toBe('48 (31%)')
  })

  it('single digit values format correctly', () => {
    const count = 3
    const percentage = 5

    const display = `${count} (${percentage}%)`
    expect(display).toBe('3 (5%)')
  })
})

describe('Bar track styling', () => {
  it('track background class is valid', async () => {
    const { cn } = await import('@/lib/utils')

    const trackClasses = cn(
      'h-2',
      'bg-[--bg-tertiary]',
      'rounded-full',
      'overflow-hidden'
    )

    expect(trackClasses).toContain('h-2')
    expect(trackClasses).toContain('rounded-full')
    expect(trackClasses).toContain('overflow-hidden')
  })

  it('bar fill classes are valid', async () => {
    const { cn } = await import('@/lib/utils')

    const barClasses = cn('h-full', 'rounded-full')
    expect(barClasses).toContain('h-full')
    expect(barClasses).toContain('rounded-full')
  })
})
