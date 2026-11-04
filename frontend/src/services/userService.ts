import api from './api'
import type { User } from '@/types'

export interface ChangePasswordInput {
  code: string
  password: string
  confirm_password: string
}

export const userService = {
  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/v1/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async removeAvatar(): Promise<User> {
    const response = await api.patch('/api/v1/users/me', { avatar: null })
    return response.data
  },

  async requestPasswordChangeCode(): Promise<void> {
    await api.post('/api/v1/users/me/password/code')
  },

  async changePassword(data: ChangePasswordInput): Promise<void> {
    await api.put('/api/v1/users/me/password', data)
  },
}
