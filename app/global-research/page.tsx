import type { Metadata } from 'next'
import { Tabs, type TabItem } from '@/components/dashboard/Tabs'
import { ResearchCard } from '@/components/dashboard/ResearchCard'
import { CATEGORIES, reportsByCategory } from '@/lib/research/reports'

export const metadata: Metadata = {
  title: 'Global Research — Open Research',
  description:
    'Deep, analyst-grade research across every asset class, rebuilt from open data and elite academic sources. Every number links to its source.',
}

export default function GlobalResearchPage() {
  const researchTabs: TabItem[] = CATEGORIES.map((category) => ({
    id: category,
    label: category,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
        {reportsByCategory(category).map((r) => (
          <ResearchCard
            key={r.slug}
            slug={r.slug}
            category={r.category}
            title={r.title}
            summary={r.summary}
            source={r.source}
            date={r.date}
          />
        ))}
      </div>
    ),
  }))

  return (
    <main className="max-w-page mx-auto px-xl py-4xl flex flex-col gap-3xl">
      <section className="flex flex-col gap-sm">
        <h1 className="text-display-sm font-semibold text-foreground tracking-tight">
          Global Research
        </h1>
        <p className="text-sm text-foreground-secondary max-w-width-xl">
          Deep, analyst-grade research across every asset class, rebuilt from the world&rsquo;s open
          data and elite academic sources. Click any report to read it. Every number links to its
          source.
        </p>
      </section>

      <Tabs tabs={researchTabs} />
    </main>
  )
}
