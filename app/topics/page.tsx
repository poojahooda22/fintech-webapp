import type { Metadata } from 'next'
import Link from 'next/link'
import { TOPIC_GROUPS, slugifyTopic, topicCount } from '@/lib/topics/topics'

export const metadata: Metadata = {
  title: 'Topics · Open Research',
  description:
    'Browse research and live insights by topic, across markets, the economy, sectors, regions, and themes.',
}

export default function TopicsPage() {
  return (
    <main className="max-w-page mx-auto px-xl py-4xl flex flex-col gap-3xl">
      <section className="flex flex-col gap-sm">
        <h1 className="text-display-sm font-semibold text-foreground tracking-tight">Topics</h1>
        <p className="text-sm text-foreground-secondary max-w-width-xl">
          Every report and insight, organized by topic. Open any topic to see everything we have on
          it in one place, with the live news feed flowing in as we expand it.
        </p>
      </section>

      <div className="flex flex-col gap-3xl">
        {TOPIC_GROUPS.map((g) => (
          <section key={g.group} className="flex flex-col gap-lg">
            <h2 className="text-base font-semibold text-foreground">{g.group}</h2>
            <div className="flex flex-wrap gap-sm">
              {g.topics.map((t) => {
                const count = topicCount(t)
                return (
                  <Link
                    key={t}
                    href={`/topics/${slugifyTopic(t)}`}
                    className="group inline-flex items-center gap-sm h-8 px-md rounded-full border border-primary bg-background-secondary text-xs text-foreground-secondary hover:bg-background-secondary-hover hover:text-foreground transition-colors focus-visible:outline-none focus-visible:shadow-focus-ring-brand-xs"
                  >
                    {t}
                    {count > 0 && (
                      <span className="inline-flex items-center h-4 px-xs rounded-full bg-background-active text-xxs text-foreground-muted group-hover:text-foreground-brand">
                        {count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
