import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { AreaChart } from '@/components/dashboard/AreaChart'
import { ProvenanceLine } from '@/components/dashboard/Provenance'
import { Disclaimer } from '@/components/dashboard/Disclaimer'
import { getReport, REPORTS } from '@/lib/research/reports'
import { getUsdFx, type FxResult } from '@/lib/sources/frankfurter'
import { getPublicDebt, type DebtResult } from '@/lib/sources/treasury'
import { fmtNum, fmtSignedPct, fmtUsdTrillions } from '@/lib/format'
import { cn } from '@/lib/utils'

export function generateStaticParams() {
  return REPORTS.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const report = getReport(slug)
  return {
    title: report ? `${report.title} — Open Research` : 'Report — Open Research',
    description: report?.summary,
  }
}

function FxBlock({ fx }: { readonly fx: FxResult }) {
  const up = fx.strengthChangePct >= 0
  return (
    <section className="rounded-xl border border-primary bg-background-secondary p-xl flex flex-col gap-lg">
      <div className="flex items-end justify-between gap-xl flex-wrap">
        <div className="flex flex-col gap-xxs">
          <span className="text-xs text-foreground-muted">
            USD strength (proxy vs EUR, GBP, JPY)
          </span>
          <span className="text-display-xs font-semibold text-foreground tracking-tight">
            {fmtNum(fx.strengthLatest)}
          </span>
          <span
            className={cn(
              'text-xs font-medium',
              up ? 'text-foreground-success' : 'text-foreground-error',
            )}
          >
            {fmtSignedPct(fx.strengthChangePct)} over the past 6 months
          </span>
        </div>
        <div className="flex gap-xl text-xs">
          <div className="flex flex-col">
            <span className="text-foreground-muted text-xxs">EUR per USD</span>
            <span className="font-medium text-foreground">{fmtNum(fx.latest.EUR, 4)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground-muted text-xxs">GBP per USD</span>
            <span className="font-medium text-foreground">{fmtNum(fx.latest.GBP, 4)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground-muted text-xxs">JPY per USD</span>
            <span className="font-medium text-foreground">{fmtNum(fx.latest.JPY, 2)}</span>
          </div>
        </div>
      </div>
      <AreaChart
        points={fx.strengthSeries}
        id="fx"
        className="h-32"
        colorClass={up ? 'text-foreground-success' : 'text-foreground-error'}
      />
      <ProvenanceLine {...fx.provenance} />
    </section>
  )
}

function DebtBlock({ debt }: { readonly debt: DebtResult }) {
  return (
    <section className="rounded-xl border border-primary bg-background-secondary p-xl flex flex-col gap-lg">
      <div className="flex flex-col gap-xxs">
        <span className="text-xs text-foreground-muted">Total U.S. public debt</span>
        <span className="text-display-xs font-semibold text-foreground tracking-tight">
          {fmtUsdTrillions(debt.latestTotal)}
        </span>
        {debt.changePctYoY != null && (
          <span className="text-xs font-medium text-foreground-secondary">
            {fmtSignedPct(debt.changePctYoY)} over the past year
          </span>
        )}
      </div>
      <AreaChart points={debt.series} id="debt" className="h-32" colorClass="text-foreground-brand" />
      <ProvenanceLine {...debt.provenance} />
    </section>
  )
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const report = getReport(slug)
  if (!report) notFound()

  const fx = report.live === 'fx' ? await getUsdFx() : null
  const debt = report.live === 'debt' ? await getPublicDebt() : null
  const liveRequestedButMissing = Boolean(report.live) && !fx && !debt

  return (
    <main className="max-w-page-narrow mx-auto px-xl py-5xl flex flex-col gap-4xl">
        <Link
          href="/global-research"
          className="inline-flex items-center gap-xs text-xs text-foreground-secondary hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.6]" /> Back to Global Research
        </Link>

        <header className="flex flex-col gap-md">
          <Badge variant="brand">{report.category}</Badge>
          <h1 className="text-display-sm font-semibold text-foreground tracking-tight">
            {report.title}
          </h1>
          <p className="text-sm text-foreground-secondary leading-relaxed">{report.summary}</p>
        </header>

        {fx && <FxBlock fx={fx} />}
        {debt && <DebtBlock debt={debt} />}
        {liveRequestedButMissing && (
          <p className="text-xs text-foreground-muted">
            Live data is temporarily unavailable right now. The analysis below stands on its own.
          </p>
        )}

        {report.keyPoints && report.keyPoints.length > 0 && (
          <section className="rounded-xl border border-primary bg-background-secondary p-xl flex flex-col gap-md">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Key takeaways
            </span>
            <ul className="flex flex-col gap-sm">
              {report.keyPoints.map((point) => (
                <li key={point.slice(0, 32)} className="flex gap-md text-sm text-foreground-secondary leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground-brand" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <article className="flex flex-col gap-xl">
          {report.body.map((para) => (
            <p key={para.slice(0, 24)} className="text-sm text-foreground-secondary leading-relaxed">
              {para}
            </p>
          ))}
        </article>

        {report.sources && report.sources.length > 0 && (
          <section className="flex flex-col gap-md">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Sources and further reading
            </span>
            <ul className="flex flex-col gap-sm">
              {report.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-md rounded-lg border border-primary bg-background-secondary px-lg py-md hover:bg-background-secondary-hover transition-colors"
                  >
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-foreground-muted group-hover:text-foreground-brand transition-colors" />
                    <span className="flex flex-col gap-xxs min-w-0">
                      <span className="text-sm text-foreground group-hover:text-foreground-brand transition-colors leading-snug">
                        {s.title}
                      </span>
                      <span className="text-xxs text-foreground-muted truncate">
                        {s.publisher}
                        {s.date ? ` · ${s.date}` : ''}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="flex flex-col gap-md pt-xl border-t border-primary">
          <span className="text-xxs text-foreground-muted">Primary source: {report.source}</span>
          <Disclaimer />
        </footer>
    </main>
  )
}
