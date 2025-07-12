# Bella's Reef iOS App - Settings Screen Implementation Guide

## Overview

This guide provides a complete implementation for the Settings screen in the Bella's Reef iOS companion app. The Settings screen serves as the primary configuration interface for connecting to the Bella's Reef system.

## Settings Screen Structure

### Main Settings View
```swift
import SwiftUI

struct SettingsView: View {
    @StateObject private var settingsManager = SettingsManager()
    @StateObject private var authManager = AuthenticationManager()
    @State private var showingLoginSheet = false
    @State private var showingConnectionTest = false
    
    var body: some View {
        NavigationView {
            List {
                // Connection Section
                connectionSection
                
                // Authentication Section
                authenticationSection
                
                // App Settings Section
                appSettingsSection
                
                // System Information Section
                systemInfoSection
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showingLoginSheet) {
                LoginView(authManager: authManager)
            }
            .alert("Connection Test", isPresented: $showingConnectionTest) {
                Button("OK") { }
            } message: {
                Text(settingsManager.connectionStatusMessage)
            }
        }
    }
}
```

### Connection Section
```swift
private var connectionSection: some View {
    Section("Connection") {
        HStack {
            Image(systemName: "server.rack")
                .foregroundColor(.blue)
            VStack(alignment: .leading) {
                Text("Server URL")
                    .font(.headline)
                TextField("http://192.168.33.126:8000", text: $settingsManager.serverURL)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
            }
        }
        
        HStack {
            Image(systemName: connectionStatusIcon)
                .foregroundColor(connectionStatusColor)
            VStack(alignment: .leading) {
                Text("Connection Status")
                    .font(.headline)
                Text(settingsManager.connectionStatus)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
            Button("Test") {
                Task {
                    await settingsManager.testConnection()
                    showingConnectionTest = true
                }
            }
            .buttonStyle(.bordered)
        }
    }
}

private var connectionStatusIcon: String {
    switch settingsManager.connectionStatus {
    case "Connected":
        return "checkmark.circle.fill"
    case "Disconnected":
        return "xmark.circle.fill"
    default:
        return "questionmark.circle.fill"
    }
}

private var connectionStatusColor: Color {
    switch settingsManager.connectionStatus {
    case "Connected":
        return .green
    case "Disconnected":
        return .red
    default:
        return .orange
    }
}
```

### Authentication Section
```swift
private var authenticationSection: some View {
    Section("Authentication") {
        HStack {
            Image(systemName: "person.circle")
                .foregroundColor(.blue)
            VStack(alignment: .leading) {
                Text("Username")
                    .font(.headline)
                TextField("bellas", text: $settingsManager.username)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
        }
        
        HStack {
            Image(systemName: "lock.circle")
                .foregroundColor(.blue)
            VStack(alignment: .leading) {
                Text("Password")
                    .font(.headline)
                SecureField("reefrocks", text: $settingsManager.password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
        }
        
        HStack {
            Image(systemName: authStatusIcon)
                .foregroundColor(authStatusColor)
            VStack(alignment: .leading) {
                Text("Authentication Status")
                    .font(.headline)
                Text(authManager.isAuthenticated ? "Logged In" : "Not Authenticated")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
            Button(authManager.isAuthenticated ? "Logout" : "Login") {
                if authManager.isAuthenticated {
                    authManager.logout()
                } else {
                    showingLoginSheet = true
                }
            }
            .buttonStyle(.bordered)
        }
    }
}

private var authStatusIcon: String {
    authManager.isAuthenticated ? "checkmark.circle.fill" : "xmark.circle.fill"
}

private var authStatusColor: Color {
    authManager.isAuthenticated ? .green : .red
}
```

### App Settings Section
```swift
private var appSettingsSection: some View {
    Section("App Settings") {
        HStack {
            Image(systemName: "clock")
                .foregroundColor(.blue)
            VStack(alignment: .leading) {
                Text("Auto-refresh Interval")
                    .font(.headline)
                Text("\(Int(settingsManager.refreshInterval)) seconds")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
            Slider(value: $settingsManager.refreshInterval, in: 5...60, step: 5)
                .frame(width: 100)
        }
        
        HStack {
            Image(systemName: "bell")
                .foregroundColor(.blue)
            Text("Push Notifications")
            Spacer()
            Toggle("", isOn: $settingsManager.notificationsEnabled)
        }
        
        HStack {
            Image(systemName: "moon")
                .foregroundColor(.blue)
            Text("Dark Mode")
            Spacer()
            Toggle("", isOn: $settingsManager.darkModeEnabled)
        }
        
        HStack {
            Image(systemName: "ladybug")
                .foregroundColor(.blue)
            Text("Debug Mode")
            Spacer()
            Toggle("", isOn: $settingsManager.debugModeEnabled)
        }
    }
}
```

