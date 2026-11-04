import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, Clock, Pause, Play, Star } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { TrailerButton } from '@/components/media/TrailerButton'
import { MediaSynopsis } from '@/components/media/MediaSynopsis'
import { formatMediaRating } from '@/utils/media'
import { YoutubeBackgroundPlayer } from '@/components/media/YoutubeBackgroundPlayer'
import { canAutoplayBackgroundVideo, getYoutubeVideoId } from '@/utils/youtube'
import { CommunityFeedbackSection } from '@/components/home/CommunityFeedbackSection'
import { MediaRail } from '@/components/home/MediaRail'
import { ContinueWatchingRail } from '@/components/home/ContinueWatchingRail'
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

        {popularAnime?.results?.length > 0 && (
          <MediaRail eyebrow="Animation and more" title="Popular anime" items={popularAnime.results as Media[]} to="/anime" />
        )}

        <CommunityFeedbackSection />
      </div>
    </div>
  )
}

export default HomePage




