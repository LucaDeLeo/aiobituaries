import { describe, it, expect } from 'vitest'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  getCategory,
  getCategoryColor,
  getCategoryLabel,
  getAllCategories,
  isValidCategory,
  type CategoryDefinition,
} from '@/lib/constants/categories'

describe('CATEGORIES constant', () => {
  it('contains exactly 4 categories', () => {
    expect(Object.keys(CATEGORIES)).toHaveLength(4)
  })

  it('has all expected category keys', () => {
    expect(CATEGORIES).toHaveProperty('capability')
    expect(CATEGORIES).toHaveProperty('market')
    expect(CATEGORIES).toHaveProperty('agi')
    expect(CATEGORIES).toHaveProperty('dismissive')
  })

  it('each category has all required properties', () => {
    const requiredProps: (keyof CategoryDefinition)[] = [
      'id',
      'label',
      'description',
      'color',
      'colorVar',
    ]

    Object.values(CATEGORIES).forEach((category) => {
      requiredProps.forEach((prop) => {
        expect(category).toHaveProperty(prop)
        expect(category[prop]).toBeTruthy()
      })
    })
  })

  it('each category id matches its key', () => {
    Object.entries(CATEGORIES).forEach(([key, category]) => {
      expect(category.id).toBe(key)
    })
  })

  it('all colors are valid hex format', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/
    Object.values(CATEGORIES).forEach((category) => {
      expect(category.color).toMatch(hexPattern)
    })
  })

  it('all colorVar values start with --category-', () => {
    Object.values(CATEGORIES).forEach((category) => {
      expect(category.colorVar).toMatch(/^--category-/)
    })
  })

  it('has correct colors matching globals.css', () => {
    expect(CATEGORIES.capability.color).toBe('#C9A962')
    expect(CATEGORIES.market.color).toBe('#7B9E89')
    expect(CATEGORIES.agi.color).toBe('#9E7B7B')
    expect(CATEGORIES.dismissive.color).toBe('#7B7B9E')
  })

  it('has correct labels', () => {
    expect(CATEGORIES.capability.label).toBe('Capability Doubt')
    expect(CATEGORIES.market.label).toBe('Market/Bubble')
    expect(CATEGORIES.agi.label).toBe('AGI Skepticism')
    expect(CATEGORIES.dismissive.label).toBe('Dismissive Framing')
  })

  it('has correct descriptions', () => {
    expect(CATEGORIES.capability.description).toBe(
      'Claims AI cannot do specific tasks'
    )
    expect(CATEGORIES.market.description).toBe('AI is overhyped or a bubble')
    expect(CATEGORIES.agi.description).toBe(
      'AGI is impossible or very far away'
    )
    expect(CATEGORIES.dismissive.description).toBe(
      'Casual dismissal or mockery of AI'
    )
  })

  it('has correct colorVar values', () => {
    expect(CATEGORIES.capability.colorVar).toBe('--category-capability')
    expect(CATEGORIES.market.colorVar).toBe('--category-market')
    expect(CATEGORIES.agi.colorVar).toBe('--category-agi')
    expect(CATEGORIES.dismissive.colorVar).toBe('--category-dismissive')
  })
})

describe('CATEGORY_ORDER array', () => {
  it('contains exactly 4 elements', () => {
    expect(CATEGORY_ORDER).toHaveLength(4)
  })

  it('has correct order', () => {
    expect(CATEGORY_ORDER).toEqual([
      'capability',
      'market',
      'agi',
      'dismissive',
    ])
  })

  it('all elements are valid category keys', () => {
    CATEGORY_ORDER.forEach((id) => {
      expect(CATEGORIES).toHaveProperty(id)
    })
  })
})

describe('getCategoryColor function', () => {
  it('returns correct color for capability', () => {
    expect(getCategoryColor('capability')).toBe('#C9A962')
  })

  it('returns correct color for market', () => {
    expect(getCategoryColor('market')).toBe('#7B9E89')
  })

  it('returns correct color for agi', () => {
    expect(getCategoryColor('agi')).toBe('#9E7B7B')
  })

  it('returns correct color for dismissive', () => {
    expect(getCategoryColor('dismissive')).toBe('#7B7B9E')
  })

  it('returns a string for all categories', () => {
    CATEGORY_ORDER.forEach((id) => {
      expect(typeof getCategoryColor(id)).toBe('string')
    })
  })
})

