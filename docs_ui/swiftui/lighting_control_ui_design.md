# Lighting Control UI/UX Design (WIP - Placeholder)

## Overview

The Lighting Control system provides comprehensive management of aquarium lighting with advanced behaviors, effects, overrides, and weather integration. This document establishes the UI/UX foundation for future implementation.

**Status**: Work in Progress - Core functionality planned but not yet implemented
**Priority**: High - Essential for reef health and automation
**Dependencies**: HAL PWM Management, Weather integration

## Design System

### Color Palette
- **Primary Gold**: `#F4A261` - Main lighting actions, warm sunlight
- **Lighting Blue**: `#2E86AB` - Lighting-specific actions and highlights
- **Success Green**: `#34C759` - Connected status, operational
- **Warning Orange**: `#FF9500` - Discovery in progress, pending states
- **Error Red**: `#FF3B30` - Error states, disconnected status
- **Moonlight Purple**: `#8B5CF6` - Moonlight and night modes
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
- **Lighting**: `lightbulb.fill` - Lighting control
- **Sun**: `sun.max.fill` - Daylight behaviors
- **Moon**: `moon.fill` - Moonlight behaviors
- **Cloud**: `cloud.fill` - Weather effects
- **Wave**: `waveform.path` - Wave patterns
- **Settings**: `gearshape.fill` - Configuration
- **Status**: `circle.fill` - Status indicators

## Main Dashboard Integration

### Quick Actions Card
```swift
struct LightingQuickActionsCard: View {
    @StateObject private var viewModel = LightingQuickActionsViewModel()
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(.orange)
                    .font(.title2)
                
                Text("Lighting Control")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            // Current Behavior
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Current Behavior")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(viewModel.currentBehaviorName)
                        .font(.headline)
                        .fontWeight(.semibold)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Intensity")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(Int(viewModel.currentIntensity))%")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.orange)
                }
            }
            
            // Quick Override
            Button(action: { viewModel.showOverrideSheet = true }) {
                HStack {
                    Image(systemName: "slider.horizontal.3")
                    Text("Manual Override")
                    Spacer()
                }
                .padding()
                .background(Color.orange.opacity(0.1))
                .cornerRadius(8)
            }
            
            // Weather Effects
            if viewModel.weatherEffectsActive {
                HStack {
                    Image(systemName: "cloud.fill")
                        .foregroundColor(.blue)
                    Text("Weather Effects Active")
                        .font(.caption)
                        .foregroundColor(.blue)
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        .sheet(isPresented: $viewModel.showOverrideSheet) {
            LightingOverrideView(viewModel: viewModel)
        }
    }
}
```

## Lighting Control Tab

### Main Lighting Screen
```swift
struct LightingControlView: View {
    @StateObject private var viewModel = LightingControlViewModel()
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab Picker
                Picker("Tab", selection: $selectedTab) {
                    Text("Behaviors").tag(0)
                    Text("Channels").tag(1)
                    Text("Effects").tag(2)
                    Text("Preview").tag(3)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                // Tab Content
                TabView(selection: $selectedTab) {
                    LightingBehaviorsView(viewModel: viewModel)
                        .tag(0)
                    
                    LightingChannelsView(viewModel: viewModel)
                        .tag(1)
                    
                    LightingEffectsView(viewModel: viewModel)
                        .tag(2)
                    
                    LightingPreviewView(viewModel: viewModel)
                        .tag(3)
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            }
            .navigationTitle("Lighting Control")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
```

### Behaviors Tab
```swift
struct LightingBehaviorsView: View {
    @ObservedObject var viewModel: LightingControlViewModel
    @State private var showingAddBehavior = false
    
    var body: some View {
        List {
            // Current Behavior
            if let currentBehavior = viewModel.currentBehavior {
                Section(header: Text("Current Behavior")) {
                    CurrentBehaviorRow(behavior: currentBehavior) {
                        viewModel.editBehavior(currentBehavior)
                    }
                }
            }
            
            // Available Behaviors
            Section(header: Text("Available Behaviors")) {
                ForEach(viewModel.availableBehaviors) { behavior in
                    BehaviorRow(behavior: behavior) {
                        viewModel.selectBehavior(behavior)
                    }
                }
            }
            
            // Behavior Types
            Section(header: Text("Behavior Types")) {
                ForEach(LightingBehaviorType.allCases, id: \.self) { type in
                    NavigationLink(destination: BehaviorTypeDetailView(type: type)) {
                        BehaviorTypeRow(type: type)
                    }
                }
            }
            
            // Quick Actions
            Section(header: Text("Quick Actions")) {
                Button(action: { viewModel.startDayMode() }) {
                    HStack {
                        Image(systemName: "sun.max.fill")
                            .foregroundColor(.orange)
                        Text("Start Day Mode")
                    }
                }
                
                Button(action: { viewModel.startNightMode() }) {
                    HStack {
                        Image(systemName: "moon.fill")
                            .foregroundColor(.purple)
                        Text("Start Night Mode")
                    }
                }
                
                Button(action: { viewModel.startStormEffect() }) {
                    HStack {
                        Image(systemName: "cloud.rain.fill")
                            .foregroundColor(.blue)
                        Text("Storm Effect")
                    }
                }
            }
        }
        .sheet(isPresented: $showingAddBehavior) {
            AddBehaviorView(viewModel: viewModel)
        }
    }
}
```

