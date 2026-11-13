import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { ServerWakeNotice } from '@/components/layout/ServerWakeNotice'
import { persistCatalogCache, restoreCatalogCache } from '@/utils/catalogCache'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Fill the cache before the first render so saved catalog lists show immediately.
restoreCatalogCache(queryClient)

function App() {
  useEffect(() => persistCatalogCache(queryClient), [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <AppRouter />
        <ServerWakeNotice />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
