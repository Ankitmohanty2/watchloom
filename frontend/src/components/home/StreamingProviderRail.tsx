import { ArrowUpRight, Tv } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { WatchProviderLogo } from '@/components/media/WatchProviderLogo'
import { mediaService } from '@/services/mediaService'

const regions = [
  ['IN', 'India'],
  ['US', 'United States'],
] as const

export const StreamingProviderRail = () => {
  const [region, setRegion] = useState<'IN' | 'US'>('IN')
  const { data: providers = [] } = useQuery({
    queryKey: ['movie-watch-providers', region],
    queryFn: () => mediaService.getMovieWatchProviders(region),
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  })

  if (providers.length === 0) return null

  return (
    <section
      aria-labelledby="streaming-services-title"
      className="relative z-10 -mt-8 mb-3 rounded-2xl border border-border/10 bg-surface p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-brand-muted">
            <Tv className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="streaming-services-title" className="font-display text-base font-semibold text-foreground-strong">
              Browse by streaming service
            </h2>
            <p className="text-xs text-muted-foreground">Movies available to stream, by region</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-full border border-border/10 bg-surface-alt p-1" role="group" aria-label="Streaming service region">
            {regions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={region === value}
                onClick={() => setRegion(value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${region === value ? 'bg-primary-500 text-[#11150d]' : 'text-muted-foreground hover:text-foreground-strong'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <Link
            to={`/movies?collection=ott&region=${region}`}
            className="hidden items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground-strong sm:inline-flex"
          >
            All services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {providers.slice(0, 8).map((provider) => (
          <Link
            key={provider.provider_id}
            to={`/movies?collection=ott&provider_id=${provider.provider_id}&region=${region}`}
            aria-label={`Browse movies on ${provider.provider_name}`}
            title={`Browse movies on ${provider.provider_name}`}
            className="inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl border border-border/10 bg-surface-alt py-1.5 pl-2 pr-3.5 text-sm font-medium text-foreground-strong transition hover:-translate-y-0.5 hover:border-primary-500/50 hover:bg-surface-hover"
          >
            <WatchProviderLogo provider={provider} size="sm" />
            {provider.provider_name}
          </Link>
        ))}
        <Link
          to={`/movies?collection=ott&region=${region}`}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl px-3 text-sm font-medium text-muted transition hover:text-foreground-strong sm:hidden"
        >
          All services <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
