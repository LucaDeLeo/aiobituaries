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
 * Grid cell key for spatial hashing
 */
function getCellKey(x: number, y: number, cellSize: number): string {
  const cellX = Math.floor(x / cellSize)
  const cellY = Math.floor(y / cellSize)
  return `${cellX},${cellY}`
}

/**
 * Build spatial hash grid for O(1) neighbor lookups
 */
function buildSpatialGrid(
  points: PositionedPoint[],
  cellSize: number
): Map<string, PositionedPoint[]> {
  const grid = new Map<string, PositionedPoint[]>()
  for (const point of points) {
    const key = getCellKey(point.x, point.y, cellSize)
    const cell = grid.get(key)
    if (cell) {
      cell.push(point)
    } else {
      grid.set(key, [point])
    }
  }
  return grid
}

/**
 * Get all points in cell and adjacent cells (9 cells total)
 */
function getNearbyCandidates(
  x: number,
  y: number,
  cellSize: number,
  grid: Map<string, PositionedPoint[]>
): PositionedPoint[] {
  const cellX = Math.floor(x / cellSize)
  const cellY = Math.floor(y / cellSize)
  const candidates: PositionedPoint[] = []

  // Check 3x3 grid of cells centered on point's cell
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const key = `${cellX + dx},${cellY + dy}`
      const cell = grid.get(key)
      if (cell) {
        candidates.push(...cell)
      }
    }
  }

  return candidates
}

/**
 * Compute clusters from positioned points using grid-based spatial hashing.
 * Uses O(n) average case by only checking nearby cells instead of all points.
 * Compares squared distances to avoid Math.sqrt overhead.
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
  if (points.length === 0) return []

  // Effective threshold increases as we zoom out (more clustering)
  const effectiveThreshold = config.threshold / zoomScale
  const thresholdSquared = effectiveThreshold * effectiveThreshold
  const clusters: PointCluster[] = []
  const assigned = new Set<string>()

  // Build spatial hash grid with cell size = threshold (ensures neighbors are in adjacent cells)
  const grid = buildSpatialGrid(points, effectiveThreshold)

  for (const point of points) {
    if (assigned.has(point.obituary._id)) continue

    // Get candidate points from nearby cells only (O(1) average case)
    const candidates = getNearbyCandidates(point.x, point.y, effectiveThreshold, grid)

    // Find all nearby points within threshold using squared distance
    const nearby = candidates.filter((p) => {
      if (assigned.has(p.obituary._id)) return false
      if (p.obituary._id === point.obituary._id) return true

      const dx = p.x - point.x
      const dy = p.y - point.y
      // Compare squared distances to avoid Math.sqrt
      return dx * dx + dy * dy <= thresholdSquared
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
        const cat = p.obituary.categories?.[0]
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
