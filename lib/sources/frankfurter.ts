import type { Provenance, SeriesPoint } from './types'

// Frankfurter: free, no key, ECB reference rates. We compute a simple USD
// strength proxy (rebased to 100 at the window start, averaged over EUR, GBP,
// JPY). It is NOT the official DXY; the UI labels it as a proxy.
const BASE = 'https://api.frankfurter.dev/v1'
const CCYS = ['EUR', 'GBP', 'JPY'] as const
type Ccy = (typeof CCYS)[number]

export interface FxResult {
  readonly latest: Readonly<Record<Ccy, number>>
  readonly latestDate: string
  /** USD strength proxy over the window (100 = window start). */
  readonly strengthSeries: readonly SeriesPoint[]
  readonly strengthLatest: number
  readonly strengthChangePct: number
  /** Percent change of each currency vs USD across the window. */
  readonly changePct: Readonly<Record<Ccy, number>>
  readonly provenance: Provenance
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
}

export async function getUsdFx(): Promise<FxResult | null> {
  try {
    const start = isoDaysAgo(180)
    const url = `${BASE}/${start}..?base=USD&symbols=${CCYS.join(',')}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const json = (await res.json()) as {
      rates?: Record<string, Record<string, number>>
    }
    const rates = json.rates
    if (!rates) return null

    const dates = Object.keys(rates).sort()
    if (dates.length < 2) return null

    const first = rates[dates[0]]
    const strengthSeries: SeriesPoint[] = dates.map((d) => {
      const row = rates[d]
      const ratios = CCYS.map((c) =>
        first[c] ? row[c] / first[c] : 1,
      )
      const idx = (ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100
      return { date: d, value: idx }
    })

    const latestDate = dates[dates.length - 1]
    const latest = rates[latestDate] as Record<Ccy, number>
    const strengthLatest = strengthSeries[strengthSeries.length - 1].value
    const strengthChangePct = strengthLatest - 100
    const pct = (c: Ccy) => (first[c] ? (latest[c] / first[c] - 1) * 100 : 0)

    return {
      latest: { EUR: latest.EUR, GBP: latest.GBP, JPY: latest.JPY },
      latestDate,
      strengthSeries,
      strengthLatest,
      strengthChangePct,
      changePct: { EUR: pct('EUR'), GBP: pct('GBP'), JPY: pct('JPY') },
      provenance: {
        source: 'Frankfurter (ECB reference rates)',
        license: 'Open data, attribution',
        url: 'https://frankfurter.dev',
        frequency: 'Daily close',
        asOf: latestDate,
      },
    }
  } catch {
    // Fail soft: the report page renders its written body without the live
    // chart rather than crashing. We never fake a value.
    return null
  }
}
