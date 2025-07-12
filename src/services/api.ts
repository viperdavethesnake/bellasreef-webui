import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { currentConfig, getApiUrl, API_ENDPOINTS } from '../config/api'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: currentConfig.baseURL,
  timeout: currentConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// API Service Class
export class ApiService {
  // System Status
  static async getSystemStatus() {
    return apiClient.get(API_ENDPOINTS.system.status)
  }

  static async getSystemHealth() {
    return apiClient.get(API_ENDPOINTS.system.health)
  }

  static async getSystemInfo() {
    return apiClient.get(API_ENDPOINTS.system.info)
  }

  // Lighting Control
  static async getLightingStatus() {
    return apiClient.get(API_ENDPOINTS.lighting.status)
  }

  static async setLightingControl(data: any) {
    return apiClient.post(API_ENDPOINTS.lighting.control, data)
  }

  static async getLightingSchedule() {
    return apiClient.get(API_ENDPOINTS.lighting.schedule)
  }

  static async setLightingSchedule(data: any) {
    return apiClient.post(API_ENDPOINTS.lighting.schedule, data)
  }

  // Temperature Management
  static async getCurrentTemperature() {
    return apiClient.get(API_ENDPOINTS.temperature.current)
  }

  static async getTemperatureTarget() {
    return apiClient.get(API_ENDPOINTS.temperature.target)
  }

  static async setTemperatureTarget(target: number) {
    return apiClient.post(API_ENDPOINTS.temperature.target, { target })
  }

  static async getTemperatureHistory() {
    return apiClient.get(API_ENDPOINTS.temperature.history)
  }

  // Flow Control
  static async getFlowStatus() {
    return apiClient.get(API_ENDPOINTS.flow.status)
  }

  static async setFlowControl(data: any) {
    return apiClient.post(API_ENDPOINTS.flow.control, data)
  }

  static async getPumpStatus() {
    return apiClient.get(API_ENDPOINTS.flow.pumps)
  }

  // Smart Outlets
  static async getOutletsStatus() {
    return apiClient.get(API_ENDPOINTS.outlets.status)
  }

  static async setOutletControl(outletId: number, state: boolean) {
    return apiClient.post(API_ENDPOINTS.outlets.control, {
      outlet_id: outletId,
      state: state
    })
  }

  static async getPowerConsumption() {
    return apiClient.get(API_ENDPOINTS.outlets.power)
  }

  // Settings
  static async getSystemSettings() {
    return apiClient.get(API_ENDPOINTS.settings.system)
  }

  static async updateSystemSettings(data: any) {
    return apiClient.post(API_ENDPOINTS.settings.system, data)
  }

  static async getNetworkSettings() {
    return apiClient.get(API_ENDPOINTS.settings.network)
  }

  static async updateNetworkSettings(data: any) {
    return apiClient.post(API_ENDPOINTS.settings.network, data)
  }
}

// WebSocket Service for Real-time Updates
export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
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