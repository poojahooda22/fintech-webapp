import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { REPORTS } from '../lib/research/reports'
import { INSIGHTS } from '../lib/insights/insights'

// Load .env.local (tsx does not auto-load it).
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false } })

const reportRows = REPORTS.map((r) => ({
  slug: r.slug,
  category: r.category,
  title: r.title,
  summary: r.summary,
  key_points: r.keyPoints ?? [],
  body: r.body,
  sources: r.sources ?? [],
  source: r.source,
  date: r.date,
  live: r.live ?? null,
}))

const insightRows = INSIGHTS.map((i) => ({
  slug: i.slug,
  category: i.category,
  title: i.title,
  summary: i.summary,
  key_points: i.keyPoints ?? [],
  body: i.body,
  sources: i.sources ?? [],
  source: i.source,
  date: i.date,
}))

const r = await db.from('reports').upsert(reportRows, { onConflict: 'slug' })
if (r.error) {
  console.error('reports upsert failed:', r.error.message)
  process.exit(1)
}
const ins = await db.from('insights').upsert(insightRows, { onConflict: 'slug' })
if (ins.error) {
  console.error('insights upsert failed:', ins.error.message)
  process.exit(1)
}

console.log(`seeded ${reportRows.length} reports, ${insightRows.length} insights`)
