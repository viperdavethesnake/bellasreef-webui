# Flow Management UI/UX Design (WIP - Placeholder)

## Overview

The Flow Management system provides comprehensive control over water flow devices in reef aquariums, including pumps, wavemakers, and circulation systems. This document establishes the UI/UX foundation for future implementation.

**Status**: Work in Progress - Core functionality planned but not yet implemented
**Priority**: Medium - Essential for complete aquarium automation
**Dependencies**: HAL PWM Management, Smart Outlets integration

## Design System

### Color Palette
- **Primary Blue**: `#007AFF` - Main actions, selected states
- **Flow Blue**: `#5AC8FA` - Flow-specific actions and highlights
- **Success Green**: `#34C759` - Connected status, operational
- **Warning Orange**: `#FF9500` - Discovery in progress, pending states
- **Error Red**: `#FF3B30` - Error states, disconnected status
- **Neutral Gray**: `#8E8E93` - Disabled states, secondary text
- **Background**: `#F2F2F7` - Screen backgrounds
- **Card Background**: `#FFFFFF` - Card and modal backgrounds

### Typography
- **Title**: SF Pro Display, 28pt, Bold
- **Section Header**: SF Pro Display, 22pt, Semibold
- **Body**: SF Pro Text, 17pt, Regular
- **Caption**: SF Pro Text, 13pt, Regular
- **Button**: SF Pro Text, 17pt, Semibold

### Icons
- **Flow**: `drop.fill` - Water flow management
- **Pump**: `fan.fill` - Pump devices
- **Wave**: `waveform.path` - Wave patterns
- **Feed**: `clock.fill` - Feeding mode
- **Emergency**: `exclamationmark.triangle.fill` - Emergency controls
- **Settings**: `gearshape.fill` - Configuration
- **Status**: `circle.fill` - Status indicators

## Main Dashboard Integration

### Quick Actions Card
```swift
struct FlowQuickActionsCard: View {
    @StateObject private var viewModel = FlowQuickActionsViewModel()
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "drop.fill")
                    .foregroundColor(.blue)
                    .font(.title2)
                
                Text("Flow Control")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            // Feed Mode Button
            Button(action: { viewModel.startFeedMode() }) {
                HStack {
                    Image(systemName: "clock.fill")
                    Text("Feed Mode")
                    Spacer()
                    Text("15 min")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color.orange.opacity(0.1))
                .cornerRadius(8)
            }
            .disabled(!viewModel.feedModeAvailable)
            
            // Emergency Stop
            Button(action: { viewModel.emergencyStop() }) {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                    Text("Emergency Stop")
                    Spacer()
                }
                .padding()
                .background(Color.red.opacity(0.1))
                .cornerRadius(8)
            }
            .disabled(!viewModel.emergencyStopAvailable)
            
            // Flow Status
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Active Pumps")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(viewModel.activePumpCount)")
                        .font(.headline)
                        .fontWeight(.bold)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Flow Rate")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(viewModel.totalFlowRate, specifier: "%.1f") L/min")
                        .font(.headline)
                        .fontWeight(.semibold)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}
```

## Flow Management Tab

### Main Flow Screen
```swift
struct FlowManagementView: View {
    @StateObject private var viewModel = FlowManagementViewModel()
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab Picker
                Picker("Tab", selection: $selectedTab) {
                    Text("Devices").tag(0)
                    Text("Schedules").tag(1)
                    Text("Feed Mode").tag(2)
                    Text("Profiles").tag(3)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                // Tab Content
                TabView(selection: $selectedTab) {
                    FlowDevicesView(viewModel: viewModel)
                        .tag(0)
                    
                    FlowSchedulesView(viewModel: viewModel)
                        .tag(1)
                    
                    FeedModeView(viewModel: viewModel)
                        .tag(2)
                    
                    FlowProfilesView(viewModel: viewModel)
                        .tag(3)
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            }
            .navigationTitle("Flow Management")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
```

