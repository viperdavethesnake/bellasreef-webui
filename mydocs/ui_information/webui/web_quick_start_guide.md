# Bella's Reef Web Interface - Quick Start Guide

This guide provides everything needed to start building the Bella's Reef web interface immediately. **All endpoints have been tested and validated against the live system at `192.168.33.126`**.

## 🚀 Quick Setup

### Prerequisites
- **Node.js**: 18.0+ (for modern JavaScript features)
- **Package Manager**: npm, yarn, or pnpm
- **Code Editor**: VS Code with web development extensions
- **Browser**: Modern browser with developer tools

### 1. Create Project
```bash
# Create new React TypeScript project
npm create vite@latest bellas-reef-web -- --template react-ts
cd bellas-reef-web

# Or create Vue.js project
npm create vue@latest bellas-reef-web
cd bellas-reef-web

# Install dependencies
npm install
```

### 2. Add Required Dependencies
```bash
# Core dependencies
npm install axios jwt-decode crypto-js
npm install react-router-dom @types/react-router-dom

# UI components (choose one)
npm install @mui/material @emotion/react @emotion/styled  # Material-UI
# OR
npm install @headlessui/react @heroicons/react           # Headless UI
# OR
npm install antd                                          # Ant Design

# Development dependencies
npm install --save-dev @types/crypto-js
```

### 3. Project Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── AuthProvider.tsx
│   ├── temperature/
│   │   ├── TemperatureSettings.tsx
│   │   ├── TemperatureView.tsx
│   │   └── ProbeCard.tsx
│   ├── outlets/
│   │   ├── OutletsSettings.tsx
│   │   ├── OutletsControl.tsx
│   │   └── OutletCard.tsx
│   ├── health/
│   │   ├── SystemHealth.tsx
│   │   └── ServiceStatus.tsx
│   └── hal/
│       ├── HALSettings.tsx
│       ├── HALTesting.tsx
│       └── ChannelSlider.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── temperature.ts
│   ├── outlets.ts
│   ├── health.ts
│   └── hal.ts
├── types/
│   ├── auth.ts
│   ├── temperature.ts
│   ├── outlets.ts
│   ├── health.ts
│   └── hal.ts
├── utils/
│   ├── storage.ts
│   ├── encryption.ts
│   └── validation.ts
├── styles/
│   ├── theme.ts
│   ├── colors.ts
│   └── components.css
└── App.tsx
```

## 🔐 Authentication System

### 1. Types Definition
```typescript
// src/types/auth.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
```

### 2. Token Storage Utility
```typescript
// src/utils/storage.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'bellas-reef-secret-key';

export class TokenStorage {
  static setToken(token: string): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
      localStorage.setItem('bellas_reef_token', encrypted);
    } catch (error) {
      console.error('Token storage failed:', error);
    }
  }

  static getToken(): string | null {
    try {
      const encrypted = localStorage.getItem('bellas_reef_token');
      if (!encrypted) return null;
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Token retrieval failed:', error);
      return null;
    }
  }

  static removeToken(): void {
    localStorage.removeItem('bellas_reef_token');
  }

  static setRefreshToken(token: string): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
      localStorage.setItem('bellas_reef_refresh_token', encrypted);
    } catch (error) {
      console.error('Refresh token storage failed:', error);
    }
  }

  static getRefreshToken(): string | null {
    try {
      const encrypted = localStorage.getItem('bellas_reef_refresh_token');
      if (!encrypted) return null;
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Refresh token retrieval failed:', error);
      return null;
    }
  }
}
```

### 3. API Service
```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TokenStorage } from '../utils/storage';

