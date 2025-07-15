# Backend Ideas & Improvements

## Core Service Enhancements

### 1. System Reboot Endpoint
- **Current State**: No reboot endpoint exists in core OpenAPI
- **Proposed**: Add `POST /api/system/reboot` endpoint
- **Use Case**: Allow users to reboot the Raspberry Pi from the web UI
- **Implementation**: 
  - Add to core service OpenAPI spec
  - Implement with proper authentication/authorization
  - Add confirmation dialog in frontend
  - Consider graceful shutdown vs force reboot

### 2. System Usage Temperature
- **Current State**: `/api/system/usage` only returns CPU, memory, disk
- **Proposed**: Add system temperature to usage endpoint
- **Use Case**: Monitor RPi5 temperature in system health dashboard
- **Implementation**:
  - Extend usage response to include `temperature` field
  - Read from `/sys/class/thermal/thermal_zone0/temp`
  - Return in Celsius or Fahrenheit (configurable)

### 3. System Alerts/Notifications
- **Current State**: No alerting system
- **Proposed**: Add alerting endpoints and WebSocket notifications
- **Use Cases**: 
  - Temperature thresholds exceeded
  - Service failures
  - System resource warnings
  - Probe calibration due
- **Implementation**:
  - `GET /api/alerts` - List active alerts
  - `POST /api/alerts` - Create alert
  - `PUT /api/alerts/{id}` - Update alert
  - WebSocket notifications for real-time alerts

### 4. System Logs Endpoint
- **Current State**: No centralized logging
- **Proposed**: Add system logs endpoint
- **Use Case**: Debug system issues, monitor service health
- **Implementation**:
  - `GET /api/system/logs` - Retrieve system logs
  - Support filtering by service, level, time range
  - Real-time log streaming via WebSocket

## Temperature Service Improvements

### 5. Probe Configuration Persistence
- **Current State**: Frontend-only settings (min/max, unit, polling)
- **Proposed**: Extend probe registration to include all settings
- **Use Case**: Persist probe configuration across reboots
- **Implementation**:
  - Extend `/api/probes/` POST/PUT to include:
    - `min_value`, `max_value`
    - `unit` (C/F)
    - `poll_enabled`, `poll_interval`
    - `location`, `description`
  - Update probe reading endpoints to respect unit settings

### 6. Temperature History/Logging
- **Current State**: Only current readings
- **Proposed**: Add historical data storage and retrieval
- **Use Case**: Temperature trends, alerts, data analysis
- **Implementation**:
  - `GET /api/probes/{id}/history` - Get historical readings
  - Support time range, aggregation (hourly, daily)
  - Data retention policies
  - Export functionality

### 7. Temperature Alerts
- **Current State**: Frontend-only threshold checking
- **Proposed**: Backend alert system for temperature thresholds
- **Use Case**: Proactive monitoring, notifications
- **Implementation**:
  - Configure alerts per probe
  - WebSocket notifications when thresholds exceeded
  - Email/SMS notifications (future)
  - Alert history and acknowledgment

## HAL/PWM Service Enhancements

### 8. Channel Configuration Persistence
- **Current State**: Basic channel control
- **Proposed**: Persistent channel configuration
- **Use Case**: Save channel settings, scheduled operations
- **Implementation**:
  - `PUT /api/hal/channels/{id}/config` - Save channel config
  - Include min/max values, default states
  - Scheduled operations (sunrise/sunset simulation)

### 9. HAL Controller Registration
- **Current State**: Manual controller registration
- **Proposed**: Automatic controller discovery and registration
- **Use Case**: Easier setup, dynamic controller management
- **Implementation**:
  - Auto-discover HAL controllers on startup
  - Register with friendly names
  - Configuration templates for common setups

## Smart Outlets Service

### 10. Outlet Scheduling
- **Current State**: Manual on/off control
- **Proposed**: Scheduled operations
- **Use Case**: Automated equipment control, energy management
- **Implementation**:
  - `POST /api/outlets/{id}/schedule` - Create schedule
  - Daily, weekly schedules
  - Sunrise/sunset based scheduling
  - Holiday/exception handling

### 11. Power Monitoring
- **Current State**: Basic on/off status
- **Proposed**: Power consumption monitoring
- **Use Case**: Energy tracking, equipment health monitoring
- **Implementation**:
  - `GET /api/outlets/{id}/power` - Get power consumption
  - Historical power data
  - Energy cost calculations
  - Equipment runtime tracking

## Lighting Service

### 12. Lighting Programs
- **Current State**: Basic control
- **Proposed**: Advanced lighting programs
- **Use Case**: Coral growth optimization, natural lighting simulation
- **Implementation**:
  - `POST /api/lighting/programs` - Create lighting programs
  - Sunrise/sunset simulation
  - Weather-based adjustments
  - Multiple channel coordination

### 13. Lighting History
- **Current State**: Current state only
- **Proposed**: Lighting history and analytics
- **Use Case**: Track lighting patterns, optimize for coral growth
- **Implementation**:
  - `GET /api/lighting/history` - Get lighting history
  - PAR value tracking
  - Growth correlation data

