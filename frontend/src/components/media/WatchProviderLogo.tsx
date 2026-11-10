import type { WatchProvider } from '@/types'
import { getWatchProviderLogoUrl } from '@/utils/mediaImages'

interface WatchProviderLogoProps {
  provider: WatchProvider
  size?: 'sm' | 'md'
}

export const WatchProviderLogo = ({ provider, size = 'md' }: WatchProviderLogoProps) => {
  const logoUrl = getWatchProviderLogoUrl(provider.logo_path)
  const sizeClass = size === 'sm' ? 'h-7 w-7 rounded-md' : 'h-9 w-9 rounded-lg'

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ${sizeClass}`}>
      <span aria-hidden="true" className="text-[10px] font-bold text-slate-700">
        {provider.provider_name.slice(0, 2).toUpperCase()}
      </span>
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => event.currentTarget.remove()}
          className="absolute inset-0 h-full w-full object-contain p-1"
        />
      )}
    </span>
  )
}
