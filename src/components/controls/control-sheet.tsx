'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ControlPanelWrapper } from './control-panel-wrapper'
import { ControlTrigger } from './control-trigger'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { cn } from '@/lib/utils'

export interface ControlSheetProps {
  /** Total obituary count for stats */
  totalCount: number
  /** Optional: control open state externally */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Responsive control sheet for tablet and mobile.
 *
 * - Tablet (768-1023px): Sheet from right, 320px wide
 * - Mobile (<768px): Sheet from bottom, 80vh max height
 *
 * Uses SINGLE Sheet with dynamic `side` prop based on viewport.
 * FAB is positioned outside Sheet to avoid dual-trigger issues.
 *
 * IMPORTANT: Do NOT use two Sheet instances with shared state.
 * Sheet portals render to document.body - both would animate when opened.
 */
export function ControlSheet({ totalCount, open, onOpenChange }: ControlSheetProps) {
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
            isMobile
              ? 'h-[80vh] max-h-[80vh] rounded-t-xl pb-safe'
              : 'w-[320px]'
          )}
        >
          {/* SheetHeader visible, only SheetTitle/Description are sr-only for a11y */}
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="sr-only">Visualization Controls</SheetTitle>
            <SheetDescription className="sr-only">
              Filter and configure visualization options
            </SheetDescription>
          </SheetHeader>

          {/* Drag handle indicator - mobile only */}
          {isMobile && (
            <div className="flex justify-center pt-1 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>
          )}

          <ControlPanelWrapper
            totalCount={totalCount}
            variant={panelVariant}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