## Flow Service

### 14. Flow Rate Monitoring
- **Current State**: Basic control
- **Proposed**: Flow rate monitoring and control
- **Use Case**: Optimize water flow, detect pump issues
- **Implementation**:
  - `GET /api/flow/rate` - Get current flow rates
  - Flow rate history
  - Pump efficiency monitoring
  - Leak detection

### 15. Flow Scheduling
- **Current State**: Manual control
- **Proposed**: Automated flow patterns
- **Use Case**: Simulate natural currents, feed mode
- **Implementation**:
  - Variable flow patterns
  - Feed mode (reduced flow)
  - Wave simulation

## Telemetry Service

### 16. Data Aggregation
- **Current State**: Individual service data
- **Proposed**: Centralized telemetry and analytics
- **Use Case**: System-wide insights, performance optimization
- **Implementation**:
  - `GET /api/telemetry/dashboard` - Aggregated system data
  - Cross-service correlations
  - Performance metrics
  - Health scoring

### 17. Data Export
- **Current State**: No export functionality
- **Proposed**: Data export capabilities
- **Use Case**: Backup, analysis, reporting
- **Implementation**:
  - `GET /api/telemetry/export` - Export data
  - CSV, JSON formats
  - Date range selection
  - Service-specific exports

## Authentication & Security

### 18. User Management
- **Current State**: Single user (bellas/reefrocks)
- **Proposed**: Multi-user system with roles
- **Use Case**: Family access, professional monitoring
- **Implementation**:
  - `POST /api/users` - Create users
  - Role-based access control
  - Admin vs user permissions
  - User activity logging

### 19. API Rate Limiting
- **Current State**: No rate limiting
- **Proposed**: API rate limiting
- **Use Case**: Prevent abuse, ensure system stability
- **Implementation**:
  - Per-endpoint rate limits
  - Per-user rate limits
  - Rate limit headers in responses

## WebSocket Enhancements

### 20. Real-time Notifications
- **Current State**: Basic WebSocket connection
- **Proposed**: Comprehensive real-time system
- **Use Case**: Live updates, instant notifications
- **Implementation**:
  - Service status changes
  - Alert notifications
  - Real-time sensor data
  - System events

### 21. WebSocket Authentication
- **Current State**: Basic token-based auth
- **Proposed**: Secure WebSocket authentication
- **Use Case**: Prevent unauthorized access
- **Implementation**:
  - Token validation on connection
  - Connection timeout handling
  - Reconnection with token refresh

## Data Management

### 22. Database Integration
- **Current State**: In-memory/JSON storage
- **Proposed**: Proper database backend
- **Use Case**: Data persistence, scalability
- **Implementation**:
  - SQLite for embedded deployment
  - PostgreSQL for larger deployments
  - Data migration tools
  - Backup/restore functionality

### 23. Configuration Management
- **Current State**: Hardcoded configs
- **Proposed**: Centralized configuration
- **Use Case**: Easy system configuration, deployment flexibility
- **Implementation**:
  - `GET/PUT /api/config` - System configuration
  - Environment-specific configs
  - Configuration validation
  - Hot reload capability

## Monitoring & Maintenance

### 24. System Health Scoring
- **Current State**: Basic health checks
- **Proposed**: Comprehensive health scoring
- **Use Case**: Proactive maintenance, system optimization
- **Implementation**:
  - Weighted health metrics
  - Trend analysis
  - Maintenance recommendations
  - Performance optimization suggestions

### 25. Automated Maintenance
- **Current State**: Manual maintenance
- **Proposed**: Automated maintenance tasks
- **Use Case**: Reduce manual intervention, prevent issues
- **Implementation**:
  - Log rotation
  - Data cleanup
  - Service restart on failure
  - Health check scheduling

## Future Considerations

### 26. Mobile App Support
- **Current State**: Web-only interface
- **Proposed**: Mobile app backend support
- **Use Case**: Remote monitoring, push notifications
- **Implementation**:
  - Mobile-optimized API endpoints
  - Push notification service
  - Offline data sync
  - Mobile-specific features

### 27. Cloud Integration
- **Current State**: Local-only system
- **Proposed**: Optional cloud integration
- **Use Case**: Remote access, data backup, professional monitoring
- **Implementation**:
  - Cloud data sync
  - Remote access API
  - Professional monitoring dashboard
  - Data analytics platform

### 28. Third-party Integrations
- **Current State**: Standalone system
- **Proposed**: API for third-party integrations
- **Use Case**: Home automation, professional monitoring
- **Implementation**:
  - Webhook support
  - REST API for external access
  - Integration documentation
  - Developer portal

---

## Priority Ranking

### High Priority (Immediate)
1. System reboot endpoint
2. System usage temperature
3. Probe configuration persistence
4. WebSocket authentication improvements

### Medium Priority (Next Phase)
5. Temperature history/logging
6. System alerts/notifications
7. HAL channel configuration
8. Outlet scheduling

### Low Priority (Future)
9. User management
10. Database integration
11. Cloud integration
12. Mobile app support

---

*Last Updated: [Current Date]*
*Status: Planning Phase* 