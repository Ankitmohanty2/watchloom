import api from './api'
import type { Media } from '@/types'

export const mediaService = {
  async search(query: string, mediaType?: string, page = 1) {
    const params = new URLSearchParams({ query, page: page.toString() })
    if (mediaType) params.append('media_type', mediaType)
    const response = await api.get(`/api/v1/media/search?${params}`)
    return response.data
  },

  async getTrending(mediaType = 'all', page = 1) {
    const response = await api.get('/api/v1/media/trending', {
      params: { media_type: mediaType, page },
    })
    return response.data
  },

  async getPopular(mediaType: string, page = 1) {
    const response = await api.get('/api/v1/media/popular', {
      params: { media_type: mediaType, page },
    })
    return response.data
  },

  async getGenres(mediaType = 'movie') {
    const response = await api.get('/api/v1/media/genres', {
      params: { media_type: mediaType },
    })
    return response.data
  },

  async getTrailer(provider: string, providerId: number, mediaType: string) {
    const response = await api.get(`/api/v1/media/trailer/${encodeURIComponent(provider)}/${providerId}`, {
      params: { media_type: mediaType },
    })
    return response.data as { trailer_url: string | null }
  },

  async getSimilar(provider: string, providerId: number, mediaType: string, page = 1) {
    const response = await api.get(`/api/v1/media/similar/${encodeURIComponent(provider)}/${providerId}`, {
      params: { media_type: mediaType, page },
    })
    return response.data as { results: Media[]; page: number }
  },

  async getMediaDetails(mediaId: string): Promise<Media> {
    const response = await api.get(`/api/v1/media/${mediaId}`)
    return response.data
  },

  async fetchAndStore(provider: string, providerId: number, mediaType: string): Promise<Media> {
    const response = await api.post('/api/v1/media/fetch', null, {
      params: { provider, provider_id: providerId, media_type: mediaType },
    })
    return response.data
  },
}


