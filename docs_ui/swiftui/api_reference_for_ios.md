# Bella's Reef API Reference for iOS Development

## Overview

This document provides a comprehensive API reference for iOS developers building the Bella's Reef companion app. All endpoints have been tested and validated against the live system at `192.168.33.126`.

## Base Configuration

### Core Service URL
- **Test Server**: `http://192.168.33.126:8000`
- **Health Check**: `GET /health`
- **Authentication**: JWT Bearer tokens
- **Token Expiry**: 60 minutes (access), 7 days (refresh)

### Available Services
- **Core Service**: Port 8000 (Authentication, User Management, System Info)
- **Lighting Service**: Port 8001 (Lighting Control and Behaviors)
- **HAL Service**: Port 8003 (Hardware Abstraction Layer)
- **Temperature Service**: Port 8004 (Temperature Sensors)
- **SmartOutlets Service**: Port 8005 (Power Management)

## Authentication Endpoints

### 1. Health Check
**Endpoint**: `GET /health`  
**Authentication**: None required  
**Purpose**: Verify server connectivity

**Request**:
```swift
let url = URL(string: "\(baseURL)/health")!
let request = URLRequest(url: url)
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-12T16:59:25.698453",
  "service": "Bella's Reef Core Service",
  "version": "1.0.0"
}
```

**Swift Model**:
```swift
struct HealthResponse: Codable {
    let status: String
    let timestamp: String
    let service: String
    let version: String
}
```

### 2. User Login
**Endpoint**: `POST /api/auth/login`  
**Authentication**: None required  
**Content-Type**: `application/x-www-form-urlencoded`

**Request**:
```swift
let url = URL(string: "\(baseURL)/api/auth/login")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

let body = "username=\(username)&password=\(password)"
request.httpBody = body.data(using: .utf8)
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZWxsYXMiLCJleHAiOjE3NTIzNDMxNjh9.3FXGMQ2vA1GkkClFgYslbpLEqs0HcGgh35H-K3DCwvg",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZWxsYXMiLCJleHAiOjE3NTI5NDQzNjh9.MlTzF2i9eMITEjQDwy0LjCZ5vHY29AFi72zRNFH4yow",
  "token_type": "bearer"
}
```

**Swift Model**:
```swift
struct TokenResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let tokenType: String
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case tokenType = "token_type"
    }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Inactive user account
- `422 Validation Error`: Missing form data

### 3. Token Refresh
**Endpoint**: `POST /api/auth/refresh`  
**Authentication**: Bearer token (refresh token)  
**Purpose**: Get new access token

**Request**:
```swift
let url = URL(string: "\(baseURL)/api/auth/refresh")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer \(refreshToken)", forHTTPHeaderField: "Authorization")
```

**Response**: Same as login response

### 4. User Logout
**Endpoint**: `POST /api/auth/logout`  
**Authentication**: Bearer token (access token)

**Request**:
```swift
let url = URL(string: "\(baseURL)/api/auth/logout")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
```

**Response**:
```json
{
  "message": "Successfully logged out"
}
```

## User Management Endpoints

### 1. Get Current User Profile
**Endpoint**: `GET /api/users/me`  
**Authentication**: Bearer token required

**Request**:
```swift
let url = URL(string: "\(baseURL)/api/users/me")!
var request = URLRequest(url: url)
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
```

**Response**:
```json
{
  "username": "bellas",
  "email": "bellas@reef.example",
  "phone_number": "",
  "is_active": true,
  "is_admin": true,
  "id": 1,
  "created_at": "2025-07-12T05:12:19.688405Z",
  "updated_at": "2025-07-12T16:59:27.665933Z"
}
```

**Swift Model**:
```swift
struct User: Codable {
    let id: Int
    let username: String
    let email: String
    let phoneNumber: String?
    let isActive: Bool
    let isAdmin: Bool
    let createdAt: String
    let updatedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id, username, email
        case phoneNumber = "phone_number"
        case isActive = "is_active"
        case isAdmin = "is_admin"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
```

### 2. List All Users (Admin Only)
**Endpoint**: `GET /api/users/`  
**Authentication**: Bearer token required (Admin only)

**Request**:
```swift
let url = URL(string: "\(baseURL)/api/users/")!
var request = URLRequest(url: url)
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
```

**Response**:
```json
[
  {
    "username": "bellas",
    "email": "bellas@reef.example",
    "phone_number": "",
    "is_active": true,
    "is_admin": true,
    "id": 1,
    "created_at": "2025-07-12T05:12:19.688405Z",
    "updated_at": "2025-07-12T16:59:27.665933Z"
  }
]
```

### 3. Update Current User Profile
**Endpoint**: `PATCH /api/users/me`  
**Authentication**: Bearer token required

**Request**:
```swift
let url = URL(string: "\(baseURL)/api/users/me")!
var request = URLRequest(url: url)
request.httpMethod = "PATCH"
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let updateData = ["phone_number": "555-9999"]
request.httpBody = try? JSONSerialization.data(withJSONObject: updateData)
```

**Response**: Updated user profile (same as GET /api/users/me)

## System Information Endpoints

### 1. Host Information
**Endpoint**: `GET /api/host-info`  
**Authentication**: Bearer token required

**Request**:
```swift
let url = URL(string: "\(baseURL)/api/host-info")!
var request = URLRequest(url: url)
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
```

**Response**:
```json
{
  "kernel_version": "6.12.34+rpt-rpi-2712",
  "uptime": "up 11 hours, 46 minutes",
  "os_name": "Linux",
  "release_name": "Debian GNU/Linux 12 (bookworm)",
  "model": "Raspberry Pi 5 Model B Rev 1.0"
}
```

**Swift Model**:
```swift
struct HostInfo: Codable {
    let kernelVersion: String
    let uptime: String
    let osName: String
    let releaseName: String
    let model: String
    
