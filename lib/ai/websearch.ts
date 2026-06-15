// Live web search via Tavily. Given a question, returns a handful of fresh web
// results (title, link, and the scraped gist of each page) to ground the answer
// alongside our own cited research. Returns [] if no key or on any failure, so
// the assistant degrades to library-only rather than breaking.

const TAVILY_URL = 'https://api.tavily.com/search'

export interface WebResult {
  readonly title: string
  readonly url: string
  readonly content: string
}

export async function webSearch(query: string, maxResults = 5): Promise<WebResult[]> {
  const key = process.env.TAVILY_API_KEY
  if (!key) return []
  try {
    const res = await fetch(TAVILY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: 'basic',
        topic: 'general',
        include_answer: false,
        include_raw_content: false,
      }),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { results?: Array<{ title?: unknown; url?: unknown; content?: unknown }> }
    if (!Array.isArray(data.results)) return []
    return data.results
      .map((r) => ({ title: String(r.title ?? ''), url: String(r.url ?? ''), content: String(r.content ?? '') }))
      .filter((r) => r.url && r.content)
  } catch {
    return []
  }
}
