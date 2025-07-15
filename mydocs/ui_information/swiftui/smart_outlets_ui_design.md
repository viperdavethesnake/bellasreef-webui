# Smart Outlets System UI/UX Design

## Overview

The Smart Outlets system provides comprehensive management of both cloud-based (VeSync) and local (Kasa/Shelly) smart outlets. The interface is split into two main sections: Settings for configuration and discovery, and Control for real-time outlet management.

## Design System

### Color Palette
- **Primary Blue**: `#007AFF` - Main actions, selected states
- **Secondary Blue**: `#5AC8FA` - Secondary actions, highlights
- **Success Green**: `#34C759` - Connected status, on states
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
- **Cloud**: `cloud.fill` - VeSync accounts
- **WiFi**: `wifi` - Local network devices
- **Outlet**: `poweroutlet.type.b` - Smart outlets
- **Checkmark**: `checkmark.circle.fill` - Connected/verified
- **Exclamation**: `exclamationmark.triangle.fill` - Warning/error
- **Plus**: `plus.circle.fill` - Add new items
- **Trash**: `trash.fill` - Delete items
- **Refresh**: `arrow.clockwise` - Discover/refresh
- **Power**: `power` - Power toggle
- **Status**: `circle.fill` - Status indicators

## Settings Tab Design

### Main Settings Screen

```swift
struct SmartOutletsSettingsView: View {
    @StateObject private var viewModel = SmartOutletsSettingsViewModel()
    
    var body: some View {
        NavigationView {
            List {
                // Cloud Section
                Section(header: Text("Cloud Outlets (VeSync)")) {
                    NavigationLink(destination: VeSyncSettingsView()) {
                        HStack {
                            Image(systemName: "cloud.fill")
                                .foregroundColor(.blue)
                                .frame(width: 24)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("VeSync Accounts")
                                    .font(.headline)
                                Text("\(viewModel.vesyncAccountCount) accounts configured")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            if viewModel.vesyncConnected {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                
                // Local Section
                Section(header: Text("Local Outlets")) {
                    NavigationLink(destination: LocalOutletsSettingsView()) {
                        HStack {
                            Image(systemName: "wifi")
                                .foregroundColor(.orange)
                                .frame(width: 24)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Kasa & Shelly")
                                    .font(.headline)
                                Text("\(viewModel.localOutletCount) outlets discovered")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            if viewModel.localConnected {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                
                // System Status
                Section(header: Text("System Status")) {
                    HStack {
                        Image(systemName: "poweroutlet.type.b")
                            .foregroundColor(.blue)
                        Text("Total Outlets")
                        Spacer()
                        Text("\(viewModel.totalOutletCount)")
                            .fontWeight(.semibold)
                    }
                    
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Connected")
                        Spacer()
                        Text("\(viewModel.connectedOutletCount)")
                            .fontWeight(.semibold)
                    }
                    
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange)
                        Text("Disconnected")
                        Spacer()
                        Text("\(viewModel.disconnectedOutletCount)")
                            .fontWeight(.semibold)
                    }
                }
            }
            .navigationTitle("Smart Outlets")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
```

### VeSync Settings Screen

