import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pause, Play } from 'lucide-react'
import { mediaService } from '@/services/mediaService'
import { YoutubeBackgroundPlayer } from '@/components/media/YoutubeBackgroundPlayer'
import { canAutoplayBackgroundVideo, getYoutubeVideoId } from '@/utils/youtube'

interface TrailerBackdropProps {
  image?: string
  provider?: string
  providerId?: number
  mediaType?: string
  trailerUrl?: string
}

export const TrailerBackdrop = ({ image, provider, providerId, mediaType, trailerUrl }: TrailerBackdropProps) => {
  const [autoplayAllowed] = useState(canAutoplayBackgroundVideo)
  const [isPlaying, setIsPlaying] = useState(autoplayAllowed)
  const [unavailableVideoId, setUnavailableVideoId] = useState<string | null>(null)
  const { data } = useQuery({
    queryKey: ['media-trailer', provider, providerId, mediaType],
    queryFn: () => mediaService.getTrailer(provider!, providerId!, mediaType!),
    enabled: autoplayAllowed
      && Boolean(provider && providerId && mediaType)
      && !getYoutubeVideoId(trailerUrl),
    retry: false,
    staleTime: 30 * 60 * 1000,
  })

  const resolvedTrailer = trailerUrl || data?.trailer_url
  const trailerVideoId = getYoutubeVideoId(resolvedTrailer)
  const showVideo = autoplayAllowed && isPlaying && trailerVideoId && unavailableVideoId !== trailerVideoId

  return (
    <div className="absolute inset-0 overflow-hidden bg-surface">
      {image && (
        <img
          src={image}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${showVideo ? 'opacity-25' : 'opacity-70'}`}
        />
      )}
      {showVideo && trailerVideoId && (
        <YoutubeBackgroundPlayer
          videoId={trailerVideoId}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-110 opacity-80"
          onUnavailable={() => setUnavailableVideoId(trailerVideoId)}
        />
      )}
      {trailerVideoId && autoplayAllowed && unavailableVideoId !== trailerVideoId && (
        <button
          type="button"
          onClick={() => setIsPlaying((playing) => !playing)}
          aria-label={isPlaying ? 'Pause background trailer' : 'Play background trailer'}
          title={isPlaying ? 'Pause background trailer' : 'Play background trailer'}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/20 bg-black/35 text-white backdrop-blur transition-colors hover:border-border/40 hover:bg-black/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff8e6]"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
      )}
    </div>
  )
}
