import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { AreaChart } from '@/components/dashboard/AreaChart'
import { ProvenanceLine } from '@/components/dashboard/Provenance'
import { Disclaimer } from '@/components/dashboard/Disclaimer'
import { KeyTakeaways } from '@/components/dashboard/KeyTakeaways'
import { SourcesList } from '@/components/dashboard/SourcesList'
import { LiveSeriesBlock } from '@/components/dashboard/LiveSeriesBlock'
import { getReports, getReportBySlug } from '@/lib/research/data'
import { getUsdFx, type FxResult } from '@/lib/sources/frankfurter'
import { getPublicDebt, type DebtResult } from '@/lib/sources/treasury'
import { getFredById } from '@/lib/sources/fred'
import { REPORT_FRED } from '@/lib/sources/liveFred'
import { fmtNum, fmtSignedPct, fmtUsdTrillions } from '@/lib/format'
import { cn } from '@/lib/utils'

export const revalidate = 300

export async function generateStaticParams() {
  return (await getReports()).map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const report = await getReportBySlug(slug)
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
      <AreaChart points={fx.strengthSeries} id="fx" className="h-32" />
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
      <AreaChart points={debt.series} id="debt" className="h-32" />
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
  const report = await getReportBySlug(slug)
  if (!report) notFound()

  const fx = report.live === 'fx' ? await getUsdFx() : null
  const debt = report.live === 'debt' ? await getPublicDebt() : null
  const fredId = REPORT_FRED[report.slug]
  const fred = fredId ? await getFredById(fredId) : null
  const liveRequestedButMissing =
    (Boolean(report.live) || Boolean(fredId)) && !fx && !debt && !fred

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
        {fred && <LiveSeriesBlock data={fred} />}
        {liveRequestedButMissing && (
          <p className="text-xs text-foreground-muted">
            Live data is temporarily unavailable right now. The analysis below stands on its own.
          </p>
        )}

        {report.keyPoints && <KeyTakeaways points={report.keyPoints} />}

        <article className="flex flex-col gap-xl">
          {report.body.map((para) => (
            <p key={para.slice(0, 24)} className="text-sm text-foreground-secondary leading-relaxed">
              {para}
            </p>
          ))}
        </article>

        {report.sources && <SourcesList sources={report.sources} />}

        <footer className="flex flex-col gap-md pt-xl border-t border-primary">
          <span className="text-xxs text-foreground-muted">Primary source: {report.source}</span>
          <Disclaimer />
        </footer>
    </main>
  )
}
