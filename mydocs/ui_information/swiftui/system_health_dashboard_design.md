# System Health Dashboard UI/UX Design

## Overview

The System Health Dashboard provides a comprehensive overview of the Bella's Reef system status, monitoring all services and displaying system information. This dashboard serves as a central monitoring hub within the Settings tab, giving users immediate visibility into system health, service status, and performance metrics.

## Design System

### Color Palette
- **Primary Blue**: `#007AFF` - Main actions, healthy status
- **Success Green**: `#34C759` - Operational services, good health
- **Warning Orange**: `#FF9500` - Degraded performance, warnings
- **Error Red**: `#FF3B30` - Failed services, critical issues
- **Neutral Gray**: `#8E8E93` - Disabled states, secondary text
- **Background**: `#F2F2F7` - Screen backgrounds
- **Card Background**: `#FFFFFF` - Card and modal backgrounds
- **System Blue**: `#5AC8FA` - System information highlights

### Typography
- **Title**: SF Pro Display, 28pt, Bold
- **Section Header**: SF Pro Display, 22pt, Semibold
- **Body**: SF Pro Text, 17pt, Regular
- **Caption**: SF Pro Text, 13pt, Regular
- **Metric**: SF Pro Display, 24pt, Bold
- **Status**: SF Pro Text, 15pt, Semibold

### Icons
- **Health**: `heart.fill` - Overall system health
- **Server**: `server.rack` - Core service
- **Lightbulb**: `lightbulb.fill` - Lighting service
- **Thermometer**: `thermometer` - Temperature service
- **Outlet**: `poweroutlet.type.b` - Smart outlets service
- **Controller**: `cpu` - HAL service
- **Checkmark**: `checkmark.circle.fill` - Healthy status
- **Exclamation**: `exclamationmark.triangle.fill` - Warning status
- **X Mark**: `xmark.circle.fill` - Error status
- **Refresh**: `arrow.clockwise` - Refresh data
- **Info**: `info.circle` - Information details

## Dashboard Design

### Main Dashboard Screen

