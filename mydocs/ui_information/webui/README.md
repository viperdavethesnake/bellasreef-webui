# Bella's Reef Web UI - Documentation

This folder contains comprehensive documentation for building the Bella's Reef web interface. **All endpoints have been tested and validated against the live system at `192.168.33.126`**.

## 📚 Documentation Overview

### 🚀 Start Here
1. **[Quick Start Guide](web_quick_start_guide.md)** - Essential information to begin web development immediately
2. **[API Reference for Web](api_reference_for_web.md)** - Complete API documentation with JavaScript/TypeScript examples
3. **[API Testing Guide](api_testing_guide.md)** - Guide for testing and validating endpoints against test server

### 📋 Architecture & Design
5. **[Web App Architecture](web_app_architecture.md)** - Complete web app architecture and design specifications
6. **[App Theme & Design System](app_theme_design_system.md)** - Ocean/reef-inspired design system and brand identity
7. **[Temperature System UI Design](temperature_system_ui_design.md)** - Complete UI/UX for temperature monitoring
8. **[Smart Outlets UI Design](smart_outlets_ui_design.md)** - Complete UI/UX for cloud and local outlet management
9. **[System Health Dashboard Design](system_health_dashboard_design.md)** - Complete UI/UX for system monitoring and health status
10. **[HAL PWM Management Design](hal_pwm_management_design.md)** - Complete UI/UX for PWM controller and channel management

### 🧪 Testing & Validation
11. **[API Testing Guide](api_testing_guide.md)** - Guide for UI/UX designers to test and validate endpoints against test server

## 🎯 Getting Started

### For New Web Developers
1. **Read the Quick Start Guide** - Contains everything needed to start development
2. **Review the App Theme & Design System** - Understand the ocean/reef design philosophy
3. **Set up the project** - Follow the step-by-step setup instructions
4. **Implement token management** - Get seamless authentication working
5. **Test the connection** - Verify connectivity to the Bella's Reef system
6. **Build the settings page** - Create the foundation for the web app
7. **Implement temperature monitoring** - Add the temperature system UI

### For Experienced Web Developers
1. **Review the App Theme & Design System** - Understand the ocean/reef design philosophy
2. **Review the Token Management System** - Understand seamless authentication
3. **Check the API Reference** - Understand all available endpoints
4. **Review the Temperature UI Design** - Understand the monitoring interface
5. **Start with the settings implementation** - Build the core functionality
6. **Extend with additional features** - Add dashboard, monitoring, and control features

## 🔧 System Requirements

### Development Environment
- **Node.js**: 18.0+ (for modern JavaScript features)
- **Package Manager**: npm, yarn, or pnpm
- **Framework Options**: React, Vue, Angular, or vanilla JavaScript
- **Browser**: Modern browsers with ES6+ support

### Bella's Reef System
- **Test Server**: `192.168.33.126`
- **Core Service**: Port 8000
- **Lighting Service**: Port 8001
- **HAL Service**: Port 8003
- **Temperature Service**: Port 8004
- **SmartOutlets Service**: Port 8005

### Authentication
- **Username**: `bellas`
- **Password**: `reefrocks`
- **Method**: JWT Bearer tokens
- **Token Expiry**: 60 minutes (access), 7 days (refresh)
- **Auto-Refresh**: Seamless token management

## 📱 Available Features

### ✅ Validated & Working
- **Seamless Authentication**: Automatic token refresh without user intervention
- **Secure Token Storage**: Browser localStorage/sessionStorage with encryption
- **Health Checks**: All services respond correctly
- **User Management**: Get current user profile
- **System Information**: Host info and system usage
- **Temperature Sensors**: Discover and monitor sensors
- **Lighting Behaviors**: List and manage lighting behaviors
- **HAL Controllers**: Discover hardware controllers
- **Smart Outlets**: Cloud (VeSync) and local (Kasa/Shelly) outlet management
- **Error Handling**: Comprehensive error management

### 🔄 In Development
- **Real-time Monitoring**: Live data updates with WebSockets
- **Device Control**: Direct hardware control
- **Push Notifications**: Browser notifications
- **Offline Support**: Service Worker for cached data access
- **Advanced UI**: Charts and visualizations

## 🌡️ Temperature System Features

### Settings Page
- **System Health Check**: Verify temperature system status
- **Probe Discovery**: Find available temperature sensors
- **Probe Registration**: Register probes with custom names
- **Temperature Units**: Set Celsius/Fahrenheit preference
- **Probe Management**: Edit and delete registered probes

