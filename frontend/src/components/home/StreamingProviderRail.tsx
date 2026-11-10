import { ArrowUpRight, Tv } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { WatchProviderLogo } from '@/components/media/WatchProviderLogo'
import { mediaService } from '@/services/mediaService'

export const StreamingProviderRail = () => {
  const [region, setRegion] = useState<'IN' | 'US'>('IN')
  const regionName = region === 'IN' ? 'India' : 'United States'
  const { data: providers = [] } = useQuery({
    queryKey: ['movie-watch-providers', region],
    queryFn: () => mediaService.getMovieWatchProviders(region),
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  })

  if (providers.length === 0) return null

  return (
    <section aria-labelledby="streaming-services-title" className="mt-8 max-w-2xl border-t border-white/10 pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            <Tv className="h-3.5 w-3.5" /> Streaming in {regionName}
          </p>
          <h2 id="streaming-services-title" className="font-display text-base font-semibold text-foreground-strong">
            Find your service
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-white/10 bg-black/20 p-0.5" role="group" aria-label="Streaming service region">
            {([
              ['IN', 'IN'],
              ['US', 'US'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={region === value}
                onClick={() => setRegion(value)}
                className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${region === value ? 'bg-white/15 text-white' : 'text-muted hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <Link to={`/movies?collection=ott&region=${region}`} className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-foreground-strong">
            All services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {providers.slice(0, 6).map((provider) => (
          <Link
            key={provider.provider_id}
            to={`/movies?collection=ott&provider_id=${provider.provider_id}&region=${region}`}
            aria-label={`Browse movies on ${provider.provider_name}`}
            title={`Browse movies on ${provider.provider_name}`}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs font-medium text-foreground-strong transition hover:border-primary-500/40 hover:bg-black/35"
          >
            <WatchProviderLogo provider={provider} size="sm" />
            {provider.provider_name}
          </Link>
        ))}
      </div>
    </section>
  )
}
