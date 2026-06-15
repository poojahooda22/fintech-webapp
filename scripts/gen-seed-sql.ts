import { writeFileSync } from 'node:fs'
import { REPORTS } from '../lib/research/reports'
import { INSIGHTS } from '../lib/insights/insights'

// Emits supabase/seed.sql as idempotent upserts. Run that file once in the
// Supabase SQL Editor (it runs as postgres, so no service key is needed).
const q = (s: unknown) => `'${String(s ?? '').replace(/'/g, "''")}'`
const arr = (a: readonly string[] | undefined) =>
  a && a.length ? `ARRAY[${a.map(q).join(',')}]::text[]` : `ARRAY[]::text[]`
const jsonb = (v: unknown) => `${q(JSON.stringify(v ?? []))}::jsonb`

// position carries the curated array order into the database, so "latest" and
// category groupings render in the same order the editor laid out.
const reportRow = (r: (typeof REPORTS)[number], idx: number) =>
  `(${q(r.slug)},${q(r.category)},${q(r.title)},${q(r.summary)},${arr(r.keyPoints)},${arr(r.body)},${jsonb(r.sources)},${q(r.source)},${q(r.date)},${r.live ? q(r.live) : 'null'},${idx})`

const insightRow = (i: (typeof INSIGHTS)[number], idx: number) =>
  `(${q(i.slug)},${q(i.category)},${q(i.title)},${q(i.summary)},${arr(i.keyPoints)},${arr(i.body)},${jsonb(i.sources)},${q(i.source)},${q(i.date)},${idx})`

const reportUpdate =
  'category=excluded.category, title=excluded.title, summary=excluded.summary, key_points=excluded.key_points, body=excluded.body, sources=excluded.sources, source=excluded.source, date=excluded.date, live=excluded.live, position=excluded.position, updated_at=now()'
const insightUpdate =
  'category=excluded.category, title=excluded.title, summary=excluded.summary, key_points=excluded.key_points, body=excluded.body, sources=excluded.sources, source=excluded.source, date=excluded.date, position=excluded.position, updated_at=now()'

let sql = '-- Seed Open Research content. Run once in the Supabase SQL Editor. Idempotent (upsert by slug).\n\n'
// Safe on tables created before the position column existed.
sql += 'alter table public.reports  add column if not exists position int;\n'
sql += 'alter table public.insights add column if not exists position int;\n\n'
sql += 'insert into public.reports (slug,category,title,summary,key_points,body,sources,source,date,live,position) values\n'
sql += REPORTS.map(reportRow).join(',\n')
sql += `\non conflict (slug) do update set ${reportUpdate};\n\n`
sql += 'insert into public.insights (slug,category,title,summary,key_points,body,sources,source,date,position) values\n'
sql += INSIGHTS.map(insightRow).join(',\n')
sql += `\non conflict (slug) do update set ${insightUpdate};\n`

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql)
console.log(`wrote supabase/seed.sql: ${REPORTS.length} reports, ${INSIGHTS.length} insights, ${sql.length} chars`)
