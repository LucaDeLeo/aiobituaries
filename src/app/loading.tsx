/**
 * Root loading state shown during page transitions.
 * Provides visual feedback while content is being fetched.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated loading indicator */}
        <div className="relative">
          <div className="w-8 h-8 border-2 border-[var(--border)] rounded-full" />
          <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-[var(--accent-primary)] rounded-full animate-spin" />
        </div>
        <p className="text-sm text-[var(--text-muted)] font-mono">Loading...</p>
      </div>
    </div>
  )
}
