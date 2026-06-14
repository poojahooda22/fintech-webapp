import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-background-brand-solid text-foreground-on-brand hover:bg-background-brand-solid-hover',
  secondary:
    'bg-background border border-primary text-foreground-secondary hover:bg-background-hover hover:text-foreground',
  ghost:
    'text-foreground-secondary hover:bg-background-hover hover:text-foreground',
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { readonly variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-sm h-9 px-xl rounded-sm text-sm font-medium',
        'transition-colors duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:shadow-focus-ring-brand',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
