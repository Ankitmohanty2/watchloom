import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { BookmarkCheck, ChartNoAxesCombined, LogOut, Menu, Search, User, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { BrandMark } from '@/components/layout/BrandMark'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
      isActive ? 'bg-primary-500 text-[#11150d] shadow-sm' : 'text-muted-foreground hover:bg-surface-alt hover:text-foreground-strong'
    }`

  return (
    <header className="app-header sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="nav-shell container-custom mx-auto flex h-[62px] max-w-[78rem] items-center justify-between gap-3 rounded-full border px-3 sm:h-[68px] sm:gap-4 sm:px-5 lg:px-7">
        <BrandMark size="compact" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <NavLink to="/discover" className={navClass}>Discover</NavLink>
          <NavLink to="/anime" className={navClass}>Anime</NavLink>
          <NavLink to="/movies" className={navClass}>Movies</NavLink>
          <NavLink to="/series" className={navClass}>Series</NavLink>
        </nav>

        <div className="hidden shrink-0 items-center gap-1 lg:flex lg:gap-1.5">
          <Link
            to="/discover"
            title="Search titles"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground-strong"
            aria-label="Search titles"
          >
            <Search className="h-5 w-5" />
            <span className="nav-hint" role="tooltip">Search</span>
          </Link>
          <ThemeToggle compact />
          {isAuthenticated ? (
            <>
              <span aria-hidden="true" className="mx-1 h-6 w-px bg-border/15" />
              <NavLink to="/library" title="My library" className={({ isActive }) => `group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-primary-500/15 text-brand-muted' : 'text-muted-foreground hover:bg-surface-alt hover:text-foreground-strong'}`} aria-label="Library">
                <BookmarkCheck aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                <span className="nav-hint" role="tooltip">My library</span>
              </NavLink>
              <NavLink to="/statistics" title="Statistics" className={({ isActive }) => `group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-primary-500/15 text-brand-muted' : 'text-muted-foreground hover:bg-surface-alt hover:text-foreground-strong'}`} aria-label="Statistics">
                <ChartNoAxesCombined aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                <span className="nav-hint" role="tooltip">Statistics</span>
              </NavLink>
              <NavLink to="/profile" title="Profile" className={({ isActive }) => `group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-primary-500/15 text-brand-muted' : 'text-muted-foreground hover:bg-surface-alt hover:text-foreground-strong'}`} aria-label="Profile">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-surface" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="nav-hint" role="tooltip">Profile</span>
              </NavLink>
              <button onClick={handleLogout} title="Sign out" className="group relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground-strong" aria-label="Sign out">
                <LogOut className="h-5 w-5" />
                <span className="nav-hint" role="tooltip">Sign out</span>
              </button>
            </>
          ) : (
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Link to="/signin" className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-alt hover:text-foreground-strong">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-[#11150d] transition hover:brightness-95"
                style={{ backgroundColor: 'var(--watchloom-primary)' }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        <div className="relative flex shrink-0 items-center gap-1 lg:hidden">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/15 bg-surface text-muted-foreground transition hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {mobileMenuOpen && (
            <div id="mobile-navigation" className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/15 bg-surface p-2 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
              <nav aria-label="Mobile navigation" className="grid gap-1">
                <Link to="/discover" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-alt">Discover</Link>
                <Link to="/anime" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-alt">Anime</Link>
                <Link to="/movies" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-alt">Movies</Link>
                <Link to="/series" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-alt">Series</Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/library" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-alt">My library</Link>
                    <Link to="/statistics" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-alt">Statistics</Link>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-alt">
                      {user?.avatar ? <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/15 text-brand-muted"><User className="h-4 w-4" /></span>}
                      <span>Profile</span>
                    </Link>
                    <button onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted transition hover:bg-surface-alt hover:text-foreground-strong">Sign out</button>
                  </>
                ) : (
                  <div className="mt-1 grid grid-cols-2 gap-2 border-t border-border/10 p-2 pt-3">
                    <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center justify-center rounded-lg border border-border/15 text-sm font-semibold text-foreground">Sign in</Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center justify-center rounded-full text-sm font-semibold text-[#11150d]" style={{ backgroundColor: 'var(--watchloom-primary)' }}>Sign up</Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

