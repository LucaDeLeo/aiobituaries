import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ContextMetadata } from '@/types/context'

interface ObituaryContextProps {
  context: ContextMetadata | null | undefined
}

/**
 * Format a number as USD currency.
 * Uses Intl.NumberFormat for proper locale-aware formatting.
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

/**
 * Contextual data display component for obituary detail pages.
 * Shows market data (stock prices), AI model, benchmark scores,
 * milestones, and notes from the time the claim was made.
 *
 * Handles partial data gracefully - only renders available fields.
 * Shows empty state when no context data exists.
 */
export function ObituaryContext({ context }: ObituaryContextProps) {
  // Handle null/undefined context from CMS
  if (!context) {
    return (
      <section className="mt-12 pt-8 border-t border-[--border]">
        <h2 className="text-lg font-semibold text-[--text-primary] mb-4">
          Context at Time
        </h2>
        <p className="text-[--text-muted]">Context data unavailable</p>
      </section>
    )
  }

  // Check if any context data exists
  const hasAnyData =
    context.nvdaPrice !== undefined ||
    context.msftPrice !== undefined ||
    context.googPrice !== undefined ||
    context.benchmarkName !== undefined ||
    context.currentModel !== undefined ||
    context.milestone !== undefined ||
    context.note !== undefined

  // Empty state: no context data available
  if (!hasAnyData) {
    return (
      <section className="mt-12 pt-8 border-t border-[--border]">
        <h2 className="text-lg font-semibold text-[--text-primary] mb-4">
          Context at Time
        </h2>
        <p className="text-[--text-muted]">Context data unavailable</p>
      </section>
    )
  }

  // Check if any stock prices exist
  const hasStockPrices =
    context.nvdaPrice !== undefined ||
    context.msftPrice !== undefined ||
    context.googPrice !== undefined

  return (
    <section className="mt-12 pt-8 border-t border-[--border]">
      <h2 className="text-lg font-semibold text-[--text-primary] mb-4">
        Context at Time
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Stock Prices Card */}
        {hasStockPrices && (
          <Card className="bg-[--bg-card] border-[--border]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[--text-secondary]">
                Stock Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {context.nvdaPrice !== undefined && (
                <p className="text-[--text-primary]">
                  NVDA: {formatCurrency(context.nvdaPrice)}
                </p>
              )}
              {context.msftPrice !== undefined && (
                <p className="text-[--text-primary]">
                  MSFT: {formatCurrency(context.msftPrice)}
                </p>
              )}
              {context.googPrice !== undefined && (
                <p className="text-[--text-primary]">
                  GOOG: {formatCurrency(context.googPrice)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Latest AI Model Card */}
        {context.currentModel && (
          <Card className="bg-[--bg-card] border-[--border]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[--text-secondary]">
                Latest AI Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[--text-primary]">{context.currentModel}</p>
            </CardContent>
          </Card>
        )}

        {/* Benchmark Card */}
        {context.benchmarkName && (
          <Card className="bg-[--bg-card] border-[--border]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[--text-secondary]">
                Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[--text-primary]">
                {context.benchmarkName}
                {context.benchmarkScore !== undefined && (
                  <span className="ml-2 text-[--accent-primary] font-mono">
                    {context.benchmarkScore}%
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* AI Milestone Card */}
        {context.milestone && (
          <Card className="bg-[--bg-card] border-[--border]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[--text-secondary]">
                AI Milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[--text-primary]">{context.milestone}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Note - outside card grid */}
      {context.note && (
        <p className="mt-4 text-sm text-[--text-muted] italic">
          {context.note}
        </p>
      )}
    </section>
  )
}
