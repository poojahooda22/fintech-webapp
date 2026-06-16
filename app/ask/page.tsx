import type { Metadata } from 'next'
import { AskConversation } from '@/components/ask/AskConversation'

export const metadata: Metadata = {
  title: 'Ask · Open Research',
  description:
    'Ask anything about markets, the economy, and the financial industry. Every answer is built from our own cited research, with the source under each line.',
}

export default function AskPage() {
  return (
    <main className="max-w-page  mx-auto flex h-[calc(100vh-3.5rem)] flex flex-col gap-xl px-xl py-4xl">
      <section className="flex flex-col gap-sm">
        <h1 className="text-display-sm font-semibold tracking-tight text-foreground">Ask the research</h1>
        <p className="max-w-width-xl text-sm leading-relaxed text-foreground-secondary">
          Ask anything about markets, the economy, or the financial industry. Every answer is built
          from our cited research, with the source under each line, and it tells you plainly when the
          library does not cover something.
        </p>
      </section>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-primary bg-background-secondary">
        <AskConversation />
      </div>
    </main>
  )
}