```swift
struct SystemHealthDashboardView: View {
    @StateObject private var viewModel = SystemHealthDashboardViewModel()
    @State private var showingRefresh = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Overall System Status
                    OverallSystemStatusCard(viewModel: viewModel)
                    
                    // Services Status Grid
                    ServicesStatusGrid(viewModel: viewModel)
                    
                    // System Information
                    SystemInformationCard(viewModel: viewModel)
                    
                    // Performance Metrics
                    PerformanceMetricsCard(viewModel: viewModel)
                    
                    // Recent Activity
                    RecentActivityCard(viewModel: viewModel)
                }
                .padding()
            }
            .navigationTitle("System Health")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingRefresh = true
                        Task {
                            await viewModel.refreshAllData()
                            showingRefresh = false
                        }
                    }) {
                        Image(systemName: "arrow.clockwise")
                            .rotationEffect(.degrees(showingRefresh ? 360 : 0))
                            .animation(.linear(duration: 1).repeatForever(autoreverses: false), value: showingRefresh)
                    }
                    .disabled(showingRefresh)
                }
            }
            .refreshable {
                await viewModel.refreshAllData()
            }
        }
        .onAppear {
            Task {
                await viewModel.loadDashboardData()
            }
        }
    }
}

struct OverallSystemStatusCard: View {
    @ObservedObject var viewModel: SystemHealthDashboardViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "heart.fill")
                    .foregroundColor(viewModel.overallHealthColor)
                    .font(.title2)
                
                Text("System Health")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Text(viewModel.overallHealthStatus)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(viewModel.overallHealthColor)
            }
            
            // Health Progress Bar
            ProgressView(value: viewModel.overallHealthPercentage)
                .progressViewStyle(LinearProgressViewStyle(tint: viewModel.overallHealthColor))
                .scaleEffect(y: 2)
            
            // Quick Stats
            HStack(spacing: 20) {
                HealthStatView(
                    title: "Services",
                    value: "\(viewModel.healthyServicesCount)/\(viewModel.totalServicesCount)",
                    color: .green
                )
                
                HealthStatView(
                    title: "Uptime",
                    value: viewModel.systemUptime,
                    color: .blue
                )
                
                HealthStatView(
                    title: "Last Check",
                    value: viewModel.lastCheckTime,
                    color: .secondary
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct ServicesStatusGrid: View {
    @ObservedObject var viewModel: SystemHealthDashboardViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Services Status")
                .font(.headline)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(viewModel.services) { service in
                    ServiceStatusCard(service: service)
                }
            }
        }
    }
}

struct ServiceStatusCard: View {
    let service: ServiceStatus
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: service.iconName)
                    .foregroundColor(service.statusColor)
                    .font(.title2)
                
                Spacer()
                
                Image(systemName: service.statusIcon)
                    .foregroundColor(service.statusColor)
                    .font(.caption)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(service.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                Text(service.status)
                    .font(.caption)
                    .foregroundColor(service.statusColor)
                
                if let responseTime = service.responseTime {
                    Text("\(responseTime)ms")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 1, x: 0, y: 1)
    }
}

struct SystemInformationCard: View {
    @ObservedObject var viewModel: SystemHealthDashboardViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "info.circle")
                    .foregroundColor(.blue)
                    .font(.title2)
                
                Text("System Information")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            VStack(spacing: 12) {
                InfoRow(title: "Hostname", value: viewModel.systemInfo.hostname)
                InfoRow(title: "Platform", value: viewModel.systemInfo.platform)
                InfoRow(title: "Python Version", value: viewModel.systemInfo.pythonVersion)
                InfoRow(title: "Architecture", value: viewModel.systemInfo.architecture)
                InfoRow(title: "Machine", value: viewModel.systemInfo.machine)
                InfoRow(title: "Processor", value: viewModel.systemInfo.processor)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct PerformanceMetricsCard: View {
    @ObservedObject var viewModel: SystemHealthDashboardViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "chart.bar.fill")
                    .foregroundColor(.orange)
                    .font(.title2)
                
                Text("Performance Metrics")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            VStack(spacing: 16) {
                // CPU Usage
                MetricRow(
                    title: "CPU Usage",
                    value: "\(viewModel.systemUsage.cpuPercent, specifier: "%.1f")%",
                    progress: viewModel.systemUsage.cpuPercent / 100,
                    color: .blue
                )
                
                // Memory Usage
                MetricRow(
                    title: "Memory Usage",
                    value: "\(viewModel.systemUsage.memoryPercent, specifier: "%.1f")%",
                    progress: viewModel.systemUsage.memoryPercent / 100,
                    color: .green
                )
                
                // Disk Usage
                MetricRow(
                    title: "Disk Usage",
                    value: "\(viewModel.systemUsage.diskPercent, specifier: "%.1f")%",
                    progress: viewModel.systemUsage.diskPercent / 100,
                    color: .orange
                )
                
                // Network I/O
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Network I/O")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        Text("↑ \(viewModel.systemUsage.networkBytesSent) / ↓ \(viewModel.systemUsage.networkBytesRecv)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct RecentActivityCard: View {
    @ObservedObject var viewModel: SystemHealthDashboardViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "clock.fill")
                    .foregroundColor(.purple)
                    .font(.title2)
                
                Text("Recent Activity")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            if viewModel.recentActivity.isEmpty {
                Text("No recent activity")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 20)
            } else {
                VStack(spacing: 8) {
                    ForEach(viewModel.recentActivity.prefix(5)) { activity in
                        ActivityRow(activity: activity)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Supporting Views

struct HealthStatView: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

struct InfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
    }
}

struct MetricRow: View {
    let title: String
    let value: String
    let progress: Double
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Spacer()
                
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(color)
            }
            
            ProgressView(value: progress)
                .progressViewStyle(LinearProgressViewStyle(tint: color))
        }
    }
}

struct ActivityRow: View {
    let activity: SystemActivity
    
    var body: some View {
        HStack {
            Image(systemName: activity.iconName)
                .foregroundColor(activity.color)
                .font(.caption)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(activity.description)
                    .font(.subheadline)
                
                Text(activity.timestamp, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}
```

## Data Models

