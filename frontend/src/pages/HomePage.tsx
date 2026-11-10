import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, Clock, Pause, Play, Star } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { TrailerButton } from '@/components/media/TrailerButton'
import { MediaSynopsis } from '@/components/media/MediaSynopsis'
import { formatMediaRating, getMediaTypeLabel } from '@/utils/media'
import { getBackdropImageUrl } from '@/utils/mediaImages'
import { YoutubeBackgroundPlayer } from '@/components/media/YoutubeBackgroundPlayer'
import { canAutoplayBackgroundVideo, getYoutubeVideoId } from '@/utils/youtube'
import { CommunityFeedbackSection } from '@/components/home/CommunityFeedbackSection'
import { MediaRail } from '@/components/home/MediaRail'
import { ContinueWatchingRail } from '@/components/home/ContinueWatchingRail'
import { StreamingProviderRail } from '@/components/home/StreamingProviderRail'
import type { Media } from '@/types'

const mediaHref = (media?: { id?: string; provider?: string; provider_id?: number; media_type?: string }) => {
  if (media?.id) return `/media/${media.id}`
  if (media?.provider && media.provider_id && media.media_type) {
    return `/media/fetch?provider=${media.provider}&id=${media.provider_id}&type=${media.media_type}`
  }
  return '/discover'
}

const HomePage = () => {
  const [autoplayAllowed] = useState(canAutoplayBackgroundVideo)
  const [isBackgroundTrailerPlaying, setIsBackgroundTrailerPlaying] = useState(autoplayAllowed)
  const [unavailableTrailerId, setUnavailableTrailerId] = useState<string | null>(null)
  const { data: trending, isLoading } = useQuery({
    queryKey: ['home', 'trending', 'all'],
    queryFn: () => mediaService.getTrending('all', 1),
    retry: 2,
  })
  const { data: popularMovies } = useQuery({
    queryKey: ['home', 'popular', 'movie', 'popular'],
    queryFn: () => mediaService.getPopular('movie', 1),
    retry: 1,
  })
  const { data: bollywoodMovies } = useQuery({
    queryKey: ['home', 'popular', 'movie', 'bollywood'],
    queryFn: () => mediaService.getPopular('movie', 1, 'bollywood'),
    retry: 1,
  })
  const { data: popularAnime } = useQuery({
    queryKey: ['home', 'popular', 'anime'],
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

  return (
    <div className="bg-background text-foreground">
      <section className="home-hero relative isolate min-h-[620px] overflow-hidden md:min-h-[700px]">
        <div className="absolute inset-0 overflow-hidden">
          {heroImage && (
            <img
              src={getBackdropImageUrl(heroImage)}
              alt=""
              className="home-hero-image absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
              fetchPriority="high"
            />
          )}
          {showBackgroundTrailer && trailerVideoId && (
            <YoutubeBackgroundPlayer
              videoId={trailerVideoId}
              onUnavailable={() => setUnavailableTrailerId(trailerVideoId)}
              className="home-hero-image home-hero-image--trailer pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-110"
            />
          )}
        </div>
        <div className="home-hero-overlay-left absolute inset-0" />
        <div className="home-hero-overlay-bottom absolute inset-0" />

        <div className="container-custom relative z-10 flex min-h-[620px] items-center py-20 md:min-h-[700px]">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 border-l-2 border-primary-600 pl-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">
              <span>{featured ? 'Featured title' : 'Welcome to Watchloom'}</span>
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.03] tracking-tight text-foreground-strong sm:text-6xl lg:text-7xl">
              {featured?.title || 'Stories worth your time.'}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              {featuredRating && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-primary-400 text-primary-400" />
                  <span className="font-semibold text-foreground-strong">{featuredRating}</span>
                </span>
              )}
              {featured?.release_date && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {new Date(featured.release_date).getFullYear()}
                </span>
              )}
              {featured?.media_type && (
                <span>{getMediaTypeLabel(featured)}</span>
              )}
            </div>
            {featured?.synopsis ? (
              <MediaSynopsis synopsis={featured.synopsis} className="mt-5 line-clamp-3 max-w-xl text-base leading-7 text-muted sm:text-lg" />
            ) : (
              <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
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
                  className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-[#11150d] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
                  style={{ backgroundColor: 'var(--watchloom-primary)' }}
                />
              ) : (
                <Link
                  to="/discover"
                  className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-[#11150d]"
                  style={{ backgroundColor: 'var(--watchloom-primary)' }}
                >
                  Browse titles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                to={mediaHref(featured)}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border/15 bg-surface/70 px-5 text-sm font-semibold text-foreground-strong backdrop-blur transition-colors hover:bg-surface"
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
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/20 bg-surface/70 text-foreground-strong backdrop-blur transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
                >
                  {isBackgroundTrailerPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                </button>
              )}
            </div>
            <StreamingProviderRail />
          </div>
        </div>
      </section>

      <div className="container-custom">
        <MediaRail
          eyebrow="A good place to start"
          title="Trending now"
          items={trending?.results as Media[] | undefined}
          to="/discover"
          isLoading={isLoading}
          emptyMessage="The catalog could not be reached. Your trending picks will appear here when it reconnects."
        />

        <ContinueWatchingRail />

        {movieResults.length > 0 && (
          <MediaRail
            eyebrow="On the big screen"
            title={popularMovies?.results?.length ? 'Popular movies' : 'Movies trending now'}
            items={movieResults as Media[]}
            to="/movies"
          />
        )}

        {bollywoodMovies && bollywoodMovies.results.length > 0 && (
          <MediaRail
            eyebrow="Indian cinema · Hindi language"
            title="Bollywood picks"
            items={bollywoodMovies.results as Media[]}
            to="/movies?collection=bollywood"
          />
        )}

        {popularAnime && popularAnime.results.length > 0 && (
          <MediaRail eyebrow="Animation and more" title="Popular anime" items={popularAnime.results as Media[]} to="/anime" />
        )}

        <CommunityFeedbackSection />
      </div>
    </div>
  )
}

export default HomePage