### Devices Tab
```swift
struct FlowDevicesView: View {
    @ObservedObject var viewModel: FlowManagementViewModel
    @State private var showingAddDevice = false
    
    var body: some View {
        List {
            // Device Discovery
            Section(header: Text("Device Discovery")) {
                Button(action: { viewModel.discoverDevices() }) {
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.blue)
                        Text("Discover Flow Devices")
                            .foregroundColor(.blue)
                    }
                }
                
                if viewModel.discoveryInProgress {
                    HStack {
                        ProgressView()
                            .scaleEffect(0.8)
                        Text("Discovering devices...")
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // Discovered Devices
            if !viewModel.discoveredDevices.isEmpty {
                Section(header: Text("Discovered Devices")) {
                    ForEach(viewModel.discoveredDevices) { device in
                        FlowDeviceRow(device: device) {
                            viewModel.registerDevice(device)
                        }
                    }
                }
            }
            
            // Registered Devices
            if !viewModel.registeredDevices.isEmpty {
                Section(header: Text("Registered Devices")) {
                    ForEach(viewModel.registeredDevices) { device in
                        RegisteredFlowDeviceRow(device: device) {
                            viewModel.controlDevice(device)
                        }
                    }
                }
            }
            
            // System Status
            Section(header: Text("System Status")) {
                HStack {
                    Image(systemName: "drop.fill")
                        .foregroundColor(.blue)
                    Text("Total Flow Rate")
                    Spacer()
                    Text("\(viewModel.totalFlowRate, specifier: "%.1f") L/min")
                        .fontWeight(.semibold)
                }
                
                HStack {
                    Image(systemName: "fan.fill")
                        .foregroundColor(.green)
                    Text("Active Pumps")
                    Spacer()
                    Text("\(viewModel.activePumpCount)")
                        .fontWeight(.semibold)
                }
                
                HStack {
                    Image(systemName: "waveform.path")
                        .foregroundColor(.orange)
                    Text("Wave Makers")
                    Spacer()
                    Text("\(viewModel.wavemakerCount)")
                        .fontWeight(.semibold)
                }
            }
        }
        .sheet(isPresented: $showingAddDevice) {
            AddFlowDeviceView(viewModel: viewModel)
        }
    }
}
```

### Feed Mode Tab
```swift
struct FeedModeView: View {
    @ObservedObject var viewModel: FlowManagementViewModel
    @State private var selectedProfile: FlowProfile?
    @State private var duration: Double = 15
    
    var body: some View {
        List {
            // Feed Mode Status
            Section(header: Text("Feed Mode Status")) {
                if viewModel.feedModeActive {
                    HStack {
                        Image(systemName: "clock.fill")
                            .foregroundColor(.orange)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Feed Mode Active")
                                .font(.headline)
                            Text("\(viewModel.feedModeTimeRemaining) remaining")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Button("Stop") {
                            viewModel.stopFeedMode()
                        }
                        .foregroundColor(.red)
                    }
                } else {
                    HStack {
                        Image(systemName: "drop.fill")
                            .foregroundColor(.blue)
                        Text("Feed Mode Inactive")
                            .font(.headline)
                        Spacer()
                    }
                }
            }
            
            // Quick Start
            if !viewModel.feedModeActive {
                Section(header: Text("Quick Start")) {
                    VStack(spacing: 16) {
                        // Duration Slider
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Duration: \(Int(duration)) minutes")
                                .font(.subheadline)
                            Slider(value: $duration, in: 5...30, step: 5)
                                .accentColor(.blue)
                        }
                        
                        // Profile Selection
                        Picker("Profile", selection: $selectedProfile) {
                            Text("Default").tag(nil as FlowProfile?)
                            ForEach(viewModel.feedProfiles) { profile in
                                Text(profile.name).tag(profile as FlowProfile?)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        
                        // Start Button
                        Button(action: {
                            viewModel.startFeedMode(duration: duration, profile: selectedProfile)
                        }) {
                            HStack {
                                Image(systemName: "clock.fill")
                                Text("Start Feed Mode")
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.orange)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        }
                    }
                }
            }
            
            // Feed Profiles
            if !viewModel.feedProfiles.isEmpty {
                Section(header: Text("Feed Profiles")) {
                    ForEach(viewModel.feedProfiles) { profile in
                        FeedProfileRow(profile: profile) {
                            viewModel.editProfile(profile)
                        }
                    }
                }
            }
        }
    }
}
```

## Data Models (Placeholder)

