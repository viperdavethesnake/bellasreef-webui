# API Reference for Web UI

This document provides a comprehensive reference for all API endpoints used by the Bella's Reef Web UI, including authentication, data models, and integration patterns.

## Table of Contents

1. [Authentication](#authentication)
2. [Core Service API](#core-service-api)
3. [Lighting Service API](#lighting-service-api)
4. [HAL Service API](#hal-service-api)
5. [Temperature Service API](#temperature-service-api)
6. [Smart Outlets Service API](#smart-outlets-service-api)
7. [Error Handling](#error-handling)
8. [WebSocket Integration](#websocket-integration)
9. [Rate Limiting](#rate-limiting)

## Authentication

### Login Endpoint

**POST** `/api/auth/login`

Authenticates a user and returns access tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 3600,
  "user": {
    "id": "string",
    "username": "string",
    "role": "admin|user"
  }
}
```

### Refresh Token

**POST** `/api/auth/refresh`

Refreshes an expired access token.

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "expires_in": 3600
}
```

### Logout

**POST** `/api/auth/logout`

Invalidates the current session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Core Service API

Base URL: `http://192.168.33.126:8000`

### System Status

**GET** `/api/core/status`

Returns overall system status and health information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "operational|warning|error",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "core": "operational",
    "lighting": "operational",
    "hal": "operational",
    "temperature": "operational",
    "smart_outlets": "operational"
  },
  "alerts": [
    {
      "id": "string",
      "level": "info|warning|error",
      "message": "string",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### System Configuration

**GET** `/api/core/config`

Retrieves system configuration settings.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "system_name": "Bella's Reef",
  "timezone": "America/New_York",
  "auto_mode": true,
  "maintenance_mode": false,
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  }
}
```

**PUT** `/api/core/config`

Updates system configuration.

**Request Body:**
```json
{
  "system_name": "string",
  "timezone": "string",
  "auto_mode": boolean,
  "maintenance_mode": boolean,
  "notifications": {
    "email": boolean,
    "push": boolean,
    "sms": boolean
  }
}
```

### System Logs

**GET** `/api/core/logs`

Retrieves system logs with filtering options.

**Query Parameters:**
- `level`: info|warning|error
- `service`: core|lighting|hal|temperature|smart_outlets
- `start_date`: ISO 8601 date
- `end_date`: ISO 8601 date
- `limit`: number (default: 100)

**Response:**
```json
{
  "logs": [
    {
      "id": "string",
      "timestamp": "2024-01-15T10:30:00Z",
      "level": "info|warning|error",
      "service": "string",
      "message": "string",
      "details": {}
    }
  ],
  "total": 150,
  "has_more": true
}
```

## Lighting Service API

Base URL: `http://192.168.33.126:8001`

### Lighting Status

**GET** `/api/lighting/status`

Returns current lighting system status.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "operational|warning|error",
  "mode": "auto|manual|schedule",
  "current_intensity": 75,
  "target_intensity": 80,
  "sunrise_time": "07:00",
  "sunset_time": "19:00",
  "channels": [
    {
      "id": "string",
      "name": "string",
      "intensity": 75,
      "enabled": true,
      "color": "#FF6B35"
    }
  ]
}
```

### Lighting Control

**POST** `/api/lighting/control`

Controls lighting system parameters.

**Request Body:**
```json
{
  "mode": "auto|manual|schedule",
  "intensity": 80,
  "sunrise_time": "07:00",
  "sunset_time": "19:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lighting settings updated"
}
```

### Channel Control

**PUT** `/api/lighting/channels/{channel_id}`

Updates individual channel settings.

**Request Body:**
```json
{
  "intensity": 75,
  "enabled": true,
  "color": "#FF6B35"
}
```

### Lighting Schedule

**GET** `/api/lighting/schedule`

Retrieves lighting schedule configuration.

**Response:**
```json
{
  "schedules": [
    {
      "id": "string",
      "name": "string",
      "enabled": true,
      "days": [1, 2, 3, 4, 5, 6, 7],
      "sunrise_time": "07:00",
      "sunset_time": "19:00",
      "intensity_curve": [
        {"time": "07:00", "intensity": 0},
        {"time": "12:00", "intensity": 100},
        {"time": "19:00", "intensity": 0}
      ]
    }
  ]
}
```

**POST** `/api/lighting/schedule`

Creates a new lighting schedule.

**Request Body:**
```json
{
  "name": "string",
  "enabled": boolean,
  "days": [1, 2, 3, 4, 5, 6, 7],
  "sunrise_time": "07:00",
  "sunset_time": "19:00",
  "intensity_curve": [
    {"time": "07:00", "intensity": 0},
    {"time": "12:00", "intensity": 100},
    {"time": "19:00", "intensity": 0}
  ]
}
```

## HAL Service API

Base URL: `http://192.168.33.126:8002`

### HAL Status

**GET** `/api/hal/status`

Returns HAL system status and channel information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "operational|warning|error",
  "channels": [
    {
      "id": "string",
      "name": "string",
      "type": "pwm|digital|analog",
      "enabled": true,
      "value": 75,
      "min_value": 0,
      "max_value": 100,
      "unit": "percentage|voltage|current"
    }
  ]
}
```

### Channel Control

**PUT** `/api/hal/channels/{channel_id}`

Updates HAL channel settings.

**Request Body:**
```json
{
  "enabled": true,
  "value": 75,
  "name": "string"
}
```

### PWM Configuration

**GET** `/api/hal/pwm/config`

Retrieves PWM configuration settings.

**Response:**
```json
{
  "frequency": 1000,
  "resolution": 8,
  "channels": [
    {
      "id": "string",
      "name": "string",
      "duty_cycle": 75,
      "frequency": 1000,
      "enabled": true
    }
  ]
}
```

**PUT** `/api/hal/pwm/config`

Updates PWM configuration.

**Request Body:**
```json
{
  "frequency": 1000,
  "resolution": 8,
  "channels": [
    {
      "id": "string",
      "duty_cycle": 75,
      "frequency": 1000,
      "enabled": true
    }
  ]
}
```

## Temperature Service API

Base URL: `http://192.168.33.126:8003`

### Temperature Status

**GET** `/api/temperature/status`

Returns current temperature readings from all probes.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "operational|warning|error",
  "probes": [
    {
      "id": "temp_001",
      "name": "Main Tank",
      "temperature": 25.5,
      "humidity": 65.2,
      "unit": "celsius",
      "last_reading": "2024-01-15T10:30:00Z",
      "status": "active|inactive|error"
    }
  ],
  "averages": {
    "temperature": 25.3,
    "humidity": 64.8
  }
}
```

### Temperature History

**GET** `/api/temperature/history`

Retrieves historical temperature data.

**Query Parameters:**
- `probe_id`: string
- `start_date`: ISO 8601 date
- `end_date`: ISO 8601 date
- `interval`: 1m|5m|15m|1h|1d

**Response:**
```json
{
  "probe_id": "temp_001",
  "readings": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "temperature": 25.5,
      "humidity": 65.2
    }
  ],
  "statistics": {
    "min_temperature": 24.8,
    "max_temperature": 26.1,
    "avg_temperature": 25.3,
    "min_humidity": 63.5,
    "max_humidity": 66.8,
    "avg_humidity": 64.8
  }
}
```

### Temperature Alerts

**GET** `/api/temperature/alerts`

Retrieves temperature alert configuration.

**Response:**
```json
{
  "alerts": [
    {
      "id": "string",
      "probe_id": "temp_001",
      "type": "high_temperature|low_temperature|high_humidity|low_humidity",
      "threshold": 28.0,
      "enabled": true,
      "notification": true
    }
  ]
}
```

**POST** `/api/temperature/alerts`

Creates a new temperature alert.

**Request Body:**
```json
{
  "probe_id": "temp_001",
  "type": "high_temperature",
  "threshold": 28.0,
  "enabled": true,
  "notification": true
}
```

## Smart Outlets Service API

Base URL: `http://192.168.33.126:8004`

### Outlets Status

**GET** `/api/outlets/status`

Returns current status of all smart outlets.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "operational|warning|error",
  "outlets": [
    {
      "id": "outlet_001",
      "name": "Main Pump",
      "power": "on|off",
      "voltage": 120.5,
      "current": 2.3,
      "power_consumption": 276.15,
      "last_reading": "2024-01-15T10:30:00Z",
      "status": "active|inactive|error"
    }
  ],
  "total_power": 1250.75
}
```

### Outlet Control

**PUT** `/api/outlets/{outlet_id}/control`

Controls individual outlet power state.

**Request Body:**
```json
{
  "power": "on|off",
  "name": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Outlet power state updated"
}
```

### Outlet Groups

**GET** `/api/outlets/groups`

Retrieves outlet group configurations.

**Response:**
```json
{
  "groups": [
    {
      "id": "string",
      "name": "string",
      "outlets": ["outlet_001", "outlet_002"],
      "power": "on|off",
      "schedule": {
        "enabled": true,
        "on_time": "08:00",
        "off_time": "20:00"
      }
    }
  ]
}
```

**POST** `/api/outlets/groups`

Creates a new outlet group.

**Request Body:**
```json
{
  "name": "string",
  "outlets": ["outlet_001", "outlet_002"],
  "schedule": {
    "enabled": true,
    "on_time": "08:00",
    "off_time": "20:00"
  }
}
```

### Power Monitoring

**GET** `/api/outlets/power/history`

Retrieves power consumption history.

**Query Parameters:**
- `outlet_id`: string
- `start_date`: ISO 8601 date
- `end_date`: ISO 8601 date
- `interval`: 1m|5m|15m|1h|1d

**Response:**
```json
{
  "outlet_id": "outlet_001",
  "readings": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "voltage": 120.5,
      "current": 2.3,
      "power_consumption": 276.15
    }
  ],
  "statistics": {
    "total_consumption": 1250.75,
    "avg_power": 250.15,
    "peak_power": 350.25
  }
}
```

## Error Handling

### Standard Error Response

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Authentication required
- `INVALID_TOKEN`: Invalid or expired token
- `PERMISSION_DENIED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Invalid request data
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable
- `INTERNAL_ERROR`: Internal server error

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## WebSocket Integration

