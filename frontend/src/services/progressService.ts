import api from './api'
import type { ContinueWatchingItem, EpisodeProgress, MediaProgress } from '@/types'

export const progressService = {
  async getMediaProgress(mediaId: string): Promise<MediaProgress> {
    const response = await api.get(`/api/v1/progress/${mediaId}`)
    return response.data as MediaProgress
  },

  async markEpisodeWatched(
    mediaId: string,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<EpisodeProgress> {
    const response = await api.post(`/api/v1/progress/${mediaId}/episodes`, {
      season_number: seasonNumber,
      episode_number: episodeNumber,
    })
    return response.data
  },

  async unmarkEpisode(mediaId: string, seasonNumber: number, episodeNumber: number): Promise<void> {
    await api.delete(`/api/v1/progress/${mediaId}/episodes/${seasonNumber}/${episodeNumber}`)
  },

  async getContinueWatching(): Promise<ContinueWatchingItem[]> {
    const response = await api.get('/api/v1/progress/continue-watching')
    return response.data.results
  },
}
