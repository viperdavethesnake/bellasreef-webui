# API Testing Guide for Web UI/UX Designers

This guide provides web UI/UX designers with the information needed to test and validate API endpoints against the Bella's Reef test server before implementing web UI components.

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

### 4. Browser Developer Tools
- **Network Tab**: Monitor API calls
- **Console**: Test JavaScript fetch requests
- **Pros**: Built-in, no installation needed
- **Cons**: Limited to browser environment

### 5. JavaScript/TypeScript Testing
```javascript
// Test authentication
const response = await fetch('http://192.168.33.126:8000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'bellas',
    password: 'reefrocks'
  })
});

const data = await response.json();
console.log('Token:', data.access_token);
```

## Testing Checklist for Web UI Components

### Authentication & Settings
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Token refresh functionality
- [ ] User profile information retrieval
- [ ] Core service URL configuration
- [ ] CORS handling
- [ ] Browser storage for tokens

### Temperature System
- [ ] Probe discovery (empty state vs. found probes)
- [ ] Probe registration with validation
- [ ] Temperature unit preference (C/F)
- [ ] Real-time temperature readings
- [ ] Error states (network issues, invalid probes)
- [ ] Responsive design for mobile/desktop

### Smart Outlets
- [ ] VeSync account verification
- [ ] Kasa network discovery
- [ ] Shelly device discovery
- [ ] Outlet status retrieval
- [ ] Outlet control (on/off/toggle)
- [ ] Error handling for offline devices
- [ ] Touch-friendly controls

### HAL PWM Management
- [ ] Controller discovery
- [ ] Channel registration with validation
- [ ] Device role assignment
- [ ] PWM control testing
- [ ] Ramp function testing
- [ ] Error states for invalid configurations
- [ ] Slider controls for web

### System Health Dashboard
- [ ] All service health checks
- [ ] System information retrieval
- [ ] Performance metrics
- [ ] Recent activity logs
- [ ] Error state handling
- [ ] Real-time updates

### Main Dashboard
- [ ] Quick action endpoints
- [ ] Real-time status aggregation
- [ ] Notification endpoints
- [ ] Recent activity retrieval
- [ ] Responsive grid layout

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

## Web-Specific Testing Scenarios

### 1. Happy Path Testing
- All services healthy
- Valid authentication
- Normal data flow
- Expected UI states
- Cross-browser compatibility

### 2. Error Path Testing
- Network connectivity issues
- Invalid authentication
- Service downtime
- Invalid data formats
- Timeout scenarios
- CORS errors

### 3. Edge Cases
- Empty response arrays
- Large data sets
- Special characters in data
- Rapid successive requests
- Token expiration during operation
- Browser storage limitations

### 4. Web-Specific Considerations
- **CORS**: Cross-origin resource sharing
- **Browser Storage**: localStorage vs sessionStorage
- **Network Tab**: Monitor API calls
- **Console Errors**: JavaScript errors
- **Responsive Design**: Mobile vs desktop
- **Touch Interactions**: Mobile-friendly controls

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

## Postman Collection for Web Testing

Import this collection for easy testing:

```json
{
  "info": {
    "name": "Bella's Reef Web API Testing",
    "description": "API endpoints for Bella's Reef web interface"
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

## JavaScript/TypeScript Testing Examples

### Basic Authentication Test
```javascript
class APITester {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  async login(username, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.token = data.access_token;
        console.log('✅ Login successful');
        return true;
      } else {
        console.log('❌ Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      return false;
    }
  }

  async testEndpoint(endpoint, method = 'GET', body = null) {
    if (!this.token) {
      console.error('❌ No token available');
      return null;
    }

    try {
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      const data = await response.json();
      
      console.log(`✅ ${method} ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ ${method} ${endpoint} failed:`, error);
      return null;
    }
  }
}

