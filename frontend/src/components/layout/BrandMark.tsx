import { useState } from 'react'
import { Clapperboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface BrandMarkProps {
  size?: 'compact' | 'regular'
  showName?: boolean
  className?: string
}

export const BrandMark = ({ size = 'regular', showName = true, className }: BrandMarkProps) => {
  const [logoFailed, setLogoFailed] = useState(false)
  const logoSize = size === 'compact' ? 'h-10 w-10 sm:h-11 sm:w-11' : 'h-14 w-14'

  return (
    <Link
      to="/"
      aria-label="Watchloom home"
      className={cn('inline-flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500', className)}
    >
      {logoFailed ? (
        <span className={cn('inline-flex shrink-0 items-center justify-center rounded-xl bg-primary-500 text-[#11141b]', logoSize)}>
          <Clapperboard className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : (
        <img
          src="/images/watchloom-logo.png?v=2"
          alt=""
          aria-hidden="true"
          onError={() => setLogoFailed(true)}
          className={cn('shrink-0 rounded-xl object-contain', logoSize)}
        />
      )}
      {showName && (
        <span className="hidden truncate font-display text-base font-semibold tracking-tight text-foreground-strong sm:inline">
          Watchloom
        </span>
      )}
    </Link>
  )
}
