'use client'

import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen} className="group border-b border-border">
      <Collapsible.Trigger className="flex w-full items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Content className="data-[state=closed]:overflow-hidden data-[state=open]:overflow-visible data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="px-4 pb-4">
          {children}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
