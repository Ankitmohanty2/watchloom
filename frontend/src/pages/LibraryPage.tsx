import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Trash2 } from 'lucide-react'
import { libraryService } from '@/services/libraryService'
import { MediaCard } from '@/components/media/MediaCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

const statuses = [
  { value: '', label: 'All titles' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'plan_to_watch', label: 'Plan to watch' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'dropped', label: 'Dropped' },
]

const LibraryPage = () => {
  const [activeStatus, setActiveStatus] = useState('')
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['library', activeStatus],
    queryFn: () => libraryService.getLibrary(activeStatus || undefined, 1, 50),
  })
  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => libraryService.removeFromLibrary(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  })

  return (
    <main className="min-h-[65vh] bg-background text-foreground">
      <div className="container-custom py-10 sm:py-14">
        <header className="mb-7 border-b border-border/[0.08] pb-7">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            <span className="h-2 w-2 rounded-sm bg-primary-500" /> Your Watchloom
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground-strong sm:text-4xl">My library</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">Your saved titles and progress, all in one place.</p>
        </header>

        <div className="mb-7 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter library by status">
          {statuses.map((status) => (
            <Button
              key={status.value || 'all'}
              type="button"
              size="sm"
              variant={activeStatus === status.value ? 'primary' : 'outline'}
              aria-pressed={activeStatus === status.value}
              onClick={() => setActiveStatus(status.value)}
              className="shrink-0"
            >
              {status.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border/[0.07] bg-surface"><LoadingSpinner size="lg" /></div>
        ) : isError ? (
          <div className="rounded-xl border border-border/[0.08] bg-surface px-6 py-14 text-center">
            <p className="font-semibold text-foreground-strong">Your library couldn’t load.</p>
            <button onClick={() => refetch()} className="mt-4 text-sm font-semibold text-accent-foreground hover:text-foreground-strong">Try again</button>
          </div>
        ) : data?.items?.length ? (
          <>
            <p className="mb-5 text-sm text-muted-foreground">{data.total} {data.total === 1 ? 'title' : 'titles'}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {data.items.map((item: any) => (
                <div key={item.id} className="group relative min-w-0">
                  {item.media && <MediaCard media={item.media} />}
                  <button
                    type="button"
                    aria-label={`Remove ${item.media?.title || 'title'} from library`}
                    title="Remove from library"
                    onClick={() => {
                      if (window.confirm('Remove this title from your library?')) deleteMutation.mutate(item.id)
                    }}
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg border border-border/10 bg-background/90 text-white opacity-100 shadow-lg transition hover:border-red-300/40 hover:bg-red-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffd93d] sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {deleteMutation.isError && <p role="alert" className="mt-6 text-sm text-red-300">Could not remove that title. Please try again.</p>}
          </>
        ) : (
          <div className="rounded-xl border border-border/[0.08] bg-surface px-6 py-14 text-center">
            <h2 className="font-display text-xl font-semibold text-foreground-strong">Your library is ready for a first title</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Save movies, series, and anime here to keep your watchlist organized.</p>
            <Link to="/discover" className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: '#FFD93D', color: '#11141b' }}>
              Explore titles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default LibraryPage
