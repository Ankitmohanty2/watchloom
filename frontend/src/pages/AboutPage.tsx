import { ArrowLeft, ArrowUpRight, Clapperboard, Database } from 'lucide-react'
import { Link } from 'react-router-dom'

const AboutPage = () => {
  return (
    <main className="min-h-[65vh] bg-background text-foreground">
      <div className="container-custom max-w-6xl py-10 sm:py-14">
        <Link
          to="/"
          className="mb-9 inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted transition-colors hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Watchloom
        </Link>

        <header className="mb-10 max-w-3xl sm:mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">About Watchloom</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground-strong sm:text-5xl">
            A home for every story you watch.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Watchloom is an independently maintained personal project for discovering movies, series, and anime and keeping your watchlist in one place.
          </p>
        </header>

        <section aria-labelledby="credits-heading" className="overflow-hidden rounded-3xl border border-border/10 bg-surface shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border/10 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
                <Database className="h-4 w-4" /> Data sources
              </p>
              <h2 id="credits-heading" className="font-display text-2xl font-semibold tracking-tight text-foreground-strong">
                About &amp; credits
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted sm:text-right">
              Catalog details and artwork come from independent data providers. Their names and marks belong to their respective owners.
            </p>
          </div>

          <div className="grid divide-y divide-border/10 md:grid-cols-2 md:divide-x md:divide-y-0">
            <article className="p-6 sm:p-8">
              <div className="mb-5 flex min-h-12 items-center">
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="The Movie Database (TMDB)"
                  className="inline-flex rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
                >
                  <img
                    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
                    alt="TMDB"
                    className="h-10 w-auto object-contain"
                  />
                </a>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground-strong">Movies &amp; series</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Movie and television catalog data and imagery are provided by The Movie Database (TMDB).
              </p>
              <p className="mt-4 rounded-xl border border-border/10 bg-surface-alt px-4 py-3 text-sm leading-6 text-foreground">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-foreground transition hover:text-foreground-strong"
              >
                Visit TMDB <ArrowUpRight className="h-4 w-4" />
              </a>
            </article>

            <article className="p-6 sm:p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a1d28] text-[#67c9ff]">
                <Clapperboard className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground-strong">Anime</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Anime catalog information is provided through AniList. Watchloom is a separate personal project.
              </p>
              <a
                href="https://anilist.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-foreground transition hover:text-foreground-strong"
              >
                Visit AniList <ArrowUpRight className="h-4 w-4" />
              </a>
            </article>
          </div>
        </section>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border/10 bg-surface-alt p-5 text-sm leading-6 text-muted sm:p-6">
          <Clapperboard className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted" />
          <p>
            Watchloom organizes catalog information and your personal watchlist. It does not host or stream movies, television episodes, or anime.
          </p>
        </div>
      </div>
    </main>
  )
}

export default AboutPage
