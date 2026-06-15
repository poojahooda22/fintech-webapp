import type { Metadata } from 'next'
import { Tabs, type TabItem } from '@/components/dashboard/Tabs'
import { ResearchCard } from '@/components/dashboard/ResearchCard'
import { Disclaimer } from '@/components/dashboard/Disclaimer'
import { INSIGHT_CATEGORIES, insightsByCategory } from '@/lib/insights/insights'

export const metadata: Metadata = {
  title: 'Market Insights · Open Research',
  description:
    'Timely, cited reads on what is moving across markets, wealth, private capital, surveys, and the financial industry.',
}

export default function MarketInsightsPage() {
  const tabs: TabItem[] = INSIGHT_CATEGORIES.map((category) => {
    const items = insightsByCategory(category)
    return {
      id: category,
      label: category,
      content:
        items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {items.map((i) => (
              <ResearchCard
                key={i.slug}
                href={`/insights/${i.slug}`}
                slug={i.slug}
                category={i.category}
                title={i.title}
                summary={i.summary}
                source={i.source}
                date={i.date}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground-muted">
            Fresh insights for this topic are being compiled.
          </p>
        ),
    }
  })

  return (
    <main className="max-w-page mx-auto px-xl py-4xl flex flex-col gap-3xl">
      <section className="flex flex-col gap-sm">
        <h1 className="text-display-sm font-semibold text-foreground tracking-tight">
          Market Insights
        </h1>
        <p className="text-sm text-foreground-secondary max-w-width-xl">
          Timely, cited reads on what is moving across markets, wealth, private capital, surveys, and
          the financial industry. Shorter and faster than Global Research, and every note links to
          its source.
        </p>
      </section>

      <Tabs tabs={tabs} />
    </main>
  )
}
