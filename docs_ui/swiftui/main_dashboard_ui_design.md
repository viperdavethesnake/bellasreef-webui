# Main Dashboard UI/UX Design (Home Screen)

## Overview

The Main Dashboard serves as the operational control center for daily reef aquarium management. This is the primary home screen that provides quick access to essential functions, real-time status overview, and daily operations - distinct from the technical System Health Dashboard in settings.

**Status**: Ready for Implementation - Primary home screen for daily operations
**Priority**: High - Central hub for all aquarium operations
**Dependencies**: All other systems for status and quick actions

## Design System

### Color Palette
- **Primary Ocean Blue**: `#1E40AF` - Main dashboard elements, primary actions
- **Reef Green**: `#059669` - Healthy status, operational indicators
- **Coral Orange**: `#EA580C` - Attention needed, warnings
- **Deep Purple**: `#7C3AED` - Analytics and data visualization
- **Sunlight Gold**: `#F59E0B` - Lighting and energy indicators
- **Neutral Gray**: `#6B7280` - Secondary information, disabled states
- **Background**: `#F8FAFC` - Clean, light background
- **Card Background**: `#FFFFFF` - Card and modal backgrounds

### Typography
- **Title**: SF Pro Display, 32pt, Bold
- **Section Header**: SF Pro Display, 24pt, Semibold
- **Body**: SF Pro Text, 17pt, Regular
- **Caption**: SF Pro Text, 13pt, Regular
- **Button**: SF Pro Text, 17pt, Semibold
- **Metric**: SF Pro Display, 28pt, Bold

### Icons
- **Dashboard**: `gauge` - Main dashboard overview
- **Quick Actions**: `bolt.fill` - Fast access functions
- **Status**: `circle.fill` - System status indicators
- **Temperature**: `thermometer` - Temperature monitoring
- **Lighting**: `lightbulb.fill` - Lighting control
- **Flow**: `drop.fill` - Water flow management
- **Outlets**: `poweroutlet.type.b.fill` - Smart outlet control
- **Alerts**: `bell.fill` - Notifications and alerts
- **Settings**: `gearshape.fill` - Configuration access

## Main Dashboard Screen

```swift
struct MainDashboardView: View {
    @StateObject private var viewModel = MainDashboardViewModel()
    @State private var showingQuickAction = false
    @State private var selectedQuickAction: QuickAction?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header with System Status
                    SystemStatusHeader(viewModel: viewModel)
                    
                    // Quick Actions Grid
                    QuickActionsGrid(viewModel: viewModel) { action in
                        selectedQuickAction = action
                        showingQuickAction = true
                    }
                    
                    // Real-time Status Cards
                    RealTimeStatusSection(viewModel: viewModel)
                    
                    // Daily Operations
                    DailyOperationsSection(viewModel: viewModel)
                    
                    // Recent Activity
                    if !viewModel.recentActivity.isEmpty {
                        RecentActivitySection(viewModel: viewModel)
                    }
                    
                    // Smart Notifications
                    if !viewModel.smartNotifications.isEmpty {
                        SmartNotificationsSection(viewModel: viewModel)
                    }
                }
                .padding()
            }
            .navigationTitle("Bella's Reef")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { viewModel.refreshDashboard() }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .refreshable {
                await viewModel.refreshDashboard()
            }
        }
        .sheet(isPresented: $showingQuickAction) {
            if let action = selectedQuickAction {
                QuickActionSheet(action: action, viewModel: viewModel)
            }
        }
        .onAppear {
            viewModel.loadDashboard()
        }
    }
}
```

## System Status Header

```swift
struct SystemStatusHeader: View {
    @ObservedObject var viewModel: MainDashboardViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            // Overall System Status
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("System Status")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Text(viewModel.systemStatusMessage)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // Status Indicator
                HStack(spacing: 8) {
                    Circle()
                        .fill(viewModel.systemStatusColor)
                        .frame(width: 12, height: 12)
                    
                    Text(viewModel.systemStatusText)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(viewModel.systemStatusColor)
                }
            }
            
            // Key Metrics Row
            HStack(spacing: 20) {
                MetricView(
                    title: "Avg Temp",
                    value: "\(viewModel.averageTemperature, specifier: "%.1f")°C",
                    trend: viewModel.temperatureTrend,
                    color: .blue
                )
                
                MetricView(
                    title: "Active Devices",
                    value: "\(viewModel.activeDeviceCount)",
                    trend: .stable,
                    color: .green
                )
                
                MetricView(
                    title: "Power Usage",
                    value: "\(viewModel.powerUsage, specifier: "%.1f") kW",
                    trend: viewModel.powerTrend,
                    color: .orange
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
    }
}
```

