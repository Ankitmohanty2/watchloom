export const formatMediaRating = (rating?: number, mediaType?: string) => {
  if (typeof rating !== 'number' || !Number.isFinite(rating) || rating <= 0) return null
  const displayRating = mediaType === 'anime' ? rating / 10 : rating
  return displayRating.toFixed(1)
}
