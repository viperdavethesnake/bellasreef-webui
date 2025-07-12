# Lighting Settings UI/UX Design

## Overview

The Lighting Settings page provides the foundation for advanced lighting control by configuring location, timezone mapping, and weather integration. This enables location-based lighting behaviors and weather effects that will be essential for the full lighting system.

**Status**: Ready for Implementation - Core configuration for lighting system
**Priority**: High - Foundation for lighting behaviors and weather effects
**Dependencies**: Core service for settings storage, OpenWeatherMap API

## Design System

### Color Palette
- **Primary Gold**: `#F4A261` - Main lighting actions, warm sunlight
- **Lighting Blue**: `#2E86AB` - Lighting-specific actions and highlights
- **Success Green**: `#34C759` - Connected status, operational
- **Warning Orange**: `#FF9500` - Discovery in progress, pending states
- **Error Red**: `#FF3B30` - Error states, disconnected status
- **Location Purple**: `#8B5CF6` - Location and timezone settings
- **Weather Blue**: `#3B82F6` - Weather integration
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
- **Location**: `location.fill` - Location settings
- **Weather**: `cloud.fill` - Weather integration
- **Timezone**: `clock.fill` - Timezone mapping
- **Settings**: `gearshape.fill` - Configuration
- **Status**: `circle.fill` - Status indicators
- **Test**: `checkmark.circle.fill` - Test connections
- **Map**: `map.fill` - Location selection

## Main Settings Screen

```swift
struct LightingSettingsView: View {
    @StateObject private var viewModel = LightingSettingsViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            List {
                // Location Configuration Section
                Section(header: Text("Location Configuration")) {
                    LocationConfigurationView(viewModel: viewModel)
                }
                
                // Timezone Mapping Section
                Section(header: Text("Timezone Mapping")) {
                    TimezoneMappingView(viewModel: viewModel)
                }
                
                // Weather Integration Section
                Section(header: Text("Weather Integration")) {
                    WeatherIntegrationView(viewModel: viewModel)
                }
                
                // Weather Status Section
                if viewModel.weatherConfigured {
                    Section(header: Text("Weather Status")) {
                        WeatherStatusView(viewModel: viewModel)
                    }
                }
                
                // Test Connection Section
                Section(header: Text("Connection Testing")) {
                    ConnectionTestingView(viewModel: viewModel)
                }
            }
            .navigationTitle("Lighting Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        Task {
                            await viewModel.saveSettings()
                            dismiss()
                        }
                    }
                    .disabled(!viewModel.hasChanges)
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            viewModel.loadSettings()
        }
    }
}
```

## Location Configuration

```swift
struct LocationConfigurationView: View {
    @ObservedObject var viewModel: LightingSettingsViewModel
    @State private var showingLocationPicker = false
    
    var body: some View {
        VStack(spacing: 16) {
            // Location Type Selection
            Picker("Location Type", selection: $viewModel.locationType) {
                Text("No Location").tag(LocationType.none)
                Text("Custom Coordinates").tag(LocationType.custom)
                Text("Preset Location").tag(LocationType.preset)
            }
            .pickerStyle(SegmentedPickerStyle())
            
            // Custom Coordinates
            if viewModel.locationType == .custom {
                VStack(spacing: 12) {
                    HStack {
                        Text("Latitude")
                        Spacer()
                        TextField("0.000000", value: $viewModel.customLatitude, format: .number)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 120)
                    }
                    
                    HStack {
                        Text("Longitude")
                        Spacer()
                        TextField("0.000000", value: $viewModel.customLongitude, format: .number)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 120)
                    }
                    
                    // Location Name
                    HStack {
                        Text("Location Name")
                        Spacer()
                        TextField("My Location", text: $viewModel.customLocationName)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                }
            }
            
            // Preset Location
            if viewModel.locationType == .preset {
                VStack(spacing: 12) {
                    Button(action: { showingLocationPicker = true }) {
                        HStack {
                            Image(systemName: "map.fill")
                                .foregroundColor(.blue)
                            Text(viewModel.selectedPresetLocation?.name ?? "Select Location")
                                .foregroundColor(viewModel.selectedPresetLocation == nil ? .secondary : .primary)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if let location = viewModel.selectedPresetLocation {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Coordinates")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text("\(location.latitude, specifier: "%.6f"), \(location.longitude, specifier: "%.6f")")
                                .font(.caption)
                                .foregroundColor(.primary)
                        }
                    }
                }
            }
            
            // Current Location Status
            if viewModel.locationConfigured {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Location Configured")
                        .foregroundColor(.green)
                    Spacer()
                }
            }
        }
        .sheet(isPresented: $showingLocationPicker) {
            PresetLocationPickerView(selectedLocation: $viewModel.selectedPresetLocation)
        }
    }
}
```

