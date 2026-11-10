import { useSearchParams } from 'react-router-dom'
import { MediaCollectionPage } from '@/components/media/MediaCollectionPage'
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

  const selectCollection = (nextCollection: MovieCollection) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextCollection === 'popular') nextParams.delete('collection')
    else nextParams.set('collection', nextCollection)
    setSearchParams(nextParams)
  }

  return (
    <MediaCollectionPage
      mediaType="movie"
      collection={activeCollection}
      eyebrow={selected.eyebrow}
      title={selected.title}
      description={selected.description}
      toolbar={(
        <div className="-mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" role="group" aria-label="Choose a movie collection">
          {movieCollections.map(({ value, label }) => {
            const isSelected = activeCollection === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectCollection(value)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${isSelected ? 'bg-primary-500 text-[#11150d]' : 'border border-border/[0.1] bg-surface text-muted-foreground hover:text-foreground-strong'}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    />
  )
}

export default MoviesPage