```swift
// MARK: - System Health Models
struct SystemHealthDashboard: Codable {
    let overallHealth: HealthStatus
    let services: [ServiceStatus]
    let systemInfo: SystemInfo
    let systemUsage: SystemUsage
    let recentActivity: [SystemActivity]
    let lastUpdated: Date
}

enum HealthStatus: String, CaseIterable, Codable {
    case healthy = "Healthy"
    case degraded = "Degraded"
    case critical = "Critical"
    case unknown = "Unknown"
    
    var color: Color {
        switch self {
        case .healthy: return .green
        case .degraded: return .orange
        case .critical: return .red
        case .unknown: return .gray
        }
    }
    
    var icon: String {
        switch self {
        case .healthy: return "checkmark.circle.fill"
        case .degraded: return "exclamationmark.triangle.fill"
        case .critical: return "xmark.circle.fill"
        case .unknown: return "questionmark.circle.fill"
        }
    }
}

struct ServiceStatus: Identifiable, Codable {
    let id = UUID()
    let name: String
    let status: HealthStatus
    let responseTime: Int?
    let port: Int
    let lastCheck: Date
    let errorMessage: String?
    
    var statusColor: Color {
        status.color
    }
    
    var statusIcon: String {
        status.icon
    }
    
    var iconName: String {
        switch name.lowercased() {
        case let s where s.contains("core"): return "server.rack"
        case let s where s.contains("lighting"): return "lightbulb.fill"
        case let s where s.contains("temperature"): return "thermometer"
        case let s where s.contains("smartoutlets"): return "poweroutlet.type.b"
        case let s where s.contains("hal"): return "cpu"
        default: return "network"
        }
    }
}

struct SystemInfo: Codable {
    let hostname: String
    let platform: String
    let pythonVersion: String
    let architecture: String
    let machine: String
    let processor: String
}

struct SystemUsage: Codable {
    let cpuPercent: Double
    let memoryPercent: Double
    let diskPercent: Double
    let networkBytesSent: String
    let networkBytesRecv: String
    let uptime: String
}

struct SystemActivity: Identifiable, Codable {
    let id = UUID()
    let description: String
    let timestamp: Date
    let type: ActivityType
    let severity: ActivitySeverity
    
    var color: Color {
        switch severity {
        case .info: return .blue
        case .warning: return .orange
        case .error: return .red
        }
    }
    
    var iconName: String {
        switch type {
        case .serviceStart: return "play.circle.fill"
        case .serviceStop: return "stop.circle.fill"
        case .serviceError: return "exclamationmark.triangle.fill"
        case .systemUpdate: return "arrow.up.circle.fill"
        case .userAction: return "person.circle.fill"
        }
    }
}

enum ActivityType: String, Codable {
    case serviceStart = "Service Start"
    case serviceStop = "Service Stop"
    case serviceError = "Service Error"
    case systemUpdate = "System Update"
    case userAction = "User Action"
}

enum ActivitySeverity: String, Codable {
    case info = "Info"
    case warning = "Warning"
    case error = "Error"
}
```

## View Model