## Quick Actions Grid

```swift
struct QuickActionsGrid: View {
    @ObservedObject var viewModel: MainDashboardViewModel
    let onActionTapped: (QuickAction) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Quick Actions")
                .font(.title2)
                .fontWeight(.bold)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                ForEach(viewModel.quickActions) { action in
                    QuickActionCard(action: action) {
                        onActionTapped(action)
                    }
                }
            }
        }
    }
}

struct QuickActionCard: View {
    let action: QuickAction
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 12) {
                Image(systemName: action.icon)
                    .font(.title2)
                    .foregroundColor(action.color)
                
                Text(action.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .multilineTextAlignment(.center)
                
                if let subtitle = action.subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
```

## Real-time Status Section

```swift
struct RealTimeStatusSection: View {
    @ObservedObject var viewModel: MainDashboardViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Real-time Status")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                // Temperature Status
                StatusCard(
                    title: "Temperature",
                    icon: "thermometer",
                    color: .blue,
                    status: viewModel.temperatureStatus,
                    details: "\(viewModel.temperatureProbeCount) probes active"
                )
                
                // Lighting Status
                StatusCard(
                    title: "Lighting",
                    icon: "lightbulb.fill",
                    color: .orange,
                    status: viewModel.lightingStatus,
                    details: viewModel.lightingBehaviorName
                )
                
                // Flow Status
                StatusCard(
                    title: "Water Flow",
                    icon: "drop.fill",
                    color: .cyan,
                    status: viewModel.flowStatus,
                    details: "\(viewModel.activePumpCount) pumps running"
                )
                
                // Outlets Status
                StatusCard(
                    title: "Smart Outlets",
                    icon: "poweroutlet.type.b.fill",
                    color: .purple,
                    status: viewModel.outletsStatus,
                    details: "\(viewModel.activeOutletCount) outlets on"
                )
            }
        }
    }
}

struct StatusCard: View {
    let title: String
    let icon: String
    let color: Color
    let status: SystemStatus
    let details: String
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
                .frame(width: 32)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(details)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            HStack(spacing: 4) {
                Circle()
                    .fill(status.color)
                    .frame(width: 8, height: 8)
                
                Text(status.description)
                    .font(.caption)
                    .foregroundColor(status.color)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}
```

## Daily Operations Section

```swift
struct DailyOperationsSection: View {
    @ObservedObject var viewModel: MainDashboardViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Daily Operations")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                // Feeding Schedule
                OperationCard(
                    title: "Feeding Schedule",
                    icon: "clock.fill",
                    color: .green,
                    status: viewModel.feedingStatus,
                    action: "Next: \(viewModel.nextFeedingTime)",
                    onTap: { viewModel.showFeedingSchedule() }
                )
                
                // Water Testing
                OperationCard(
                    title: "Water Testing",
                    icon: "drop.degreesign",
                    color: .blue,
                    status: viewModel.waterTestingStatus,
                    action: "Last: \(viewModel.lastWaterTestDate)",
                    onTap: { viewModel.showWaterTesting() }
                )
                
                // Maintenance
                OperationCard(
                    title: "Maintenance",
                    icon: "wrench.and.screwdriver.fill",
                    color: .orange,
                    status: viewModel.maintenanceStatus,
                    action: "Next: \(viewModel.nextMaintenanceDate)",
                    onTap: { viewModel.showMaintenance() }
                )
                
                // Water Changes
                OperationCard(
                    title: "Water Changes",
                    icon: "arrow.triangle.2.circlepath",
                    color: .purple,
                    status: viewModel.waterChangeStatus,
                    action: "Last: \(viewModel.lastWaterChangeDate)",
                    onTap: { viewModel.showWaterChanges() }
                )
            }
        }
    }
}

struct OperationCard: View {
    let title: String
    let icon: String
    let color: Color
    let status: OperationStatus
    let action: String
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                    .frame(width: 32)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Text(action)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                HStack(spacing: 4) {
                    Circle()
                        .fill(status.color)
                        .frame(width: 8, height: 8)
                    
                    Text(status.description)
                        .font(.caption)
                        .foregroundColor(status.color)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
```

