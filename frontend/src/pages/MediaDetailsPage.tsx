import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Clock3, Plus, Star } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { libraryService } from '@/services/libraryService'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { TrailerButton } from '@/components/media/TrailerButton'
import { TrailerBackdrop } from '@/components/media/TrailerBackdrop'
import { MediaCard } from '@/components/media/MediaCard'
import { MediaSynopsis } from '@/components/media/MediaSynopsis'
import { formatMediaRating } from '@/utils/media'

const MediaDetailsPage = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState('plan_to_watch')

  const { data: media, isLoading, isError } = useQuery({
    queryKey: ['media', id],
    queryFn: () => mediaService.getMediaDetails(id!),
    enabled: !!id,
  })

  const provider = media?.provider || (media?.media_type === 'anime' ? 'anilist' : 'tmdb')
  const providerId = media?.provider_id || media?.provider_ids?.tmdb_id || media?.provider_ids?.anilist_id
  const { data: similarTitles = [], isLoading: similarIsLoading, isError: similarIsError } = useQuery({
    queryKey: ['media', 'similar', provider, providerId, media?.media_type],
    queryFn: async () => {
      const response = await mediaService.getSimilar(provider, providerId!, media!.media_type)
      return response.results
    },
    enabled: Boolean(media && providerId),
  })

  const addMutation = useMutation({
    mutationFn: (status: string) => libraryService.addToLibrary(id!, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  })

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-background"><LoadingSpinner size="lg" /></div>
  }

  if (!media || isError) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 text-center text-foreground">
        <div>
          <h1 className="font-display text-2xl font-semibold">We couldn’t find that title</h1>
          <p className="mt-2 text-sm text-muted">It may have been removed or the link may be out of date.</p>
          <Link to="/discover" className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: '#FFD93D', color: '#11141b' }}>
            <ArrowLeft className="h-4 w-4" /> Back to Discover
          </Link>
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/30 to-[#0b0d12]/20" />
        <div className="container-custom relative flex h-full items-end pb-10">
          <Link to="/discover" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/40 px-3.5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-black/60">
            <ArrowLeft className="h-4 w-4" /> Discover
          </Link>
        </div>
      </section>

      <div className="container-custom relative -mt-16 pb-20 sm:-mt-20">
        <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <aside>
            <div className="aspect-[2/3] max-w-[260px] overflow-hidden rounded-xl border border-border/10 bg-surface-alt shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
              {media.poster_path ? (
                <img src={media.poster_path} alt={`${media.title} poster`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">Artwork unavailable</div>
              )}
            </div>
            {isAuthenticated ? (
              <div className="mt-4 rounded-xl border border-border/[0.08] bg-surface p-4">
                <label htmlFor="library-status" className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted">Add to your library</label>
                <select
                  id="library-status"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="mb-3 w-full rounded-lg border border-border/10 bg-surface-alt px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary-500"
                >
                  <option value="plan_to_watch">Plan to watch</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On hold</option>
                  <option value="dropped">Dropped</option>
                </select>
                <Button className="w-full" onClick={() => addMutation.mutate(selectedStatus)} disabled={addMutation.isPending}>
                  <Plus className="mr-2 h-4 w-4" />
                  {addMutation.isPending ? 'Saving…' : 'Add to library'}
                </Button>
                {addMutation.isSuccess && <p role="status" className="mt-3 text-sm text-emerald-300">Added to your library.</p>}
                {addMutation.isError && <p role="alert" className="mt-3 text-sm text-red-300">{mutationError}</p>}
              </div>
            ) : (
              <Link to="/signin" className="mt-4 block rounded-xl border border-border/[0.08] bg-surface p-4 transition hover:border-primary-600/40">
                <span className="block text-sm font-semibold text-foreground-strong">Save to your library</span>
                <span className="mt-1 block text-xs leading-5 text-muted">Sign in to keep track of this title.</span>
              </Link>
            )}
          </aside>

          <article className="pt-1 md:pt-28">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">{media.media_type === 'tv' ? 'Series' : media.media_type}</p>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground-strong sm:text-4xl lg:text-5xl">{media.title}</h1>
            {media.original_title && media.original_title !== media.title && (
              <p className="mt-2 text-sm text-muted-foreground">{media.original_title}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
              {rating && <span className="inline-flex items-center gap-1.5 font-semibold text-foreground-strong"><Star className="h-4 w-4 fill-[#ffd93d] text-[#ffd93d]" />{rating}</span>}
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
                  style={{ backgroundColor: '#FFD93D', color: '#11141b' }}
                />
              )}
            </div>

            {media.synopsis && (
              <section className="mt-9 max-w-3xl border-t border-border/[0.08] pt-6">
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
                {similarTitles.slice(0, 12).map((title) => (
                  <MediaCard key={`${title.provider}-${title.provider_id}`} media={title} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default MediaDetailsPage
