import { useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Media } from '@/types'
import { MediaCard } from '@/components/media/MediaCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface MediaRailProps {
  eyebrow: string
  title: string
  items?: Media[]
  to?: string
  isLoading?: boolean
  emptyMessage?: string
}

export const MediaRail = ({
  eyebrow,
  title,
  items = [],
  to,
  isLoading = false,
  emptyMessage = 'Titles will appear here when available.',
}: MediaRailProps) => {
  const railRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: -1 | 1) => {
    if (!railRef.current) return
    railRef.current.scrollBy({ left: direction * railRef.current.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="border-t border-border/[0.08] py-9 sm:py-11" aria-label={title}>
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.17em] text-brand-muted">{eyebrow}</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground-strong sm:text-[1.75rem]">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {to && (
            <Link to={to} className="inline-flex items-center gap-1.5 pb-1 text-sm font-medium text-muted transition-colors hover:text-foreground-strong">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {items.length > 4 && (
            <div className="hidden items-center gap-2 sm:flex">
              <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`} className="flex h-9 w-9 items-center justify-center rounded-full border border-border/15 bg-surface text-muted transition hover:border-border/30 hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`} className="flex h-9 w-9 items-center justify-center rounded-full border border-border/15 bg-surface text-muted transition hover:border-border/30 hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-border/[0.08] bg-surface/40">
          <LoadingSpinner size="lg" />
        </div>
      ) : items.length ? (
        <div ref={railRef} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:gap-5 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((media) => (
            <div key={`${media.provider}-${media.provider_id}`} className="w-[142px] shrink-0 snap-start sm:w-[158px] lg:w-[174px]">
              <MediaCard media={media} />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-border/[0.08] bg-surface/40 px-5 py-7 text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </section>
  )
}
