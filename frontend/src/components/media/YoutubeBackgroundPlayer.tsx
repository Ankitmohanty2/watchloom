import { useEffect, useRef } from 'react'

interface YoutubePlayerInstance {
  destroy: () => void
  mute: () => void
  playVideo: () => void
  getIframe: () => HTMLIFrameElement
}

interface YoutubePlayerOptions {
  height: string
  width: string
  videoId: string
  playerVars: Record<string, string | number>
  events: {
    onReady: (event: { target: YoutubePlayerInstance }) => void
    onError: (event: { data: number }) => void
    onAutoplayBlocked: () => void
  }
}

interface YoutubeIframeApi {
  Player: new (element: HTMLElement, options: YoutubePlayerOptions) => YoutubePlayerInstance
}

interface YoutubeWindow extends Window {
  YT?: YoutubeIframeApi
  onYouTubeIframeAPIReady?: () => void
}

let youtubeApiPromise: Promise<YoutubeIframeApi> | null = null

const loadYoutubeIframeApi = () => {
  const browserWindow = window as YoutubeWindow
  if (browserWindow.YT?.Player) return Promise.resolve(browserWindow.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise<YoutubeIframeApi>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('YouTube player API timed out')), 15000)
    const previousReadyHandler = browserWindow.onYouTubeIframeAPIReady

    browserWindow.onYouTubeIframeAPIReady = () => {
      try {
        previousReadyHandler?.()
      } catch {
        // Keep the player loader independent of other page callbacks.
      }

      if (browserWindow.YT?.Player) {
        window.clearTimeout(timeout)
        resolve(browserWindow.YT)
      } else {
        window.clearTimeout(timeout)
        reject(new Error('YouTube player API did not initialize'))
      }
    }

    let script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.addEventListener('error', () => {
        window.clearTimeout(timeout)
        reject(new Error('YouTube player API failed to load'))
      }, { once: true })
      document.head.appendChild(script)
    }
  }).catch((error: unknown) => {
    youtubeApiPromise = null
    throw error
  })

  return youtubeApiPromise
}

interface YoutubeBackgroundPlayerProps {
  videoId: string
  className: string
  onUnavailable: () => void
}

export const YoutubeBackgroundPlayer = ({ videoId, className, onUnavailable }: YoutubeBackgroundPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const onUnavailableRef = useRef(onUnavailable)

  useEffect(() => {
    onUnavailableRef.current = onUnavailable
  }, [onUnavailable])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isDisposed = false
    let player: YoutubePlayerInstance | undefined
    const playerMount = document.createElement('div')
    playerMount.className = 'h-full w-full'
    container.replaceChildren(playerMount)

    loadYoutubeIframeApi()
      .then((youtube) => {
        if (isDisposed || !container.isConnected) return

        // The YouTube API replaces its mount element with an iframe. Keep that
        // mutation inside an empty host so React never reconciles API-owned DOM.
        player = new youtube.Player(playerMount, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            enablejsapi: 1,
            loop: 1,
            mute: 1,
            origin: window.location.origin,
            playsinline: 1,
            playlist: videoId,
            rel: 0,
          },
          events: {
            onReady: ({ target }) => {
              const iframe = target.getIframe()
              iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture')
              iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
              target.mute()
              target.playVideo()
            },
            onError: () => onUnavailableRef.current(),
            onAutoplayBlocked: () => onUnavailableRef.current(),
          },
        })
      })
      .catch(() => {
        if (!isDisposed) onUnavailableRef.current()
      })

    return () => {
      isDisposed = true
      player?.destroy()
      container.replaceChildren()
    }
  }, [videoId])

  return <div ref={containerRef} className={className} aria-hidden="true" />
}
