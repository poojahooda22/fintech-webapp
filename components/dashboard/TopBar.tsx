import { Bell, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-primary bg-background-header-surface">
      <div className="h-full max-w-page mx-auto px-xl flex items-center justify-between gap-xl">
        <div className="flex items-center gap-md shrink-0">
          <div className="w-7 h-7 rounded-md bg-background-brand-solid flex items-center justify-center">
            <span className="text-foreground-on-brand text-sm font-bold">O</span>
          </div>
          <span className="font-display text-base font-semibold text-foreground tracking-tight">
            Open Research
          </span>
        </div>

        <div className="hidden md:flex flex-1 max-w-width-sm items-center gap-sm h-8 px-md rounded-md border border-primary bg-background-secondary text-foreground-muted">
          <Search className="w-4 h-4 stroke-[1.6]" />
          <span className="text-xs">Search companies, sectors, research...</span>
        </div>

        <div className="flex items-center gap-md shrink-0">
          <button
            type="button"
            title="Notifications"
            className="w-7 h-7 inline-flex items-center justify-center rounded-sm text-foreground-secondary hover:bg-background-hover hover:text-foreground transition-colors duration-200 cursor-pointer"
          >
            <Bell className="w-4 h-4 stroke-[1.6]" />
          </button>
          <ThemeToggle />
          <div className="w-7 h-7 rounded-full bg-background-brand text-foreground-brand flex items-center justify-center text-xs font-semibold">
            RP
          </div>
        </div>
      </div>
    </header>
  )
}
