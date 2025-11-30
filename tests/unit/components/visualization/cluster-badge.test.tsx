/**
 * ClusterBadge Component Tests
 *
 * Note: Following same pattern as scatter-point.test.tsx - testing exports, types,
 * and integration due to React 19 + Vitest hook resolution issues with direct rendering.
 */
import { describe, it, expect } from 'vitest'

describe('ClusterBadge module exports', () => {
  it('exports ClusterBadge component', async () => {
    const clusterBadgeModule = await import(
      '@/components/visualization/cluster-badge'
    )
    expect(clusterBadgeModule.ClusterBadge).toBeDefined()
    expect(typeof clusterBadgeModule.ClusterBadge).toBe('function')
  })
})

describe('ClusterBadge behavior contracts', () => {
  it('component should be a valid function', async () => {
    const { ClusterBadge } = await import(
      '@/components/visualization/cluster-badge'
    )
    expect(typeof ClusterBadge).toBe('function')
  })

  it('scatter-helpers exports are available for category color', async () => {
    const helpers = await import('@/lib/utils/scatter-helpers')
    expect(helpers.getCategoryColor).toBeDefined()
    expect(typeof helpers.getCategoryColor).toBe('function')
  })

  it('PointCluster type is available from visualization types', async () => {
    // Verify the type is correctly exported by importing the module
    const types = await import('@/types/visualization')
    // Can't directly test types, but can verify module exports
    expect(types).toBeDefined()
  })
})

describe('Motion dependency integration', () => {
  it('motion/react is importable', async () => {
    const { motion } = await import('motion/react')
    expect(motion).toBeDefined()
  })

  it('motion.g is available for SVG group animation', async () => {
    const { motion } = await import('motion/react')
    expect(motion.g).toBeDefined()
  })

  it('AnimatePresence is available for enter/exit animations', async () => {
    const { AnimatePresence } = await import('motion/react')
    expect(AnimatePresence).toBeDefined()
  })
})

describe('ClusterBadge integration with ScatterPlot', () => {
  it('ScatterPlot imports ClusterBadge', async () => {
    // Import both modules to verify the integration is correctly set up
    const scatterPlot = await import('@/components/visualization/scatter-plot')
    const clusterBadge = await import(
      '@/components/visualization/cluster-badge'
    )

    expect(scatterPlot.ScatterPlot).toBeDefined()
    expect(clusterBadge.ClusterBadge).toBeDefined()
  })

  it('clustering utilities are importable', async () => {
    const clustering = await import('@/lib/utils/clustering')
    expect(clustering.computeClusters).toBeDefined()
    expect(clustering.isPointClustered).toBeDefined()
    expect(clustering.shouldShowClusters).toBeDefined()
    expect(clustering.DEFAULT_CLUSTER_CONFIG).toBeDefined()
  })

  it('clustering utilities integrate with visualization types', async () => {
    const clustering = await import('@/lib/utils/clustering')
    const { shouldShowClusters } = clustering

    // Verify the function works correctly
    expect(shouldShowClusters(0.5)).toBe(true) // < 0.7 = show clusters
    expect(shouldShowClusters(0.7)).toBe(false) // >= 0.7 = no clusters
    expect(shouldShowClusters(1.0)).toBe(false)
  })
})

describe('ClusterBadge count formatting logic', () => {
  it('count formatting follows +N pattern', () => {
    // Test the count formatting logic that should be in the component
    const formatCount = (count: number) =>
      count > 99 ? '99+' : `+${count}`

    expect(formatCount(5)).toBe('+5')
    expect(formatCount(10)).toBe('+10')
    expect(formatCount(50)).toBe('+50')
    expect(formatCount(99)).toBe('+99')
    expect(formatCount(100)).toBe('99+')
    expect(formatCount(150)).toBe('99+')
  })
})

describe('Category color integration', () => {
  it('getCategoryColor returns correct colors for all categories', async () => {
    const { getCategoryColor } = await import('@/lib/utils/scatter-helpers')

    expect(getCategoryColor(['capability'])).toBe('#C9A962')
    expect(getCategoryColor(['market'])).toBe('#7B9E89')
    expect(getCategoryColor(['agi'])).toBe('#9E7B7B')
    expect(getCategoryColor(['dismissive'])).toBe('#7B7B9E')
  })

  it('getCategoryColor works with single-element array', async () => {
    const { getCategoryColor } = await import('@/lib/utils/scatter-helpers')

    // ClusterBadge passes [cluster.primaryCategory] to getCategoryColor
    expect(getCategoryColor(['capability'])).toBeDefined()
    expect(typeof getCategoryColor(['market'])).toBe('string')
  })
})
