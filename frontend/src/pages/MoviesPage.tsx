import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { WatchProviderLogo } from '@/components/media/WatchProviderLogo'
import { MediaCollectionPage } from '@/components/media/MediaCollectionPage'
import { mediaService } from '@/services/mediaService'
import type { MovieCollection } from '@/types'

const movieCollections: Array<{
  value: MovieCollection
  label: string
  eyebrow: string
  title: string
  description: string
}> = [
  {
    value: 'popular',
    label: 'All movies',
    eyebrow: 'Around the world',
    title: 'Popular movies',
    description: 'Big releases, audience favorites, and films gaining attention around the world.',
  },
  {
    value: 'top_rated',
    label: 'Top rated',
    eyebrow: 'Audience favorites',
    title: 'Top rated movies',
    description: 'Highly rated films with enough audience ratings to make the list meaningful.',
  },
  {
    value: 'hollywood',
    label: 'Hollywood',
    eyebrow: 'United States · English',
    title: 'Hollywood',
    description: 'Popular English-language films from the United States, sorted by current popularity.',
  },
  {
    value: 'bollywood',
    label: 'Bollywood',
    eyebrow: 'India · Hindi',
    title: 'Bollywood',
    description: 'Hindi-language cinema from India, from popular new releases to audience favorites.',
  },
  {
    value: 'tollywood',
    label: 'Tollywood',
    eyebrow: 'India · Telugu',
    title: 'Tollywood',
    description: 'Telugu-language films from India, including current hits and popular favorites.',
  },
  {
    value: 'malayalam',
    label: 'Malayalam',
    eyebrow: 'India · Malayalam',
    title: 'Malayalam cinema',
    description: 'Popular Malayalam-language films from India.',
  },
  {
    value: 'tamil',
    label: 'Tamil',
    eyebrow: 'India · Tamil',
    title: 'Tamil cinema',
    description: 'Popular Tamil-language films from India.',
  },
  {
    value: 'kannada',
    label: 'Kannada',
    eyebrow: 'India · Kannada',
    title: 'Kannada cinema',
    description: 'Popular Kannada-language films from India.',
  },
  {
    value: 'bengali',
    label: 'Bengali',
    eyebrow: 'India · Bengali',
    title: 'Bengali cinema',
    description: 'Popular Bengali-language films from India.',
  },
  {
    value: 'marathi',
    label: 'Marathi',
    eyebrow: 'India · Marathi',
    title: 'Marathi cinema',
    description: 'Popular Marathi-language films from India.',
  },
  {
    value: 'ott',
    label: 'OTT in India',
    eyebrow: 'Streaming · India',
    title: 'Popular on OTT',
    description: 'Popular films available to stream in India, based on TMDB streaming availability data.',
  },
]

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCollection = searchParams.get('collection')
  const activeCollection = movieCollections.find(({ value }) => value === requestedCollection)?.value ?? 'popular'
  const selected = movieCollections.find(({ value }) => value === activeCollection) ?? movieCollections[0]
  const region = searchParams.get('region') === 'US' ? 'US' : 'IN'
  const requestedProviderId = Number(searchParams.get('provider_id'))
  const providersQuery = useQuery({
    queryKey: ['movie-watch-providers', region],
    queryFn: () => mediaService.getMovieWatchProviders(region),
    enabled: activeCollection === 'ott',
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  })
  const providers = providersQuery.data ?? []
  const selectedProvider = providers.find(({ provider_id }) => provider_id === requestedProviderId)
  const regionLabel = region === 'IN' ? 'India' : 'United States'

  const selectCollection = (nextCollection: MovieCollection) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextCollection === 'popular') nextParams.delete('collection')
    else nextParams.set('collection', nextCollection)
    if (nextCollection !== 'ott') {
      nextParams.delete('provider_id')
      nextParams.delete('region')
    }
    setSearchParams(nextParams)
  }

  const selectProvider = (providerId?: number) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('collection', 'ott')
    if (providerId) nextParams.set('provider_id', providerId.toString())
    else nextParams.delete('provider_id')
    setSearchParams(nextParams)
  }

  const selectRegion = (nextRegion: 'IN' | 'US') => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('collection', 'ott')
    nextParams.set('region', nextRegion)
    nextParams.delete('provider_id')
    setSearchParams(nextParams)
  }

  return (
    <MediaCollectionPage
      mediaType="movie"
      collection={activeCollection}
      providerId={activeCollection === 'ott' && selectedProvider ? selectedProvider.provider_id : undefined}
      region={region}
      eyebrow={activeCollection === 'ott' ? `Streaming · ${regionLabel}` : selected.eyebrow}
      title={activeCollection === 'ott' && selectedProvider ? `${selectedProvider.provider_name} movies` : selected.title}
      description={activeCollection === 'ott'
        ? selectedProvider
          ? `Popular movies available on ${selectedProvider.provider_name} in ${regionLabel}.`
          : `Popular movies available to stream in ${regionLabel}. Choose a service to narrow the list.`
        : selected.description}
      toolbar={(
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a movie collection">
            {movieCollections.map(({ value, label }) => {
              const isSelected = activeCollection === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectCollection(value)}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${isSelected ? 'bg-primary-500 text-[#11150d]' : 'border border-border/[0.1] bg-surface text-muted-foreground hover:text-foreground-strong'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {activeCollection === 'ott' && (
            <section aria-label="Filter by streaming service" className="rounded-xl border border-border/[0.08] bg-surface/55 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground-strong">Choose a streaming service</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Only services with movie availability in this region are shown.</p>
                </div>
                <div className="inline-flex rounded-lg border border-border/[0.1] bg-background p-1" role="group" aria-label="Streaming availability region">
                  {([
                    ['IN', 'India'],
                    ['US', 'United States'],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={region === value}
                      onClick={() => selectRegion(value)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${region === value ? 'bg-surface text-foreground-strong shadow-sm' : 'text-muted-foreground hover:text-foreground-strong'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {providersQuery.isLoading ? (
                <p role="status" className="text-sm text-muted-foreground">Loading services…</p>
              ) : providersQuery.isError ? (
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Streaming services couldn’t load.</span>
                  <button type="button" onClick={() => { void providersQuery.refetch() }} className="font-medium text-foreground-strong underline underline-offset-4">Try again</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" role="group" aria-label="Streaming providers">
                  <button
                    type="button"
                    aria-pressed={!selectedProvider}
                    onClick={() => selectProvider()}
                    className={`flex min-h-12 items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${!selectedProvider ? 'border-primary-500/45 bg-primary-500/[0.08] text-foreground-strong' : 'border-border/[0.1] bg-background/60 text-muted-foreground hover:bg-surface hover:text-foreground-strong'}`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface text-xs font-semibold">All</span>
                    All services
                  </button>
                  {providers.map((provider) => {
                    const isSelected = selectedProvider?.provider_id === provider.provider_id
                    return (
                      <button
                        key={provider.provider_id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => selectProvider(provider.provider_id)}
                        className={`flex min-h-12 min-w-0 items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${isSelected ? 'border-primary-500/45 bg-primary-500/[0.08] text-foreground-strong' : 'border-border/[0.1] bg-background/60 text-muted-foreground hover:bg-surface hover:text-foreground-strong'}`}
                      >
                        <WatchProviderLogo provider={provider} size="sm" />
                        <span className="truncate">{provider.provider_name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    />
  )
}

export default MoviesPage
