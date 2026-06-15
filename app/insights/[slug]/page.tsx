import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/dashboard/Disclaimer'
import { KeyTakeaways } from '@/components/dashboard/KeyTakeaways'
import { SourcesList } from '@/components/dashboard/SourcesList'
import { LiveSeriesBlock } from '@/components/dashboard/LiveSeriesBlock'
import { getInsight, INSIGHTS } from '@/lib/insights/insights'
import { getFredById } from '@/lib/sources/fred'
import { INSIGHT_FRED } from '@/lib/sources/liveFred'

export function generateStaticParams() {
  return INSIGHTS.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const insight = getInsight(slug)
  return {
    title: insight ? `${insight.title} · Open Research` : 'Market Insight · Open Research',
    description: insight?.summary,
  }
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const insight = getInsight(slug)
  if (!insight) notFound()

  const fredId = INSIGHT_FRED[insight.slug]
  const fred = fredId ? await getFredById(fredId) : null

  return (
    <main className="max-w-page-narrow mx-auto px-xl py-5xl flex flex-col gap-4xl">
      <Link
        href="/market-insights"
        className="inline-flex items-center gap-xs text-xs text-foreground-secondary hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.6]" /> Back to Market Insights
      </Link>

      <header className="flex flex-col gap-md">
        <Badge variant="brand">{insight.category}</Badge>
        <h1 className="text-display-sm font-semibold text-foreground tracking-tight">
          {insight.title}
        </h1>
        <p className="text-sm text-foreground-secondary leading-relaxed">{insight.summary}</p>
      </header>

      {fred && <LiveSeriesBlock data={fred} />}

      {insight.keyPoints && <KeyTakeaways points={insight.keyPoints} />}

      <article className="flex flex-col gap-xl">
        {insight.body.map((para) => (
          <p key={para.slice(0, 24)} className="text-sm text-foreground-secondary leading-relaxed">
            {para}
          </p>
        ))}
      </article>

      {insight.sources && <SourcesList sources={insight.sources} />}

      <footer className="flex flex-col gap-md pt-xl border-t border-primary">
        <span className="text-xxs text-foreground-muted">Primary source: {insight.source}</span>
        <Disclaimer />
      </footer>
    </main>
  )
}