```swift
class SystemHealthDashboardViewModel: ObservableObject {
    @Published var services: [ServiceStatus] = []
    @Published var systemInfo: SystemInfo = SystemInfo(
        hostname: "",
        platform: "",
        pythonVersion: "",
        architecture: "",
        machine: "",
        processor: ""
    )
    @Published var systemUsage: SystemUsage = SystemUsage(
        cpuPercent: 0,
        memoryPercent: 0,
        diskPercent: 0,
        networkBytesSent: "0 B",
        networkBytesRecv: "0 B",
        uptime: "0s"
    )
    @Published var recentActivity: [SystemActivity] = []
    @Published var isLoading: Bool = false
    @Published var lastUpdated: Date = Date()
    
    private let healthManager = SystemHealthManager()
    
    // Computed Properties
    var overallHealthStatus: String {
        let healthyCount = services.filter { $0.status == .healthy }.count
        let totalCount = services.count
        
        if totalCount == 0 { return "Unknown" }
        
        let healthPercentage = Double(healthyCount) / Double(totalCount)
        
        switch healthPercentage {
        case 1.0: return "Healthy"
        case 0.8..<1.0: return "Degraded"
        default: return "Critical"
        }
    }
    
    var overallHealthColor: Color {
        switch overallHealthStatus {
        case "Healthy": return .green
        case "Degraded": return .orange
        case "Critical": return .red
        default: return .gray
        }
    }
    
    var overallHealthPercentage: Double {
        let healthyCount = services.filter { $0.status == .healthy }.count
        let totalCount = services.count
        
        if totalCount == 0 { return 0 }
        return Double(healthyCount) / Double(totalCount)
    }
    
    var healthyServicesCount: Int {
        services.filter { $0.status == .healthy }.count
    }
    
    var totalServicesCount: Int {
        services.count
    }
    
    var systemUptime: String {
        systemUsage.uptime
    }
    
    var lastCheckTime: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: lastUpdated, relativeTo: Date())
    }
    
    // MARK: - Data Loading
    @MainActor
    func loadDashboardData() async {
        isLoading = true
        
        do {
            let dashboard = try await healthManager.getDashboardData()
            
            self.services = dashboard.services
            self.systemInfo = dashboard.systemInfo
            self.systemUsage = dashboard.systemUsage
            self.recentActivity = dashboard.recentActivity
            self.lastUpdated = dashboard.lastUpdated
            
        } catch {
            print("Error loading dashboard data: \(error)")
            // Handle error appropriately
        }
        
        isLoading = false
    }
    
    @MainActor
    func refreshAllData() async {
        await loadDashboardData()
    }
}
```

## Health Manager

```swift
class SystemHealthManager {
    private let baseURL = "http://192.168.33.126"
    private let networkManager = AuthenticatedNetworkManager.shared
    
    // Service ports
    private let servicePorts = [
        "Core": 8000,
        "Lighting": 8001,
        "HAL": 8003,
        "Temperature": 8004,
        "SmartOutlets": 8005
    ]
    
    func getDashboardData() async throws -> SystemHealthDashboard {
        async let servicesStatus = checkAllServices()
        async let systemInfo = getSystemInfo()
        async let systemUsage = getSystemUsage()
        async let recentActivity = getRecentActivity()
        
        let (services, info, usage, activity) = await (servicesStatus, systemInfo, systemUsage, recentActivity)
        
        let overallHealth = calculateOverallHealth(services)
        
        return SystemHealthDashboard(
            overallHealth: overallHealth,
            services: services,
            systemInfo: info,
            systemUsage: usage,
            recentActivity: activity,
            lastUpdated: Date()
        )
    }
    
    private func checkAllServices() async -> [ServiceStatus] {
        var services: [ServiceStatus] = []
        
        for (name, port) in servicePorts {
            let status = await checkServiceHealth(name: name, port: port)
            services.append(status)
        }
        
        return services
    }
    
    private func checkServiceHealth(name: String, port: Int) async -> ServiceStatus {
        let startTime = Date()
        
        do {
            let url = URL(string: "\(baseURL):\(port)/health")!
            let (_, response) = try await URLSession.shared.data(from: url)
            
            let endTime = Date()
            let responseTime = Int(endTime.timeIntervalSince(startTime) * 1000)
            
            if let httpResponse = response as? HTTPURLResponse {
                let isHealthy = httpResponse.statusCode == 200
                
                return ServiceStatus(
                    name: name,
                    status: isHealthy ? .healthy : .critical,
                    responseTime: responseTime,
                    port: port,
                    lastCheck: Date(),
                    errorMessage: isHealthy ? nil : "HTTP \(httpResponse.statusCode)"
                )
            } else {
                return ServiceStatus(
                    name: name,
                    status: .critical,
                    responseTime: nil,
                    port: port,
                    lastCheck: Date(),
                    errorMessage: "Invalid response"
                )
            }
        } catch {
            return ServiceStatus(
                name: name,
                status: .critical,
                responseTime: nil,
                port: port,
                lastCheck: Date(),
                errorMessage: error.localizedDescription
            )
        }
    }
    
    private func getSystemInfo() async throws -> SystemInfo {
        let url = URL(string: "\(baseURL):8000/api/system/info")!
        let (data, _) = try await networkManager.authenticatedRequest(url: url)
        
        return try JSONDecoder().decode(SystemInfo.self, from: data)
    }
    
    private func getSystemUsage() async throws -> SystemUsage {
        let url = URL(string: "\(baseURL):8000/api/system/usage")!
        let (data, _) = try await networkManager.authenticatedRequest(url: url)
        
        return try JSONDecoder().decode(SystemUsage.self, from: data)
    }
    
    private func getRecentActivity() async -> [SystemActivity] {
        // This would typically come from a logging system
        // For now, we'll generate some sample activity
        return generateSampleActivity()
    }
    
    private func calculateOverallHealth(_ services: [ServiceStatus]) -> HealthStatus {
        let healthyCount = services.filter { $0.status == .healthy }.count
        let totalCount = services.count
        
        if totalCount == 0 { return .unknown }
        
        let healthPercentage = Double(healthyCount) / Double(totalCount)
        
        switch healthPercentage {
        case 1.0: return .healthy
        case 0.8..<1.0: return .degraded
        default: return .critical
        }
    }
    
    private func generateSampleActivity() -> [SystemActivity] {
        let now = Date()
        return [
            SystemActivity(
                description: "Temperature service restarted",
                timestamp: now.addingTimeInterval(-300),
                type: .serviceStart,
                severity: .info
            ),
            SystemActivity(
                description: "High CPU usage detected",
                timestamp: now.addingTimeInterval(-600),
                type: .serviceError,
                severity: .warning
            ),
            SystemActivity(
                description: "System update completed",
                timestamp: now.addingTimeInterval(-1800),
                type: .systemUpdate,
                severity: .info
            )
        ]
    }
}
```