// Usage
const tester = new APITester('http://192.168.33.126:8000');
await tester.login('bellas', 'reefrocks');
await tester.testEndpoint('/users/me');
```

### Temperature System Test
```javascript
async function testTemperatureSystem() {
  const tempBaseURL = 'http://192.168.33.126:8001';
  
  // Test health
  await tester.testEndpoint('/health', 'GET', null, tempBaseURL);
  
  // Test probe discovery
  const probes = await tester.testEndpoint('/probes/discover', 'GET', null, tempBaseURL);
  
  // Test registered probes
  const registered = await tester.testEndpoint('/probes', 'GET', null, tempBaseURL);
  
  console.log('Temperature System Test Complete');
}
```

## Troubleshooting

### Common Web Issues

1. **CORS Errors**
   - Check if service supports CORS headers
   - Use Postman/Insomnia for testing
   - Configure proxy in development

2. **Connection Refused**
   - Check if test server is running
   - Verify IP address and ports
   - Check network connectivity

3. **Authentication Errors**
   - Verify username/password
   - Check token expiration
   - Ensure proper Authorization header format

4. **Browser Storage Issues**
   - Check localStorage/sessionStorage availability
   - Handle storage quota exceeded
   - Implement fallback storage

5. **Network Tab Issues**
   - Check for failed requests
   - Verify request headers
   - Check response status codes

### Debug Commands

```bash
# Test basic connectivity
ping 192.168.33.126

# Test port connectivity
telnet 192.168.33.126 8000

# Test HTTP response
curl -I http://192.168.33.126:8000/health

# Test with CORS headers
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -X OPTIONS http://192.168.33.126:8000/health
```

## Integration with Web Development

### React Testing
- Use `fetch` or `axios` for API calls
- Implement proper error handling
- Test with real API responses
- Validate component state management

### Vue.js Testing
- Use `axios` or `fetch` for API calls
- Implement proper error handling
- Test with real API responses
- Validate reactive data management

### Mock Data
- Create mock responses for offline development
- Use realistic data structures
- Test edge cases with mock data
- Implement service workers for offline support

### Error Handling
- Implement proper error states in UI
- Show meaningful error messages
- Provide retry mechanisms
- Handle network timeouts gracefully
- Handle CORS errors appropriately

## Web-Specific Best Practices

### 1. CORS Handling
```javascript
// Handle CORS errors gracefully
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('CORS')) {
      console.error('CORS error - check server configuration');
      // Show user-friendly error message
    }
    throw error;
  }
}
```

### 2. Token Storage
```javascript
// Secure token storage with encryption
class TokenStorage {
  static setToken(token) {
    try {
      // Encrypt token before storing
      const encrypted = btoa(token); // Basic encoding
      localStorage.setItem('bellas_reef_token', encrypted);
    } catch (error) {
      console.error('Token storage failed:', error);
    }
  }

  static getToken() {
    try {
      const encrypted = localStorage.getItem('bellas_reef_token');
      return encrypted ? atob(encrypted) : null;
    } catch (error) {
      console.error('Token retrieval failed:', error);
      return null;
    }
  }
}
```

### 3. Responsive Testing
```javascript
// Test responsive behavior
function testResponsiveDesign() {
  const breakpoints = [
    { width: 320, height: 568, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ];

  breakpoints.forEach(({ width, height, name }) => {
    console.log(`Testing ${name} layout: ${width}x${height}`);
    // Simulate viewport size
    window.innerWidth = width;
    window.innerHeight = height;
    window.dispatchEvent(new Event('resize'));
  });
}
```

## Next Steps

1. **Set up testing environment** with the provided credentials
2. **Import Postman collection** for easy API testing
3. **Test each endpoint** before implementing web UI components
4. **Document any discrepancies** between expected and actual responses
5. **Create mock data** based on real API responses
6. **Implement error handling** based on actual error responses
7. **Test responsive design** across different screen sizes
8. **Validate accessibility** with screen readers and keyboard navigation

This testing guide ensures that web UI/UX designers can validate all API endpoints before implementing web components, leading to more robust and reliable web interfaces that work seamlessly across browsers and devices. 