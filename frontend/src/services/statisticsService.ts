import api from './api'
import type { Statistics } from '@/types'

export const statisticsService = {
  async getMyStatistics(): Promise<Statistics> {
    const response = await api.get('/api/v1/statistics/me')
    return response.data
  },
}
