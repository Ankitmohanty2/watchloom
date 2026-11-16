import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { parseWatchProviderId } from '@/utils/watchProviders'
import { OttProviderPicker } from '@/components/media/OttProviderPicker'
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
  const requestedProviderId = parseWatchProviderId(searchParams.get('provider_id'))
  const activeCollection = movieCollections.find(({ value }) => value === requestedCollection)?.value ?? 'popular'
  const collectionForFetch: MovieCollection = requestedProviderId ? 'ott' : activeCollection
  const selected = movieCollections.find(({ value }) => value === collectionForFetch) ?? movieCollections[0]
  const region = searchParams.get('region') === 'US' ? 'US' : 'IN'
  const providersQuery = useQuery({
    queryKey: ['movie-watch-providers', region],
    queryFn: () => mediaService.getMovieWatchProviders(region),
    enabled: collectionForFetch === 'ott',
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  })
  const providers = providersQuery.data ?? []
  const selectedProvider = requestedProviderId
    ? providers.find(({ provider_id }) => provider_id === requestedProviderId)
    : undefined
  const ottProviderId = collectionForFetch === 'ott' ? requestedProviderId : undefined
  const regionLabel = region === 'IN' ? 'India' : 'United States'

  // Deep links from the home rail should always open the OTT view with a region set.
  useEffect(() => {
    if (!requestedProviderId) return
    const next = new URLSearchParams(searchParams)
    let changed = false
    if (searchParams.get('collection') !== 'ott') {
      next.set('collection', 'ott')
      changed = true
    }
    if (!searchParams.get('region')) {
      next.set('region', 'IN')
      changed = true
    }
    if (changed) setSearchParams(next, { replace: true })
  }, [requestedProviderId, searchParams, setSearchParams])

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
    window.requestAnimationFrame(() => {
      document.getElementById('media-collection-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
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
      collection={collectionForFetch}
      providerId={ottProviderId}
      region={region}
      eyebrow={collectionForFetch === 'ott' ? `Streaming · ${regionLabel}` : selected.eyebrow}
      title={collectionForFetch === 'ott' && requestedProviderId
        ? `${selectedProvider?.provider_name ?? 'Streaming service'} movies`
        : selected.title}
      description={collectionForFetch === 'ott'
        ? requestedProviderId
          ? selectedProvider
            ? `Popular movies available on ${selectedProvider.provider_name} in ${regionLabel}.`
            : `Loading movies for this streaming service in ${regionLabel}…`
          : `Popular movies available to stream in ${regionLabel}. Choose a service to narrow the list.`
        : selected.description}
      toolbar={(
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a movie collection">
          {movieCollections.map(({ value, label }) => {
            const isSelected = collectionForFetch === value
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
      )}
      filters={collectionForFetch === 'ott' ? (
        <OttProviderPicker
          region={region}
          regionLabel={regionLabel}
          providers={providers}
          selectedProviderId={requestedProviderId}
          isLoading={providersQuery.isLoading}
          isError={providersQuery.isError}
          onRetry={() => { void providersQuery.refetch() }}
          onSelectRegion={selectRegion}
          onSelectProvider={selectProvider}
        />
      ) : undefined}
    />
  )
}

export default MoviesPage
