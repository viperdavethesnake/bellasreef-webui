import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { currentConfig, getApiUrl, API_ENDPOINTS } from '../config/api'
import { TokenStorage } from '../utils/storage'

// Create axios instances for different services
const coreApiClient: AxiosInstance = axios.create({
  baseURL: currentConfig.baseURL,
  timeout: currentConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

const lightingApiClient: AxiosInstance = axios.create({
  baseURL: 'http://192.168.33.126:8001',
  timeout: currentConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

const temperatureApiClient: AxiosInstance = axios.create({
  baseURL: 'http://192.168.33.126:8004',
  timeout: currentConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

const flowApiClient: AxiosInstance = axios.create({
  baseURL: 'http://192.168.33.126:8002',
  timeout: currentConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

const outletsApiClient: AxiosInstance = axios.create({
  baseURL: 'http://192.168.33.126:8005',
  timeout: currentConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

const halApiClient: AxiosInstance = axios.create({
  baseURL: 'http://192.168.33.126:8003',
  timeout: currentConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
const addLoggingInterceptor = (client: AxiosInstance, serviceName: string) => {
  client.interceptors.request.use(
    (config) => {
      console.log(`${serviceName} API Request: ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    (error) => {
      console.error(`${serviceName} API Request Error:`, error)
      return Promise.reject(error)
    }
  )

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error) => {
      console.error(`${serviceName} API Response Error:`, error.response?.data || error.message)
      return Promise.reject(error)
    }
  )
}

// Add logging interceptors to all clients
addLoggingInterceptor(coreApiClient, 'Core')
addLoggingInterceptor(lightingApiClient, 'Lighting')
addLoggingInterceptor(temperatureApiClient, 'Temperature')
addLoggingInterceptor(flowApiClient, 'Flow')
addLoggingInterceptor(outletsApiClient, 'Outlets')
addLoggingInterceptor(halApiClient, 'HAL')

// Add auth token to requests
const addAuthInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config) => {
      const token = TokenStorage.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )
}

// Add token refresh response interceptor
const addTokenRefreshInterceptor = (client: AxiosInstance, serviceName: string) => {
  client.interceptors.response.use(
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
          
          // Call refresh endpoint on core service
          const response = await axios.post('http://192.168.33.126:8000/api/auth/refresh', {}, {
            headers: { 'Authorization': `Bearer ${refreshToken}` }
          })
          
          const { access_token, refresh_token } = response.data
          
          // Update stored tokens
          TokenStorage.setToken(access_token)
          TokenStorage.setRefreshToken(refresh_token)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return client(originalRequest)
        } catch (refreshError) {
          console.error(`${serviceName} token refresh failed:`, refreshError)
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

// Add auth interceptors to all clients
addAuthInterceptor(coreApiClient)
addAuthInterceptor(lightingApiClient)
addAuthInterceptor(temperatureApiClient)
addAuthInterceptor(flowApiClient)
addAuthInterceptor(outletsApiClient)
addAuthInterceptor(halApiClient)

// Add token refresh interceptors to all clients
addTokenRefreshInterceptor(coreApiClient, 'Core')
addTokenRefreshInterceptor(lightingApiClient, 'Lighting')
addTokenRefreshInterceptor(temperatureApiClient, 'Temperature')
addTokenRefreshInterceptor(flowApiClient, 'Flow')
addTokenRefreshInterceptor(outletsApiClient, 'Outlets')
addTokenRefreshInterceptor(halApiClient, 'HAL')

// API Service Class
export class ApiService {
  // System Status
  static async getSystemStatus() {
    return coreApiClient.get('/health')
  }

  static async getSystemHealth() {
    return coreApiClient.get('/health')
  }

  static async getSystemInfo() {
    return coreApiClient.get('/api/host-info')
  }

  // Lighting Control
  static async getLightingStatus() {
    try {
      return await lightingApiClient.get('/lighting/acclimation-periods/system/info')
    } catch (error) {
      console.warn('Lighting status endpoint not available, returning mock data')
      return {
        data: {
          status: 'day',
          mode: 'auto',
          intensity: 75,
          schedule: 'active',
          lastUpdate: new Date().toISOString()
        }
      }
    }
  }

  static async getLightingModes() {
    try {
      return await lightingApiClient.get('/lighting/acclimation-periods/')
    } catch (error) {
      console.warn('Lighting modes endpoint not available, returning mock data')
      return {
        data: [
          { id: 1, name: 'Day', start: '08:00', end: '18:00', intensity: 100 },
          { id: 2, name: 'Dawn', start: '06:00', end: '08:00', intensity: 50 },
          { id: 3, name: 'Dusk', start: '18:00', end: '20:00', intensity: 50 },
          { id: 4, name: 'Night', start: '20:00', end: '06:00', intensity: 0 }
        ]
      }
    }
  }

  static async getLightingSchedule() {
    try {
      return await lightingApiClient.get('/lighting/acclimation-periods/')
    } catch (error) {
      console.warn('Lighting schedule endpoint not available, returning mock data')
      return {
        data: {
          schedule: [
            { id: 1, name: 'Day', start: '08:00', end: '18:00', intensity: 100 },
            { id: 2, name: 'Dawn', start: '06:00', end: '08:00', intensity: 50 },
            { id: 3, name: 'Dusk', start: '18:00', end: '20:00', intensity: 50 },
            { id: 4, name: 'Night', start: '20:00', end: '06:00', intensity: 0 }
          ]
        }
      }
    }
  }

  // Lighting Behaviors
  static async getLightingBehaviors() {
    try {
      return await lightingApiClient.get('/lighting/behaviors/')
    } catch (error) {
      console.warn('Lighting behaviors endpoint not available, returning mock data')
      return {
        data: [
          {
            id: 1,
            name: 'Coral Growth',
            description: 'Optimized for coral growth',
            channels: [1, 2, 3],
            schedule: 'auto',
            enabled: true
          },
          {
            id: 2,
            name: 'Fish Viewing',
            description: 'Bright lighting for fish viewing',
            channels: [1, 2],
            schedule: 'manual',
            enabled: false
          }
        ]
      }
    }
  }

  static async getLightingBehavior(id: number) {
    try {
      return await lightingApiClient.get(`/lighting/behaviors/${id}`)
    } catch (error) {
      console.warn('Get lighting behavior endpoint not available')
      return { data: null }
    }
  }

  static async createLightingBehavior(data: any) {
    try {
      return await lightingApiClient.post('/lighting/behaviors/', data)
    } catch (error) {
      console.warn('Create lighting behavior endpoint not available')
      return { data: { success: true } }
    }
  }

  static async updateLightingBehavior(id: number, data: any) {
    try {
      return await lightingApiClient.put(`/lighting/behaviors/${id}`, data)
    } catch (error) {
      console.warn('Update lighting behavior endpoint not available')
      return { data: { success: true } }
    }
  }

  static async deleteLightingBehavior(id: number) {
    try {
      return await lightingApiClient.delete(`/lighting/behaviors/${id}`)
    } catch (error) {
      console.warn('Delete lighting behavior endpoint not available')
      return { data: { success: true } }
    }
  }

  // Lighting Location Presets
  static async getLocationPresets() {
    try {
      return await lightingApiClient.get('/lighting/behaviors/location-presets')
    } catch (error) {
      console.warn('Location presets endpoint not available, returning mock data')
      return {
        data: [
          {
            id: 1,
            name: 'Coral Reef',
            latitude: 25.7617,
            longitude: -80.1918,
            timezone: 'America/New_York',
            description: 'Miami, Florida - Coral Reef'
          },
          {
            id: 2,
            name: 'Great Barrier Reef',
            latitude: -16.2902,
            longitude: 145.4733,
            timezone: 'Australia/Brisbane',
            description: 'Cairns, Australia - Great Barrier Reef'
          }
        ]
      }
    }
  }

  // Lighting Assignments
  static async getLightingAssignments() {
    try {
      return await lightingApiClient.get('/lighting/assignments/')
    } catch (error) {
      console.warn('Lighting assignments endpoint not available')
      return { data: [] }
    }
  }

  static async getBehaviorAssignments(behaviorId: number) {
    try {
      return await lightingApiClient.get(`/lighting/assignments/behavior/${behaviorId}`)
    } catch (error) {
      console.warn('Behavior assignments endpoint not available')
      return { data: [] }
    }
  }

  static async getChannelAssignments(channelId: number) {
    try {
      return await lightingApiClient.get(`/lighting/assignments/channel/${channelId}`)
    } catch (error) {
      console.warn('Channel assignments endpoint not available')
      return { data: [] }
    }
  }

  // Lighting Preview
  static async getLightingPreview(data: any) {
    try {
      return await lightingApiClient.post('/lighting/behaviors/preview', data)
    } catch (error) {
      console.warn('Lighting preview endpoint not available')
      return { data: { preview: 'unavailable' } }
    }
  }

  // Additional Lighting endpoints
  static async setLightingMode(mode: string) {
    try {
      return await lightingApiClient.post('/lighting/mode', { mode })
    } catch (error) {
      console.warn('Set lighting mode endpoint not available')
      return { data: { success: true } }
    }
  }

  static async setLightingIntensity(intensity: number) {
    try {
      return await lightingApiClient.post('/lighting/intensity', { intensity })
    } catch (error) {
      console.warn('Set lighting intensity endpoint not available')
      return { data: { success: true } }
    }
  }

  static async getLightingChannels() {
    try {
      return await lightingApiClient.get('/lighting/channels/')
    } catch (error) {
      console.warn('Lighting channels endpoint not available, returning mock data')
      return {
        data: [
          { id: 1, name: 'Blue', type: 'led', enabled: true, intensity: 75 },
          { id: 2, name: 'White', type: 'led', enabled: true, intensity: 60 },
          { id: 3, name: 'UV', type: 'led', enabled: true, intensity: 30 }
        ]
      }
    }
  }

  // HAL Management
  static async getHALStatus() {
    return halApiClient.get('/health')
  }

  static async getHALControllers() {
    return halApiClient.get('/api/hal/controllers')
  }

  static async discoverHALControllers() {
    return halApiClient.get('/api/hal/controllers/discover')
  }

  static async registerHALController(data: { type: string; identifier: string; name: string }) {
    return halApiClient.post('/api/hal/controllers/register', data)
  }

  static async getHALChannels(controllerId: string) {
    return halApiClient.get(`/api/hal/controllers/${controllerId}/channels`)
  }

  static async registerHALChannel(controllerId: string, data: { channel_number: number; name: string; device_role: string }) {
    return halApiClient.post(`/api/hal/controllers/${controllerId}/channels`, data)
  }

  static async getHALChannel(channelId: string) {
    return halApiClient.get(`/api/hal/channels/${channelId}`)
  }

  static async controlHALChannel(channelId: string, intensity: number) {
    return halApiClient.post(`/api/hal/channels/${channelId}/control`, { intensity })
  }

  // Additional HAL endpoints for better control
  static async getHALController(controllerId: string) {
    return halApiClient.get(`/api/hal/controllers/${controllerId}`)
  }

  static async updateHALController(controllerId: string, data: any) {
    return halApiClient.put(`/api/hal/controllers/${controllerId}`, data)
  }

  static async deleteHALController(controllerId: string) {
    return halApiClient.delete(`/api/hal/controllers/${controllerId}`)
  }

  static async updateHALChannel(channelId: string, data: any) {
    return halApiClient.put(`/api/hal/channels/${channelId}`, data)
  }

  static async deleteHALChannel(channelId: string) {
    return halApiClient.delete(`/api/hal/channels/${channelId}`)
  }

  static async getHALSystemInfo() {
    return halApiClient.get('/api/hal/system/info')
  }

  static async getHALPerformance() {
    return halApiClient.get('/api/hal/system/performance')
  }

  // Temperature Management
  static async getTemperatureServiceHealth() {
    return temperatureApiClient.get('/health')
  }

  static async getTemperatureSubsystemStatus() {
    return temperatureApiClient.get('/api/probes/system/status')
  }

  static async getCurrentTemperature() {
    return temperatureApiClient.get('/api/probes/')
  }

  static async discoverProbes() {
    return temperatureApiClient.get('/api/probes/discover')
  }

  static async getProbeReading(hardwareId: string, unit: 'C' | 'F' = 'F') {
    return temperatureApiClient.get(`/api/probes/hardware/${hardwareId}/reading?unit=${unit}&resolution=12`)
  }

  static async getRegisteredProbeReading(deviceId: number, unit: 'C' | 'F' = 'F') {
    return temperatureApiClient.get(`/api/probes/${deviceId}/reading?unit=${unit}&resolution=12`)
  }

  static async updateProbe(deviceId: number, updateData: any) {
    return temperatureApiClient.patch(`/api/probes/${deviceId}`, updateData)
  }

  static async deleteProbe(deviceId: number) {
    return temperatureApiClient.delete(`/api/probes/${deviceId}`)
  }

  static async registerProbe(data: { name: string; device_type: string; address: string; role: string; resolution?: number; unit?: string; min_value?: number; max_value?: number; poll_enabled?: boolean; poll_interval?: number; active?: boolean }) {
    return temperatureApiClient.post('/api/probes/', data)
  }

  static async getTemperatureHistory() {
    return temperatureApiClient.get('/api/probes/')
  }

  // System Status (from Core Service)
  static async getSystemUsage() {
    return coreApiClient.get('/api/system-usage')
  }

  // Flow Control
  static async getFlowStatus() {
    return flowApiClient.get('/health')
  }

  static async getPumpStatus() {
    return flowApiClient.get('/')
  }

  // Smart Outlets
  static async getOutletsStatus() {
    try {
      return await outletsApiClient.get('/api/smartoutlets/outlets/')
    } catch (error) {
      console.warn('Smart outlets status endpoint not available, returning mock data')
      return {
        data: {
          outlets: [
            {
              id: 1,
              name: 'Main Pump',
              type: 'kasa',
              status: 'online',
              power: 'on',
              voltage: 120.5,
              current: 1.2,
              power_consumption: 144.6,
              last_reading: new Date().toISOString()
            },
            {
              id: 2,
              name: 'Heater',
              type: 'kasa',
              status: 'online',
              power: 'off',
              voltage: 120.3,
              current: 0.0,
              power_consumption: 0.0,
              last_reading: new Date().toISOString()
            }
          ]
        }
      }
    }
  }

  static async setOutletControl(outletId: number, state: boolean) {
    try {
      return await outletsApiClient.post(`/api/smartoutlets/outlets/${outletId}/state`, {
        state: state
      })
    } catch (error) {
      console.warn('Set outlet control endpoint not available')
      return { data: { success: true } }
    }
  }

  static async getPowerConsumption() {
    try {
      return await outletsApiClient.get('/api/smartoutlets/outlets/')
    } catch (error) {
      console.warn('Power consumption endpoint not available')
      return { data: { total_consumption: 144.6 } }
    }
  }

  // Additional Smart Outlets endpoints
  static async discoverOutlets() {
    try {
      return await outletsApiClient.get('/api/smartoutlets/discover')
    } catch (error) {
      console.warn('Discover outlets endpoint not available')
      return { data: { outlets: [] } }
    }
  }

  static async registerOutlet(data: { name: string; type: string; identifier: string }) {
    try {
      return await outletsApiClient.post('/api/smartoutlets/outlets/register', data)
    } catch (error) {
      console.warn('Register outlet endpoint not available')
      return { data: { success: true } }
    }
  }

  static async getOutletSchedule(outletId: number) {
    try {
      return await outletsApiClient.get(`/api/smartoutlets/outlets/${outletId}/schedule`)
    } catch (error) {
      console.warn('Outlet schedule endpoint not available')
      return { data: { schedule: [] } }
    }
  }

  static async setOutletSchedule(outletId: number, schedule: any) {
    try {
      return await outletsApiClient.post(`/api/smartoutlets/outlets/${outletId}/schedule`, schedule)
    } catch (error) {
      console.warn('Set outlet schedule endpoint not available')
      return { data: { success: true } }
    }
  }

  static async getOutletHistory(outletId: number, days: number = 7) {
    try {
      return await outletsApiClient.get(`/api/smartoutlets/outlets/${outletId}/history?days=${days}`)
    } catch (error) {
      console.warn('Outlet history endpoint not available')
      return { data: { history: [] } }
    }
  }

  // Settings
  static async getSystemSettings() {
    return coreApiClient.get('/api/host-info')
  }

  static async getNetworkSettings() {
    return coreApiClient.get('/api/host-info')
  }

  static async updateNetworkSettings(data: any) {
    return coreApiClient.post('/api/host-info', data)
  }

  // Lighting Settings - Store in lighting service
  static async getLightingSettings() {
    return lightingApiClient.get('/lighting/settings')
  }

  static async saveLightingSettings(settings: any) {
    return lightingApiClient.post('/lighting/settings', settings)
  }

  static async updateLightingSettings(settings: any) {
    return lightingApiClient.put('/lighting/settings', settings)
  }

  // Daily Operations Management
  static async getDailyOperations() {
    try {
      return await coreApiClient.get('/api/daily-operations')
    } catch (error) {
      console.warn('Daily operations endpoint not available, returning mock data')
      // Return mock data if endpoint doesn't exist
      return {
        data: [
          {
            id: 'feeding',
            title: 'Feeding Schedule',
            type: 'feeding',
            status: 'on-time',
            nextDue: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            lastCompleted: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'water-testing',
            title: 'Water Testing',
            type: 'water-testing',
            status: 'due',
            nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    }
  }

  static async updateDailyOperation(operationId: string, data: any) {
    try {
      return await coreApiClient.put(`/api/daily-operations/${operationId}`, data)
    } catch (error) {
      console.warn('Update daily operation endpoint not available')
      return { data: { success: true } }
    }
  }

  static async completeDailyOperation(operationId: string) {
    try {
      return await coreApiClient.post(`/api/daily-operations/${operationId}/complete`)
    } catch (error) {
      console.warn('Complete daily operation endpoint not available')
      return { data: { success: true } }
    }
  }

  static async getDailyOperationHistory(operationId: string) {
    try {
      return await coreApiClient.get(`/api/daily-operations/${operationId}/history`)
    } catch (error) {
      console.warn('Daily operation history endpoint not available')
      return { data: [] }
    }
  }

  // Activity Tracking
  static async getRecentActivity(limit: number = 10) {
    try {
      return await coreApiClient.get(`/api/activity/recent?limit=${limit}`)
    } catch (error) {
      console.warn('Recent activity endpoint not available, returning mock data')
      return {
        data: [
          {
            id: '1',
            type: 'temperature',
            title: 'Temperature Check',
            description: 'System temperature is within normal range',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            severity: 'info'
          },
          {
            id: '2',
            type: 'lighting',
            title: 'Lighting Schedule',
            description: 'Day lighting cycle started',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            severity: 'success'
          }
        ]
      }
    }
  }

  static async getActivityHistory(startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      return await coreApiClient.get(`/api/activity/history?${params.toString()}`)
    } catch (error) {
      console.warn('Activity history endpoint not available')
      return { data: [] }
    }
  }

  static async logActivity(activity: {
    type: string
    title: string
    description: string
    severity?: 'info' | 'warning' | 'error' | 'success'
    metadata?: any
  }) {
    try {
      return await coreApiClient.post('/api/activity/log', activity)
    } catch (error) {
      console.warn('Log activity endpoint not available, logging to console')
      console.log('Activity Log:', activity)
      return { data: { success: true } }
    }
  }

  // System Events
  static async getSystemEvents(limit: number = 20) {
    try {
      return await coreApiClient.get(`/api/system/events?limit=${limit}`)
    } catch (error) {
      console.warn('System events endpoint not available')
      return { data: [] }
    }
  }

  static async getSystemLogs(level?: string, service?: string, limit: number = 100) {
    try {
      const params = new URLSearchParams()
      if (level) params.append('level', level)
      if (service) params.append('service', service)
      params.append('limit', limit.toString())
      return await coreApiClient.get(`/api/system/logs?${params.toString()}`)
    } catch (error) {
      console.warn('System logs endpoint not available')
      return { data: [] }
    }
  }

  // Dashboard Summary
  static async getDashboardSummary() {
    try {
      return await coreApiClient.get('/api/dashboard/summary')
    } catch (error) {
      console.warn('Dashboard summary endpoint not available, returning mock data')
      return {
        data: {
          systemStatus: 'healthy',
          temperature: 78.5,
          lighting: 'day',
          flow: 'normal',
          outlets: 'all_online',
          alerts: 0,
          lastUpdate: new Date().toISOString()
        }
      }
    }
  }

  static async getDashboardMetrics() {
    try {
      return await coreApiClient.get('/api/dashboard/metrics')
    } catch (error) {
      console.warn('Dashboard metrics endpoint not available, returning mock data')
      return {
        data: {
          cpuPercent: 15.2,
          memoryPercent: 45.8,
          diskPercent: 23.1,
          networkUsage: 2.4,
          uptime: 86400
        }
      }
    }
  }
}

// WebSocket Service for Real-time Updates
export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect() {
    try {
      this.ws = new WebSocket(API_ENDPOINTS.websocket.url)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.emit('connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.emit('message', data)
          this.emit(data.type, data.payload)
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.emit('disconnected')
        this.scheduleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting WebSocket reconnection...')
      this.connect()
    }, API_ENDPOINTS.websocket.reconnectInterval)
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export default ApiService 