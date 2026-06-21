/**
 * Theme management utilities
 * Handles light/dark mode persistence and initialization
 */

type Theme = 'light' | 'dark'

/**
 * Get the current theme from localStorage or system preference
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const stored = localStorage.getItem('scentral_theme') as Theme | null
  if (stored) return stored

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

/**
 * Initialize theme on app startup
 * Called from Providers or layout useEffect
 * Sets data-theme attribute and localStorage
 */
export function initTheme(): void {
  if (typeof window === 'undefined') return

  const theme = getTheme()
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('scentral_theme', theme)
}

/**
 * Toggle between light and dark themes
 * Updates DOM, localStorage, and returns new theme
 */
export function toggleTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const current = getTheme()
  const next = current === 'light' ? 'dark' : 'light'

  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('scentral_theme', next)

  return next
}

/**
 * Set theme explicitly
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return

  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('scentral_theme', theme)
}
