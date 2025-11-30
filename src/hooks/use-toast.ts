'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'destructive'
  duration?: number
}

type ToastInput = Omit<Toast, 'id'>

let toastCount = 0

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return toastCount.toString()
}

// Global toast state
let toastListeners: ((toasts: Toast[]) => void)[] = []
let toastState: Toast[] = []

function dispatch(toasts: Toast[]) {
  toastState = toasts
  toastListeners.forEach((listener) => listener(toasts))
}

export function toast(props: ToastInput) {
  const id = genId()
  const newToast: Toast = { ...props, id, duration: props.duration ?? 3000 }

  dispatch([...toastState, newToast])

  // Auto dismiss
  setTimeout(() => {
    dispatch(toastState.filter((t) => t.id !== id))
  }, newToast.duration)

  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastState)

  // Subscribe to toast updates
  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToasts(newToasts)
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  const dismiss = useCallback((toastId: string) => {
    dispatch(toastState.filter((t) => t.id !== toastId))
  }, [])

  return {
    toasts,
    toast,
    dismiss,
  }
}
