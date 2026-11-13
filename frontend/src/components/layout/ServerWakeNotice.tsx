import { useEffect, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'

const SLOW_REQUEST_MS = 5000

/**
 * On hosting plans that put idle servers to sleep, the first request after a
 * quiet period can take up to a minute. Without a message the page just looks
 * stuck, so this explains the wait once requests have been pending for a while.
 */
export const ServerWakeNotice = () => {
  const isFetching = useIsFetching() > 0
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    if (!isFetching) {
      setIsSlow(false)
      return
    }
    const timer = window.setTimeout(() => setIsSlow(true), SLOW_REQUEST_MS)
    return () => window.clearTimeout(timer)
  }, [isFetching])

  if (!isSlow) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex justify-center px-4">
      <div
        role="status"
        className="flex max-w-md items-center gap-3 rounded-2xl border border-border/15 bg-surface px-4 py-3 text-sm text-foreground shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
      >
        <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-brand-muted" aria-hidden="true" />
        <p>
          <span className="font-semibold text-foreground-strong">This is taking longer than usual.</span>{' '}
          If the server was asleep, the first load can take up to a minute.
        </p>
      </div>
    </div>
  )
}
