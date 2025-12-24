'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Decorative element */}
        <div className="flex items-center justify-center gap-4 mb-6" aria-hidden="true">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--accent-primary)]/30" />
          <span className="text-[var(--accent-primary)]/60 text-2xl">&#x2620;</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--accent-primary)]/30" />
        </div>

        <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-primary)] mb-4">
          Something went wrong
        </h1>

        <p className="text-[var(--text-secondary)] mb-8">
          An unexpected error occurred. The irony of a site about failed predictions
          experiencing a failure is not lost on us.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[var(--accent-primary)] text-[var(--bg-primary)] font-medium rounded-lg hover:bg-[var(--accent-primary)]/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-[var(--border)] text-[var(--text-secondary)] font-medium rounded-lg hover:border-[var(--accent-primary)]/50 hover:text-[var(--text-primary)] transition-colors"
          >
            Go home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-[var(--text-muted)] font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
