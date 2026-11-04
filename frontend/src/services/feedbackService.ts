import api from './api'
import type { SiteFeedback } from '@/types'

interface FeedbackInput {
  comment: string
  public_consent: true
}

export const feedbackService = {
  async listPublic(limit = 8): Promise<SiteFeedback[]> {
    const response = await api.get('/api/v1/feedback', { params: { limit } })
    return response.data
  },

  async getMine(): Promise<SiteFeedback | null> {
    const response = await api.get('/api/v1/feedback/me')
    return response.data
  },

  async saveMine(data: FeedbackInput): Promise<SiteFeedback> {
    const response = await api.put('/api/v1/feedback/me', data)
    return response.data
  },

  async deleteMine(): Promise<void> {
    await api.delete('/api/v1/feedback/me')
  },
}
