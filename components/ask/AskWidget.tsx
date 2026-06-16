'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, X, Maximize2 } from 'lucide-react'
import { AskConversation } from './AskConversation'

// The floating Ask surface: a pinned button on every page that opens a chat
// panel in place, with a link out to the full Ask page. It hides itself on the
// dedicated Ask page, where the full conversation is already on screen.
export function AskWidget() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  if (pathname === '/ask') return null

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-sm h-11 px-lg rounded-full bg-foreground text-background text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:shadow-focus-ring-brand cursor-pointer"
          aria-label="Ask the research assistant"
        >
          <Sparkles className="h-4 w-4 stroke-[1.8]" />
          Ask
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[70vh] max-h-[640px] w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-primary bg-background-secondary shadow-2xl">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-primary px-lg">
            <span className="flex items-center gap-sm text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 stroke-[1.8] text-foreground-brand" />
              Ask the research
            </span>
            <div className="flex items-center gap-xs">
              <Link
                href="/ask"
                onClick={() => setOpen(false)}
                title="Open full page"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-background-hover hover:text-foreground transition-colors"
              >
                <Maximize2 className="h-4 w-4 stroke-[1.6]" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-background-hover hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[1.6]" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <AskConversation compact />
          </div>
        </div>
      )}
    </>
  )
}
