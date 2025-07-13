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

// Add auth interceptors to all clients
addAuthInterceptor(coreApiClient)
addAuthInterceptor(lightingApiClient)
addAuthInterceptor(temperatureApiClient)
addAuthInterceptor(flowApiClient)
addAuthInterceptor(outletsApiClient)
addAuthInterceptor(halApiClient)

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
    return lightingApiClient.get('/lighting/acclimation-periods/system/info')
  }

  static async getLightingModes() {
    return lightingApiClient.get('/lighting/acclimation-periods/')
  }

  static async getLightingSchedule() {
    return lightingApiClient.get('/lighting/acclimation-periods/')
  }

  // Lighting Behaviors
  static async getLightingBehaviors() {
    return lightingApiClient.get('/lighting/behaviors/')
  }

  static async getLightingBehavior(id: number) {
    return lightingApiClient.get(`/lighting/behaviors/${id}`)
  }

  static async createLightingBehavior(data: any) {
    return lightingApiClient.post('/lighting/behaviors/', data)
  }

  static async updateLightingBehavior(id: number, data: any) {
    return lightingApiClient.put(`/lighting/behaviors/${id}`, data)
  }

  static async deleteLightingBehavior(id: number) {
    return lightingApiClient.delete(`/lighting/behaviors/${id}`)
  }

  // Lighting Location Presets
  static async getLocationPresets() {
    return lightingApiClient.get('/lighting/behaviors/location-presets')
  }

  // Lighting Assignments
  static async getLightingAssignments() {
    return lightingApiClient.get('/lighting/assignments/')
  }

  static async getBehaviorAssignments(behaviorId: number) {
    return lightingApiClient.get(`/lighting/assignments/behavior/${behaviorId}`)
  }

  static async getChannelAssignments(channelId: number) {
    return lightingApiClient.get(`/lighting/assignments/channel/${channelId}`)
  }

  // Lighting Preview
  static async getLightingPreview(data: any) {
    return lightingApiClient.post('/lighting/behaviors/preview', data)
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
    return halApiClient.get(`/api/hal/channels/${controllerId}/channels`)
  }

  static async registerHALChannel(controllerId: string, data: { channel_number: number; name: string; device_role: string }) {
    return halApiClient.post(`/api/hal/channels/${controllerId}/channels`, data)
  }

  static async getHALChannel(channelId: string) {
    return halApiClient.get(`/api/hal/channels/channel/${channelId}`)
  }

  static async controlHALChannel(channelId: string, intensity: number) {
    return halApiClient.post(`/api/hal/channels/channel/${channelId}/control`, { intensity })
  }

  // Temperature Management
  static async getCurrentTemperature() {
    return temperatureApiClient.get('/api/probes/')
  }

  static async getTemperatureTarget() {
    return temperatureApiClient.get('/api/probes/system/status')
  }

  static async setTemperatureTarget(target: number) {
    return temperatureApiClient.post('/api/probes/system/status', { target })
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
    return outletsApiClient.get('/api/smartoutlets/outlets/')
  }

  static async setOutletControl(outletId: number, state: boolean) {
    return outletsApiClient.post(`/api/smartoutlets/outlets/${outletId}/state`, {
      state: state
    })
  }

  static async getPowerConsumption() {
    return outletsApiClient.get('/api/smartoutlets/outlets/')
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
    return coreApiClient.get('/api/daily-operations')
  }

  static async updateDailyOperation(operationId: string, data: any) {
    return coreApiClient.put(`/api/daily-operations/${operationId}`, data)
  }

  static async completeDailyOperation(operationId: string) {
    return coreApiClient.post(`/api/daily-operations/${operationId}/complete`)
  }

  static async getDailyOperationHistory(operationId: string) {
    return coreApiClient.get(`/api/daily-operations/${operationId}/history`)
  }

  // Activity Tracking
  static async getRecentActivity(limit: number = 10) {
    return coreApiClient.get(`/api/activity/recent?limit=${limit}`)
  }

  static async getActivityHistory(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return coreApiClient.get(`/api/activity/history?${params.toString()}`)
  }

  static async logActivity(activity: {
    type: string
    title: string
    description: string
    severity?: 'info' | 'warning' | 'error' | 'success'
    metadata?: any
  }) {
    return coreApiClient.post('/api/activity/log', activity)
  }

  // System Events
  static async getSystemEvents(limit: number = 20) {
    return coreApiClient.get(`/api/system/events?limit=${limit}`)
  }

  static async getSystemLogs(level?: string, service?: string, limit: number = 100) {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    if (service) params.append('service', service)
    params.append('limit', limit.toString())
    return coreApiClient.get(`/api/system/logs?${params.toString()}`)
  }

  // Dashboard Summary
  static async getDashboardSummary() {
    return coreApiClient.get('/api/dashboard/summary')
  }

  static async getDashboardMetrics() {
    return coreApiClient.get('/api/dashboard/metrics')
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