### System Information Section
```swift
private var systemInfoSection: some View {
    Section("System Information") {
        if let hostInfo = settingsManager.hostInfo {
            HStack {
                Image(systemName: "cpu")
                    .foregroundColor(.blue)
                VStack(alignment: .leading) {
                    Text("System")
                        .font(.headline)
                    Text(hostInfo.model)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack {
                Image(systemName: "clock.arrow.circlepath")
                    .foregroundColor(.blue)
                VStack(alignment: .leading) {
                    Text("Uptime")
                        .font(.headline)
                    Text(hostInfo.uptime)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack {
                Image(systemName: "gear")
                    .foregroundColor(.blue)
                VStack(alignment: .leading) {
                    Text("OS")
                        .font(.headline)
                    Text(hostInfo.os)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        
        HStack {
            Image(systemName: "arrow.clockwise")
                .foregroundColor(.blue)
            VStack(alignment: .leading) {
                Text("Last Sync")
                    .font(.headline)
                Text(settingsManager.lastSyncTime)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        
        Button("Refresh System Info") {
            Task {
                await settingsManager.refreshSystemInfo()
            }
        }
        .buttonStyle(.bordered)
    }
}
```

## Settings Manager

### SettingsManager Class
```swift
import Foundation
import Combine

class SettingsManager: ObservableObject {
    @Published var serverURL: String {
        didSet {
            UserDefaults.standard.set(serverURL, forKey: "serverURL")
        }
    }
    
    @Published var username: String {
        didSet {
            UserDefaults.standard.set(username, forKey: "username")
        }
    }
    
    @Published var password: String {
        didSet {
            UserDefaults.standard.set(password, forKey: "password")
        }
    }
    
    @Published var refreshInterval: Double {
        didSet {
            UserDefaults.standard.set(refreshInterval, forKey: "refreshInterval")
        }
    }
    
    @Published var notificationsEnabled: Bool {
        didSet {
            UserDefaults.standard.set(notificationsEnabled, forKey: "notificationsEnabled")
        }
    }
    
    @Published var darkModeEnabled: Bool {
        didSet {
            UserDefaults.standard.set(darkModeEnabled, forKey: "darkModeEnabled")
        }
    }
    
    @Published var debugModeEnabled: Bool {
        didSet {
            UserDefaults.standard.set(debugModeEnabled, forKey: "debugModeEnabled")
        }
    }
    
    @Published var connectionStatus: String = "Unknown"
    @Published var connectionStatusMessage: String = ""
    @Published var hostInfo: HostInfo?
    @Published var lastSyncTime: String = "Never"
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Load saved settings
        self.serverURL = UserDefaults.standard.string(forKey: "serverURL") ?? "http://192.168.33.126:8000"
        self.username = UserDefaults.standard.string(forKey: "username") ?? "bellas"
        self.password = UserDefaults.standard.string(forKey: "password") ?? "reefrocks"
        self.refreshInterval = UserDefaults.standard.double(forKey: "refreshInterval")
        if refreshInterval == 0 { refreshInterval = 30 }
        self.notificationsEnabled = UserDefaults.standard.bool(forKey: "notificationsEnabled")
        self.darkModeEnabled = UserDefaults.standard.bool(forKey: "darkModeEnabled")
        self.debugModeEnabled = UserDefaults.standard.bool(forKey: "debugModeEnabled")
        
        // Test connection on init
        Task {
            await testConnection()
        }
    }
    
    @MainActor
    func testConnection() async {
        connectionStatus = "Testing..."
        
        do {
            let url = URL(string: "\(serverURL)/health")!
            let (data, response) = try await URLSession.shared.data(from: url)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                let healthResponse = try JSONDecoder().decode(HealthResponse.self, from: data)
                connectionStatus = "Connected"
                connectionStatusMessage = "Server is healthy. Version: \(healthResponse.version)"
                lastSyncTime = Date().formatted()
            } else {
                connectionStatus = "Disconnected"
                connectionStatusMessage = "Server returned invalid response"
            }
        } catch {
            connectionStatus = "Disconnected"
            connectionStatusMessage = "Connection failed: \(error.localizedDescription)"
        }
    }
    
    @MainActor
    func refreshSystemInfo() async {
        guard let accessToken = KeychainWrapper.standard.string(forKey: "access_token") else {
            return
        }
        
        do {
            let url = URL(string: "\(serverURL)/api/host-info")!
            var request = URLRequest(url: url)
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                hostInfo = try JSONDecoder().decode(HostInfo.self, from: data)
                lastSyncTime = Date().formatted()
            }
        } catch {
            if debugModeEnabled {
                print("Failed to refresh system info: \(error)")
            }
        }
    }
}
```

