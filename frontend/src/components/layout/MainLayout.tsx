import { Link, Outlet } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Header } from './Header'
import { useAuthStore } from '@/store/authStore'

const Footer = () => {
  const { isAuthenticated } = useAuthStore()
  const footerLinkClass = 'text-sm text-muted transition-colors hover:text-brand-muted'

  return (
    <footer className="relative z-10 shrink-0 bg-surface-alt text-foreground">
      <div className="container-custom py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-9 pb-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-5">
            <Link to="/" className="mb-4 inline-flex items-center gap-4 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d]">
              <img
                src="/images/watchloom-logo.png?v=2"
                alt=""
                className="h-16 w-16 rounded-xl object-contain"
              />
              <span>
                <span className="block font-display text-xl font-semibold tracking-tight text-foreground-strong">Watchloom</span>
                <span className="mt-1 block text-sm text-muted">A home for every story you watch.</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-muted">
              Keep your movies, series, and anime together. Find something new and pick up where you left off.
            </p>
            <Link
              to={isAuthenticated ? '/library' : '/signup'}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#fff8e6]"
              style={{ backgroundColor: '#FFD93D', color: '#11141b' }}
            >
              {isAuthenticated ? 'Open your library' : 'Create your account'}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-muted">Explore</h2>
            <ul className="space-y-3">
              <li><Link to="/discover" className={footerLinkClass}>Discover</Link></li>
              <li><Link to="/movies" className={footerLinkClass}>Movies</Link></li>
              <li><Link to="/series" className={footerLinkClass}>TV series</Link></li>
              <li><Link to="/anime" className={footerLinkClass}>Anime</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-muted">Your Watchloom</h2>
            <ul className="space-y-3">
              <li><Link to="/library" className={footerLinkClass}>My library</Link></li>
              <li><Link to="/statistics" className={footerLinkClass}>Statistics</Link></li>
              <li><Link to="/profile" className={footerLinkClass}>Profile</Link></li>
              <li><Link to="/settings" className={footerLinkClass}>Settings</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-muted">About &amp; data</h2>
            <ul className="space-y-3">
              <li><Link to="/privacy" className={footerLinkClass}>Privacy policy</Link></li>
              <li><Link to="/terms" className={footerLinkClass}>Terms of service</Link></li>
              <li>
                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
                  TMDB <span className="text-xs text-muted-foreground">↗</span>
                </a>
              </li>
              <li>
                <a href="https://anilist.co/" target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
                  AniList <span className="text-xs text-muted-foreground">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
          <p className="shrink-0">© {new Date().getFullYear()} Watchloom.</p>
          <p className="max-w-3xl sm:text-right">
            This product uses the TMDB API but is not endorsed or certified by TMDB. Anime data is provided by AniList. All trademarks belong to their respective owners.
          </p>
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
