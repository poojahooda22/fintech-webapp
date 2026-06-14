import type { SeriesPoint } from '@/lib/sources/types'
import { cn } from '@/lib/utils'

// Dependency-free responsive SVG area chart. Color comes from the surrounding
// text color (currentColor), so callers tint it with a token text class.
export function AreaChart({
  points,
  id,
  className,
  colorClass = 'text-foreground-brand',
}: {
  readonly points: readonly SeriesPoint[]
  readonly id: string
  readonly className?: string
  readonly colorClass?: string
}) {
  if (points.length < 2) return null

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 100
  const H = 32
  const stepX = W / (points.length - 1)

  const coords = points.map((p, i) => {
    const x = i * stepX
    const y = H - ((p.value - min) / range) * (H - 2) - 1
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  const gradId = `area-grad-${id}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn('block w-full', colorClass, className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} stroke="none" />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
