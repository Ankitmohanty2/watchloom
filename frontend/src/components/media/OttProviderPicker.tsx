import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { WatchProviderLogo } from '@/components/media/WatchProviderLogo'
import type { WatchProvider } from '@/types'

const PRIMARY_PROVIDER_LIMIT = 16

interface OttProviderPickerProps {
  region: 'IN' | 'US'
  regionLabel: string
  providers: WatchProvider[]
  selectedProviderId?: number
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onSelectRegion: (region: 'IN' | 'US') => void
  onSelectProvider: (providerId?: number) => void
}

export const OttProviderPicker = ({
  region,
  regionLabel,
  providers,
  selectedProviderId,
  isLoading,
  isError,
  onRetry,
  onSelectRegion,
  onSelectProvider,
}: OttProviderPickerProps) => {
  const [showAll, setShowAll] = useState(false)

  const sortedProviders = useMemo(() => {
    const selected = selectedProviderId
      ? providers.find(({ provider_id }) => provider_id === selectedProviderId)
      : undefined
    const rest = providers.filter(({ provider_id }) => provider_id !== selectedProviderId)
    return selected ? [selected, ...rest] : rest
  }, [providers, selectedProviderId])

  const visibleProviders = showAll
    ? sortedProviders
    : sortedProviders.slice(0, PRIMARY_PROVIDER_LIMIT)
  const hiddenCount = Math.max(sortedProviders.length - PRIMARY_PROVIDER_LIMIT, 0)

  return (
    <section aria-label="Filter by streaming service" className="rounded-xl border border-border/[0.08] bg-surface/55 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground-strong">Streaming in {regionLabel}</h2>
          <p className="mt-1 text-xs text-muted-foreground">Pick a service — titles appear right below.</p>
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
              onClick={() => onSelectRegion(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${region === value ? 'bg-surface text-foreground-strong shadow-sm' : 'text-muted-foreground hover:text-foreground-strong'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">Loading services…</p>
      ) : isError ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Streaming services couldn’t load.</span>
          <button type="button" onClick={onRetry} className="font-medium text-foreground-strong underline underline-offset-4">Try again</button>
        </div>
      ) : (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
            <button
              type="button"
              aria-pressed={!selectedProviderId}
              onClick={() => onSelectProvider()}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${!selectedProviderId ? 'border-primary-500/45 bg-primary-500/[0.08] text-foreground-strong' : 'border-border/[0.1] bg-background/60 text-muted-foreground hover:bg-surface hover:text-foreground-strong'}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface text-xs font-semibold">All</span>
              All services
            </button>
            {visibleProviders.map((provider) => {
              const isSelected = selectedProviderId === provider.provider_id
              return (
                <button
                  key={provider.provider_id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectProvider(provider.provider_id)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${isSelected ? 'border-primary-500/45 bg-primary-500/[0.08] text-foreground-strong' : 'border-border/[0.1] bg-background/60 text-muted-foreground hover:bg-surface hover:text-foreground-strong'}`}
                >
                  <WatchProviderLogo provider={provider} size="sm" />
                  <span className="max-w-[9rem] truncate sm:max-w-none">{provider.provider_name}</span>
                </button>
              )
            })}
          </div>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll((open) => !open)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground-strong"
            >
              <ChevronDown className={`h-4 w-4 transition ${showAll ? 'rotate-180' : ''}`} aria-hidden />
              {showAll ? 'Show fewer services' : `Show ${hiddenCount} more services`}
            </button>
          )}
        </>
      )}
    </section>
  )
}