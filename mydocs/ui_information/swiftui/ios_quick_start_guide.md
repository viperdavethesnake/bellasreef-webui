# Bella's Reef iOS Companion App - Quick Start Guide

## 🚀 Getting Started

This guide provides everything you need to start building the Bella's Reef iOS companion app.

## Prerequisites

### Development Environment
- **Xcode**: 15.0+ (for iOS 18+ support)
- **iOS Deployment Target**: iOS 18.0+
- **Swift**: 6.0+
- **Device**: iPhone or iPad for testing

### Required Information
Before starting development, you'll need:

1. **Raspberry Pi IP Address**: The IP address of your Bella's Reef system
   - **Test Server**: `192.168.33.126`
   - **Default port**: `8000` (Core Service)

2. **Admin Credentials**:
   - Username: `bellas`
   - Password: `reefrocks`

## Project Setup

### 1. Create New Xcode Project
```bash
# Create new iOS project
# Target: iOS 18.0+
# Language: Swift
# Interface: SwiftUI
# Project Name: BellasReefApp
```

### 2. Add Dependencies
Add these to your `Package.swift` or use Swift Package Manager in Xcode:

```swift
// In Xcode: File > Add Package Dependencies
// Add these packages:

// 1. KeychainWrapper (for secure token storage)
// URL: https://github.com/jrendel/SwiftKeychainWrapper

// 2. Optional: Charts (for data visualization)
// URL: https://github.com/danielgindi/Charts
```

### 3. Basic Project Structure
```
BellasReefApp/
├── Models/
│   ├── API/
│   │   ├── HealthResponse.swift
│   │   ├── TokenResponse.swift
│   │   ├── User.swift
│   │   ├── HostInfo.swift
│   │   ├── SystemUsage.swift
│   │   ├── TemperatureDiscovery.swift
│   │   └── LightingBehavior.swift
│   └── Network/
│       ├── NetworkError.swift
│       └── APIError.swift
├── Services/
│   ├── AuthenticationManager.swift
│   ├── BellaReefAPI.swift
│   └── NetworkService.swift
├── Views/
│   ├── Settings/
│   │   ├── SettingsView.swift
│   │   ├── LoginView.swift
│   │   └── ConnectionTestView.swift
│   ├── Dashboard/
│   │   ├── DashboardView.swift
│   │   └── SystemStatusView.swift
│   └── Components/
│       ├── LoadingView.swift
│       └── ErrorView.swift
└── App/
    └── BellasReefApp.swift
```

## 🏗️ Core Implementation

### 1. Network Models

Create `Models/API/HealthResponse.swift`:
```swift
import Foundation

struct HealthResponse: Codable {
    let status: String
    let timestamp: String
    let service: String
    let version: String
}
```

Create `Models/API/TokenResponse.swift`:
```swift
import Foundation

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

Create `Models/API/User.swift`:
```swift
import Foundation

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

### 2. Network Error Handling

Create `Models/Network/NetworkError.swift`:
```swift
import Foundation

enum NetworkError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingError
    case serverError(String)
    case unauthorized
    case forbidden
    case notFound
    case validationError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingError:
            return "Failed to decode response"
        case .serverError(let message):
            return "Server error: \(message)"
        case .unauthorized:
            return "Authentication required"
        case .forbidden:
            return "Access forbidden"
        case .notFound:
            return "Resource not found"
        case .validationError(let message):
            return "Validation error: \(message)"
        }
    }
}
```

Create `Models/Network/APIError.swift`:
```swift
import Foundation

struct APIError: Codable {
    let detail: String
}
```

### 3. Authentication Manager