```swift
struct VeSyncSettingsView: View {
    @StateObject private var viewModel = VeSyncSettingsViewModel()
    @State private var showingAddAccount = false
    @State private var showingDiscovery = false
    
    var body: some View {
        List {
            // Account Management
            Section(header: Text("VeSync Accounts")) {
                ForEach(viewModel.accounts) { account in
                    VeSyncAccountRow(account: account) {
                        viewModel.deleteAccount(account)
                    }
                }
                
                Button(action: { showingAddAccount = true }) {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                            .foregroundColor(.blue)
                        Text("Add VeSync Account")
                            .foregroundColor(.blue)
                    }
                }
            }
            
            // Discovery Section
            if !viewModel.accounts.isEmpty {
                Section(header: Text("Outlet Discovery")) {
                    Button(action: { showingDiscovery = true }) {
                        HStack {
                            Image(systemName: "arrow.clockwise")
                                .foregroundColor(.blue)
                            Text("Discover VeSync Outlets")
                                .foregroundColor(.blue)
                        }
                    }
                    
                    if viewModel.discoveryInProgress {
                        HStack {
                            ProgressView()
                                .scaleEffect(0.8)
                            Text("Discovering outlets...")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if !viewModel.discoveredOutlets.isEmpty {
                        Text("\(viewModel.discoveredOutlets.count) outlets found")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // Selected Outlets
            if !viewModel.selectedOutlets.isEmpty {
                Section(header: Text("Selected Outlets")) {
                    ForEach(viewModel.selectedOutlets) { outlet in
                        VeSyncOutletRow(outlet: outlet) {
                            viewModel.toggleOutletSelection(outlet)
                        }
                    }
                }
            }
        }
        .navigationTitle("VeSync Settings")
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showingAddAccount) {
            AddVeSyncAccountView()
        }
        .sheet(isPresented: $showingDiscovery) {
            VeSyncDiscoveryView()
        }
    }
}

struct VeSyncAccountRow: View {
    let account: VeSyncAccount
    let onDelete: () -> Void
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(account.username)
                    .font(.headline)
                Text(account.email)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if account.isVerified {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            } else {
                Button("Verify") {
                    // Verify account
                }
                .font(.caption)
                .foregroundColor(.blue)
            }
            
            Button(action: onDelete) {
                Image(systemName: "trash.fill")
                    .foregroundColor(.red)
            }
        }
        .padding(.vertical, 4)
    }
}
```

### Local Outlets Settings Screen

```swift
struct LocalOutletsSettingsView: View {
    @StateObject private var viewModel = LocalOutletsSettingsViewModel()
    @State private var showingDiscovery = false
    
    var body: some View {
        List {
            // Discovery Section
            Section(header: Text("Local Network Discovery")) {
                Button(action: { showingDiscovery = true }) {
                    HStack {
                        Image(systemName: "arrow.clockwise")
                            .foregroundColor(.orange)
                        Text("Discover Local Outlets")
                            .foregroundColor(.orange)
                    }
                }
                
                if viewModel.discoveryInProgress {
                    HStack {
                        ProgressView()
                            .scaleEffect(0.8)
                        Text("Scanning network...")
                            .foregroundColor(.secondary)
                    }
                }
                
                // Discovery Results
                if !viewModel.discoveredOutlets.isEmpty {
                    ForEach(viewModel.discoveredOutlets) { outlet in
                        LocalOutletRow(outlet: outlet) {
                            viewModel.toggleOutletSelection(outlet)
                        }
                    }
                }
            }
            
            // Selected Outlets
            if !viewModel.selectedOutlets.isEmpty {
                Section(header: Text("Selected Outlets")) {
                    ForEach(viewModel.selectedOutlets) { outlet in
                        LocalOutletRow(outlet: outlet, isSelected: true) {
                            viewModel.toggleOutletSelection(outlet)
                        }
                    }
                }
            }
            
            // Network Status
            Section(header: Text("Network Status")) {
                HStack {
                    Image(systemName: "wifi")
                        .foregroundColor(.green)
                    Text("Local Network")
                    Spacer()
                    Text("Connected")
                        .foregroundColor(.green)
                }
                
                HStack {
                    Image(systemName: "network")
                        .foregroundColor(.blue)
                    Text("Kasa Devices")
                    Spacer()
                    Text("\(viewModel.kasaDeviceCount)")
                        .fontWeight(.semibold)
                }
                
                HStack {
                    Image(systemName: "network")
                        .foregroundColor(.orange)
                    Text("Shelly Devices")
                    Spacer()
                    Text("\(viewModel.shellyDeviceCount)")
                        .fontWeight(.semibold)
                }
            }
        }
        .navigationTitle("Local Outlets")
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showingDiscovery) {
            LocalDiscoveryView()
        }
    }
}

struct LocalOutletRow: View {
    let outlet: LocalOutlet
    var isSelected: Bool = false
    let onToggle: () -> Void
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(outlet.name)
                    .font(.headline)
                Text(outlet.ipAddress)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(outlet.type.rawValue)
                    .font(.caption2)
                    .foregroundColor(outlet.type == .kasa ? .blue : .orange)
            }
            
            Spacer()
            
            if isSelected {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            } else {
                Button("Select") {
                    onToggle()
                }
                .font(.caption)
                .foregroundColor(.blue)
            }
        }
        .padding(.vertical, 4)
    }
}
```

