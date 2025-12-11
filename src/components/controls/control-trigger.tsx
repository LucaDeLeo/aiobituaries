'use client'

import { forwardRef } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ControlTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional className for positioning */
  className?: string
}

/**
 * Floating action button to trigger control sheet on tablet/mobile.
 * Position fixed in bottom-right corner with safe area awareness.
 *
 * Story TSR-5-1 enhancements:
 * - Safe area inset handling for notched devices (iPhone X+)
 * - Uses max() to ensure minimum 1.5rem + safe area offset
 * - Positioned above system gesture areas
 *
 * Note: Do NOT use size="icon" - it sets 36x36px which conflicts with FAB size.
 * FAB standard is 56x56px (h-14 w-14).
 */
export const ControlTrigger = forwardRef<HTMLButtonElement, ControlTriggerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="default"
        // NO size="icon" - conflicts with h-14 w-14 (icon gives 36x36, FAB needs 56x56)
        className={cn(
          'fixed z-40 h-14 w-14 rounded-full shadow-lg',
          // Safe area aware positioning - min 1.5rem or safe-area + 0.5rem
          'right-6 bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.5rem))]',
          'lg:hidden', // Hidden on desktop
          className
        )}
        aria-label="Open controls"
        {...props}
      >
        <SlidersHorizontal className="h-6 w-6" />
      </Button>
    )
  }
)
ControlTrigger.displayName = 'ControlTrigger'
