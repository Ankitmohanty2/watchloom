import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, CalendarDays, Pause, Play, Star } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { TrailerButton } from '@/components/media/TrailerButton'
import { MediaSynopsis } from '@/components/media/MediaSynopsis'
import { formatMediaRating, getMediaTypeLabel } from '@/utils/media'
import { getBackdropImageUrl, getBackdropThumbUrl } from '@/utils/mediaImages'
import { YoutubeBackgroundPlayer } from '@/components/media/YoutubeBackgroundPlayer'
import { canAutoplayBackgroundVideo, getYoutubeVideoId } from '@/utils/youtube'
import { CommunityFeedbackSection } from '@/components/home/CommunityFeedbackSection'
import { MediaRail } from '@/components/home/MediaRail'
import { ContinueWatchingRail } from '@/components/home/ContinueWatchingRail'
import { StreamingProviderRail } from '@/components/home/StreamingProviderRail'
import type { Media } from '@/types'

const SPOTLIGHT_SIZE = 5

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
  const [spotlightIndex, setSpotlightIndex] = useState(0)
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

  // The spotlight needs wide artwork, so titles without a backdrop are left to the rails.
  const withBackdrop = trending?.results?.filter((media) => media.backdrop_path) ?? []
  const spotlight: Media[] = (withBackdrop.length ? withBackdrop : trending?.results ?? []).slice(0, SPOTLIGHT_SIZE)
  const featured = spotlight[Math.min(spotlightIndex, Math.max(spotlight.length - 1, 0))]
  const movieResults = popularMovies?.results?.length
    ? popularMovies.results
    : trending?.results?.filter((media) => media.media_type === 'movie') ?? []
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
      {/* The hero slides under the floating header: 74px tall on phones, 84px from the sm breakpoint. */}
      <section className="home-hero relative isolate -mt-[74px] overflow-hidden sm:-mt-[84px]">
        <div className="absolute inset-0 overflow-hidden">
          {heroImage && (
            <img
              key={heroImage}
              src={getBackdropImageUrl(heroImage)}
              alt=""
              className="home-hero-image absolute inset-0 h-full w-full object-cover object-top"
              fetchPriority="high"
            />
          )}
          {showBackgroundTrailer && trailerVideoId && (
            <YoutubeBackgroundPlayer
              key={trailerVideoId}
              videoId={trailerVideoId}
              onUnavailable={() => setUnavailableTrailerId(trailerVideoId)}
              className="home-hero-image--trailer pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.2]"
            />
          )}
        </div>
        <div className="hero-scrim absolute inset-0" />
        <div className="hero-fade-bottom absolute inset-x-0 bottom-0 h-20" />

        <div className="cinema-scope container-custom relative z-10 flex min-h-[600px] flex-col justify-end pb-24 pt-32 md:min-h-[680px] xl:min-h-[720px]">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-black/35 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              <span>{featured ? 'Trending this week' : 'Welcome to Watchloom'}</span>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground-strong [text-wrap:balance] sm:text-6xl lg:text-7xl">
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
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  {new Date(featured.release_date).getFullYear()}
                </span>
              )}
              {featured?.media_type && (
                <span className="rounded-md border border-border/20 px-2 py-0.5 text-xs font-medium text-foreground">{getMediaTypeLabel(featured)}</span>
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
                  className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-[#11150d] shadow-glow transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
                  style={{ backgroundColor: 'var(--watchloom-primary)' }}
                />
              ) : (
                <Link
                  to="/discover"
                  className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-[#11150d] shadow-glow transition hover:brightness-105"
                  style={{ backgroundColor: 'var(--watchloom-primary)' }}
                >
                  Browse titles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {featured && (
                <Link
                  to={mediaHref(featured)}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border/25 bg-white/10 px-5 text-sm font-semibold text-foreground-strong backdrop-blur transition-colors hover:bg-white/20"
                >
                  Explore title
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
              {trailerVideoId && autoplayAllowed && unavailableTrailerId !== trailerVideoId && (
                <button
                  type="button"
                  onClick={() => setIsBackgroundTrailerPlaying((playing) => !playing)}
                  aria-label={isBackgroundTrailerPlaying ? 'Pause background trailer' : 'Play background trailer'}
                  title={isBackgroundTrailerPlaying ? 'Pause background trailer' : 'Play background trailer'}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/25 bg-white/10 text-foreground-strong backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
                >
                  {isBackgroundTrailerPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                </button>
              )}
            </div>

            {spotlight.length > 1 && (
              <div className="mt-8 flex items-center gap-2 xl:hidden" role="group" aria-label="Choose a featured title">
                {spotlight.map((media, index) => (
                  <button
                    key={`${media.provider}-${media.provider_id}`}
                    type="button"
                    aria-label={`Feature ${media.title}`}
                    aria-pressed={media === featured}
                    onClick={() => setSpotlightIndex(index)}
                    className="flex h-6 items-center"
                  >
                    <span className={`block h-1.5 rounded-full transition-all ${media === featured ? 'w-8 bg-primary-500' : 'w-4 bg-white/35'}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {spotlight.length > 1 && (
            <div className="absolute bottom-24 right-8 hidden items-end gap-2.5 xl:flex" role="group" aria-label="Choose a featured title">
              {spotlight.map((media, index) => {
                const isActive = media === featured
                return (
                  <button
                    key={`${media.provider}-${media.provider_id}`}
                    type="button"
                    aria-label={`Feature ${media.title}`}
                    aria-pressed={isActive}
                    title={media.title}
                    onClick={() => setSpotlightIndex(index)}
                    className={`relative aspect-video overflow-hidden rounded-lg bg-surface-alt transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${isActive ? 'w-[132px] ring-2 ring-primary-500' : 'w-[104px] opacity-60 ring-1 ring-white/20 hover:opacity-100'}`}
                  >
                    <img
                      src={getBackdropThumbUrl(media.backdrop_path || media.poster_path)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-2 pb-1.5 pt-5 text-left text-[10px] font-semibold text-white">
                      {media.title}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <div className="container-custom pb-6">
        <StreamingProviderRail />

        <MediaRail
          eyebrow="A good place to start"
          title="Trending now"
          items={trending?.results}
          to="/discover"
          isLoading={isLoading}
          emptyMessage="The catalog could not be reached. Your trending picks will appear here when it reconnects."
        />

        <ContinueWatchingRail />

        {movieResults.length > 0 && (
          <MediaRail
            eyebrow="On the big screen"
            title={popularMovies?.results?.length ? 'Popular movies' : 'Movies trending now'}
            items={movieResults}
            to="/movies"
          />
        )}

        {bollywoodMovies && bollywoodMovies.results.length > 0 && (
          <MediaRail
            eyebrow="Indian cinema · Hindi language"
            title="Bollywood picks"
            items={bollywoodMovies.results}
            to="/movies?collection=bollywood"
          />
        )}

        {popularAnime && popularAnime.results.length > 0 && (
          <MediaRail eyebrow="Animation and more" title="Popular anime" items={popularAnime.results} to="/anime" />
        )}

        <CommunityFeedbackSection />
      </div>
    </div>
  )
}

export default HomePage
