import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, Moon, Sun } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useThemeStore } from '@/store/themeStore'

const SettingsPage = () => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return (
    <main className="min-h-[65vh] bg-background text-foreground">
      <div className="container-custom max-w-3xl py-10 sm:py-14">
        <header className="mb-8 border-b border-border/[0.08] pb-7">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted"><span className="h-2 w-2 rounded-sm bg-primary-500" /> Your Watchloom</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground-strong sm:text-4xl">Settings</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">Manage the details and preferences for your account.</p>
        </header>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border/[0.08] bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground-strong">Appearance</h2>
                <p className="mt-1 max-w-md text-sm leading-6 text-muted">Choose a comfortable look for browsing. Your preference is saved on this device.</p>
              </div>
              <ThemeToggle showLabels className="self-start sm:self-auto" />
            </div>
            <div className="mt-6 grid gap-3 border-t border-border/[0.08] pt-5 sm:grid-cols-2">
              <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')} data-theme-preview="light" className={`theme-preview-light w-full rounded-xl border p-4 text-left transition-colors ${theme === 'light' ? 'border-primary-500/60 ring-2 ring-primary-500/15' : 'border-border/[0.08] hover:border-primary-500/40'}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1f2937] shadow-sm"><Sun className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-semibold text-foreground-strong">Light</p>
                    <p className="mt-0.5 text-xs text-muted">Bright, crisp surfaces</p>
                  </div>
                  {theme === 'light' && <Check className="ml-auto h-4 w-4 text-brand-muted" aria-label="Selected" />}
                </div>
              </button>
              <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')} data-theme-preview="dark" className={`theme-preview-dark w-full rounded-xl border p-4 text-left transition-colors ${theme === 'dark' ? 'border-primary-500/60 ring-2 ring-primary-500/15' : 'border-border/[0.08] hover:border-primary-500/40'}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-foreground-strong shadow-sm"><Moon className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-semibold text-foreground-strong">Dark</p>
                    <p className="mt-0.5 text-xs text-muted">The original cinema palette</p>
                  </div>
                  {theme === 'dark' && <Check className="ml-auto h-4 w-4 text-brand-muted" aria-label="Selected" />}
                </div>
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-border/[0.08] bg-surface p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-foreground-strong">Privacy</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Read how account information and watch history are handled.</p>
            <Link to="/privacy" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-foreground transition hover:text-foreground-strong">
              Privacy policy <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="rounded-xl border border-border/[0.08] bg-surface p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-foreground-strong">Account</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Update the information shown on your profile.</p>
            <Link to="/profile" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-foreground transition hover:text-foreground-strong">
              View profile <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}

export default SettingsPage