## Timezone Mapping

```swift
struct TimezoneMappingView: View {
    @ObservedObject var viewModel: LightingSettingsViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            // Timezone Selection
            VStack(alignment: .leading, spacing: 8) {
                Text("Your Timezone")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Picker("Timezone", selection: $viewModel.userTimezone) {
                    ForEach(TimeZone.knownTimeZoneIdentifiers, id: \.self) { identifier in
                        Text(formatTimezone(identifier)).tag(identifier)
                    }
                }
                .pickerStyle(MenuPickerStyle())
            }
            
            // Timezone Offset Display
            if let userTimezone = viewModel.userTimezone {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Current Offset")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        Image(systemName: "clock.fill")
                            .foregroundColor(.blue)
                        Text("\(formatTimezoneOffset(userTimezone))")
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                }
            }
            
            // Location Timezone (if location is configured)
            if viewModel.locationConfigured {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Location Timezone")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    HStack {
                        Image(systemName: "location.fill")
                            .foregroundColor(.purple)
                        Text(viewModel.locationTimezone ?? "Unknown")
                            .font(.subheadline)
                    }
                }
                
                // Timezone Mapping Explanation
                VStack(alignment: .leading, spacing: 8) {
                    Text("Timezone Mapping")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("Lighting schedules will be mapped from your location's timezone to your current timezone. For example, a 6:00 AM schedule in your location will trigger at the equivalent time in your current timezone.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
            }
        }
    }
    
    private func formatTimezone(_ identifier: String) -> String {
        let timezone = TimeZone(identifier: identifier) ?? TimeZone.current
        let offset = timezone.secondsFromGMT() / 3600
        let sign = offset >= 0 ? "+" : ""
        return "\(identifier) (GMT\(sign)\(offset))"
    }
    
    private func formatTimezoneOffset(_ identifier: String) -> String {
        guard let timezone = TimeZone(identifier: identifier) else { return "Unknown" }
        let offset = timezone.secondsFromGMT() / 3600
        let sign = offset >= 0 ? "+" : ""
        return "GMT\(sign)\(offset)"
    }
}
```

## Weather Integration

```swift
struct WeatherIntegrationView: View {
    @ObservedObject var viewModel: LightingSettingsViewModel
    @State private var showingAPIKeyAlert = false
    
    var body: some View {
        VStack(spacing: 16) {
            // API Key Configuration
            VStack(alignment: .leading, spacing: 8) {
                Text("OpenWeatherMap API Key")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                HStack {
                    SecureField("Enter your API key", text: $viewModel.openWeatherAPIKey)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    Button(action: { viewModel.testWeatherConnection() }) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.blue)
                    }
                    .disabled(viewModel.openWeatherAPIKey.isEmpty)
                }
                
                Button("Get API Key") {
                    showingAPIKeyAlert = true
                }
                .font(.caption)
                .foregroundColor(.blue)
            }
            
            // Weather Status
            if viewModel.weatherConfigured {
                HStack {
                    Image(systemName: viewModel.weatherConnectionStatus.icon)
                        .foregroundColor(viewModel.weatherConnectionStatus.color)
                    Text(viewModel.weatherConnectionStatus.description)
                        .foregroundColor(viewModel.weatherConnectionStatus.color)
                    Spacer()
                }
            }
            
            // Weather Features
            if viewModel.weatherConfigured {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Weather Features")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        WeatherFeatureRow(
                            icon: "cloud.fill",
                            title: "Cloud Cover Effects",
                            description: "Adjust lighting based on cloud cover"
                        )
                        
                        WeatherFeatureRow(
                            icon: "cloud.rain.fill",
                            title: "Storm Effects",
                            description: "Special lighting during storms"
                        )
                        
                        WeatherFeatureRow(
                            icon: "sun.max.fill",
                            title: "Sunny Day Effects",
                            description: "Enhanced lighting on clear days"
                        )
                    }
                }
            }
        }
        .alert("Get OpenWeatherMap API Key", isPresented: $showingAPIKeyAlert) {
            Button("Visit Website") {
                if let url = URL(string: "https://openweathermap.org/api") {
                    UIApplication.shared.open(url)
                }
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("Visit OpenWeatherMap to get a free API key for weather integration.")
        }
    }
}

struct WeatherFeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 20)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}
```

## Weather Status Display

