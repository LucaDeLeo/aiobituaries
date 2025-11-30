'use client'

import { useToast } from '@/hooks/use-toast'
import { Toast } from './toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}
