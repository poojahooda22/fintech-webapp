'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { searchReports } from '@/lib/research/search'
import { REPORTS } from '@/lib/research/reports'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fire ~150ms after typing pauses, not on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 150)
    return () => clearTimeout(t)
  }, [query])

  const results = useMemo(() => searchReports(debounced, REPORTS, 8), [debounced])

  useEffect(() => {
    setActiveIdx(0)
  }, [results])

  // Close when clicking outside the search box.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const go = useCallback(
    (slug: string) => {
      setOpen(false)
      setQuery('')
      setDebounced('')
      router.push(`/research/${slug}`)
    },
    [router],
  )

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const hit = results[activeIdx]
      if (hit) go(hit.report.slug)
    }
  }

  const showPanel = open && debounced.trim().length > 0

  return (
    <div ref={rootRef} className="relative hidden md:block flex-1 max-w-width-sm">
      <div className="flex items-center gap-sm h-8 px-md rounded-md border border-primary bg-background-secondary text-foreground-muted focus-within:shadow-focus-ring-brand transition-shadow">
        <Search className="w-4 h-4 stroke-[1.6] shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search reports, sectors, sources..."
          aria-label="Search research"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-foreground-muted"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('')
              setDebounced('')
            }}
            className="shrink-0 text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 stroke-[1.8]" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 rounded-lg border border-primary bg-background-secondary shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="px-lg py-md text-xs text-foreground-muted">
              No research matches “{debounced.trim()}”.
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-xs">
              {results.map((hit, i) => (
                <li key={hit.report.slug}>
                  <button
                    type="button"
                    onClick={() => go(hit.report.slug)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      'w-full text-left px-lg py-md flex flex-col gap-xxs cursor-pointer transition-colors',
                      i === activeIdx ? 'bg-background-secondary-hover' : '',
                    )}
                  >
                    <span className="flex items-center gap-sm min-w-0">
                      <Badge variant="brand">{hit.report.category}</Badge>
                      <span className="text-sm text-foreground truncate">{hit.report.title}</span>
                    </span>
                    <span className="text-xxs text-foreground-muted truncate">{hit.snippet}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
