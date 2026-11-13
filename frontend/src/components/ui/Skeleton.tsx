import { cn } from '@/utils/cn'

export const MediaCardSkeleton = () => (
  <div aria-hidden="true">
    <div className="skeleton aspect-[2/3] rounded-xl" />
    <div className="skeleton mt-3 h-3.5 w-4/5 rounded" />
    <div className="skeleton mt-2 h-3 w-2/5 rounded" />
  </div>
)

interface MediaGridSkeletonProps {
  count?: number
  label?: string
  className?: string
}

/** Placeholder for the poster grids used on collection, discover, and library pages. */
export const MediaGridSkeleton = ({ count = 12, label = 'Loading titles', className }: MediaGridSkeletonProps) => (
  <div
    role="status"
    aria-label={label}
    className={cn('grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6', className)}
  >
    {Array.from({ length: count }, (_, index) => <MediaCardSkeleton key={index} />)}
  </div>
)
