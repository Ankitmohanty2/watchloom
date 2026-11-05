import { MediaCollectionPage } from '@/components/media/MediaCollectionPage'
import { useSearchParams } from 'react-router-dom'

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const collection = searchParams.get('collection') === 'bollywood' ? 'bollywood' : 'popular'
  const isBollywood = collection === 'bollywood'

  const selectCollection = (nextCollection: 'popular' | 'bollywood') => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextCollection === 'popular') nextParams.delete('collection')
    else nextParams.set('collection', nextCollection)
    setSearchParams(nextParams)
  }

  return (
    <MediaCollectionPage
      mediaType="movie"
      collection={collection}
      eyebrow={isBollywood ? 'Indian cinema · Hindi language' : 'The big screen'}
      title={isBollywood ? 'Bollywood' : 'Movies'}
      description={isBollywood
        ? 'Popular Hindi-language films from India, with more titles ready to load.'
        : 'Explore popular films from around the world, with more titles ready to load.'}
      toolbar={(
        <div className="inline-flex rounded-xl border border-border/[0.1] bg-surface p-1" role="group" aria-label="Movie collection">
          <button
            type="button"
            aria-pressed={!isBollywood}
            onClick={() => selectCollection('popular')}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${!isBollywood ? 'bg-primary-500 text-[#11141b]' : 'text-muted-foreground hover:text-foreground-strong'}`}
          >
            All movies
          </button>
          <button
            type="button"
            aria-pressed={isBollywood}
            onClick={() => selectCollection('bollywood')}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${isBollywood ? 'bg-primary-500 text-[#11141b]' : 'text-muted-foreground hover:text-foreground-strong'}`}
          >
            Bollywood
          </button>
        </div>
      )}
    />
  )
}

export default MoviesPage
