import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, MessageSquarePlus } from 'lucide-react'
import { siteIssueService, type SiteIssueCategory } from '@/services/siteIssueService'

const categories: { value: SiteIssueCategory; label: string }[] = [
  { value: 'bug', label: 'Something broken' },
  { value: 'feature', label: 'New idea' },
  { value: 'performance', label: 'Slow or laggy' },
  { value: 'other', label: 'Other' },
]

export const FooterImprovementForm = () => {
  const { pathname } = useLocation()
  const [category, setCategory] = useState<SiteIssueCategory>('feature')
  const [message, setMessage] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: siteIssueService.submit,
    onSuccess: () => {
      setMessage('')
      setContactEmail('')
      setFormError(null)
    },
    onError: () => {
      setFormError('Could not send your note right now. Please try again in a moment.')
    },
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = message.trim()
    if (trimmed.length < 10) {
      setFormError('Please write at least 10 characters so we understand the issue.')
      return
    }
    setFormError(null)
    mutation.mutate({
      message: trimmed,
      category,
      page_path: pathname,
      contact_email: contactEmail.trim() || undefined,
      company_website: honeypot || undefined,
    })
  }

  return (
    <section
      className="border-t border-border/10 pt-10"
      aria-labelledby="footer-improvement-title"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md">
          <div className="mb-2 inline-flex items-center gap-2 text-primary-500">
            <MessageSquarePlus className="h-4 w-4" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
              Help improve Watchloom
            </span>
          </div>
          <h2 id="footer-improvement-title" className="font-display text-xl font-semibold tracking-tight text-foreground-strong">
            Tell us what to fix or build next
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Bug, slow page, or missing feature — we save every report as an issue in our database.
            Add your email only if you want a reply.
          </p>
        </div>

        {mutation.isSuccess ? (
          <div
            className="flex w-full max-w-xl items-start gap-3 rounded-2xl border border-primary-500/25 bg-primary-500/10 p-5 text-sm text-foreground-strong lg:mt-1"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" aria-hidden />
            <div>
              <p className="font-semibold">Thanks — we got it.</p>
              <p className="mt-1 text-muted">Your suggestion is stored and will help shape the next updates.</p>
              <button
                type="button"
                onClick={() => mutation.reset()}
                className="mt-3 text-sm font-medium text-primary-600 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                Send another note
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl space-y-4 rounded-2xl border border-border/10 bg-surface p-5 sm:p-6"
            noValidate
          >
            <fieldset className="m-0 space-y-2 border-0 p-0">
              <legend className="mb-1.5 block w-full text-sm font-medium text-foreground-strong">Type</legend>
              <div
                role="radiogroup"
                aria-label="Feedback type"
                className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
              >
                {categories.map((item) => {
                  const isSelected = category === item.value
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setCategory(item.value)}
                      className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                        isSelected
                          ? 'border-primary-500/50 bg-primary-500/15 text-foreground-strong shadow-sm'
                          : 'border-border/15 bg-background text-muted-foreground hover:border-border/25 hover:bg-surface hover:text-foreground-strong'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="footer-issue-email" className="mb-1.5 block text-sm font-medium text-foreground-strong">
                Email <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="footer-issue-email"
                type="email"
                autoComplete="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-border/15 bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/25"
              />
            </div>

            <div>
              <label htmlFor="footer-issue-message" className="mb-1.5 block text-sm font-medium text-foreground-strong">
                What should we improve?
              </label>
              <textarea
                id="footer-issue-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                required
                minLength={10}
                maxLength={2000}
                placeholder="Describe the problem or idea…"
                className="w-full resize-y rounded-xl border border-border/15 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/25"
              />
            </div>

            <div className="hidden" aria-hidden>
              <label htmlFor="footer-issue-website">Website</label>
              <input
                id="footer-issue-website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-[#11150d] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-500"
              style={{ backgroundColor: 'var(--watchloom-primary)' }}
            >
              {mutation.isPending ? 'Sending…' : 'Submit feedback'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}