# Bella's Reef iOS App - Temperature System UI/UX Design

## Overview

This document provides the complete UI/UX design for the temperature monitoring system in the Bella's Reef iOS companion app. The system consists of two main interfaces: a **Settings page** for probe discovery and registration, and a **View page** for monitoring registered probes.

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#007AFF` (iOS system blue)
- **Success Green**: `#34C759` (for healthy readings)
- **Warning Orange**: `#FF9500` (for elevated temperatures)
- **Error Red**: `#FF3B30` (for critical temperatures)
- **Background**: System background colors
- **Secondary Text**: `#8E8E93` (iOS system gray)

### Typography
- **Headlines**: SF Pro Display Bold
- **Body Text**: SF Pro Text Regular
- **Monospace**: SF Mono (for technical data)
- **Captions**: SF Pro Text (smaller, lighter)

### Icons (SF Symbols)
- **Temperature**: `thermometer`
- **Probe**: `sensor.tag.radiowaves.forward`
- **Discovery**: `magnifyingglass`
- **Registration**: `plus.circle`
- **Settings**: `gearshape`
- **Health**: `heart.fill`
- **Warning**: `exclamationmark.triangle`
- **Error**: `xmark.circle`

## 📱 Temperature Settings Page

### Purpose
The Settings page allows users to:
- Verify temperature system health
- Discover available probes
- Register probes with custom names
- Configure temperature units (Celsius/Fahrenheit)
- Manage probe settings

### Screen Layout

```swift
struct TemperatureSettingsView: View {
    @StateObject private var tempManager = TemperatureManager()
    @State private var showingDiscovery = false
    @State private var showingRegistration = false
    @State private var selectedUnit: TemperatureUnit = .celsius
    @State private var systemStatus: SystemStatus = .checking
    
    var body: some View {
        NavigationView {
            List {
                // System Status Section
                SystemStatusSection(status: $systemStatus)
                
                // Temperature Unit Section
                TemperatureUnitSection(selectedUnit: $selectedUnit)
                
                // Discovered Probes Section
                DiscoveredProbesSection(
                    discoveredProbes: tempManager.discoveredProbes,
                    onRegister: { probe in
                        showingRegistration = true
                    }
                )
                
                // Registered Probes Section
                RegisteredProbesSection(
                    registeredProbes: tempManager.registeredProbes,
                    onEdit: { probe in
                        // Edit probe settings
                    },
                    onDelete: { probe in
                        // Delete probe
                    }
                )
            }
            .navigationTitle("Temperature Settings")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Discover") {
                        showingDiscovery = true
                    }
                    .disabled(systemStatus != .healthy)
                }
            }
            .sheet(isPresented: $showingDiscovery) {
                ProbeDiscoveryView()
            }
            .sheet(isPresented: $showingRegistration) {
                ProbeRegistrationView()
            }
        }
    }
}
```

### 1. System Status Section
```swift
struct SystemStatusSection: View {
    @Binding var status: SystemStatus
    
    var body: some View {
        Section("System Status") {
            HStack {
                Image(systemName: statusIcon)
                    .foregroundColor(statusColor)
                    .font(.title2)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(statusTitle)
                        .font(.headline)
                    Text(statusDescription)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if status == .checking {
                    ProgressView()
                        .scaleEffect(0.8)
                }
            }
            .padding(.vertical, 4)
        }
    }
    
    private var statusIcon: String {
        switch status {
        case .healthy: return "heart.fill"
        case .warning: return "exclamationmark.triangle"
        case .error: return "xmark.circle"
        case .checking: return "clock"
        }
    }
    
    private var statusColor: Color {
        switch status {
        case .healthy: return .green
        case .warning: return .orange
        case .error: return .red
        case .checking: return .blue
        }
    }
    
    private var statusTitle: String {
        switch status {
        case .healthy: return "System Healthy"
        case .warning: return "System Warning"
        case .error: return "System Error"
        case .checking: return "Checking System"
        }
    }
    
    private var statusDescription: String {
        switch status {
        case .healthy: return "Temperature sensors are working properly"
        case .warning: return "Some sensors may have issues"
        case .error: return "Temperature system is not responding"
        case .checking: return "Verifying system status..."
        }
    }
}

enum SystemStatus {
    case healthy, warning, error, checking
}
```