    enum CodingKeys: String, CodingKey {
        case kernelVersion = "kernel_version"
        case uptime, osName = "os_name", releaseName = "release_name", model
    }
}
```

### 2. System Usage
**Endpoint**: `GET /api/system-usage`  
**Authentication**: Bearer token required

**Request**:
```swift
let url = URL(string: "\(baseURL)/api/system-usage")!
var request = URLRequest(url: url)
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
```

**Response**:
```json
{
  "cpu_percent": 2.8,
  "memory_total_gb": 7.87,
  "memory_used_gb": 1.4,
  "memory_percent": 19.2,
  "disk_total_gb": 13.53,
  "disk_used_gb": 3.8,
  "disk_percent": 28.11
}
```

**Swift Model**:
```swift
struct SystemUsage: Codable {
    let cpuPercent: Double
    let memoryTotalGb: Double
    let memoryUsedGb: Double
    let memoryPercent: Double
    let diskTotalGb: Double
    let diskUsedGb: Double
    let diskPercent: Double
    
    enum CodingKeys: String, CodingKey {
        case cpuPercent = "cpu_percent"
        case memoryTotalGb = "memory_total_gb"
        case memoryUsedGb = "memory_used_gb"
        case memoryPercent = "memory_percent"
        case diskTotalGb = "disk_total_gb"
        case diskUsedGb = "disk_used_gb"
        case diskPercent = "disk_percent"
    }
}
```

## Temperature Service Endpoints

### 1. Temperature Service Health
**Endpoint**: `GET http://192.168.33.126:8004/health`  
**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-12T16:59:45.347569",
  "service": "Bella's Reef Temperature Service",
  "version": "2.0.0"
}
```

### 2. Discover Temperature Sensors
**Endpoint**: `GET http://192.168.33.126:8004/api/probes/discover`  
**Authentication**: Bearer token required

**Response**:
```json
{
  "available_sensors": ["000000bd3685", "000000be5efd"],
  "count": 2,
  "timestamp": "2025-07-12T17:00:01.465197"
}
```

**Swift Model**:
```swift
struct TemperatureDiscovery: Codable {
    let availableSensors: [String]
    let count: Int
    let timestamp: String
    
    enum CodingKeys: String, CodingKey {
        case availableSensors = "available_sensors"
        case count, timestamp
    }
}
```

### 3. System Status
**Endpoint**: `GET http://192.168.33.126:8004/api/probes/system/status`  
**Authentication**: Bearer token required

**Response**:
```json
{
  "subsystem_available": true,
  "device_count": 2,
  "error": null,
  "details": null
}
```

**Swift Model**:
```swift
struct TemperatureSystemStatus: Codable {
    let subsystemAvailable: Bool
    let deviceCount: Int
    let error: String?
    let details: String?
    
    enum CodingKeys: String, CodingKey {
        case subsystemAvailable = "subsystem_available"
        case deviceCount = "device_count"
        case error, details
    }
}
```

