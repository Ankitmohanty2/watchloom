import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Play, X } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getYoutubeEmbedUrl } from '@/utils/youtube'

interface TrailerButtonProps {
  provider?: string
  providerId?: number
  mediaType: string
  trailerUrl?: string
  className?: string
  style?: CSSProperties
  onOpen?: () => void
}

export const TrailerButton = ({ provider, providerId, mediaType, trailerUrl, className, style, onOpen }: TrailerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const currentEmbedUrl = getYoutubeEmbedUrl(trailerUrl, { autoplay: true })
  const hasProvider = Boolean(provider && typeof providerId === 'number')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['media-trailer', provider, providerId, mediaType],
    queryFn: () => mediaService.getTrailer(provider!, providerId!, mediaType),
    enabled: isOpen && !currentEmbedUrl && hasProvider,
    retry: false,
    staleTime: 30 * 60 * 1000,
  })
  const embedUrl = currentEmbedUrl || getYoutubeEmbedUrl(data?.trailer_url, { autoplay: true })

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      <button type="button" onClick={() => { setIsOpen(true); onOpen?.() }} className={className} style={style}>
        <Play className="h-4 w-4 fill-current" />
        Watch trailer
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="trailer-title" className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border/10 bg-surface-alt shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-border/[0.08] px-4 py-3 sm:px-5">
              <h2 id="trailer-title" className="text-sm font-semibold text-foreground-strong">Official trailer</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close trailer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover/[0.08] hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffd93d]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              {isLoading ? (
                <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>
              ) : embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Official trailer"
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <p className="text-base font-medium text-foreground-strong">Trailer unavailable</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    {isError ? 'We could not load a trailer right now. Please try again later.' : 'There is no YouTube trailer for this title yet.'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}




