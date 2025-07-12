import axios from 'axios'
import { TokenStorage } from '../utils/storage'
import { LoginRequest, LoginResponse, User } from '../types/auth'

const API_BASE_URL = 'http://192.168.33.126:8000'

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
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

        // Refresh token using Authorization header (not request body)
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        })

        const { access_token, refresh_token } = response.data
        TokenStorage.setToken(access_token)
        TokenStorage.setRefreshToken(refresh_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return apiClient(originalRequest)
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

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, 
      `username=${credentials.username}&password=${credentials.password}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    
    const data = response.data
    
    // Store tokens securely
    TokenStorage.setToken(data.access_token)
    TokenStorage.setRefreshToken(data.refresh_token)
    
    return data
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      TokenStorage.removeToken()
      TokenStorage.removeRefreshToken()
    }
  }

  async getCurrentUser(): Promise<User> {
    return await apiClient.get('/api/users/me').then(response => response.data)
  }

  async validateToken(): Promise<User | null> {
    try {
      const token = TokenStorage.getToken()
      if (!token) {
        return null
      }

      // Validate token by calling /api/users/me
      const user = await this.getCurrentUser()
      return user
    } catch (error) {
      console.error('Token validation failed:', error)
      // Clear invalid tokens
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