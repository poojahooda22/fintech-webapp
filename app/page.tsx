import { TopBar } from '@/components/dashboard/TopBar'
import { StatCard } from '@/components/dashboard/StatCard'
import { Tabs, type TabItem } from '@/components/dashboard/Tabs'
import { ResearchCard } from '@/components/dashboard/ResearchCard'
import { Disclaimer } from '@/components/dashboard/Disclaimer'
import { CATEGORIES, reportsByCategory } from '@/lib/research/reports'
import { getUsdFx } from '@/lib/sources/frankfurter'
import { getPublicDebt } from '@/lib/sources/treasury'
import { fmtNum, fmtSignedPct, fmtUsdTrillions } from '@/lib/format'

interface Stat {
  label: string
  value: string
  delta: string
  up: boolean
  source: string
}

function placeholder(label: string): Stat {
  return { label, value: '—', delta: 'live data unavailable', up: true, source: 'source: pending' }
}

function buildStats(
  fx: Awaited<ReturnType<typeof getUsdFx>>,
  debt: Awaited<ReturnType<typeof getPublicDebt>>,
): Stat[] {
  return [
    fx
      ? {
          label: 'USD strength (proxy)',
          value: fmtNum(fx.strengthLatest),
          delta: `${fmtSignedPct(fx.strengthChangePct)} 6m`,
          up: fx.strengthChangePct >= 0,
          source: 'source: Frankfurter / ECB, open',
        }
      : placeholder('USD strength (proxy)'),
    debt
      ? {
          label: 'US public debt',
          value: fmtUsdTrillions(debt.latestTotal),
          delta: debt.changePctYoY != null ? `${fmtSignedPct(debt.changePctYoY)} 1y` : 'live',
          up: true,
          source: 'source: U.S. Treasury, public domain',
        }
      : placeholder('US public debt'),
    fx
      ? {
          label: 'EUR per USD',
          value: fmtNum(fx.latest.EUR, 4),
          delta: `${fmtSignedPct(fx.changePct.EUR)} 6m`,
          up: fx.changePct.EUR >= 0,
          source: 'source: Frankfurter / ECB, open',
        }
      : placeholder('EUR per USD'),
    fx
      ? {
          label: 'JPY per USD',
          value: fmtNum(fx.latest.JPY, 2),
          delta: `${fmtSignedPct(fx.changePct.JPY)} 6m`,
          up: fx.changePct.JPY >= 0,
          source: 'source: Frankfurter / ECB, open',
        }
      : placeholder('JPY per USD'),
  ]
}

export default async function Home() {
  const [fx, debt] = await Promise.all([getUsdFx(), getPublicDebt()])
  const stats = buildStats(fx, debt)

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
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="max-w-page mx-auto px-xl py-5xl flex flex-col gap-5xl">
        <section className="flex flex-col gap-sm">
          <h1 className="text-display-md font-semibold text-foreground tracking-tight">
            The world of markets, open to everyone
          </h1>
          <p className="text-sm text-foreground-secondary max-w-width-xl">
            Global research and market insights, rebuilt from the world&rsquo;s open data and
            elite academic research, free for every investor. Every number carries its source.
          </p>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-xl">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </section>

        <section className="flex flex-col gap-xl">
          <div className="flex items-end justify-between gap-xl">
            <div className="flex flex-col gap-xxs">
              <h2 className="text-lg font-semibold text-foreground">Global Research</h2>
              <p className="text-xs text-foreground-muted">
                Deep, analyst-grade research across asset classes. Click any report to read it.
              </p>
            </div>
            {/* <span className="hidden sm:inline-flex text-xxs text-foreground-muted whitespace-nowrap">
              Cited. Neutral. Open.
            </span> */}
          </div>
          <Tabs tabs={researchTabs} />
        </section>

        <footer className="pt-xl border-t border-primary">
          <Disclaimer />
        </footer>
      </main>
    </div>
  )
}
