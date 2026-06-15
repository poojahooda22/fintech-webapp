'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LineChart, Newspaper, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  readonly href: string
  readonly label: string
  readonly icon: LucideIcon
}

const NAV: readonly NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/global-research', label: 'Global Research', icon: LineChart },
  { href: '/market-insights', label: 'Market Insights', icon: Newspaper },
]

export function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside className="hidden md:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r border-primary bg-background-sidenav-surface">
      <Link href="/" className="h-14 flex items-center gap-md px-lg border-b border-primary shrink-0">
        <span className="w-7 h-7 rounded-md bg-background-brand-solid flex items-center justify-center">
          <span className="text-foreground-on-brand text-sm font-bold">O</span>
        </span>
        <span className="font-display text-base font-semibold text-foreground tracking-tight">
          Open Research
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-xl px-md flex flex-col gap-xxs">
        <span className="px-md pb-xs text-xxs uppercase tracking-wide text-foreground-muted">
          Platform
        </span>
        {NAV.map((item) => {
          const on = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-md px-md py-sm rounded-sm text-sm transition-colors',
                'focus-visible:outline-none focus-visible:shadow-focus-ring-brand-xs',
                on
                  ? 'bg-background-active text-foreground font-medium'
                  : 'text-foreground-tertiary hover:bg-background-hover hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4 stroke-[1.6] shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-lg py-lg border-t border-primary shrink-0">
        <span className="text-xxs text-foreground-muted leading-relaxed">
          Cited. Neutral. Open. Educational, not advice.
        </span>
      </div>
    </aside>
  )
}
