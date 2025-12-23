'use client'

/**
 * AIContextCell Component
 *
 * Displays AI capability context (training compute level) for a given date
 * in the obituary table. Shows:
 * - Colored dot indicating capability era
 * - Compact compute value with superscript notation (e.g., 10²⁵·³)
 * - Tooltip with full metrics breakdown
 *
 * This bridges the gap between scatter plot (visual Y-axis position)
 * and table view (no visual context).
 *
 * NOTE: Requires TooltipProvider to be wrapped at a higher level (e.g., table).
 * This avoids creating 100+ providers for 100+ rows.
 */

import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getAllMetricsAtDate } from '@/data/ai-metrics'

interface AIContextCellProps {
  /** ISO date string for the obituary */
  date: string
}

/**
 * Era color CSS variable names.
 * Using CSS custom properties for theme compatibility.
 */
const ERA_COLORS = {
  early: 'var(--text-muted)',
  preLlm: 'var(--era-pre-llm, #3b82f6)',
  gpt3: 'var(--era-gpt3, #8b5cf6)',
  frontier: 'var(--era-frontier, #f59e0b)',
} as const

/**
 * Get color based on training compute level.
 * Maps log₁₀ FLOP to era-based colors.
 *
 * | Compute (log₁₀ FLOP) | Color  | Era              |
 * |---------------------|--------|------------------|
 * | < 20                | Gray   | Early AI (pre-2000) |
 * | 20-23               | Blue   | Pre-LLM era      |
 * | 23-25               | Purple | GPT-3 era        |
 * | > 25                | Orange | Frontier (GPT-4+)|
 */
export function getComputeColor(logFlop: number): string {
  if (logFlop < 20) return ERA_COLORS.early
  if (logFlop < 23) return ERA_COLORS.preLlm
  if (logFlop < 25) return ERA_COLORS.gpt3
  return ERA_COLORS.frontier
}

/**
 * Superscript character mapping for compact notation.
 */
const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '.': '·',
  '-': '⁻',
}

/**
 * Format compute value with superscript notation.
 * "24.3" → "10²⁴·³"
 *
 * Returns "N/A" for NaN/invalid values.
 */
export function formatComputeCompact(logFlop: number): string {
  if (!Number.isFinite(logFlop)) return 'N/A'

  const exp = logFlop.toFixed(1)
  const superExp = exp
    .split('')
    .map((c) => SUPERSCRIPTS[c] || c)
    .join('')
  return `10${superExp}`
}

/**
 * Check if a date string produces a valid Date object.
 */
function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr)
  return !Number.isNaN(d.getTime())
}

/**
 * Table cell showing AI capability context at a specific date.
 * Displays compute level with era-based coloring and detailed tooltip.
 *
 * NOTE: Requires TooltipProvider at a higher level.
 */
export function AIContextCell({ date }: AIContextCellProps) {
  const { metrics, isValid } = useMemo(() => {
    if (!isValidDate(date)) {
      return { metrics: null, isValid: false }
    }
    return { metrics: getAllMetricsAtDate(new Date(date)), isValid: true }
  }, [date])

  // Handle invalid date gracefully
  if (!isValid || !metrics) {
    return (
      <span className="text-xs text-[--text-muted]" aria-label="Invalid date">
        —
      </span>
    )
  }

  const dotColor = getComputeColor(metrics.compute)
  const compactValue = formatComputeCompact(metrics.compute)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-help">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
          <span className="font-mono text-xs text-[--text-secondary]">
            {compactValue}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-[200px]">
        <div className="text-xs space-y-1.5">
          <div className="font-medium text-[--text-primary]">
            AI Progress at this date
          </div>
          <div className="space-y-0.5 text-[--text-secondary]">
            <div>Compute: {metrics.computeFormatted} FLOP</div>
            <div>
              MMLU:{' '}
              {metrics.mmlu !== null ? `${metrics.mmlu}%` : 'Not yet measured'}
            </div>
            <div>
              ECI: {metrics.eci !== null ? metrics.eci : 'Not yet measured'}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
