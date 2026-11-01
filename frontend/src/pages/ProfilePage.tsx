import { Link } from 'react-router-dom'
import { CalendarDays, Mail, UserRound } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const ProfilePage = () => {
  const { user } = useAuthStore()

  if (!user) return null

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <main className="min-h-[65vh] bg-background text-foreground">
      <div className="container-custom max-w-4xl py-10 sm:py-14">
        <header className="mb-8 border-b border-border/[0.08] pb-7">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted"><span className="h-2 w-2 rounded-sm bg-primary-500" /> Your Watchloom</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground-strong sm:text-4xl">Profile</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">Your account details and Watchloom preferences.</p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border/[0.08] bg-surface">
          <div className="flex flex-col gap-5 border-b border-border/[0.08] p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary-500/30 bg-primary-500/10 text-accent-foreground">
              {user.avatar ? <img src={user.avatar} alt={user.display_name} className="h-full w-full object-cover" /> : <UserRound className="h-7 w-7" />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-semibold text-foreground-strong">{user.display_name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <span className={`sm:ml-auto inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${user.email_verified ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-[#ffd93d]/20 bg-[#ffd93d]/10 text-brand-muted'}`}>
              {user.email_verified ? 'Email verified' : 'Email not verified'}
            </span>
          </div>

          <dl className="grid gap-0 sm:grid-cols-2">
            <div className="border-b border-border/[0.07] p-5 sm:border-r sm:p-6">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Mail className="h-4 w-4 text-accent-foreground" /> Email address</dt>
              <dd className="mt-2 break-all text-sm font-medium text-foreground">{user.email}</dd>
            </div>
            <div className="border-b border-border/[0.07] p-5 sm:p-6">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><CalendarDays className="h-4 w-4 text-accent-foreground" /> Member since</dt>
              <dd className="mt-2 text-sm font-medium text-foreground">{memberSince}</dd>
            </div>
            <div className="p-5 sm:border-r sm:p-6">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferred view</dt>
              <dd className="mt-2 text-sm font-medium capitalize text-foreground">{user.preferences.default_view}</dd>
            </div>
            <div className="p-5 sm:p-6">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Favorite genres</dt>
              <dd className="mt-2 text-sm font-medium text-foreground">{user.preferences.favorite_genres.length ? user.preferences.favorite_genres.join(', ') : 'Not set'}</dd>
            </div>
          </dl>
        </section>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/settings" className="rounded-lg border border-border/15 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-hover/[0.05]">Settings</Link>
          <Link to="/library" className="rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: '#FFD93D', color: '#11141b' }}>Open library</Link>
        </div>
      </div>
    </main>
  )
}

export default ProfilePage