Create `Services/AuthenticationManager.swift`:
```swift
import Foundation
import SwiftUI
import KeychainWrapper

@MainActor
class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let keychain = KeychainWrapper.standard
    private let baseURL: String
    
    init(baseURL: String) {
        self.baseURL = baseURL
        loadStoredTokens()
    }
    
    func login(username: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let url = URL(string: "\(baseURL)/api/auth/login")!
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
            
            let body = "username=\(username)&password=\(password)"
            request.httpBody = body.data(using: .utf8)
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.serverError("Invalid response")
            }
            
            switch httpResponse.statusCode {
            case 200:
                let tokenResponse = try JSONDecoder().decode(TokenResponse.self, from: data)
                
                // Store tokens securely
                keychain.set(tokenResponse.accessToken, forKey: "access_token")
                keychain.set(tokenResponse.refreshToken, forKey: "refresh_token")
                
                isAuthenticated = true
                
                // Fetch user profile
                await fetchUserProfile()
                
            case 401:
                throw NetworkError.unauthorized
            case 422:
                if let errorResponse = try? JSONDecoder().decode(APIError.self, from: data) {
                    throw NetworkError.validationError(errorResponse.detail)
                }
                throw NetworkError.validationError("Invalid credentials")
            default:
                throw NetworkError.serverError("Server error: \(httpResponse.statusCode)")
            }
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    private func fetchUserProfile() async {
        guard let accessToken = keychain.string(forKey: "access_token") else { return }
        
        do {
            let url = URL(string: "\(baseURL)/api/users/me")!
            var request = URLRequest(url: url)
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                throw NetworkError.serverError("Failed to fetch user profile")
            }
            
            currentUser = try JSONDecoder().decode(User.self, from: data)
            
        } catch {
            print("Failed to fetch user profile: \(error)")
        }
    }
    
    func logout() {
        keychain.removeObject(forKey: "access_token")
        keychain.removeObject(forKey: "refresh_token")
        
        isAuthenticated = false
        currentUser = nil
        errorMessage = nil
    }
    
    private func loadStoredTokens() {
        if let _ = keychain.string(forKey: "access_token") {
            isAuthenticated = true
            Task {
                await fetchUserProfile()
            }
        }
    }
}
```

### 4. Main API Service

Create `Services/BellaReefAPI.swift`:
```swift
import Foundation

class BellaReefAPI {
    private let baseURL: String
    private let authManager: AuthenticationManager
    
    init(baseURL: String) {
        self.baseURL = baseURL
        self.authManager = AuthenticationManager(baseURL: baseURL)
    }
    
    // MARK: - Health Check
    
    func checkHealth() async throws -> HealthResponse {
        let url = URL(string: "\(baseURL)/health")!
        let request = URLRequest(url: url)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Health check failed")
        }
        
        return try JSONDecoder().decode(HealthResponse.self, from: data)
    }
    
    // MARK: - System Information
    
    func getHostInfo() async throws -> HostInfo {
        guard let accessToken = KeychainWrapper.standard.string(forKey: "access_token") else {
            throw NetworkError.unauthorized
        }
        
        let url = URL(string: "\(baseURL)/api/host-info")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Failed to get host info")
        }
        
        return try JSONDecoder().decode(HostInfo.self, from: data)
    }
    
    func getSystemUsage() async throws -> SystemUsage {
        guard let accessToken = KeychainWrapper.standard.string(forKey: "access_token") else {
            throw NetworkError.unauthorized
        }
        
        let url = URL(string: "\(baseURL)/api/system-usage")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Failed to get system usage")
        }
        
        return try JSONDecoder().decode(SystemUsage.self, from: data)
    }
    
    // MARK: - Temperature Service
    
    func getTemperatureSensors() async throws -> TemperatureDiscovery {
        guard let accessToken = KeychainWrapper.standard.string(forKey: "access_token") else {
            throw NetworkError.unauthorized
        }
        
        let url = URL(string: "http://192.168.33.126:8004/api/probes/discover")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Failed to get temperature sensors")
        }
        
        return try JSONDecoder().decode(TemperatureDiscovery.self, from: data)
    }
    
    // MARK: - Lighting Service
    
    func getLightingBehaviors() async throws -> [LightingBehavior] {
        guard let accessToken = KeychainWrapper.standard.string(forKey: "access_token") else {
            throw NetworkError.unauthorized
        }
        
        let url = URL(string: "http://192.168.33.126:8001/lighting/behaviors/")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Failed to get lighting behaviors")
        }
        
        return try JSONDecoder().decode([LightingBehavior].self, from: data)
    }
}
```

### 5. Settings View

