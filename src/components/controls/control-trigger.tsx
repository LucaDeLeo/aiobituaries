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
 * Position fixed in bottom-right corner.
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
          'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg',
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
