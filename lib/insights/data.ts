import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase/client'
import { INSIGHTS, type Insight, type InsightCategory } from './insights'

// Same newspaper pattern as reports: one cached database read serves everyone,
// the bundled INSIGHTS array is the fallback so a database hiccup never blanks
// the page.

interface InsightRow {
  readonly slug: string
  readonly category: string
  readonly title: string
  readonly summary: string
  readonly key_points: string[] | null
  readonly body: string[] | null
  readonly sources: unknown
  readonly source: string
  readonly date: string
  readonly position: number | null
}

function toInsight(row: InsightRow): Insight {
  const keyPoints =
    Array.isArray(row.key_points) && row.key_points.length ? row.key_points : undefined
  const sources =
    Array.isArray(row.sources) && row.sources.length
      ? (row.sources as Insight['sources'])
      : undefined
  return {
    slug: row.slug,
    category: row.category as InsightCategory,
    title: row.title,
    summary: row.summary,
    keyPoints,
    body: Array.isArray(row.body) ? row.body : [],
    sources,
    source: row.source,
    date: row.date,
  }
}

async function fetchInsights(): Promise<Insight[]> {
  if (!supabase) return [...INSIGHTS]
  try {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .order('position', { ascending: true, nullsFirst: false })
      .order('slug', { ascending: true })
    if (error) {
      console.warn('[insights] database read failed, serving bundled fallback:', error.message)
      return [...INSIGHTS]
    }
    if (!data || data.length === 0) {
      console.warn('[insights] database returned no rows, serving bundled fallback')
      return [...INSIGHTS]
    }
    return (data as InsightRow[]).map(toInsight)
  } catch (err) {
    console.warn('[insights] database threw, serving bundled fallback:', err)
    return [...INSIGHTS]
  }
}

/** All insights, ordered by curated position. Cached and revalidated. */
export const getInsights = unstable_cache(fetchInsights, ['insights-all'], {
  revalidate: 300,
  tags: ['insights'],
})

export async function getInsightBySlug(slug: string): Promise<Insight | undefined> {
  return (await getInsights()).find((i) => i.slug === slug)
}
