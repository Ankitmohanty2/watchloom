const TMDB_IMAGE_HOST = 'image.tmdb.org'
const ANILIST_IMAGE_HOST = 's4.anilist.co'

type TmdbImageSize = 'w300' | 'w342' | 'w1280'

const resizeProviderImage = (source: string | undefined, size: TmdbImageSize) => {
  if (!source) return undefined

  try {
    const imageUrl = new URL(source)

    if (imageUrl.hostname === TMDB_IMAGE_HOST) {
      imageUrl.pathname = imageUrl.pathname.replace(/\/t\/p\/(?:original|w\d+)\//, `/t/p/${size}/`)
    } else if (size === 'w342' && imageUrl.hostname === ANILIST_IMAGE_HOST) {
      imageUrl.pathname = imageUrl.pathname.replace(/\/cover\/(?:large|medium|small)\//, '/cover/medium/')
    }

    return imageUrl.toString()
  } catch {
    return source
  }
}

export const getPosterImageUrl = (source: string | undefined) => resizeProviderImage(source, 'w342')
export const getBackdropImageUrl = (source: string | undefined) => resizeProviderImage(source, 'w1280')
/** Small landscape artwork for thumbnails, so pickers don't download full backdrops. */
export const getBackdropThumbUrl = (source: string | undefined) => resizeProviderImage(source, 'w300')

export const getWatchProviderLogoUrl = (path: string | null | undefined) => {
  if (!path || !path.startsWith('/')) return undefined
  return `https://${TMDB_IMAGE_HOST}/t/p/w92${path}`
}
