'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  className?: string
}

export function CopyButton({ className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = window.location.href

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: 'Link copied to clipboard',
        description: 'Share this obituary with others.',
        variant: 'success',
        duration: 3000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: "Couldn't copy link",
        description: 'Try selecting the URL manually from the address bar.',
        variant: 'destructive',
        duration: 5000,
      })
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
        'border border-[--border] bg-transparent',
        'text-[--text-secondary] text-sm font-medium',
        'hover:border-[--accent-primary] hover:text-[--accent-primary]',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[--accent-primary] focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[--bg-primary]',
        'transition-colors',
        className
      )}
    >
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Link2 className="w-4 h-4" />
      )}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}