```swift
struct WeatherStatusView: View {
    @ObservedObject var viewModel: LightingSettingsViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            // Current Weather
            if let currentWeather = viewModel.currentWeather {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Current Weather")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    HStack {
                        Image(systemName: currentWeather.icon)
                            .foregroundColor(.blue)
                            .font(.title2)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(currentWeather.description)
                                .font(.subheadline)
                                .fontWeight(.medium)
                            Text("\(currentWeather.temperature, specifier: "%.1f")°C")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("Cloud Cover")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text("\(currentWeather.cloudCover)%")
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }
                    }
                }
            }
            
            // Mapped Weather (if location is different)
            if viewModel.locationConfigured && viewModel.currentWeather != nil {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Location Weather")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    HStack {
                        Image(systemName: "location.fill")
                            .foregroundColor(.purple)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Weather at your configured location")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text("Used for lighting behavior calculations")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        Button("Refresh") {
                            viewModel.refreshLocationWeather()
                        }
                        .font(.caption)
                        .foregroundColor(.blue)
                    }
                }
            }
        }
    }
}
```

## Connection Testing

```swift
struct ConnectionTestingView: View {
    @ObservedObject var viewModel: LightingSettingsViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            // Location Test
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "location.fill")
                        .foregroundColor(.purple)
                    Text("Location Configuration")
                    Spacer()
                    Button("Test") {
                        viewModel.testLocationConfiguration()
                    }
                    .disabled(!viewModel.locationConfigured)
                }
                
                if viewModel.locationTestStatus != nil {
                    HStack {
                        Image(systemName: viewModel.locationTestStatus!.icon)
                            .foregroundColor(viewModel.locationTestStatus!.color)
                        Text(viewModel.locationTestStatus!.description)
                            .foregroundColor(viewModel.locationTestStatus!.color)
                        Spacer()
                    }
                }
            }
            
            // Weather Test
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "cloud.fill")
                        .foregroundColor(.blue)
                    Text("Weather Integration")
                    Spacer()
                    Button("Test") {
                        viewModel.testWeatherConnection()
                    }
                    .disabled(!viewModel.weatherConfigured)
                }
                
                if viewModel.weatherTestStatus != nil {
                    HStack {
                        Image(systemName: viewModel.weatherTestStatus!.icon)
                            .foregroundColor(viewModel.weatherTestStatus!.color)
                        Text(viewModel.weatherTestStatus!.description)
                            .foregroundColor(viewModel.weatherTestStatus!.color)
                        Spacer()
                    }
                }
            }
            
            // Timezone Test
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "clock.fill")
                        .foregroundColor(.orange)
                    Text("Timezone Mapping")
                    Spacer()
                    Button("Test") {
                        viewModel.testTimezoneMapping()
                    }
                    .disabled(viewModel.userTimezone == nil)
                }
                
                if viewModel.timezoneTestStatus != nil {
                    HStack {
                        Image(systemName: viewModel.timezoneTestStatus!.icon)
                            .foregroundColor(viewModel.timezoneTestStatus!.color)
                        Text(viewModel.timezoneTestStatus!.description)
                            .foregroundColor(viewModel.timezoneTestStatus!.color)
                        Spacer()
                    }
                }
            }
        }
    }
}
```

## Data Models

```swift
// MARK: - Location Models
enum LocationType: String, CaseIterable, Codable {
    case none = "none"
    case custom = "custom"
    case preset = "preset"
}

struct PresetLocation: Identifiable, Codable {
    let id = UUID()
    let name: String
    let latitude: Double
    let longitude: Double
    let timezone: String
    let country: String
    let description: String
}

struct CustomLocation: Codable {
    let name: String
    let latitude: Double
    let longitude: Double
}

// MARK: - Weather Models
struct WeatherData: Codable {
    let temperature: Double
    let description: String
    let icon: String
    let cloudCover: Int
    let humidity: Int
    let windSpeed: Double
    let timestamp: Date
}

enum WeatherConnectionStatus: String, Codable {
    case connected = "connected"
    case disconnected = "disconnected"
    case testing = "testing"
    case error = "error"
    
    var icon: String {
        switch self {
        case .connected: return "checkmark.circle.fill"
        case .disconnected: return "xmark.circle.fill"
        case .testing: return "clock.fill"
        case .error: return "exclamationmark.triangle.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .connected: return .green
        case .disconnected: return .gray
        case .testing: return .orange
        case .error: return .red
        }
    }
    
    var description: String {
        switch self {
        case .connected: return "Connected"
        case .disconnected: return "Disconnected"
        case .testing: return "Testing..."
        case .error: return "Connection Error"
        }
    }
}

// MARK: - Test Status Models
struct TestStatus {
    let success: Bool
    let message: String
    let timestamp: Date
    
    var icon: String {
        success ? "checkmark.circle.fill" : "xmark.circle.fill"
    }
    
    var color: Color {
        success ? .green : .red
    }
    
    var description: String {
        message
    }
}
```

## View Model

