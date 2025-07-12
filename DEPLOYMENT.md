# Bella's Reef Web UI - Deployment Guide

This guide covers deploying the Bella's Reef Web UI to various environments, including Raspberry Pi 5.

## 🚀 Quick Start

### Development (Mac/Linux)
```bash
# Initial setup
npm run setup

# Start development server
npm run start-dev
```

### Production (Raspberry Pi)
```bash
# Deploy to production
npm run deploy

# Start production server
npm run start-prod
```

## 📋 Prerequisites

### Development Environment
- Node.js 18+ 
- npm 9+
- Git

### Production Environment (Raspberry Pi 5)
- Debian/Ubuntu with kernel 6.8+
- Node.js 18+
- npm 9+
- PM2 (installed automatically by scripts)

## 🔧 Setup Scripts

### `scripts/setup.sh`
Initial project setup and environment configuration:
- Checks Node.js and npm versions
- Installs dependencies
- Creates `.env` file with backend configuration
- Sets up logs directory
- Configures Git hooks
- Tests backend connectivity

### `scripts/start-dev.sh`
Development server startup:
- Validates project structure
- Checks dependencies
- Tests backend connectivity
- Sets environment variables
- Starts Vite development server

### `scripts/start-prod.sh`
Production server startup:
- Validates project structure
- Checks dependencies and build
- Installs PM2 if needed
- Tests backend connectivity
- Starts production server with PM2

### `scripts/deploy.sh`
Full deployment process:
- Checks Git status
- Installs dependencies
- Builds for production
- Validates build output
- Deploys with PM2
- Shows deployment status

## 🐠 Backend Configuration

The Web UI connects to the Bella's Reef backend API:

- **Development**: `http://192.168.33.126:8000`
- **Production**: `http://localhost:8000`
- **WebSocket**: `ws://192.168.33.126:8000` (dev) / `ws://localhost:8000` (prod)

### Authentication
- **Username**: `bellas`
- **Password**: `reefrocks`
- **Token Validation**: `GET /api/users/me`
- **Token Refresh**: `POST /api/auth/refresh`

## 🖥️ Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <your-repo-url>
cd bellasreef-webui

# Run setup
npm run setup
```

### 2. Development
```bash
# Start development server
npm run start-dev

# Or use standard Vite command
npm run dev
```

### 3. Building
```bash
# Build for production
npm run build

# Build optimized for Pi
npm run pi:build
```

## 🍓 Raspberry Pi Deployment

### 1. Prepare Pi
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd bellasreef-webui

# Deploy with PM2
npm run deploy
```

### 3. Manage Application
```bash
# Check status
pm2 status

# View logs
pm2 logs bellasreef-webui

# Restart application
pm2 restart bellasreef-webui

# Stop application
pm2 stop bellasreef-webui

# Monitor applications
pm2 monit
```

## 🔧 Configuration

### Environment Variables
Create `.env` file in project root:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://192.168.33.126:8000
VITE_WS_BASE_URL=ws://192.168.33.126:8000

# Development Settings
VITE_DEV_MODE=true
VITE_ENABLE_LOGGING=true

# Authentication Settings
VITE_TOKEN_STORAGE_KEY=bellas_reef_access_token
VITE_REFRESH_TOKEN_STORAGE_KEY=bellas_reef_refresh_token

# Default Credentials (for development only)
VITE_DEFAULT_USERNAME=bellas
VITE_DEFAULT_PASSWORD=reefrocks
```

### PM2 Configuration
The `ecosystem.config.js` file configures PM2 for production:

- **App Name**: `bellasreef-webui`
- **Port**: 3000
- **Auto-restart**: Enabled
- **Memory Limit**: 1GB
- **Logs**: `./logs/`

## 📊 Monitoring

### PM2 Commands
```bash
# Application status
pm2 status

# Real-time monitoring
pm2 monit

# Logs
pm2 logs bellasreef-webui

# Performance metrics
pm2 show bellasreef-webui
```

### Log Files
- **Application Logs**: `./logs/app.log`
- **Error Logs**: `./logs/error.log`
- **Combined Logs**: `./logs/combined.log`

## 🔄 Updates

### Development Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Start development
npm run start-dev
```

### Production Updates
```bash
# Pull latest changes
git pull origin main

# Deploy updates
npm run deploy
```

## 🛠️ Troubleshooting

### Common Issues

#### Backend Connection Failed
```bash
# Check if backend is running
curl http://192.168.33.126:8000/health

# Check network connectivity
ping 192.168.33.126
```

#### PM2 Issues
```bash
# Reset PM2
pm2 kill
pm2 resurrect

# Clear PM2 logs
pm2 flush
```

#### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run pi:build
```

#### Port Conflicts
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

### Performance Optimization

#### For Raspberry Pi
- Use `npm run pi:build` for optimized builds
- Monitor memory usage with `pm2 monit`
- Consider using `--max-old-space-size=1024` for Node.js

#### For Development
- Use `npm run start-dev` for automatic environment setup
- Enable logging with `VITE_ENABLE_LOGGING=true`
- Use browser dev tools for debugging

## 📱 Access

### Development
- **URL**: http://localhost:3000
- **Backend**: http://192.168.33.126:8000
- **Login**: bellas / reefrocks

### Production (Pi)
- **URL**: http://192.168.33.126:3000
- **Backend**: http://localhost:8000
- **Login**: bellas / reefrocks

## 🔐 Security Notes

- Default credentials are for development only
- Change passwords in production
- Use HTTPS in production environments
- Regularly update dependencies
- Monitor logs for security issues

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in `./logs/`
3. Check PM2 status with `pm2 status`
4. Verify backend connectivity
5. Ensure all prerequisites are met 