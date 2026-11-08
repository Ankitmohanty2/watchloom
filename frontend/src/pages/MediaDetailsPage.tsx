import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Plus, RotateCw, Star } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { libraryService } from '@/services/libraryService'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { TrailerButton } from '@/components/media/TrailerButton'
import { TrailerBackdrop } from '@/components/media/TrailerBackdrop'
import { MediaCard } from '@/components/media/MediaCard'
import { EpisodeProgressPanel } from '@/components/media/EpisodeProgressPanel'
import { MediaSynopsis } from '@/components/media/MediaSynopsis'
import { formatMediaRating, getMediaTypeLabel, isEpisodeBasedMedia } from '@/utils/media'
import { getPosterImageUrl } from '@/utils/mediaImages'
import type { LibraryEntry } from '@/types'

const libraryStatuses: Array<{ value: LibraryEntry['status']; label: string }> = [
  { value: 'plan_to_watch', label: 'Plan to watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'dropped', label: 'Dropped' },
]

const MediaDetailsPage = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<LibraryEntry['status']>('plan_to_watch')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [similarPageState, setSimilarPageState] = useState({ mediaId: id, page: 1 })
  const similarPage = similarPageState.mediaId === id ? similarPageState.page : 1
  const updateSimilarPage = (update: (page: number) => number) => {
    setSimilarPageState((current) => ({
      mediaId: id,
      page: update(current.mediaId === id ? current.page : 1),
    }))
  }
  const statusMenuRef = useRef<HTMLDivElement>(null)
  const statusTriggerRef = useRef<HTMLButtonElement>(null)
  const statusOptionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const { data: media, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['media', id],
    queryFn: () => mediaService.getMediaDetails(id!),
    enabled: !!id,
    retry: (failureCount, requestError) => {
      const status = (requestError as { response?: { status?: number } })?.response?.status
      return failureCount < 3 && (!status || status >= 500)
    },
    retryDelay: (attempt) => Math.min(800 * 2 ** attempt, 4_000),
  })

  const provider = media?.provider || (media?.media_type === 'anime' ? 'anilist' : 'tmdb')
  const providerId = media?.provider_id || media?.provider_ids?.tmdb_id || media?.provider_ids?.anilist_id
  const { data: similarResponse, isLoading: similarIsLoading, isFetching: similarIsFetching, isError: similarIsError } = useQuery({
    queryKey: ['media', 'similar', provider, providerId, media?.media_type, similarPage],
    queryFn: async () => {
      return mediaService.getSimilar(provider, providerId!, media!.media_type, similarPage)
    },
    enabled: Boolean(media && providerId),
    placeholderData: keepPreviousData,
  })
  const similarTitles = similarResponse?.results ?? []

  const addMutation = useMutation({
    mutationFn: (status: string) => libraryService.addToLibrary(id!, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['library'] })
    },
  })

  const openStatusMenu = () => {
    setStatusMenuOpen(true)
    requestAnimationFrame(() => {
      const selectedIndex = libraryStatuses.findIndex((status) => status.value === selectedStatus)
      statusOptionRefs.current[selectedIndex]?.focus()
    })
  }

  const handleStatusMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setStatusMenuOpen(false)
      statusTriggerRef.current?.focus()
    }
  }

  const handleStatusOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const lastIndex = libraryStatuses.length - 1
    let nextIndex: number | null = null
    if (event.key === 'ArrowDown') nextIndex = index === lastIndex ? 0 : index + 1
    if (event.key === 'ArrowUp') nextIndex = index === 0 ? lastIndex : index - 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = lastIndex
    if (nextIndex !== null) {
      event.preventDefault()
      statusOptionRefs.current[nextIndex]?.focus()
    }
  }

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-background"><LoadingSpinner size="lg" /></div>
  }

  if (!media || isError) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 text-center text-foreground">
        <div>
          <h1 className="font-display text-2xl font-semibold">We couldn’t find that title</h1>
          <p className="mt-2 text-sm text-muted">This title didn’t load. Try again or return to Discover.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-[#11150d] transition hover:brightness-95 disabled:opacity-60"
              style={{ backgroundColor: 'var(--watchloom-primary)' }}
            >
              <RotateCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Trying again…' : 'Try again'}
            </button>
            <Link to="/discover" className="inline-flex h-10 items-center gap-2 rounded-full border border-border/15 px-4 py-2.5 text-sm font-semibold text-foreground-strong transition hover:bg-hover/[0.06]">
              <ArrowLeft className="h-4 w-4" /> Back to Discover
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const rating = formatMediaRating(media.rating, media.media_type)
  const backdrop = media.backdrop_path || media.poster_path
  const mutationError = (addMutation.error as any)?.response?.data?.detail || 'Could not add this title. Please try again.'

  return (
    <div className="bg-background text-foreground">
      <section className="relative h-[300px] overflow-hidden bg-surface-alt sm:h-[380px] lg:h-[440px]">
        <TrailerBackdrop
          image={backdrop}
          provider={provider}
          providerId={providerId}
          mediaType={media.media_type}
          trailerUrl={media.trailer_url}
        />
        <div className="media-detail-hero-overlay absolute inset-0" />
        <div className="container-custom relative flex h-full items-end pb-10">
          <Link to="/discover" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/40 px-3.5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-black/60">
            <ArrowLeft className="h-4 w-4" /> Discover
          </Link>
        </div>
      </section>

      <div className="container-custom relative -mt-16 pb-20 sm:-mt-20">
        <div className="grid min-w-0 gap-8 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <aside className="min-w-0">
            <div className="aspect-[2/3] max-w-[260px] overflow-hidden rounded-xl border border-border/10 bg-surface-alt shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
              {media.poster_path ? (
                <img src={getPosterImageUrl(media.poster_path)} alt={`${media.title} poster`} decoding="async" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">Artwork unavailable</div>
              )}
            </div>
            {isAuthenticated ? (
              <div className="mt-4 rounded-2xl border border-border/[0.08] bg-surface p-4 shadow-sm">
                <label htmlFor="library-status" className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted">Add to your library</label>
                <div
                  ref={statusMenuRef}
                  className="relative mb-3"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setStatusMenuOpen(false)
                    }
                  }}
                  onKeyDown={handleStatusMenuKeyDown}
                >
                  <button
                    ref={statusTriggerRef}
                    id="library-status"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={statusMenuOpen}
                    aria-controls="library-status-options"
                    onClick={() => statusMenuOpen ? setStatusMenuOpen(false) : openStatusMenu()}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-border/10 bg-surface-alt px-3.5 text-left text-sm font-medium text-foreground shadow-sm outline-none transition hover:border-border/20 focus-visible:ring-2 focus-visible:ring-primary-500/60"
                  >
                    <span>{libraryStatuses.find((status) => status.value === selectedStatus)?.label}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${statusMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {statusMenuOpen && (
                    <div
                      id="library-status-options"
                      role="listbox"
                      aria-labelledby="library-status"
                      className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border/15 bg-surface-alt p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.28)] ring-1 ring-black/5"
                    >
                      {libraryStatuses.map((status, index) => {
                        const isSelected = selectedStatus === status.value
                        return (
                          <button
                            key={status.value}
                            ref={(element) => { statusOptionRefs.current[index] = element }}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onKeyDown={(event) => handleStatusOptionKeyDown(event, index)}
                            onClick={() => {
                              setSelectedStatus(status.value)
                              setStatusMenuOpen(false)
                              statusTriggerRef.current?.focus()
                              addMutation.reset()
                            }}
                            className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 ${isSelected ? 'bg-primary-500/10 font-semibold text-foreground-strong' : 'text-foreground hover:bg-hover/[0.07]'}`}
                          >
                            {status.label}
                            {isSelected && <Check className="h-4 w-4 text-primary-500" aria-hidden="true" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                <Button className="w-full" onClick={() => addMutation.mutate(selectedStatus)} disabled={addMutation.isPending}>
                  <Plus className="mr-2 h-4 w-4" />
                  {addMutation.isPending ? 'Saving…' : 'Add to library'}
                </Button>
                {addMutation.isSuccess && <p role="status" className="mt-3 text-sm text-emerald-300">Saved to your library.</p>}
                {addMutation.isError && <p role="alert" className="mt-3 text-sm text-red-300">{mutationError}</p>}
              </div>
            ) : (
              <Link to="/signin" className="mt-4 block rounded-xl border border-border/[0.08] bg-surface p-4 transition hover:border-primary-600/40">
                <span className="block text-sm font-semibold text-foreground-strong">Save to your library</span>
                <span className="mt-1 block text-xs leading-5 text-muted">Sign in to keep track of this title.</span>
              </Link>
            )}
            {isEpisodeBasedMedia(media) && (isAuthenticated ? (
              <EpisodeProgressPanel media={media} />
            ) : (
              <Link to="/signin" className="mt-4 block rounded-2xl border border-border/10 bg-surface-alt p-4 transition hover:border-primary-500/35">
                <span className="block text-sm font-semibold text-foreground-strong">Track episodes</span>
                <span className="mt-1 block text-xs leading-5 text-muted">Sign in to save a season and episode and continue later.</span>
              </Link>
            ))}
          </aside>

          <article className="min-w-0 pt-1 md:pt-28">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">{getMediaTypeLabel(media)}</p>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground-strong sm:text-4xl lg:text-5xl">{media.title}</h1>
            {media.original_title && media.original_title !== media.title && (
              <p className="mt-2 text-sm text-muted-foreground">{media.original_title}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
              {rating && <span className="inline-flex items-center gap-1.5 font-semibold text-foreground-strong"><Star className="h-4 w-4 fill-primary-500 text-primary-600" />{rating}</span>}
              {media.release_date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-muted-foreground" />{new Date(media.release_date).getFullYear()}</span>}
              {media.runtime && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-muted-foreground" />{media.runtime} min</span>}
              {media.season_count && <span>{media.season_count} {media.season_count === 1 ? 'season' : 'seasons'}</span>}
              {media.episode_count && <span>{media.episode_count} episodes</span>}
            </div>

            {media.genres?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {media.genres.map((genre) => <span key={genre} className="rounded-full border border-primary-600/30 bg-primary-500/10 px-3 py-1 text-xs font-medium text-accent-foreground">{genre}</span>)}
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {(media.trailer_url || providerId) && (
                <TrailerButton
                  provider={provider}
                  providerId={providerId}
                  mediaType={media.media_type}
                  trailerUrl={media.trailer_url}
                  className="inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition hover:brightness-105"
                  style={{ backgroundColor: 'var(--watchloom-primary)', color: 'var(--watchloom-ink)' }}
                />
              )}
            </div>

            {media.synopsis && (
              <section className="mt-9 min-w-0 w-full max-w-3xl border-t border-border/[0.08] pt-6">
                <h2 className="font-display text-lg font-semibold text-foreground-strong">Overview</h2>
                <MediaSynopsis synopsis={media.synopsis} />
              </section>
            )}
          </article>
        </div>

        {(similarIsLoading || similarIsError || similarTitles.length > 0) && (
          <section className="mt-16 border-t border-border/[0.08] pt-8" aria-labelledby="similar-titles-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground">Keep exploring</p>
                <h2 id="similar-titles-heading" className="font-display text-2xl font-semibold tracking-tight text-foreground-strong sm:text-3xl">Similar titles</h2>
              </div>
              {!similarIsLoading && !similarIsError && similarTitles.length > 0 && (
                <span className="pb-1 text-xs text-muted-foreground">Picked from the same universe of stories</span>
              )}
            </div>
            {similarIsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-label="Loading similar titles">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[2/3] rounded-xl bg-hover/[0.06]" />
                    <div className="mt-3 h-4 w-3/4 rounded bg-hover/[0.06]" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-hover/[0.04]" />
                  </div>
                ))}
              </div>
            ) : similarIsError ? (
              <p className="text-sm text-muted-foreground">Similar titles couldn’t load right now.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {similarTitles.map((title) => (
                  <MediaCard key={`${title.provider}-${title.provider_id}`} media={title} />
                ))}
              </div>
            )}
            {!similarIsError && similarTitles.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-3" aria-label="Similar title pages">
                <button
                  type="button"
                  onClick={() => updateSimilarPage((page) => Math.max(1, page - 1))}
                  disabled={similarPage === 1 || similarIsFetching}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border/15 px-4 text-sm font-medium text-foreground transition hover:bg-hover/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="min-w-24 text-center text-sm tabular-nums text-muted-foreground" aria-live="polite">
                  {similarIsFetching ? `Loading page ${similarPage}…` : `Page ${similarResponse?.page ?? similarPage}`}
                </span>
                <button
                  type="button"
                  onClick={() => updateSimilarPage((page) => page + 1)}
                  disabled={!similarResponse?.has_next_page || similarIsFetching}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border/15 px-4 text-sm font-medium text-foreground transition hover:bg-hover/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default MediaDetailsPage
