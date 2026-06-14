'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  readonly id: string
  readonly label: string
  readonly content: ReactNode
}

/**
 * Simple underline-filled tabs mirroring the rare-lab tab look: the active tab
 * carries the brand underline; inactive tabs are muted and brighten on hover.
 */
export function Tabs({
  tabs,
  className,
}: {
  readonly tabs: readonly TabItem[]
  readonly className?: string
}) {
  const [active, setActive] = useState(tabs[0]?.id)
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <div className={className}>
      <div className="flex items-center gap-xs border-b border-primary overflow-x-auto overflow-y-hidden">
        {tabs.map((tab) => {
          const on = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                'relative h-9 px-xl -mb-px border-b-2 text-sm font-medium whitespace-nowrap',
                'transition-colors duration-150 cursor-pointer focus-visible:outline-none',
                on
                  ? 'text-foreground border-fg-brand-alt'
                  : 'text-foreground-secondary border-transparent hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="pt-4xl">{current?.content}</div>
    </div>
  )
}
