import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export interface ResearchCardProps {
  readonly slug: string
  readonly category: string
  readonly title: string
  readonly summary: string
  readonly source: string
  readonly date: string
  /** Destination for the card. Defaults to the Global Research report route. */
  readonly href?: string
  /** Show a pulsing "Live" indicator instead of the date when this page has a live chart. */
  readonly live?: boolean
}

export function ResearchCard({
  slug,
  category,
  title,
  summary,
  source,
  date,
  href,
  live,
}: ResearchCardProps) {
  return (
    <Link
      href={href ?? `/research/${slug}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:shadow-focus-ring-brand"
    >
      <Card className="group h-full p-xl flex flex-col gap-md hover:bg-background-secondary-hover transition-colors duration-200">
        <div className="flex items-center justify-between">
          <Badge variant="brand">{category}</Badge>
          <ArrowUpRight className="w-4 h-4 stroke-[1.6] text-foreground-muted group-hover:text-foreground-brand transition-colors duration-200" />
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug">{title}</h3>
        <p className="text-xs text-foreground-secondary leading-relaxed">{summary}</p>
        <div className="flex items-center justify-between gap-md mt-auto pt-md border-t border-primary">
          <span className="text-xs text-foreground-muted truncate">source: {source}</span>
          {live ? (
            <span className="inline-flex items-center gap-xs text-xs font-medium text-foreground-success whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground-success animate-pulse" />
              Live
            </span>
          ) : (
            <span className="text-xs text-foreground-muted whitespace-nowrap">{date}</span>
          )}
        </div>
      </Card>
    </Link>
  )
}
