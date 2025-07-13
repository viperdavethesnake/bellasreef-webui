// Lighting Types and Interfaces

export interface LocationPreset {
  id: number
  name: string
  region: string
  country: string
  reef_type: string
  difficulty_level: string
  latitude: number
  longitude: number
  timezone: string
  tags: string[]
}

export interface CustomLocation {
  name: string
  latitude: number
  longitude: number
  timezone?: string
}

export interface WeatherData {
  temperature: number
  description: string
  icon: string
  cloudCover: number
  humidity: number
  windSpeed: number
  timestamp: string
}

export interface LightingBehavior {
  id: number
  name: string
  behavior_type: string
  behavior_config: Record<string, any>
  weather_influence_enabled: boolean
  acclimation_days: number | null
  enabled: boolean
  created_at: string
  updated_at: string | null
}

export interface LightingSettings {
  locationType: 'none' | 'custom' | 'preset'
  customLocation?: CustomLocation
  selectedPreset?: LocationPreset
  userTimezone?: string
  openWeatherAPIKey?: string
  weatherEnabled: boolean
  timezoneMappingEnabled: boolean
}

export interface WeatherConnectionStatus {
  status: 'connected' | 'disconnected' | 'testing' | 'error'
  message?: string
  lastChecked?: string
}

export interface TestResult {
  success: boolean
  message: string
  timestamp: string
}

export interface TimezoneMapping {
  sourceTimezone: string
  targetTimezone: string
  offset: number
  description: string
}

export interface WeatherSettings {
  apiKey: string
  enabled: boolean
  updateInterval: number
  cacheExpiry: number
}

export interface LocationSettings {
  type: 'none' | 'custom' | 'preset'
  custom?: CustomLocation
  preset?: LocationPreset
  timezoneMapping?: TimezoneMapping
}

// Daily Operations Types
export interface DailyOperation {
  id: string
  title: string
  description: string
  type: 'feeding' | 'water-testing' | 'maintenance' | 'water-change' | 'custom'
  status: 'on-time' | 'due' | 'overdue' | 'completed'
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    time?: string
    days?: number[]
    interval?: number
  }
  nextDue: string
  lastCompleted?: string
  priority: 'low' | 'medium' | 'high'
  enabled: boolean
  metadata?: Record<string, any>
}

export interface DailyOperationHistory {
  id: string
  operationId: string
  completedAt: string
  completedBy?: string
  notes?: string
  metadata?: Record<string, any>
}

// Activity Tracking Types
export interface ActivityLog {
  id: string
  type: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'error' | 'success'
  timestamp: string
  userId?: string
  metadata?: Record<string, any>
}

export interface SystemEvent {
  id: string
  type: 'system' | 'user' | 'alert' | 'maintenance'
  title: string
  description: string
  severity: 'info' | 'warning' | 'error' | 'success'
  timestamp: string
  service?: string
  metadata?: Record<string, any>
}

// Dashboard Types
export interface DashboardSummary {
  systemStatus: string
  activeAlerts: number
  pendingOperations: number
  completedToday: number
  lastUpdate: string
}

export interface DashboardMetrics {
  temperature: {
    current: number
    average: number
    trend: 'stable' | 'rising' | 'falling'
  }
  power: {
    current: number
    total: number
    efficiency: number
  }
  system: {
    cpu: number
    memory: number
    disk: number
    uptime: string
  }
} 