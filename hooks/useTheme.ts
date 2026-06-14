'use client'

import { useEffect, useState } from 'react'

/**
 * Reads the current theme from the `data-theme` attribute on <html> and
 * keeps in sync when it changes (the ThemeToggle mutates that attribute).
 * Returns true when the dark theme is active.
 */
export function useTheme(): boolean {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const read = () =>
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return isDark
}