### 4. List Temperature Probes
**Endpoint**: `GET http://192.168.33.126:8004/api/probes/`  
**Authentication**: Bearer token required

**Response**:
```json
[]
```

## Lighting Service Endpoints

### 1. Lighting Service Health
**Endpoint**: `GET http://192.168.33.126:8001/health`  
**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "service": "lighting-api",
  "version": "2.0.0"
}
```

### 2. List Lighting Behaviors
**Endpoint**: `GET http://192.168.33.126:8001/lighting/behaviors/`  
**Authentication**: Bearer token required

**Response**:
```json
[
  {
    "created_at": "2025-07-12T05:12:20.068911Z",
    "updated_at": null,
    "id": 3,
    "name": "Scheduled Lunar",
    "behavior_type": "Lunar",
    "behavior_config": {
      "mode": "scheduled",
      "max_intensity": 0.1,
      "start_time": "21:00",
      "end_time": "06:00"
    },
    "weather_influence_enabled": false,
    "acclimation_days": null,
    "enabled": true
  },
  {
    "created_at": "2025-07-12T05:12:20.062885Z",
    "updated_at": null,
    "id": 2,
    "name": "Simple Moonlight",
    "behavior_type": "Moonlight",
    "behavior_config": {
      "intensity": 0.05,
      "start_time": "20:00",
      "end_time": "08:00"
    },
    "weather_influence_enabled": false,
    "acclimation_days": null,
    "enabled": true
  },
  {
    "created_at": "2025-07-12T05:12:20.032268Z",
    "updated_at": null,
    "id": 1,
    "name": "Fixed 50%",
    "behavior_type": "Fixed",
    "behavior_config": {
      "intensity": 0.5,
      "start_time": "09:00",
      "end_time": "17:00"
    },
    "weather_influence_enabled": false,
    "acclimation_days": null,
    "enabled": true
  }
]
```

**Swift Model**:
```swift
struct LightingBehavior: Codable {
    let id: Int
    let name: String
    let behaviorType: String
    let behaviorConfig: [String: Any]
    let weatherInfluenceEnabled: Bool
    let acclimationDays: Int?
    let enabled: Bool
    let createdAt: String
    let updatedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name
        case behaviorType = "behavior_type"
        case behaviorConfig = "behavior_config"
        case weatherInfluenceEnabled = "weather_influence_enabled"
        case acclimationDays = "acclimation_days"
        case enabled
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
```

### 3. List Lighting Assignments
**Endpoint**: `GET http://192.168.33.126:8001/lighting/assignments/`  
**Authentication**: Bearer token required

**Response**:
```json
[]
```

### 4. List Lighting Groups
**Endpoint**: `GET http://192.168.33.126:8001/lighting/groups/`  
**Authentication**: Bearer token required

**Response**:
```json
[]
```

## HAL Service Endpoints

### 1. HAL Service Health
**Endpoint**: `GET http://192.168.33.126:8003/health`  
**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "service": "HAL",
  "version": "3.1.0",
  "hardware_manager": {
    "status": "healthy",
    "controllers": {
      "total": 0,
      "active": 0,
      "inactive": 0,
      "error": 0
    },
    "channels": {
      "total": 0,
      "registered": 0,
      "active": 0
    },
    "performance": {
      "total_operations": 0,
      "successful_operations": 0,
      "failed_operations": 0,
      "average_response_time_ms": 0.0,
      "operations_per_second": 0.0
    },
    "errors": {
      "recent_count": 0,
      "last_error": null
    }
  },
  "resource_usage": {
    "total_allocations": 0,
    "by_resource_type": {},
    "by_controller_type": {},
    "by_controller": {}
  },
  "timestamp": "2025-07-12T16:59:43.560024",
  "uptime_seconds": 42424.317
}
```

### 2. Discover Controllers
**Endpoint**: `GET http://192.168.33.126:8003/api/hal/controllers/discover`  
**Authentication**: Bearer token required

