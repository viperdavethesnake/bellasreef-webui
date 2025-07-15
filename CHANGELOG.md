# Changelog

All notable changes to the BellasReef Web UI project will be documented in this file.

## [Unreleased] - 2024-12-19

### Added
- **Core Application Structure**
  - React TypeScript application with Vite build system
  - React Router for navigation with protected routes
  - Authentication system with JWT token management
  - Axios interceptors for automatic token refresh
  - WebSocket service for real-time updates

- **Authentication & Security**
  - Login/logout functionality
  - Token storage in localStorage
  - Automatic token refresh on 401 responses
  - Protected route wrapper component
  - Auth context for global state management

- **Dashboard**
  - System status overview with health indicators
  - Daily operations summary (placeholder for future features)
  - Activity feed (placeholder for future features)
  - Quick actions panel (disabled - backend support pending)
  - Connection status monitoring

- **Settings Pages**
  - **System Settings**: Service status overview, system metrics
  - **Temperature Settings**: Complete probe management system
    - Probe discovery and registration
    - Real-time temperature readings
    - Per-probe configuration (name, role, unit, thresholds)
    - Color-coded temperature ranges
    - Service health monitoring
  - **Smart Outlets**: Placeholder for outlet management
  - **HAL/PWM**: Placeholder for PWM control
  - **Lighting**: Placeholder with service health
  - **Flow**: Placeholder with service health
  - **Telemetry**: Placeholder with service health

- **Monitor Pages**
  - **Probe Monitor**: Real-time temperature probe readings and status
  - **System Health**: Detailed system metrics and service status
  - **HAL/PWM**: PWM control interface (placeholder)
  - **Lighting**: Control and settings pages
  - **Flow**: Control and settings pages
  - **Telemetry**: Temperature and PWM data views

- **UI Components**
  - **PageHeader**: Standardized page headers with titles and actions
  - **TabNavigation**: Consistent tab navigation across pages
  - **Card**: Reusable card component with variants
  - **StatusCard**: Cards for displaying status information
  - **MetricCard**: Cards for displaying metrics
  - **Button**: Standardized button component with variants
  - **Badge**: Status badges with colors and icons
  - **Modal**: Reusable modal component
  - **Form Components**: Input, Select, Textarea, Checkbox, FormSection, FormRow, FormActions
  - **Loading Components**: LoadingSpinner, LoadingOverlay, ErrorState, EmptyState, SuccessState, DataLoadingWrapper

- **API Integration**
  - Core service API client (port 8000)
  - Temperature service API client (port 8001)
  - WebSocket service for real-time data
  - Health check endpoints for all services
  - Probe discovery and registration endpoints
  - Temperature reading endpoints

- **Documentation**
  - `/mydocs/` folder with development documentation
  - Backend ideas and feature requests
  - Daily operations and activity PRD
  - Development roadmap
  - API integration notes

### Changed
- **UI/UX Improvements**
  - Standardized page layouts and navigation
  - Consistent styling across all components
  - Improved error handling and loading states
  - Better responsive design
  - Unified color scheme and typography

- **Code Organization**
  - Broke down large Dashboard component into smaller, focused components
  - Created reusable UI component library
  - Improved component composition and reusability
  - Better separation of concerns

- **API Integration**
  - Fixed authentication issues across services
  - Improved error handling for API calls
  - Added proper token management for all services
  - Fixed WebSocket authentication with query parameters

### Fixed
- **Authentication Issues**
  - Fixed token refresh logic
  - Resolved 401/403 errors on API calls
  - Fixed WebSocket connection authentication
  - Proper token storage and retrieval

- **Temperature Service Integration**
  - Fixed probe discovery endpoint calls
  - Resolved probe registration with correct API fields
  - Fixed temperature reading requests with required resolution field
  - Corrected probe data mapping and display

- **UI Bugs**
  - Fixed JSX syntax errors in components
  - Resolved missing closing tags
  - Fixed component prop type issues
  - Corrected navigation routing

- **Data Display**
  - Fixed registered probe data loading
  - Corrected temperature unit display
  - Fixed service health status indicators
  - Resolved real-time data updates

### Technical Debt
- **Backend Integration**
  - Missing reboot endpoint in core service
  - System usage endpoint missing temperature data
  - Daily operations and activity endpoints not implemented
  - Quick actions backend support pending

- **Frontend Improvements Needed**
  - Some placeholder pages need real implementation
  - Error boundaries for better error handling
  - Unit tests for components
  - E2E tests for critical user flows

### Known Issues
- **Backend Services**
  - Some services may have intermittent connectivity issues
  - Temperature service occasionally returns 500 errors
  - WebSocket connections may drop and need reconnection

- **Frontend**
  - Some features are disabled due to missing backend support
  - Placeholder content in several pages
  - Limited real-time data for some services

## Development Status

### Completed Features
- ✅ Core application structure and routing
- ✅ Authentication system with token management
- ✅ Dashboard with system overview
- ✅ Settings pages with service health monitoring
- ✅ Temperature probe management (discovery, registration, monitoring)
- ✅ UI component library and standardization
- ✅ API integration for core and temperature services
- ✅ WebSocket integration for real-time updates

### In Progress
- 🔄 UI/UX consistency improvements
- 🔄 Component standardization
- 🔄 Error handling improvements

### Planned Features
- 📋 Real-time data for all services
- 📋 Daily operations and activity tracking
- 📋 Quick actions implementation
- 📋 Advanced probe configuration
- 📋 System control features (reboot, shutdown)
- 📋 Data export and reporting
- 📋 User management and permissions
- 📋 Mobile responsive design improvements

### Backend Dependencies
- Core service (port 8000) - ✅ Available
- Temperature service (port 8001) - ✅ Available
- Smart Outlets service - ❌ Not implemented
- HAL/PWM service - ❌ Not implemented
- Lighting service - ❌ Not implemented
- Flow service - ❌ Not implemented
- Telemetry service - ❌ Not implemented

## Next Steps
1. Complete UI/UX standardization (Priority 1-4)
2. Implement remaining backend services
3. Add real-time data for all services
4. Implement daily operations and activity tracking
5. Add system control features
6. Improve error handling and user feedback
7. Add comprehensive testing
8. Optimize performance and responsiveness

---

*This changelog follows the [Keep a Changelog](https://keepachangelog.com/) format and uses [Semantic Versioning](https://semver.org/).* 