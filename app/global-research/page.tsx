import type { Metadata } from 'next'
import { Tabs, type TabItem } from '@/components/dashboard/Tabs'
import { ResearchCard } from '@/components/dashboard/ResearchCard'
import { CATEGORIES } from '@/lib/research/reports'
import { getReports } from '@/lib/research/data'
import { REPORT_FRED } from '@/lib/sources/liveFred'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Global Research — Open Research',
  description:
    'Deep, analyst-grade research across every asset class, rebuilt from open data and elite academic sources. Every number links to its source.',
}

export default async function GlobalResearchPage() {
  const reports = await getReports()
  const researchTabs: TabItem[] = CATEGORIES.map((category) => ({
    id: category,
    label: category,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
        {reports
          .filter((r) => r.category === category)
          .map((r) => (
          <ResearchCard
            key={r.slug}
            slug={r.slug}
            category={r.category}
            title={r.title}
            summary={r.summary}
            source={r.source}
            date={r.date}
            live={Boolean(r.live) || Boolean(REPORT_FRED[r.slug])}
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