**Response**:
```json
{
  "discovered_controllers": [
    {
      "type": "pca9685",
      "identifier": "0x40",
      "status": "unregistered",
      "properties": {
        "channel_count": 16,
        "resolution": 12,
        "frequency_range": [24, 1526],
        "supported_pins": null,
        "address_range": [64, 119],
        "platform": null,
        "supports_i2c": true,
        "supports_gpio": null,
        "supports_external_power": true,
        "requires_hardware": true,
        "current_frequency": null,
        "i2c_bus": null
      },
      "health_status": "healthy",
      "last_seen": "2025-07-12T17:00:32.208967+00:00",
      "is_registered": false,
      "controller_id": null,
      "address": 64,
      "platform": null,
      "platform_details": null
    },
    {
      "type": "native_pwm",
      "identifier": "rp1_pwm",
      "status": "unregistered",
      "properties": {
        "channel_count": 2,
        "resolution": 16,
        "frequency_range": [1, 125000],
        "supported_pins": [12, 13],
        "address_range": null,
        "platform": "unified",
        "supports_i2c": null,
        "supports_gpio": true,
        "supports_external_power": null,
        "requires_hardware": true,
        "current_frequency": null,
        "i2c_bus": null
      },
      "health_status": "healthy",
      "last_seen": "2025-07-12T17:00:32.210019+00:00",
      "is_registered": false,
      "controller_id": null,
      "address": null,
      "platform": "rp1",
      "platform_details": null
    }
  ],
  "summary": {
    "total": 2,
    "registered": 0,
    "available": 0,
    "pca9685": 1,
    "native_pwm": 1
  },
  "metadata": {
    "discovery_duration_ms": 99,
    "platform": "raspberry_pi",
    "scan_method": "unified",
    "timestamp": "2025-07-12T16:59:32.210060"
  },
  "timestamp": "2025-07-12T16:59:32.210064"
}
```

## SmartOutlets Service Endpoints

### 1. SmartOutlets Service Health
**Endpoint**: `GET http://192.168.33.126:8005/health`  
**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "service": "smartoutlets",
  "version": "1.0.0"
}
```

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response normally |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Refresh token or re-login |
| 403 | Forbidden | User lacks permissions |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Check request format |
| 500 | Server Error | Retry or show error message |

### Error Response Format
```json
{
  "detail": "Error message description"
}
```

**Swift Error Model**:
```swift
struct APIError: Codable {
    let detail: String
}

enum NetworkError: Error {
    case invalidURL
    case noData
    case decodingError
    case serverError(String)
    case unauthorized
    case forbidden
    case notFound
    case validationError(String)
}
```

## Network Layer Implementation

### URLSession Extension
```swift
extension URLSession {
    func dataTask<T: Codable>(
        for request: URLRequest,
        responseType: T.Type
    ) async throws -> T {
        let (data, response) = try await data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.serverError("Invalid response")
        }
        
        switch httpResponse.statusCode {
        case 200...299:
            do {
                return try JSONDecoder().decode(responseType, from: data)
            } catch {
                throw NetworkError.decodingError
            }
        case 401:
            throw NetworkError.unauthorized
        case 403:
            throw NetworkError.forbidden
        case 404:
            throw NetworkError.notFound
        case 422:
            if let errorResponse = try? JSONDecoder().decode(APIError.self, from: data) {
                throw NetworkError.validationError(errorResponse.detail)
            }
            throw NetworkError.validationError("Validation error")
        default:
            throw NetworkError.serverError("Server error: \(httpResponse.statusCode)")
        }
    }
}
```

### Authentication Manager
```swift
class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    private let keychain = KeychainWrapper.standard
    private let baseURL: String
    
    init(baseURL: String) {
        self.baseURL = baseURL
        loadStoredTokens()
    }
    
    func login(username: String, password: String) async throws -> TokenResponse {
        let url = URL(string: "\(baseURL)/api/auth/login")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        
        let body = "username=\(username)&password=\(password)"
        request.httpBody = body.data(using: .utf8)
        
        let response: TokenResponse = try await URLSession.shared.dataTask(
            for: request,
            responseType: TokenResponse.self
        )
        
        // Store tokens securely
        keychain.set(response.accessToken, forKey: "access_token")
        keychain.set(response.refreshToken, forKey: "refresh_token")
        
        await MainActor.run {
            self.isAuthenticated = true
        }
        
        return response
    }
    
    func refreshToken() async throws -> TokenResponse {
        guard let refreshToken = keychain.string(forKey: "refresh_token") else {
            throw NetworkError.unauthorized
        }
        
        let url = URL(string: "\(baseURL)/api/auth/refresh")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(refreshToken)", forHTTPHeaderField: "Authorization")
        
        let response: TokenResponse = try await URLSession.shared.dataTask(
            for: request,
            responseType: TokenResponse.self
        )
        
        // Update stored tokens
        keychain.set(response.accessToken, forKey: "access_token")
        keychain.set(response.refreshToken, forKey: "refresh_token")
        
        return response
    }
    
    func logout() {
        keychain.removeObject(forKey: "access_token")
        keychain.removeObject(forKey: "refresh_token")
        
        DispatchQueue.main.async {
            self.isAuthenticated = false
            self.currentUser = nil
        }
    }
    
    private func loadStoredTokens() {
        if let _ = keychain.string(forKey: "access_token") {
            DispatchQueue.main.async {
                self.isAuthenticated = true
            }
        }
    }
}
```

## Usage Examples

### Complete Authentication Flow
```swift
class BellaReefAPI {
    private let baseURL: String
    private let authManager: AuthenticationManager
    
