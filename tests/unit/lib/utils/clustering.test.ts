import { describe, it, expect } from 'vitest'
import {
  computeClusters,
  isPointClustered,
  shouldShowClusters,
  DEFAULT_CLUSTER_CONFIG,
  type ClusterConfig,
} from '@/lib/utils/clustering'
import type { ObituarySummary, Category } from '@/types/obituary'

// Helper to create mock obituary data
function createObituarySummary(
  id: string,
  date: string,
  categories: Category[] = ['capability']
): ObituarySummary {
  return {
    _id: id,
    slug: `slug-${id}`,
    claim: `Claim for ${id}`,
    source: 'Test Source',
    date,
    categories,
  }
}

// Helper to create positioned points
function createPositionedPoint(
  id: string,
  x: number,
  y: number,
  date: string = '2024-01-01',
  categories: Category[] = ['capability']
) {
  return {
    obituary: createObituarySummary(id, date, categories),
    x,
    y,
  }
}

describe('computeClusters', () => {
  it('returns empty array for empty input', () => {
    const result = computeClusters([], DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toEqual([])
  })

  it('returns empty array for sparse points (below threshold distance)', () => {
    // Points spread far apart (> 20px threshold)
    const points = [
      createPositionedPoint('1', 0, 0),
      createPositionedPoint('2', 100, 0),
      createPositionedPoint('3', 200, 0),
      createPositionedPoint('4', 300, 0),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toEqual([])
  })

  it('returns empty array when nearby points are below minPoints', () => {
    // Only 4 nearby points (minPoints is 5)
    const points = [
      createPositionedPoint('1', 0, 0),
      createPositionedPoint('2', 5, 0),
      createPositionedPoint('3', 10, 0),
      createPositionedPoint('4', 15, 0),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toEqual([])
  })

  it('creates cluster for nearby points >= minPoints', () => {
    // 5 nearby points within 20px threshold
    const points = [
      createPositionedPoint('1', 0, 0),
      createPositionedPoint('2', 5, 0),
      createPositionedPoint('3', 10, 0),
      createPositionedPoint('4', 15, 0),
      createPositionedPoint('5', 18, 0),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toHaveLength(1)
    expect(result[0].count).toBe(5)
    expect(result[0].obituaryIds).toHaveLength(5)
  })

  it('calculates cluster centroid as average of member positions', () => {
    const points = [
      createPositionedPoint('1', 0, 0),
      createPositionedPoint('2', 10, 10),
      createPositionedPoint('3', 20, 0),
      createPositionedPoint('4', 10, -10),
      createPositionedPoint('5', 10, 0),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toHaveLength(1)
    // Centroid: x = (0+10+20+10+10)/5 = 10, y = (0+10+0+-10+0)/5 = 0
    expect(result[0].x).toBe(10)
    expect(result[0].y).toBe(0)
  })

  it('identifies primary category as most frequent in cluster', () => {
    const points = [
      createPositionedPoint('1', 0, 0, '2024-01-01', ['capability']),
      createPositionedPoint('2', 5, 0, '2024-01-02', ['market']),
      createPositionedPoint('3', 10, 0, '2024-01-03', ['market']),
      createPositionedPoint('4', 15, 0, '2024-01-04', ['market']),
      createPositionedPoint('5', 18, 0, '2024-01-05', ['agi']),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toHaveLength(1)
    expect(result[0].primaryCategory).toBe('market')
  })

  it('defaults to capability when categories are equal', () => {
    // All same count - first one found wins, but default is capability
    const points = [
      createPositionedPoint('1', 0, 0, '2024-01-01', ['capability']),
      createPositionedPoint('2', 5, 0, '2024-01-02', ['capability']),
      createPositionedPoint('3', 10, 0, '2024-01-03', ['market']),
      createPositionedPoint('4', 15, 0, '2024-01-04', ['market']),
      createPositionedPoint('5', 18, 0, '2024-01-05', ['agi']),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toHaveLength(1)
    // When counts are equal, whichever is encountered first with max count wins
    expect(['capability', 'market']).toContain(result[0].primaryCategory)
  })

  it('calculates effectiveThreshold inversely with zoomScale', () => {
    // At zoom 0.5, threshold becomes 40px (20/0.5)
    // effectiveThreshold = threshold / zoomScale
    // Test with points that would cluster at low zoom but not at high zoom
    const widelySpacedPoints = [
      createPositionedPoint('1', 0, 0),
      createPositionedPoint('2', 30, 0),
      createPositionedPoint('3', 60, 0),
      createPositionedPoint('4', 90, 0),
      createPositionedPoint('5', 120, 0),
    ]

    // At zoom 1.0, threshold is 20px - points are 30px apart, no clustering
    const resultNormal = computeClusters(widelySpacedPoints, DEFAULT_CLUSTER_CONFIG, 1)
    expect(resultNormal).toHaveLength(0)

    // At zoom 0.25, threshold is 80px (20/0.25) - all points within range can cluster
    // Point 1 at x=0 can reach x=30, x=60 within 80px
    // This creates overlapping neighborhoods forming a cluster
    const resultZoomed = computeClusters(widelySpacedPoints, DEFAULT_CLUSTER_CONFIG, 0.25)
    expect(resultZoomed).toHaveLength(1)
    expect(resultZoomed[0].count).toBe(5)
  })

  it('calculates correct minDate and maxDate from cluster members', () => {
    const points = [
      createPositionedPoint('1', 0, 0, '2024-01-15'),
      createPositionedPoint('2', 5, 0, '2024-01-01'), // Earliest
      createPositionedPoint('3', 10, 0, '2024-03-20'), // Latest
      createPositionedPoint('4', 15, 0, '2024-02-10'),
      createPositionedPoint('5', 18, 0, '2024-01-25'),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toHaveLength(1)
    expect(result[0].minDate.toISOString()).toContain('2024-01-01')
    expect(result[0].maxDate.toISOString()).toContain('2024-03-20')
  })

  it('creates multiple clusters for separate groups', () => {
    const points = [
      // Cluster 1: 5 points near x=0
      createPositionedPoint('1', 0, 0),
      createPositionedPoint('2', 5, 0),
      createPositionedPoint('3', 10, 0),
      createPositionedPoint('4', 15, 0),
      createPositionedPoint('5', 18, 0),
      // Cluster 2: 5 points near x=200
      createPositionedPoint('6', 200, 0),
      createPositionedPoint('7', 205, 0),
      createPositionedPoint('8', 210, 0),
      createPositionedPoint('9', 215, 0),
      createPositionedPoint('10', 218, 0),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toHaveLength(2)
    expect(result[0].count).toBe(5)
    expect(result[1].count).toBe(5)
  })

  it('assigns unique cluster IDs', () => {
    const points = [
      // Two clusters
      createPositionedPoint('1', 0, 0),
      createPositionedPoint('2', 5, 0),
      createPositionedPoint('3', 10, 0),
      createPositionedPoint('4', 15, 0),
      createPositionedPoint('5', 18, 0),
      createPositionedPoint('6', 200, 0),
      createPositionedPoint('7', 205, 0),
      createPositionedPoint('8', 210, 0),
      createPositionedPoint('9', 215, 0),
      createPositionedPoint('10', 218, 0),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result[0].id).toBe('cluster-0')
    expect(result[1].id).toBe('cluster-1')
  })

  it('respects custom config values', () => {
    const customConfig: ClusterConfig = {
      threshold: 50, // Larger threshold
      minPoints: 3, // Lower minPoints
    }
    const points = [
      createPositionedPoint('1', 0, 0),
      createPositionedPoint('2', 30, 0),
      createPositionedPoint('3', 45, 0),
    ]
    // With default config (threshold 20, minPoints 5): no cluster
    const resultDefault = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(resultDefault).toHaveLength(0)

    // With custom config (threshold 50, minPoints 3): cluster forms
    const resultCustom = computeClusters(points, customConfig, 1)
    expect(resultCustom).toHaveLength(1)
    expect(resultCustom[0].count).toBe(3)
  })

  it('includes all obituary IDs in cluster', () => {
    const points = [
      createPositionedPoint('id-a', 0, 0),
      createPositionedPoint('id-b', 5, 0),
      createPositionedPoint('id-c', 10, 0),
      createPositionedPoint('id-d', 15, 0),
      createPositionedPoint('id-e', 18, 0),
    ]
    const result = computeClusters(points, DEFAULT_CLUSTER_CONFIG, 1)
    expect(result).toHaveLength(1)
    expect(result[0].obituaryIds).toContain('id-a')
    expect(result[0].obituaryIds).toContain('id-b')
    expect(result[0].obituaryIds).toContain('id-c')
    expect(result[0].obituaryIds).toContain('id-d')
    expect(result[0].obituaryIds).toContain('id-e')
  })
})

describe('isPointClustered', () => {
  const mockClusters = [
    {
      id: 'cluster-0',
      x: 10,
      y: 10,
      count: 5,
      obituaryIds: ['id-1', 'id-2', 'id-3', 'id-4', 'id-5'],
      primaryCategory: 'capability' as Category,
      minDate: new Date('2024-01-01'),
      maxDate: new Date('2024-01-05'),
    },
    {
      id: 'cluster-1',
      x: 200,
      y: 10,
      count: 5,
      obituaryIds: ['id-6', 'id-7', 'id-8', 'id-9', 'id-10'],
      primaryCategory: 'market' as Category,
      minDate: new Date('2024-02-01'),
      maxDate: new Date('2024-02-05'),
    },
  ]

  it('returns true for point in a cluster', () => {
    expect(isPointClustered('id-1', mockClusters)).toBe(true)
    expect(isPointClustered('id-5', mockClusters)).toBe(true)
    expect(isPointClustered('id-8', mockClusters)).toBe(true)
  })

  it('returns false for point not in any cluster', () => {
    expect(isPointClustered('id-99', mockClusters)).toBe(false)
    expect(isPointClustered('non-existent', mockClusters)).toBe(false)
  })

  it('returns false for empty clusters array', () => {
    expect(isPointClustered('id-1', [])).toBe(false)
  })
})

describe('shouldShowClusters', () => {
  it('returns true when zoom < 0.7', () => {
    expect(shouldShowClusters(0.5)).toBe(true)
    expect(shouldShowClusters(0.6)).toBe(true)
    expect(shouldShowClusters(0.69)).toBe(true)
    expect(shouldShowClusters(0.699)).toBe(true)
  })

  it('returns false when zoom >= 0.7', () => {
    expect(shouldShowClusters(0.7)).toBe(false)
    expect(shouldShowClusters(0.71)).toBe(false)
    expect(shouldShowClusters(1.0)).toBe(false)
    expect(shouldShowClusters(1.5)).toBe(false)
    expect(shouldShowClusters(5.0)).toBe(false)
  })

  it('returns false at exactly 0.7 (boundary condition)', () => {
    expect(shouldShowClusters(0.7)).toBe(false)
  })
})

describe('DEFAULT_CLUSTER_CONFIG', () => {
  it('has threshold of 20', () => {
    expect(DEFAULT_CLUSTER_CONFIG.threshold).toBe(20)
  })

  it('has minPoints of 5', () => {
    expect(DEFAULT_CLUSTER_CONFIG.minPoints).toBe(5)
  })
})
