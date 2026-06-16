'use client'

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUp, ArrowUpRight, Plus, Mic, X, Play, Square, ChevronDown, Check } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ASSISTANT_MODELS, DEFAULT_MODEL } from '@/lib/ai/models'
import { cn } from '@/lib/utils'

interface Source {
  readonly n: number
  readonly kind: 'library' | 'web'
  readonly title: string
  readonly url: string
  readonly category?: string
  readonly domain?: string
}

interface Turn {
  id: string
  question: string
  answer: string
  sources: Source[]
  done: boolean
  images?: readonly string[]
}

const STARTERS = [
  'Why are long-term US bond yields rising?',
  'What is driving the dollar in 2026?',
  'How concentrated is the S&P 500 right now?',
  'What is happening with private credit?',
]

// History lives in the browser, so it survives refreshes and return visits on
// this device. Per-account history that syncs across devices arrives with login.
const HISTORY_KEY = 'open-research:ask-history'
const MODEL_KEY = 'open-research:ask-model'

function formatRecordTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Decorative animated bars shown while recording (matches the create-node look).
function LiveWaveform() {
  return (
    <span className="flex h-4 items-center gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span
          key={i}
          className="w-0.5 rounded-full bg-foreground-error motion-safe:animate-pulse"
          style={{ height: `${35 + ((i * 37) % 60)}%`, animationDelay: `${i * 80}ms` }}
        />
      ))}
    </span>
  )
}

// Static bars shown for a finished clip.
function StaticWaveform() {
  const bars = [40, 70, 30, 90, 50, 65, 35, 80, 45, 60, 30, 72, 48]
  return (
    <span className="flex h-4 items-center gap-0.5" aria-hidden>
      {bars.map((h, i) => (
        <span key={i} className="w-0.5 rounded-full bg-foreground-muted" style={{ height: `${h}%` }} />
      ))}
    </span>
  )
}

