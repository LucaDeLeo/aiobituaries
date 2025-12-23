'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getAllMetricsAtDate, getFrontierModelAtDate } from '@/data/ai-metrics'
import type { ContextMetadata } from '@/types/context'

interface ObituaryContextProps {
  context: ContextMetadata | null | undefined
  /** Date of the obituary for computing AI metrics when CMS context unavailable */
  date: string
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
 * Shows AI metrics (computed from date) and optional market data from CMS.
 *
 * Primary data source: AI metrics computed from Epoch AI data (always available)
 * Secondary data source: CMS context (stock prices, milestones, notes)
 *
 * Handles partial CMS data gracefully - only renders CMS fields when available.
 */
export function ObituaryContext({ context, date }: ObituaryContextProps) {
  // Compute AI metrics from the obituary date
  const aiMetrics = useMemo(() => {
    const dateObj = new Date(date)
    const metrics = getAllMetricsAtDate(dateObj)
    const model = getFrontierModelAtDate(dateObj)
    return { ...metrics, frontierModel: model }
  }, [date])

  // Check if any CMS context data exists
  const hasCmsData = context && (
    context.nvdaPrice !== undefined ||
    context.msftPrice !== undefined ||
    context.googPrice !== undefined ||
    context.benchmarkName !== undefined ||
    context.currentModel !== undefined ||
    context.milestone !== undefined ||
    context.note !== undefined
  )

  // Check if any stock prices exist
  const hasStockPrices = context && (
    context.nvdaPrice !== undefined ||
    context.msftPrice !== undefined ||
    context.googPrice !== undefined
  )

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Context at Time
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* AI Metrics Card - Always available (computed from date) */}
        <Card className="bg-[var(--bg-card)] border-[var(--border)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[var(--text-secondary)]">
              AI Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Training Compute</span>
              <span className="text-[var(--text-primary)] font-mono">
                {aiMetrics.computeFormatted} FLOP
              </span>
            </div>
            {aiMetrics.mmlu !== null && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">MMLU Score</span>
                <span className="text-[var(--accent-primary)] font-mono">
                  {aiMetrics.mmlu}%
                </span>
              </div>
            )}
            {aiMetrics.eci !== null && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Capability Index</span>
                <span className="text-[var(--text-primary)] font-mono">
                  {aiMetrics.eci}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Frontier Model Card - Always available (computed from date) */}
        {aiMetrics.frontierModel && (
          <Card className="bg-[var(--bg-card)] border-[var(--border)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">
                Frontier Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-primary)] font-medium">
                {aiMetrics.frontierModel.model}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {aiMetrics.frontierModel.org}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stock Prices Card - Optional CMS data */}
        {hasStockPrices && context && (
          <Card className="bg-[var(--bg-card)] border-[var(--border)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">
                Stock Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {context.nvdaPrice !== undefined && (
                <p className="text-[var(--text-primary)]">
                  NVDA: {formatCurrency(context.nvdaPrice)}
                </p>
              )}
              {context.msftPrice !== undefined && (
                <p className="text-[var(--text-primary)]">
                  MSFT: {formatCurrency(context.msftPrice)}
                </p>
              )}
              {context.googPrice !== undefined && (
                <p className="text-[var(--text-primary)]">
                  GOOG: {formatCurrency(context.googPrice)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Latest AI Model Card - Optional CMS data (redundant with computed, but CMS may have more detail) */}
        {context?.currentModel && (
          <Card className="bg-[var(--bg-card)] border-[var(--border)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">
                Model Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-primary)]">{context.currentModel}</p>
            </CardContent>
          </Card>
        )}

        {/* Benchmark Card - Optional CMS data */}
        {context?.benchmarkName && (
          <Card className="bg-[var(--bg-card)] border-[var(--border)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">
                Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-primary)]">
                {context.benchmarkName}
                {context.benchmarkScore !== undefined && (
                  <span className="ml-2 text-[var(--accent-primary)] font-mono">
                    {context.benchmarkScore}%
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {/* AI Milestone Card - Optional CMS data */}
        {context?.milestone && (
          <Card className="bg-[var(--bg-card)] border-[var(--border)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">
                AI Milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-primary)]">{context.milestone}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Note - outside card grid */}
      {context?.note && (
        <p className="mt-4 text-sm text-[var(--text-muted)] italic">
          {context.note}
        </p>
      )}
    </section>
  )
}
