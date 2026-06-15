'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface TabItem {
  readonly id: string
  readonly label: string
  readonly content: ReactNode
}

// Bouncy, responsive morph for the active-tab underline.
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

  const rowRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef(new Map<string, HTMLButtonElement>())
  const [bar, setBar] = useState({ x: 0, width: 0 })

  // Measure the active tab's real pixel offset and width within the row, so the
  // underline glides to an exact position. Accurate even inside the horizontal
  // scroll container, where the auto layout projection drifts.
  useLayoutEffect(() => {
    const btn = btnRefs.current.get(active as string)
    if (btn) setBar({ x: btn.offsetLeft, width: btn.offsetWidth })
  }, [active, tabs])

  // Keep the underline aligned when the row resizes (responsive, font load).
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const ro = new ResizeObserver(() => {
      const btn = btnRefs.current.get(active as string)
      if (btn) setBar({ x: btn.offsetLeft, width: btn.offsetWidth })
    })
    ro.observe(row)
    return () => ro.disconnect()
  }, [active])

  return (
    <div className={className}>
      <div className="overflow-x-auto no-scrollbar border-b border-primary">
        <div ref={rowRef} className="relative flex items-center gap-xs w-max">
          {tabs.map((tab) => {
            const on = tab.id === active
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) btnRefs.current.set(tab.id, el)
                  else btnRefs.current.delete(tab.id)
                }}
                type="button"
                onClick={() => setActive(tab.id)}
                className={cn(
                  'relative h-9 px-lg text-sm whitespace-nowrap cursor-pointer',
                  'transition-colors duration-200 focus-visible:outline-none',
                  on
                    ? 'text-foreground font-semibold'
                    : 'text-foreground-muted hover:text-foreground-secondary font-medium',
                )}
              >
                {tab.label}
              </button>
            )
          })}
          <motion.span
            className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-foreground"
            initial={false}
            animate={{ x: bar.x, width: bar.width }}
            transition={MORPH_SPRING}
          />
        </div>
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