### 2. Temperature Unit Section
```swift
struct TemperatureUnitSection: View {
    @Binding var selectedUnit: TemperatureUnit
    
    var body: some View {
        Section("Temperature Units") {
            Picker("Display Unit", selection: $selectedUnit) {
                HStack {
                    Text("°C")
                    Text("Celsius")
                        .foregroundColor(.secondary)
                }
                .tag(TemperatureUnit.celsius)
                
                HStack {
                    Text("°F")
                    Text("Fahrenheit")
                        .foregroundColor(.secondary)
                }
                .tag(TemperatureUnit.fahrenheit)
            }
            .pickerStyle(SegmentedPickerStyle())
            
            Text("This setting applies to all temperature readings in the app")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

enum TemperatureUnit: String, CaseIterable {
    case celsius = "C"
    case fahrenheit = "F"
    
    var symbol: String {
        switch self {
        case .celsius: return "°C"
        case .fahrenheit: return "°F"
        }
    }
}
```

### 3. Discovered Probes Section
```swift
struct DiscoveredProbesSection: View {
    let discoveredProbes: [DiscoveredProbe]
    let onRegister: (DiscoveredProbe) -> Void
    
    var body: some View {
        Section("Available Probes") {
            if discoveredProbes.isEmpty {
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                    Text("No probes discovered")
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 8)
            } else {
                ForEach(discoveredProbes, id: \.hardwareId) { probe in
                    DiscoveredProbeRow(
                        probe: probe,
                        onRegister: { onRegister(probe) }
                    )
                }
            }
        }
    }
}

struct DiscoveredProbeRow: View {
    let probe: DiscoveredProbe
    let onRegister: () -> Void
    
    var body: some View {
        HStack {
            Image(systemName: "sensor.tag.radiowaves.forward")
                .foregroundColor(.blue)
                .font(.title3)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Probe \(probe.hardwareId)")
                    .font(.headline)
                Text("Hardware ID: \(probe.hardwareId)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button("Register") {
                onRegister()
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
        .padding(.vertical, 4)
    }
}

struct DiscoveredProbe {
    let hardwareId: String
    let status: String
}
```

### 4. Registered Probes Section
```swift
struct RegisteredProbesSection: View {
    let registeredProbes: [RegisteredProbe]
    let onEdit: (RegisteredProbe) -> Void
    let onDelete: (RegisteredProbe) -> Void
    
    var body: some View {
        Section("Registered Probes") {
            if registeredProbes.isEmpty {
                HStack {
                    Image(systemName: "thermometer")
                        .foregroundColor(.secondary)
                    Text("No probes registered")
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 8)
            } else {
                ForEach(registeredProbes, id: \.id) { probe in
                    RegisteredProbeRow(
                        probe: probe,
                        onEdit: { onEdit(probe) },
                        onDelete: { onDelete(probe) }
                    )
                }
            }
        }
    }
}

struct RegisteredProbeRow: View {
    let probe: RegisteredProbe
    let onEdit: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        HStack {
            Image(systemName: "thermometer")
                .foregroundColor(.green)
                .font(.title3)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(probe.name)
                    .font(.headline)
                Text("ID: \(probe.hardwareId)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Menu {
                Button("Edit") { onEdit() }
                Button("Delete", role: .destructive) { onDelete() }
            } label: {
                Image(systemName: "ellipsis.circle")
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct RegisteredProbe {
    let id: Int
    let name: String
    let hardwareId: String
    let location: String?
    let resolution: Int
}
```

## 🔍 Probe Discovery View

### Purpose
Modal view for discovering and registering temperature probes with detailed information.

