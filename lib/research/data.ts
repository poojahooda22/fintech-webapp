import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase/client'
import { REPORTS, type Report, type ReportCategory } from './reports'

// One database read serves every reader for the cache window, then refreshes,
// the same way a newspaper is printed once and handed to everyone. The bundled
// REPORTS array is the fallback, so the site never goes blank if the database
// is unreachable or momentarily empty.

interface ReportRow {
  readonly slug: string
  readonly category: string
  readonly title: string
  readonly summary: string
  readonly key_points: string[] | null
  readonly body: string[] | null
  readonly sources: unknown
  readonly source: string
  readonly date: string
  readonly live: string | null
  readonly position: number | null
}

function toReport(row: ReportRow): Report {
  const keyPoints =
    Array.isArray(row.key_points) && row.key_points.length ? row.key_points : undefined
  const sources =
    Array.isArray(row.sources) && row.sources.length
      ? (row.sources as Report['sources'])
      : undefined
  const live = row.live === 'fx' || row.live === 'debt' ? row.live : undefined
  return {
    slug: row.slug,
    category: row.category as ReportCategory,
    title: row.title,
    summary: row.summary,
    keyPoints,
    body: Array.isArray(row.body) ? row.body : [],
    sources,
    source: row.source,
    date: row.date,
    live,
  }
}

async function fetchReports(): Promise<Report[]> {
  if (!supabase) return [...REPORTS]
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('position', { ascending: true, nullsFirst: false })
      .order('slug', { ascending: true })
    if (error) {
      console.warn('[reports] database read failed, serving bundled fallback:', error.message)
      return [...REPORTS]
    }
    if (!data || data.length === 0) {
      console.warn('[reports] database returned no rows, serving bundled fallback')
      return [...REPORTS]
    }
    return (data as ReportRow[]).map(toReport)
  } catch (err) {
    console.warn('[reports] database threw, serving bundled fallback:', err)
    return [...REPORTS]
  }
}

/** All reports, ordered by curated position. Cached and revalidated. */
export const getReports = unstable_cache(fetchReports, ['reports-all'], {
  revalidate: 300,
  tags: ['reports'],
})

export async function getReportBySlug(slug: string): Promise<Report | undefined> {
  return (await getReports()).find((r) => r.slug === slug)
}
