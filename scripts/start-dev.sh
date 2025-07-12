#!/bin/bash

# Bella's Reef Web UI - Development Startup Script
# This script starts the development server with proper configuration

set -e  # Exit on any error

echo "🐠 Bella's Reef Web UI - Development Server"
echo "==========================================="

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
        print_warning "Dependencies not installed. Running setup..."
        ./scripts/setup.sh
    else
        print_success "Dependencies are installed"
    fi
}

# Check backend connectivity
check_backend() {
    print_status "Checking backend connectivity..."
    
    if command -v curl &> /dev/null; then
        if curl -s --max-time 5 http://192.168.33.126:8000/health > /dev/null; then
            print_success "Backend is reachable"
        else
            print_warning "Backend is not reachable. The app will still work but API calls will fail."
            echo "Make sure the Bella's Reef system is running at 192.168.33.126:8000"
        fi
    else
        print_warning "curl not available, skipping backend check"
    fi
}

# Set environment variables
set_environment() {
    print_status "Setting up environment..."
    
    # Export environment variables
    export VITE_API_BASE_URL=${VITE_API_BASE_URL:-"http://192.168.33.126:8000"}
    export VITE_WS_BASE_URL=${VITE_WS_BASE_URL:-"ws://192.168.33.126:8000"}
    export VITE_DEV_MODE=${VITE_DEV_MODE:-"true"}
    export VITE_ENABLE_LOGGING=${VITE_ENABLE_LOGGING:-"true"}
    
    print_success "Environment configured"
}

# Start development server
start_dev_server() {
    print_status "Starting development server..."
    
    echo ""
    echo "🚀 Starting Bella's Reef Web UI development server..."
    echo "📍 URL: http://localhost:3000"
    echo "🔗 Backend: $VITE_API_BASE_URL"
    echo "🔐 Login: bellas / reefrocks"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    # Start the development server
    npm run dev
}

# Cleanup function
cleanup() {
    echo ""
    print_status "Shutting down development server..."
    print_success "Development server stopped"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Main function
main() {
    check_directory
    check_dependencies
    check_backend
    set_environment
    start_dev_server
}

# Run main function
main "$@" 