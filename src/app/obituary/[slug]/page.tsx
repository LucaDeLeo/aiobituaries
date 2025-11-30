import { notFound } from 'next/navigation'
import { getObituaryBySlug, getAllObituarySlugs } from '@/lib/sanity/queries'
import { ObituaryDetail } from '@/components/obituary/obituary-detail'
import { ObituaryContext } from '@/components/obituary/obituary-context'
import { JsonLd } from '@/components/seo/json-ld'
import { generateObituaryMetadata } from '@/lib/utils/seo'

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
 * Shows 404 page if slug does not exist.
 */
export default async function ObituaryPage({ params }: PageProps) {
  const { slug } = await params
  const obituary = await getObituaryBySlug(slug)

  if (!obituary) {
    notFound()
  }

  return (
    <>
      <JsonLd obituary={obituary} />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ObituaryDetail obituary={obituary} />
        <ObituaryContext context={obituary.context} />
      </div>
    </>
  )
}
