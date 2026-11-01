import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, Clock, Pause, Play, Search, Star, TrendingUp } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { MediaCard } from '@/components/media/MediaCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { TrailerButton } from '@/components/media/TrailerButton'
import { MediaSynopsis } from '@/components/media/MediaSynopsis'
import { formatMediaRating } from '@/utils/media'
import { YoutubeBackgroundPlayer } from '@/components/media/YoutubeBackgroundPlayer'
import { canAutoplayBackgroundVideo, getYoutubeVideoId } from '@/utils/youtube'

const mediaHref = (media?: { id?: string; provider?: string; provider_id?: number; media_type?: string }) => {
  if (media?.id) return `/media/${media.id}`
  if (media?.provider && media.provider_id && media.media_type) {
    return `/media/fetch?provider=${media.provider}&id=${media.provider_id}&type=${media.media_type}`
  }
  return '/discover'
}

const HomePage = () => {
  const { isAuthenticated } = useAuthStore()
  const [autoplayAllowed] = useState(canAutoplayBackgroundVideo)
  const [isBackgroundTrailerPlaying, setIsBackgroundTrailerPlaying] = useState(autoplayAllowed)
  const [unavailableTrailerId, setUnavailableTrailerId] = useState<string | null>(null)
  const { data: trending, isLoading } = useQuery({
    queryKey: ['trending', 'all'],
    queryFn: () => mediaService.getTrending('all', 1),
    retry: 2,
  })
  const { data: popularMovies } = useQuery({
    queryKey: ['popular', 'movie'],
    queryFn: () => mediaService.getPopular('movie', 1),
    retry: 1,
  })
  const { data: popularAnime } = useQuery({
    queryKey: ['popular', 'anime'],
    queryFn: () => mediaService.getPopular('anime', 1),
  })

  const featured = trending?.results?.[0]
  const movieResults = popularMovies?.results?.length
    ? popularMovies.results
    : trending?.results?.filter((media: any) => media.media_type === 'movie') ?? []
  const heroImage = featured?.backdrop_path || featured?.poster_path
  const featuredRating = formatMediaRating(featured?.rating, featured?.media_type)
  const featuredTrailer = useQuery({
    queryKey: ['media-trailer', featured?.provider, featured?.provider_id, featured?.media_type],
    queryFn: () => mediaService.getTrailer(featured!.provider, featured!.provider_id, featured!.media_type),
    enabled: autoplayAllowed
      && Boolean(featured?.provider && featured?.provider_id && featured?.media_type)
      && !getYoutubeVideoId(featured?.trailer_url),
    retry: false,
    staleTime: 30 * 60 * 1000,
  })
  const trailerUrl = featured?.trailer_url || featuredTrailer.data?.trailer_url
  const trailerVideoId = getYoutubeVideoId(trailerUrl)
  const showBackgroundTrailer = autoplayAllowed
    && isBackgroundTrailerPlaying
    && Boolean(trailerVideoId)
    && unavailableTrailerId !== trailerVideoId

  const features = [
    {
      icon: Search,
      title: 'Find your next watch',
      description: 'Search across movies, series, and anime in one place.',
    },
    {
      icon: TrendingUp,
      title: 'Keep your place',
      description: 'Track what you are watching and pick up where you left off.',
    },
    {
      icon: Star,
      title: 'Make it yours',
      description: 'Build a personal library and rate the stories you love.',
    },
  ]

  return (
    <div className="bg-background text-foreground">
      <section className="relative isolate min-h-[620px] overflow-hidden bg-background md:min-h-[700px]">
        <div className="absolute inset-0 overflow-hidden bg-background">
          {heroImage && (
            <img
              src={heroImage}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${showBackgroundTrailer ? 'opacity-35' : 'opacity-65'}`}
            />
          )}
          {showBackgroundTrailer && trailerVideoId && (
            <YoutubeBackgroundPlayer
              videoId={trailerVideoId}
              onUnavailable={() => setUnavailableTrailerId(trailerVideoId)}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-110 opacity-70"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12] via-[#0b0d12]/80 to-[#0b0d12]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-transparent to-[#0b0d12]/35" />

        <div className="container-custom relative z-10 flex min-h-[620px] items-center py-20 md:min-h-[700px]">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 border-l-2 border-primary-500 pl-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">
              <span>{featured ? 'Featured title' : 'Welcome to Watchloom'}</span>
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {featured?.title || 'Stories worth your time.'}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
              {featuredRating && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-primary-400 text-primary-400" />
                  <span className="font-semibold text-white">{featuredRating}</span>
                </span>
              )}
              {featured?.release_date && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {new Date(featured.release_date).getFullYear()}
                </span>
              )}
              {featured?.media_type && (
                <span className="capitalize">{featured.media_type === 'tv' ? 'Series' : featured.media_type}</span>
              )}
            </div>
            {featured?.synopsis ? (
              <MediaSynopsis synopsis={featured.synopsis} className="mt-5 line-clamp-3 max-w-xl text-base leading-7 text-slate-300 sm:text-lg" />
            ) : (
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Keep the films, series, and anime you love together. Find something new and keep track of every story.
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {featured?.provider && featured?.provider_id ? (
                <TrailerButton
                  provider={featured.provider}
                  providerId={featured.provider_id}
                  mediaType={featured.media_type}
                  trailerUrl={featured.trailer_url}
                  onOpen={() => setIsBackgroundTrailerPlaying(false)}
                  className="inline-flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#fff8e6]"
                  style={{ backgroundColor: '#FFD93D', color: '#11141b' }}
                />
              ) : (
                <Link
                  to="/discover"
                  className="inline-flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-semibold"
                  style={{ backgroundColor: '#FFD93D', color: '#11141b' }}
                >
                  Browse titles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                to={mediaHref(featured)}
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border/20 bg-black/20 px-5 text-sm font-semibold text-white transition-colors hover:border-border/40 hover:bg-hover/[0.08]"
              >
                Explore title
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              {trailerVideoId && autoplayAllowed && unavailableTrailerId !== trailerVideoId && (
                <button
                  type="button"
                  onClick={() => setIsBackgroundTrailerPlaying((playing) => !playing)}
                  aria-label={isBackgroundTrailerPlaying ? 'Pause background trailer' : 'Play background trailer'}
                  title={isBackgroundTrailerPlaying ? 'Pause background trailer' : 'Play background trailer'}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/20 bg-black/25 text-white transition-colors hover:border-border/40 hover:bg-hover/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#fff8e6]"
                >
                  {isBackgroundTrailerPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom">
        <section className="py-12 sm:py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-400">A good place to start</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Trending now</h2>
            </div>
            <Link to="/discover" className="inline-flex items-center gap-1.5 pb-1 text-sm font-medium text-muted transition-colors hover:text-primary-300">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : trending?.results?.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {trending.results.slice(0, 12).map((media: any) => (
                <MediaCard key={`${media.provider}-${media.provider_id}`} media={media} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-border/10 bg-hover/[0.025] px-5 py-8 text-sm text-muted-foreground">Trending titles will appear here when available.</p>
          )}
        </section>

        {movieResults.length > 0 && (
          <section className="border-t border-border/[0.07] py-12 sm:py-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">On the big screen</p>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {popularMovies?.results?.length ? 'Popular movies' : 'Movies trending now'}
                </h2>
              </div>
              <Link to="/movies" className="inline-flex items-center gap-1.5 pb-1 text-sm font-medium text-muted transition-colors hover:text-primary-300">
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {movieResults.slice(0, 6).map((media: any) => (
                <MediaCard key={`${media.provider}-${media.provider_id}`} media={media} />
              ))}
            </div>
          </section>
        )}

        {popularAnime?.results?.length > 0 && (
          <section className="border-t border-border/[0.07] py-12 sm:py-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Animation and more</p>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Popular anime</h2>
              </div>
              <Link to="/anime" className="inline-flex items-center gap-1.5 pb-1 text-sm font-medium text-muted transition-colors hover:text-primary-300">
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {popularAnime.results.slice(0, 6).map((media: any) => (
                <MediaCard key={`${media.provider}-${media.provider_id}`} media={media} />
              ))}
            </div>
          </section>
        )}

        <section className="py-14 sm:py-16">
          <div className="mb-9 max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">Made for your watchlist</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground-strong sm:text-3xl">Everything you watch, in one place.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3 md:gap-7">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffd93d]/[0.09] text-brand-muted">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground-strong">{title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-14 pt-1 sm:pb-16">
          <div className="flex flex-col gap-6 rounded-2xl bg-surface p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">Get started</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground-strong sm:text-3xl">Give every watch a place.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Save titles, track your progress, and keep your next watch close.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={isAuthenticated ? '/library' : '/signup'}
                className="inline-flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors hover:brightness-105" style={{ backgroundColor: '#FFD93D', color: '#11141b' }}
              >
                {isAuthenticated ? 'Open your library' : 'Create free account'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/discover" className="inline-flex h-12 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:text-foreground-strong">
                Browse titles
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage




