import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { progressService } from '@/services/progressService'
import { useAuthStore } from '@/store/authStore'

export const ContinueWatchingRail = () => {
  const { isAuthenticated } = useAuthStore()
  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['progress', 'continue-watching'],
    queryFn: progressService.getContinueWatching,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  })

  if (!isAuthenticated || (!isLoading && !isError && items.length === 0)) return null

  return (
    <section className="border-t border-border/[0.08] py-9 sm:py-11" aria-labelledby="continue-watching-title">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.17em] text-brand-muted">Pick up where you left off</p>
          <h2 id="continue-watching-title" className="font-display text-2xl font-semibold tracking-tight text-foreground-strong sm:text-[1.75rem]">Continue watching</h2>
        </div>
        <Link to="/library" className="inline-flex items-center gap-1.5 pb-1 text-sm font-medium text-muted transition-colors hover:text-foreground-strong">
          Your library <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="h-44 animate-pulse rounded-2xl border border-border/[0.08] bg-surface/60" />
      ) : isError ? (
        <div className="rounded-2xl border border-border/[0.08] bg-surface/40 px-5 py-6 text-sm text-muted-foreground">
          Your watch progress is unavailable right now. You can still browse your library.
        </div>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:gap-5 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map(({ media, last_watched_episode: episode, total_watched }) => {
            const mediaPath = media.id ? `/media/${media.id}` : '/library'
            return (
              <Link key={media.id} to={mediaPath} className="group w-[min(82vw,390px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-border/[0.1] bg-surface transition-colors hover:border-primary-500/35 sm:w-[350px]">
                <div className="flex gap-4 p-3.5">
                  <div className="relative h-[104px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                    {media.poster_path ? <img src={media.poster_path} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-muted">{media.title}</div>}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
                    <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted">{media.media_type === 'tv' ? 'Series' : media.media_type}</span>
                    <h3 className="truncate font-display text-base font-semibold text-foreground-strong">{media.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground">Season {episode.season_number} · Episode {episode.episode_number}</p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted"><Clock3 className="h-3.5 w-3.5" /> {total_watched} {total_watched === 1 ? 'episode' : 'episodes'} tracked</p>
                  </div>
                  <span className="my-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/15 text-muted transition group-hover:border-primary-500/40 group-hover:text-foreground-strong"><ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