```swift
struct ProbeDiscoveryView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var discoveryManager = ProbeDiscoveryManager()
    @State private var isDiscovering = false
    
    var body: some View {
        NavigationView {
            List {
                // Discovery Status
                Section {
                    HStack {
                        if isDiscovering {
                            ProgressView()
                                .scaleEffect(0.8)
                            Text("Discovering probes...")
                        } else {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.blue)
                            Text("Discovery complete")
                        }
                        Spacer()
                        Text("\(discoveryManager.discoveredProbes.count) found")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                // Discovered Probes
                Section("Available Probes") {
                    ForEach(discoveryManager.discoveredProbes, id: \.hardwareId) { probe in
                        ProbeDetailRow(probe: probe)
                    }
                }
            }
            .navigationTitle("Discover Probes")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Refresh") {
                        Task {
                            await discoveryManager.discoverProbes()
                        }
                    }
                    .disabled(isDiscovering)
                }
            }
            .onAppear {
                Task {
                    await discoveryManager.discoverProbes()
                }
            }
        }
    }
}

struct ProbeDetailRow: View {
    let probe: DiscoveredProbe
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "sensor.tag.radiowaves.forward")
                    .foregroundColor(.blue)
                Text("Probe \(probe.hardwareId)")
                    .font(.headline)
                Spacer()
                StatusBadge(status: probe.status)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                DetailRow(label: "Hardware ID", value: probe.hardwareId)
                DetailRow(label: "Status", value: probe.status)
                DetailRow(label: "Type", value: "DS18B20")
            }
            .font(.caption)
            .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

struct StatusBadge: View {
    let status: String
    
    var body: some View {
        Text(status)
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(statusColor.opacity(0.2))
            .foregroundColor(statusColor)
            .cornerRadius(4)
    }
    
    private var statusColor: Color {
        switch status.lowercased() {
        case "healthy": return .green
        case "warning": return .orange
        case "error": return .red
        default: return .gray
        }
    }
}

struct DetailRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .fontWeight(.medium)
            Spacer()
            Text(value)
        }
    }
}
```

## 📝 Probe Registration View

### Purpose
Modal view for registering discovered probes with custom names and settings.

```swift
struct ProbeRegistrationView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var registrationManager = ProbeRegistrationManager()
    
    let probe: DiscoveredProbe
    
    @State private var probeName = ""
    @State private var location = ""
    @State private var resolution = 12
    @State private var isRegistering = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            Form {
                // Probe Information
                Section("Probe Information") {
                    HStack {
                        Image(systemName: "sensor.tag.radiowaves.forward")
                            .foregroundColor(.blue)
                        VStack(alignment: .leading) {
                            Text("Hardware ID")
                                .font(.headline)
                            Text(probe.hardwareId)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                // Registration Settings
                Section("Registration Settings") {
                    TextField("Probe Name", text: $probeName)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    TextField("Location (Optional)", text: $location)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    Picker("Resolution", selection: $resolution) {
                        Text("9-bit (0.5°C)").tag(9)
                        Text("10-bit (0.25°C)").tag(10)
                        Text("11-bit (0.125°C)").tag(11)
                        Text("12-bit (0.0625°C)").tag(12)
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                // Resolution Information
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Resolution Settings")
                            .font(.headline)
                        
                        Text("Higher resolution provides more precise readings but takes longer to complete. 12-bit resolution is recommended for most applications.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        HStack {
                            Text("Current setting:")
                            Spacer()
                            Text("\(resolution)-bit")
                                .fontWeight(.medium)
                        }
                        .font(.caption)
                    }
                }
                
                // Error Display
                if let errorMessage = errorMessage {
                    Section {
                        HStack {
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(.red)
                            Text(errorMessage)
                                .foregroundColor(.red)
                        }
                    }
                }
            }
            .navigationTitle("Register Probe")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Register") {
                        Task {
                            await registerProbe()
                        }
                    }
                    .disabled(probeName.isEmpty || isRegistering)
                }
            }
        }
    }
    
    private func registerProbe() async {
        isRegistering = true
        errorMessage = nil
        
        do {
            try await registrationManager.registerProbe(
                hardwareId: probe.hardwareId,
                name: probeName,
                location: location.isEmpty ? nil : location,
                resolution: resolution
            )
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isRegistering = false
    }
}
```

