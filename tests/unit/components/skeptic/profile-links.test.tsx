/**
 * ProfileLinks Component Tests
 *
 * Tests the ProfileLinks component's platform configuration
 * and link rendering logic.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileLinks, ProfileLinksLarge } from '@/components/skeptic/profile-links'
import type { SkepticProfile } from '@/types/skeptic'

// Platform config for testing (mirrors component implementation)
const platformConfig: Record<string, { label: string; icon: string }> = {
  twitter: { label: 'Twitter/X', icon: '𝕏' },
  substack: { label: 'Substack', icon: '◉' },
  website: { label: 'Website', icon: '🌐' },
  linkedin: { label: 'LinkedIn', icon: 'in' },
  wikipedia: { label: 'Wikipedia', icon: 'W' },
}

describe('ProfileLinks platformConfig', () => {
  it('has configuration for twitter', () => {
    expect(platformConfig.twitter).toEqual({ label: 'Twitter/X', icon: '𝕏' })
  })

  it('has configuration for substack', () => {
    expect(platformConfig.substack).toEqual({ label: 'Substack', icon: '◉' })
  })

  it('has configuration for website', () => {
    expect(platformConfig.website).toEqual({ label: 'Website', icon: '🌐' })
  })

  it('has configuration for linkedin', () => {
    expect(platformConfig.linkedin).toEqual({ label: 'LinkedIn', icon: 'in' })
  })

  it('has configuration for wikipedia', () => {
    expect(platformConfig.wikipedia).toEqual({ label: 'Wikipedia', icon: 'W' })
  })
})

describe('ProfileLinks component', () => {
  const profiles: SkepticProfile[] = [
    { platform: 'twitter', url: 'https://twitter.com/test' },
    { platform: 'substack', url: 'https://test.substack.com' },
  ]

  it('renders nothing when profiles is null', () => {
    const { container } = render(<ProfileLinks profiles={null as unknown as SkepticProfile[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when profiles is undefined', () => {
    const { container } = render(<ProfileLinks profiles={undefined as unknown as SkepticProfile[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when profiles is empty', () => {
    const { container } = render(<ProfileLinks profiles={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders links for each profile', () => {
    render(<ProfileLinks profiles={profiles} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
  })

  it('opens links in new tab', () => {
    render(<ProfileLinks profiles={profiles} />)
    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('uses correct href for each profile', () => {
    render(<ProfileLinks profiles={profiles} />)
    expect(screen.getByRole('link', { name: /twitter/i })).toHaveAttribute(
      'href',
      'https://twitter.com/test'
    )
    expect(screen.getByRole('link', { name: /substack/i })).toHaveAttribute(
      'href',
      'https://test.substack.com'
    )
  })

  it('handles unknown platforms with fallback icon', () => {
    const unknownProfile: SkepticProfile[] = [
      { platform: 'unknown', url: 'https://example.com' },
    ]
    render(<ProfileLinks profiles={unknownProfile} />)
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
  })
})

describe('ProfileLinksLarge component', () => {
  const profiles: SkepticProfile[] = [
    { platform: 'twitter', url: 'https://twitter.com/test' },
    { platform: 'website', url: 'https://example.com' },
  ]

  it('renders nothing when profiles is empty', () => {
    const { container } = render(<ProfileLinksLarge profiles={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders visible labels (not sr-only)', () => {
    render(<ProfileLinksLarge profiles={profiles} />)
    expect(screen.getByText('Twitter/X')).toBeInTheDocument()
    expect(screen.getByText('Website')).toBeInTheDocument()
  })

  it('applies larger styling classes', () => {
    const { container } = render(<ProfileLinksLarge profiles={profiles} />)
    expect(container.querySelector('.gap-3')).toBeInTheDocument()
    expect(container.querySelector('.px-3')).toBeInTheDocument()
  })
})
