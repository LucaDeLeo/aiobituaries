'use client'

import { cn } from '@/lib/utils'
import { X, Check, AlertCircle } from 'lucide-react'
import type { Toast as ToastType } from '@/hooks/use-toast'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const variants = {
    default: 'bg-[--bg-card] border-[--border]',
    success: 'bg-[--bg-card] border-[#7B9E89]',
    destructive: 'bg-[--bg-card] border-red-500',
  }

  const icons = {
    default: null,
    success: <Check className="w-4 h-4 text-[#7B9E89]" />,
    destructive: <AlertCircle className="w-4 h-4 text-red-500" />,
  }

  const variant = toast.variant || 'default'

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'animate-in slide-in-from-right-full',
        variants[variant]
      )}
      role="alert"
    >
      {icons[variant] && (
        <span className="flex-shrink-0 mt-0.5">{icons[variant]}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[--text-primary]">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-[--text-muted] mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-[--text-muted] hover:text-[--text-primary] transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