## Control Tab Design

### Main Control Screen

```swift
struct SmartOutletsControlView: View {
    @StateObject private var viewModel = SmartOutletsControlViewModel()
    @State private var selectedFilter: OutletFilter = .all
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Filter Picker
                Picker("Filter", selection: $selectedFilter) {
                    Text("All").tag(OutletFilter.all)
                    Text("VeSync").tag(OutletFilter.vesync)
                    Text("Local").tag(OutletFilter.local)
                    Text("On").tag(OutletFilter.on)
                    Text("Off").tag(OutletFilter.off)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                // Outlets List
                List {
                    ForEach(viewModel.filteredOutlets(selectedFilter)) { outlet in
                        OutletControlRow(outlet: outlet) { action in
                            viewModel.performAction(action, on: outlet)
                        }
                    }
                }
            }
            .navigationTitle("Outlet Control")
            .navigationBarTitleDisplayMode(.large)
            .refreshable {
                await viewModel.refreshOutletStatus()
            }
        }
    }
}

struct OutletControlRow: View {
    let outlet: SmartOutlet
    let onAction: (OutletAction) -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                // Outlet Info
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(outlet.name)
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Spacer()
                        
                        // Status Indicator
                        Circle()
                            .fill(outlet.isOnline ? Color.green : Color.red)
                            .frame(width: 8, height: 8)
                    }
                    
                    HStack {
                        Image(systemName: outlet.type == .vesync ? "cloud.fill" : "wifi")
                            .foregroundColor(outlet.type == .vesync ? .blue : .orange)
                            .font(.caption)
                        
                        Text(outlet.type.rawValue)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Spacer()
                        
                        Text(outlet.ipAddress ?? outlet.accountName ?? "")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // Power Status
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Power Status")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(outlet.isOn ? "ON" : "OFF")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(outlet.isOn ? .green : .red)
                }
                
                Spacer()
                
                // Power Consumption (if available)
                if let powerConsumption = outlet.powerConsumption {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Power")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(powerConsumption, specifier: "%.1f")W")
                            .font(.headline)
                            .fontWeight(.semibold)
                    }
                }
            }
            
            // Control Buttons
            HStack(spacing: 12) {
                Button(action: { onAction(.turnOn) }) {
                    HStack {
                        Image(systemName: "power")
                        Text("Turn On")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                .disabled(outlet.isOn)
                
                Button(action: { onAction(.turnOff) }) {
                    HStack {
                        Image(systemName: "power")
                        Text("Turn Off")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color.red)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                .disabled(!outlet.isOn)
                
                Button(action: { onAction(.toggle) }) {
                    HStack {
                        Image(systemName: "arrow.triangle.2.circlepath")
                        Text("Toggle")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }
        }
        .padding(.vertical, 8)
    }
}
```

## Data Models

