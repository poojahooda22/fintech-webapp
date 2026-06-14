import type { Provenance, SeriesPoint } from './types'

// U.S. Treasury Fiscal Data — Debt to the Penny. Free, no key, public domain.
const BASE =
  'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny'

export interface DebtResult {
  readonly latestTotal: number
  readonly series: readonly SeriesPoint[]
  readonly changePctYoY: number | null
  readonly provenance: Provenance
}

export async function getPublicDebt(): Promise<DebtResult | null> {
  try {
    const url =
      `${BASE}?fields=record_date,tot_pub_debt_out_amt` +
      `&sort=-record_date&page[size]=370`
    const res = await fetch(url, { next: { revalidate: 21_600 } })
    if (!res.ok) return null
    const json = (await res.json()) as {
      data?: { record_date: string; tot_pub_debt_out_amt: string }[]
    }
    const rows = json.data ?? []
    if (rows.length < 2) return null

    // API returns newest first; flip to oldest -> newest for charting.
    const ascending = [...rows].reverse()
    const series: SeriesPoint[] = ascending.map((r) => ({
      date: r.record_date,
      value: Number(r.tot_pub_debt_out_amt),
    }))

    const latestTotal = series[series.length - 1].value
    const earliest = series[0].value
    const changePctYoY =
      earliest > 0 ? ((latestTotal - earliest) / earliest) * 100 : null

    return {
      latestTotal,
      series,
      changePctYoY,
      provenance: {
        source: 'U.S. Treasury Fiscal Data (Debt to the Penny)',
        license: 'Public domain (U.S. government work)',
        url: 'https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny',
        frequency: 'Daily',
        asOf: series[series.length - 1].date,
      },
    }
  } catch {
    return null
  }
}
