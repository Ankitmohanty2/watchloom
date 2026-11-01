import api from './api'
import type { User } from '@/types'

interface SignUpData {
  display_name: string
  username: string
  email: string
  password: string
  confirm_password: string
}

interface LoginData {
  email_or_username: string
  password: string
}

interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  token_type: string
}

export const authService = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await api.post('/api/v1/auth/signup', data)
    return response.data
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/api/v1/auth/login', data)
    return response.data
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/api/v1/auth/logout', { refresh_token: refreshToken })
  },

  async getMe(): Promise<User> {
    const response = await api.get('/api/v1/auth/me')
    return response.data
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await api.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },
}
