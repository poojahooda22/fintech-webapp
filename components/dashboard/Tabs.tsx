'use client'

import { useId, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface TabItem {
  readonly id: string
  readonly label: string
  readonly content: ReactNode
}

// Bouncy, responsive morph for the active-tab underline, matching the
// shared-layout indicator used across the design system.
const MORPH_SPRING = { type: 'spring' as const, stiffness: 400, damping: 35 }

export function Tabs({
  tabs,
  className,
}: {
  readonly tabs: readonly TabItem[]
  readonly className?: string
}) {
  const [active, setActive] = useState(tabs[0]?.id)
  const current = tabs.find((t) => t.id === active) ?? tabs[0]
  const indicatorId = useId()

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
                'relative h-9 px-lg -mb-px text-sm whitespace-nowrap cursor-pointer',
                'transition-colors duration-200 focus-visible:outline-none',
                on
                  ? 'text-foreground font-semibold'
                  : 'text-foreground-muted hover:text-foreground-secondary font-medium',
              )}
            >
              {tab.label}
              {on && (
                <motion.span
                  layoutId={`tab-underline-${indicatorId}`}
                  transition={MORPH_SPRING}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground"
                />
              )}
            </button>
          )
        })}
      </div>
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="pt-4xl"
      >
        {current?.content}
      </motion.div>
    </div>
  )
}
