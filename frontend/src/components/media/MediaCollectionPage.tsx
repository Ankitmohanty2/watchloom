import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { MediaCard } from '@/components/media/MediaCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Media } from '@/types'

interface MediaCollectionPageProps {
  mediaType: 'movie' | 'tv' | 'anime'
  title: string
  eyebrow: string
  description: string
}

export const MediaCollectionPage = ({ mediaType, title, eyebrow, description }: MediaCollectionPageProps) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['popular', mediaType],
    queryFn: () => mediaService.getPopular(mediaType, 1),
  })
  const items: Media[] = data?.results ?? []

  return (
    <main className="min-h-[65vh] bg-background text-foreground">
      <div className="container-custom py-10 sm:py-14">
        <header className="mb-8 flex flex-col gap-5 border-b border-border/[0.08] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <span className="h-2 w-2 rounded-sm bg-primary-500" />
              {eyebrow}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground-strong sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">{description}</p>
          </div>
          {!isLoading && !isError && items.length > 0 && (
            <p className="shrink-0 text-sm text-muted-foreground">{items.length} titles</p>
          )}
        </header>

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border/[0.07] bg-surface">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border/[0.08] bg-surface px-6 py-14 text-center">
            <h2 className="font-display text-xl font-semibold text-foreground-strong">We couldn’t load these titles</h2>
            <p className="mt-2 text-sm text-muted">Check your connection and try again.</p>
            <button onClick={() => refetch()} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border/15 px-4 py-2 text-sm font-medium text-foreground-strong transition hover:bg-hover/[0.06]">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((media) => (
              <MediaCard key={`${media.provider}-${media.provider_id}`} media={media} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/[0.08] bg-surface px-6 py-14 text-center">
            <h2 className="font-display text-xl font-semibold text-foreground-strong">Nothing to show yet</h2>
            <p className="mt-2 text-sm text-muted">Explore all titles to find something to add to your list.</p>
            <Link to="/discover" className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" style={{ backgroundColor: '#FFD93D', color: '#11141b' }}>
              Go to Discover <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
