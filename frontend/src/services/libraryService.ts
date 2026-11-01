import api from './api'
import type { LibraryEntry, LibraryStats, PaginatedResponse } from '@/types'

export const libraryService = {
  async getLibrary(
    status?: string,
    page = 1,
    limit = 20,
    sortBy = 'updated_at'
  ): Promise<PaginatedResponse<LibraryEntry>> {
    const params: any = { page, limit, sort_by: sortBy }
    if (status) params.status = status
    const response = await api.get('/api/v1/library', { params })
    return response.data
  },

  async addToLibrary(mediaId: string, status = 'plan_to_watch'): Promise<LibraryEntry> {
    const response = await api.post('/api/v1/library', { media_id: mediaId, status })
    return response.data
  },

  async updateEntry(
    itemId: string,
    data: { status?: string; personal_rating?: number; notes?: string }
  ): Promise<LibraryEntry> {
    const response = await api.patch(`/api/v1/library/${itemId}`, data)
    return response.data
  },

  async removeFromLibrary(itemId: string): Promise<void> {
    await api.delete(`/api/v1/library/${itemId}`)
  },

  async bulkUpdate(itemIds: string[], data: any): Promise<void> {
    await api.post('/api/v1/library/bulk-update', { item_ids: itemIds, ...data })
  },

  async getStats(): Promise<LibraryStats> {
    const response = await api.get('/api/v1/library/stats')
    return response.data
  },
}
