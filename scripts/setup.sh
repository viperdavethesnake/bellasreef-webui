#!/bin/bash

# Bella's Reef Web UI - Setup Script
# This script sets up the development environment

set -e  # Exit on any error

echo "🐠 Bella's Reef Web UI - Setup Script"
echo "====================================="

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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        echo "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed successfully"
}

# Create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Bella's Reef Web UI Environment Configuration

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
EOF
        print_success "Environment file created (.env)"
    else
        print_warning "Environment file already exists (.env)"
    fi
}

# Create logs directory
setup_logs() {
    print_status "Setting up logs directory..."
    
    mkdir -p logs
    touch logs/app.log
    touch logs/error.log
    
    print_success "Logs directory created"
}

# Setup Git hooks (optional)
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    if [ -d ".git" ]; then
        mkdir -p .git/hooks
        
        # Pre-commit hook for linting
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues before committing."
    exit 1
fi
echo "Pre-commit checks passed!"
EOF
        chmod +x .git/hooks/pre-commit
        
        print_success "Git hooks configured"
    else
        print_warning "Not a Git repository, skipping Git hooks"
    fi
}

# Test backend connectivity
test_backend() {
    print_status "Testing backend connectivity..."
    
    if command -v curl &> /dev/null; then
        if curl -s http://192.168.33.126:8000/health > /dev/null; then
            print_success "Backend is reachable"
        else
            print_warning "Backend is not reachable. Make sure the Bella's Reef system is running."
        fi
    else
        print_warning "curl not available, skipping backend test"
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start development server: npm run dev"
    echo "2. Open browser to: http://localhost:3000"
    echo "3. Login with: bellas / reefrocks"
    echo ""
    echo "Available commands:"
    echo "  npm run dev      - Start development server"
    echo "  npm run build    - Build for production"
    echo "  npm run preview  - Preview production build"
    echo "  npm run lint     - Run linting"
    echo "  npm run type-check - Run TypeScript checks"
    echo ""
    echo "For deployment on Raspberry Pi, see DEPLOYMENT.md"
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo ""
    
    check_node
    check_npm
    install_dependencies
    setup_environment
    setup_logs
    setup_git_hooks
    test_backend
    
    show_next_steps
}

# Run main function
main "$@" 