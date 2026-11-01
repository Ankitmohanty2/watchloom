import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const MediaFetchPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const provider = searchParams.get('provider')
  const providerId = searchParams.get('id')
  const mediaType = searchParams.get('type')
  const hasValidParams = Boolean(provider && providerId && mediaType && Number.isInteger(Number(providerId)))

  const { data: media, error } = useQuery({
    queryKey: ['fetch-media', provider, providerId, mediaType],
    queryFn: () => mediaService.fetchAndStore(provider!, parseInt(providerId!, 10), mediaType!),
    enabled: hasValidParams,
  })

  useEffect(() => {
    if (media?.id) navigate(`/media/${media.id}`, { replace: true })
  }, [media, navigate])

  if (!hasValidParams || error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 text-center text-foreground">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">Watchloom</p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-foreground-strong">We couldn’t open that title</h1>
          <p className="mt-2 text-sm text-muted">The title link is incomplete or the media provider is unavailable.</p>
          <Link to="/discover" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border/15 px-4 py-2.5 text-sm font-medium text-foreground-strong transition hover:bg-hover/[0.06]">
            <ArrowLeft className="h-4 w-4" /> Back to Discover
          </Link>
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

