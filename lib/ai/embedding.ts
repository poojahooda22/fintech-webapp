import { embed, embedMany } from 'ai'
import { google } from '@ai-sdk/google'

// One source of truth for the fingerprint model and size. The library and the
// live question must use the SAME model and dimension, or their fingerprints
// are not comparable and search returns nothing useful.
//
// gemini-embedding-001 on Google's free tier, truncated to 1536 numbers to match
// the doc_chunks.embedding column. Cosine search is scale-invariant, so the
// truncation needs no extra normalization.
export const EMBED_MODEL = 'gemini-embedding-001'
export const EMBED_DIM = 1536

const model = google.embedding(EMBED_MODEL)
const providerOptions = { google: { outputDimensionality: EMBED_DIM } }

// Google's free tier allows 100 fingerprint requests per minute, and each
// passage counts as one. So fingerprint in groups of 100 and wait out the
// minute between groups. This only affects the one-time library fill; a live
// question is a single fingerprint, far under the limit.
const MAX_PER_BATCH = 100
const MINUTE_MS = 62_000

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function embedBatch(slice: string[]): Promise<number[][]> {
  for (let attempt = 0; ; attempt++) {
    try {
      const { embeddings } = await embedMany({ model, values: slice, providerOptions })
      return embeddings
    } catch (err) {
      if (attempt >= 2) throw err
      await sleep(MINUTE_MS) // most likely a residual per-minute limit; wait it out
    }
  }
}

/** Fingerprint many passages (used once to fill the library). Paced for the free tier. */
export async function embedTexts(
  values: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<number[][]> {
  const out: number[][] = []
  for (let i = 0; i < values.length; i += MAX_PER_BATCH) {
    if (i > 0) await sleep(MINUTE_MS)
    const embeddings = await embedBatch(values.slice(i, i + MAX_PER_BATCH))
    out.push(...embeddings)
    onProgress?.(out.length, values.length)
  }
  return out
}

/** Fingerprint a single question (used on every search). */
export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({ model, value: text, providerOptions })
  return embedding
}