### Real-time Updates

Connect to WebSocket endpoint for real-time data:

**WebSocket URL:** `ws://192.168.33.126:8000/ws`

**Authentication:**
```json
{
  "type": "auth",
  "token": "<access_token>"
}
```

**Event Types:**

1. **System Status Updates**
```json
{
  "type": "system_status",
  "data": {
    "status": "operational|warning|error",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

2. **Temperature Updates**
```json
{
  "type": "temperature_update",
  "data": {
    "probe_id": "temp_001",
    "temperature": 25.5,
    "humidity": 65.2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

3. **Lighting Updates**
```json
{
  "type": "lighting_update",
  "data": {
    "mode": "auto|manual|schedule",
    "intensity": 75,
    "channels": [...]
  }
}
```

4. **Outlet Updates**
```json
{
  "type": "outlet_update",
  "data": {
    "outlet_id": "outlet_001",
    "power": "on|off",
    "power_consumption": 276.15
  }
}
```

5. **Alert Notifications**
```json
{
  "type": "alert",
  "data": {
    "id": "string",
    "level": "info|warning|error",
    "message": "string",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Rate Limiting

### Rate Limit Headers

API responses include rate limiting information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642233600
```

### Rate Limits

- **Authentication endpoints**: 10 requests per minute
- **Read operations**: 1000 requests per hour
- **Write operations**: 100 requests per hour
- **WebSocket connections**: 10 concurrent connections per user

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "retry_after": 60
  }
}
```

## JavaScript Integration Examples

### Authentication Helper

```javascript
class BellaReefAPI {
  constructor(baseURL = 'http://192.168.33.126:8000') {
    this.baseURL = baseURL;
    this.accessToken = null;
    this.refreshToken = null;
  }

