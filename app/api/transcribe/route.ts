// Voice transcription. Receives a recorded audio clip and turns it into text
// with Groq's Whisper (free tier). The chat sends the result as the question.

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY
  if (!key) return Response.json({ error: 'Voice transcription is not configured.' }, { status: 500 })

  let file: Blob | null = null
  try {
    const form = await req.formData()
    const f = form.get('audio')
    if (f instanceof Blob) file = f
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }
  if (!file) return Response.json({ error: 'No audio' }, { status: 400 })

  const type = file.type || 'audio/webm'
  const ext = type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : type.includes('wav') ? 'wav' : 'webm'

  const groqForm = new FormData()
  groqForm.append('file', file, `voice.${ext}`)
  groqForm.append('model', 'whisper-large-v3-turbo')
  groqForm.append('response_format', 'json')

  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}` },
      body: groqForm,
    })
    if (!res.ok) return Response.json({ error: 'Transcription failed' }, { status: 502 })
    const data = (await res.json()) as { text?: unknown }
    return Response.json({ text: typeof data.text === 'string' ? data.text.trim() : '' })
  } catch {
    return Response.json({ error: 'Transcription failed' }, { status: 502 })
  }
}
