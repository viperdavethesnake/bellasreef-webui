#!/bin/bash

# Bella's Reef Web UI - Deployment Script
# This script deploys the application to production

set -e  # Exit on any error

echo "🐠 Bella's Reef Web UI - Deployment Script"
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

# Check Git status
check_git_status() {
    print_status "Checking Git status..."
    
    if [ -d ".git" ]; then
        if [ -n "$(git status --porcelain)" ]; then
            print_warning "You have uncommitted changes. Consider committing them before deployment."
            read -p "Continue with deployment? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_error "Deployment cancelled."
                exit 1
            fi
        fi
        print_success "Git status checked"
    else
        print_warning "Not a Git repository"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed"
}

# Build for production
build_production() {
    print_status "Building for production..."
    
    # Clean previous build
    if [ -d "dist" ]; then
        rm -rf dist
    fi
    
    # Build with Pi-optimized settings
    npm run pi:build
    
    print_success "Production build completed"
}

# Check build output
check_build() {
    print_status "Checking build output..."
    
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not found"
        exit 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        print_error "Build failed - index.html not found"
        exit 1
    fi
    
    print_success "Build output verified"
}

# Setup PM2 ecosystem
setup_pm2() {
    print_status "Setting up PM2 configuration..."
    
    if [ ! -f "ecosystem.config.js" ]; then
        print_error "ecosystem.config.js not found"
        exit 1
    fi
    
    print_success "PM2 configuration ready"
}

# Install PM2 globally if needed
install_pm2() {
    print_status "Checking PM2 installation..."
    
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 not installed. Installing globally..."
        npm install -g pm2
    else
        print_success "PM2 is installed"
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

# Deploy with PM2
deploy_pm2() {
    print_status "Deploying with PM2..."
    
    # Stop existing instance if running
    if pm2 list | grep -q "bellasreef-webui"; then
        print_status "Stopping existing instance..."
        pm2 stop bellasreef-webui
        pm2 delete bellasreef-webui
    fi
    
    # Start new instance
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    print_success "Deployment completed with PM2"
}

# Show deployment status
show_status() {
    echo ""
    print_status "Deployment Status:"
    pm2 status
    echo ""
    
    echo "🚀 Bella's Reef Web UI has been deployed!"
    echo "📍 URL: http://localhost:3000"
    echo "🔗 Backend: http://localhost:8000"
    echo "🔐 Login: bellas / reefrocks"
    echo ""
    echo "Useful Commands:"
    echo "  pm2 status                    - Check app status"
    echo "  pm2 logs bellasreef-webui    - View logs"
    echo "  pm2 restart bellasreef-webui - Restart app"
    echo "  pm2 stop bellasreef-webui    - Stop app"
    echo "  pm2 monit                    - Monitor apps"
    echo ""
}

# Main deployment function
main() {
    check_directory
    check_git_status
    install_dependencies
    build_production
    check_build
    setup_pm2
    install_pm2
    setup_logs
    deploy_pm2
    show_status
}

# Run main function
main "$@" 