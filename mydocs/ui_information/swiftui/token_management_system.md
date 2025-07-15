# Bella's Reef iOS App - Token Management System

## Overview

This document describes the complete JWT token management system for the Bella's Reef iOS companion app. The system provides seamless authentication with automatic token refresh, secure storage, and transparent user experience.

## 🔐 Token System Architecture

### Token Types
- **Access Token**: Short-lived (60 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for getting new access tokens
- **Token Type**: Bearer (JWT format)

### Token Flow
```
User Login → Get Access + Refresh Tokens → Store Securely → Use Access Token → Auto Refresh → Seamless Experience
```

## 🏗️ Core Components

### 1. Token Storage (Keychain)
```swift
import Foundation
import KeychainWrapper

class TokenManager {
    private let keychain = KeychainWrapper.standard
    
    // Token storage keys
    private enum Keys {
        static let accessToken = "bellas_reef_access_token"
        static let refreshToken = "bellas_reef_refresh_token"
        static let tokenExpiry = "bellas_reef_token_expiry"
    }
    
    // Store tokens securely
    func storeTokens(accessToken: String, refreshToken: String) {
        keychain.set(accessToken, forKey: Keys.accessToken)
        keychain.set(refreshToken, forKey: Keys.refreshToken)
        
        // Calculate and store expiry time
        if let expiry = extractExpiryFromToken(accessToken) {
            keychain.set(expiry.timeIntervalSince1970, forKey: Keys.tokenExpiry)
        }
    }
    
    // Retrieve tokens
    func getAccessToken() -> String? {
        return keychain.string(forKey: Keys.accessToken)
    }
    
    func getRefreshToken() -> String? {
        return keychain.string(forKey: Keys.refreshToken)
    }
    
    // Check if token is expired
    func isTokenExpired() -> Bool {
        guard let expiryTimestamp = keychain.double(forKey: Keys.tokenExpiry) else {
            return true
        }
        
        let expiryDate = Date(timeIntervalSince1970: expiryTimestamp)
        let bufferTime: TimeInterval = 300 // 5 minutes buffer
        return Date().timeIntervalSince(expiryDate) > bufferTime
    }
    
    // Clear all tokens
    func clearTokens() {
        keychain.removeObject(forKey: Keys.accessToken)
        keychain.removeObject(forKey: Keys.refreshToken)
        keychain.removeObject(forKey: Keys.tokenExpiry)
    }
    
    // Extract expiry from JWT token
    private func extractExpiryFromToken(_ token: String) -> Date? {
        let components = token.components(separatedBy: ".")
        guard components.count == 3,
              let payloadData = Data(base64Encoded: components[1] + "==") else {
            return nil
        }
        
        do {
            let payload = try JSONSerialization.jsonObject(with: payloadData) as? [String: Any]
            if let exp = payload?["exp"] as? TimeInterval {
                return Date(timeIntervalSince1970: exp)
            }
        } catch {
            print("Failed to parse JWT payload: \(error)")
        }
        
        return nil
    }
}
```

### 2. Automatic Token Refresh
```swift
import Foundation

class TokenRefreshManager {
    private let tokenManager = TokenManager()
    private let baseURL: String
    private var isRefreshing = false
    private var refreshQueue: [(String) -> Void] = []
    
    init(baseURL: String) {
        self.baseURL = baseURL
    }
    
    // Get valid access token (refresh if needed)
    func getValidAccessToken() async throws -> String {
        // Check if we have a token and it's not expired
        if let accessToken = tokenManager.getAccessToken(),
           !tokenManager.isTokenExpired() {
            return accessToken
        }
        
        // Token is expired or missing, need to refresh
        return try await refreshAccessToken()
    }
    
    // Refresh access token using refresh token
    private func refreshAccessToken() async throws -> String {
        // Prevent multiple simultaneous refresh attempts
        if isRefreshing {
            return try await withCheckedThrowingContinuation { continuation in
                refreshQueue.append { token in
                    continuation.resume(returning: token)
                }
            }
        }
        
        isRefreshing = true
        defer { isRefreshing = false }
        
        guard let refreshToken = tokenManager.getRefreshToken() else {
            throw NetworkError.unauthorized
        }
        
        do {
            let url = URL(string: "\(baseURL)/api/auth/refresh")!
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("Bearer \(refreshToken)", forHTTPHeaderField: "Authorization")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.serverError("Invalid response")
            }
            
            switch httpResponse.statusCode {
            case 200:
                let tokenResponse = try JSONDecoder().decode(TokenResponse.self, from: data)
                
                // Store new tokens
                tokenManager.storeTokens(
                    accessToken: tokenResponse.accessToken,
                    refreshToken: tokenResponse.refreshToken
                )
                
                // Notify waiting requests
                refreshQueue.forEach { $0(tokenResponse.accessToken) }
                refreshQueue.removeAll()
                
                return tokenResponse.accessToken
                
            case 401:
                // Refresh token is expired, user needs to login again
                tokenManager.clearTokens()
                throw NetworkError.unauthorized
                
            default:
                throw NetworkError.serverError("Token refresh failed: \(httpResponse.statusCode)")
            }
            
        } catch {
            // Clear tokens on any error
            tokenManager.clearTokens()
            throw error
        }
    }
}
```

### 3. Network Request Interceptor
```swift
import Foundation

class AuthenticatedNetworkManager {
    private let tokenRefreshManager: TokenRefreshManager
    private let baseURL: String
    
    init(baseURL: String) {
        self.baseURL = baseURL
        self.tokenRefreshManager = TokenRefreshManager(baseURL: baseURL)
    }
    
    // Make authenticated request with automatic token refresh
    func authenticatedRequest<T: Codable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil,
        responseType: T.Type
    ) async throws -> T {
        
        // Get valid access token (refresh if needed)
        let accessToken = try await tokenRefreshManager.getValidAccessToken()
        
        // Build request
        let url = URL(string: "\(baseURL)\(endpoint)")!
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        if let body = body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = body
        }
        
        // Make request
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.serverError("Invalid response")
        }
        
        switch httpResponse.statusCode {
        case 200...299:
            return try JSONDecoder().decode(responseType, from: data)
            
        case 401:
            // Token might be invalid, try to refresh and retry once
            do {
                let newAccessToken = try await tokenRefreshManager.getValidAccessToken()
                
                // Retry with new token
                request.setValue("Bearer \(newAccessToken)", forHTTPHeaderField: "Authorization")
                let (retryData, retryResponse) = try await URLSession.shared.data(for: request)
                
                guard let retryHttpResponse = retryResponse as? HTTPURLResponse,
                      retryHttpResponse.statusCode == 200 else {
                    throw NetworkError.unauthorized
                }
                
                return try JSONDecoder().decode(responseType, from: retryData)
                
            } catch {
                throw NetworkError.unauthorized
            }
            
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

### 4. Enhanced Authentication Manager
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
    
    private let tokenManager = TokenManager()
    private let networkManager: AuthenticatedNetworkManager
    private let baseURL: String
    
    init(baseURL: String) {
        self.baseURL = baseURL
        self.networkManager = AuthenticatedNetworkManager(baseURL: baseURL)
        loadStoredTokens()
    }
    
    // Login with automatic token management
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
                tokenManager.storeTokens(
                    accessToken: tokenResponse.accessToken,
                    refreshToken: tokenResponse.refreshToken
                )
                
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
    
    // Fetch user profile using authenticated request
    private func fetchUserProfile() async {
        do {
            currentUser = try await networkManager.authenticatedRequest(
                endpoint: "/api/users/me",
                responseType: User.self
            )
        } catch {
            print("Failed to fetch user profile: \(error)")
        }
    }
    
    // Logout and clear all tokens
    func logout() {
        tokenManager.clearTokens()
        isAuthenticated = false
        currentUser = nil
        errorMessage = nil
    }
    
    // Check if user is authenticated (has valid tokens)
    private func loadStoredTokens() {
        if let _ = tokenManager.getAccessToken(),
           !tokenManager.isTokenExpired() {
            isAuthenticated = true
            Task {
                await fetchUserProfile()
            }
        }
    }
    
    // Force token refresh (for testing)
    func forceTokenRefresh() async throws {
        _ = try await networkManager.authenticatedRequest(
            endpoint: "/api/users/me",
            responseType: User.self
        )
    }
}
```

## 🔄 Seamless User Experience

### 1. Automatic Token Refresh
The system automatically handles token refresh without user intervention:

```swift
// User makes a request
let user = try await networkManager.authenticatedRequest(
    endpoint: "/api/users/me",
    responseType: User.self
)

// If token is expired, it's automatically refreshed and retried
// User doesn't see any interruption
```

### 2. Background Token Management
```swift
class BackgroundTokenManager {
    private let tokenManager = TokenManager()
    private let refreshManager: TokenRefreshManager
    
    init(baseURL: String) {
        self.refreshManager = TokenRefreshManager(baseURL: baseURL)
    }
    
    // Start background token monitoring
    func startBackgroundMonitoring() {
        Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { _ in
            Task {
                await self.checkAndRefreshTokenIfNeeded()
            }
        }
    }
    
    // Check and refresh token if needed
    private func checkAndRefreshTokenIfNeeded() async {
        guard tokenManager.getAccessToken() != nil else { return }
        
        if tokenManager.isTokenExpired() {
            do {
                _ = try await refreshManager.getValidAccessToken()
                print("Background token refresh successful")
            } catch {
                print("Background token refresh failed: \(error)")
            }
        }
    }
}
```

### 3. App State Management
```swift
class AppStateManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var currentUser: User?
    
    private let authManager: AuthenticationManager
    private let backgroundTokenManager: BackgroundTokenManager
    
    init(baseURL: String) {
        self.authManager = AuthenticationManager(baseURL: baseURL)
        self.backgroundTokenManager = BackgroundTokenManager(baseURL: baseURL)
        
        // Start background token monitoring
        backgroundTokenManager.startBackgroundMonitoring()
        
        // Observe authentication state
        authManager.$isAuthenticated
            .assign(to: &$isAuthenticated)
        
        authManager.$currentUser
            .assign(to: &$currentUser)
        
        authManager.$isLoading
            .assign(to: &$isLoading)
    }
    
    // Handle app lifecycle
    func handleAppDidBecomeActive() {
        // Check token validity when app becomes active
        Task {
            await checkTokenValidity()
        }
    }
    
    private func checkTokenValidity() async {
        // If we have tokens but they're expired, try to refresh
        if authManager.isAuthenticated {
            do {
                try await authManager.forceTokenRefresh()
            } catch {
                // Token refresh failed, user needs to login again
                await MainActor.run {
                    authManager.logout()
                }
            }
        }
    }
}
```

## 🛡️ Security Best Practices

### 1. Secure Token Storage
```swift
// Use iOS Keychain for secure storage
// Tokens are automatically encrypted and protected
// Access requires device unlock or biometric authentication
```

### 2. Token Validation
```swift
// Validate token format and expiry
// Check for tampering
// Verify issuer and audience claims
```

### 3. Automatic Cleanup
```swift
// Clear tokens on logout
// Clear tokens on app uninstall
// Clear tokens on security events
```

## 📱 User Experience Features

### 1. Seamless Authentication
- User logs in once
- Tokens are automatically refreshed
- No interruption during app use
- Automatic logout on token expiration

### 2. Offline Support
```swift
// Cache user data for offline access
// Queue requests when offline
// Sync when connection restored
```

### 3. Biometric Authentication
```swift
import LocalAuthentication

class BiometricAuthManager {
    func authenticateWithBiometrics() async throws -> Bool {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            throw BiometricError.notAvailable
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Authenticate to access Bella's Reef") { success, error in
                if let error = error {
                    continuation.resume(throwing: BiometricError.authenticationFailed(error))
                } else {
                    continuation.resume(returning: success)
                }
            }
        }
    }
}

enum BiometricError: Error {
    case notAvailable
    case authenticationFailed(Error)
}
```

## 🧪 Testing Token Management

### 1. Unit Tests
```swift
import XCTest

class TokenManagementTests: XCTestCase {
    var tokenManager: TokenManager!
    var refreshManager: TokenRefreshManager!
    
    override func setUp() {
        super.setUp()
        tokenManager = TokenManager()
        refreshManager = TokenRefreshManager(baseURL: "http://192.168.33.126:8000")
    }
    
    func testTokenStorage() {
        let accessToken = "test_access_token"
        let refreshToken = "test_refresh_token"
        
        tokenManager.storeTokens(accessToken: accessToken, refreshToken: refreshToken)
        
        XCTAssertEqual(tokenManager.getAccessToken(), accessToken)
        XCTAssertEqual(tokenManager.getRefreshToken(), refreshToken)
    }
    
    func testTokenExpiry() {
        // Test with expired token
        let expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZWxsYXMiLCJleHAiOjE2MzQ1Njc4OTl9.signature"
        tokenManager.storeTokens(accessToken: expiredToken, refreshToken: "refresh")
        
        XCTAssertTrue(tokenManager.isTokenExpired())
    }
    
    func testTokenRefresh() async throws {
        // Test automatic token refresh
        let validToken = try await refreshManager.getValidAccessToken()
        XCTAssertFalse(validToken.isEmpty)
    }
}
```

### 2. Integration Tests
```swift
func testAuthenticatedRequest() async throws {
    let networkManager = AuthenticatedNetworkManager(baseURL: "http://192.168.33.126:8000")
    
    // This should work even if token is expired (auto-refresh)
    let user = try await networkManager.authenticatedRequest(
        endpoint: "/api/users/me",
        responseType: User.self
    )
    
    XCTAssertNotNil(user)
    XCTAssertEqual(user.username, "bellas")
}
```

## 📊 Monitoring and Logging

### 1. Token Analytics
```swift
class TokenAnalytics {
    static func logTokenRefresh() {
        // Log token refresh events
        Analytics.logEvent("token_refresh", parameters: [
            "timestamp": Date().timeIntervalSince1970
        ])
    }
    
    static func logAuthenticationSuccess() {
        Analytics.logEvent("authentication_success")
    }
    
    static func logAuthenticationFailure(error: Error) {
        Analytics.logEvent("authentication_failure", parameters: [
            "error": error.localizedDescription
        ])
    }
}
```

### 2. Debug Logging
```swift
class TokenLogger {
    static func logTokenEvent(_ event: String, details: [String: Any] = [:]) {
        #if DEBUG
        print("🔐 Token Event: \(event)")
        if !details.isEmpty {
            print("   Details: \(details)")
        }
        #endif
    }
}
```

## 🚀 Implementation Checklist

### Phase 1: Core Token Management ✅
- [x] Token storage in Keychain
- [x] Automatic token refresh
- [x] Network request interceptor
- [x] Authentication manager

### Phase 2: User Experience 🔄
- [ ] Background token monitoring
- [ ] Biometric authentication
- [ ] Offline support
- [ ] App state management

### Phase 3: Security & Testing 📋
- [ ] Token validation
- [ ] Security event handling
- [ ] Comprehensive testing
- [ ] Analytics and monitoring

### Phase 4: Advanced Features 📋
- [ ] Multi-device sync
- [ ] Push notification tokens
- [ ] Advanced caching
- [ ] Performance optimization

## 🎯 Success Metrics

### Technical Goals
- ✅ Automatic token refresh without user intervention
- ✅ Secure token storage in Keychain
- ✅ Seamless authentication experience
- ✅ Proper error handling and recovery
- ✅ Background token monitoring

### User Experience Goals
- 🔄 No login prompts during normal use
- 🔄 Smooth app experience without interruptions
- 🔄 Secure authentication with biometrics
- 🔄 Offline functionality when possible

The token management system provides a seamless, secure, and user-friendly authentication experience for the Bella's Reef iOS companion app. 