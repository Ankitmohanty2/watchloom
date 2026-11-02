import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')
const apiBaseUrl = import.meta.env.PROD
  ? configuredApiBaseUrl?.startsWith('https://')
    ? configuredApiBaseUrl
    : 'https://watchloom.onrender.com'
  : configuredApiBaseUrl || 'http://localhost:8000'

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const response = await axios.post(
            `${apiBaseUrl}/api/v1/auth/refresh`,
            { refresh_token: refreshToken }
          )
          const { access_token, refresh_token } = response.data
          useAuthStore.getState().setTokens(access_token, refresh_token)
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        useAuthStore.getState().logout()
        window.location.href = '/signin'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
