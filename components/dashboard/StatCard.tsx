import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  delta,
  up,
  source,
}: {
  readonly label: string
  readonly value: string
  readonly delta: string
  readonly up: boolean
  readonly source: string
}) {
  return (
    <Card className="p-xl flex flex-col gap-md">
      <span className="text-xs text-foreground-muted">{label}</span>
      <span className="text-display-xs font-semibold text-foreground tracking-tight">
        {value}
      </span>
      <span
        className={cn(
          'inline-flex items-center gap-xxs text-xs font-medium',
          up ? 'text-foreground-success' : 'text-foreground-error',
        )}
      >
        {up ? (
          <TrendingUp className="w-3.5 h-3.5 stroke-[1.6]" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 stroke-[1.6]" />
        )}
        {delta}
      </span>
      <span className="text-xxs text-foreground-muted mt-xs">{source}</span>
    </Card>
  )
}
