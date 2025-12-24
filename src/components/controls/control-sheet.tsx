'use client'

import { useState } from 'react'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { ControlPanelWrapper } from './control-panel-wrapper'
import { ControlTrigger } from './control-trigger'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { cn } from '@/lib/utils'
import type { ObituarySummary } from '@/types/obituary'

export interface ControlSheetProps {
  /** Total obituary count for stats */
  totalCount: number
  /** Obituaries for skeptic filter derivation */
  obituaries: ObituarySummary[]
  /** Optional: control open state externally */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Responsive control sheet for tablet and mobile.
 *
 * - Tablet (768-1023px): Sheet from right, 320px wide
 * - Mobile (<768px): Sheet from bottom, 80vh max height with enhanced UX
 *
 * Uses SINGLE Sheet with dynamic `side` prop based on viewport.
 * FAB is positioned outside Sheet to avoid dual-trigger issues.
 *
 * Mobile enhancements (Story TSR-5-1):
 * - Larger drag handle with 44px+ tap target for accessibility
 * - Safe area bottom padding for notched devices (iPhone X+)
 * - Scrollable content area with overscroll containment
 * - Rounded top corners for polished appearance
 *
 * IMPORTANT: Do NOT use two Sheet instances with shared state.
 * Sheet portals render to document.body - both would animate when opened.
 */
export function ControlSheet({ totalCount, obituaries, open, onOpenChange }: ControlSheetProps) {
  // Internal state if not controlled externally
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const handleOpenChange = onOpenChange ?? setInternalOpen

  // Determine viewport - mobile is <768px (md breakpoint)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const sheetSide = isMobile ? 'bottom' : 'right'
  const panelVariant = isMobile ? 'sheet' : 'drawer'

  return (
    <>
      {/* FAB trigger - positioned OUTSIDE Sheet, hidden on desktop */}
      <ControlTrigger onClick={() => handleOpenChange(true)} />

      {/* Single Sheet with dynamic side prop */}
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side={sheetSide}
          className={cn(
            'p-0 flex flex-col',
            isMobile && [
              'h-[80vh] max-h-[80vh]',
              'rounded-t-2xl', // Polished rounded corners
              'pb-[env(safe-area-inset-bottom,16px)]', // Safe area for notched devices
            ],
            !isMobile && 'w-[320px]'
          )}
        >
          {/* Accessible title/description using Radix VisuallyHidden */}
          <VisuallyHidden.Root asChild>
            <SheetTitle>Visualization Controls</SheetTitle>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root asChild>
            <SheetDescription>
              Filter and configure visualization options
            </SheetDescription>
          </VisuallyHidden.Root>

          {/* Enhanced drag handle - mobile only */}
          {/* 44px+ tap target area with visual handle centered inside */}
          {isMobile && (
            <div
              className="flex justify-center items-center min-h-[44px] py-2 cursor-grab active:cursor-grabbing"
              aria-hidden="true"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>
          )}

          {/* Scrollable content area with overscroll containment */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <ControlPanelWrapper
              totalCount={totalCount}
              obituaries={obituaries}
              variant={panelVariant}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
