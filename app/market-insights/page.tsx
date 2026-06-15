import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Market Insights — Open Research',
  description: 'Real-time, data-driven market insights. Coming soon.',
}

export default function MarketInsightsPage() {
  return (
    <main className="max-w-page mx-auto px-xl py-4xl flex flex-col gap-3xl">
      <section className="flex flex-col gap-sm">
        <h1 className="text-display-sm font-semibold text-foreground tracking-tight">
          Market Insights
        </h1>
        <p className="text-sm text-foreground-secondary max-w-width-xl">
          Real-time reads on liquidity, market structure, sentiment, and policy shifts, delivered as
          short, data-driven notes. This is the next surface we build.
        </p>
      </section>

      <div className="rounded-xl border border-primary bg-background-secondary px-xl py-5xl flex flex-col items-center gap-md text-center">
        <span className="w-12 h-12 rounded-full bg-background-active flex items-center justify-center">
          <Newspaper className="w-5 h-5 stroke-[1.6] text-foreground-secondary" />
        </span>
        <span className="text-base font-semibold text-foreground">In the works</span>
        <p className="text-xs text-foreground-muted max-w-width-sm">
          Global Research is live now. Market Insights builds on the same open data and citation
          discipline, focused on what is moving today rather than the standing analysis.
        </p>
      </div>
    </main>
  )
}
