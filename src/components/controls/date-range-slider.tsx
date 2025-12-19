'use client'

import * as Slider from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'
import { getMaxDataYear } from '@/data/ai-metrics'

// Date range constraints - P1.3 fix: derive MAX_YEAR from actual data
const MIN_YEAR = 1950
const MAX_YEAR = getMaxDataYear()

export interface DateRangeSliderProps {
  /** Current date range [startYear, endYear] */
  value: [number, number]
  /** Callback when range changes (called during drag) */
  onValueChange: (range: [number, number]) => void
  /** Optional className for container */
  className?: string
}

/**
 * DateRangeSlider - Dual-handle slider for selecting AI progress era
 *
 * Controls the Y-axis domain (which years of AI compute progress are visible).
 * Does NOT filter obituaries by date - it adjusts the vertical scale to show
 * AI progress data from the selected year range.
 *
 * Values update immediately during drag for responsive UI, while
 * URL updates are debounced by the parent state hook.
 *
 * @example
 * ```tsx
 * const { dateRange, setDateRange } = useVisualizationState()
 *
 * <DateRangeSlider
 *   value={dateRange}
 *   onValueChange={setDateRange}
 * />
 * ```
 */
export function DateRangeSlider({
  value,
  onValueChange,
  className,
}: DateRangeSliderProps) {
  const yearSpan = value[1] - value[0]
  const yearLabel = yearSpan === 1 ? '1 year' : `${yearSpan} years`

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Current range display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {value[0]} - {value[1]}
        </span>
        <span className="text-xs text-muted-foreground">{yearLabel}</span>
      </div>

      {/* Slider */}
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={value}
        onValueChange={(v) => onValueChange(v as [number, number])}
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
        minStepsBetweenThumbs={1}
      >
        <Slider.Track className="bg-muted relative grow rounded-full h-1.5">
          <Slider.Range className="absolute bg-primary rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className={cn(
            'block h-4 w-4 rounded-full bg-background border-2 border-primary',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'hover:bg-accent transition-colors',
            'cursor-grab active:cursor-grabbing'
          )}
          aria-label="Start year"
        />
        <Slider.Thumb
          className={cn(
            'block h-4 w-4 rounded-full bg-background border-2 border-primary',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'hover:bg-accent transition-colors',
            'cursor-grab active:cursor-grabbing'
          )}
          aria-label="End year"
        />
      </Slider.Root>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{MIN_YEAR}</span>
        <span>{MAX_YEAR}</span>
      </div>
    </div>
  )
}
