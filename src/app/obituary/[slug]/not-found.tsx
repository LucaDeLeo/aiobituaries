import Link from 'next/link'

/**
 * 404 Not Found page for invalid obituary slugs.
 * Displayed when notFound() is called from the page component.
 */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-serif text-[var(--text-primary)] mb-4">
        Obituary Not Found
      </h1>
      <p className="text-[var(--text-secondary)] mb-8">
        This obituary doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[var(--accent-primary)] text-[var(--bg-primary)]
                   rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Return to Homepage
      </Link>
    </div>
  )
}
