import { Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SearchBar } from '@/components/dashboard/SearchBar'

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-primary bg-background-header-surface">
      <div className="h-full max-w-page mx-auto px-xl flex items-center justify-between gap-xl">
        <SearchBar />

        <div className="flex items-center gap-md shrink-0">
          <button
            type="button"
            title="Notifications"
            className="w-7 h-7 inline-flex items-center justify-center rounded-sm text-foreground-secondary hover:bg-background-hover hover:text-foreground transition-colors duration-200 cursor-pointer"
          >
            <Bell className="w-4 h-4 stroke-[1.6]" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
