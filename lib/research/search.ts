import { REPORTS, type Report } from './reports'

export interface SearchHit {
  readonly report: Report
  readonly score: number
  readonly snippet: string
}

interface WeightedField {
  readonly text: string
  readonly weight: number
}

// Where a term matches matters: a hit in the title counts far more than a hit
// deep in the body. This is the small, in-memory version of the relevance
// weighting a real search engine formalizes as field boosting.
function fields(r: Report): WeightedField[] {
  return [
    { text: r.title, weight: 10 },
    { text: r.category, weight: 6 },
    { text: r.summary, weight: 4 },
    { text: (r.keyPoints ?? []).join(' '), weight: 3 },
    { text: (r.sources ?? []).map((s) => s.publisher).join(' '), weight: 2 },
    { text: r.body.join(' '), weight: 1 },
  ]
}

function snippetFor(r: Report, token: string): string {
  const haystack = [r.summary, ...(r.keyPoints ?? []), ...r.body]
  const t = token.toLowerCase()
  for (const s of haystack) {
    const i = s.toLowerCase().indexOf(t)
    if (i >= 0) {
      const start = Math.max(0, i - 40)
      const end = Math.min(s.length, i + 90)
      return (start > 0 ? '…' : '') + s.slice(start, end).trim() + (end < s.length ? '…' : '')
    }
  }
  return r.summary.slice(0, 130)
}

/**
 * Rank reports against a free-text query. Every whitespace-separated term must
 * appear somewhere (AND semantics), and the score sums the field weight of each
 * term's strongest field hit, so title and category matches float to the top.
 */
export function searchReports(query: string, limit = 8): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)

  const hits: SearchHit[] = []
  for (const r of REPORTS) {
    const fs = fields(r).map((f) => ({ weight: f.weight, lower: f.text.toLowerCase() }))
    let score = 0
    let allMatched = true
    for (const tok of tokens) {
      let best = 0
      for (const f of fs) if (f.lower.includes(tok)) best = Math.max(best, f.weight)
      if (best === 0) {
        allMatched = false
        break
      }
      score += best
    }
    if (!allMatched) continue
    hits.push({ report: r, score, snippet: snippetFor(r, tokens[0]) })
  }

  hits.sort((a, b) => b.score - a.score)
  return hits.slice(0, limit)
}
