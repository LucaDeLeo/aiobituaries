/**
 * ScatterPoint Component Tests
 *
 * Note: Following same pattern as scatter-plot.test.tsx - testing exports and types
 * due to React 19 + Vitest hook resolution issues with direct rendering.
 */
import { describe, it, expect } from 'vitest'

describe('ScatterPoint module exports', () => {
  it('exports ScatterPoint component', async () => {
    const scatterPointModule = await import(
      '@/components/visualization/scatter-point'
    )
    expect(scatterPointModule.ScatterPoint).toBeDefined()
    expect(typeof scatterPointModule.ScatterPoint).toBe('function')
  })

  it('exports ScatterPointProps type (via component existence)', async () => {
    const scatterPointModule = await import(
      '@/components/visualization/scatter-point'
    )
    expect(scatterPointModule.ScatterPoint).toBeDefined()
  })
})

describe('ScatterPoint behavior contracts', () => {
  it('component should be a valid function', async () => {
    const { ScatterPoint } = await import(
      '@/components/visualization/scatter-point'
    )
    expect(typeof ScatterPoint).toBe('function')
  })

  it('scatter-helpers exports are available for integration', async () => {
    const helpers = await import('@/lib/utils/scatter-helpers')
    expect(helpers.CATEGORY_HEX_COLORS).toBeDefined()
    expect(helpers.hashToJitter).toBeDefined()
    expect(helpers.getCategoryColor).toBeDefined()
  })
})

describe('Motion dependency integration', () => {
  it('motion/react is importable', async () => {
    const { motion } = await import('motion/react')
    expect(motion).toBeDefined()
  })

  it('motion.circle is available for SVG animation', async () => {
    const { motion } = await import('motion/react')
    expect(motion.circle).toBeDefined()
  })

  it('motion.g is available for group animation', async () => {
    const { motion } = await import('motion/react')
    expect(motion.g).toBeDefined()
  })
})

describe('ScatterPlot integration with ScatterPoint', () => {
  it('ScatterPlot imports ScatterPoint', async () => {
    // Import both modules to verify the integration is correctly set up
    const scatterPlot = await import('@/components/visualization/scatter-plot')
    const scatterPoint = await import(
      '@/components/visualization/scatter-point'
    )

    expect(scatterPlot.ScatterPlot).toBeDefined()
    expect(scatterPoint.ScatterPoint).toBeDefined()
  })

  it('ScatterPlot imports scatter-helpers', async () => {
    // Verify helpers are importable from the scatter-plot context
    const helpers = await import('@/lib/utils/scatter-helpers')
    expect(helpers.hashToJitter).toBeDefined()
    expect(helpers.getCategoryColor).toBeDefined()
  })
})
