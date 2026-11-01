import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { statisticsService } from '@/services/statisticsService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const StatisticsPage = () => {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['statistics'],
    queryFn: () => statisticsService.getMyStatistics(),
  })

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center bg-background"><LoadingSpinner size="lg" /></div>

  if (isError || !stats) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 text-center text-foreground">
        <div>
          <h1 className="font-display text-2xl font-semibold">Your statistics aren’t available yet</h1>
          <p className="mt-2 text-sm text-muted">Add a few titles to your library, then come back here.</p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={() => refetch()} className="rounded-lg border border-border/15 px-4 py-2 text-sm font-medium hover:bg-hover/[0.06]">Retry</button>
            <Link to="/discover" className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ backgroundColor: '#FFD93D', color: '#11141b' }}>Discover</Link>
          </div>
        </div>
      </main>
    )
  }

  const statusData = [
    { name: 'Watching', value: stats.watching },
    { name: 'Completed', value: stats.completed },
    { name: 'Plan to watch', value: stats.plan_to_watch },
    { name: 'On hold', value: stats.on_hold },
    { name: 'Dropped', value: stats.dropped },
  ]
  const summary = [
    { label: 'Titles saved', value: stats.total_titles },
    { label: 'Completed', value: stats.completed },
    { label: 'Episodes watched', value: stats.episodes_watched },
    { label: 'Hours watched', value: `${stats.total_hours.toFixed(1)}h` },
  ]

  return (
    <main className="min-h-[65vh] bg-background text-foreground">
      <div className="container-custom py-10 sm:py-14">
        <header className="mb-8 border-b border-border/[0.08] pb-7">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted"><span className="h-2 w-2 rounded-sm bg-primary-500" /> Your Watchloom</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground-strong sm:text-4xl">Your viewing, at a glance</h1>
          <p className="mt-2 text-sm leading-6 text-muted sm:text-base">A snapshot of what you’ve watched and what’s next.</p>
        </header>

        <section aria-label="Library summary" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {summary.map((item) => (
            <article key={item.label} className="rounded-xl border border-border/[0.08] bg-surface p-4 sm:p-5">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">{item.label}</p>
              <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground-strong sm:text-3xl">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-border/[0.08] bg-surface p-4 sm:p-6">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-foreground-strong">Library status</h2>
            <p className="mt-1 text-sm text-muted-foreground">How your saved titles are organized.</p>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                <CartesianGrid stroke="rgb(var(--border-rgb) / 0.12)" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--muted-rgb))', fontSize: 11 }} axisLine={{ stroke: 'rgb(var(--border-rgb) / 0.16)' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'rgb(var(--muted-foreground-rgb))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--surface-rgb))', border: '1px solid rgb(var(--border-rgb) / 0.16)', borderRadius: 10, color: 'rgb(var(--foreground-strong-rgb))' }} cursor={{ fill: 'rgb(var(--brand-muted-rgb) / 0.08)' }} />
                <Bar dataKey="value" name="Titles" fill="rgb(var(--brand-muted-rgb))" radius={[5, 5, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {stats.favorite_genres?.length > 0 && (
          <section className="mt-6 rounded-xl border border-border/[0.08] bg-surface p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="font-display text-lg font-semibold text-foreground-strong">Favorite genres</h2>
              <p className="mt-1 text-sm text-muted-foreground">Genres that show up most in your library.</p>
            </div>
            <ul className="divide-y divide-border/[0.08]">
              {stats.favorite_genres.map((genre: any) => (
                <li key={genre.genre} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="font-medium text-foreground">{genre.genre}</span>
                  <span className="text-muted-foreground">{genre.count} {genre.count === 1 ? 'title' : 'titles'}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}

export default StatisticsPage
