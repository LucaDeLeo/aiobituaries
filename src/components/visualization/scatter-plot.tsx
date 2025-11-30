'use client'

import { useMemo } from 'react'
import { ParentSize } from '@visx/responsive'
import { scaleTime, scaleLinear } from '@visx/scale'
import { AxisBottom } from '@visx/axis'
import { GridColumns } from '@visx/grid'
import { Group } from '@visx/group'
import type { ObituarySummary } from '@/types/obituary'

export interface ScatterPlotProps {
  data: ObituarySummary[]
  height?: number
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 20 }

// Exported for testing purposes
export function ScatterPlotInner({
  data,
  width,
  height,
}: {
  data: ObituarySummary[]
  width: number
  height: number
}) {
  // Compute inner dimensions
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom)

  // Compute scales with useMemo
  const xScale = useMemo(() => {
    if (data.length === 0) {
      return scaleTime({
        domain: [new Date('2020-01-01'), new Date()],
        range: [0, innerWidth],
      })
    }
    const dates = data.map((d) => new Date(d.date))
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    // Add padding to domain
    const padding = (maxDate.getTime() - minDate.getTime()) * 0.05
    return scaleTime({
      domain: [
        new Date(minDate.getTime() - padding),
        new Date(maxDate.getTime() + padding),
      ],
      range: [0, innerWidth],
    })
  }, [data, innerWidth])

  const yScale = useMemo(() => {
    return scaleLinear({
      domain: [0, 1],
      range: [innerHeight, 0],
    })
  }, [innerHeight])

  // Suppress unused variable warning - yScale is prepared for Story 3.2
  void yScale

  // Empty state
  if (data.length === 0) {
    return (
      <svg width={width} height={height} data-testid="scatter-plot">
        <rect width={width} height={height} fill="var(--bg-secondary)" />
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fill="var(--text-muted)"
          className="text-sm"
        >
          No obituaries yet
        </text>
      </svg>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      data-testid="scatter-plot"
      role="img"
      aria-label={`Interactive timeline of ${data.length} AI obituaries`}
    >
      {/* Background */}
      <rect width={width} height={height} fill="var(--bg-secondary)" />

      <Group left={MARGIN.left} top={MARGIN.top}>
        {/* Grid lines at year intervals */}
        <GridColumns
          scale={xScale}
          height={innerHeight}
          stroke="var(--border)"
          strokeOpacity={0.3}
          strokeDasharray="2,2"
        />

        {/* X-axis (time) */}
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="var(--border)"
          tickStroke="var(--border)"
          tickLabelProps={() => ({
            fill: 'var(--text-secondary)',
            fontSize: 11,
            textAnchor: 'middle' as const,
            dy: '0.25em',
          })}
          numTicks={Math.min(innerWidth / 100, 10)}
        />

        {/* Data points will be rendered in Story 3.2 */}
      </Group>
    </svg>
  )
}

export function ScatterPlot({ data, height }: ScatterPlotProps) {
  return (
    <div
      className="w-full min-h-[300px] md:min-h-[400px]"
      data-testid="scatter-plot-container"
      style={{ height: height || 'auto' }}
    >
      <ParentSize>
        {({ width, height: parentHeight }) => (
          <ScatterPlotInner
            data={data}
            width={width}
            height={height || Math.max(parentHeight, 300)}
          />
        )}
      </ParentSize>
    </div>
  )
}
