import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { BrandMark } from '@/components/layout/BrandMark'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/library" replace />
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="container-custom grid min-h-screen max-w-6xl items-center gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-20">
        <section className="hidden lg:block">
          <BrandMark />
          <p className="mt-16 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">Your personal watchlist</p>
          <h1 className="mt-4 max-w-lg font-display text-5xl font-semibold leading-[1.06] tracking-tight text-foreground-strong">
            Keep every story close.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            Bring movies, series, and anime together. Save what you love and always know what to watch next.
          </p>
          <div className="mt-10 border-l-2 border-primary-500 pl-4 text-sm leading-6 text-muted">
            A quieter, clearer way to keep track of your next favorite.
          </div>
        </section>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-7 flex justify-center lg:hidden"><BrandMark /></div>
          <Outlet />
        </div>
      </div>
    </main>
  )
}
