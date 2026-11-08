import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, RotateCcw, Trash2, Tv } from 'lucide-react'
import { progressService } from '@/services/progressService'
import type { Media } from '@/types'

const apiErrorMessage = (error: unknown) => {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
  return typeof detail === 'string' ? detail : 'We couldn’t update this episode. Please try again.'
}

const episodeLabel = (season: number, episode: number) =>
  `S${String(season).padStart(2, '0')} · E${String(episode).padStart(2, '0')}`

interface EpisodeProgressPanelProps {
  media: Media
}

export const EpisodeProgressPanel = ({ media }: EpisodeProgressPanelProps) => {
  const queryClient = useQueryClient()
  const [seasonNumber, setSeasonNumber] = useState(1)
  const [episodeNumber, setEpisodeNumber] = useState(1)
  const [selectionEdited, setSelectionEdited] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { data: progress, isLoading, isError } = useQuery({
    queryKey: ['progress', media.id],
    queryFn: () => progressService.getMediaProgress(media.id),
    staleTime: 20_000,
    retry: false,
  })

  const episodes = useMemo(() => progress?.episodes ?? [], [progress?.episodes])
  const latestEpisode = useMemo(
    () => [...episodes].sort((a, b) => b.watched_at.localeCompare(a.watched_at))[0],
    [episodes],
  )
  const recentEpisodes = useMemo(
    () => [...episodes].sort((a, b) => b.watched_at.localeCompare(a.watched_at)).slice(0, 4),
    [episodes],
  )

  useEffect(() => {
    if (selectionEdited || isLoading || !latestEpisode) return
    setSeasonNumber(latestEpisode.season_number)
    setEpisodeNumber(latestEpisode.episode_number + 1)
  }, [isLoading, latestEpisode, selectionEdited])

  const selectedIsWatched = episodes.some(
    (episode) => episode.season_number === seasonNumber && episode.episode_number === episodeNumber,
  )

  const refreshProgress = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['progress', media.id] }),
      queryClient.invalidateQueries({ queryKey: ['progress', 'continue-watching'] }),
    ])
  }

  const markWatched = useMutation({
    mutationFn: () => progressService.markEpisodeWatched(media.id, seasonNumber, episodeNumber),
    onSuccess: async () => {
      setMessage(`${episodeLabel(seasonNumber, episodeNumber)} saved to your progress.`)
      setError('')
      setEpisodeNumber((currentEpisode) => currentEpisode + 1)
      await refreshProgress()
    },
    onError: (mutationError) => {
      setError(apiErrorMessage(mutationError))
      setMessage('')
    },
  })

  const unmarkWatched = useMutation({
    mutationFn: ({ season, episode }: { season: number; episode: number }) =>
      progressService.unmarkEpisode(media.id, season, episode),
    onSuccess: async () => {
      setMessage('Episode removed from your watched progress.')
      setError('')
      await refreshProgress()
    },
    onError: (mutationError) => {
      setError(apiErrorMessage(mutationError))
      setMessage('')
    },
  })

  const savedSeasonCount = episodes.reduce((highest, episode) => Math.max(highest, episode.season_number), 0)
  const seasonCount = Math.max(1, Math.min(Math.max(media.season_count ?? 0, savedSeasonCount), 100))

  return (
    <section className="mt-4 rounded-2xl border border-border/10 bg-surface p-4" aria-labelledby="episode-progress-title">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-brand-muted">
          <Tv className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="episode-progress-title" className="text-sm font-semibold text-foreground-strong">Episode progress</h2>
          <p className="mt-1 text-xs leading-5 text-muted">Choose any season and episode to keep your place in {media.title}.</p>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-2 gap-2.5">
        <label className="min-w-0 text-xs font-medium text-muted">
          <span className="flex min-h-8 flex-col justify-end">
            <span>Season</span>
            {seasonCount > 1 && <span className="mt-0.5 truncate text-[10px] font-normal text-muted-foreground">{seasonCount} available</span>}
          </span>
          <select
            value={seasonNumber}
            onChange={(event) => {
              setSelectionEdited(true)
              setSeasonNumber(Number(event.target.value))
            }}
            className="mt-1.5 h-10 w-full rounded-xl border border-border/15 bg-background px-3 text-sm text-foreground outline-none focus:border-primary-500/60 focus:ring-4 focus:ring-primary-500/10"
          >
            {Array.from({ length: seasonCount }, (_, index) => index + 1).map((season) => (
              <option key={season} value={season}>Season {season}</option>
            ))}
          </select>
        </label>
        <label className="min-w-0 text-xs font-medium text-muted">
          <span className="flex min-h-8 items-end">Episode</span>
          <input
            type="number"
            min={1}
            max={999}
            step={1}
            value={episodeNumber}
            onChange={(event) => {
              setSelectionEdited(true)
              setEpisodeNumber(Math.max(1, Number(event.target.value) || 1))
            }}
            className="mt-1.5 h-10 w-full rounded-xl border border-border/15 bg-background px-3 text-sm text-foreground outline-none focus:border-primary-500/60 focus:ring-4 focus:ring-primary-500/10"
          />
        </label>
      </div>

      {selectedIsWatched ? (
        <button
          type="button"
          onClick={() => unmarkWatched.mutate({ season: seasonNumber, episode: episodeNumber })}
          disabled={unmarkWatched.isPending}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border/15 text-sm font-semibold text-foreground transition hover:bg-surface-alt disabled:opacity-60"
        >
          <RotateCcw className="h-4 w-4" />
          {unmarkWatched.isPending ? 'Updating…' : 'Mark as unwatched'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setMessage('')
            setError('')
            markWatched.mutate()
          }}
          disabled={markWatched.isPending || !Number.isInteger(episodeNumber) || episodeNumber < 1}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-[#11150d] transition hover:bg-primary-400 disabled:cursor-wait disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {markWatched.isPending ? 'Saving episode…' : 'Mark episode watched'}
        </button>
      )}

      {isLoading && <p className="mt-3 text-xs text-muted-foreground">Loading saved episodes…</p>}
      {isError && <p role="alert" className="mt-3 text-xs text-rose-500">Your saved episode progress couldn’t load. You can still mark this episode.</p>}
      {error && <p role="alert" className="mt-3 text-xs text-rose-500">{error}</p>}
      {message && <p role="status" className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600"><Check className="h-3.5 w-3.5" />{message}</p>}

      <div className="mt-4 border-t border-border/10 pt-3">
        <p className="text-xs text-muted-foreground">
          {progress?.total_episodes_watched ?? 0} {progress?.total_episodes_watched === 1 ? 'episode' : 'episodes'} saved
          {latestEpisode && <> · Latest saved {episodeLabel(latestEpisode.season_number, latestEpisode.episode_number)}</>}
        </p>
        {recentEpisodes.length > 0 && (
          <ul className="mt-2 grid gap-1" aria-label="Recently tracked episodes">
            {recentEpisodes.map((episode) => (
              <li key={episode.id} className="flex items-center justify-between rounded-lg bg-surface-alt/70 px-2.5 py-2 text-xs text-foreground">
                <span>{episodeLabel(episode.season_number, episode.episode_number)}</span>
                <button
                  type="button"
                  onClick={() => unmarkWatched.mutate({ season: episode.season_number, episode: episode.episode_number })}
                  disabled={unmarkWatched.isPending}
                  title={`Remove ${episodeLabel(episode.season_number, episode.episode_number)} from watched progress`}
                  aria-label={`Remove ${episodeLabel(episode.season_number, episode.episode_number)} from watched progress`}
                  className="rounded-full p-1 text-muted-foreground transition hover:bg-surface hover:text-rose-500 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
