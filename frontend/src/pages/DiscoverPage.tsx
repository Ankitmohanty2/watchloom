import { useEffect, useMemo, useRef, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, LoaderCircle, Search, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mediaService } from '@/services/mediaService'
import { MediaCard } from '@/components/media/MediaCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MediaGridSkeleton } from '@/components/ui/Skeleton'
import type { Media } from '@/types'
import { formatMediaRating, getMediaRuntimeLabel, getMediaTypeLabel } from '@/utils/media'
import { MediaSynopsis } from '@/components/media/MediaSynopsis'
import { getBackdropImageUrl, getPosterImageUrl } from '@/utils/mediaImages'

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
  const [page, setPage] = useState(1)
  const browseSectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300)
    return () => window.clearTimeout(timeout)
  }, [searchQuery])

  const trending = useQuery({
    queryKey: ['discover', 'trending', mediaType || 'all', page],
    queryFn: () => mediaService.getTrending(mediaType || 'all', page),
    enabled: !activeSearch,
    placeholderData: keepPreviousData,
  })

  const searchResults = useQuery({
    queryKey: ['discover', 'search-results', activeSearch, mediaType, page],
    queryFn: () => mediaService.search(activeSearch, mediaType || undefined, page),
    enabled: !!activeSearch,
    placeholderData: keepPreviousData,
  })

  const {
    data: suggestionData,
    isFetching: suggestionsLoading,
    isError: suggestionsError,
    refetch: retrySuggestions,
  } = useQuery({
    queryKey: ['discover', 'search-suggestions', debouncedQuery, mediaType],
    queryFn: () => mediaService.search(debouncedQuery, mediaType || undefined, 1),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
    retry: false,
  })

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(1)
    setActiveSearch(searchQuery.trim())
    setIsSearchFocused(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveSearch('')
    setDebouncedQuery('')
    setPage(1)
  }

  const navigateToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage === page) return
    setPage(nextPage)
    window.requestAnimationFrame(() => browseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const normalizedSearch = searchQuery.trim()
  const showSuggestions = isSearchFocused && normalizedSearch.length >= 2 && !activeSearch
  const suggestions = (suggestionData?.results ?? []).slice(0, 6) as Media[]

  const resultsQuery = activeSearch ? searchResults : trending
  const responsePage = resultsQuery.data
  const items: Media[] = useMemo(() => {
    const seen = new Set<string>()
    return (responsePage?.results ?? []).filter((media) => {
      const key = `${media.provider}:${media.provider_id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [responsePage])
  const isLoading = resultsQuery.isLoading
  const isError = resultsQuery.isError && !responsePage
  const hasNextPage = responsePage?.has_next_page ?? false
  const isChangingPage = resultsQuery.isFetching && resultsQuery.isPlaceholderData && !resultsQuery.isError
  const featured = page === 1 ? items[0] : undefined
  const featuredRating = formatMediaRating(featured?.rating, featured?.media_type)
  const featuredRuntime = featured ? getMediaRuntimeLabel(featured) : null
  const remainingItems = items.slice(featured ? 1 : 0)

  return (
    <div className="relative isolate bg-background text-foreground">
      <main className="container-custom pb-20 pt-8 sm:pt-12">
        <div className="mb-7 flex flex-col gap-5 border-b border-border/[0.08] pb-6 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
              <span>Your next watch starts here</span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-[-0.035em] text-foreground-strong sm:text-[2.5rem]">
              Discover something great.
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Find your next film, series, or anime to fall into.
            </p>
          </div>
          <div className="text-xs text-muted-foreground md:pb-1">
            Films <span className="px-1.5 text-border">/</span> Series <span className="px-1.5 text-border">/</span> Anime
          </div>
        </div>

        <section aria-label="Search and browse media" className="mb-8 border-b border-border/[0.08] pb-5">
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
                setPage(1)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setIsSearchFocused(false)
              }}
              className="h-12 w-full rounded-lg border border-border/[0.12] bg-surface/50 pl-11 pr-24 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary-500/50 focus:bg-surface focus:ring-2 focus:ring-primary-500/10 sm:h-[52px]"
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
              className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-full px-4 text-sm font-semibold text-[#11150d] transition-colors hover:brightness-95 sm:right-2 sm:h-10" style={{ backgroundColor: 'var(--watchloom-primary)' }}
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
                    <LoaderCircle className="h-4 w-4 animate-spin text-accent-foreground" />
                    Searching for “{normalizedSearch}”…
                  </div>
                ) : suggestionsError ? (
                  <div className="flex items-center justify-between gap-4 px-4 py-4 text-sm text-muted-foreground">
                    <span>Suggestions are unavailable right now.</span>
                    <button type="button" onClick={() => retrySuggestions()} className="shrink-0 font-medium text-accent-foreground hover:text-foreground-strong">
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
                                  <img src={getPosterImageUrl(media.poster_path)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center"><Search className="h-4 w-4 text-muted-foreground" /></div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground-strong">{media.title}</p>
                                <p className="mt-1 text-xs capitalize text-muted-foreground">
                                  {getMediaTypeLabel(media)}{year ? ` · ${year}` : ''}
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
                      className="flex w-full items-center justify-between border-t border-border/[0.07] px-4 py-3 text-left text-sm font-medium text-accent-foreground transition-colors hover:bg-hover/[0.04]"
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
                  onClick={() => { setMediaType(filter.value); setPage(1) }}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    selected
                    ? 'bg-hover/[0.08] text-foreground-strong'
                      : 'text-muted-foreground hover:text-foreground-strong'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </section>

        {isLoading ? (
          <>
            <div className="skeleton mb-10 min-h-[340px] rounded-[1.75rem] sm:min-h-[390px]" aria-hidden="true" />
            <MediaGridSkeleton />
          </>
        ) : isError ? (
          <div className="rounded-2xl border border-border/[0.07] bg-surface/70 px-6 py-14 text-center">
            <h2 className="font-display text-xl font-semibold text-foreground-strong">The catalog is unavailable</h2>
            <p className="mt-2 text-sm text-muted-foreground">Try again in a moment.</p>
            <button onClick={() => { void resultsQuery.refetch() }} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border/15 px-4 py-2 text-sm font-medium text-foreground-strong transition hover:bg-hover/[0.06]">
              <ArrowUpRight className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : items.length > 0 ? (
          <>
            {featured && (
            <section aria-label="Featured title" className="discover-featured group relative mb-10 min-h-[340px] overflow-hidden rounded-[1.75rem] shadow-[0_18px_50px_rgba(0,0,0,0.18)] ring-1 ring-border/10 sm:min-h-[390px]">
              {featured.backdrop_path || featured.poster_path ? (
                <img
                  src={getBackdropImageUrl(featured.backdrop_path || featured.poster_path)}
                  alt=""
                  className="discover-featured-image absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.015]"
                />
              ) : null}
              <div className="discover-featured-overlay absolute inset-0" />
              <div className="cinema-scope relative flex min-h-[340px] max-w-2xl flex-col justify-end p-6 sm:min-h-[390px] sm:p-9 lg:p-11">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary-500/30 bg-black/35 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-foreground backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                  {activeSearch ? 'Search match' : 'Trending right now'}
                </div>
                <h2 className="max-w-xl font-display text-3xl font-semibold leading-[1.05] tracking-tight text-foreground-strong sm:text-4xl lg:text-5xl">
                  {featured.title}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
                  {featured.release_date && <span>{new Date(featured.release_date).getFullYear()}</span>}
                  {featured.release_date && <span className="h-1 w-1 rounded-full bg-muted-foreground" />}
                  <span>{getMediaTypeLabel(featured)}</span>
                  {featuredRuntime && (
                    <span className="inline-flex items-center gap-1.5 border-l border-border/20 pl-3">
                      <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />{featuredRuntime}
                    </span>
                  )}
                  {featuredRating && (
                    <span className="inline-flex items-center gap-1.5 border-l border-border/20 pl-3 text-foreground-strong">
                      <Star className="h-3.5 w-3.5 fill-primary-400 text-primary-400" />
                      {featuredRating}
                    </span>
                  )}
                </div>
                {featured.synopsis && (
                  <MediaSynopsis synopsis={featured.synopsis} className="mt-4 line-clamp-3 max-w-lg text-sm leading-6 text-muted sm:text-[15px]" />
                )}
                {featured.genres?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {featured.genres.slice(0, 3).map((genre) => (
                      <span key={genre} className="rounded-full border border-border/15 bg-surface/65 px-2.5 py-1 text-[11px] text-foreground backdrop-blur">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to={getMediaLink(featured)}
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-semibold text-[#11150d] transition hover:bg-primary-400"
                >
                  Explore title
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
            )}

            <section ref={browseSectionRef} aria-label="Browse titles" className="scroll-mt-28">
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
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {isChangingPage && <span className="inline-flex items-center gap-2" role="status"><LoadingSpinner size="sm" className="border-primary-500/25 border-t-primary-500" /> Loading page {page}</span>}
                    <span>{items.length} titles on this page</span>
                  </div>
                )}
              </div>
              {resultsQuery.isError && responsePage && (
                <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.04] px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Page {page} didn’t load. Your current titles are still here.</span>
                  <button type="button" onClick={() => { void resultsQuery.refetch() }} className="font-medium text-foreground-strong underline decoration-border underline-offset-4 hover:decoration-current">Retry</button>
                </div>
              )}
              {remainingItems.length > 0 ? (
                <div aria-busy={isChangingPage} className={`grid grid-cols-2 gap-x-4 gap-y-7 transition-opacity duration-200 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ${isChangingPage ? 'pointer-events-none opacity-45' : ''}`}>
                  {remainingItems.map((media) => (
                    <MediaCard key={`${media.provider}-${media.provider_id}`} media={media} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border/[0.07] bg-surface/60 px-6 py-10 text-center text-sm text-muted-foreground">
                  {activeSearch ? 'That’s the only match for now. Try another title or switch category.' : 'More titles are on the way.'}
                </div>
              )}
              {(page > 1 || hasNextPage) && (
                <nav aria-label="Discover result pages" className="mt-10 flex flex-col items-center gap-3 border-t border-border/[0.08] pt-6">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigateToPage(page - 1)}
                      disabled={page === 1 || isChangingPage}
                      aria-label="Previous page"
                      className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-hover/[0.06] hover:text-foreground-strong disabled:pointer-events-none disabled:opacity-35"
                    >
                      <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span>
                    </button>
                    {page > 3 && <>
                      <button type="button" onClick={() => navigateToPage(1)} disabled={isChangingPage} className="h-10 min-w-10 rounded-lg px-3 text-sm text-muted-foreground transition hover:bg-hover/[0.06] hover:text-foreground-strong disabled:opacity-50">1</button>
                      <span aria-hidden="true" className="px-1 text-muted-foreground/60">…</span>
                    </>}
                    {Array.from({ length: Math.min(3, page) }, (_, index) => page - Math.min(2, page - 1) + index).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => navigateToPage(pageNumber)}
                        disabled={isChangingPage}
                        aria-current={pageNumber === page ? 'page' : undefined}
                        className={`h-10 min-w-10 rounded-lg px-3 text-sm font-medium transition disabled:opacity-50 ${pageNumber === page ? 'bg-primary-500 text-[#11150d]' : 'text-muted-foreground hover:bg-hover/[0.06] hover:text-foreground-strong'}`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    {hasNextPage && (
                      <button
                        type="button"
                        onClick={() => navigateToPage(page + 1)}
                        disabled={isChangingPage}
                        aria-label="Next page"
                        className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-hover/[0.06] hover:text-foreground-strong disabled:pointer-events-none disabled:opacity-35"
                      >
                        <span className="hidden sm:inline">Next</span><ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Page {page}{hasNextPage ? '' : ' · End of results'}</p>
                </nav>
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
              <button onClick={clearSearch} className="mt-5 text-sm font-medium text-accent-foreground transition hover:text-foreground-strong">
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





