import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSkepticBySlug, getAllSkepticSlugs } from '@/lib/sanity/queries'
import { getCurrentMetrics } from '@/data/ai-metrics'
import { ProfileLinksLarge } from '@/components/skeptic/profile-links'
import { SkepticClaimList } from '@/components/skeptic/skeptic-claim-list'
import { CurrentMetricsFooter } from '@/components/skeptic/metrics-badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Generate SEO metadata for each skeptic page.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const skeptic = await getSkepticBySlug(slug)

  if (!skeptic) {
    return {
      title: 'Skeptic Not Found | AI Obituaries',
    }
  }

  const claimCount = skeptic.claims?.length || 0
  const description = `${skeptic.name}'s ${claimCount} AI skepticism claim${claimCount !== 1 ? 's' : ''} tracked against actual AI progress metrics.`

  return {
    title: `${skeptic.name} | AI Obituaries`,
    description,
    openGraph: {
      title: `${skeptic.name} | AI Obituaries`,
      description,
      type: 'profile',
    },
  }
}

/**
 * Generate static pages for all skeptics at build time.
 */
export async function generateStaticParams() {
  const slugs = await getAllSkepticSlugs()
  return slugs.map((slug) => ({ slug }))
}

/**
 * Individual skeptic detail page.
 * Shows skeptic profile info, their claims with AI metrics at each date,
 * and current metrics for comparison.
 */
export default async function SkepticPage({ params }: PageProps) {
  const { slug } = await params
  const skeptic = await getSkepticBySlug(slug)

  if (!skeptic) {
    notFound()
  }

  const currentMetrics = getCurrentMetrics()
  const claimCount = skeptic.claims?.length || 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/"
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-[var(--text-muted)]" />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/skeptics"
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                Skeptics
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-[var(--text-muted)]" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[var(--text-secondary)]">
              {skeptic.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
          {skeptic.name}
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mb-4">{skeptic.bio}</p>
        <ProfileLinksLarge profiles={skeptic.profiles} />
      </header>

      {/* Claims section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          {claimCount} Claim{claimCount !== 1 ? 's' : ''}
        </h2>
        <SkepticClaimList claims={skeptic.claims} />
      </section>

      {/* Current metrics footer */}
      <CurrentMetricsFooter metrics={currentMetrics} />
    </div>
  )
}
