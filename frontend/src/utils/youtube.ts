export interface YoutubeEmbedOptions {
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
  playsInline?: boolean
}

export const canAutoplayBackgroundVideo = () => {
  if (typeof window === 'undefined') return false
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ?? false
  return !prefersReducedMotion && !saveData
}

export const getYoutubeVideoId = (value?: string | null) => {
  if (!value) return null

  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    let videoId: string | null = null

    if (host === 'youtu.be') {
      videoId = url.pathname.slice(1).split('/')[0] || null
    } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      videoId = url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1] || null
    }

    return videoId && /^[A-Za-z0-9_-]{6,}$/.test(videoId) ? videoId : null
  } catch {
    return null
  }
}

export const getYoutubeEmbedUrl = (value?: string | null, options: YoutubeEmbedOptions = {}) => {
  const videoId = getYoutubeVideoId(value)
  if (!videoId) return null

  const params = new URLSearchParams({ rel: '0' })
  if (options.autoplay) params.set('autoplay', '1')
  if (options.muted) params.set('mute', '1')
  if (options.controls === false) params.set('controls', '0')
  if (options.playsInline) params.set('playsinline', '1')
  if (options.loop) {
    params.set('loop', '1')
    params.set('playlist', videoId)
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
}
