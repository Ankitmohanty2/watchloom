import api from './api'
import type { EpisodeProgress } from '@/types'

export const progressService = {
  async getMediaProgress(mediaId: string) {
    const response = await api.get(`/api/v1/progress/${mediaId}`)
    return response.data
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

  async getContinueWatching() {
    const response = await api.get('/api/v1/progress/continue-watching')
    return response.data
  },
}
