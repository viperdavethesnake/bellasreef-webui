# Bella's Reef Web UI - Raspberry Pi Deployment Guide

## 🍓 Target Environment
- **Hardware**: Raspberry Pi 4/5 (recommended 8GB RAM)
- **OS**: Debian 12 (Bookworm) or Ubuntu 22.04 LTS
- **Kernel**: 6.8+ (modern kernel for best performance)
- **Architecture**: ARM64 (aarch64)
- **Backend**: Existing API server running on Pi5
- **Frontend**: This web UI project (deployed separately)

## 📦 Prerequisites

### Install Node.js 20+ (Latest LTS)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 20.x.x
npm --version   # Should be 10.x.x
```

### Install Build Dependencies
```bash
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  python3 \
  git \
  curl \
  wget \
  htop \
  nginx \
  certbot \
  python3-certbot-nginx
```

### Install PM2 for Process Management
```bash
sudo npm install -g pm2
```

## 🚀 Deployment Steps

### 1. Clone Repository
```bash
cd /home/pi
git clone https://github.com/viperdavethesnake/bellasreef-webui.git
cd bellasreef-webui
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build for Production
```bash
npm run build
```

### 4. Configure PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bellasreef-webui',
    script: 'npm',
    args: 'run preview',
    cwd: '/home/pi/bellasreef-webui',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start the application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configure Nginx (Optional)
```bash
sudo tee /etc/nginx/sites-available/bellasreef << 'EOF'
server {
    listen 80;
    server_name your-pi-ip-or-domain;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/bellasreef /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 Development Workflow

### Option A: Mac Development + Pi Deployment (Recommended)
```bash
# On Mac (development)
git clone https://github.com/viperdavethesnake/bellasreef-webui.git
cd bellasreef-webui
npm run dev
# Test against Pi5 API at http://pi5-ip:8000

# On Pi (deployment)
cd /home/pi/bellasreef-webui
git pull origin main
npm run pi:build
pm2 restart bellasreef-webui
```

### Option B: Pi Development (Alternative)
```bash
# On Pi
cd /home/pi/bellasreef-webui
npm run pi:dev  # Development server
# Access at http://pi-ip:3000
```

## 🔌 API Integration

### Backend Connection
```bash
# Update API configuration in src/config/api.ts
# Set your Pi5 IP address and API port
# Default: http://192.168.1.100:8000
```

### Testing API Connection
```bash
# Test backend connectivity
curl http://pi5-ip:8000/api/system/status
```

## 📊 Monitoring

### System Resources
```bash
# Monitor Pi performance
htop
pm2 monit
```

### Logs
```bash
# Application logs
pm2 logs bellasreef-webui

# System logs
sudo journalctl -f
```

## 🔒 Security Considerations

### Firewall Setup
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 3000/tcp   # Development
sudo ufw enable
```

### SSL Certificate (Optional)
```bash
sudo certbot --nginx -d your-domain.com
```

## 🚀 Performance Optimization

### Pi-specific Optimizations
```bash
# Increase swap for builds
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Optimize for ARM
export NODE_OPTIONS="--max-old-space-size=2048"
```

## 📱 Access Methods

### Local Network
- **HTTP**: `http://pi-ip:3000`
- **HTTPS**: `https://pi-ip` (with nginx)

### Remote Access
- **VPN**: Set up WireGuard or OpenVPN
- **SSH Tunnel**: `ssh -L 3000:localhost:3000 pi@pi-ip`
- **Reverse Proxy**: Use nginx with SSL

## 🔄 Auto-update Script
```bash
#!/bin/bash
# /home/pi/update-bellasreef.sh
cd /home/pi/bellasreef-webui
git pull origin main
npm install
npm run build
pm2 restart bellasreef-webui
echo "Bella's Reef updated at $(date)"
```

Make it executable:
```bash
chmod +x /home/pi/update-bellasreef.sh
```

## 📋 Checklist

- [ ] Pi OS updated to latest
- [ ] Node.js 20+ installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Build successful
- [ ] PM2 configured
- [ ] Nginx configured (optional)
- [ ] Firewall configured
- [ ] SSL certificate (optional)
- [ ] Auto-update script created
- [ ] Hardware interfaces enabled
- [ ] Monitoring setup 