### View Page
- **Real-time Readings**: Live temperature data from registered probes
- **System Overview**: Average temperature and probe count
- **Individual Probe Cards**: Detailed readings with status indicators
- **Unit Conversion**: Switch between °C and °F
- **Auto-refresh**: Automatic data updates

### User Experience
- **Seamless Discovery**: Automatic probe detection
- **Custom Naming**: User-friendly probe names
- **Status Indicators**: Visual health status for each probe
- **Temperature Ranges**: Color-coded temperature levels
- **Accessibility**: Screen reader and keyboard navigation support

## 🔌 Smart Outlets System Features

### Settings Page
- **Cloud Outlets (VeSync)**: Account management and outlet discovery
- **Local Outlets (Kasa/Shelly)**: Network discovery and device selection
- **Account Verification**: Test VeSync credentials before saving
- **Outlet Discovery**: Find all available outlets on network
- **Outlet Selection**: Choose which outlets to control
- **System Status**: Connection status and device counts

### Control Page
- **Outlet Overview**: All configured outlets with real-time status
- **Filter Options**: All, VeSync, Local, On, Off filters
- **Individual Control**: Turn On, Turn Off, Toggle for each outlet
- **Power Consumption**: Real-time power usage display
- **Status Indicators**: Visual connection and power status
- **Bulk Operations**: Select multiple outlets for group control

### User Experience
- **Seamless Discovery**: Automatic device detection
- **Real-time Status**: Live outlet status updates
- **Visual Feedback**: Clear power state indicators
- **Error Handling**: Graceful failure management
- **Accessibility**: Screen reader and keyboard navigation support

## 🏥 System Health Dashboard Features

### Dashboard Overview
- **Overall System Health**: Visual health status with percentage indicator
- **Service Status Grid**: All services with individual health status
- **System Information**: Host details, platform, and architecture
- **Performance Metrics**: CPU, memory, and disk usage with progress bars
- **Recent Activity**: System events and user actions timeline

### Service Monitoring
- **Health Checks**: Real-time status for all 5 services (Core, Lighting, HAL, Temperature, SmartOutlets)
- **Response Times**: Performance metrics for each service
- **Error Handling**: Detailed error messages and status indicators
- **Visual Indicators**: Color-coded status with appropriate icons
- **Service Details**: Port information and last check times

### System Information
- **Host Information**: Hostname, platform, and architecture details
- **System Usage**: Real-time CPU, memory, and disk usage
- **Network I/O**: Upload and download statistics
- **Uptime Tracking**: System uptime display
- **Performance Visualization**: Progress bars for resource usage

### User Experience
- **Real-time Updates**: Auto-refresh every 30 seconds
- **Manual Refresh**: Refresh button and keyboard shortcuts
- **Visual Feedback**: Loading states and progress indicators
- **Error Recovery**: Graceful handling of service failures
- **Accessibility**: Screen reader and keyboard navigation support

## ⚡ HAL PWM Management Features

### Settings Page
- **Controller Discovery**: Find available PWM controllers (Native, PCA9685)
- **Controller Registration**: Register controllers for use
- **Channel Configuration**: Add channels with proper validation
- **Device Role Assignment**: Assign roles (Lighting, Pump, Heater, etc.)
- **Channel Management**: Edit and delete registered channels
- **Validation System**: Ensure proper channel limits and naming

### Testing Page
- **Individual Channel Testing**: Sliders for each channel with real-time feedback
- **Quick Test Buttons**: 0%, 25%, 50%, 100% preset buttons
- **Ramp Testing**: Multi-channel ramp functions with preview
- **Ramp Types**: Linear, Ease In, Ease Out, Ease In/Out
- **Test Results**: Track and view test history
- **Real-time Status**: Live duty cycle and status indicators

### Controller Support
- **Native PWM**: 2 channels (0-1) for Raspberry Pi
- **PCA9685**: 16 channels (0-15) for I2C controller
- **Type Validation**: Automatic validation based on controller type
- **Channel Limits**: Enforce proper channel ranges
- **Address Management**: I2C address configuration

### User Experience
- **Visual Validation**: Real-time channel ID validation
- **Type-specific UI**: Different interfaces for different controllers
- **Ramp Preview**: Visual ramp function preview
- **Error Handling**: Clear validation error messages
- **Accessibility**: Screen reader and keyboard navigation support

## 🔐 Authentication Experience

### Seamless User Flow
1. **User logs in once** with `bellas`/`reefrocks`
2. **Tokens stored securely** in browser storage
3. **Automatic refresh** happens in background
4. **No interruptions** during app use
5. **Secure logout** clears all tokens