## 📊 Temperature View Page

### Purpose
The View page displays real-time temperature readings from registered probes with a clean, informative interface.

```swift
struct TemperatureView: View {
    @StateObject private var tempManager = TemperatureManager()
    @State private var selectedUnit: TemperatureUnit = .celsius
    @State private var refreshInterval: TimeInterval = 30
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 16) {
                    // System Overview
                    SystemOverviewCard(
                        probeCount: tempManager.registeredProbes.count,
                        averageTemp: tempManager.averageTemperature,
                        unit: selectedUnit
                    )
                    
                    // Individual Probes
                    ForEach(tempManager.registeredProbes, id: \.id) { probe in
                        ProbeReadingCard(
                            probe: probe,
                            reading: tempManager.readings[probe.id],
                            unit: selectedUnit
                        )
                    }
                }
                .padding()
            }
            .navigationTitle("Temperature")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Picker("Unit", selection: $selectedUnit) {
                            Text("°C").tag(TemperatureUnit.celsius)
                            Text("°F").tag(TemperatureUnit.fahrenheit)
                        }
                        
                        Divider()
                        
                        Button("Refresh Now") {
                            Task {
                                await tempManager.refreshReadings()
                            }
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .refreshable {
                await tempManager.refreshReadings()
            }
        }
    }
}
```

### 1. System Overview Card
```swift
struct SystemOverviewCard: View {
    let probeCount: Int
    let averageTemp: Double?
    let unit: TemperatureUnit
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "thermometer")
                    .font(.title)
                    .foregroundColor(.blue)
                
                VStack(alignment: .leading) {
                    Text("System Overview")
                        .font(.headline)
                    Text("\(probeCount) probe\(probeCount == 1 ? "" : "s") registered")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            
            if let averageTemp = averageTemp {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Average Temperature")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(averageTemp, specifier: "%.1f")\(unit.symbol)")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(temperatureColor(averageTemp, unit: unit))
                    }
                    
                    Spacer()
                    
                    // Temperature trend indicator
                    Image(systemName: "arrow.up")
                        .foregroundColor(.green)
                        .font(.title2)
                }
            } else {
                Text("No readings available")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    private func temperatureColor(_ temp: Double, unit: TemperatureUnit) -> Color {
        let celsiusTemp = unit == .fahrenheit ? (temp - 32) * 5/9 : temp
        
        switch celsiusTemp {
        case ..<20: return .blue
        case 20..<25: return .green
        case 25..<30: return .orange
        default: return .red
        }
    }
}
```

### 2. Probe Reading Card
```swift
struct ProbeReadingCard: View {
    let probe: RegisteredProbe
    let reading: TemperatureReading?
    let unit: TemperatureUnit
    
    var body: some View {
        VStack(spacing: 12) {
            // Header
            HStack {
                VStack(alignment: .leading) {
                    Text(probe.name)
                        .font(.headline)
                    if let location = probe.location {
                        Text(location)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                StatusIndicator(reading: reading)
            }
            
            // Temperature Display
            if let reading = reading {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Current Temperature")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(reading.temperature, specifier: "%.1f")\(unit.symbol)")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(temperatureColor(reading.temperature, unit: unit))
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing) {
                        Text("Updated")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(reading.timestamp, style: .relative)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                // Additional Info
                HStack {
                    Label("Resolution: \(probe.resolution)-bit", systemImage: "dial.medium")
                    Spacer()
                    Label("Status: \(reading.status)", systemImage: "checkmark.circle")
                }
                .font(.caption)
                .foregroundColor(.secondary)
            } else {
                HStack {
                    ProgressView()
                        .scaleEffect(0.8)
                    Text("Loading reading...")
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    private func temperatureColor(_ temp: Double, unit: TemperatureUnit) -> Color {
        let celsiusTemp = unit == .fahrenheit ? (temp - 32) * 5/9 : temp
        
        switch celsiusTemp {
        case ..<20: return .blue
        case 20..<25: return .green
        case 25..<30: return .orange
        default: return .red
        }
    }
}

struct StatusIndicator: View {
    let reading: TemperatureReading?
    
    var body: some View {
        Circle()
            .fill(statusColor)
            .frame(width: 12, height: 12)
    }
    
    private var statusColor: Color {
        guard let reading = reading else { return .gray }
        
        switch reading.status {
        case "success": return .green
        case "warning": return .orange
        case "error": return .red
        default: return .gray
        }
    }
}

struct TemperatureReading {
    let temperature: Double
    let unit: String
    let timestamp: Date
    let status: String
    let resolution: Int
}
```

