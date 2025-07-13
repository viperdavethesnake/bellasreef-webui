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

// API Endpoints - Updated to match actual backend services
export const API_ENDPOINTS = {
  // Authentication (Core Service - Port 8000)
  auth: {
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
  
  // User Management (Core Service - Port 8000)
  users: {
    me: '/api/users/me',
  },
  
  // System Status (Core Service - Port 8000)
  system: {
    status: '/health', // Use health endpoint for system status
    health: '/health',
    info: '/api/host-info',
    usage: '/api/system-usage',
  },
  
  // Lighting Control (Lighting Service - Port 8001)
  lighting: {
    status: 'http://192.168.33.126:8001/lighting/acclimation-periods/system/info',
    control: 'http://192.168.33.126:8001/lighting/acclimation-periods/',
    schedule: 'http://192.168.33.126:8001/lighting/acclimation-periods/',
    modes: 'http://192.168.33.126:8001/lighting/acclimation-periods/',
  },
  
  // HAL Management (HAL Service - Port 8003)
  hal: {
    status: 'http://192.168.33.126:8003/health',
    controllers: 'http://192.168.33.126:8003/api/hal/controllers',
    discover: 'http://192.168.33.126:8003/api/hal/controllers/discover',
    register: 'http://192.168.33.126:8003/api/hal/controllers/register',
    channels: 'http://192.168.33.126:8003/api/hal/channels',
    channelControl: 'http://192.168.33.126:8003/api/hal/channels/channel',
  },
  
  // Temperature Management (Temperature Service - Port 8004)
  temperature: {
    current: 'http://192.168.33.126:8004/api/probes/',
    target: 'http://192.168.33.126:8004/api/probes/system/status',
    history: 'http://192.168.33.126:8004/api/probes/',
    control: 'http://192.168.33.126:8004/api/probes/system/status',
  },
  
  // Flow Control (Flow Service - Port 8002)
  flow: {
    status: 'http://192.168.33.126:8002/health',
    control: 'http://192.168.33.126:8002/',
    pumps: 'http://192.168.33.126:8002/',
    patterns: 'http://192.168.33.126:8002/',
  },
  
  // Smart Outlets (SmartOutlets Service - Port 8005)
  outlets: {
    status: 'http://192.168.33.126:8005/api/smartoutlets/outlets/',
    control: 'http://192.168.33.126:8005/api/smartoutlets/outlets/',
    power: 'http://192.168.33.126:8005/api/smartoutlets/outlets/',
    schedule: 'http://192.168.33.126:8005/api/smartoutlets/outlets/',
  },
  
  // Settings & Configuration (Core Service - Port 8000)
  settings: {
    system: '/api/host-info', // Use host-info for system settings
    network: '/api/host-info',
    security: '/api/host-info',
    backup: '/api/host-info',
  },
  
  // Real-time Updates (Core Service - Port 8000)
  websocket: {
    url: isDev ? 'ws://192.168.33.126:8000/ws' : 'ws://192.168.33.126:8000/ws',
    reconnectInterval: 5000,
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  // If endpoint is already a full URL, return it
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }
  return `${currentConfig.baseURL}${endpoint}`
} 