    init(baseURL: String) {
        self.baseURL = baseURL
        self.authManager = AuthenticationManager(baseURL: baseURL)
    }
    
    func authenticate(username: String, password: String) async throws {
        do {
            let tokens = try await authManager.login(username: username, password: password)
            print("Authentication successful")
        } catch NetworkError.unauthorized {
            print("Invalid credentials")
        } catch {
            print("Authentication failed: \(error)")
        }
    }
    
    func getSystemInfo() async throws -> HostInfo {
        guard let accessToken = KeychainWrapper.standard.string(forKey: "access_token") else {
            throw NetworkError.unauthorized
        }
        
        let url = URL(string: "\(baseURL)/api/host-info")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        return try await URLSession.shared.dataTask(
            for: request,
            responseType: HostInfo.self
        )
    }
    
    func getTemperatureSensors() async throws -> TemperatureDiscovery {
        guard let accessToken = KeychainWrapper.standard.string(forKey: "access_token") else {
            throw NetworkError.unauthorized
        }
        
        let url = URL(string: "http://192.168.33.126:8004/api/probes/discover")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        return try await URLSession.shared.dataTask(
            for: request,
            responseType: TemperatureDiscovery.self
        )
    }
    
    func getLightingBehaviors() async throws -> [LightingBehavior] {
        guard let accessToken = KeychainWrapper.standard.string(forKey: "access_token") else {
            throw NetworkError.unauthorized
        }
        
        let url = URL(string: "http://192.168.33.126:8001/lighting/behaviors/")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        return try await URLSession.shared.dataTask(
            for: request,
            responseType: [LightingBehavior].self
        )
    }
}
```

## Testing

### Unit Test Example
```swift
import XCTest
@testable import BellasReefApp

class APITests: XCTestCase {
    var api: BellaReefAPI!
    
    override func setUp() {
        super.setUp()
        api = BellaReefAPI(baseURL: "http://192.168.33.126:8000")
    }
    
    func testHealthCheck() async throws {
        // Test health endpoint
        let health = try await api.getHealth()
        XCTAssertEqual(health.status, "healthy")
    }
    
    func testAuthentication() async throws {
        // Test login with valid credentials
        try await api.authenticate(username: "bellas", password: "reefrocks")
        XCTAssertTrue(api.authManager.isAuthenticated)
    }
    
    func testTemperatureDiscovery() async throws {
        // Test temperature sensor discovery
        let discovery = try await api.getTemperatureSensors()
        XCTAssertGreaterThanOrEqual(discovery.count, 0)
    }
    
    func testLightingBehaviors() async throws {
        // Test lighting behaviors retrieval
        let behaviors = try await api.getLightingBehaviors()
        XCTAssertGreaterThanOrEqual(behaviors.count, 0)
    }
}
```

## Security Best Practices

1. **Token Storage**: Use iOS Keychain for secure token storage
2. **Certificate Pinning**: Implement for production environments
3. **HTTPS**: Always use HTTPS in production
4. **Token Refresh**: Implement automatic token refresh
5. **Error Handling**: Don't expose sensitive information in error messages
6. **Logout**: Clear all tokens on logout
7. **Biometric Auth**: Use Face ID/Touch ID when available

## Performance Considerations

1. **Caching**: Cache system information for 30 seconds
2. **Background Refresh**: Use background app refresh for updates
3. **Image Loading**: Implement lazy loading for images
4. **Network Timeout**: Set appropriate timeout values (30 seconds)
5. **Retry Logic**: Implement exponential backoff for failed requests 