# API Testing Guide for UI/UX Designers

This guide provides UI/UX designers with the information needed to test and validate API endpoints against the Bella's Reef test server before implementing UI components.

## Test Server Information

- **Server IP**: `192.168.33.126`
- **Authentication**: Username `bellas`, Password `reefrocks`
- **Base URL**: `http://192.168.33.126`

## Available Services

### Core Service (Port 8000)
- **Base URL**: `http://192.168.33.126:8000`
- **Health Check**: `GET /health`
- **Authentication**: `POST /auth/login`
- **User Info**: `GET /users/me`

### Temperature Service (Port 8001)
- **Base URL**: `http://192.168.33.126:8001`
- **Health Check**: `GET /health`
- **Probe Discovery**: `GET /probes/discover`
- **Registered Probes**: `GET /probes`
- **Register Probe**: `POST /probes/register`

### Lighting Service (Port 8002)
- **Base URL**: `http://192.168.33.126:8002`
- **Health Check**: `GET /health`
- **Behaviors**: `GET /behaviors`
- **Effects**: `GET /effects`
- **Override Status**: `GET /override`

### HAL Service (Port 8003)
- **Base URL**: `http://192.168.33.126:8003`
- **Health Check**: `GET /health`
- **Controller Discovery**: `GET /controllers/discover`
- **Registered Controllers**: `GET /controllers`
- **Channel Registration**: `POST /channels/register`

### Smart Outlets Service (Port 8004)
- **Base URL**: `http://192.168.33.126:8004`
- **Health Check**: `GET /health`
- **VeSync Discovery**: `GET /vesync/discover`
- **Kasa Discovery**: `GET /kasa/discover`
- **Shelly Discovery**: `GET /shelly/discover`

## Authentication Flow

### Step 1: Get JWT Token
```bash
curl -X POST http://192.168.33.126:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bellas",
    "password": "reefrocks"
  }'
```

### Step 2: Use Token in Requests
```bash
curl -X GET http://192.168.33.126:8000/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing Tools

### 1. cURL (Command Line)
- **Pros**: Built-in, scriptable, detailed output
- **Cons**: Manual token management, verbose syntax

### 2. Postman
- **Setup**: Import the provided collection
- **Environment Variables**:
  - `base_url`: `http://192.168.33.126`
  - `jwt_token`: (auto-populated from login)
- **Pros**: GUI, environment management, collections
- **Cons**: Requires installation

### 3. Insomnia
- **Setup**: Similar to Postman
- **Pros**: Clean interface, good for REST APIs
- **Cons**: Requires installation

## Testing Checklist for UI Components

### Authentication & Settings
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Token refresh functionality
- [ ] User profile information retrieval
- [ ] Core service URL configuration

### Temperature System
- [ ] Probe discovery (empty state vs. found probes)
- [ ] Probe registration with validation
- [ ] Temperature unit preference (C/F)
- [ ] Real-time temperature readings
- [ ] Error states (network issues, invalid probes)

### Smart Outlets
- [ ] VeSync account verification
- [ ] Kasa network discovery
- [ ] Shelly device discovery
- [ ] Outlet status retrieval
- [ ] Outlet control (on/off/toggle)
- [ ] Error handling for offline devices

### HAL PWM Management
- [ ] Controller discovery
- [ ] Channel registration with validation
- [ ] Device role assignment
- [ ] PWM control testing
- [ ] Ramp function testing
- [ ] Error states for invalid configurations

### System Health Dashboard
- [ ] All service health checks
- [ ] System information retrieval
- [ ] Performance metrics
- [ ] Recent activity logs
- [ ] Error state handling

### Main Dashboard
- [ ] Quick action endpoints
- [ ] Real-time status aggregation
- [ ] Notification endpoints
- [ ] Recent activity retrieval

## Common Response Patterns

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "status": "error",
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

### Authentication Error
```json
{
  "status": "error",
  "error": "Invalid credentials",
  "code": "AUTH_ERROR"
}
```

## Testing Scenarios

### 1. Happy Path Testing
- All services healthy
- Valid authentication
- Normal data flow
- Expected UI states

### 2. Error Path Testing
- Network connectivity issues
- Invalid authentication
- Service downtime
- Invalid data formats
- Timeout scenarios

### 3. Edge Cases
- Empty response arrays
- Large data sets
- Special characters in data
- Rapid successive requests
- Token expiration during operation

## Environment Variables for Testing

Create a `.env` file for your testing environment:
```env
TEST_SERVER_URL=http://192.168.33.126
TEST_USERNAME=bellas
TEST_PASSWORD=reefrocks
CORE_SERVICE_PORT=8000
TEMPERATURE_SERVICE_PORT=8001
LIGHTING_SERVICE_PORT=8002
HAL_SERVICE_PORT=8003
SMART_OUTLETS_SERVICE_PORT=8004
```

## Postman Collection

Import this collection for easy testing:

```json
{
  "info": {
    "name": "Bella's Reef API Testing",
    "description": "API endpoints for Bella's Reef iOS companion app"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://192.168.33.126"
    },
    {
      "key": "jwt_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"bellas\",\n  \"password\": \"reefrocks\"\n}"
            },
            "url": {
              "raw": "{{base_url}}:8000/auth/login",
              "host": ["{{base_url}}"],
              "port": "8000",
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if test server is running
   - Verify IP address and ports
   - Check network connectivity

2. **Authentication Errors**
   - Verify username/password
   - Check token expiration
   - Ensure proper Authorization header format

3. **CORS Issues**
   - Test with Postman/Insomnia instead of browser
   - Check if service supports CORS headers

4. **Timeout Errors**
   - Increase timeout settings in testing tools
   - Check network latency
   - Verify service responsiveness

### Debug Commands

```bash
# Test basic connectivity
ping 192.168.33.126

# Test port connectivity
telnet 192.168.33.126 8000

# Test HTTP response
curl -I http://192.168.33.126:8000/health
```

## Integration with UI Development

### SwiftUI Testing
- Use `URLSession` for API calls
- Implement proper error handling
- Test with real API responses
- Validate UI state management

### Mock Data
- Create mock responses for offline development
- Use realistic data structures
- Test edge cases with mock data

### Error Handling
- Implement proper error states in UI
- Show meaningful error messages
- Provide retry mechanisms
- Handle network timeouts gracefully

## Next Steps

1. **Set up testing environment** with the provided credentials
2. **Import Postman collection** for easy API testing
3. **Test each endpoint** before implementing UI components
4. **Document any discrepancies** between expected and actual responses
5. **Create mock data** based on real API responses
6. **Implement error handling** based on actual error responses

This testing guide ensures that UI/UX designers can validate all API endpoints before implementing UI components, leading to more robust and reliable user interfaces. 