## Integration with Settings

```swift
// Add to Settings Tab
struct SettingsView: View {
    var body: some View {
        NavigationView {
            List {
                // Existing sections...
                
                // System Health Section
                Section(header: Text("System")) {
                    NavigationLink(destination: SystemHealthDashboardView()) {
                        HStack {
                            Image(systemName: "heart.fill")
                                .foregroundColor(.green)
                                .frame(width: 24)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("System Health")
                                    .font(.headline)
                                Text("Monitor all services and system status")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                        }
                        .padding(.vertical, 4)
                    }
                }
                
                // Other sections...
            }
            .navigationTitle("Settings")
        }
    }
}
```

## User Experience Flow

### Dashboard Overview
1. **Quick Status Check**: User sees overall system health at a glance
2. **Service Monitoring**: Individual service status with response times
3. **System Information**: Host details and platform information
4. **Performance Metrics**: CPU, memory, and disk usage
5. **Recent Activity**: System events and user actions

### Real-time Updates
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Manual refresh**: Pull-to-refresh and refresh button
- **Visual feedback**: Loading states and progress indicators
- **Error handling**: Graceful failure with retry options

### Navigation
- **Settings Tab**: Accessible from main settings screen
- **Quick Access**: Prominent placement for system monitoring
- **Detailed Views**: Tap services for detailed status information

## Accessibility Features

- **VoiceOver Support**: All status indicators and metrics are properly labeled
- **Dynamic Type**: Text scales with system font size settings
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects system motion preferences
- **Color Blind Support**: Status indicators use both color and shape

## Implementation Checklist

### Dashboard Core
- [ ] Overall system health calculation
- [ ] Service status monitoring
- [ ] System information display
- [ ] Performance metrics visualization
- [ ] Recent activity tracking
- [ ] Real-time data updates

### Service Monitoring
- [ ] Health endpoint checking for all services
- [ ] Response time measurement
- [ ] Error status handling
- [ ] Service-specific icons and colors
- [ ] Detailed service information

### System Information
- [ ] Host information display
- [ ] Platform details
- [ ] System usage metrics
- [ ] Performance visualization
- [ ] Uptime tracking

### User Interface
- [ ] Clean, organized dashboard layout
- [ ] Status cards with visual indicators
- [ ] Progress bars for metrics
- [ ] Refresh functionality
- [ ] Loading states and animations

### Data Management
- [ ] Efficient API calls
- [ ] Caching for performance
- [ ] Error handling and retry logic
- [ ] Background refresh scheduling
- [ ] Offline status indicators

### Testing
- [ ] Unit tests for health calculations
- [ ] Integration tests for API calls
- [ ] UI tests for dashboard interactions
- [ ] Network condition testing
- [ ] Error scenario testing 