Create `Views/Settings/SettingsView.swift`:
```swift
import SwiftUI

struct SettingsView: View {
    @StateObject private var authManager: AuthenticationManager
    @State private var serverURL = "http://192.168.33.126:8000"
    @State private var username = "bellas"
    @State private var password = "reefrocks"
    @State private var showingLoginAlert = false
    @State private var showingConnectionTest = false
    @State private var connectionStatus: ConnectionStatus = .unknown
    
    init() {
        _authManager = StateObject(wrappedValue: AuthenticationManager(baseURL: "http://192.168.33.126:8000"))
    }
    
    var body: some View {
        NavigationView {
            Form {
                // Connection Section
                Section("Connection") {
                    HStack {
                        Text("Server URL")
                        Spacer()
                        TextField("Server URL", text: $serverURL)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 200)
                    }
                    
                    Button("Test Connection") {
                        showingConnectionTest = true
                    }
                    .disabled(serverURL.isEmpty)
                    
                    if connectionStatus != .unknown {
                        HStack {
                            Text("Status")
                            Spacer()
                            StatusIndicator(status: connectionStatus)
                        }
                    }
                }
                
                // Authentication Section
                Section("Authentication") {
                    HStack {
                        Text("Username")
                        Spacer()
                        TextField("Username", text: $username)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 150)
                    }
                    
                    HStack {
                        Text("Password")
                        Spacer()
                        SecureField("Password", text: $password)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 150)
                    }
                    
                    Button(authManager.isAuthenticated ? "Logout" : "Login") {
                        if authManager.isAuthenticated {
                            authManager.logout()
                        } else {
                            Task {
                                await authManager.login(username: username, password: password)
                            }
                        }
                    }
                    .disabled(username.isEmpty || password.isEmpty || authManager.isLoading)
                    
                    if authManager.isLoading {
                        HStack {
                            ProgressView()
                                .scaleEffect(0.8)
                            Text("Authenticating...")
                        }
                    }
                    
                    if let errorMessage = authManager.errorMessage {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                    
                    if let user = authManager.currentUser {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Logged in as: \(user.username)")
                                .font(.headline)
                            Text("Email: \(user.email)")
                                .font(.caption)
                            Text("Admin: \(user.isAdmin ? "Yes" : "No")")
                                .font(.caption)
                        }
                        .padding(.vertical, 4)
                    }
                }
                
                // System Information Section
                if authManager.isAuthenticated {
                    Section("System Information") {
                        NavigationLink("Host Information") {
                            HostInfoView()
                        }
                        
                        NavigationLink("System Usage") {
                            SystemUsageView()
                        }
                        
                        NavigationLink("Temperature Sensors") {
                            TemperatureSensorsView()
                        }
                        
                        NavigationLink("Lighting Behaviors") {
                            LightingBehaviorsView()
                        }
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Connection Test", isPresented: $showingConnectionTest) {
                Button("OK") { }
            } message: {
                Text(connectionStatusMessage)
            }
        }
    }
    
    private var connectionStatusMessage: String {
        switch connectionStatus {
        case .connected:
            return "Successfully connected to Bella's Reef system!"
        case .failed:
            return "Failed to connect. Please check the server URL and try again."
        case .unknown:
            return "Testing connection..."
        }
    }
}

enum ConnectionStatus {
    case connected, failed, unknown
}

struct StatusIndicator: View {
    let status: ConnectionStatus
    
    var body: some View {
        HStack {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)
            Text(statusText)
                .font(.caption)
        }
    }
    
    private var statusColor: Color {
        switch status {
        case .connected: return .green
        case .failed: return .red
        case .unknown: return .gray
        }
    }
    
    private var statusText: String {
        switch status {
        case .connected: return "Connected"
        case .failed: return "Failed"
        case .unknown: return "Unknown"
        }
    }
}
```

### 6. Main App

Create `App/BellasReefApp.swift`:
```swift
import SwiftUI

@main
struct BellasReefApp: App {
    var body: some Scene {
        WindowGroup {
            SettingsView()
        }
    }
}
```

## 🧪 Testing

### 1. Test Connection
```swift
// Test the health endpoint
let api = BellaReefAPI(baseURL: "http://192.168.33.126:8000")

Task {
    do {
        let health = try await api.checkHealth()
        print("System status: \(health.status)")
        print("Service: \(health.service)")
        print("Version: \(health.version)")
    } catch {
        print("Health check failed: \(error)")
    }
}
```

