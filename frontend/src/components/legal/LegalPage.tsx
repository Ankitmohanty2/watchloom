import type { ReactNode } from 'react'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

export interface LegalSection {
  id: string
  title: string
  paragraphs: ReactNode[]
  bullets?: ReactNode[]
}

interface LegalPageProps {
  icon: LucideIcon
  /** Short name shown in the breadcrumb, for example "Privacy". */
  kicker: string
  title: string
  intro: string
  lastUpdated: string
  sections: LegalSection[]
}

const policies = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/cookies', label: 'Cookies & storage' },
  { to: '/content-policy', label: 'Content & copyright' },
]

const legalLinkClass = 'font-medium text-accent-foreground underline decoration-border/30 underline-offset-4 transition hover:decoration-current'

/** Inline link for policy text. Paths starting with "/" stay inside the app. */
export const LegalLink = ({ to, children }: { to: string; children: ReactNode }) => (
  to.startsWith('/')
    ? <Link to={to} className={legalLinkClass}>{children}</Link>
    : <a href={to} target="_blank" rel="noopener noreferrer" className={legalLinkClass}>{children}</a>
)

export const LegalPage = ({ icon: Icon, kicker, title, intro, lastUpdated, sections }: LegalPageProps) => (
  <div className="min-h-[65vh] bg-background text-foreground">
    <div className="container-custom max-w-6xl py-10 sm:py-14">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted transition-colors hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Watchloom
      </Link>

      <header className="mb-8 sm:mb-10">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
          <Icon className="h-4 w-4" /> Watchloom / {kicker}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground-strong sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">{intro}</p>
        <p className="mt-5 inline-flex items-center rounded-full border border-border/10 bg-surface px-3 py-1.5 text-xs font-medium text-muted">
          Last updated {lastUpdated}
        </p>
      </header>

      <nav
        aria-label="Watchloom policies"
        className="mb-8 flex gap-1.5 overflow-x-auto border-b border-border/10 pb-4 [scrollbar-width:none] sm:mb-10 [&::-webkit-scrollbar]:hidden"
      >
        {policies.map((policy) => (
          <NavLink
            key={policy.to}
            to={policy.to}
            className={({ isActive }) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${isActive ? 'bg-primary-500 text-[#11150d]' : 'border border-border/10 bg-surface text-muted-foreground hover:text-foreground-strong'}`}
          >
            {policy.label}
          </NavLink>
        ))}
      </nav>

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
                {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                {section.bullets && (
                  <ul className="space-y-2 pl-5 marker:text-brand-muted">
                    {section.bullets.map((item, itemIndex) => <li key={itemIndex} className="list-disc">{item}</li>)}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </article>

        <aside className="hidden h-fit rounded-3xl border border-border/10 bg-surface-alt p-5 lg:sticky lg:top-28 lg:block">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">On this page</p>
          <nav aria-label={`${title} sections`} className="grid gap-1">
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
        </aside>
      </div>
    </div>
  </div>
)
