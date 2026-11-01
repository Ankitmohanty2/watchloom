import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, Library, LogOut, Menu, Search, User, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { BrandMark } from '@/components/layout/BrandMark'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export const Header = () => {
  const { isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-foreground-strong' : 'text-muted-foreground hover:text-foreground-strong'
    }`

  return (
    <header className="app-header sticky top-0 z-50 border-b border-border/10 bg-background/95 backdrop-blur-md">
      <div className="container-custom flex h-[68px] items-center justify-between gap-3 sm:gap-4">
        <BrandMark size="compact" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <NavLink to="/discover" className={navClass}>Discover</NavLink>
          <NavLink to="/anime" className={navClass}>Anime</NavLink>
          <NavLink to="/movies" className={navClass}>Movies</NavLink>
          <NavLink to="/series" className={navClass}>Series</NavLink>
        </nav>

        <div className="hidden shrink-0 items-center gap-1 sm:flex sm:gap-1.5">
          <Link
            to="/discover"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover/[0.06] hover:text-foreground-strong"
            aria-label="Search titles"
          >
            <Search className="h-5 w-5" />
          </Link>
          <ThemeToggle compact />
          {isAuthenticated ? (
            <>
              <Link to="/library" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover/[0.06] hover:text-foreground-strong" aria-label="Library">
                <Library className="h-5 w-5" />
              </Link>
              <Link to="/statistics" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover/[0.06] hover:text-foreground-strong" aria-label="Statistics">
                <BarChart3 className="h-5 w-5" />
              </Link>
              <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover/[0.06] hover:text-foreground-strong" aria-label="Profile">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={handleLogout} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover/[0.06] hover:text-foreground-strong" aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Link to="/signin" className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-hover/[0.06] hover:text-foreground-strong sm:px-3">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#ffe681] sm:px-4 sm:py-2.5"
                style={{ backgroundColor: '#FFD93D', color: '#11141b' }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        <div className="relative flex shrink-0 items-center gap-1 sm:hidden">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/15 bg-surface text-muted-foreground transition hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-alt">Profile</Link>
                    <button onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted transition hover:bg-surface-alt hover:text-foreground-strong">Sign out</button>
                  </>
                ) : (
                  <div className="mt-1 grid grid-cols-2 gap-2 border-t border-border/10 p-2 pt-3">
                    <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center justify-center rounded-lg border border-border/15 text-sm font-semibold text-foreground">Sign in</Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center justify-center rounded-lg text-sm font-semibold text-[#11141b]" style={{ backgroundColor: '#FFD93D' }}>Sign up</Link>
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

