import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, LoaderCircle, Search, Sparkles, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mediaService } from '@/services/mediaService'
import { MediaCard } from '@/components/media/MediaCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Media } from '@/types'
import { formatMediaRating } from '@/utils/media'
import { MediaSynopsis } from '@/components/media/MediaSynopsis'

const mediaFilters = [
  { label: 'Everything', value: '' },
  { label: 'Movies', value: 'movie' },
  { label: 'Series', value: 'tv' },
  { label: 'Anime', value: 'anime' },
]

const getMediaLink = (media: Media) => media.id
  ? `/media/${media.id}`
  : `/media/fetch?provider=${media.provider}&id=${media.provider_id}&type=${media.media_type}`

const DiscoverPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [mediaType, setMediaType] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300)
    return () => window.clearTimeout(timeout)
  }, [searchQuery])

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending', mediaType || 'all'],
    queryFn: () => mediaService.getTrending(mediaType || 'all', 1),
    enabled: !activeSearch,
  })

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search', activeSearch, mediaType],
    queryFn: () => mediaService.search(activeSearch, mediaType || undefined, 1),
    enabled: !!activeSearch,
  })

  const {
    data: suggestionData,
    isFetching: suggestionsLoading,
    isError: suggestionsError,
    refetch: retrySuggestions,
  } = useQuery({
    queryKey: ['search', debouncedQuery, mediaType],
    queryFn: () => mediaService.search(debouncedQuery, mediaType || undefined, 1),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
    retry: false,
  })

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setActiveSearch(searchQuery.trim())
    setIsSearchFocused(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveSearch('')
    setDebouncedQuery('')
  }

  const normalizedSearch = searchQuery.trim()
  const showSuggestions = isSearchFocused && normalizedSearch.length >= 2 && !activeSearch
  const suggestions = (suggestionData?.results ?? []).slice(0, 6) as Media[]

  const response = activeSearch ? searchResults : trending
  const isLoading = activeSearch ? searchLoading : trendingLoading
  const items: Media[] = response?.results ?? []
  const featured = items[0]
  const featuredRating = formatMediaRating(featured?.rating, featured?.media_type)
  const remainingItems = items.slice(featured ? 1 : 0)

  return (
    <div className="relative isolate bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,_rgba(255,217,61,0.07),_transparent_62%)]" />
      <main className="container-custom relative pb-20 pt-10 sm:pt-14">
        <div className="mb-8 flex flex-col gap-7 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Your next watch starts here</span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground-strong sm:text-4xl">
              Discover something great.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Find your next film, series, or anime to fall into.
            </p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Movies · series · anime
          </div>
        </div>

        <section aria-label="Search and browse media" className="mb-9 rounded-2xl border border-border/[0.08] bg-surface/90 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-4">
          <form
            onSubmit={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsSearchFocused(false)
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              aria-label="Search movies, series, and anime"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="discover-search-suggestions"
              placeholder="Search titles, people, or genres..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setActiveSearch('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setIsSearchFocused(false)
              }}
              className="h-12 w-full rounded-xl border border-border/[0.08] bg-background pl-11 pr-24 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 sm:h-[52px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-[86px] top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:bg-hover/[0.05] hover:text-foreground-strong"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-lg px-4 text-sm font-semibold transition-colors hover:brightness-105 sm:right-2 sm:h-10" style={{ backgroundColor: '#FFD93D', color: '#11141b' }}
            >
              Search
            </button>

            {showSuggestions && (
              <div
                id="discover-search-suggestions"
                role="region"
                aria-label="Search suggestions"
                className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border/[0.1] bg-surface/95 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl"
              >
                {normalizedSearch !== debouncedQuery || suggestionsLoading ? (
                  <div role="status" className="flex items-center gap-3 px-4 py-4 text-sm text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin text-primary-400" />
                    Searching for “{normalizedSearch}”…
                  </div>
                ) : suggestionsError ? (
                  <div className="flex items-center justify-between gap-4 px-4 py-4 text-sm text-muted-foreground">
                    <span>Suggestions are unavailable right now.</span>
                    <button type="button" onClick={() => retrySuggestions()} className="shrink-0 font-medium text-primary-400 hover:text-primary-300">
                      Try again
                    </button>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <ul className="divide-y divide-border/[0.08]">
                      {suggestions.map((media) => {
                        const rating = formatMediaRating(media.rating, media.media_type)
                        const year = media.release_date ? new Date(media.release_date).getFullYear() : null
                        return (
                          <li key={`${media.provider}-${media.provider_id}`}>
                            <Link
                              to={getMediaLink(media)}
                              onClick={() => setIsSearchFocused(false)}
                              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-hover/[0.05] focus-visible:bg-hover/[0.05] focus-visible:outline-none sm:px-4"
                            >
                              <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-hover/[0.06]">
                                {media.poster_path ? (
                                  <img src={media.poster_path} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center"><Search className="h-4 w-4 text-muted-foreground" /></div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground-strong">{media.title}</p>
                                <p className="mt-1 text-xs capitalize text-muted-foreground">
                                  {media.media_type === 'tv' ? 'Series' : media.media_type}{year ? ` · ${year}` : ''}
                                </p>
                              </div>
                              {rating && (
                                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted">
                                  <Star className="h-3 w-3 fill-primary-400 text-primary-400" />{rating}
                                </span>
                              )}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-between border-t border-border/[0.07] px-4 py-3 text-left text-sm font-medium text-primary-300 transition-colors hover:bg-hover/[0.04]"
                    >
                      See all results for “{normalizedSearch}”
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-4 text-sm text-muted-foreground">No matches yet for “{normalizedSearch}”. Press Enter to search anyway.</div>
                )}
              </div>
            )}
          </form>

          <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5" role="group" aria-label="Filter by media type">
            {mediaFilters.map((filter) => {
              const selected = mediaType === filter.value
              return (
                <button
                  key={filter.value || 'all'}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMediaType(filter.value)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    selected
                      ? 'bg-hover/[0.09] text-foreground-strong'
                      : 'text-muted-foreground hover:bg-hover/[0.04] hover:text-foreground-strong'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </section>

        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-border/[0.06] bg-surface/70">
            <LoadingSpinner size="lg" />
          </div>
        ) : featured ? (
          <>
            <section aria-label="Featured title" className="group relative mb-10 min-h-[340px] overflow-hidden rounded-2xl border border-border/[0.08] bg-surface-hover sm:min-h-[390px]">
              {featured.backdrop_path || featured.poster_path ? (
                <img
                  src={featured.backdrop_path || featured.poster_path}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-75 transition-transform duration-700 group-hover:scale-[1.015]"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12] via-[#0b0d12]/85 to-[#0b0d12]/15" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12]/80 via-transparent to-[#0b0d12]/10" />
              <div className="relative flex min-h-[340px] max-w-2xl flex-col justify-end p-6 sm:min-h-[390px] sm:p-9 lg:p-11">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary-500/25 bg-background/65 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-300 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                  {activeSearch ? 'Search match' : 'Trending right now'}
                </div>
                <h2 className="max-w-xl font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {featured.title}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-300">
                  {featured.release_date && <span>{new Date(featured.release_date).getFullYear()}</span>}
                  {featured.release_date && <span className="h-1 w-1 rounded-full bg-slate-500" />}
                  <span className="capitalize">{featured.media_type === 'tv' ? 'Series' : featured.media_type}</span>
                  {featuredRating && (
                    <span className="inline-flex items-center gap-1.5 border-l border-border/20 pl-3 text-white">
                      <Star className="h-3.5 w-3.5 fill-primary-400 text-primary-400" />
                      {featuredRating}
                    </span>
                  )}
                </div>
                {featured.synopsis && (
                  <MediaSynopsis synopsis={featured.synopsis} className="mt-4 line-clamp-3 max-w-lg text-sm leading-6 text-slate-300/90 sm:text-[15px]" />
                )}
                {featured.genres?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {featured.genres.slice(0, 3).map((genre) => (
                      <span key={genre} className="rounded-full border border-border/15 bg-hover/[0.06] px-2.5 py-1 text-[11px] text-slate-200">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to={getMediaLink(featured)}
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-[#11141b] transition hover:bg-primary-300"
                >
                  Explore title
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section aria-label="Browse titles">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {activeSearch ? 'Search' : 'Discover'}
                  </p>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-foreground-strong sm:text-2xl">
                    {activeSearch ? `More results for “${activeSearch}”` : 'Trending picks'}
                  </h2>
                </div>
                {remainingItems.length > 0 && (
                  <span className="text-xs text-muted-foreground">{remainingItems.length} titles</span>
                )}
              </div>
              {remainingItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {remainingItems.map((media) => (
                    <MediaCard key={`${media.provider}-${media.provider_id}`} media={media} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border/[0.07] bg-surface/60 px-6 py-10 text-center text-sm text-muted-foreground">
                  {activeSearch ? 'That’s the only match for now. Try another title or switch category.' : 'More titles are on the way.'}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="rounded-2xl border border-border/[0.07] bg-surface/70 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-hover/[0.05]">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground-strong">No titles found</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Try a different search or choose another category to see what’s playing.
            </p>
            {activeSearch && (
              <button onClick={clearSearch} className="mt-5 text-sm font-medium text-primary-400 transition hover:text-primary-300">
                Clear search
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default DiscoverPage