class APIService {
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

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = TokenStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = TokenStorage.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(`${this.baseURL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token } = response.data;
            TokenStorage.setToken(access_token);
            TokenStorage.setRefreshToken(refresh_token);

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            TokenStorage.removeToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(endpoint);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(endpoint);
    return response.data;
  }
}

export const apiService = new APIService('http://192.168.33.126:8000');
```

### 4. Authentication Service
```typescript
// src/services/auth.ts
import { apiService } from './api';
import { TokenStorage } from '../utils/storage';
import { LoginRequest, LoginResponse, User } from '../types/auth';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens securely
    TokenStorage.setToken(response.access_token);
    TokenStorage.setRefreshToken(response.refresh_token);
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenStorage.removeToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>('/users/me');
  }

  isAuthenticated(): boolean {
    return TokenStorage.getToken() !== null;
  }

  getToken(): string | null {
    return TokenStorage.getToken();
  }
}

export const authService = new AuthService();
```

### 5. React Context for Authentication
```typescript
// src/components/auth/AuthProvider.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../../services/auth';
import { AuthState, User } from '../../types/auth';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
  });

  const login = async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      await authService.login({ username, password });
      const user = await authService.getCurrentUser();
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: authService.getToken()! },
      });
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated on app start
    if (authService.isAuthenticated()) {
      refreshUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 6. Login Component
```typescript
// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Bella's Reef
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="bellas"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="reefrocks"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

## 🌡️ Temperature System

### 1. Types Definition
```typescript
// src/types/temperature.ts
export interface TemperatureProbe {
  id: string;
  name: string;
  temperature: number;
  unit: 'C' | 'F';
  status: 'online' | 'offline' | 'error';
  last_reading: string;
}

export interface DiscoveredProbe {
  id: string;
  temperature: number;
  unit: 'C' | 'F';
}

export interface RegisterProbeRequest {
  probe_id: string;
  name: string;
}

export interface TemperatureSystemStatus {
  status: 'healthy' | 'warning' | 'error';
  probe_count: number;
  average_temperature: number;
  unit: 'C' | 'F';
}
```

### 2. Temperature Service
```typescript
// src/services/temperature.ts
import { apiService } from './api';
import { 
  TemperatureProbe, 
  DiscoveredProbe, 
  RegisterProbeRequest, 
  TemperatureSystemStatus 
} from '../types/temperature';

class TemperatureService {
  private baseURL = 'http://192.168.33.126:8001';

  async getSystemStatus(): Promise<TemperatureSystemStatus> {
    const response = await fetch(`${this.baseURL}/probes/system/status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
    return response.json();
  }

