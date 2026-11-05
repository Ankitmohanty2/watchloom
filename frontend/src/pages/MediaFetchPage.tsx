import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RotateCw } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const MediaFetchPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const provider = searchParams.get('provider')
  const providerId = searchParams.get('id')
  const mediaType = searchParams.get('type')
  const hasValidParams = Boolean(provider && providerId && mediaType && Number.isInteger(Number(providerId)))

  const { data: media, error, refetch, isFetching } = useQuery({
    queryKey: ['fetch-media', provider, providerId, mediaType],
    queryFn: () => mediaService.fetchAndStore(provider!, parseInt(providerId!, 10), mediaType!),
    enabled: hasValidParams,
    retry: (failureCount, requestError) => {
      const status = (requestError as { response?: { status?: number } })?.response?.status
      return failureCount < 3 && (!status || status >= 500)
    },
    retryDelay: (attempt) => Math.min(800 * 2 ** attempt, 4_000),
  })

  useEffect(() => {
    if (media?.id) {
      queryClient.setQueryData(['media', media.id], media)
      navigate(`/media/${media.id}`, { replace: true })
    }
  }, [media, navigate, queryClient])

  if (!hasValidParams || error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 text-center text-foreground">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">Watchloom</p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-foreground-strong">We couldn’t open that title</h1>
          <p className="mt-2 text-sm text-muted">
            {hasValidParams ? 'The catalog service couldn’t load this title just now. Try again.' : 'The title link is incomplete.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {hasValidParams && (
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-[#11150d] transition hover:brightness-95 disabled:opacity-60"
                style={{ backgroundColor: 'var(--watchloom-primary)' }}
              >
                <RotateCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Trying again…' : 'Try again'}
              </button>
            )}
            <Link to="/discover" className="inline-flex h-10 items-center gap-2 rounded-full border border-border/15 px-4 text-sm font-medium text-foreground-strong transition hover:bg-hover/[0.06]">
              <ArrowLeft className="h-4 w-4" /> Back to Discover
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted">Opening title details…</p>
      </div>
    </main>
  )
}

export default MediaFetchPage