describe('getCategoryLabel function', () => {
  it('returns correct label for capability', () => {
    expect(getCategoryLabel('capability')).toBe('Capability Doubt')
  })

  it('returns correct label for market', () => {
    expect(getCategoryLabel('market')).toBe('Market/Bubble')
  })

  it('returns correct label for agi', () => {
    expect(getCategoryLabel('agi')).toBe('AGI Skepticism')
  })

  it('returns correct label for dismissive', () => {
    expect(getCategoryLabel('dismissive')).toBe('Dismissive Framing')
  })

  it('returns a string for all categories', () => {
    CATEGORY_ORDER.forEach((id) => {
      expect(typeof getCategoryLabel(id)).toBe('string')
    })
  })
})

describe('getCategory function', () => {
  it('returns full CategoryDefinition object', () => {
    const result = getCategory('market')
    expect(result).toEqual({
      id: 'market',
      label: 'Market/Bubble',
      description: 'AI is overhyped or a bubble',
      color: '#7B9E89',
      colorVar: '--category-market',
    })
  })

  it('returns object with all required properties', () => {
    const result = getCategory('capability')
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('label')
    expect(result).toHaveProperty('description')
    expect(result).toHaveProperty('color')
    expect(result).toHaveProperty('colorVar')
  })

  it('returns correct definition for each category', () => {
    CATEGORY_ORDER.forEach((id) => {
      const result = getCategory(id)
      expect(result.id).toBe(id)
      expect(result).toBe(CATEGORIES[id])
    })
  })
})

describe('getAllCategories function', () => {
  it('returns array of length 4', () => {
    expect(getAllCategories()).toHaveLength(4)
  })

  it('returns CategoryDefinition objects', () => {
    const result = getAllCategories()
    result.forEach((category) => {
      expect(category).toHaveProperty('id')
      expect(category).toHaveProperty('label')
      expect(category).toHaveProperty('description')
      expect(category).toHaveProperty('color')
      expect(category).toHaveProperty('colorVar')
    })
  })

  it('returns categories in CATEGORY_ORDER sequence', () => {
    const result = getAllCategories()
    const resultIds = result.map((cat) => cat.id)
    expect(resultIds).toEqual(CATEGORY_ORDER)
  })

  it('returns same objects as in CATEGORIES', () => {
    const result = getAllCategories()
    result.forEach((category, index) => {
      expect(category).toBe(CATEGORIES[CATEGORY_ORDER[index]])
    })
  })
})

describe('isValidCategory function', () => {
  it('returns true for capability', () => {
    expect(isValidCategory('capability')).toBe(true)
  })

  it('returns true for market', () => {
    expect(isValidCategory('market')).toBe(true)
  })

  it('returns true for agi', () => {
    expect(isValidCategory('agi')).toBe(true)
  })

  it('returns true for dismissive', () => {
    expect(isValidCategory('dismissive')).toBe(true)
  })

  it('returns false for invalid string', () => {
    expect(isValidCategory('invalid')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidCategory('')).toBe(false)
  })

  it('returns false for random string', () => {
    expect(isValidCategory('random-category')).toBe(false)
  })

  it('returns false for similar but incorrect strings', () => {
    expect(isValidCategory('Capability')).toBe(false)
    expect(isValidCategory('MARKET')).toBe(false)
    expect(isValidCategory('AGI')).toBe(false)
  })

  it('returns false for number cast to string', () => {
    expect(isValidCategory(String(123))).toBe(false)
  })
})

describe('legacy constants (deprecated)', () => {
  describe('CATEGORY_COLORS', () => {
    it('contains all four categories', () => {
      expect(Object.keys(CATEGORY_COLORS)).toHaveLength(4)
    })

    it('has Tailwind class format values', () => {
      Object.values(CATEGORY_COLORS).forEach((value) => {
        expect(value).toMatch(/^bg-\[--category-/)
      })
    })
  })

  describe('CATEGORY_LABELS', () => {
    it('contains all four categories', () => {
      expect(Object.keys(CATEGORY_LABELS)).toHaveLength(4)
    })

    it('matches CATEGORIES labels', () => {
      Object.entries(CATEGORY_LABELS).forEach(([key, label]) => {
        expect(label).toBe(
          CATEGORIES[key as keyof typeof CATEGORIES].label
        )
      })
    })
  })
})
