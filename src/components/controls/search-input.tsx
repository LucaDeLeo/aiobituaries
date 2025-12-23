'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchInputProps {
  /** Current search query value */
  value: string
  /** Callback when search query changes */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Optional className */
  className?: string
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number
}

/**
 * SearchInput - Debounced search input for filtering obituaries
 *
 * Features:
 * - Debounced URL updates to avoid excessive history entries
 * - Clear button when search has content
 * - Accessible with proper labels
 *
 * @example
 * ```tsx
 * const { searchQuery, setSearchQuery } = useVisualizationState()
 *
 * <SearchInput
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search claims, sources..."
 * />
 * ```
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search claims, sources...',
  className,
  debounceMs = 300,
}: SearchInputProps) {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync local value with external value (e.g., URL changes)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)

    // Debounce URL updates
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      onChange(newValue)
    }, debounceMs)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Clear on Escape
    if (e.key === 'Escape' && localValue) {
      e.preventDefault()
      handleClear()
    }
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className={cn('relative', className)}>
      <label htmlFor="obituary-search" className="sr-only">
        Search obituaries
      </label>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          id="obituary-search"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full pl-9 pr-9 py-2 text-sm',
            'bg-background border border-border rounded-md',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            'transition-colors'
          )}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'p-1 rounded-sm',
              'text-muted-foreground hover:text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