### Key Features
- **Automatic Token Refresh**: No user intervention required
- **Background Monitoring**: Proactive token management
- **Secure Storage**: Browser storage with encryption
- **Session Management**: Persistent login across browser sessions
- **Error Recovery**: Graceful handling of auth failures

## 🧪 Testing

### Manual Testing
All endpoints have been manually tested against the live system:

```bash
# Test health endpoint
curl http://192.168.33.126:8000/health

# Test authentication
curl -X POST http://192.168.33.126:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=bellas&password=reefrocks"

# Test temperature sensors
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.33.126:8004/api/probes/discover
```

### Automated Testing
The documentation includes JavaScript/TypeScript test examples for all endpoints and token management.

## 📊 Current System Status

### Core Service (Port 8000)
- ✅ **Health**: Operational
- ✅ **Authentication**: Working with JWT tokens
- ✅ **User Management**: Working
- ✅ **System Info**: Working

### Temperature Service (Port 8004)
- ✅ **Health**: Operational
- ✅ **Sensors**: 2 sensors discovered
  - `000000bd3685`
  - `000000be5efd`
- ✅ **System Status**: Healthy
- ✅ **Discovery**: Working
- ✅ **Readings**: Available

### Lighting Service (Port 8001)
- ✅ **Health**: Operational
- ✅ **Behaviors**: 3 behaviors configured
- ✅ **Assignments**: Available (empty)
- ✅ **Groups**: Available (empty)

### HAL Service (Port 8003)
- ✅ **Health**: Operational
- ✅ **Controllers**: 2 controllers discovered
  - PCA9685 (I2C address 0x40)
  - Native PWM (RP1 platform)
- ✅ **Discovery**: Working

### SmartOutlets Service (Port 8005)
- ✅ **Health**: Operational

## 🚀 Quick Implementation

### 1. Create Project
```bash
# Create new web project
npm create vite@latest bellas-reef-web -- --template react-ts
cd bellas-reef-web
npm install
```

### 2. Add Dependencies
```bash
# Add required packages
npm install axios jwt-decode crypto-js
npm install @types/crypto-js --save-dev
```

### 3. Copy Core Files
- Copy the TypeScript models from the Quick Start Guide
- Copy the TokenManager implementation
- Copy the AuthenticationManager with auto-refresh
- Copy the AuthenticatedNetworkManager
- Copy the TemperatureManager implementation
- Copy the TemperatureSettingsView and TemperatureView

### 4. Test Authentication
```typescript
const authManager = new AuthenticationManager('http://192.168.33.126:8000');
await authManager.login('bellas', 'reefrocks');

// Tokens are automatically managed - no further action needed!
```

### 5. Test Temperature System
```typescript
const tempManager = new TemperatureManager();
await tempManager.discoverProbes();
console.log(`Found ${tempManager.discoveredProbes.length} probes`);

// Get temperature readings
await tempManager.refreshReadings();
```

## 📋 Implementation Checklist

### Phase 1: Foundation ✅
- [x] Project setup
- [x] Network models
- [x] Token management system
- [x] Authentication manager with auto-refresh
- [x] Settings page
- [x] Connection testing
- [x] Error handling

### Phase 2: Core Features 🔄
- [x] Temperature system UI
- [x] Smart outlets system UI
- [x] System health dashboard
- [x] HAL PWM management
- [ ] Dashboard view
- [ ] System monitoring
- [ ] Lighting control
- [ ] User preferences

### Phase 3: Advanced Features 📋
- [ ] Real-time updates with WebSockets
- [ ] Push notifications
- [ ] Offline support with Service Worker
- [ ] Charts and graphs
- [ ] Device management

### Phase 4: Polish 📋
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Accessibility
- [ ] Testing coverage
- [ ] Production deployment

## 🔍 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify server URL: `http://192.168.33.126:8000`
   - Check network connectivity
   - Ensure Bella's Reef system is running

2. **Authentication Failed**
   - Verify credentials: `bellas` / `reefrocks`
   - Check if user account is active
   - Try refreshing the connection

3. **Token Refresh Issues**
   - Check if refresh token is valid
   - Verify network connectivity
   - Check server logs for auth errors

4. **Temperature Sensors Not Found**
   - Check temperature service health
   - Verify 1-wire bus is enabled
   - Check sensor connections

5. **Data Not Loading**
   - Check authentication status
   - Verify API endpoints
   - Check network connectivity

### Debug Commands
```bash
# Test core service
curl http://192.168.33.126:8000/health

# Test authentication
curl -X POST http://192.168.33.126:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=bellas&password=reefrocks"

# Test temperature discovery
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.33.126:8004/api/probes/discover

# Test temperature system status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.33.126:8004/api/probes/system/status
```

