import { Link } from 'react-router-dom'
import { Clock3, Star } from 'lucide-react'
import type { LibraryEntry, Media } from '@/types'
import { formatMediaRating, getMediaRuntimeLabel, getMediaTypeLabel, isEpisodeBasedMedia } from '@/utils/media'
import { getPosterImageUrl } from '@/utils/mediaImages'

interface MediaCardProps {
  media: Media
  libraryStatus?: LibraryEntry['status']
}

const libraryStatusLabels: Record<LibraryEntry['status'], string> = {
  plan_to_watch: 'Plan to watch',
  watching: 'Ongoing',
  completed: 'Completed',
  on_hold: 'On hold',
  dropped: 'Dropped',
}

export const MediaCard = ({ media, libraryStatus }: MediaCardProps) => {
  const linkTo = media.id
    ? `/media/${media.id}`
    : `/media/fetch?provider=${media.provider}&id=${media.provider_id}&type=${media.media_type}`

  const rating = formatMediaRating(media.rating, media.media_type)
  const runtime = getMediaRuntimeLabel(media)
  const year = media.release_date ? new Date(media.release_date).getFullYear() : null

  return (
    <Link
      to={linkTo}
      className="group block min-w-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-hover shadow-[0_6px_18px_rgba(0,0,0,0.16)] ring-1 ring-border/10 transition duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(0,0,0,0.3)] group-hover:ring-2 group-hover:ring-primary-500/70">
        {media.poster_path ? (
          <img
            src={getPosterImageUrl(media.poster_path)}
            alt={media.title}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-muted-foreground">
            {media.title}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {libraryStatus && (
          <span className="absolute left-2 top-2 rounded-md bg-primary-500 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#11150d] shadow-sm">
            {libraryStatusLabels[libraryStatus]}
          </span>
        )}
        {rating && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-primary-400 text-primary-400" />
            {rating}
          </span>
        )}
        <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
          {getMediaTypeLabel(media)}
        </span>
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="truncate text-[13px] font-semibold text-foreground-strong transition-colors group-hover:text-accent-foreground sm:text-sm">
          {media.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          {year && <span>{year}</span>}
          {year && media.genres?.[0] && <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/70" />}
          {media.genres?.[0] && <span className="max-w-24 truncate">{media.genres[0]}</span>}
          {runtime && (
            <span className="inline-flex shrink-0 items-center gap-1" title={isEpisodeBasedMedia(media) ? 'Runtime per episode' : 'Runtime'}>
              <Clock3 className="h-3 w-3" aria-hidden="true" />{runtime}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
