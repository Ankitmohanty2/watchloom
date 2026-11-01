import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const NotFoundPage = () => (
  <main className="flex min-h-[65vh] items-center justify-center bg-background px-4 text-center text-foreground">
    <div className="max-w-md">
      <p className="font-display text-7xl font-semibold tracking-tight text-accent-foreground">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-foreground-strong">This page is off the reel.</h1>
      <p className="mt-2 text-sm leading-6 text-muted">The link may be out of date, or the page may have moved.</p>
      <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: '#FFD93D', color: '#11141b' }}>
        Go to Watchloom <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </main>
)

export default NotFoundPage
