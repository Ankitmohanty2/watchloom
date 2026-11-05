import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

type PolicySection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

const sections: PolicySection[] = [
  {
    id: 'about-this-policy',
    title: 'About this policy',
    paragraphs: [
      'Watchloom is a personal project for discovering movies, series, and anime and keeping a watchlist. This policy describes the information the site uses to provide those features.',
      'The site does not host or stream movies, series, or anime.',
    ],
  },
  {
    id: 'information',
    title: 'Information Watchloom uses',
    paragraphs: ['Depending on the features you use, Watchloom stores:'],
    bullets: [
      'Account details such as your email address, username, display name, and a password hash used to sign you in.',
      'A profile photo, if you choose to upload one.',
      'Your watchlist status, ratings, preferences, and saved season and episode progress.',
      'A community comment, if you choose to publish one. Your display name and comment are shown publicly in the community carousel; your email and watchlist are not.',
      'Short-lived email codes used for account verification and password changes.',
    ],
  },
  {
    id: 'use',
    title: 'How information is used',
    paragraphs: [
      'Account and watchlist information is used to sign you in, show your library and progress, personalize your experience, and protect account changes. Email codes are sent only for the account action you request.',
      'Public comments are used to display the community carousel. Do not include private or sensitive information in a comment.',
    ],
  },
  {
    id: 'storage',
    title: 'Browser storage',
    paragraphs: [
      'Watchloom stores sign-in session information and your theme preference in your browser’s local storage. This lets the site keep you signed in and remember your selected appearance. You can clear this storage in your browser settings; clearing sign-in data will sign you out.',
    ],
  },
  {
    id: 'providers',
    title: 'Hosting and service providers',
    paragraphs: [
      'Account and library data is stored in a database hosted by MongoDB Atlas, and the application is hosted by Render. Account emails are sent through the configured SMTP delivery provider. These providers process information to operate their services and under their own policies.',
      'Catalog details and artwork are obtained from services such as TMDB and AniList. Their services and privacy practices are governed by their own terms. Watchloom does not control their availability or policies.',
    ],
  },
  {
    id: 'choices',
    title: 'Your choices',
    paragraphs: [
      'You can remove a profile photo, update or remove your public comment, change library statuses, and unmark saved episodes in the site. You can also clear local storage in your browser to remove locally saved session and theme settings.',
      'Watchloom currently has no self-service account deletion control and does not publish a dedicated privacy contact address. Do not place private account details in public comments.',
    ],
  },
  {
    id: 'retention-security',
    title: 'Retention and security',
    paragraphs: [
      'Account and library information is kept to provide Watchloom’s features. Verification and password-change codes are short-lived and intended for one use. The project uses measures such as password hashing and protected account routes, but no website can guarantee absolute security.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    paragraphs: [
      'This policy may be updated when Watchloom changes. The date at the top of this page shows when it was last revised.',
    ],
  },
]

const PrivacyPolicyPage = () => (
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
          <ShieldCheck className="h-4 w-4" /> Watchloom / Privacy
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground-strong sm:text-5xl">
          Privacy policy
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          A plain-language overview of the information Watchloom uses and the choices available to you.
        </p>
        <p className="mt-5 inline-flex items-center rounded-full border border-border/10 bg-surface px-3 py-1.5 text-xs font-medium text-muted">
          Last updated November 5, 2026
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
          <nav aria-label="Privacy policy sections" className="grid gap-1">
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
            to="/terms"
            className="mt-5 flex items-center justify-between border-t border-border/10 pt-4 text-sm font-semibold text-accent-foreground transition hover:text-foreground-strong"
          >
            Terms &amp; conditions <span aria-hidden="true">↗</span>
          </Link>
        </aside>
      </div>
    </div>
  </main>
)

export default PrivacyPolicyPage