```swift
class LightingSettingsViewModel: ObservableObject {
    @Published var locationType: LocationType = .none
    @Published var customLatitude: Double = 0
    @Published var customLongitude: Double = 0
    @Published var customLocationName: String = ""
    @Published var selectedPresetLocation: PresetLocation?
    @Published var userTimezone: String?
    @Published var openWeatherAPIKey: String = ""
    
    // Status
    @Published var weatherConfigured: Bool = false
    @Published var weatherConnectionStatus: WeatherConnectionStatus = .disconnected
    @Published var currentWeather: WeatherData?
    @Published var locationWeather: WeatherData?
    
    // Test Status
    @Published var locationTestStatus: TestStatus?
    @Published var weatherTestStatus: TestStatus?
    @Published var timezoneTestStatus: TestStatus?
    
    // Computed Properties
    var locationConfigured: Bool {
        switch locationType {
        case .none: return false
        case .custom: return customLatitude != 0 && customLongitude != 0
        case .preset: return selectedPresetLocation != nil
        }
    }
    
    var locationTimezone: String? {
        switch locationType {
        case .none: return nil
        case .custom: return nil // Would need to be determined by coordinates
        case .preset: return selectedPresetLocation?.timezone
        }
    }
    
    var hasChanges: Bool {
        // TODO: Implement change tracking
        return true
    }
    
    // MARK: - Methods
    func loadSettings() {
        // TODO: Load settings from core service
    }
    
    func saveSettings() async {
        // TODO: Save settings to core service
    }
    
    func testWeatherConnection() {
        // TODO: Test OpenWeatherMap API connection
    }
    
    func testLocationConfiguration() {
        // TODO: Test location configuration
    }
    
    func testTimezoneMapping() {
        // TODO: Test timezone mapping
    }
    
    func refreshLocationWeather() {
        // TODO: Refresh weather for configured location
    }
}
```

## API Integration

```swift
class LightingSettingsAPI {
    static let shared = LightingSettingsAPI()
    
    func saveSettings(_ settings: LightingSettings) async throws {
        // TODO: Save to core service
    }
    
    func loadSettings() async throws -> LightingSettings {
        // TODO: Load from core service
        return LightingSettings()
    }
    
    func testWeatherConnection(apiKey: String) async throws -> Bool {
        // TODO: Test OpenWeatherMap API
        return true
    }
    
    func getCurrentWeather(latitude: Double, longitude: Double, apiKey: String) async throws -> WeatherData {
        // TODO: Call OpenWeatherMap API
        return WeatherData(
            temperature: 22.5,
            description: "Partly Cloudy",
            icon: "cloud.sun.fill",
            cloudCover: 45,
            humidity: 65,
            windSpeed: 12.3,
            timestamp: Date()
        )
    }
}

struct LightingSettings: Codable {
    let locationType: LocationType
    let customLocation: CustomLocation?
    let presetLocation: PresetLocation?
    let userTimezone: String?
    let openWeatherAPIKey: String?
}
```

## Implementation Checklist

### Phase 1: Foundation
- [ ] Location configuration (none/custom/preset)
- [ ] Timezone selection and mapping
- [ ] OpenWeatherMap API key configuration
- [ ] Settings storage in core service
- [ ] Basic connection testing

### Phase 2: Weather Integration
- [ ] OpenWeatherMap API integration
- [ ] Current weather display
- [ ] Location weather fetching
- [ ] Weather status monitoring
- [ ] Error handling and retry logic

### Phase 3: Advanced Features
- [ ] Preset location database
- [ ] Timezone offset calculations
- [ ] Weather effect previews
- [ ] Location validation
- [ ] Offline support

## Notes for Implementation

### Key Features to Implement
1. **Location Configuration**: Flexible location setup (none/custom/preset)
2. **Timezone Mapping**: Proper timezone handling for lighting schedules
3. **Weather Integration**: OpenWeatherMap API for weather effects
4. **Connection Testing**: Validate all configurations
5. **Settings Persistence**: Store in core service

### Technical Considerations
- **API Key Security**: Secure storage of OpenWeatherMap API key
- **Timezone Handling**: Proper timezone conversion for lighting schedules
- **Weather Caching**: Cache weather data to reduce API calls
- **Error Handling**: Graceful handling of API failures
- **Validation**: Validate coordinates and API keys

### User Experience Priorities
1. **Clear Configuration**: Easy location and timezone setup
2. **Visual Feedback**: Clear status indicators for all connections
3. **Testing Tools**: Easy way to test all configurations
4. **Helpful Explanations**: Clear explanations of timezone mapping
5. **Flexible Options**: Support for no location or custom setups

This lighting settings foundation will enable the full lighting control system with location-based behaviors and weather effects. 