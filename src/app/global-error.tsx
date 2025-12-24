'use client'

/**
 * Global error boundary for root layout errors.
 * This catches errors that error.tsx cannot (e.g., root layout failures).
 * Must include its own <html> and <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{
        backgroundColor: '#0a0a0a',
        color: '#fafafa',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <h1 style={{
            fontSize: '1.5rem',
            marginBottom: '1rem',
            fontWeight: 500,
          }}>
            Something went wrong
          </h1>
          <p style={{
            color: '#a1a1a1',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#c9a227',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{
              marginTop: '2rem',
              fontSize: '0.75rem',
              color: '#666',
              fontFamily: 'monospace',
            }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
