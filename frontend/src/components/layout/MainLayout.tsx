import { Link, Outlet } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Header } from './Header'
import { useAuthStore } from '@/store/authStore'

const Footer = () => {
  const { isAuthenticated } = useAuthStore()
  const footerLinkClass = 'inline-flex w-fit rounded-sm text-sm text-muted transition-colors hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500'

  return (
    <footer className="relative z-10 shrink-0 border-t border-border/10 bg-surface-alt text-foreground">
      <div className="container-custom py-11 sm:py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pb-10 sm:gap-x-12 lg:grid-cols-12 lg:gap-8">
          <div className="col-span-2 lg:col-span-5">
            <Link
              to="/"
              className="group mb-4 inline-flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
            >
              <img
                src="/images/watchloom-logo.png?v=2"
                alt=""
                className="h-12 w-12 rounded-xl object-contain"
              />
              <span>
                <span className="block font-display text-xl font-semibold tracking-tight text-foreground-strong">
                  Watchloom
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  A home for every story you watch.
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-muted">
              Keep movies, series, and anime together. Find something new and pick up where you left off.
            </p>
            <Link
              to={isAuthenticated ? '/library' : '/signup'}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-500"
              style={{ backgroundColor: 'var(--watchloom-primary)', color: 'var(--watchloom-ink)' }}
            >
              {isAuthenticated ? 'Open your library' : 'Create your account'}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">Explore</h2>
            <ul className="space-y-3">
              <li><Link to="/discover" className={footerLinkClass}>Discover</Link></li>
              <li><Link to="/movies" className={footerLinkClass}>Movies</Link></li>
              <li><Link to="/series" className={footerLinkClass}>TV series</Link></li>
              <li><Link to="/anime" className={footerLinkClass}>Anime</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">Your Watchloom</h2>
            <ul className="space-y-3">
              <li><Link to="/library" className={footerLinkClass}>My library</Link></li>
              <li><Link to="/statistics" className={footerLinkClass}>Statistics</Link></li>
              <li><Link to="/profile" className={footerLinkClass}>Profile</Link></li>
              <li><Link to="/settings" className={footerLinkClass}>Settings</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">About Watchloom</h2>
            <ul className="space-y-3">
              <li><Link to="/about" className={footerLinkClass}>About &amp; credits</Link></li>
              <li><Link to="/privacy" className={footerLinkClass}>Privacy policy</Link></li>
              <li><Link to="/terms" className={footerLinkClass}>Terms &amp; conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/10 pt-5 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Watchloom</p>
          <div className="flex flex-col gap-1 sm:items-end sm:text-right">
            <p>A home for every story you watch.</p>
            <p className="flex flex-wrap items-center gap-x-2">
              <span>Made by <span className="font-medium text-foreground">Ankit</span></span>
              <span aria-hidden="true">·</span>
              <a
                href="https://ankitmohanty.in"
                target="_blank"
                rel="noreferrer"
                aria-label="Ankit’s portfolio, ankitmohanty.in (opens in a new tab)"
                className="inline-flex items-center gap-1 rounded-sm text-foreground transition-colors hover:text-brand-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
              >
                ankitmohanty.in
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export const MainLayout = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="relative min-w-0 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
