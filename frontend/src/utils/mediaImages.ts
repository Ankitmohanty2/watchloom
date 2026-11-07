const TMDB_IMAGE_HOST = 'image.tmdb.org'
const ANILIST_IMAGE_HOST = 's4.anilist.co'

const resizeProviderImage = (source: string | undefined, size: 'w342' | 'w1280') => {
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