## Recent Activity Section

```swift
struct RecentActivitySection: View {
    @ObservedObject var viewModel: MainDashboardViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Recent Activity")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 8) {
                ForEach(viewModel.recentActivity.prefix(5)) { activity in
                    ActivityRow(activity: activity)
                }
            }
        }
    }
}

struct ActivityRow: View {
    let activity: SystemActivity
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: activity.icon)
                .font(.caption)
                .foregroundColor(activity.color)
                .frame(width: 20)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(activity.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(activity.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(activity.timestamp, style: .relative)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}
```

## Smart Notifications Section

```swift
struct SmartNotificationsSection: View {
    @ObservedObject var viewModel: MainDashboardViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Smart Notifications")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 8) {
                ForEach(viewModel.smartNotifications) { notification in
                    NotificationRow(notification: notification) {
                        viewModel.handleNotification(notification)
                    }
                }
            }
        }
    }
}

struct NotificationRow: View {
    let notification: SmartNotification
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                Image(systemName: notification.icon)
                    .font(.caption)
                    .foregroundColor(notification.color)
                    .frame(width: 20)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(notification.title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Text(notification.message)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                Spacer()
                
                if notification.isUrgent {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundColor(.red)
                        .font(.caption)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(8)
            .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
```

## Data Models

```swift
// MARK: - Quick Action Models
struct QuickAction: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String?
    let icon: String
    let color: Color
    let action: QuickActionType
}

enum QuickActionType {
    case feedMode
    case emergencyStop
    case lightingOverride
    case temperatureCheck
    case systemHealth
    case settings
}

// MARK: - System Status Models
enum SystemStatus: String, Codable {
    case operational = "operational"
    case warning = "warning"
    case error = "error"
    case offline = "offline"
    
    var color: Color {
        switch self {
        case .operational: return .green
        case .warning: return .orange
        case .error: return .red
        case .offline: return .gray
        }
    }
    
    var description: String {
        switch self {
        case .operational: return "Operational"
        case .warning: return "Warning"
        case .error: return "Error"
        case .offline: return "Offline"
        }
    }
}

// MARK: - Operation Status Models
enum OperationStatus: String, Codable {
    case onSchedule = "on_schedule"
    case due = "due"
    case overdue = "overdue"
    case completed = "completed"
    
    var color: Color {
        switch self {
        case .onSchedule: return .green
        case .due: return .orange
        case .overdue: return .red
        case .completed: return .blue
        }
    }
    
    var description: String {
        switch self {
        case .onSchedule: return "On Schedule"
        case .due: return "Due"
        case .overdue: return "Overdue"
        case .completed: return "Completed"
        }
    }
}

// MARK: - Activity Models
struct SystemActivity: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let icon: String
    let color: Color
    let timestamp: Date
}

// MARK: - Notification Models
struct SmartNotification: Identifiable {
    let id = UUID()
    let title: String
    let message: String
    let icon: String
    let color: Color
    let isUrgent: Bool
    let action: NotificationAction
}

enum NotificationAction {
    case viewDetails
    case acknowledge
    case takeAction
}
```

## View Model