### Channels Tab
```swift
struct LightingChannelsView: View {
    @ObservedObject var viewModel: LightingControlViewModel
    
    var body: some View {
        List {
            // Channel Groups
            Section(header: Text("Channel Groups")) {
                ForEach(viewModel.channelGroups) { group in
                    ChannelGroupRow(group: group) {
                        viewModel.controlGroup(group)
                    }
                }
            }
            
            // Individual Channels
            Section(header: Text("Individual Channels")) {
                ForEach(viewModel.lightingChannels) { channel in
                    LightingChannelRow(channel: channel) {
                        viewModel.controlChannel(channel)
                    }
                }
            }
            
            // Channel Status
            Section(header: Text("Channel Status")) {
                HStack {
                    Image(systemName: "lightbulb.fill")
                        .foregroundColor(.orange)
                    Text("Active Channels")
                    Spacer()
                    Text("\(viewModel.activeChannelCount)")
                        .fontWeight(.semibold)
                }
                
                HStack {
                    Image(systemName: "waveform.path")
                        .foregroundColor(.blue)
                    Text("Total Intensity")
                    Spacer()
                    Text("\(Int(viewModel.totalIntensity))%")
                        .fontWeight(.semibold)
                }
            }
        }
    }
}
```

### Effects Tab
```swift
struct LightingEffectsView: View {
    @ObservedObject var viewModel: LightingControlViewModel
    @State private var showingAddEffect = false
    
    var body: some View {
        List {
            // Active Effects
            if !viewModel.activeEffects.isEmpty {
                Section(header: Text("Active Effects")) {
                    ForEach(viewModel.activeEffects) { effect in
                        ActiveEffectRow(effect: effect) {
                            viewModel.stopEffect(effect)
                        }
                    }
                }
            }
            
            // Available Effects
            Section(header: Text("Available Effects")) {
                ForEach(LightingEffectType.allCases, id: \.self) { type in
                    EffectTypeRow(type: type) {
                        viewModel.startEffect(type)
                    }
                }
            }
            
            // Weather Effects
            Section(header: Text("Weather Effects")) {
                Toggle("Enable Weather Integration", isOn: $viewModel.weatherIntegrationEnabled)
                
                if viewModel.weatherIntegrationEnabled {
                    HStack {
                        Image(systemName: "cloud.fill")
                            .foregroundColor(.blue)
                        Text("Current Weather")
                        Spacer()
                        Text(viewModel.currentWeather)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // Override System
            Section(header: Text("Manual Override")) {
                Button(action: { viewModel.showOverrideSheet = true }) {
                    HStack {
                        Image(systemName: "slider.horizontal.3")
                        Text("Manual Intensity Control")
                    }
                }
                
                if viewModel.overrideActive {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange)
                        Text("Override Active")
                        Spacer()
                        Button("Clear") {
                            viewModel.clearOverride()
                        }
                        .foregroundColor(.red)
                    }
                }
            }
        }
        .sheet(isPresented: $showingAddEffect) {
            AddEffectView(viewModel: viewModel)
        }
    }
}
```

## Data Models (Placeholder)

```swift
// MARK: - Lighting Behavior Models
struct LightingBehavior: Identifiable, Codable {
    let id = UUID()
    let name: String
    let type: LightingBehaviorType
    let configuration: BehaviorConfiguration
    var isActive: Bool = false
    var currentIntensity: Double = 0
}

enum LightingBehaviorType: String, CaseIterable, Codable {
    case fixed = "Fixed"
    case diurnal = "Diurnal"
    case lunar = "Lunar"
    case location = "Location-Based"
    case circadian = "Circadian"
    case moonlight = "Moonlight"
    case effect = "Effect"
}

struct BehaviorConfiguration: Codable {
    let startTime: String?
    let endTime: String?
    let intensity: Double?
    let sunriseHour: Double?
    let sunsetHour: Double?
    let peakIntensity: Double?
    let minIntensity: Double?
    let rampDuration: Double?
    let location: String?
    let weatherInfluence: Bool?
}

// MARK: - Lighting Channel Models
struct LightingChannel: Identifiable, Codable {
    let id = UUID()
    let name: String
    let controllerId: UUID
    let channelId: Int
    var currentIntensity: Double = 0
    var isActive: Bool = false
    var assignedBehavior: UUID?
}

struct ChannelGroup: Identifiable, Codable {
    let id = UUID()
    let name: String
    let channels: [UUID]
    var currentIntensity: Double = 0
    var isActive: Bool = false
}

// MARK: - Lighting Effect Models
struct LightingEffect: Identifiable, Codable {
    let id = UUID()
    let name: String
    let type: LightingEffectType
    let parameters: EffectParameters
    let startTime: Date
    let duration: TimeInterval
    var isActive: Bool = false
}

enum LightingEffectType: String, CaseIterable, Codable {
    case storm = "Storm"
    case fade = "Fade"
    case pulse = "Pulse"
    case wave = "Wave"
    case lightning = "Lightning"
    case cloud = "Cloud Cover"
}

struct EffectParameters: Codable {
    let intensity: Double?
    let frequency: Double?
    let duration: TimeInterval?
    let pattern: String?
}
```

