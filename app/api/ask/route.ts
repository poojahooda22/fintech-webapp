import { groq } from '@ai-sdk/groq'
import { gateway } from '@ai-sdk/gateway'
import { streamText, type LanguageModel } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { embedQuery } from '@/lib/ai/embedding'
import { webSearch } from '@/lib/ai/websearch'
import { MODEL_IDS, DEFAULT_MODEL } from '@/lib/ai/models'

// The answer endpoint. On every question it searches BOTH our own cited research
// and the live web, blends the sources, and streams a grounded, cited answer.
// Generation goes through the Vercel AI Gateway (the model the user picked) when
// a gateway key is set; otherwise it falls back to an open model on Groq.

export const runtime = 'nodejs'
export const maxDuration = 30

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

interface MatchRow {
  id: number
  surface: 'report' | 'insight'
  parent_slug: string
  category: string
  title: string
  source_url: string | null
  content: string
  score: number
}

const SYSTEM = `You are the research assistant for an open finance research platform.
Answer the user's question using ONLY the numbered sources provided below. Some are
our own cited research, some are live web results.

Rules:
- Use only the sources. If they do not contain the answer, say so plainly. Never invent figures.
- After each sentence that states a fact, cite the source number it came from, like [2]. Every fact carries a citation.
- When the question is about current or recent events, lean on the live web sources for the latest, and use our research for depth and context.
- You are educational. Never tell the user to buy, sell, or hold, and never give personal financial advice.
- Your scope is finance, markets, the economy, and the financial industry. Politely decline anything off topic.
- Plain language. Short paragraphs. Do not use em dashes.
<Follow-up Questions>:  After your response, suggest 3-5 follow-up questions that could help the user dig deeper into the topic. Base these questions on the context you just provided. These should encourage further exploration rather than simple yes/no answers.`

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// Search our own library: fingerprint the question, run the hybrid match.
async function retrieveLibrary(question: string): Promise<MatchRow[]> {
  if (!SUPABASE_URL || !ANON) return []
  try {
    const embedding = await embedQuery(question)
    const supabase = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } })
    const { data, error } = await supabase.rpc('match_chunks', {
      query_text: question,
      query_embedding: `[${embedding.join(',')}]`,
      match_count: 6,
    })
    return !error && Array.isArray(data) ? (data as MatchRow[]) : []
  } catch {
    return []
  }
}

export async function POST(req: Request) {
  let question = ''
  let images: string[] = []
  let modelId = DEFAULT_MODEL
  try {
    const body = await req.json()
    question = typeof body?.question === 'string' ? body.question.trim() : ''
    if (Array.isArray(body?.images)) {
      images = body.images.filter((x: unknown): x is string => typeof x === 'string').slice(0, 4)
    }
    if (typeof body?.model === 'string' && MODEL_IDS.includes(body.model)) modelId = body.model
  } catch {
    return new Response('Bad request', { status: 400 })
  }
  if (!question && images.length === 0) return new Response('Empty question', { status: 400 })

  // 1. Search our library and the live web at the same time (only when there is
  //    a text question to search on; an image-only ask skips retrieval).
  const [libraryChunks, webResults] = question
    ? await Promise.all([retrieveLibrary(question), webSearch(question, 5)])
    : [[], []]

  // 2. Merge same-report library passages into one numbered source each, then
  //    append the live web results. One shared numbering across both.
  const grouped = new Map<string, { row: MatchRow; passages: string[] }>()
  for (const c of libraryChunks) {
    const key = `${c.surface}:${c.parent_slug}`
    const hit = grouped.get(key)
    if (hit) hit.passages.push(c.content)
    else grouped.set(key, { row: c, passages: [c.content] })
  }
  const libGroups = [...grouped.values()]

  let n = 0
  const librarySources = libGroups.map((g) => ({
    n: ++n,
    kind: 'library' as const,
    title: g.row.title,
    category: g.row.category,
    url:
      g.row.source_url ??
      (g.row.surface === 'report' ? `/research/${g.row.parent_slug}` : `/insights/${g.row.parent_slug}`),
  }))
  const webSources = webResults.map((w) => ({
    n: ++n,
    kind: 'web' as const,
    title: w.title,
    domain: domainOf(w.url),
    url: w.url,
  }))
  const sources = [...librarySources, ...webSources]

  const libContext = libGroups.map(
    (g, i) => `[${i + 1}] (Our research: ${g.row.title} — ${g.row.category})\n${g.passages.join('\n')}`,
  )
  const webContext = webResults.map(
    (w, i) => `[${libGroups.length + i + 1}] (Live web: ${w.title} — ${domainOf(w.url)})\n${w.content}`,
  )
  const context = [...libContext, ...webContext].join('\n\n')

  const hasImages = images.length > 0
  const effectiveQuestion =
    question || 'Analyze the attached image in a finance context and explain what it shows.'
  const base = sources.length
    ? `Question: ${effectiveQuestion}\n\nSources:\n${context}`
    : `Question: ${effectiveQuestion}\n\n(No matching text sources were found${hasImages ? '. Answer from the attached image(s).' : '.'})`
  const userContent = hasImages
    ? `${base}\n\nThe user attached image(s). Look at them, describe and analyze what they show, and still cite any numbered sources you draw on.`
    : base

  // 3. Pick the generation model. The Vercel AI Gateway needs a credit card on
  //    file even for its free credits (it 403s without one), so it is opt-in:
  //    used only when explicitly enabled AND keyed. Otherwise the free Groq path
  //    answers, vision-capable when an image is attached.
  const useGateway = process.env.USE_AI_GATEWAY === 'true' && Boolean(process.env.AI_GATEWAY_API_KEY)
  const model: LanguageModel = useGateway
    ? gateway(modelId)
    : groq(hasImages ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile')

  // 4. Stream the grounded answer. Images ride as message parts; every listed
  //    gateway model and the Groq vision fallback can read them. Sources ride
  //    back in a header for the UI.
  const result = hasImages
    ? streamText({
        model,
        system: SYSTEM,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text' as const, text: userContent },
              ...images.map((img) => ({ type: 'image' as const, image: img })),
            ],
          },
        ],
        temperature: 0.2,
      })
    : streamText({
        model,
        system: SYSTEM,
        prompt: userContent,
        temperature: 0.2,
      })

  return result.toTextStreamResponse({
    headers: {
      'x-sources': Buffer.from(JSON.stringify(sources)).toString('base64'),
      'cache-control': 'no-store',
    },
  })
}