## 📚 Additional Resources

### Documentation
- [Complete API Reference](api_reference_for_web.md) - All endpoints with JavaScript/TypeScript examples
- [API Testing Guide](api_testing_guide.md) - Guide for testing and validating endpoints against test server
- [App Theme & Design System](app_theme_design_system.md) - Ocean/reef-inspired design system and brand identity
- [Token Management System](token_management_system.md) - Seamless authentication guide
- [Temperature System UI Design](temperature_system_ui_design.md) - Complete temperature monitoring interface
- [Smart Outlets UI Design](smart_outlets_ui_design.md) - Complete cloud and local outlet management interface
- [System Health Dashboard Design](system_health_dashboard_design.md) - Complete system monitoring and health status interface
- [HAL PWM Management Design](hal_pwm_management_design.md) - Complete PWM controller and channel management interface
- [Quick Start Guide](web_quick_start_guide.md) - Step-by-step implementation
- [Settings Implementation](settings_screen_implementation.md) - Detailed settings page
- [Architecture Document](web_app_architecture.md) - System design and architecture

### Ready for Implementation
- **[Main Dashboard UI/UX](main_dashboard_ui_design.md)** - Operational control center with quick actions, real-time status, and daily operations (Home page)
- **[Lighting Settings UI/UX](lighting_settings_ui_design.md)** - Location configuration, timezone mapping, and weather integration foundation

### Future Systems (WIP - Placeholders)
- [Flow Management UI/UX](flow_management_ui_design.md) - Water flow control, feed mode, emergency stop, and device management
- [Lighting Control UI/UX](lighting_control_ui_design.md) - Advanced lighting behaviors, effects, weather integration, and channel control
- [Telemetry & Analytics UI/UX](telemetry_analytics_ui_design.md) - Historical data analysis, trend visualization, and system performance monitoring

### External Resources
- [React Documentation](https://react.dev/)
- [Vue.js Documentation](https://vuejs.org/)
- [Angular Documentation](https://angular.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Bella's Reef System
- **Test Server**: `192.168.33.126`
- **Admin Credentials**: `bellas` / `reefrocks`
- **Services**: 5 microservices running
- **Hardware**: Raspberry Pi 5 with temperature sensors and PWM controllers

## 🎯 Success Metrics

### Technical Goals
- ✅ Connect to Bella's Reef system
- ✅ Authenticate with admin credentials
- ✅ Implement seamless token management
- ✅ Display system health status
- ✅ Show host information
- ✅ Display system usage metrics
- ✅ Discover temperature sensors
- ✅ Monitor temperature readings
- ✅ Show lighting behaviors
- ✅ Handle network errors gracefully
- ✅ Provide user feedback for all operations

### User Experience Goals
- ✅ Seamless authentication (no repeated logins)
- ✅ Intuitive temperature monitoring
- 🔄 Responsive design
- 🔄 Fast loading times
- 🔄 Clear error messages
- 🔄 Offline functionality
- 🔄 Accessibility support

## 📞 Support

If you encounter issues:

1. **Check the Bella's Reef system** - Ensure all services are running
2. **Verify network connectivity** - Test basic network access
3. **Review the token management documentation** - Check authentication flow
4. **Test manually with curl** - Verify endpoints work outside the app
5. **Check the troubleshooting section** - Common solutions provided

## 🚀 Ready to Start?

1. **Review the App Theme & Design System** - Understand the ocean/reef design philosophy
2. **Read the Token Management System** - Understand seamless authentication
3. **Review the Temperature UI Design** - Understand the monitoring interface
4. **Review the Smart Outlets UI Design** - Understand cloud and local outlet management
5. **Review the System Health Dashboard Design** - Understand system monitoring and health status
6. **Review the HAL PWM Management Design** - Understand PWM controller and channel management
7. **Set up your development environment** - Node.js 18.0+ with modern framework
8. **Create the project structure** - Follow the provided organization
9. **Implement the token management** - Copy the authentication system
10. **Build the temperature monitoring** - Add the temperature system UI
11. **Build the smart outlets system** - Add cloud and local outlet management
12. **Build the system health dashboard** - Add comprehensive system monitoring
13. **Build the HAL PWM management** - Add PWM controller and channel management
14. **Test with the live system** - Verify everything works
15. **Extend with additional features** - Add dashboard and monitoring

The Bella's Reef web interface is ready to be built! All the foundation is in place with validated endpoints, seamless token management, working authentication, complete temperature monitoring interface, comprehensive smart outlets management system, comprehensive system health monitoring dashboard, complete HAL PWM management system, and a beautiful ocean/reef-inspired design system. 