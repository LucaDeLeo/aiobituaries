import { describe, it, expect } from 'vitest'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  ALL_CATEGORIES,
  CATEGORY_BG_CLASSES,
  CATEGORY_BADGE_CLASSES,
  CATEGORY_LABELS,
  getCategory,
  getCategoryColor,
  getCategoryLabel,
  getAllCategories,
  isValidCategory,
  normalizeCategory,
  normalizeCategories,
  type CategoryDefinition,
} from '@/lib/constants/categories'

describe('CATEGORIES constant', () => {
  it('contains exactly 6 categories (including legacy)', () => {
    expect(Object.keys(CATEGORIES)).toHaveLength(6)
  })

  it('has all expected category keys', () => {
    expect(CATEGORIES).toHaveProperty('capability-narrow')
    expect(CATEGORIES).toHaveProperty('capability-reasoning')
    expect(CATEGORIES).toHaveProperty('capability') // Legacy
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
    expect(CATEGORIES['capability-narrow'].color).toBe('#C9A962')
    expect(CATEGORIES['capability-reasoning'].color).toBe('#D4B896')
    expect(CATEGORIES.capability.color).toBe('#C9A962')
    expect(CATEGORIES.market.color).toBe('#7B9E89')
    expect(CATEGORIES.agi.color).toBe('#9E7B7B')
    expect(CATEGORIES.dismissive.color).toBe('#7B7B9E')
  })

  it('has correct labels', () => {
    expect(CATEGORIES['capability-narrow'].label).toBe('Task Skepticism')
    expect(CATEGORIES['capability-reasoning'].label).toBe('Intelligence Skepticism')
    expect(CATEGORIES.capability.label).toBe('Capability Doubt')
    expect(CATEGORIES.market.label).toBe('Market/Bubble')
    expect(CATEGORIES.agi.label).toBe('AGI Skepticism')
    expect(CATEGORIES.dismissive.label).toBe('Dismissive Framing')
  })

  it('has correct descriptions', () => {
    expect(CATEGORIES['capability-narrow'].description).toBe(
      'Claims AI cannot perform specific tasks'
    )
    expect(CATEGORIES['capability-reasoning'].description).toBe(
      'Claims about AI reasoning/understanding limits'
    )
    expect(CATEGORIES.capability.description).toBe(
      'Claims AI cannot do specific tasks (legacy)'
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
    expect(CATEGORIES['capability-narrow'].colorVar).toBe('--category-capability-narrow')
    expect(CATEGORIES['capability-reasoning'].colorVar).toBe('--category-capability-reasoning')
    expect(CATEGORIES.capability.colorVar).toBe('--category-capability')
    expect(CATEGORIES.market.colorVar).toBe('--category-market')
    expect(CATEGORIES.agi.colorVar).toBe('--category-agi')
    expect(CATEGORIES.dismissive.colorVar).toBe('--category-dismissive')
  })
})

describe('CATEGORY_ORDER array', () => {
  it('contains exactly 5 elements (excludes legacy capability)', () => {
    expect(CATEGORY_ORDER).toHaveLength(5)
  })

  it('has correct order', () => {
    expect(CATEGORY_ORDER).toEqual([
      'capability-narrow',
      'capability-reasoning',
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

  it('does not include legacy capability category', () => {
    expect(CATEGORY_ORDER).not.toContain('capability')
  })
})

describe('ALL_CATEGORIES array', () => {
  it('contains exactly 6 elements (includes legacy)', () => {
    expect(ALL_CATEGORIES).toHaveLength(6)
  })

  it('includes legacy capability category', () => {
    expect(ALL_CATEGORIES).toContain('capability')
  })

  it('includes all new categories', () => {
    expect(ALL_CATEGORIES).toContain('capability-narrow')
    expect(ALL_CATEGORIES).toContain('capability-reasoning')
  })
})

describe('getCategoryColor function', () => {
  it('returns correct color for capability-narrow', () => {
    expect(getCategoryColor('capability-narrow')).toBe('#C9A962')
  })

  it('returns correct color for capability-reasoning', () => {
    expect(getCategoryColor('capability-reasoning')).toBe('#D4B896')
  })

  it('returns correct color for capability (legacy)', () => {
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
  it('returns correct label for capability-narrow', () => {
    expect(getCategoryLabel('capability-narrow')).toBe('Task Skepticism')
  })

  it('returns correct label for capability-reasoning', () => {
    expect(getCategoryLabel('capability-reasoning')).toBe('Intelligence Skepticism')
  })

  it('returns correct label for capability (legacy)', () => {
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
      shortLabel: 'Market',
      description: 'AI is overhyped or a bubble',
      color: '#7B9E89',
      colorVar: '--category-market',
    })
  })

  it('returns object with all required properties', () => {
    const result = getCategory('capability-narrow')
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('label')
    expect(result).toHaveProperty('shortLabel')
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
  it('returns array of length 5 (CATEGORY_ORDER length)', () => {
    expect(getAllCategories()).toHaveLength(5)
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
  it('returns true for capability-narrow', () => {
    expect(isValidCategory('capability-narrow')).toBe(true)
  })

  it('returns true for capability-reasoning', () => {
    expect(isValidCategory('capability-reasoning')).toBe(true)
  })

  it('returns true for capability (legacy)', () => {
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

describe('normalizeCategory function', () => {
  it('maps legacy capability to capability-narrow', () => {
    expect(normalizeCategory('capability')).toBe('capability-narrow')
  })

  it('returns capability-narrow unchanged', () => {
    expect(normalizeCategory('capability-narrow')).toBe('capability-narrow')
  })

  it('returns capability-reasoning unchanged', () => {
    expect(normalizeCategory('capability-reasoning')).toBe('capability-reasoning')
  })

  it('returns other categories unchanged', () => {
    expect(normalizeCategory('market')).toBe('market')
    expect(normalizeCategory('agi')).toBe('agi')
    expect(normalizeCategory('dismissive')).toBe('dismissive')
  })
})

describe('normalizeCategories function', () => {
  it('maps legacy capability in array to capability-narrow', () => {
    expect(normalizeCategories(['capability', 'market'])).toEqual([
      'capability-narrow',
      'market',
    ])
  })

  it('returns empty array for empty input', () => {
    expect(normalizeCategories([])).toEqual([])
  })

  it('handles mixed legacy and new categories', () => {
    expect(
      normalizeCategories(['capability', 'capability-reasoning', 'agi'])
    ).toEqual(['capability-narrow', 'capability-reasoning', 'agi'])
  })
})

describe('Tailwind class constants', () => {
  describe('CATEGORY_BG_CLASSES', () => {
    it('contains all six categories', () => {
      expect(Object.keys(CATEGORY_BG_CLASSES)).toHaveLength(6)
    })

    it('has Tailwind class format values', () => {
      Object.values(CATEGORY_BG_CLASSES).forEach((value) => {
        expect(value).toMatch(/^bg-\[var\(--category-/)
      })
    })
  })

  describe('CATEGORY_BADGE_CLASSES', () => {
    it('contains all six categories', () => {
      expect(Object.keys(CATEGORY_BADGE_CLASSES)).toHaveLength(6)
    })

    it('has badge styling with opacity and text color', () => {
      Object.values(CATEGORY_BADGE_CLASSES).forEach((value) => {
        expect(value).toMatch(/bg-\[var\(--category-.*\/20.*text-\[var\(--category-/)
      })
    })
  })

  describe('CATEGORY_LABELS', () => {
    it('contains all six categories', () => {
      expect(Object.keys(CATEGORY_LABELS)).toHaveLength(6)
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
