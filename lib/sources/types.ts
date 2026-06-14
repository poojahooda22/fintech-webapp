// Provenance travels with every series we ingest (the data-integrity rule:
// store source + license + frequency + as-of per series so the UI can show
// "source: X, license Y" under every chart, and we can prove it is open).
export interface Provenance {
  readonly source: string
  readonly license: string
  readonly url: string
  readonly frequency: string
  readonly asOf: string
}

export interface SeriesPoint {
  readonly date: string
  readonly value: number
}
