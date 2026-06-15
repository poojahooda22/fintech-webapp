import { ExternalLink } from 'lucide-react'
import type { Source } from '@/lib/research/reports'

export function SourcesList({ sources }: { readonly sources: readonly Source[] }) {
  if (sources.length === 0) return null
  return (
    <section className="flex flex-col gap-md">
      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
        Sources and further reading
      </span>
      <ul className="flex flex-col gap-sm">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-md rounded-lg border border-primary bg-background-secondary px-lg py-md hover:bg-background-secondary-hover transition-colors"
            >
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-foreground-muted group-hover:text-foreground-brand transition-colors" />
              <span className="flex flex-col gap-xxs min-w-0">
                <span className="text-sm text-foreground group-hover:text-foreground-brand transition-colors leading-snug">
                  {s.title}
                </span>
                <span className="text-xxs text-foreground-muted truncate">
                  {s.publisher}
                  {s.date ? ` · ${s.date}` : ''}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
