import axios, { AxiosInstance } from 'axios';
import { TokenStorage } from '../utils/storage';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse 
} from '../types/auth';

class AuthService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.api.interceptors.request.use((config) => {
      const token = TokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshToken = TokenStorage.getRefreshToken();
          if (refreshToken) {
            try {
              const response = await this.refreshToken({ refresh_token: refreshToken });
              TokenStorage.setToken(response.access_token);
              error.config.headers.Authorization = `Bearer ${response.access_token}`;
              return this.api.request(error.config);
            } catch (refreshError) {
              // Clear tokens and redirect to login
              TokenStorage.clearAll();
              window.location.href = '/login';
            }
          } else {
            // No refresh token, redirect to login
            TokenStorage.clearAll();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/api/auth/login', credentials);
    
    // Store tokens
    TokenStorage.setToken(response.data.access_token);
    TokenStorage.setRefreshToken(response.data.refresh_token);
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenStorage.clearAll();
    }
  }

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await this.api.post<RefreshTokenResponse>('/api/auth/refresh', request);
    return response.data;
  }

  isAuthenticated(): boolean {
    return TokenStorage.getToken() !== null;
  }

  getToken(): string | null {
    return TokenStorage.getToken();
  }
}

// Create singleton instance
const authService = new AuthService('http://192.168.33.126:8000');

export default authService;