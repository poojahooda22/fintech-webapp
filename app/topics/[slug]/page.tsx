import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ResearchCard } from '@/components/dashboard/ResearchCard'
import { Disclaimer } from '@/components/dashboard/Disclaimer'
import { ALL_TOPICS, slugifyTopic, topicFromSlug, getTopicMatches } from '@/lib/topics/topics'
import { REPORT_FRED, INSIGHT_FRED } from '@/lib/sources/liveFred'

export function generateStaticParams() {
  return ALL_TOPICS.map((t) => ({ slug: slugifyTopic(t) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const topic = topicFromSlug(slug)
  return {
    title: topic ? `${topic} · Open Research` : 'Topic · Open Research',
    description: topic ? `Research and insights on ${topic}.` : undefined,
  }
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const topic = topicFromSlug(slug)
  if (!topic) notFound()

  const { reports, insights } = getTopicMatches(topic)
  const total = reports.length + insights.length

  return (
    <main className="max-w-page mx-auto px-xl py-4xl flex flex-col gap-3xl">
      <Link
        href="/topics"
        className="inline-flex items-center gap-xs text-xs text-foreground-secondary hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.6]" /> All topics
      </Link>

      <section className="flex flex-col gap-sm">
        <h1 className="text-display-sm font-semibold text-foreground tracking-tight">{topic}</h1>
        <p className="text-sm text-foreground-secondary max-w-width-xl">
          {total > 0
            ? `${total} ${total === 1 ? 'piece' : 'pieces'} of research and insight on ${topic}, across both tabs.`
            : `We are expanding coverage on ${topic}. Live news and notes on this topic arrive with the news feed.`}
        </p>
      </section>

      {total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
          {reports.map((r) => (
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
          {insights.map((i) => (
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
      )}

    </main>
  )
}
