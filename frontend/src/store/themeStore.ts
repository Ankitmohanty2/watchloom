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
    '--background-rgb': '11 13 18',
    '--foreground-rgb': '247 242 223',
    '--foreground-strong-rgb': '255 248 230',
    '--surface-rgb': '17 20 27',
    '--surface-alt-rgb': '13 19 34',
    '--surface-hover-rgb': '23 26 34',
    '--muted-rgb': '170 183 210',
    '--muted-foreground-rgb': '142 155 181',
    '--accent-foreground-rgb': '225 201 94',
    '--brand-muted-rgb': '201 184 102',
    '--border-rgb': '255 255 255',
    '--hover-rgb': '255 255 255',
  },
  light: {
    '--background-rgb': '246 247 249',
    '--foreground-rgb': '53 61 74',
    '--foreground-strong-rgb': '22 29 40',
    '--surface-rgb': '255 255 255',
    '--surface-alt-rgb': '239 242 246',
    '--surface-hover-rgb': '229 233 239',
    '--muted-rgb': '82 92 108',
    '--muted-foreground-rgb': '106 116 131',
    '--accent-foreground-rgb': '126 91 0',
    '--brand-muted-rgb': '126 91 0',
    '--border-rgb': '43 52 66',
    '--hover-rgb': '25 34 48',
  },
}

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark'

const readSavedTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark'

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

  return 'dark'
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
