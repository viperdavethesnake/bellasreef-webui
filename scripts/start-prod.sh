#!/bin/bash

# Bella's Reef Web UI - Production Startup Script
# This script starts the production server with PM2

set -e  # Exit on any error

echo "🐠 Bella's Reef Web UI - Production Server"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
}

# Check if dependencies are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Installing..."
        npm run pi:install
    else
        print_success "Dependencies are installed"
    fi
}

# Check if build exists
check_build() {
    print_status "Checking production build..."
    
    if [ ! -d "dist" ]; then
        print_warning "Production build not found. Building..."
        npm run pi:build
    else
        print_success "Production build exists"
    fi
}

# Check if PM2 is installed
check_pm2() {
    print_status "Checking PM2 installation..."
    
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 not installed. Installing globally..."
        npm install -g pm2
    else
        print_success "PM2 is installed"
    fi
}

# Check backend connectivity
check_backend() {
    print_status "Checking backend connectivity..."
    
    if command -v curl &> /dev/null; then
        if curl -s --max-time 5 http://localhost:8000/health > /dev/null; then
            print_success "Backend is reachable"
        else
            print_warning "Backend is not reachable. Make sure the Bella's Reef system is running."
        fi
    else
        print_warning "curl not available, skipping backend check"
    fi
}

# Create logs directory
setup_logs() {
    print_status "Setting up logs directory..."
    
    mkdir -p logs
    touch logs/app.log
    touch logs/error.log
    
    print_success "Logs directory ready"
}

# Start production server
start_prod_server() {
    print_status "Starting production server with PM2..."
    
    # Check if app is already running
    if pm2 list | grep -q "bellasreef-webui"; then
        print_status "Stopping existing instance..."
        pm2 stop bellasreef-webui
        pm2 delete bellasreef-webui
    fi
    
    # Start the application
    pm2 start ecosystem.config.js
    
    print_success "Production server started with PM2"
    
    echo ""
    echo "🚀 Bella's Reef Web UI is now running!"
    echo "📍 URL: http://localhost:3000"
    echo "🔗 Backend: http://localhost:8000"
    echo "🔐 Login: bellas / reefrocks"
    echo ""
    echo "PM2 Commands:"
    echo "  pm2 status          - Check app status"
    echo "  pm2 logs bellasreef-webui - View logs"
    echo "  pm2 restart bellasreef-webui - Restart app"
    echo "  pm2 stop bellasreef-webui - Stop app"
    echo ""
}

# Show status
show_status() {
    echo ""
    print_status "Application Status:"
    pm2 status
    echo ""
}

# Main function
main() {
    check_directory
    check_dependencies
    check_build
    check_pm2
    check_backend
    setup_logs
    start_prod_server
    show_status
}

# Run main function
main "$@" 