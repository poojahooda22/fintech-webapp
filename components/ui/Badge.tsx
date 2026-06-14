import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'brand' | 'success' | 'error' | 'warning' | 'neutral'

const VARIANTS: Record<BadgeVariant, string> = {
  brand: 'bg-background-brand text-foreground-brand',
  success: 'bg-background-success text-foreground-success',
  error: 'bg-background-error text-foreground-error',
  warning: 'bg-background-warning text-foreground-warning',
  neutral: 'bg-background-secondary-alt text-foreground-secondary',
}

export function Badge({
  variant = 'neutral',
  className,
  children,
}: {
  readonly variant?: BadgeVariant
  readonly className?: string
  readonly children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-md py-xxs text-xxs font-medium',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