## Login View

### LoginSheet Implementation
```swift
struct LoginView: View {
    @ObservedObject var authManager: AuthenticationManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var username: String = ""
    @State private var password: String = ""
    @State private var isLoading = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: "lock.shield")
                    .font(.system(size: 60))
                    .foregroundColor(.blue)
                
                Text("Bella's Reef Login")
                    .font(.title)
                    .fontWeight(.bold)
                
                VStack(spacing: 15) {
                    TextField("Username", text: $username)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    
                    SecureField("Password", text: $password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    if !errorMessage.isEmpty {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                    
                    Button(action: login) {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .scaleEffect(0.8)
                            }
                            Text(isLoading ? "Logging in..." : "Login")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                    }
                    .disabled(isLoading || username.isEmpty || password.isEmpty)
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Login")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func login() {
        isLoading = true
        errorMessage = ""
        
        Task {
            do {
                try await authManager.login(username: username, password: password)
                await MainActor.run {
                    isLoading = false
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Login failed: \(error.localizedDescription)"
                }
            }
        }
    }
}
```

## Data Models

### Health Response Model
```swift
struct HealthResponse: Codable {
    let status: String
    let timestamp: String
    let service: String
    let version: String
}
```

### Host Info Model
```swift
struct HostInfo: Codable {
    let kernel: String
    let uptime: String
    let os: String
    let model: String
}
```

## Keychain Integration

### KeychainWrapper Extension
```swift
import Foundation
import Security

class KeychainWrapper {
    static let standard = KeychainWrapper()
    
    private init() {}
    
    func set(_ value: String, forKey key: String) {
        let data = value.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]
        
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }
    
    func string(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let string = String(data: data, encoding: .utf8) else {
            return nil
        }
        
        return string
    }
    
    func removeObject(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
}
```

## Usage in Main App

### App Entry Point
```swift
@main
struct BellasReefApp: App {
    @StateObject private var settingsManager = SettingsManager()
    @StateObject private var authManager = AuthenticationManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(settingsManager)
                .environmentObject(authManager)
                .preferredColorScheme(settingsManager.darkModeEnabled ? .dark : .light)
        }
    }
}
```

### Content View
```swift
struct ContentView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    
    var body: some View {
        if authManager.isAuthenticated {
            MainTabView()
        } else {
            SettingsView()
        }
    }
}
```

## Testing

### Unit Tests
```swift
import XCTest
@testable import BellasReefApp

class SettingsManagerTests: XCTestCase {
    var settingsManager: SettingsManager!
    
    override func setUp() {
        super.setUp()
        settingsManager = SettingsManager()
    }
    
    func testDefaultValues() {
        XCTAssertEqual(settingsManager.serverURL, "http://192.168.33.126:8000")
        XCTAssertEqual(settingsManager.username, "bellas")
        XCTAssertEqual(settingsManager.password, "reefrocks")
        XCTAssertEqual(settingsManager.refreshInterval, 30)
    }
    
    func testConnectionTest() async {
        await settingsManager.testConnection()
        XCTAssertNotEqual(settingsManager.connectionStatus, "Unknown")
    }
}
```

## Best Practices

1. **Security**: Store sensitive data in Keychain, not UserDefaults
2. **Validation**: Validate server URL format before testing connection
3. **Error Handling**: Provide clear, actionable error messages
4. **Accessibility**: Support VoiceOver and Dynamic Type
5. **Performance**: Use async/await for network operations
6. **Testing**: Write unit tests for all critical functionality
7. **User Experience**: Show loading states and progress indicators

## Next Steps

1. Implement the main dashboard view
2. Add device control functionality
3. Implement real-time updates
4. Add push notifications
5. Create offline mode support
6. Add comprehensive error handling
7. Implement background refresh 