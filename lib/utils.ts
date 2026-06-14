import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge bridge — without it, cn('text-xxs', 'text-foreground') silently
// drops `text-xxs` because twmerge doesn't know `xxs` is a fontSize key. Every
// custom theme key from tailwind.config.ts must be registered below; drift
// produces invisible visual regressions that TS / lint / build all stay green on.

/** Custom font-size suffixes added to `theme.extend.fontSize`. */
const CUSTOM_FONT_SIZES = [
  'xxs',
  'display-xs', 'display-sm', 'display-md', 'display-lg', 'display-xl', 'display-2xl',
] as const

/** Custom color suffixes added to `theme.extend.colors`. Tailwind generates
 *  `text-{key}`, `bg-{key}`, and `border-{key}` for every entry. */
const CUSTOM_COLORS = [
  // Surfaces + structural background variants
  'elevated-surface',
  'background', 'background-alt', 'background-hover', 'background-solid',
  'background-secondary', 'background-secondary-alt', 'background-secondary-hover',
  'background-secondary-subtle', 'background-secondary-solid',
  'background-tertiary', 'background-quaternary',
  'background-active', 'background-active-hover',
  'background-disabled', 'background-disabled-subtle',
  'background-overlay', 'background-sidenav-surface', 'background-header-surface',
  'background-app', 'background-modal-button',
  'background-brand', 'background-brand-alt',
  'background-brand-secondary', 'background-brand-secondary-alt',
  'background-brand-solid', 'background-brand-solid-hover',
  'background-brand-section', 'background-brand-section-subtle',
  'background-error', 'background-error-secondary',
  'background-error-solid', 'background-error-solid-hover',
  'background-warning', 'background-warning-secondary',
  'background-warning-solid', 'background-warning-solid-hover',
  'background-success', 'background-success-secondary',
  'background-success-solid', 'background-success-solid-hover',
  'background-node-header',

  // Foreground / text
  'foreground',
  'foreground-on-brand', 'foreground-secondary', 'foreground-secondary-on-brand',
  'foreground-tertiary', 'foreground-tertiary-on-brand',
  'foreground-muted', 'foreground-muted-on-brand',
  'foreground-white',
  'foreground-disabled', 'foreground-disabled-subtle',
  'foreground-placeholder', 'foreground-placeholder-subtle',
  'foreground-brand', 'foreground-brand-dark',
  'foreground-brand-secondary', 'foreground-brand-tertiary', 'foreground-brand-tertiary-alt',
  'foreground-error', 'foreground-error-dark',
  'foreground-warning', 'foreground-warning-dark',
  'foreground-success', 'foreground-success-dark',
  'foreground-ai-primary',

  // Icon / decorative foreground
  'fg',
  'fg-secondary', 'fg-tertiary', 'fg-muted', 'fg-subtle', 'fg-faint',
  'fg-white', 'fg-disabled', 'fg-disabled-subtle',
  'fg-brand', 'fg-brand-alt', 'fg-brand-secondary',
  'fg-error', 'fg-error-secondary',
  'fg-warning', 'fg-warning-secondary',
  'fg-success', 'fg-success-secondary',

  // Borders
  'border',
  'border-secondary', 'border-disabled', 'border-disabled-subtle',
  'border-brand', 'border-brand-solid', 'border-brand-solid-alt',
  'border-error', 'border-error-solid',
  'border-warning', 'border-warning-solid',
  'border-success', 'border-success-solid',

  // Brand + status scales
  'brand',
  'brand-25', 'brand-50', 'brand-100', 'brand-200', 'brand-300', 'brand-400',
  'brand-500', 'brand-600', 'brand-700', 'brand-800', 'brand-900', 'brand-950',
  'error',
  'error-25', 'error-50', 'error-100', 'error-200', 'error-300', 'error-400',
  'error-500', 'error-600', 'error-700', 'error-800', 'error-900', 'error-950',
  'warning',
  'warning-25', 'warning-50', 'warning-100', 'warning-200', 'warning-300', 'warning-400',
  'warning-500', 'warning-600', 'warning-700', 'warning-800', 'warning-900', 'warning-950',
  'success',
  'success-25', 'success-50', 'success-100', 'success-200', 'success-300', 'success-400',
  'success-500', 'success-600', 'success-700', 'success-800', 'success-900', 'success-950',

  // Component slots
  'btn-primary',
  'btn-primary-bg', 'btn-primary-border', 'btn-primary-fg',
  'btn-primary-bg-hover', 'btn-primary-border-hover', 'btn-primary-fg-hover',
  'btn-secondary',
  'btn-secondary-bg', 'btn-secondary-border', 'btn-secondary-fg',
  'btn-secondary-bg-hover', 'btn-secondary-border-hover', 'btn-secondary-fg-hover',
  'btn-tertiary',
  'btn-tertiary-fg', 'btn-tertiary-bg-hover', 'btn-tertiary-fg-hover',
  'btn-mono',
  'btn-mono-bg', 'btn-mono-border', 'btn-mono-fg',
  'btn-mono-bg-hover', 'btn-mono-fg-hover',

  // Editor + legacy aliases
  'tab-active-bg',
  'accent-toolbar', 'accent-effects', 'accent-layers',

  // borderColor-only suffixes (declared in tailwind.config.ts borderColor
  // block separately from theme.colors — required for border-{name} utilities
  // like `border-primary`, `border-secondary`, `border-brand-solid`).
  'primary', 'field', 'container',
  'secondary', 'disabled', 'disabled-subtle',
  'brand-solid', 'brand-solid-alt',
  'error-solid', 'warning-solid', 'success-solid',
] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...CUSTOM_FONT_SIZES] }],
      'text-color': [{ text: [...CUSTOM_COLORS] }],
      'bg-color': [{ bg: [...CUSTOM_COLORS] }],
      'border-color': [{ border: [...CUSTOM_COLORS] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