### 2. Test Authentication
```swift
// Test login
let authManager = AuthenticationManager(baseURL: "http://192.168.33.126:8000")

Task {
    await authManager.login(username: "bellas", password: "reefrocks")
    
    if authManager.isAuthenticated {
        print("Login successful!")
        if let user = authManager.currentUser {
            print("User: \(user.username)")
            print("Admin: \(user.isAdmin)")
        }
    } else {
        print("Login failed: \(authManager.errorMessage ?? "Unknown error")")
    }
}
```

### 3. Test System Information
```swift
// Test system info endpoints
let api = BellaReefAPI(baseURL: "http://192.168.33.126:8000")

Task {
    do {
        let hostInfo = try await api.getHostInfo()
        print("Host: \(hostInfo.model)")
        print("OS: \(hostInfo.osName) \(hostInfo.releaseName)")
        print("Uptime: \(hostInfo.uptime)")
        
        let systemUsage = try await api.getSystemUsage()
        print("CPU: \(systemUsage.cpuPercent)%")
        print("Memory: \(systemUsage.memoryPercent)%")
        print("Disk: \(systemUsage.diskPercent)%")
        
    } catch {
        print("Failed to get system info: \(error)")
    }
}
```

## 🚀 Next Steps

1. **Implement Dashboard**: Create a dashboard view showing system status
2. **Add Temperature Monitoring**: Display temperature sensor readings
3. **Add Lighting Control**: Implement lighting behavior management
4. **Add Notifications**: Implement push notifications for alerts
5. **Add Charts**: Visualize system data over time
6. **Add Settings Persistence**: Save user preferences
7. **Add Offline Support**: Cache data for offline viewing
8. **Add Biometric Auth**: Use Face ID/Touch ID for login

## 📱 UI/UX Guidelines

### Design Principles
- **Clean & Modern**: Use iOS design patterns
- **Accessible**: Support VoiceOver and Dynamic Type
- **Responsive**: Work on all iPhone and iPad sizes
- **Intuitive**: Follow iOS Human Interface Guidelines

### Color Scheme
- **Primary**: Blue (#007AFF)
- **Success**: Green (#34C759)
- **Warning**: Orange (#FF9500)
- **Error**: Red (#FF3B30)
- **Background**: System background colors

### Typography
- **Headlines**: SF Pro Display
- **Body**: SF Pro Text
- **Monospace**: SF Mono (for technical data)

## 🔧 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check server URL format
   - Verify network connectivity
   - Check if services are running

2. **Authentication Failed**
   - Verify username/password
   - Check if user account is active
   - Try refreshing tokens

3. **Data Not Loading**
   - Check authentication status
   - Verify API endpoints
   - Check network connectivity

### Debug Tips

1. **Enable Network Logging**:
```swift
// Add to your API calls for debugging
print("Request URL: \(url)")
print("Request Headers: \(request.allHTTPHeaderFields ?? [:])")
```

2. **Test Individual Endpoints**:
```swift
// Test each service separately
let coreHealth = try await api.checkHealth()
let tempHealth = try await api.checkTemperatureHealth()
let lightingHealth = try await api.checkLightingHealth()
```

3. **Validate JSON Responses**:
```swift
// Print raw responses for debugging
print("Response Data: \(String(data: data, encoding: .utf8) ?? "")")
```

## 📚 Additional Resources

- [Complete API Reference](api_reference_for_ios.md)
- [Settings Implementation Guide](settings_screen_implementation.md)
- [Architecture Documentation](ios_companion_app_architecture.md)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## 🎯 Success Metrics

- ✅ Connect to Bella's Reef system
- ✅ Authenticate with admin credentials
- ✅ Display system health status
- ✅ Show host information
- ✅ Display system usage metrics
- ✅ List temperature sensors
- ✅ Show lighting behaviors
- ✅ Handle network errors gracefully
- ✅ Provide user feedback for all operations

You're now ready to build the Bella's Reef iOS companion app! Start with the settings screen to establish the connection, then build out the dashboard and other features. 