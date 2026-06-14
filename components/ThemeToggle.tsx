'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

interface ThemeToggleProps {
  readonly className?: string
  /** Animation duration in ms. Default 400. */
  readonly duration?: number
}

/**
 * Light/dark toggle with a circular View Transition reveal expanding from the
 * button. Falls back to an instant switch where View Transitions are absent.
 * Mirrors the rare-lab ThemeToggle; persists to localStorage under 'theme'.
 */
export function ThemeToggle({ className, duration = 400 }: ThemeToggleProps) {
  const isDark = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current
    if (!button) return

    const applyTheme = (): void => {
      const next = isDark ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      try {
        localStorage.setItem('theme', next)
      } catch {
        /* private mode: ignore */
      }
    }

    if (typeof document.startViewTransition !== 'function') {
      applyTheme()
      return
    }

    const { top, left, width, height } = button.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    )

    const transition = document.startViewTransition(() => {
      flushSync(applyTheme)
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }, [isDark, duration])

  if (!mounted) return <div className="h-7 w-7" />

  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center h-7 w-7 rounded-sm',
        'bg-background-alt text-foreground-secondary border border-primary',
        'hover:bg-background-hover hover:text-foreground',
        'transition-colors duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:shadow-focus-ring-brand',
        className,
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 stroke-[1.6]" />
      ) : (
        <Moon className="w-4 h-4 stroke-[1.6]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
