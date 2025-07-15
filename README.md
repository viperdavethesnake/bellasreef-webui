# BellasReef Web UI 🐠

A modern React TypeScript web application for managing and monitoring aquarium systems. Built with real-time data visualization, comprehensive probe management, and an intuitive user interface.

![BellasReef Logo](https://img.shields.io/badge/BellasReef-Aquarium%20Management-blue?style=for-the-badge&logo=react)

## 🌟 Features

### 🔐 Authentication & Security
- JWT-based authentication with automatic token refresh
- Protected routes and secure API communication
- Real-time session management

### 📊 Dashboard & Monitoring
- **System Overview**: Real-time health status across all services
- **Temperature Monitoring**: Live probe readings with color-coded alerts
- **Service Status**: Health indicators for all backend services
- **Quick Actions**: System control panel (coming soon)

### 🌡️ Temperature Management
- **Probe Discovery**: Automatic detection of new temperature sensors
- **Probe Registration**: Easy setup with custom naming and roles
- **Real-time Readings**: Live temperature data with configurable units
- **Threshold Alerts**: Color-coded temperature ranges with min/max settings
- **Historical Data**: Temperature trends and monitoring

### ⚙️ Settings & Configuration
- **System Settings**: Service health monitoring and system metrics
- **Temperature Settings**: Complete probe management interface
- **Service Configuration**: Individual service settings and status
- **User Preferences**: Customizable display options

### 📱 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Component Library**: Consistent, reusable UI components
- **Real-time Updates**: WebSocket integration for live data
- **Error Handling**: Graceful error states and user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend services running (see Backend Dependencies)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bellasreef-webui.git
   cd bellasreef-webui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

### Environment Setup

1. **Copy the environment template**
   ```bash
   cp env.example .env
   ```

2. **Customize the settings**
   Edit the `.env` file and adjust the values for your setup:

   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:8000
   VITE_TEMPERATURE_API_URL=http://localhost:8001
   VITE_WEBSOCKET_URL=ws://localhost:8000/ws
   
   # Development
   VITE_DEV_MODE=true
   ```

   See `env.example` for all available configuration options.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Card, Button, etc.)
│   ├── layout/         # Layout components (PageHeader, etc.)
│   └── forms/          # Form components (Input, Select, etc.)
├── pages/              # Application pages
│   ├── Dashboard/      # Main dashboard components
│   ├── Settings/       # Settings pages
│   └── Monitor/        # Monitoring pages
├── services/           # API and service integrations
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles and CSS
```

## 🔧 Backend Dependencies

The web UI integrates with several backend services:

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| Core Service | 8000 | ✅ Available | Authentication, system management |
| Temperature Service | 8001 | ✅ Available | Temperature probe management |
| Smart Outlets | - | ❌ Not implemented | Power outlet control |
| HAL/PWM | - | ❌ Not implemented | PWM device control |
| Lighting | - | ❌ Not implemented | LED lighting control |
| Flow | - | ❌ Not implemented | Water flow control |
| Telemetry | - | ❌ Not implemented | Data collection and reporting |

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Temperature Settings
![Temperature Settings](docs/screenshots/temperature-settings.png)

### Probe Monitor
![Probe Monitor](docs/screenshots/probe-monitor.png)

### System Health
![System Health](docs/screenshots/system-health.png)

*Note: Screenshots will be added as the project develops*

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

### Component Library

The project includes a comprehensive UI component library:

- **Layout**: `PageHeader`, `TabNavigation`, `Card`
- **Forms**: `Input`, `Select`, `Textarea`, `Checkbox`, `Modal`
- **Data Display**: `StatusCard`, `MetricCard`, `Badge`
- **Feedback**: `LoadingSpinner`, `ErrorState`, `SuccessState`

### API Integration

The application uses a service-based architecture for API integration:

```typescript
// Example: Temperature service integration
import { TemperatureService } from '@/services/temperature';

const probes = await TemperatureService.discoverProbes();
const readings = await TemperatureService.getReadings(probeId);
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

Additional documentation is available in the `/mydocs` folder:

- [Backend Ideas](mydocs/backend_ideas.md) - Feature requests and backend improvements
- [Daily Operations PRD](mydocs/daily_ops_activity_prd.md) - Product requirements
- [Development Roadmap](mydocs/development_roadmap.md) - Future development plans
- [API Integration Notes](mydocs/api_integration.md) - Backend integration details

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Some backend services are not yet implemented (see Backend Dependencies)
- WebSocket connections may drop and need reconnection
- Temperature service occasionally returns 500 errors
- Some features are disabled due to missing backend support

## 🚧 Roadmap

### Phase 1: Core Features ✅
- [x] Authentication system
- [x] Dashboard with system overview
- [x] Temperature probe management
- [x] Basic UI component library

### Phase 2: Enhanced Monitoring 📋
- [ ] Real-time data for all services
- [ ] Advanced probe configuration
- [ ] Historical data visualization
- [ ] Alert system

### Phase 3: System Control 📋
- [ ] Smart outlet control
- [ ] PWM device management
- [ ] Lighting control
- [ ] Flow control

### Phase 4: Advanced Features 📋
- [ ] Data export and reporting
- [ ] User management and permissions
- [ ] Mobile app
- [ ] API documentation

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/bellasreef-webui/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/bellasreef-webui/discussions)
- **Email**: support@bellasreef.com

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Development tools: [Vite](https://vitejs.dev/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

---

**Made with ❤️ for aquarium enthusiasts everywhere**

*BellasReef - Making aquarium management simple and beautiful* 