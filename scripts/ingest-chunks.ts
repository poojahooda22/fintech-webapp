// Step 2 of the assistant: fill the searchable library.
// Chops every report and insight into passages, fingerprints each with OpenAI,
// and writes them into public.doc_chunks. Re-running replaces the contents.
//
//   npx tsx scripts/ingest-chunks.ts
//
// Writing into the database needs the service_role (secret) key, because the
// public key is read-only by design. The guard below refuses to spend a cent on
// embeddings until that key is present, so a wrong key costs nothing.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { embedTexts } from '../lib/ai/embedding'
import { REPORTS } from '../lib/research/reports'
import { INSIGHTS } from '../lib/insights/insights'

// --- load .env.local (tsx scripts do not read it automatically) ---
function loadEnvLocal() {
  const text = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
  }
}
loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GOOGLE_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY

// --- verify the write key can actually write (no OpenAI spend on a bad key) ---
function isWriteKey(token: string | undefined): boolean {
  if (!token) return false
  if (token.startsWith('sb_secret_')) return true // new-style secret key
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'))
    return payload.role === 'service_role'
  } catch {
    return false
  }
}

if (!SUPABASE_URL || !GOOGLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or GOOGLE_GENERATIVE_AI_API_KEY in .env.local.')
  process.exit(1)
}
if (!isWriteKey(SERVICE_KEY)) {
  console.error(
    '\nSUPABASE_SERVICE_ROLE_KEY is not a write key (it looks like the public read key).' +
      '\nPaste the service_role (secret) key into .env.local and re-run.' +
      '\nNothing was embedded, so no tokens were spent.\n',
  )
  process.exit(1)
}

interface Chunk {
  surface: 'report' | 'insight'
  parent_slug: string
  category: string
  title: string
  source_url: string
  chunk_index: number
  content: string
}

// One passage per summary line, per key point, and per body paragraph.
function buildChunks(): Chunk[] {
  const out: Chunk[] = []
  for (const r of REPORTS) {
    const passages = [r.summary, ...(r.keyPoints ?? []), ...r.body]
    passages.forEach((content, i) =>
      out.push({
        surface: 'report',
        parent_slug: r.slug,
        category: r.category,
        title: r.title,
        source_url: `/research/${r.slug}`,
        chunk_index: i,
        content,
      }),
    )
  }
  for (const ins of INSIGHTS) {
    const passages = [ins.summary, ...(ins.keyPoints ?? []), ...ins.body]
    passages.forEach((content, i) =>
      out.push({
        surface: 'insight',
        parent_slug: ins.slug,
        category: ins.category,
        title: ins.title,
        source_url: `/insights/${ins.slug}`,
        chunk_index: i,
        content,
      }),
    )
  }
  return out
}

async function main() {
  const chunks = buildChunks()
  console.log(`Prepared ${chunks.length} passages from ${REPORTS.length} reports + ${INSIGHTS.length} insights.`)

  // Prefix each passage with its title + category before embedding, so a lone
  // paragraph still retrieves in context. The stored text stays the raw passage.
  const inputs = chunks.map((c) => `${c.title} (${c.category}). ${c.content}`)

  console.log('Fingerprinting with Google gemini-embedding-001 (free tier, paced ~1 min per 100)...')
  const embeddings = await embedTexts(inputs, (done, total) =>
    console.log(`  fingerprinted ${done}/${total}`),
  )
  console.log(`Got ${embeddings.length} fingerprints.`)

  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!, { auth: { persistSession: false } })

  // Replace contents so re-runs are clean.
  const { error: delError } = await supabase.from('doc_chunks').delete().gte('id', 0)
  if (delError) {
    console.error('Could not clear existing chunks:', delError.message)
    process.exit(1)
  }

  const rows = chunks.map((c, i) => ({ ...c, embedding: `[${embeddings[i].join(',')}]` }))
  const BATCH = 200
  let written = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('doc_chunks').insert(slice)
    if (error) {
      console.error('Insert failed:', error.message)
      process.exit(1)
    }
    written += slice.length
    console.log(`  wrote ${written}/${rows.length}`)
  }

  const { count } = await supabase.from('doc_chunks').select('*', { count: 'exact', head: true })
  console.log(`\nDone. doc_chunks now holds ${count ?? written} passages, each with a fingerprint.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