## 🔧 Data Models

### Temperature Manager
```swift
class TemperatureManager: ObservableObject {
    @Published var discoveredProbes: [DiscoveredProbe] = []
    @Published var registeredProbes: [RegisteredProbe] = []
    @Published var readings: [Int: TemperatureReading] = [:]
    @Published var averageTemperature: Double?
    @Published var selectedUnit: TemperatureUnit = .celsius
    
    private let api = BellaReefAPI(baseURL: "http://192.168.33.126:8000")
    
    func discoverProbes() async {
        do {
            let discovery = try await api.getTemperatureSensors()
            await MainActor.run {
                self.discoveredProbes = discovery.availableSensors.map { sensorId in
                    DiscoveredProbe(hardwareId: sensorId, status: "healthy")
                }
            }
        } catch {
            print("Failed to discover probes: \(error)")
        }
    }
    
    func registerProbe(hardwareId: String, name: String, location: String?, resolution: Int) async throws {
        // Implementation for registering probe
    }
    
    func refreshReadings() async {
        for probe in registeredProbes {
            do {
                let reading = try await api.getTemperatureReading(probeId: probe.id, unit: selectedUnit.rawValue)
                await MainActor.run {
                    self.readings[probe.id] = reading
                }
            } catch {
                print("Failed to get reading for probe \(probe.id): \(error)")
            }
        }
        
        await MainActor.run {
            self.updateAverageTemperature()
        }
    }
    
    private func updateAverageTemperature() {
        let validReadings = readings.values.filter { $0.status == "success" }
        if !validReadings.isEmpty {
            let sum = validReadings.reduce(0) { $0 + $1.temperature }
            averageTemperature = sum / Double(validReadings.count)
        } else {
            averageTemperature = nil
        }
    }
}
```

## 🎯 User Experience Flow

### 1. Initial Setup
1. User opens Temperature Settings
2. System status is checked automatically
3. If healthy, user can discover probes
4. User discovers available probes
5. User registers probes with custom names
6. User sets temperature unit preference

### 2. Daily Monitoring
1. User opens Temperature View
2. Real-time readings are displayed
3. User can switch between °C and °F
4. Pull-to-refresh for manual updates
5. Automatic refresh every 30 seconds

### 3. Error Handling
- Clear error messages for connection issues
- Graceful degradation when probes are offline
- Retry mechanisms for failed readings
- User-friendly status indicators

## 📱 Accessibility Features

### VoiceOver Support
- Descriptive labels for all temperature readings
- Status announcements for probe health
- Clear navigation between sections

### Dynamic Type
- All text scales with system font size
- Maintains readability at all sizes
- Proper contrast ratios

### Color Blind Support
- Status indicators use both color and icons
- Temperature ranges have multiple visual cues
- High contrast mode support

## 🚀 Implementation Checklist

### Phase 1: Core UI ✅
- [x] Settings page layout
- [x] View page layout
- [x] Temperature unit selection
- [x] Probe discovery interface
- [x] Probe registration form

### Phase 2: Data Integration 🔄
- [ ] Connect to temperature API
- [ ] Real-time data updates
- [ ] Error handling
- [ ] Loading states

### Phase 3: Advanced Features 📋
- [ ] Temperature alerts
- [ ] Historical data charts
- [ ] Export functionality
- [ ] Push notifications

### Phase 4: Polish 📋
- [ ] Animations and transitions
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] User testing feedback

The temperature system UI provides an intuitive, informative, and user-friendly interface for monitoring and managing temperature probes in the Bella's Reef ecosystem. 