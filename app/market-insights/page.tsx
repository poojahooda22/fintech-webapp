import type { Metadata } from 'next'
import { Tabs, type TabItem } from '@/components/dashboard/Tabs'
import { ResearchCard } from '@/components/dashboard/ResearchCard'
import { Disclaimer } from '@/components/dashboard/Disclaimer'
import { INSIGHT_CATEGORIES } from '@/lib/insights/insights'
import { getInsights } from '@/lib/insights/data'
import { INSIGHT_FRED } from '@/lib/sources/liveFred'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Market Insights · Open Research',
  description:
    'Timely, cited reads on what is moving across markets, wealth, private capital, surveys, and the financial industry.',
}

export default async function MarketInsightsPage() {
  const insights = await getInsights()
  const tabs: TabItem[] = INSIGHT_CATEGORIES.map((category) => {
    const items = insights.filter((i) => i.category === category)
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
                live={Boolean(INSIGHT_FRED[i.slug])}
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
