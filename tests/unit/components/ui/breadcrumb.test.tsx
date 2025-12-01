/**
 * Breadcrumb UI Component Tests
 *
 * Tests for Story 5-4: Breadcrumb Navigation
 * Tests the shadcn/ui breadcrumb component exports and functionality.
 */
import { describe, it, expect } from 'vitest'

describe('breadcrumb module exports', () => {
  it('exports all breadcrumb components', async () => {
    const breadcrumbModule = await import('@/components/ui/breadcrumb')

    expect(breadcrumbModule.Breadcrumb).toBeDefined()
    expect(breadcrumbModule.BreadcrumbList).toBeDefined()
    expect(breadcrumbModule.BreadcrumbItem).toBeDefined()
    expect(breadcrumbModule.BreadcrumbLink).toBeDefined()
    expect(breadcrumbModule.BreadcrumbPage).toBeDefined()
    expect(breadcrumbModule.BreadcrumbSeparator).toBeDefined()
    expect(breadcrumbModule.BreadcrumbEllipsis).toBeDefined()
  })

  it('Breadcrumb is a forwardRef component', async () => {
    const { Breadcrumb } = await import('@/components/ui/breadcrumb')
    // forwardRef components have $$typeof Symbol
    expect(Breadcrumb).toHaveProperty('$$typeof')
  })

  it('BreadcrumbList is a forwardRef component', async () => {
    const { BreadcrumbList } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbList).toHaveProperty('$$typeof')
  })

  it('BreadcrumbItem is a forwardRef component', async () => {
    const { BreadcrumbItem } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbItem).toHaveProperty('$$typeof')
  })

  it('BreadcrumbLink is a forwardRef component', async () => {
    const { BreadcrumbLink } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbLink).toHaveProperty('$$typeof')
  })

  it('BreadcrumbPage is a forwardRef component', async () => {
    const { BreadcrumbPage } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbPage).toHaveProperty('$$typeof')
  })

  it('BreadcrumbSeparator is a function component', async () => {
    const { BreadcrumbSeparator } = await import('@/components/ui/breadcrumb')
    expect(typeof BreadcrumbSeparator).toBe('function')
  })

  it('BreadcrumbEllipsis is a function component', async () => {
    const { BreadcrumbEllipsis } = await import('@/components/ui/breadcrumb')
    expect(typeof BreadcrumbEllipsis).toBe('function')
  })
})

describe('breadcrumb component displayNames', () => {
  it('Breadcrumb has displayName "Breadcrumb"', async () => {
    const { Breadcrumb } = await import('@/components/ui/breadcrumb')
    expect(Breadcrumb.displayName).toBe('Breadcrumb')
  })

  it('BreadcrumbList has displayName "BreadcrumbList"', async () => {
    const { BreadcrumbList } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbList.displayName).toBe('BreadcrumbList')
  })

  it('BreadcrumbItem has displayName "BreadcrumbItem"', async () => {
    const { BreadcrumbItem } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbItem.displayName).toBe('BreadcrumbItem')
  })

  it('BreadcrumbLink has displayName "BreadcrumbLink"', async () => {
    const { BreadcrumbLink } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbLink.displayName).toBe('BreadcrumbLink')
  })

  it('BreadcrumbPage has displayName "BreadcrumbPage"', async () => {
    const { BreadcrumbPage } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbPage.displayName).toBe('BreadcrumbPage')
  })

  it('BreadcrumbSeparator has displayName "BreadcrumbSeparator"', async () => {
    const { BreadcrumbSeparator } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbSeparator.displayName).toBe('BreadcrumbSeparator')
  })

  it('BreadcrumbEllipsis has displayName "BreadcrumbEllipsis"', async () => {
    const { BreadcrumbEllipsis } = await import('@/components/ui/breadcrumb')
    expect(BreadcrumbEllipsis.displayName).toBe('BreadcrumbEllipsis')
  })
})