```swift
// MARK: - VeSync Models
struct VeSyncAccount: Identifiable, Codable {
    let id = UUID()
    let username: String
    let email: String
    let password: String // Encrypted
    var isVerified: Bool = false
    var lastVerified: Date?
}

struct VeSyncOutlet: Identifiable, Codable {
    let id = UUID()
    let deviceId: String
    let name: String
    let type: String
    let isOn: Bool
    let powerConsumption: Double?
    let isOnline: Bool
}

// MARK: - Local Models
struct LocalOutlet: Identifiable, Codable {
    let id = UUID()
    let name: String
    let ipAddress: String
    let type: LocalOutletType
    let macAddress: String
    var isSelected: Bool = false
}

enum LocalOutletType: String, CaseIterable, Codable {
    case kasa = "Kasa"
    case shelly = "Shelly"
}

// MARK: - Control Models
struct SmartOutlet: Identifiable, Codable {
    let id = UUID()
    let name: String
    let type: OutletType
    let ipAddress: String?
    let accountName: String?
    var isOn: Bool
    var isOnline: Bool
    var powerConsumption: Double?
    var lastUpdated: Date
}

enum OutletType: String, CaseIterable, Codable {
    case vesync = "VeSync"
    case kasa = "Kasa"
    case shelly = "Shelly"
}

enum OutletFilter: String, CaseIterable {
    case all = "All"
    case vesync = "VeSync"
    case local = "Local"
    case on = "On"
    case off = "Off"
}

enum OutletAction {
    case turnOn
    case turnOff
    case toggle
}
```

## View Models

```swift
// MARK: - Settings View Models
class SmartOutletsSettingsViewModel: ObservableObject {
    @Published var vesyncAccountCount: Int = 0
    @Published var localOutletCount: Int = 0
    @Published var totalOutletCount: Int = 0
    @Published var connectedOutletCount: Int = 0
    @Published var disconnectedOutletCount: Int = 0
    @Published var vesyncConnected: Bool = false
    @Published var localConnected: Bool = false
    
    func loadSettings() {
        // Load settings from UserDefaults/Keychain
    }
    
    func updateCounts() {
        // Update outlet counts
    }
}

class VeSyncSettingsViewModel: ObservableObject {
    @Published var accounts: [VeSyncAccount] = []
    @Published var discoveredOutlets: [VeSyncOutlet] = []
    @Published var selectedOutlets: [VeSyncOutlet] = []
    @Published var discoveryInProgress: Bool = false
    
    func addAccount(_ account: VeSyncAccount) {
        // Add VeSync account
    }
    
    func deleteAccount(_ account: VeSyncAccount) {
        // Delete VeSync account
    }
    
    func verifyAccount(_ account: VeSyncAccount) async {
        // Verify VeSync account credentials
    }
    
    func discoverOutlets() async {
        // Discover VeSync outlets
    }
    
    func toggleOutletSelection(_ outlet: VeSyncOutlet) {
        // Toggle outlet selection
    }
}

class LocalOutletsSettingsViewModel: ObservableObject {
    @Published var discoveredOutlets: [LocalOutlet] = []
    @Published var selectedOutlets: [LocalOutlet] = []
    @Published var discoveryInProgress: Bool = false
    @Published var kasaDeviceCount: Int = 0
    @Published var shellyDeviceCount: Int = 0
    @Published var localConnected: Bool = false
    
    func discoverOutlets() async {
        // Discover local Kasa and Shelly outlets
    }
    
    func toggleOutletSelection(_ outlet: LocalOutlet) {
        // Toggle outlet selection
    }
}

// MARK: - Control View Model
class SmartOutletsControlViewModel: ObservableObject {
    @Published var outlets: [SmartOutlet] = []
    @Published var isLoading: Bool = false
    
    func loadOutlets() {
        // Load configured outlets
    }
    
    func filteredOutlets(_ filter: OutletFilter) -> [SmartOutlet] {
        // Filter outlets based on selection
        switch filter {
        case .all:
            return outlets
        case .vesync:
            return outlets.filter { $0.type == .vesync }
        case .local:
            return outlets.filter { $0.type == .kasa || $0.type == .shelly }
        case .on:
            return outlets.filter { $0.isOn }
        case .off:
            return outlets.filter { !$0.isOn }
        }
    }
    
    func performAction(_ action: OutletAction, on outlet: SmartOutlet) {
        // Perform outlet action
    }
    
    func refreshOutletStatus() async {
        // Refresh all outlet statuses
    }
}
```