```swift
class MainDashboardViewModel: ObservableObject {
    @Published var systemStatus: SystemStatus = .operational
    @Published var averageTemperature: Double = 0
    @Published var activeDeviceCount: Int = 0
    @Published var powerUsage: Double = 0
    @Published var temperatureTrend: TrendDirection = .stable
    @Published var powerTrend: TrendDirection = .stable
    
    // Status
    @Published var temperatureStatus: SystemStatus = .operational
    @Published var lightingStatus: SystemStatus = .operational
    @Published var flowStatus: SystemStatus = .operational
    @Published var outletsStatus: SystemStatus = .operational
    
    // Counts
    @Published var temperatureProbeCount: Int = 0
    @Published var activePumpCount: Int = 0
    @Published var activeOutletCount: Int = 0
    @Published var lightingBehaviorName: String = "No Behavior"
    
    // Operations
    @Published var feedingStatus: OperationStatus = .onSchedule
    @Published var waterTestingStatus: OperationStatus = .onSchedule
    @Published var maintenanceStatus: OperationStatus = .onSchedule
    @Published var waterChangeStatus: OperationStatus = .onSchedule
    
    // Dates
    @Published var nextFeedingTime: String = "Not set"
    @Published var lastWaterTestDate: String = "Never"
    @Published var nextMaintenanceDate: String = "Not scheduled"
    @Published var lastWaterChangeDate: String = "Never"
    
    // Activity and Notifications
    @Published var recentActivity: [SystemActivity] = []
    @Published var smartNotifications: [SmartNotification] = []
    
    // Quick Actions
    @Published var quickActions: [QuickAction] = []
    
    // Computed Properties
    var systemStatusText: String {
        systemStatus.description
    }
    
    var systemStatusColor: Color {
        systemStatus.color
    }
    
    var systemStatusMessage: String {
        switch systemStatus {
        case .operational: return "All systems operational"
        case .warning: return "Some systems need attention"
        case .error: return "Critical issues detected"
        case .offline: return "System offline"
        }
    }
    
    // MARK: - Methods
    func loadDashboard() {
        Task {
            await refreshDashboard()
        }
    }
    
    func refreshDashboard() async {
        // TODO: Load all dashboard data
    }
    
    func showFeedingSchedule() {
        // TODO: Navigate to feeding schedule
    }
    
    func showWaterTesting() {
        // TODO: Navigate to water testing
    }
    
    func showMaintenance() {
        // TODO: Navigate to maintenance
    }
    
    func showWaterChanges() {
        // TODO: Navigate to water changes
    }
    
    func handleNotification(_ notification: SmartNotification) {
        // TODO: Handle notification action
    }
}
```

## Quick Action Sheet

```swift
struct QuickActionSheet: View {
    let action: QuickAction
    @ObservedObject var viewModel: MainDashboardViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Action Header
                VStack(spacing: 12) {
                    Image(systemName: action.icon)
                        .font(.largeTitle)
                        .foregroundColor(action.color)
                    
                    Text(action.title)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    if let subtitle = action.subtitle {
                        Text(subtitle)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding()
                
                // Action Content
                switch action.action {
                case .feedMode:
                    FeedModeQuickView(viewModel: viewModel)
                case .emergencyStop:
                    EmergencyStopQuickView(viewModel: viewModel)
                case .lightingOverride:
                    LightingOverrideQuickView(viewModel: viewModel)
                case .temperatureCheck:
                    TemperatureCheckQuickView(viewModel: viewModel)
                case .systemHealth:
                    SystemHealthQuickView(viewModel: viewModel)
                case .settings:
                    SettingsQuickView(viewModel: viewModel)
                }
                
                Spacer()
            }
            .navigationTitle(action.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}
```

## Implementation Checklist

### Phase 1: Foundation
- [ ] Dashboard layout and navigation
- [ ] System status overview
- [ ] Quick actions grid
- [ ] Real-time status cards
- [ ] Basic data loading

### Phase 2: Operations
- [ ] Daily operations tracking
- [ ] Activity logging
- [ ] Smart notifications
- [ ] Quick action sheets
- [ ] Real-time updates

### Phase 3: Integration
- [ ] Connect to all services
- [ ] Live data streaming
- [ ] Push notifications
- [ ] Offline support
- [ ] Performance optimization

## Notes for Implementation

### Key Features to Implement
1. **Operational Overview**: Daily reef management at a glance
2. **Quick Actions**: Fast access to common operations
3. **Real-time Status**: Live system status monitoring
4. **Daily Operations**: Feeding, testing, maintenance tracking
5. **Smart Notifications**: Intelligent alerts and reminders

### Technical Considerations
- **Real-time Updates**: Live data from all services
- **Performance**: Fast loading and smooth interactions
- **Offline Support**: Cached data when offline
- **Push Notifications**: Smart alerts for important events
- **Data Synchronization**: Keep dashboard current

### User Experience Priorities
1. **Quick Access**: Essential functions one tap away
2. **Clear Status**: Immediate understanding of system health
3. **Daily Operations**: Easy tracking of routine tasks
4. **Smart Alerts**: Relevant notifications without spam
5. **Responsive Design**: Works on all device sizes

This Main Dashboard serves as the central operational hub for daily reef aquarium management, complementing the technical System Health Dashboard in settings. 