```swift
// MARK: - Flow Device Models
struct FlowDevice: Identifiable, Codable {
    let id = UUID()
    let name: String
    let type: FlowDeviceType
    let ipAddress: String?
    let controllerId: UUID?
    let channelId: Int?
    var isConnected: Bool = false
    var isRegistered: Bool = false
    var currentFlowRate: Double = 0
    var isActive: Bool = false
}

enum FlowDeviceType: String, CaseIterable, Codable {
    case pump = "Pump"
    case wavemaker = "Wavemaker"
    case circulationPump = "Circulation Pump"
    case returnPump = "Return Pump"
}

// MARK: - Flow Profile Models
struct FlowProfile: Identifiable, Codable {
    let id = UUID()
    let name: String
    let description: String
    let devices: [UUID] // Device IDs to control
    let flowRates: [UUID: Double] // Device ID to flow rate mapping
    let duration: Int // Minutes
}

// MARK: - Feed Mode Models
struct FeedModeStatus: Codable {
    let isActive: Bool
    let startTime: Date?
    let endTime: Date?
    let duration: Int
    let profileId: UUID?
    let timeRemaining: Int // Seconds
}
```

## View Models (Placeholder)

```swift
class FlowQuickActionsViewModel: ObservableObject {
    @Published var feedModeAvailable: Bool = false
    @Published var emergencyStopAvailable: Bool = false
    @Published var activePumpCount: Int = 0
    @Published var totalFlowRate: Double = 0
    
    func startFeedMode() {
        // TODO: Implement feed mode start
    }
    
    func emergencyStop() {
        // TODO: Implement emergency stop
    }
}

class FlowManagementViewModel: ObservableObject {
    @Published var discoveredDevices: [FlowDevice] = []
    @Published var registeredDevices: [FlowDevice] = []
    @Published var feedProfiles: [FlowProfile] = []
    @Published var discoveryInProgress: Bool = false
    @Published var feedModeActive: Bool = false
    @Published var feedModeTimeRemaining: String = ""
    @Published var totalFlowRate: Double = 0
    @Published var activePumpCount: Int = 0
    @Published var wavemakerCount: Int = 0
    
    func discoverDevices() {
        // TODO: Implement device discovery
    }
    
    func registerDevice(_ device: FlowDevice) {
        // TODO: Implement device registration
    }
    
    func controlDevice(_ device: FlowDevice) {
        // TODO: Implement device control
    }
    
    func startFeedMode(duration: Double, profile: FlowProfile?) {
        // TODO: Implement feed mode start
    }
    
    func stopFeedMode() {
        // TODO: Implement feed mode stop
    }
    
    func editProfile(_ profile: FlowProfile) {
        // TODO: Implement profile editing
    }
}
```

## API Integration (Placeholder)

```swift
class FlowAPI {
    static let shared = FlowAPI()
    
    func discoverDevices() async throws -> [FlowDevice] {
        // TODO: Implement device discovery API
        return []
    }
    
    func startFeedMode(duration: Int, profileId: UUID?) async throws {
        // TODO: Implement feed mode API
    }
    
    func stopFeedMode() async throws {
        // TODO: Implement feed mode stop API
    }
    
    func getFeedModeStatus() async throws -> FeedModeStatus {
        // TODO: Implement status API
        return FeedModeStatus(isActive: false, startTime: nil, endTime: nil, duration: 0, profileId: nil, timeRemaining: 0)
    }
}
```

## Implementation Checklist

### Phase 1: Foundation (Future)
- [ ] Device discovery and registration
- [ ] Basic device control (on/off)
- [ ] Feed mode implementation
- [ ] Emergency stop functionality
- [ ] Device status monitoring

### Phase 2: Advanced Features (Future)
- [ ] Flow rate control
- [ ] Schedule management
- [ ] Profile system
- [ ] Wave pattern generation
- [ ] Integration with HAL PWM

### Phase 3: Integration (Future)
- [ ] Smart outlets integration
- [ ] Weather-based flow control
- [ ] Advanced scheduling
- [ ] Analytics and reporting
- [ ] Mobile app integration

## Notes for Future Implementation

### Key Features to Implement
1. **Device Discovery**: Automatic detection of flow devices
2. **Feed Mode**: Critical one-touch feeding functionality
3. **Emergency Controls**: Safety stop functionality
4. **Profile System**: Configurable flow patterns
5. **Integration**: HAL PWM and Smart Outlets integration

### Technical Considerations
- **HAL Integration**: Use PWM controllers for variable speed pumps
- **Smart Outlets**: Use outlets for on/off pump control
- **Safety**: Emergency stop must work independently
- **Reliability**: Flow control is critical for reef health

### User Experience Priorities
1. **Feed Mode**: Must be one-touch and reliable
2. **Emergency Stop**: Must be easily accessible
3. **Device Status**: Clear visual feedback
4. **Flow Control**: Intuitive flow rate adjustment
5. **Safety**: Clear warnings and confirmations

This placeholder establishes the foundation for future Flow Management implementation while keeping the current focus on working systems. 