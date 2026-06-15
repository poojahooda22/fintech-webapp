import type { Provenance, SeriesPoint } from './types'

// FRED (Federal Reserve Bank of St. Louis). Free, requires a key, public domain.
// Key is server-side only (FRED_API_KEY), never shipped to the browser. Each
// series is fetched server-side and cached (the newspaper rule).
const KEY = process.env.FRED_API_KEY
const BASE = 'https://api.stlouisfed.org/fred/series/observations'

export type FredFormat = 'pct' | 'num' | 'usd' | 'usdTril'
export type FredChange = 'abs' | 'pct'

interface FredSpec {
  readonly label: string
  readonly format: FredFormat
  readonly change: FredChange
  readonly days?: number
}

// Registry of the series we surface, keyed by FRED series id. Every id here was
// verified to return data. The source URL is derived from the id.
const FRED_SERIES: Record<string, FredSpec> = {
  T10Y2Y: { label: '10-year minus 2-year Treasury spread', format: 'pct', change: 'abs' },
  BAMLH0A0HYM2: {
    label: 'ICE BofA US High Yield option-adjusted spread',
    format: 'pct',
    change: 'abs',
  },
  SP500: { label: 'S&P 500 index', format: 'num', change: 'pct' },
  VIXCLS: { label: 'CBOE Volatility Index (VIX)', format: 'num', change: 'pct' },
  DCOILBRENTEU: { label: 'Brent crude oil (USD per barrel)', format: 'usd', change: 'pct' },
  UNRATE: { label: 'US unemployment rate', format: 'pct', change: 'abs' },
  WRESBAL: { label: 'Reserve balances at the Federal Reserve', format: 'usdTril', change: 'pct' },
  CBBTCUSD: { label: 'Bitcoin (USD)', format: 'usd', change: 'pct' },
  MORTGAGE30US: { label: 'US 30-year fixed mortgage rate', format: 'pct', change: 'abs' },
  UMCSENT: { label: 'University of Michigan Consumer Sentiment', format: 'num', change: 'pct' },
  NFCI: {
    label: 'Chicago Fed National Financial Conditions Index',
    format: 'num',
    change: 'abs',
  },
}

export interface FredResult {
  readonly id: string
  readonly label: string
  readonly format: FredFormat
  readonly change: FredChange
  readonly latest: number
  readonly changeAbs: number
  readonly changePct: number
  readonly series: readonly SeriesPoint[]
  readonly provenance: Provenance
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
}

export async function getFredById(id: string): Promise<FredResult | null> {
  const spec = FRED_SERIES[id]
  if (!spec || !KEY) return null
  try {
    const start = isoDaysAgo(spec.days ?? 365)
    const url =
      `${BASE}?series_id=${id}&api_key=${KEY}&file_type=json` +
      `&observation_start=${start}&sort_order=asc`
    const res = await fetch(url, { next: { revalidate: 21_600 } })
    if (!res.ok) return null
    const json = (await res.json()) as { observations?: { date: string; value: string }[] }
    // FRED marks missing observations with '.'; drop them.
    const obs = (json.observations ?? []).filter((o) => o.value !== '.')
    if (obs.length < 2) return null

    const series: SeriesPoint[] = obs.map((o) => ({ date: o.date, value: Number(o.value) }))
    const latest = series[series.length - 1].value
    const earliest = series[0].value

    return {
      id,
      label: spec.label,
      format: spec.format,
      change: spec.change,
      latest,
      changeAbs: latest - earliest,
      changePct: earliest !== 0 ? ((latest - earliest) / Math.abs(earliest)) * 100 : 0,
      series,
      provenance: {
        source: spec.label,
        license: 'Public domain (FRED, Federal Reserve Bank of St. Louis)',
        url: `https://fred.stlouisfed.org/series/${id}`,
        frequency: 'Daily to monthly',
        asOf: series[series.length - 1].date,
      },
    }
  } catch {
    // Fail soft: the page renders its written analysis without the live chart.
    return null
  }
}
