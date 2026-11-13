import type { QueryClient, QueryKey } from '@tanstack/react-query'

/**
 * Keeps a copy of public catalog lists in local storage so a returning visitor
 * sees the home page immediately, even while the API server is still waking up.
 * Saved lists are shown first and then refreshed in the background.
 */

const STORAGE_KEY = 'watchloom-catalog-cache'
const MAX_AGE_MS = 24 * 60 * 60 * 1000
const SAVE_DELAY_MS = 1000

// Only public, non-personal lists are saved. Account data never is.
const PERSISTED_KEY_ROOTS = new Set(['home', 'movie-watch-providers'])

interface SavedQuery {
  key: QueryKey
  data: unknown
  updatedAt: number
}

const shouldPersist = (key: QueryKey) => typeof key[0] === 'string' && PERSISTED_KEY_ROOTS.has(key[0])

const readSavedQueries = (): SavedQuery[] => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as unknown
    return Array.isArray(saved) ? saved as SavedQuery[] : []
  } catch {
    return []
  }
}

export const restoreCatalogCache = (queryClient: QueryClient) => {
  if (typeof window === 'undefined') return

  const now = Date.now()
  readSavedQueries().forEach((entry) => {
    if (!Array.isArray(entry?.key) || !shouldPersist(entry.key) || entry.data == null) return
    if (typeof entry.updatedAt !== 'number' || now - entry.updatedAt > MAX_AGE_MS) return
    // Keeping the original timestamp marks older data as stale, so it refetches on load.
    queryClient.setQueryData(entry.key, entry.data, { updatedAt: entry.updatedAt })
  })
}

export const persistCatalogCache = (queryClient: QueryClient) => {
  if (typeof window === 'undefined') return () => {}

  let saveTimer: number | undefined

  const save = () => {
    saveTimer = undefined
    const entries: SavedQuery[] = queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => shouldPersist(query.queryKey) && query.state.status === 'success' && query.state.data != null)
      .map((query) => ({ key: query.queryKey, data: query.state.data, updatedAt: query.state.dataUpdatedAt }))

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // Storage can be full or blocked; the site works without the saved copy.
    }
  }

  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated' || event.action.type !== 'success' || !shouldPersist(event.query.queryKey)) return
    if (saveTimer === undefined) saveTimer = window.setTimeout(save, SAVE_DELAY_MS)
  })

  return () => {
    unsubscribe()
    if (saveTimer !== undefined) window.clearTimeout(saveTimer)
  }
}