// Compact dropdown to choose which model answers, through the gateway.
function ModelPicker({ value, onChange }: { readonly value: string; readonly onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])
  const current = ASSISTANT_MODELS.find((m) => m.id === value) ?? ASSISTANT_MODELS[0]
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose model"
        title="Choose model"
        className="inline-flex items-center gap-xxs rounded-md px-sm py-1 text-xs text-foreground-muted hover:bg-background-active hover:text-foreground-secondary transition-colors cursor-pointer"
      >
        {current.label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute bottom-[calc(100%+6px)] left-0 z-50 min-w-[11rem] rounded-lg border border-primary bg-background-secondary p-xs shadow-lg">
          {ASSISTANT_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChange(m.id)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between gap-sm rounded-md px-sm py-1.5 text-left text-xs transition-colors cursor-pointer',
                m.id === value
                  ? 'bg-background-active text-foreground'
                  : 'text-foreground-secondary hover:bg-background-secondary-hover hover:text-foreground',
              )}
            >
              {m.label}
              {m.id === value && <Check className="h-3 w-3 text-foreground-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Turn each [n] marker in the answer into a small chip that scrolls to its source card.
function renderAnswer(text: string, turnId: string): ReactNode[] {
  return text.split(/(\[\d+\])/g).map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/)
    if (!m) return <span key={i}>{part}</span>
    const n = Number(m[1])
    return (
      <button
        key={i}
        type="button"
        onClick={() => document.getElementById(`src-${turnId}-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-background-active px-1 align-top text-xxs font-medium text-foreground-brand hover:bg-background-brand hover:text-foreground-on-brand transition-colors cursor-pointer"
      >
        {n}
      </button>
    )
  })
}

// A source card: our own research links inward with its category; a live web
// result shows its domain and opens in a new tab.
function SourceCard({ source, anchorId }: { readonly source: Source; readonly anchorId: string }) {
  const cls =
    'group flex items-start gap-sm rounded-lg border border-primary bg-background px-md py-sm hover:bg-background-secondary-hover transition-colors'
  const inner = (
    <>
      <span className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-background-active px-1 text-xxs font-medium text-foreground-brand">
        {source.n}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-xxs">
        <span className="flex items-center gap-sm">
          {source.kind === 'web' ? (
            <span className="truncate text-xxs uppercase tracking-wide text-foreground-muted">
              {source.domain}
            </span>
          ) : (
            <Badge variant="brand">{source.category}</Badge>
          )}
        </span>
        <span className="text-xs leading-snug text-foreground">{source.title}</span>
      </span>
      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.6] text-foreground-muted transition-colors group-hover:text-foreground-brand" />
    </>
  )
  return source.kind === 'web' ? (
    <a id={anchorId} href={source.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link id={anchorId} href={source.url} className={cls}>
      {inner}
    </Link>
  )
}

export function AskConversation({ compact = false }: { readonly compact?: boolean }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])

  // Voice recording: same structure as the create-node mic (record, then a
  // playable clip), made real with the browser recorder and Groq transcription.
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [finalDuration, setFinalDuration] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const [model, setModel] = useState(DEFAULT_MODEL)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordedBlobRef = useRef<Blob | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const cancelledRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  // Load saved history once, on the client. Any turn interrupted mid-stream
  // (e.g. a refresh) is marked finished so it renders cleanly.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) setTurns((JSON.parse(raw) as Turn[]).map((t) => ({ ...t, done: true })))
    } catch {
      /* corrupt or unavailable storage: start fresh */
    }
    setHydrated(true)
  }, [])

  // Persist after every change, keeping the most recent 50 exchanges. Attached
  // images are dropped from storage (they are heavy and base64-bulky); the text
  // of each exchange is what the history needs.
  useEffect(() => {
    if (!hydrated) return
    try {
      const light = turns.slice(-50).map((t) => ({ ...t, images: undefined }))
      localStorage.setItem(HISTORY_KEY, JSON.stringify(light))
    } catch {
      /* storage full or unavailable: history is best-effort */
    }
  }, [turns, hydrated])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODEL_KEY)
      if (saved && ASSISTANT_MODELS.some((m) => m.id === saved)) setModel(saved)
    } catch {
      /* ignore: keep the default model */
    }
  }, [])

  // Stop the mic and clear timers if the panel unmounts mid-record.
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current)
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    },
    [],
  )

  async function ask(raw: string) {
    const question = raw.trim()
    const images = attachments
    if ((!question && images.length === 0) || busy) return
    setInput('')
    setAttachments([])
    setBusy(true)
    const id = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`
    setTurns((t) => [
      ...t,
      { id, question, answer: '', sources: [], done: false, images: images.length ? images : undefined },
    ])

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, images, model }),
      })
      const hdr = res.headers.get('x-sources')
      const sources: Source[] = hdr ? JSON.parse(atob(hdr)) : []
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, sources } : x)))

      if (!res.ok || !res.body) throw new Error('no stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let answer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        answer += decoder.decode(value, { stream: true })
        setTurns((t) => t.map((x) => (x.id === id ? { ...x, answer } : x)))
      }
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, done: true } : x)))
    } catch {
      setTurns((t) =>
        t.map((x) =>
          x.id === id
            ? { ...x, answer: x.answer || 'Something went wrong reaching the assistant. Please try again.', done: true }
            : x,
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  function onFilesPicked(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
      .filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
      .slice(0, 4)
    Promise.all(
      picked.map(
        (f) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.readAsDataURL(f)
          }),
      ),
    ).then((urls) => setAttachments((prev) => [...prev, ...urls].slice(0, 4)))
    e.target.value = ''
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  function pickModel(id: string) {
    setModel(id)
    try {
      localStorage.setItem(MODEL_KEY, id)
    } catch {
      /* ignore: choice just will not persist */
    }
  }

  async function startRecording() {
    if (isRecording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      chunksRef.current = []
      cancelledRef.current = false
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
        if (cancelledRef.current) {
          cancelledRef.current = false
          return
        }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        recordedBlobRef.current = blob
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = URL.createObjectURL(blob)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setRecordTime(0)
      setIsRecording(true)
      setHasRecording(false)
      timerRef.current = setInterval(() => setRecordTime((t) => t + 1), 1000)
    } catch {
      /* mic permission denied or unavailable: stay in the typed-input state */
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    setFinalDuration(recordTime)
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    setIsRecording(false)
    setHasRecording(true)
  }

  function clearRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      cancelledRef.current = true
      mediaRecorderRef.current.stop()
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    mediaStreamRef.current = null
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    recordedBlobRef.current = null
    setIsRecording(false)
    setHasRecording(false)
    setRecordTime(0)
    setFinalDuration(0)
  }

  function playRecording() {
    if (!audioUrlRef.current) return
    const audio = new Audio(audioUrlRef.current)
    audio.play().catch(() => {
      /* autoplay blocked: harmless */
    })
  }

  async function sendRecording() {
    const blob = recordedBlobRef.current
    if (!blob || transcribing || busy) return
    setTranscribing(true)
    try {
      const form = new FormData()
      form.append('audio', blob, 'voice.webm')
      const res = await fetch('/api/transcribe', { method: 'POST', body: form })
      const data = res.ok ? ((await res.json()) as { text?: string }) : null
      const text = typeof data?.text === 'string' ? data.text.trim() : ''
      clearRecording()
      if (text) void ask(text)
    } catch {
      clearRecording()
    } finally {
      setTranscribing(false)
    }
  }

  function handleSend() {
    if (busy || transcribing) return
    if (hasRecording) {
      void sendRecording()
      return
    }
    void ask(input)
  }

  const sendDisabled = busy || transcribing || (!input.trim() && attachments.length === 0 && !hasRecording)
  const showMicButton = !isRecording && !hasRecording

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className={cn('flex-1 overflow-y-auto', compact ? 'px-lg py-lg' : 'px-2xl py-2xl')}>
        {turns.length === 0 ? (
          <div className="flex flex-col gap-lg">
            <p className="text-sm text-foreground-secondary leading-relaxed">
              Ask anything about markets, the economy, or the financial industry. Every answer is built
              from our cited research, with the source under each line.
            </p>
            <div className="flex flex-col gap-sm">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="text-left rounded-lg border border-primary bg-background px-md py-sm text-xs text-foreground-secondary hover:bg-background-secondary-hover hover:text-foreground transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-lg">
            <div className="flex items-center justify-between">
              <span className="text-xxs uppercase tracking-wide text-foreground-muted">
                {turns.length} {turns.length === 1 ? 'question' : 'questions'} on this device
              </span>
              <button
                type="button"
                onClick={() => setTurns([])}
                className="text-xxs text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Clear history
              </button>
            </div>
            {turns.map((turn) => (
              <div key={turn.id} className="flex flex-col gap-xs">
                {/* User message: a filled row. Speaker is read from the fill alone. */}
                <div className="flex flex-col gap-sm rounded-lg bg-background-active p-md animate-in fade-in-0 slide-in-from-bottom-1 duration-200 motion-reduce:animate-none">
                  {turn.images && turn.images.length > 0 && (
                    <div className="flex flex-wrap gap-sm">
                      {turn.images.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element -- user-attached data URL, not an optimizable asset
                        <img
                          key={i}
                          src={src}
                          alt="attached context"
                          className="h-16 w-16 rounded-md border border-primary object-cover"
                        />
                      ))}
                    </div>
                  )}
                  {turn.question && (
                    <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {turn.question}
                    </p>
                  )}
                </div>

                {/* Assistant message: a transparent row, with citations and sources. */}
                <div className="flex flex-col gap-md rounded-lg p-md animate-in fade-in-0 slide-in-from-bottom-1 duration-200 motion-reduce:animate-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground-secondary">
                    {renderAnswer(turn.answer, turn.id)}
                    {!turn.done && (
                      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-foreground align-middle" />
                    )}
                  </div>

                  {turn.done && turn.sources.length > 0 && (
                    <div className="flex flex-col gap-xs pt-sm">
                      <span className="text-xxs font-medium uppercase tracking-wide text-foreground-muted">
                        Sources
                      </span>
                      {turn.sources.map((s) => (
                        <SourceCard key={s.n} source={s} anchorId={`src-${turn.id}-${s.n}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className={cn('shrink-0 border-t border-primary', compact ? 'p-md' : 'p-lg')}
      >
        {attachments.length > 0 && (
          <div className="mb-sm flex flex-wrap gap-sm">
            {attachments.map((src, i) => (
              <div key={i} className="relative h-14 w-14 overflow-hidden rounded-md border border-primary">
                {/* eslint-disable-next-line @next/next/no-img-element -- user-attached data URL, not an optimizable asset */}
                <img src={src} alt="attachment preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  aria-label="Remove image"
                  className="absolute right-0 top-0 inline-flex h-4 w-4 items-center justify-center rounded-bl-md bg-background/80 text-foreground-muted hover:text-foreground cursor-pointer"
                >
                  <X className="h-3 w-3 stroke-[2]" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col rounded-xl border border-primary bg-background focus-within:shadow-focus-ring-brand transition-shadow">
          {/* Recording in progress */}
          {isRecording && (
            <div className="flex px-sm pt-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-sm rounded-full bg-background-active px-md py-1">
                <LiveWaveform />
                <span className="text-xs font-medium text-foreground">Recording...</span>
                <span className="font-mono text-xs tabular-nums text-foreground-muted">
                  {formatRecordTime(recordTime)}
                </span>
                <button
                  type="button"
                  onClick={stopRecording}
                  aria-label="Stop recording"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground-error text-background transition-transform hover:scale-110 active:scale-90 cursor-pointer"
                >
                  <Square className="h-2.5 w-2.5" fill="currentColor" />
                </button>
                <button
                  type="button"
                  onClick={clearRecording}
                  aria-label="Cancel recording"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-foreground-muted transition-transform hover:scale-110 hover:text-foreground active:scale-90 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Finished clip, playable, before sending */}
          {!isRecording && hasRecording && (
            <div className="flex px-sm pt-sm animate-in fade-in-0 duration-200">
              <div className="flex items-center gap-sm rounded-full bg-background-active px-md py-1">
                <button
                  type="button"
                  onClick={playRecording}
                  aria-label="Play recording"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110 active:scale-90 cursor-pointer"
                >
                  <Play className="h-2.5 w-2.5" fill="currentColor" />
                </button>
                <StaticWaveform />
                <span className="font-mono text-xs tabular-nums text-foreground-muted">
                  0:00 / {formatRecordTime(finalDuration)}
                </span>
                <button
                  type="button"
                  onClick={clearRecording}
                  aria-label="Discard recording"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-foreground-muted transition-transform hover:scale-110 hover:text-foreground active:scale-90 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Top: the question input, full width. */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              hasRecording
                ? 'Recording ready. Press send to ask.'
                : transcribing
                  ? 'Transcribing your voice...'
                  : 'Ask about markets, the economy, a report...'
            }
            aria-label="Ask the research"
            disabled={isRecording || transcribing}
            className="w-full bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-foreground-muted px-md pt-md pb-xs disabled:cursor-not-allowed"
          />

          {/* Bottom: controls. Attach and model on the left, voice and send on the right. */}
          <div className="flex items-center justify-between gap-sm px-sm pb-sm pt-1">
            <div className="flex items-center gap-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add image"
                title="Add image"
                className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent text-foreground-muted hover:bg-background-active hover:text-foreground-secondary transition-transform hover:scale-105 active:scale-90 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[1.8]" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onFilesPicked}
                className="hidden"
              />
              <ModelPicker value={model} onChange={pickModel} />
            </div>
            <div className="flex items-center gap-xs">
              {showMicButton && (
                <button
                  type="button"
                  onClick={startRecording}
                  aria-label="Voice input"
                  title="Voice input"
                  className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent text-foreground-muted hover:bg-background-active hover:text-foreground-secondary transition-transform hover:scale-105 active:scale-90 cursor-pointer"
                >
                  <Mic className="h-4 w-4 stroke-[1.8]" />
                </button>
              )}
              <button
                type="submit"
                disabled={sendDisabled}
                aria-label="Send"
                className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
              >
                <ArrowUp className="h-4 w-4 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
