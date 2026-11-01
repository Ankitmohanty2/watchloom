import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { Media } from '@/types'
import { formatMediaRating } from '@/utils/media'

interface MediaCardProps {
  media: Media
}

export const MediaCard = ({ media }: MediaCardProps) => {
  const linkTo = media.id
    ? `/media/${media.id}`
    : `/media/fetch?provider=${media.provider}&id=${media.provider_id}&type=${media.media_type}`

  const rating = formatMediaRating(media.rating, media.media_type)

  return (
    <Link to={linkTo} className="group block min-w-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border/[0.08] bg-surface-hover shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        {media.poster_path ? (
          <img
            src={media.poster_path}
            alt={media.title}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035] group-hover:brightness-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-muted-foreground">
            {media.title}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
        <span className="absolute left-2.5 top-2.5 rounded-md border border-border/15 bg-[#101218]/80 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
          {media.media_type === 'tv' ? 'Series' : media.media_type}
        </span>
        {rating && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md border border-border/15 bg-[#101218]/85 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-primary-400 text-primary-400" />
            {rating}
          </span>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="truncate text-[13px] font-medium text-foreground-strong transition-colors group-hover:text-primary-700 sm:text-sm">
          {media.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          {media.release_date && <span>{new Date(media.release_date).getFullYear()}</span>}
          {media.release_date && media.genres?.[0] && <span className="h-0.5 w-0.5 rounded-full bg-slate-600" />}
          {media.genres?.[0] && <span className="truncate">{media.genres[0]}</span>}
        </div>
      </div>
    </Link>
  )
}




