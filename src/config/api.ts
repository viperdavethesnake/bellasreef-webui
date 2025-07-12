// API Configuration for Bella's Reef Controller Backend
export const API_CONFIG = {
  // Development: Connect to Pi5 backend
  development: {
    baseURL: 'http://192.168.33.126:8000',
    timeout: 10000,
    retries: 3,
  },
  // Production: Same backend, different config
  production: {
    baseURL: 'http://192.168.33.126:8000', // Local to Pi
    timeout: 5000,
    retries: 2,
  }
}

// Get current environment
const isDev = import.meta.env.DEV
export const currentConfig = isDev ? API_CONFIG.development : API_CONFIG.production

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
  
  // User Management
  users: {
    me: '/api/users/me',
  },
  
  // System Status
  system: {
    status: '/api/system/status',
    health: '/health',
    info: '/api/host-info',
    usage: '/api/system-usage',
  },
  
  // Lighting Control
  lighting: {
    status: '/api/lighting/status',
    control: '/api/lighting/control',
    schedule: '/api/lighting/schedule',
    modes: '/api/lighting/modes',
  },
  
  // Temperature Management
  temperature: {
    current: '/api/temperature/current',
    target: '/api/temperature/target',
    history: '/api/temperature/history',
    control: '/api/temperature/control',
  },
  
  // Flow Control
  flow: {
    status: '/api/flow/status',
    control: '/api/flow/control',
    pumps: '/api/flow/pumps',
    patterns: '/api/flow/patterns',
  },
  
  // Smart Outlets
  outlets: {
    status: '/api/outlets/status',
    control: '/api/outlets/control',
    power: '/api/outlets/power',
    schedule: '/api/outlets/schedule',
  },
  
  // Settings & Configuration
  settings: {
    system: '/api/settings/system',
    network: '/api/settings/network',
    security: '/api/settings/security',
    backup: '/api/settings/backup',
  },
  
  // Real-time Updates
  websocket: {
    url: isDev ? 'ws://192.168.33.126:8000/ws' : 'ws://192.168.33.126:8000/ws',
    reconnectInterval: 5000,
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${currentConfig.baseURL}${endpoint}`
} 