  async login(username, password) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    
    return data;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    
    return data;
  }

  async makeRequest(endpoint, options = {}) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      await this.refreshAccessToken();
      return this.makeRequest(endpoint, options);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Request failed');
    }

    return response.json();
  }

  // Core API methods
  async getSystemStatus() {
    return this.makeRequest('/api/core/status');
  }

  async getSystemConfig() {
    return this.makeRequest('/api/core/config');
  }

  // Lighting API methods
  async getLightingStatus() {
    return this.makeRequest('/api/lighting/status');
  }

  async updateLightingControl(controlData) {
    return this.makeRequest('/api/lighting/control', {
      method: 'POST',
      body: JSON.stringify(controlData),
    });
  }

  // Temperature API methods
  async getTemperatureStatus() {
    return this.makeRequest('/api/temperature/status');
  }

  async getTemperatureHistory(probeId, startDate, endDate) {
    const params = new URLSearchParams({
      probe_id: probeId,
      start_date: startDate,
      end_date: endDate,
    });
    return this.makeRequest(`/api/temperature/history?${params}`);
  }

  // Outlets API methods
  async getOutletsStatus() {
    return this.makeRequest('/api/outlets/status');
  }

  async controlOutlet(outletId, power) {
    return this.makeRequest(`/api/outlets/${outletId}/control`, {
      method: 'PUT',
      body: JSON.stringify({ power }),
    });
  }
}
```

### WebSocket Integration

```javascript
class BellaReefWebSocket {
  constructor(baseURL = 'ws://192.168.33.126:8000', accessToken) {
    this.baseURL = baseURL;
    this.accessToken = accessToken;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.baseURL}/ws`);

      this.ws.onopen = () => {
        // Authenticate the WebSocket connection
        this.ws.send(JSON.stringify({
          type: 'auth',
          token: this.accessToken,
        }));
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          this.reconnectAttempts = 0;
          resolve();
        } else if (data.type === 'auth_error') {
          reject(new Error('WebSocket authentication failed'));
        } else {
          this.handleMessage(data);
        }
      };

      this.ws.onerror = (error) => {
        reject(error);
      };

      this.ws.onclose = () => {
        this.handleReconnect();
      };
    });
  }

  handleMessage(data) {
    const listeners = this.listeners.get(data.type) || [];
    listeners.forEach(callback => callback(data.data));
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(console.error);
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
```

### Usage Example

```javascript
// Initialize API client
const api = new BellaReefAPI();

// Login
await api.login('admin', 'password');

// Get system status
const status = await api.getSystemStatus();
console.log('System status:', status);

// Initialize WebSocket for real-time updates
const ws = new BellaReefWebSocket('ws://192.168.33.126:8000', api.accessToken);

// Listen for temperature updates
ws.on('temperature_update', (data) => {
  console.log('Temperature update:', data);
});

// Listen for system alerts
ws.on('alert', (data) => {
  console.log('Alert:', data);
});

// Connect to WebSocket
await ws.connect();
```

This API reference provides comprehensive documentation for web UI developers to integrate with the Bella's Reef system APIs, including authentication, real-time updates, and error handling patterns. 