## API Integration

```swift
// MARK: - VeSync API
class VeSyncAPI {
    static let shared = VeSyncAPI()
    
    func authenticate(username: String, password: String) async throws -> VeSyncAuthResponse {
        // VeSync authentication
    }
    
    func getDevices(account: VeSyncAccount) async throws -> [VeSyncOutlet] {
        // Get VeSync devices
    }
    
    func controlDevice(deviceId: String, action: OutletAction) async throws {
        // Control VeSync device
    }
}

// MARK: - Local Network API
class LocalNetworkAPI {
    static let shared = LocalNetworkAPI()
    
    func discoverKasaDevices() async throws -> [LocalOutlet] {
        // Discover Kasa devices on local network
    }
    
    func discoverShellyDevices() async throws -> [LocalOutlet] {
        // Discover Shelly devices on local network
    }
    
    func controlKasaDevice(ipAddress: String, action: OutletAction) async throws {
        // Control Kasa device
    }
    
    func controlShellyDevice(ipAddress: String, action: OutletAction) async throws {
        // Control Shelly device
    }
}
```

## User Experience Flow

### Settings Flow
1. **Main Settings Screen**
   - User sees overview of Cloud and Local sections
   - Quick status indicators show connection state
   - System status shows total outlet counts

2. **VeSync Configuration**
   - User adds VeSync account credentials
   - Verification process confirms account access
   - Discovery finds all available VeSync outlets
   - User selects which outlets to control

3. **Local Configuration**
   - User initiates network discovery
   - System scans for Kasa and Shelly devices
   - User reviews discovered devices
   - User selects which outlets to control

### Control Flow
1. **Outlet Overview**
   - User sees all configured outlets
   - Filter options (All, VeSync, Local, On, Off)
   - Real-time status indicators
   - Power consumption display

2. **Individual Control**
   - Turn On/Off buttons for each outlet
   - Toggle option for quick state change
   - Visual feedback for current state
   - Error handling for failed operations

3. **Bulk Operations**
   - Select multiple outlets
   - Bulk turn on/off operations
   - Group management features

## Accessibility Features

- **VoiceOver Support**: All buttons and status indicators are properly labeled
- **Dynamic Type**: Text scales with system font size settings
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects system motion preferences
- **Color Blind Support**: Status indicators use both color and shape

## Implementation Checklist

### Settings Tab
- [ ] Main settings screen with Cloud/Local sections
- [ ] VeSync account management (add, delete, verify)
- [ ] VeSync outlet discovery and selection
- [ ] Local network discovery (Kasa/Shelly)
- [ ] Local outlet selection interface
- [ ] System status indicators
- [ ] Settings persistence

### Control Tab
- [ ] Outlet list with real-time status
- [ ] Filter options (All, VeSync, Local, On, Off)
- [ ] Individual outlet control (On, Off, Toggle)
- [ ] Power consumption display
- [ ] Connection status indicators
- [ ] Error handling and retry logic
- [ ] Pull-to-refresh functionality

### API Integration
- [ ] VeSync authentication and device management
- [ ] Local network discovery protocols
- [ ] Kasa device control implementation
- [ ] Shelly device control implementation
- [ ] Real-time status monitoring
- [ ] Error handling and retry mechanisms

### Data Management
- [ ] Secure credential storage in Keychain
- [ ] Outlet configuration persistence
- [ ] Discovery results caching
- [ ] Status update scheduling
- [ ] Offline mode support

### Testing
- [ ] Unit tests for view models
- [ ] Integration tests for API calls
- [ ] UI tests for user flows
- [ ] Network condition testing
- [ ] Error scenario testing 