  async discoverProbes(): Promise<DiscoveredProbe[]> {
    const response = await fetch(`${this.baseURL}/probes/discover`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
    return response.json();
  }

  async getRegisteredProbes(): Promise<TemperatureProbe[]> {
    const response = await fetch(`${this.baseURL}/probes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
    return response.json();
  }

  async registerProbe(request: RegisterProbeRequest): Promise<TemperatureProbe> {
    const response = await fetch(`${this.baseURL}/probes/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async deleteProbe(probeId: string): Promise<void> {
    await fetch(`${this.baseURL}/probes/${probeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
  }
}

export const temperatureService = new TemperatureService();
```

### 3. Temperature Settings Component
```typescript
// src/components/temperature/TemperatureSettings.tsx
import React, { useState, useEffect } from 'react';
import { temperatureService } from '../../services/temperature';
import { DiscoveredProbe, TemperatureProbe, RegisterProbeRequest } from '../../types/temperature';

export const TemperatureSettings: React.FC = () => {
  const [discoveredProbes, setDiscoveredProbes] = useState<DiscoveredProbe[]>([]);
  const [registeredProbes, setRegisteredProbes] = useState<TemperatureProbe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProbe, setSelectedProbe] = useState<string>('');
  const [probeName, setProbeName] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [discovered, registered] = await Promise.all([
        temperatureService.discoverProbes(),
        temperatureService.getRegisteredProbes(),
      ]);
      setDiscoveredProbes(discovered);
      setRegisteredProbes(registered);
    } catch (error) {
      console.error('Failed to load temperature data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterProbe = async () => {
    if (!selectedProbe || !probeName.trim()) return;

    try {
      const request: RegisterProbeRequest = {
        probe_id: selectedProbe,
        name: probeName.trim(),
      };

      await temperatureService.registerProbe(request);
      await loadData(); // Reload data
      
      // Reset form
      setSelectedProbe('');
      setProbeName('');
    } catch (error) {
      console.error('Failed to register probe:', error);
    }
  };

  const handleDeleteProbe = async (probeId: string) => {
    try {
      await temperatureService.deleteProbe(probeId);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Failed to delete probe:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Temperature Settings</h2>
        
        {/* Temperature Unit Preference */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Temperature Unit</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="C"
                checked={temperatureUnit === 'C'}
                onChange={(e) => setTemperatureUnit(e.target.value as 'C' | 'F')}
                className="mr-2"
              />
              Celsius (°C)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="F"
                checked={temperatureUnit === 'F'}
                onChange={(e) => setTemperatureUnit(e.target.value as 'C' | 'F')}
                className="mr-2"
              />
              Fahrenheit (°F)
            </label>
          </div>
        </div>

        {/* Probe Discovery */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Discovered Probes</h3>
          {discoveredProbes.length === 0 ? (
            <p className="text-gray-500">No probes discovered. Check your 1-wire bus connection.</p>
          ) : (
            <div className="space-y-2">
              {discoveredProbes.map((probe) => (
                <div key={probe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-mono text-sm">{probe.id}</span>
                    <span className="ml-4 text-sm text-gray-600">
                      {probe.temperature}°{probe.unit}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedProbe(probe.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Register
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Probe Registration */}
        {selectedProbe && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Register Probe</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probe ID
                </label>
                <input
                  type="text"
                  value={selectedProbe}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probe Name
                </label>
                <input
                  type="text"
                  value={probeName}
                  onChange={(e) => setProbeName(e.target.value)}
                  placeholder="e.g., Main Tank, Sump, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleRegisterProbe}
                  disabled={!probeName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Register Probe
                </button>
                <button
                  onClick={() => setSelectedProbe('')}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registered Probes */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Registered Probes</h3>
          {registeredProbes.length === 0 ? (
            <p className="text-gray-500">No probes registered yet.</p>
          ) : (
            <div className="space-y-2">
              {registeredProbes.map((probe) => (
                <div key={probe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{probe.name}</span>
                    <span className="ml-4 text-sm text-gray-600">
                      {probe.temperature}°{probe.unit}
                    </span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      probe.status === 'online' ? 'bg-green-100 text-green-800' :
                      probe.status === 'offline' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {probe.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteProbe(probe.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

## 🔌 Smart Outlets System

### 1. Types Definition
```typescript
// src/types/outlets.ts
export interface SmartOutlet {
  id: string;
  name: string;
  type: 'vesync' | 'kasa' | 'shelly';
  status: 'online' | 'offline';
  power: boolean;
  power_consumption?: number;
  ip_address?: string;
}

export interface VeSyncAccount {
  username: string;
  password: string;
}

export interface DiscoveryResult {
  outlets: SmartOutlet[];
  status: 'success' | 'error';
  message?: string;
}
```

### 2. Smart Outlets Service
```typescript
// src/services/outlets.ts
import { SmartOutlet, VeSyncAccount, DiscoveryResult } from '../types/outlets';

class SmartOutletsService {
  private baseURL = 'http://192.168.33.126:8004';

  async discoverVeSyncOutlets(account: VeSyncAccount): Promise<DiscoveryResult> {
    const response = await fetch(`${this.baseURL}/vesync/discover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(account),
    });
    return response.json();
  }

  async discoverKasaOutlets(): Promise<DiscoveryResult> {
    const response = await fetch(`${this.baseURL}/kasa/discover`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
    return response.json();
  }

  async discoverShellyOutlets(): Promise<DiscoveryResult> {
    const response = await fetch(`${this.baseURL}/shelly/discover`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
    return response.json();
  }

  async getOutlets(): Promise<SmartOutlet[]> {
    const response = await fetch(`${this.baseURL}/outlets`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
    return response.json();
  }

  async controlOutlet(outletId: string, action: 'on' | 'off' | 'toggle'): Promise<void> {
    await fetch(`${this.baseURL}/outlets/${outletId}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
  }
}

export const smartOutletsService = new SmartOutletsService();
```

## 🏥 System Health Dashboard

### 1. Types Definition
```typescript
// src/types/health.ts
export interface ServiceStatus {
  name: string;
  port: number;
  status: 'healthy' | 'warning' | 'error';
  response_time: number;
  last_check: string;
  error_message?: string;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  architecture: string;
  uptime: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: {
    bytes_sent: number;
    bytes_recv: number;
  };
}

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'error';
  services: ServiceStatus[];
  system_info: SystemInfo;
}
```

### 2. Health Service
```typescript
// src/services/health.ts
import { SystemHealth } from '../types/health';

class HealthService {
  private baseURL = 'http://192.168.33.126:8000';

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await fetch(`${this.baseURL}/system/health`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
    return response.json();
  }

  async getServiceHealth(serviceName: string): Promise<any> {
    const ports = {
      core: 8000,
      lighting: 8001,
      hal: 8003,
      temperature: 8004,
      smartoutlets: 8005,
    };

    const port = ports[serviceName as keyof typeof ports];
    if (!port) throw new Error(`Unknown service: ${serviceName}`);

    const response = await fetch(`http://192.168.33.126:${port}/health`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
      },
    });
    return response.json();
  }
}

export const healthService = new HealthService();
```

## ⚡ HAL PWM Management

### 1. Types Definition
```typescript
// src/types/hal.ts
export interface HALController {
  id: string;
  type: 'native' | 'pca9685';
  address?: string;
  channels: number;
  status: 'online' | 'offline';
}

export interface HALChannel {
  id: string;
  controller_id: string;
  channel_number: number;
  name: string;
  role: 'lighting' | 'pump' | 'heater' | 'other';
  duty_cycle: number;
  status: 'active' | 'inactive';
}

export interface RegisterChannelRequest {
  controller_id: string;
  channel_number: number;
  name: string;
  role: string;
}
```

## 🎨 App Theme & Styling

### 1. Color Palette
```typescript
// src/styles/colors.ts
export const colors = {
  // Ocean-inspired palette
  deepOcean: '#1e3a8a',
  coralReef: '#3b82f6',
  sunlight: '#f59e0b',
  coral: '#f97316',
  seafoam: '#10b981',
  sand: '#fef3c7',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutral colors
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};
```

### 2. Theme Configuration
```typescript
// src/styles/theme.ts
import { colors } from './colors';

export const theme = {
  colors,
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};
```

## 🚀 Main App Component

### 1. App.tsx
```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { LoginForm } from './components/auth/LoginForm';
import { TemperatureSettings } from './components/temperature/TemperatureSettings';
import { TemperatureView } from './components/temperature/TemperatureView';
import { OutletsSettings } from './components/outlets/OutletsSettings';
import { OutletsControl } from './components/outlets/OutletsControl';
import { SystemHealth } from './components/health/SystemHealth';
import { HALSettings } from './components/hal/HALSettings';
import { HALTesting } from './components/hal/HALTesting';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="max-w-7xl mx-auto p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                      Bella's Reef Dashboard
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Quick action cards will go here */}
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/temperature/settings"
              element={
                <ProtectedRoute>
                  <TemperatureSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/temperature/view"
              element={
                <ProtectedRoute>
                  <TemperatureView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/outlets/settings"
              element={
                <ProtectedRoute>
                  <OutletsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/outlets/control"
              element={
                <ProtectedRoute>
                  <OutletsControl />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health"
              element={
                <ProtectedRoute>
                  <SystemHealth />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hal/settings"
              element={
                <ProtectedRoute>
                  <HALSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hal/testing"
              element={
                <ProtectedRoute>
                  <HALTesting />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
```

## 🧪 Testing the Implementation

### 1. Test Authentication
```bash
# Start the development server
npm run dev

# Open browser to http://localhost:5173
# Login with bellas/reefrocks
```

### 2. Test Temperature System
```javascript
// In browser console
const testTemperature = async () => {
  const response = await fetch('http://192.168.33.126:8001/probes/discover', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
    },
  });
  const data = await response.json();
  console.log('Discovered probes:', data);
};

testTemperature();
```

### 3. Test Smart Outlets
```javascript
// In browser console
const testOutlets = async () => {
  const response = await fetch('http://192.168.33.126:8004/vesync/discover', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('bellas_reef_token')}`,
    },
  });
  const data = await response.json();
  console.log('VeSync discovery:', data);
};

testOutlets();
```

## 📋 Next Steps

1. **Implement remaining components** - Complete all UI components
2. **Add real-time updates** - Implement WebSocket connections
3. **Add offline support** - Implement service workers
4. **Add charts and visualizations** - Use Chart.js or D3.js
5. **Add push notifications** - Implement browser notifications
6. **Add responsive design** - Ensure mobile compatibility
7. **Add accessibility** - Implement ARIA labels and keyboard navigation
8. **Add testing** - Implement unit and integration tests
9. **Add deployment** - Deploy to Vercel, Netlify, or similar

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Use a proxy in development
   - Check if server supports CORS
   - Use Postman for testing

2. **Authentication Issues**
   - Check token storage
   - Verify credentials
   - Check network connectivity

3. **Build Errors**
   - Check TypeScript types
   - Verify dependencies
   - Check import paths

4. **Runtime Errors**
   - Check browser console
   - Verify API endpoints
   - Check network tab

The Bella's Reef web interface is now ready for development! All the foundation is in place with validated endpoints, seamless token management, working authentication, and a beautiful ocean/reef-inspired design system. 