import type { Media } from '@/types'

export const isEpisodeBasedMedia = (media?: Pick<Media, 'media_type' | 'format' | 'episode_count'> | null) => {
  if (!media) return false
  if (media.media_type === 'tv') return true
  if (media.media_type !== 'anime') return false

  const format = media.format?.toUpperCase()
  if (format) return format === 'TV' || format.startsWith('TV_')
  return (media.episode_count ?? 0) > 1
}

export const getMediaTypeLabel = (media: Pick<Media, 'media_type' | 'format' | 'episode_count'>) => {
  if (media.media_type === 'movie') return 'Movie'
  if (media.media_type === 'tv') return 'Series'
  if (media.media_type === 'anime') {
    if (media.format?.toUpperCase() === 'MOVIE' || (!media.format && media.episode_count === 1)) {
      return 'Anime film'
    }
    return isEpisodeBasedMedia(media) ? 'Anime series' : 'Anime'
  }
  return media.media_type
}

export const formatMediaRating = (rating?: number, mediaType?: string) => {
  if (typeof rating !== 'number' || !Number.isFinite(rating) || rating <= 0) return null
  const displayRating = mediaType === 'anime' ? rating / 10 : rating
  return displayRating.toFixed(1)
}