## View Models (Placeholder)

```swift
class LightingQuickActionsViewModel: ObservableObject {
    @Published var currentBehaviorName: String = "No Behavior"
    @Published var currentIntensity: Double = 0
    @Published var weatherEffectsActive: Bool = false
    @Published var showOverrideSheet: Bool = false
    
    func showOverrideSheet() {
        showOverrideSheet = true
    }
}

class LightingControlViewModel: ObservableObject {
    @Published var currentBehavior: LightingBehavior?
    @Published var availableBehaviors: [LightingBehavior] = []
    @Published var lightingChannels: [LightingChannel] = []
    @Published var channelGroups: [ChannelGroup] = []
    @Published var activeEffects: [LightingEffect] = []
    @Published var weatherIntegrationEnabled: Bool = false
    @Published var currentWeather: String = "Unknown"
    @Published var overrideActive: Bool = false
    @Published var activeChannelCount: Int = 0
    @Published var totalIntensity: Double = 0
    @Published var showOverrideSheet: Bool = false
    
    func selectBehavior(_ behavior: LightingBehavior) {
        // TODO: Implement behavior selection
    }
    
    func editBehavior(_ behavior: LightingBehavior) {
        // TODO: Implement behavior editing
    }
    
    func controlGroup(_ group: ChannelGroup) {
        // TODO: Implement group control
    }
    
    func controlChannel(_ channel: LightingChannel) {
        // TODO: Implement channel control
    }
    
    func startEffect(_ type: LightingEffectType) {
        // TODO: Implement effect start
    }
    
    func stopEffect(_ effect: LightingEffect) {
        // TODO: Implement effect stop
    }
    
    func startDayMode() {
        // TODO: Implement day mode
    }
    
    func startNightMode() {
        // TODO: Implement night mode
    }
    
    func startStormEffect() {
        // TODO: Implement storm effect
    }
    
    func showOverrideSheet() {
        showOverrideSheet = true
    }
    
    func clearOverride() {
        // TODO: Implement override clear
    }
}
```

## API Integration (Placeholder)

```swift
class LightingAPI {
    static let shared = LightingAPI()
    
    func getBehaviors() async throws -> [LightingBehavior] {
        // TODO: Implement behaviors API
        return []
    }
    
    func createBehavior(_ behavior: LightingBehavior) async throws {
        // TODO: Implement behavior creation API
    }
    
    func getChannels() async throws -> [LightingChannel] {
        // TODO: Implement channels API
        return []
    }
    
    func setChannelIntensity(_ channelId: UUID, intensity: Double) async throws {
        // TODO: Implement channel control API
    }
    
    func startEffect(_ effect: LightingEffect) async throws {
        // TODO: Implement effect API
    }
    
    func getWeatherStatus() async throws -> WeatherStatus {
        // TODO: Implement weather API
        return WeatherStatus(current: "Unknown", influence: false)
    }
}

struct WeatherStatus: Codable {
    let current: String
    let influence: Bool
}
```

## Implementation Checklist

### Phase 1: Foundation (Future)
- [ ] Behavior management system
- [ ] Channel control and assignment
- [ ] Basic effect system
- [ ] Manual override functionality
- [ ] HAL PWM integration

### Phase 2: Advanced Features (Future)
- [ ] Weather integration
- [ ] Location-based behaviors
- [ ] Advanced effect patterns
- [ ] Preview system
- [ ] Schedule management

### Phase 3: Integration (Future)
- [ ] HAL service integration
- [ ] Weather API integration
- [ ] Advanced scheduling
- [ ] Analytics and reporting
- [ ] Mobile app integration

## Notes for Future Implementation

### Key Features to Implement
1. **Behavior System**: Complete lighting behavior management
2. **Channel Control**: Individual and group channel control
3. **Effect System**: Weather and manual effects
4. **Override System**: Manual intensity control
5. **Integration**: HAL PWM and weather services

### Technical Considerations
- **HAL Integration**: Use PWM controllers for intensity control
- **Weather API**: OpenWeatherMap integration for effects
- **Performance**: Real-time intensity calculations
- **Reliability**: Lighting is critical for reef health

### User Experience Priorities
1. **Intuitive Control**: Easy behavior selection and modification
2. **Visual Feedback**: Clear intensity and status indicators
3. **Quick Access**: Fast override and effect controls
4. **Preview System**: Visual behavior preview before activation
5. **Weather Integration**: Automatic weather-based effects

This placeholder establishes the foundation for future Lighting Control implementation while keeping the current focus on working systems. 