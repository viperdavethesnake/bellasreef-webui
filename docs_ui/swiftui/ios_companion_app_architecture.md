# Bella's Reef iOS Companion App - Architecture & Design Document

## Overview

This document provides the complete architecture and design specifications for the Bella's Reef iOS Companion App (iOS 18+). The app serves as a mobile interface for monitoring and controlling the Bella's Reef aquarium automation system.

## App Architecture

### Core Components

1. **Authentication Module** - JWT token management and user authentication
2. **Settings Module** - App configuration and server connection management
3. **Dashboard Module** - Real-time system monitoring and control
4. **Device Control Module** - Hardware device management and control
5. **System Monitoring Module** - Health checks and system status

### Technology Stack

- **Platform**: iOS 18+
- **Language**: Swift 6.0+
- **Architecture**: MVVM with Combine
- **Networking**: URLSession with async/await
- **Storage**: Core Data + UserDefaults
- **UI Framework**: SwiftUI
- **Authentication**: JWT token management

## Authentication Flow

### Initial Setup

The app requires users to configure the core service URL and authenticate with admin credentials.

#### Required Information for Users

1. **Core Service URL**: The IP address and port of the Bella's Reef core service
   - Default: `http://YOUR_RASPBERRY_PI_IP:8000`
   - Example: `http://192.168.33.126:8000`

2. **Admin Credentials**: Default admin account credentials
   - Username: `bellas`
   - Password: `reefrocks`
   - Email: `bellas@reef.example`

### Authentication Process

#### Step 1: Server Connection Test
```swift
// Test server connectivity
GET /health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-09T22:30:00Z",
  "service": "Bella's Reef Core Service",
  "version": "1.0.0"
}
```

#### Step 2: User Authentication
```swift
// Authenticate user
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=bellas&password=reefrocks
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Step 3: Token Storage
- Store `access_token` in Keychain for secure access
- Store `refresh_token` in Keychain for token renewal
- Store server URL in UserDefaults

### Token Management

#### Access Token Usage
- Include in all API requests: `Authorization: Bearer {access_token}`
- Access tokens expire after 60 minutes (configurable)
- Automatically refresh when expired

#### Refresh Token Process
```swift
// Refresh access token
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Settings Tab Design

### Settings Screen Structure

#### 1. Connection Settings
- **Server URL**: Text field for core service URL
- **Connection Test**: Button to test server connectivity
- **Connection Status**: Visual indicator (green/red dot)

#### 2. Authentication Settings
- **Username**: Text field (default: `bellas`)
- **Password**: Secure text field (default: `reefrocks`)
- **Login Button**: Authenticate and get tokens
- **Authentication Status**: Shows current login state

#### 3. App Settings
- **Auto-refresh Interval**: Slider for dashboard refresh rate
- **Notifications**: Toggle for push notifications
- **Dark Mode**: Toggle for app appearance
- **Debug Mode**: Toggle for detailed logging

#### 4. System Information
- **Core Service Version**: Display current version
- **Last Sync**: Timestamp of last successful sync
- **Connection Quality**: Network latency indicator

### Settings Screen Flow

1. **First Launch**: Show connection setup wizard
2. **URL Configuration**: Validate and test server URL
3. **Authentication**: Login with admin credentials
4. **Token Storage**: Securely store authentication tokens
5. **Settings Persistence**: Save configuration to UserDefaults

## API Integration

### Core Service Endpoints

#### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

#### User Management Endpoints
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update current user profile

#### System Information Endpoints
- `GET /api/host-info` - System hardware information
- `GET /api/system-usage` - Real-time system metrics

### Error Handling

#### Network Errors
- Connection timeout: Show retry button
- Server unavailable: Show offline mode
- Invalid URL: Show validation error

#### Authentication Errors
- Invalid credentials: Show login form
- Expired token: Automatically refresh
- Refresh failed: Redirect to login

#### API Errors
- 401 Unauthorized: Redirect to login
- 403 Forbidden: Show permission error
- 500 Server Error: Show retry option

## Data Models

### User Model
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
}
```

### System Info Model
```swift
struct HostInfo: Codable {
    let kernel: String
    let uptime: String
    let os: String
    let model: String
}

struct SystemUsage: Codable {
    let cpu: Double
    let memory: MemoryUsage
    let disk: DiskUsage
}
```

### Authentication Model
```swift
struct TokenResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let tokenType: String
}
```

## Security Considerations

### Token Storage
- Store tokens in iOS Keychain
- Use biometric authentication when available
- Implement token rotation on app launch

### Network Security
- Use HTTPS when available
- Validate server certificates
- Implement certificate pinning for production

### Data Protection
- Encrypt sensitive data in UserDefaults
- Use App Transport Security
- Implement secure logout (clear tokens)

## UI/UX Guidelines

### Design Principles
- **Simplicity**: Clean, uncluttered interface
- **Accessibility**: Support for VoiceOver and Dynamic Type
- **Responsiveness**: Fast loading and smooth animations
- **Error Handling**: Clear, actionable error messages

### Color Scheme
- **Primary**: Ocean blue (#0066CC)
- **Secondary**: Coral orange (#FF6B35)
- **Success**: Green (#28A745)
- **Error**: Red (#DC3545)
- **Warning**: Yellow (#FFC107)

### Typography
- **Headings**: SF Pro Display Bold
- **Body**: SF Pro Text Regular
- **Code**: SF Mono Regular

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup and basic architecture
- [ ] Settings tab implementation
- [ ] Authentication flow
- [ ] Basic networking layer

### Phase 2: Core Features (Week 3-4)
- [ ] Dashboard implementation
- [ ] System monitoring
- [ ] Error handling
- [ ] Token management

### Phase 3: Advanced Features (Week 5-6)
- [ ] Device control
- [ ] Real-time updates
- [ ] Push notifications
- [ ] Offline mode

### Phase 4: Polish (Week 7-8)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] App Store preparation

## Testing Strategy

### Unit Tests
- Authentication flow
- Token management
- Data models
- Network layer

### Integration Tests
- API endpoint testing
- Error handling
- Token refresh flow

### UI Tests
- Settings screen flow
- Authentication process
- Error state handling

## Deployment Considerations

### App Store Requirements
- Privacy policy
- App Store Connect setup
- Screenshots and descriptions
- Age rating compliance

### Distribution
- TestFlight for beta testing
- App Store for production
- Enterprise distribution (if needed)

## Support and Documentation

### User Documentation
- In-app help system
- Setup guide
- Troubleshooting tips

### Developer Documentation
- API documentation
- Code comments
- Architecture diagrams

## Conclusion

This architecture provides a solid foundation for the Bella's Reef iOS Companion App. The modular design allows for easy maintenance and future enhancements while ensuring a secure and user-friendly experience.

The settings tab serves as the entry point for app configuration, with authentication being the primary focus for initial development. The JWT token-based authentication system provides secure access to all Bella's Reef services while maintaining a smooth user experience. 