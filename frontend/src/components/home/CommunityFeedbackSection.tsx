import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronLeft, ChevronRight, MessageSquareText, Quote, Send, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { feedbackService } from '@/services/feedbackService'
import { useAuthStore } from '@/store/authStore'

const COMMENT_MIN_LENGTH = 20
const COMMENT_MAX_LENGTH = 500

const formatCommentDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(date)
}

const initialsFor = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'W'

const getCardsPerPage = () => {
  if (typeof window === 'undefined') return 3
  if (window.matchMedia('(min-width: 1280px)').matches) return 3
  if (window.matchMedia('(min-width: 768px)').matches) return 2
  return 1
}

export const CommunityFeedbackSection = () => {
  const { isAuthenticated, user } = useAuthStore()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')
  const [publicConsent, setPublicConsent] = useState(false)
  const [activePage, setActivePage] = useState(0)
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage)
  const [carouselPaused, setCarouselPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')

  const publicFeedback = useQuery({
    queryKey: ['site-feedback', 'public'],
    queryFn: () => feedbackService.listPublic(12),
    staleTime: 60_000,
  })
  const myFeedback = useQuery({
    queryKey: ['site-feedback', 'mine'],
    queryFn: feedbackService.getMine,
    enabled: isAuthenticated,
    staleTime: 30_000,
  })

  const refreshFeedback = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['site-feedback', 'public'] }),
      queryClient.invalidateQueries({ queryKey: ['site-feedback', 'mine'] }),
    ])
  }

  const saveFeedback = useMutation({
    mutationFn: feedbackService.saveMine,
    onSuccess: async () => {
      setFormMessage('Your comment is now part of the community.')
      setFormError('')
      setIsConfirmingRemoval(false)
      await refreshFeedback()
    },
    onError: () => {
      setFormError('We couldn’t save your comment. Please try again.')
      setFormMessage('')
    },
  })

  const removeFeedback = useMutation({
    mutationFn: feedbackService.deleteMine,
    onSuccess: async () => {
      setComment('')
      setPublicConsent(false)
      setFormMessage('Your comment has been removed.')
      setFormError('')
      setIsConfirmingRemoval(false)
      await refreshFeedback()
    },
    onError: () => {
      setFormError('We couldn’t remove your comment. Please try again.')
      setFormMessage('')
    },
  })

  const comments = publicFeedback.data ?? []
  const pageCount = Math.max(1, Math.ceil(comments.length / cardsPerPage))
  const visibleComments = comments.slice(activePage * cardsPerPage, (activePage + 1) * cardsPerPage)
  const commentLength = comment.trim().length

  useEffect(() => {
    const updateCardsPerPage = () => setCardsPerPage(getCardsPerPage())
    window.addEventListener('resize', updateCardsPerPage)
    return () => window.removeEventListener('resize', updateCardsPerPage)
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(preference.matches)
    updatePreference()
    preference.addEventListener('change', updatePreference)
    return () => preference.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    setActivePage((page) => Math.min(page, pageCount - 1))
  }, [pageCount])

  useEffect(() => {
    if (pageCount < 2 || carouselPaused || reducedMotion) return
    const timeout = window.setTimeout(() => setActivePage((page) => (page + 1) % pageCount), 7000)
    return () => window.clearTimeout(timeout)
  }, [activePage, carouselPaused, pageCount, reducedMotion])

  useEffect(() => {
    if (myFeedback.data) {
      setComment(myFeedback.data.comment)
      setPublicConsent(true)
    } else if (myFeedback.isSuccess) {
      setComment('')
      setPublicConsent(false)
    }
  }, [myFeedback.data, myFeedback.isSuccess])

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormMessage('')
    setFormError('')
    if (commentLength < COMMENT_MIN_LENGTH) {
      setFormError(`Add at least ${COMMENT_MIN_LENGTH} characters so your comment has a little context.`)
      return
    }
    if (!publicConsent) {
      setFormError('Confirm that your display name and comment can appear publicly.')
      return
    }
    saveFeedback.mutate({ comment: comment.trim(), public_consent: true })
  }

  const moveCarousel = (step: number) => setActivePage((page) => (page + step + pageCount) % pageCount)

  return (
    <section className="border-t border-border/[0.08] py-12 sm:py-16" aria-labelledby="community-feedback-title">
      <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-brand-muted">
            <MessageSquareText className="h-4 w-4" /> The Watchloom community
          </p>
          <h2 id="community-feedback-title" className="font-display text-2xl font-semibold tracking-tight text-foreground-strong sm:text-3xl">
            Made better by people who watch.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Notes from members using Watchloom to keep their stories in one place.
          </p>
        </div>
        {pageCount > 1 && !publicFeedback.isLoading && !publicFeedback.isError && (
          <div className="flex items-center gap-3" aria-label={`Page ${activePage + 1} of ${pageCount}`}>
            <span className="mr-1 text-xs tabular-nums text-muted-foreground">{String(activePage + 1).padStart(2, '0')} / {String(pageCount).padStart(2, '0')}</span>
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Previous community comments" className="flex h-10 w-10 items-center justify-center rounded-full border border-border/15 bg-surface text-muted transition hover:border-border/30 hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Next community comments" className="flex h-10 w-10 items-center justify-center rounded-full border border-border/15 bg-surface text-muted transition hover:border-border/30 hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        role="region"
        aria-roledescription="carousel"
        aria-label="Comments shared by Watchloom members"
        onMouseEnter={() => setCarouselPaused(true)}
        onMouseLeave={() => setCarouselPaused(false)}
        onFocusCapture={() => setCarouselPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCarouselPaused(false)
        }}
      >
        {publicFeedback.isLoading ? Array.from({ length: cardsPerPage }, (_, index) => (
          <div key={index} className="min-h-[245px] animate-pulse rounded-2xl border border-border/[0.08] bg-surface p-6 sm:p-7">
            <div className="mb-8 h-7 w-7 rounded-full bg-surface-alt" />
            <div className="space-y-3"><div className="h-4 w-full rounded bg-surface-alt" /><div className="h-4 w-4/5 rounded bg-surface-alt" /><div className="h-4 w-3/5 rounded bg-surface-alt" /></div>
          </div>
        )) : publicFeedback.isError ? (
          <div className="col-span-full rounded-2xl border border-border/[0.08] bg-surface px-6 py-8 text-sm text-muted">
            Community comments are unavailable right now. Please check back in a moment.
          </div>
        ) : visibleComments.length ? visibleComments.map((item) => (
          <article key={item.id} className="animate-fade-in flex min-h-[245px] flex-col rounded-2xl border border-border/[0.08] bg-surface p-6 shadow-sm transition-colors hover:border-border/20 sm:p-7">
            <Quote className="mb-5 h-6 w-6 fill-[#ffd93d]/15 text-brand-muted" strokeWidth={1.8} aria-hidden="true" />
            <blockquote className="flex-1 text-[15px] leading-7 text-foreground-strong sm:text-base">“{item.comment}”</blockquote>
            <div className="mt-7 flex items-center gap-3 border-t border-border/[0.08] pt-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-xs font-semibold text-brand-muted">
                {initialsFor(item.author_name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground-strong">{item.author_name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Watchloom member{item.created_at ? ` · ${formatCommentDate(item.created_at)}` : ''}
                </span>
              </span>
            </div>
          </article>
        )) : (
          <div className="col-span-full rounded-2xl border border-dashed border-border/20 bg-surface/50 px-6 py-10 text-center sm:py-12">
            <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary-500/10 text-brand-muted"><MessageSquareText className="h-5 w-5" /></span>
            <h3 className="font-display text-lg font-semibold text-foreground-strong">The first note is still unwritten.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Share what’s working well or what would make Watchloom better for your next watch.</p>
          </div>
        )}
      </div>

      {pageCount > 1 && !publicFeedback.isError && !publicFeedback.isLoading && (
        <div className="mt-5 flex justify-center gap-1.5" aria-label="Choose community comments page">
          {Array.from({ length: pageCount }, (_, index) => (
            <button key={index} type="button" onClick={() => setActivePage(index)} aria-label={`Show comment page ${index + 1}`} aria-current={index === activePage ? 'true' : undefined} className={`h-1.5 rounded-full transition-all ${index === activePage ? 'w-7 bg-primary-500' : 'w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground'}`} />
          ))}
        </div>
      )}

      <div className="mt-7 rounded-2xl border border-border/[0.08] bg-surface-alt p-5 sm:mt-8 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-6">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm font-semibold text-foreground-strong">Have a thought about Watchloom?</p>
          <p className="mt-1 text-sm text-muted">Share a note with the community. You can edit or remove it at any time.</p>
        </div>
        {isAuthenticated ? (
          <button type="button" onClick={() => setFormOpen((open) => !open)} aria-expanded={formOpen} aria-controls="community-feedback-form" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-[#17191f] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-500">
            <MessageSquareText className="h-4 w-4" /> {formOpen ? 'Close form' : myFeedback.data ? 'Edit your comment' : 'Write a comment'}
          </button>
        ) : (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link to="/signin" className="inline-flex h-10 items-center justify-center rounded-full border border-border/15 bg-surface px-4 text-sm font-semibold text-foreground-strong transition hover:border-primary-500/50">Sign in</Link>
            <Link to="/signup" className="inline-flex h-10 items-center justify-center rounded-full bg-primary-500 px-4 text-sm font-semibold text-[#17191f] transition hover:brightness-105">Create account</Link>
          </div>
        )}
      </div>

      {isAuthenticated && formOpen && (
        <div id="community-feedback-form" className="mt-4 rounded-2xl border border-border/[0.08] bg-surface p-5 sm:p-7">
          <form onSubmit={submitComment}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-muted">{myFeedback.data ? 'Your community note' : 'Add your voice'}</p>
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground-strong">{myFeedback.data ? 'Update your comment.' : 'What do you think so far?'}</h3>
              </div>
              {user?.display_name && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/10 bg-surface-alt text-xs font-semibold text-foreground-strong">{initialsFor(user.display_name)}</span>}
            </div>

            <label htmlFor="site-feedback-comment" className="mb-2 block text-sm font-medium text-foreground-strong">Your comment</label>
            <textarea
              id="site-feedback-comment"
              value={comment}
              onChange={(event) => { setComment(event.target.value.slice(0, COMMENT_MAX_LENGTH)); setFormMessage(''); setFormError('') }}
              maxLength={COMMENT_MAX_LENGTH}
              rows={4}
              placeholder="What’s working well? What should we improve?"
              className="w-full resize-y rounded-xl border border-border/15 bg-background px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground/80 focus:border-primary-500/60 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{COMMENT_MIN_LENGTH}+ characters</span>
              <span className={commentLength > COMMENT_MAX_LENGTH - 30 ? 'text-brand-muted' : ''}>{comment.length}/{COMMENT_MAX_LENGTH}</span>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border/10 bg-surface-alt px-3.5 py-3 text-xs leading-5 text-muted">
              <input type="checkbox" checked={publicConsent} onChange={(event) => setPublicConsent(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#ffd93d]" />
              <span>I agree that my comment and display name ({user?.display_name || 'my name'}) may appear publicly in the Watchloom carousel.</span>
            </label>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Your comment is visible to visitors. You can edit or remove it later.</p>

            {formError && <p role="alert" className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3.5 py-3 text-sm text-rose-500">{formError}</p>}
            {formMessage && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-3 text-sm text-emerald-600"><Check className="h-4 w-4 shrink-0" />{formMessage}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={saveFeedback.isPending || commentLength < COMMENT_MIN_LENGTH || !publicConsent} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-[#17191f] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-500">
                <Send className="h-4 w-4" /> {saveFeedback.isPending ? 'Saving…' : myFeedback.data ? 'Update comment' : 'Share comment'}
              </button>
              {myFeedback.data && !isConfirmingRemoval && <button type="button" onClick={() => setIsConfirmingRemoval(true)} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted transition hover:bg-surface-alt hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /> Remove</button>}
            </div>

            {isConfirmingRemoval && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/10 bg-surface-alt px-3.5 py-3">
                <span className="text-xs text-muted">Remove your comment from the carousel?</span>
                <span className="flex items-center gap-3">
                  <button type="button" onClick={() => setIsConfirmingRemoval(false)} className="text-xs font-medium text-muted hover:text-foreground-strong">Keep it</button>
                  <button type="button" onClick={() => removeFeedback.mutate()} disabled={removeFeedback.isPending} className="text-xs font-semibold text-rose-500 hover:text-rose-600 disabled:opacity-50">{removeFeedback.isPending ? 'Removing…' : 'Remove'}</button>
                </span>
              </div>
            )}
          </form>
        </div>
      )}
    </section>
  )
}
