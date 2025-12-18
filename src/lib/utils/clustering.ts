import type { PointCluster } from '@/types/visualization'
import type { ObituarySummary, Category } from '@/types/obituary'

/**
 * Configuration for clustering algorithm.
 */
export interface ClusterConfig {
  /** Distance threshold in pixels for clustering */
  threshold: number
  /** Minimum points to form a cluster */
  minPoints: number
}

/**
 * Default clustering configuration.
 * - threshold: 20px - points within this distance may cluster
 * - minPoints: 5 - minimum points needed to form a cluster
 */
export const DEFAULT_CLUSTER_CONFIG: ClusterConfig = {
  threshold: 20,
  minPoints: 5,
}

/**
 * Internal interface for points with computed positions.
 */
interface PositionedPoint {
  obituary: ObituarySummary
  x: number
  y: number
}

/**
 * Compute clusters from positioned points using proximity-based approach.
 * Scans points sorted by X, finding nearby points within threshold distance.
 * Threshold scales inversely with zoom - at low zoom, more clustering occurs.
 *
 * Note: Current implementation is O(n^2) in worst case. For large datasets,
 * consider spatial hashing or grid bucketing for better performance.
 *
 * @param points - Array of points with obituary data and computed x,y positions
 * @param config - Clustering configuration (threshold, minPoints)
 * @param zoomScale - Current zoom scale (0.5 to 5)
 * @returns Array of PointCluster objects
 */
export function computeClusters(
  points: PositionedPoint[],
  config: ClusterConfig = DEFAULT_CLUSTER_CONFIG,
  zoomScale: number = 1
): PointCluster[] {
  // Effective threshold increases as we zoom out (more clustering)
  const effectiveThreshold = config.threshold / zoomScale
  const clusters: PointCluster[] = []
  const assigned = new Set<string>()

  // Sort points by x position for efficient nearby search
  const sortedPoints = [...points].sort((a, b) => a.x - b.x)

  for (const point of sortedPoints) {
    if (assigned.has(point.obituary._id)) continue

    // Find all nearby points within threshold
    const nearby = sortedPoints.filter((p) => {
      if (assigned.has(p.obituary._id)) return false
      if (p.obituary._id === point.obituary._id) return true

      const dx = p.x - point.x
      // Early exit if too far in x direction
      if (Math.abs(dx) > effectiveThreshold) return false

      const dy = p.y - point.y
      return Math.sqrt(dx * dx + dy * dy) <= effectiveThreshold
    })

    if (nearby.length >= config.minPoints) {
      const obituaryIds = nearby.map((p) => p.obituary._id)
      nearby.forEach((p) => assigned.add(p.obituary._id))

      // Compute centroid
      const centerX = nearby.reduce((sum, p) => sum + p.x, 0) / nearby.length
      const centerY = nearby.reduce((sum, p) => sum + p.y, 0) / nearby.length

      // Find primary category (most common)
      const categoryCounts = new Map<Category, number>()
      nearby.forEach((p) => {
        const cat = p.obituary.categories[0]
        if (cat) {
          categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
        }
      })

      let primaryCategory: Category = 'capability'
      let maxCount = 0
      categoryCounts.forEach((count, cat) => {
        if (count > maxCount) {
          maxCount = count
          primaryCategory = cat
        }
      })

      // Calculate time bounds for click-to-zoom
      const dates = nearby.map((p) => new Date(p.obituary.date).getTime())
      const minDate = Math.min(...dates)
      const maxDate = Math.max(...dates)

      clusters.push({
        id: `cluster-${clusters.length}`,
        x: centerX,
        y: centerY,
        count: nearby.length,
        obituaryIds,
        primaryCategory,
        minDate: new Date(minDate),
        maxDate: new Date(maxDate),
      })
    }
  }

  return clusters
}

/**
 * Check if a point is part of any cluster.
 *
 * @param obituaryId - The obituary ID to check
 * @param clusters - Array of clusters to search
 * @returns True if the point is in any cluster
 */
export function isPointClustered(
  obituaryId: string,
  clusters: PointCluster[]
): boolean {
  return clusters.some((c) => c.obituaryIds.includes(obituaryId))
}

/**
 * Determine if clustering should be shown based on zoom level.
 * Clusters are shown when zoom scale is strictly less than 0.7.
 *
 * @param zoomScale - Current zoom scale
 * @returns True if clusters should be displayed
 */
export function shouldShowClusters(zoomScale: number): boolean {
  return zoomScale < 0.7
}
