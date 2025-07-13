import axios from 'axios'
import { TokenStorage } from '../utils/storage'
import { LoginRequest, LoginResponse, User } from '../types/auth'

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function createApiClient(apiBaseUrl: string) {
  return axios.create({
    baseURL: apiBaseUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export class AuthService {
  private apiBaseUrl: string
  private apiClient: ReturnType<typeof createApiClient>

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || DEFAULT_API_BASE_URL
    this.apiClient = createApiClient(this.apiBaseUrl)

    // Request interceptor to add auth token
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = TokenStorage.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const refreshToken = TokenStorage.getRefreshToken()
            if (!refreshToken) {
              throw new Error('No refresh token available')
            }
            const response = await axios.post(`${this.apiBaseUrl}/api/auth/refresh`, {}, {
              headers: {
                'Authorization': `Bearer ${refreshToken}`
              }
            })
            const { access_token, refresh_token } = response.data
            TokenStorage.setToken(access_token)
            TokenStorage.setRefreshToken(refresh_token)
            originalRequest.headers.Authorization = `Bearer ${access_token}`
            return this.apiClient(originalRequest)
          } catch (refreshError) {
            TokenStorage.removeToken()
            TokenStorage.removeRefreshToken()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async login(credentials: LoginRequest, apiBaseUrlOverride?: string): Promise<LoginResponse> {
    const apiBaseUrl = apiBaseUrlOverride || this.apiBaseUrl
    const response = await axios.post(`${apiBaseUrl}/api/auth/login`, 
      `username=${credentials.username}&password=${credentials.password}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    const data = response.data
    TokenStorage.setToken(data.access_token)
    TokenStorage.setRefreshToken(data.refresh_token)
    return data
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      TokenStorage.removeToken()
      TokenStorage.removeRefreshToken()
    }
  }

  async getCurrentUser(): Promise<User> {
    return await this.apiClient.get('/api/users/me').then(response => response.data)
  }

  async validateToken(): Promise<User | null> {
    try {
      const token = TokenStorage.getToken()
      if (!token) {
        return null
      }
      const user = await this.getCurrentUser()
      return user
    } catch (error) {
      console.error('Token validation failed:', error)
      TokenStorage.removeToken()
      TokenStorage.removeRefreshToken()
      return null
    }
  }

  isAuthenticated(): boolean {
    return TokenStorage.getToken() !== null
  }

  getToken(): string | null {
    return TokenStorage.getToken()
  }

  getRefreshToken(): string | null {
    return TokenStorage.getRefreshToken()
  }
}

export const authService = new AuthService()