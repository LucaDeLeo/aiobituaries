import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  getRelativeLuminance,
  getContrastRatio,
  checkWCAGAA,
  COLOR_CHECKS,
  verifyAllColorsPassAA,
  getFailingColors,
} from '@/lib/utils/color-contrast'

describe('color-contrast utilities', () => {
  describe('hexToRgb', () => {
    it('parses hex with # prefix correctly', () => {
      const result = hexToRgb('#C9A962')
      expect(result).toEqual({ r: 201, g: 169, b: 98 })
    })

    it('parses hex without # prefix correctly', () => {
      const result = hexToRgb('0C0C0F')
      expect(result).toEqual({ r: 12, g: 12, b: 15 })
    })

    it('parses lowercase hex correctly', () => {
      const result = hexToRgb('#e8e6e3')
      expect(result).toEqual({ r: 232, g: 230, b: 227 })
    })

    it('parses uppercase hex correctly', () => {
      const result = hexToRgb('#E8E6E3')
      expect(result).toEqual({ r: 232, g: 230, b: 227 })
    })

    it('parses pure black correctly', () => {
      const result = hexToRgb('#000000')
      expect(result).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('parses pure white correctly', () => {
      const result = hexToRgb('#FFFFFF')
      expect(result).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('throws error for invalid hex (too short)', () => {
      expect(() => hexToRgb('#FFF')).toThrow('Invalid hex color: #FFF')
    })

    it('throws error for invalid hex (too long)', () => {
      expect(() => hexToRgb('#FFFFFFF')).toThrow('Invalid hex color: #FFFFFFF')
    })

    it('throws error for invalid hex (non-hex characters)', () => {
      expect(() => hexToRgb('#GGGGGG')).toThrow('Invalid hex color: #GGGGGG')
    })

    it('throws error for empty string', () => {
      expect(() => hexToRgb('')).toThrow('Invalid hex color: ')
    })
  })

  describe('getRelativeLuminance', () => {
    it('returns approximately 0.004 for near-black (#0C0C0F)', () => {
      // #0C0C0F = rgb(12, 12, 15)
      const luminance = getRelativeLuminance(12, 12, 15)
      expect(luminance).toBeCloseTo(0.0038, 3)
    })

    it('returns approximately 0.78 for near-white (#E8E6E3)', () => {
      // #E8E6E3 = rgb(232, 230, 227)
      const luminance = getRelativeLuminance(232, 230, 227)
      expect(luminance).toBeCloseTo(0.78, 1)
    })

    it('returns correct luminance for gold (#C9A962)', () => {
      // #C9A962 = rgb(201, 169, 98)
      const luminance = getRelativeLuminance(201, 169, 98)
      expect(luminance).toBeGreaterThan(0.35)
      expect(luminance).toBeLessThan(0.45)
    })

    it('returns 0 for pure black', () => {
      const luminance = getRelativeLuminance(0, 0, 0)
      expect(luminance).toBe(0)
    })

    it('returns 1 for pure white', () => {
      const luminance = getRelativeLuminance(255, 255, 255)
      expect(luminance).toBeCloseTo(1, 2)
    })

    it('handles the sRGB threshold correctly', () => {
      // Values at the threshold (0.03928 * 255 ≈ 10)
      const lowLuminance = getRelativeLuminance(10, 10, 10)
      expect(lowLuminance).toBeLessThan(0.01)
    })
  })

  describe('getContrastRatio', () => {
    it('returns approximately 15.7 for primary text on dark bg', () => {
      // #E8E6E3 on #0C0C0F - actual ~15.68
      const fg = { r: 232, g: 230, b: 227 }
      const bg = { r: 12, g: 12, b: 15 }
      const ratio = getContrastRatio(fg, bg)
      expect(ratio).toBeCloseTo(15.7, 0)
    })

    it('returns approximately 8.6 for gold on dark bg', () => {
      // #C9A962 on #0C0C0F - actual ~8.55
      const fg = { r: 201, g: 169, b: 98 }
      const bg = { r: 12, g: 12, b: 15 }
      const ratio = getContrastRatio(fg, bg)
      expect(ratio).toBeCloseTo(8.6, 0)
    })

    it('returns 1.0 for same color', () => {
      const color = { r: 128, g: 128, b: 128 }
      const ratio = getContrastRatio(color, color)
      expect(ratio).toBe(1)
    })

    it('returns 21 for black on white', () => {
      const black = { r: 0, g: 0, b: 0 }
      const white = { r: 255, g: 255, b: 255 }
      const ratio = getContrastRatio(black, white)
      expect(ratio).toBeCloseTo(21, 0)
    })

    it('returns same ratio regardless of fg/bg order', () => {
      const color1 = { r: 232, g: 230, b: 227 }
      const color2 = { r: 12, g: 12, b: 15 }
      const ratio1 = getContrastRatio(color1, color2)
      const ratio2 = getContrastRatio(color2, color1)
      expect(ratio1).toBe(ratio2)
    })
  })

  describe('checkWCAGAA', () => {
    it('returns passesAA: true for ratio >= 4.5', () => {
      // #E8E6E3 on #0C0C0F has ~14.5 contrast
      const result = checkWCAGAA('#E8E6E3', '#0C0C0F')
      expect(result.passesAA).toBe(true)
      expect(result.ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('returns passesAA: false for ratio < 4.5', () => {
      // Low contrast pair (gray on gray)
      const result = checkWCAGAA('#808080', '#909090')
      expect(result.passesAA).toBe(false)
      expect(result.ratio).toBeLessThan(4.5)
    })

    it('returns passesAALarge: true for ratio >= 3', () => {
      const result = checkWCAGAA('#7B9E89', '#0C0C0F')
      expect(result.passesAALarge).toBe(true)
      expect(result.ratio).toBeGreaterThanOrEqual(3)
    })

    it('returns passesAALarge: false for ratio < 3', () => {
      // Very low contrast
      const result = checkWCAGAA('#404040', '#505050')
      expect(result.passesAALarge).toBe(false)
      expect(result.ratio).toBeLessThan(3)
    })

    it('includes foreground and background in result', () => {
      const result = checkWCAGAA('#E8E6E3', '#0C0C0F')
      expect(result.foreground).toBe('#E8E6E3')
      expect(result.background).toBe('#0C0C0F')
    })

    it('rounds ratio to 2 decimal places', () => {
      const result = checkWCAGAA('#E8E6E3', '#0C0C0F')
      const decimalPlaces = (result.ratio.toString().split('.')[1] || '').length
      expect(decimalPlaces).toBeLessThanOrEqual(2)
    })
  })

  describe('COLOR_CHECKS', () => {
    it('has all required theme combinations', () => {
      expect(COLOR_CHECKS).toHaveProperty('textOnBg')
      expect(COLOR_CHECKS).toHaveProperty('secondaryOnBg')
      expect(COLOR_CHECKS).toHaveProperty('mutedOnBg')
      expect(COLOR_CHECKS).toHaveProperty('accentOnBg')
      expect(COLOR_CHECKS).toHaveProperty('textOnCard')
      expect(COLOR_CHECKS).toHaveProperty('accentOnCard')
      expect(COLOR_CHECKS).toHaveProperty('capability')
      expect(COLOR_CHECKS).toHaveProperty('market')
      expect(COLOR_CHECKS).toHaveProperty('agi')
      expect(COLOR_CHECKS).toHaveProperty('dismissive')
      expect(COLOR_CHECKS).toHaveProperty('focusRingOnBg')
    })

    it('most combinations pass WCAG AA (muted text requires large text use)', () => {
      // All colors pass except muted text which is 3.51:1 (passes AA Large at 3:1)
      // Muted text (#6B6860) should only be used for large text or non-essential UI
      const passingColors = Object.entries(COLOR_CHECKS).filter(
        ([key]) => key !== 'mutedOnBg'
      )
      const allPassExceptMuted = passingColors.every(([, check]) => check.passesAA)
      expect(allPassExceptMuted).toBe(true)

      // Verify muted passes large text requirement (3:1)
      expect(COLOR_CHECKS.mutedOnBg.passesAALarge).toBe(true)
    })

    describe('specific contrast ratios', () => {
      it('primary text on bg has ~15.7:1 ratio', () => {
        expect(COLOR_CHECKS.textOnBg.ratio).toBeGreaterThan(15)
        expect(COLOR_CHECKS.textOnBg.ratio).toBeLessThan(16)
      })

      it('secondary text on bg has ~7.2:1 ratio', () => {
        expect(COLOR_CHECKS.secondaryOnBg.ratio).toBeGreaterThan(7)
        expect(COLOR_CHECKS.secondaryOnBg.ratio).toBeLessThan(8)
      })

      it('muted text on bg has 3.51:1 ratio (passes large text requirement)', () => {
        // Note: Muted text (#6B6860) is 3.51:1, which passes AA Large (3:1)
        // but not AA Normal (4.5:1). Use only for large text or non-essential content.
        expect(COLOR_CHECKS.mutedOnBg.ratio).toBeCloseTo(3.51, 1)
        expect(COLOR_CHECKS.mutedOnBg.passesAALarge).toBe(true)
        expect(COLOR_CHECKS.mutedOnBg.passesAA).toBe(false)
      })

      it('accent on bg has ~7.8:1 ratio', () => {
        expect(COLOR_CHECKS.accentOnBg.ratio).toBeGreaterThan(7)
        expect(COLOR_CHECKS.accentOnBg.ratio).toBeLessThan(9)
      })

      it('capability color passes AA', () => {
        expect(COLOR_CHECKS.capability.passesAA).toBe(true)
      })

      it('market color passes AA', () => {
        expect(COLOR_CHECKS.market.passesAA).toBe(true)
      })

      it('agi color passes AA', () => {
        expect(COLOR_CHECKS.agi.passesAA).toBe(true)
      })

      it('dismissive color passes AA', () => {
        expect(COLOR_CHECKS.dismissive.passesAA).toBe(true)
      })
    })
  })

  describe('verifyAllColorsPassAA', () => {
    it('returns false when muted text fails AA normal (but passes large)', () => {
      // The muted text color fails AA normal but this is documented and acceptable
      // for its intended use (large text, non-essential content, UI components)
      expect(verifyAllColorsPassAA()).toBe(false)
    })
  })

  describe('getFailingColors', () => {
    it('returns array with muted text (only color that fails AA normal)', () => {
      const failing = getFailingColors()
      expect(failing).toHaveLength(1)
      expect(failing[0].foreground).toBe('#6B6860')
      expect(failing[0].passesAALarge).toBe(true) // But passes for large text
    })
  })
})
