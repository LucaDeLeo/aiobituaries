import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getObituaryBySlug,
  getObituaryWithNav,
  getAllObituarySlugs,
} from '@/lib/sanity/queries'
import { ObituaryDetail } from '@/components/obituary/obituary-detail'
import { ObituaryContext } from '@/components/obituary/obituary-context'
import { ObituaryNav } from '@/components/obituary/obituary-nav'
import { JsonLd } from '@/components/seo/json-ld'
import { generateObituaryMetadata } from '@/lib/utils/seo'
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
 * Generate SEO metadata for each obituary page.
 * Includes title, description, Open Graph, and Twitter Card tags.
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const obituary = await getObituaryBySlug(slug)
  if (!obituary) return {}
  return generateObituaryMetadata(obituary)
}

/**
 * Generate static pages for all obituaries at build time.
 * Fetches all slugs from Sanity and returns params for each.
 */
export async function generateStaticParams() {
  const slugs = await getAllObituarySlugs()
  return slugs.map((slug) => ({ slug }))
}

/**
 * Individual obituary detail page.
 * Displays full obituary content including claim, source, date, and categories.
 * Includes previous/next navigation at the bottom for sequential browsing.
 * Shows 404 page if slug does not exist.
 */
export default async function ObituaryPage({ params }: PageProps) {
  const { slug } = await params
  const obituary = await getObituaryWithNav(slug)

  if (!obituary) {
    notFound()
  }

  // Truncate long source names to ~40 characters
  const truncatedSource =
    obituary.source.length > 40
      ? `${obituary.source.slice(0, 37)}...`
      : obituary.source

  return (
    <>
      <JsonLd obituary={obituary} />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-[--text-muted] hover:text-[--text-secondary]">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[--text-muted]" />
            <BreadcrumbItem>
              <BreadcrumbPage
                className="text-[--text-secondary]"
                title={obituary.source.length > 40 ? obituary.source : undefined}
              >
                {truncatedSource}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ObituaryDetail obituary={obituary} />
        <ObituaryContext context={obituary.context} />
        <ObituaryNav previous={obituary.previous} next={obituary.next} />
      </div>
    </>
  )
}
