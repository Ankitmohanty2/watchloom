import { create } from 'zustand'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'watchloom-theme'
const LEGACY_STORAGE_KEY = 'theme-storage'

const themeTokens: Record<Theme, Record<string, string>> = {
  dark: {
    '--background-rgb': '17 19 16',
    '--foreground-rgb': '229 235 220',
    '--foreground-strong-rgb': '250 251 246',
    '--surface-rgb': '25 28 23',
    '--surface-alt-rgb': '31 36 28',
    '--surface-hover-rgb': '43 49 37',
    '--muted-rgb': '180 189 171',
    '--muted-foreground-rgb': '142 151 136',
    '--accent-foreground-rgb': '184 243 75',
    '--brand-muted-rgb': '184 243 75',
    '--border-rgb': '232 240 223',
    '--hover-rgb': '255 255 255',
  },
  light: {
    '--background-rgb': '248 249 246',
    '--foreground-rgb': '43 48 38',
    '--foreground-strong-rgb': '18 21 16',
    '--surface-rgb': '255 255 255',
    '--surface-alt-rgb': '240 243 235',
    '--surface-hover-rgb': '231 238 221',
    '--muted-rgb': '79 87 71',
    '--muted-foreground-rgb': '109 117 102',
    '--accent-foreground-rgb': '66 105 20',
    '--brand-muted-rgb': '71 112 22',
    '--border-rgb': '35 44 25',
    '--hover-rgb': '25 34 48',
  },
}

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark'

const readSavedTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'

  try {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY)
    if (isTheme(savedTheme)) return savedTheme

    // Migrate the previous Zustand persist format without discarding the user's choice.
    const legacyValue = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacyValue) {
      const legacyState = JSON.parse(legacyValue) as { state?: { theme?: unknown } }
      if (isTheme(legacyState.state?.theme)) return legacyState.state.theme
    }
  } catch {
    // Keep the app usable when browser storage is unavailable.
  }

  return 'light'
}

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.toggle('light', theme === 'light')
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme

  Object.entries(themeTokens[theme]).forEach(([token, value]) => {
    root.style.setProperty(token, value)
  })
}

const saveTheme = (theme: Theme) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Theme still applies for the current session if storage is blocked.
  }
}

const initialTheme = readSavedTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    applyTheme(theme)
    saveTheme(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const theme = get().theme === 'light' ? 'dark' : 'light'
    applyTheme(theme)
    saveTheme(theme)
    set({ theme })
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || !isTheme(event.newValue)) return
    applyTheme(event.newValue)
    useThemeStore.setState({ theme: event.newValue })
  })
}
