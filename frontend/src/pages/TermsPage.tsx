import { ArrowLeft, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

type TermsSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

const sections: TermsSection[] = [
  {
    id: 'about-watchloom',
    title: 'About Watchloom',
    paragraphs: [
      'Watchloom is an independently maintained personal project for discovering movies, series, and anime and keeping track of what you want to watch. It is a catalog and tracking tool; it does not host or stream media.',
    ],
  },
  {
    id: 'your-account',
    title: 'Your account',
    paragraphs: [
      'If you create an account, provide information that is accurate and keep your sign-in details private. You are responsible for activity carried out through your account. Sign out when using a shared device.',
      'You may stop using Watchloom at any time. Access may be limited or suspended when needed to protect the service, its users, or the security of an account.',
    ],
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    paragraphs: ['Use Watchloom lawfully and in a way that does not interfere with other people or the service. In particular, do not:'],
    bullets: [
      'Attempt to access another person’s account or non-public data.',
      'Probe, disrupt, overload, or bypass the service’s security or rate limits.',
      'Use automated scraping or bulk collection to copy the catalog or service data.',
      'Upload or submit material that violates another person’s rights or applicable law.',
    ],
  },
  {
    id: 'your-library',
    title: 'Your library and preferences',
    paragraphs: [
      'Your watchlist, episode progress, ratings, notes, and preferences are associated with your account so Watchloom can provide its tracking features. You remain responsible for the information you add. You give Watchloom permission to store and process it only as needed to operate those features.',
    ],
  },
  {
    id: 'community-feedback',
    title: 'Community feedback',
    paragraphs: [
      'If you choose to share a comment on the home page and confirm the public-display checkbox, your comment and current display name will appear in the Watchloom community carousel. Do not include private or sensitive information. You can update or remove your comment from the same section at any time.',
    ],
  },
  {
    id: 'catalog-data',
    title: 'Catalog data and third-party services',
    paragraphs: [
      'Catalog details, ratings, and artwork may come from independent third-party services, including TMDB and AniList. Their data can be incomplete, change over time, or be unavailable. The providers retain their rights in their respective names, marks, images, and data.',
      'Links to external sites are provided for convenience. Those sites have their own terms and policies, and Watchloom does not control them.',
    ],
  },
  {
    id: 'availability',
    title: 'Availability and changes',
    paragraphs: [
      'Watchloom is provided as available. Features may change, be interrupted, or be discontinued as the project is maintained. Catalog information is provided for discovery and personal tracking and is not a guarantee of availability on any streaming service.',
    ],
  },
  {
    id: 'limits',
    title: 'Liability',
    paragraphs: [
      'To the extent permitted by applicable law, the project maintainer is not responsible for indirect or consequential loss arising from use of the service, third-party catalog data, or temporary service interruptions. Nothing in these terms limits rights that cannot legally be limited.',
    ],
  },
  {
    id: 'updates',
    title: 'Updates to these terms',
    paragraphs: [
      'These terms may be updated as Watchloom changes. The current version and its update date will appear on this page. If you continue using Watchloom after an update, you agree to the revised terms to the extent permitted by applicable law.',
    ],
  },
]

const TermsPage = () => {
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

        <header className="mb-9 border-b border-border/10 pb-8 sm:mb-12 sm:pb-10">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
            <FileText className="h-4 w-4" /> Watchloom / Terms
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground-strong sm:text-5xl">
            Terms &amp; conditions
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            A clear guide to using this personal project and keeping your watchlist in one place.
          </p>
          <p className="mt-5 inline-flex items-center rounded-full border border-border/10 bg-surface px-3 py-1.5 text-xs font-medium text-muted">
            Last updated November 2, 2026
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
          <article className="min-w-0 rounded-3xl border border-border/10 bg-surface px-6 py-2 shadow-sm sm:px-9">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 border-b border-border/10 py-7 last:border-0 sm:py-8"
              >
                <h2 className="mb-3 flex items-baseline gap-3 font-display text-lg font-semibold text-foreground-strong sm:text-xl">
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </h2>
                <div className="space-y-4 text-sm leading-7 text-muted sm:text-[15px]">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && (
                    <ul className="space-y-2 pl-5 marker:text-brand-muted">
                      {section.bullets.map((item) => <li key={item} className="list-disc">{item}</li>)}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </article>

          <aside className="h-fit rounded-3xl border border-border/10 bg-surface-alt p-5 lg:sticky lg:top-24">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">On this page</p>
            <nav aria-label="Terms sections" className="grid gap-1">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-start gap-2 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
                >
                  <span className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </a>
              ))}
            </nav>
            <Link
              to="/about"
              className="mt-5 flex items-center justify-between border-t border-border/10 pt-4 text-sm font-semibold text-accent-foreground transition hover:text-foreground-strong"
            >
              About &amp; credits <span aria-hidden="true">↗</span>
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default TermsPage
