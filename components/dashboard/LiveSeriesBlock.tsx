import { AreaChart } from '@/components/dashboard/AreaChart'
import { ProvenanceLine } from '@/components/dashboard/Provenance'
import type { FredResult } from '@/lib/sources/fred'

function formatValue(v: number, format: FredResult['format']): string {
  switch (format) {
    case 'pct':
      return `${v.toFixed(2)}%`
    case 'usd':
      return `$${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    case 'usdTril':
      return `$${(v / 1_000_000).toFixed(2)}T`
    default:
      return v.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
}

// One live data series rendered as a green area chart with its latest value,
// one-year change, and an openable source line. Shared by report and insight
// detail pages.
export function LiveSeriesBlock({ data }: { readonly data: FredResult }) {
  const up = (data.change === 'abs' ? data.changeAbs : data.changePct) >= 0
  const deltaStr =
    data.change === 'abs'
      ? `${up ? '+' : ''}${data.changeAbs.toFixed(2)}${data.format === 'pct' ? '%' : ''}`
      : `${up ? '+' : ''}${data.changePct.toFixed(1)}%`

  return (
    <section className="rounded-xl border border-primary bg-background-secondary p-xl flex flex-col gap-lg">
      <div className="flex flex-col gap-xxs">
        <span className="text-xs text-foreground-muted">{data.label}</span>
        <span className="text-display-xs font-semibold text-foreground tracking-tight">
          {formatValue(data.latest, data.format)}
        </span>
        <span className="text-xs font-medium text-foreground-secondary">
          {deltaStr} over the past year
        </span>
      </div>
      <AreaChart points={data.series} id={data.id} className="h-32" />
      <ProvenanceLine {...data.provenance} />
    </section>
  )
}
