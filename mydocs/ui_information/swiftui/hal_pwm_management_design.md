# HAL PWM Management & Control UI/UX Design

## Overview

The HAL PWM Management system provides comprehensive control over PWM controllers and channels for the Bella's Reef system. The interface includes settings for controller discovery, channel registration with proper device roles, and a testing interface for validating PWM functionality with sliders and ramping functions.

## Design System

### Color Palette
- **Primary Blue**: `#007AFF` - Main actions, selected states
- **Secondary Blue**: `#5AC8FA` - Secondary actions, highlights
- **Success Green**: `#34C759` - Connected status, operational
- **Warning Orange**: `#FF9500` - Discovery in progress, pending states
- **Error Red**: `#FF3B30` - Error states, disconnected status
- **Purple**: `#AF52DE` - PWM-specific actions, testing
- **Neutral Gray**: `#8E8E93` - Disabled states, secondary text
- **Background**: `#F2F2F7` - Screen backgrounds
- **Card Background**: `#FFFFFF` - Card and modal backgrounds

### Typography
- **Title**: SF Pro Display, 28pt, Bold
- **Section Header**: SF Pro Display, 22pt, Semibold
- **Body**: SF Pro Text, 17pt, Regular
- **Caption**: SF Pro Text, 13pt, Regular
- **Button**: SF Pro Text, 17pt, Semibold
- **Channel Label**: SF Pro Text, 15pt, Medium

### Icons
- **Controller**: `cpu` - PWM controllers
- **Channel**: `waveform.path` - PWM channels
- **Discovery**: `magnifyingglass` - Controller discovery
- **Settings**: `gearshape.fill` - Configuration
- **Test**: `slider.horizontal.3` - Testing interface
- **Ramp**: `chart.line.uptrend.xyaxis` - Ramping functions
- **Checkmark**: `checkmark.circle.fill` - Connected/verified
- **Exclamation**: `exclamationmark.triangle.fill` - Warning/error
- **Plus**: `plus.circle.fill` - Add new items
- **Trash**: `trash.fill` - Delete items
- **Refresh**: `arrow.clockwise` - Discover/refresh

## Settings Tab Design

### Main HAL Settings Screen

```swift
struct HALPWMSettingsView: View {
    @StateObject private var viewModel = HALPWMSettingsViewModel()
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab Picker
                Picker("Tab", selection: $selectedTab) {
                    Text("Controllers").tag(0)
                    Text("Channels").tag(1)
                    Text("Testing").tag(2)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                // Tab Content
                TabView(selection: $selectedTab) {
                    ControllersTabView(viewModel: viewModel)
                        .tag(0)
                    
                    ChannelsTabView(viewModel: viewModel)
                        .tag(1)
                    
                    TestingTabView(viewModel: viewModel)
                        .tag(2)
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            }
            .navigationTitle("HAL PWM Control")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

struct ControllersTabView: View {
    @ObservedObject var viewModel: HALPWMSettingsViewModel
    @State private var showingDiscovery = false
    
    var body: some View {
        List {
            // Discovery Section
            Section(header: Text("Controller Discovery")) {
                Button(action: { showingDiscovery = true }) {
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.blue)
                        Text("Discover PWM Controllers")
                            .foregroundColor(.blue)
                    }
                }
                
                if viewModel.discoveryInProgress {
                    HStack {
                        ProgressView()
                            .scaleEffect(0.8)
                        Text("Discovering controllers...")
                            .foregroundColor(.secondary)
                    }
                }
                
                if !viewModel.discoveredControllers.isEmpty {
                    Text("\(viewModel.discoveredControllers.count) controllers found")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            // Discovered Controllers
            if !viewModel.discoveredControllers.isEmpty {
                Section(header: Text("Discovered Controllers")) {
                    ForEach(viewModel.discoveredControllers) { controller in
                        DiscoveredControllerRow(controller: controller) {
                            viewModel.registerController(controller)
                        }
                    }
                }
            }
            
            // Registered Controllers
            if !viewModel.registeredControllers.isEmpty {
                Section(header: Text("Registered Controllers")) {
                    ForEach(viewModel.registeredControllers) { controller in
                        RegisteredControllerRow(controller: controller) {
                            viewModel.unregisterController(controller)
                        }
                    }
                }
            }
            
            // System Status
            Section(header: Text("System Status")) {
                HStack {
                    Image(systemName: "cpu")
                        .foregroundColor(.blue)
                    Text("Total Controllers")
                    Spacer()
                    Text("\(viewModel.totalControllerCount)")
                        .fontWeight(.semibold)
                }
                
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Registered")
                    Spacer()
                    Text("\(viewModel.registeredControllerCount)")
                        .fontWeight(.semibold)
                }
                
                HStack {
                    Image(systemName: "waveform.path")
                        .foregroundColor(.purple)
                    Text("Total Channels")
                    Spacer()
                    Text("\(viewModel.totalChannelCount)")
                        .fontWeight(.semibold)
                }
            }
        }
        .sheet(isPresented: $showingDiscovery) {
            ControllerDiscoveryView(viewModel: viewModel)
        }
    }
}

struct DiscoveredControllerRow: View {
    let controller: PWMController
    let onRegister: () -> Void
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(controller.name)
                    .font(.headline)
                Text(controller.type.rawValue)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("Address: \(controller.address)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button("Register") {
                onRegister()
            }
            .font(.caption)
            .foregroundColor(.blue)
        }
        .padding(.vertical, 4)
    }
}

struct RegisteredControllerRow: View {
    let controller: PWMController
    let onUnregister: () -> Void
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(controller.name)
                    .font(.headline)
                Text(controller.type.rawValue)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("Channels: \(controller.channelCount)")
                    .font(.caption2)
                    .foregroundColor(.purple)
            }
            
            Spacer()
            
            if controller.isConnected {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            }
            
            Button(action: onUnregister) {
                Image(systemName: "trash.fill")
                    .foregroundColor(.red)
            }
        }
        .padding(.vertical, 4)
    }
}
```

### Channels Tab View

```swift
struct ChannelsTabView: View {
    @ObservedObject var viewModel: HALPWMSettingsViewModel
    @State private var showingAddChannel = false
    
    var body: some View {
        List {
            // Channel Registration
            if !viewModel.registeredControllers.isEmpty {
                Section(header: Text("Channel Registration")) {
                    Button(action: { showingAddChannel = true }) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.blue)
                            Text("Add PWM Channel")
                                .foregroundColor(.blue)
                        }
                    }
                }
            }
            
            // Registered Channels by Controller
            ForEach(viewModel.registeredControllers) { controller in
                Section(header: Text("\(controller.name) Channels")) {
                    ForEach(viewModel.channelsForController(controller)) { channel in
                        RegisteredChannelRow(channel: channel) {
                            viewModel.deleteChannel(channel)
                        }
                    }
                    
                    if viewModel.channelsForController(controller).isEmpty {
                        Text("No channels registered")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.vertical, 8)
                    }
                }
            }
            
            // Channel Summary
            if !viewModel.registeredChannels.isEmpty {
                Section(header: Text("Channel Summary")) {
                    HStack {
                        Image(systemName: "waveform.path")
                            .foregroundColor(.purple)
                        Text("Total Channels")
                        Spacer()
                        Text("\(viewModel.registeredChannels.count)")
                            .fontWeight(.semibold)
                    }
                    
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Active")
                        Spacer()
                        Text("\(viewModel.activeChannelCount)")
                            .fontWeight(.semibold)
                    }
                    
                    HStack {
                        Image(systemName: "pause.circle.fill")
                            .foregroundColor(.orange)
                        Text("Inactive")
                        Spacer()
                        Text("\(viewModel.inactiveChannelCount)")
                            .fontWeight(.semibold)
                    }
                }
            }
        }
        .sheet(isPresented: $showingAddChannel) {
            AddChannelView(viewModel: viewModel)
        }
    }
}

struct RegisteredChannelRow: View {
    let channel: PWMChannel
    let onDelete: () -> Void
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(channel.name)
                    .font(.headline)
                Text("Controller: \(channel.controllerName)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                HStack {
                    Text("Channel: \(channel.channelId)")
                        .font(.caption2)
                        .foregroundColor(.purple)
                    Text("Role: \(channel.deviceRole.rawValue)")
                        .font(.caption2)
                        .foregroundColor(.blue)
                }
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text("\(Int(channel.currentDutyCycle))%")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(channel.isActive ? .green : .secondary)
                
                if channel.isActive {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.caption)
                }
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

### Testing Tab View

```swift
struct TestingTabView: View {
    @ObservedObject var viewModel: HALPWMSettingsViewModel
    @State private var selectedChannel: PWMChannel?
    @State private var showingRampTest = false
    
    var body: some View {
        List {
            // Quick Test Section
            if !viewModel.registeredChannels.isEmpty {
                Section(header: Text("Quick Test")) {
                    ForEach(viewModel.registeredChannels) { channel in
                        ChannelTestRow(
                            channel: channel,
                            onDutyCycleChange: { newValue in
                                viewModel.setChannelDutyCycle(channel, dutyCycle: newValue)
                            }
                        )
                    }
                }
            }
            
            // Ramp Testing
            if !viewModel.registeredChannels.isEmpty {
                Section(header: Text("Ramp Testing")) {
                    Button(action: { showingRampTest = true }) {
                        HStack {
                            Image(systemName: "chart.line.uptrend.xyaxis")
                                .foregroundColor(.purple)
                            Text("Test Ramp Functions")
                                .foregroundColor(.purple)
                        }
                    }
                }
            }
            
            // Test Results
            if !viewModel.testResults.isEmpty {
                Section(header: Text("Test Results")) {
                    ForEach(viewModel.testResults) { result in
                        TestResultRow(result: result)
                    }
                }
            }
            
            // System Status
            Section(header: Text("Testing Status")) {
                HStack {
                    Image(systemName: "slider.horizontal.3")
                        .foregroundColor(.purple)
                    Text("Test Mode")
                    Spacer()
                    Text(viewModel.testModeEnabled ? "Active" : "Inactive")
                        .foregroundColor(viewModel.testModeEnabled ? .green : .secondary)
                }
                
                HStack {
                    Image(systemName: "waveform.path")
                        .foregroundColor(.blue)
                    Text("Channels in Test")
                    Spacer()
                    Text("\(viewModel.channelsInTest)")
                        .fontWeight(.semibold)
                }
            }
        }
        .sheet(isPresented: $showingRampTest) {
            RampTestView(viewModel: viewModel)
        }
    }
}

struct ChannelTestRow: View {
    let channel: PWMChannel
    let onDutyCycleChange: (Double) -> Void
    @State private var dutyCycle: Double
    
    init(channel: PWMChannel, onDutyCycleChange: @escaping (Double) -> Void) {
        self.channel = channel
        self.onDutyCycleChange = onDutyCycleChange
        self._dutyCycle = State(initialValue: channel.currentDutyCycle)
    }
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(channel.name)
                        .font(.headline)
                    Text("Controller: \(channel.controllerName)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("Role: \(channel.deviceRole.rawValue)")
                        .font(.caption2)
                        .foregroundColor(.blue)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(Int(dutyCycle))%")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(dutyCycle > 0 ? .green : .secondary)
                    
                    if dutyCycle > 0 {
                        Image(systemName: "waveform.path")
                            .foregroundColor(.green)
                    }
                }
            }
            
            // Duty Cycle Slider
            VStack(spacing: 8) {
                HStack {
                    Text("0%")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("100%")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Slider(value: $dutyCycle, in: 0...100, step: 1) { editing in
                    if !editing {
                        onDutyCycleChange(dutyCycle)
                    }
                }
                .accentColor(.purple)
            }
            
            // Quick Buttons
            HStack(spacing: 12) {
                Button("0%") {
                    dutyCycle = 0
                    onDutyCycleChange(0)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(Color.gray.opacity(0.2))
                .foregroundColor(.primary)
                .cornerRadius(8)
                
                Button("25%") {
                    dutyCycle = 25
                    onDutyCycleChange(25)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(Color.blue.opacity(0.2))
                .foregroundColor(.blue)
                .cornerRadius(8)
                
                Button("50%") {
                    dutyCycle = 50
                    onDutyCycleChange(50)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(Color.orange.opacity(0.2))
                .foregroundColor(.orange)
                .cornerRadius(8)
                
                Button("100%") {
                    dutyCycle = 100
                    onDutyCycleChange(100)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(Color.green.opacity(0.2))
                .foregroundColor(.green)
                .cornerRadius(8)
            }
        }
        .padding(.vertical, 8)
    }
}
```

## Add Channel View

```swift
struct AddChannelView: View {
    @ObservedObject var viewModel: HALPWMSettingsViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var selectedController: PWMController?
    @State private var channelId: String = ""
    @State private var channelName: String = ""
    @State private var selectedDeviceRole: DeviceRole = .lighting
    @State private var showingValidationError = false
    @State private var validationMessage = ""
    
    var body: some View {
        NavigationView {
            Form {
                // Controller Selection
                Section(header: Text("Controller")) {
                    Picker("Controller", selection: $selectedController) {
                        Text("Select Controller").tag(nil as PWMController?)
                        ForEach(viewModel.registeredControllers) { controller in
                            Text(controller.name).tag(controller as PWMController?)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                // Channel Configuration
                if let controller = selectedController {
                    Section(header: Text("Channel Configuration")) {
                        TextField("Channel Name", text: $channelName)
                        
                        TextField("Channel ID", text: $channelId)
                            .keyboardType(.numberPad)
                        
                        Picker("Device Role", selection: $selectedDeviceRole) {
                            ForEach(DeviceRole.allCases, id: \.self) { role in
                                Text(role.rawValue).tag(role)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        
                        // Channel ID Validation
                        if !channelId.isEmpty {
                            ChannelIdValidationView(
                                controller: controller,
                                channelId: channelId
                            )
                        }
                    }
                    
                    // Controller Info
                    Section(header: Text("Controller Information")) {
                        InfoRow(title: "Type", value: controller.type.rawValue)
                        InfoRow(title: "Address", value: controller.address)
                        InfoRow(title: "Max Channels", value: "\(controller.channelCount)")
                        InfoRow(title: "Available Channels", value: "\(viewModel.availableChannelsForController(controller).count)")
                    }
                }
            }
            .navigationTitle("Add PWM Channel")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        addChannel()
                    }
                    .disabled(!canAddChannel)
                }
            }
            .alert("Validation Error", isPresented: $showingValidationError) {
                Button("OK") { }
            } message: {
                Text(validationMessage)
            }
        }
    }
    
    private var canAddChannel: Bool {
        selectedController != nil &&
        !channelName.isEmpty &&
        !channelId.isEmpty &&
        viewModel.isValidChannelId(channelId, for: selectedController!)
    }
    
    private func addChannel() {
        guard let controller = selectedController else { return }
        
        let validation = viewModel.validateChannelConfiguration(
            controller: controller,
            channelId: channelId,
            name: channelName,
            deviceRole: selectedDeviceRole
        )
        
        if validation.isValid {
            viewModel.addChannel(
                controller: controller,
                channelId: channelId,
                name: channelName,
                deviceRole: selectedDeviceRole
            )
            dismiss()
        } else {
            validationMessage = validation.errorMessage
            showingValidationError = true
        }
    }
}

struct ChannelIdValidationView: View {
    let controller: PWMController
    let channelId: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if let id = Int(channelId) {
                switch controller.type {
                case .native:
                    if id >= 0 && id <= 1 {
                        Label("Valid Native PWM Channel", systemImage: "checkmark.circle.fill")
                            .foregroundColor(.green)
                    } else {
                        Label("Invalid: Native supports channels 0-1", systemImage: "xmark.circle.fill")
                            .foregroundColor(.red)
                    }
                case .pca9685:
                    if id >= 0 && id <= 15 {
                        Label("Valid PCA9685 Channel", systemImage: "checkmark.circle.fill")
                            .foregroundColor(.green)
                    } else {
                        Label("Invalid: PCA9685 supports channels 0-15", systemImage: "xmark.circle.fill")
                            .foregroundColor(.red)
                    }
                }
            } else {
                Label("Invalid channel ID format", systemImage: "xmark.circle.fill")
                    .foregroundColor(.red)
            }
        }
        .font(.caption)
    }
}
```

## Ramp Test View

```swift
struct RampTestView: View {
    @ObservedObject var viewModel: HALPWMSettingsViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var selectedChannels: Set<PWMChannel> = []
    @State private var startDutyCycle: Double = 0
    @State private var endDutyCycle: Double = 100
    @State private var rampDuration: Double = 5
    @State private var rampType: RampType = .linear
    @State private var isRunning = false
    
    var body: some View {
        NavigationView {
            Form {
                // Channel Selection
                Section(header: Text("Select Channels")) {
                    ForEach(viewModel.registeredChannels) { channel in
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(channel.name)
                                    .font(.headline)
                                Text("Controller: \(channel.controllerName)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            if selectedChannels.contains(channel) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            if selectedChannels.contains(channel) {
                                selectedChannels.remove(channel)
                            } else {
                                selectedChannels.insert(channel)
                            }
                        }
                    }
                }
                
                // Ramp Configuration
                Section(header: Text("Ramp Configuration")) {
                    VStack(spacing: 16) {
                        // Start Duty Cycle
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Start Duty Cycle: \(Int(startDutyCycle))%")
                                .font(.subheadline)
                            Slider(value: $startDutyCycle, in: 0...100, step: 1)
                                .accentColor(.blue)
                        }
                        
                        // End Duty Cycle
                        VStack(alignment: .leading, spacing: 8) {
                            Text("End Duty Cycle: \(Int(endDutyCycle))%")
                                .font(.subheadline)
                            Slider(value: $endDutyCycle, in: 0...100, step: 1)
                                .accentColor(.green)
                        }
                        
                        // Duration
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Duration: \(rampDuration, specifier: "%.1f")s")
                                .font(.subheadline)
                            Slider(value: $rampDuration, in: 0.5...30, step: 0.5)
                                .accentColor(.orange)
                        }
                        
                        // Ramp Type
                        Picker("Ramp Type", selection: $rampType) {
                            ForEach(RampType.allCases, id: \.self) { type in
                                Text(type.rawValue).tag(type)
                            }
                        }
                        .pickerStyle(SegmentedPickerStyle())
                    }
                }
                
                // Preview
                Section(header: Text("Preview")) {
                    RampPreviewView(
                        startDutyCycle: startDutyCycle,
                        endDutyCycle: endDutyCycle,
                        duration: rampDuration,
                        rampType: rampType
                    )
                    .frame(height: 100)
                }
                
                // Control
                Section {
                    Button(action: {
                        if isRunning {
                            viewModel.stopRampTest()
                            isRunning = false
                        } else {
                            viewModel.startRampTest(
                                channels: Array(selectedChannels),
                                startDutyCycle: startDutyCycle,
                                endDutyCycle: endDutyCycle,
                                duration: rampDuration,
                                rampType: rampType
                            )
                            isRunning = true
                        }
                    }) {
                        HStack {
                            Image(systemName: isRunning ? "stop.fill" : "play.fill")
                            Text(isRunning ? "Stop Ramp Test" : "Start Ramp Test")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(isRunning ? Color.red : Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .disabled(selectedChannels.isEmpty)
                }
            }
            .navigationTitle("Ramp Test")
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

struct RampPreviewView: View {
    let startDutyCycle: Double
    let endDutyCycle: Double
    let duration: Double
    let rampType: RampType
    
    var body: some View {
        GeometryReader { geometry in
            Path { path in
                let width = geometry.size.width
                let height = geometry.size.height
                
                path.move(to: CGPoint(x: 0, y: height - (startDutyCycle / 100) * height))
                
                for i in 0...100 {
                    let x = (Double(i) / 100) * width
                    let progress = Double(i) / 100
                    let dutyCycle: Double
                    
                    switch rampType {
                    case .linear:
                        dutyCycle = startDutyCycle + (endDutyCycle - startDutyCycle) * progress
                    case .easeIn:
                        dutyCycle = startDutyCycle + (endDutyCycle - startDutyCycle) * (progress * progress)
                    case .easeOut:
                        dutyCycle = startDutyCycle + (endDutyCycle - startDutyCycle) * (1 - (1 - progress) * (1 - progress))
                    case .easeInOut:
                        dutyCycle = startDutyCycle + (endDutyCycle - startDutyCycle) * (progress < 0.5 ? 2 * progress * progress : 1 - 2 * (1 - progress) * (1 - progress))
                    }
                    
                    let y = height - (dutyCycle / 100) * height
                    path.addLine(to: CGPoint(x: x, y: y))
                }
            }
            .stroke(Color.purple, lineWidth: 2)
        }
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}
```

## Data Models

```swift
// MARK: - PWM Controller Models
struct PWMController: Identifiable, Codable {
    let id = UUID()
    let name: String
    let type: ControllerType
    let address: String
    let channelCount: Int
    var isConnected: Bool = false
    var isRegistered: Bool = false
}

enum ControllerType: String, CaseIterable, Codable {
    case native = "Native PWM"
    case pca9685 = "PCA9685"
    
    var maxChannels: Int {
        switch self {
        case .native: return 2
        case .pca9685: return 16
        }
    }
    
    var channelIds: [Int] {
        switch self {
        case .native: return [0, 1]
        case .pca9685: return Array(0...15)
        }
    }
}

// MARK: - PWM Channel Models
struct PWMChannel: Identifiable, Codable {
    let id = UUID()
    let name: String
    let controllerId: UUID
    let controllerName: String
    let channelId: Int
    let deviceRole: DeviceRole
    var currentDutyCycle: Double = 0
    var isActive: Bool = false
    var lastUpdated: Date = Date()
}

enum DeviceRole: String, CaseIterable, Codable {
    case lighting = "Lighting"
    case pump = "Pump"
    case heater = "Heater"
    case chiller = "Chiller"
    case fan = "Fan"
    case other = "Other"
}

// MARK: - Testing Models
struct TestResult: Identifiable, Codable {
    let id = UUID()
    let channelId: UUID
    let channelName: String
    let testType: TestType
    let startDutyCycle: Double
    let endDutyCycle: Double
    let duration: Double
    let success: Bool
    let errorMessage: String?
    let timestamp: Date
}

enum TestType: String, Codable {
    case manual = "Manual"
    case ramp = "Ramp"
    case pulse = "Pulse"
}

enum RampType: String, CaseIterable, Codable {
    case linear = "Linear"
    case easeIn = "Ease In"
    case easeOut = "Ease Out"
    case easeInOut = "Ease In/Out"
}
```

## View Model

```swift
class HALPWMSettingsViewModel: ObservableObject {
    @Published var discoveredControllers: [PWMController] = []
    @Published var registeredControllers: [PWMController] = []
    @Published var registeredChannels: [PWMChannel] = []
    @Published var testResults: [TestResult] = []
    @Published var discoveryInProgress: Bool = false
    @Published var testModeEnabled: Bool = false
    
    private let halManager = HALPWMManager()
    
    // Computed Properties
    var totalControllerCount: Int {
        discoveredControllers.count + registeredControllers.count
    }
    
    var registeredControllerCount: Int {
        registeredControllers.count
    }
    
    var totalChannelCount: Int {
        registeredControllers.reduce(0) { $0 + $1.channelCount }
    }
    
    var activeChannelCount: Int {
        registeredChannels.filter { $0.isActive }.count
    }
    
    var inactiveChannelCount: Int {
        registeredChannels.filter { !$0.isActive }.count
    }
    
    var channelsInTest: Int {
        registeredChannels.filter { $0.currentDutyCycle > 0 }.count
    }
    
    // MARK: - Controller Management
    func discoverControllers() async {
        await MainActor.run {
            discoveryInProgress = true
        }
        
        do {
            let controllers = try await halManager.discoverControllers()
            await MainActor.run {
                self.discoveredControllers = controllers
                discoveryInProgress = false
            }
        } catch {
            await MainActor.run {
                discoveryInProgress = false
                // Handle error
            }
        }
    }
    
    func registerController(_ controller: PWMController) {
        var updatedController = controller
        updatedController.isRegistered = true
        updatedController.isConnected = true
        
        registeredControllers.append(updatedController)
        discoveredControllers.removeAll { $0.id == controller.id }
    }
    
    func unregisterController(_ controller: PWMController) {
        // Remove all channels for this controller
        registeredChannels.removeAll { $0.controllerId == controller.id }
        
        // Remove controller
        registeredControllers.removeAll { $0.id == controller.id }
    }
    
    func channelsForController(_ controller: PWMController) -> [PWMChannel] {
        registeredChannels.filter { $0.controllerId == controller.id }
    }
    
    func availableChannelsForController(_ controller: PWMController) -> [Int] {
        let usedChannels = Set(registeredChannels
            .filter { $0.controllerId == controller.id }
            .map { $0.channelId })
        
        return controller.type.channelIds.filter { !usedChannels.contains($0) }
    }
    
    // MARK: - Channel Management
    func addChannel(controller: PWMController, channelId: String, name: String, deviceRole: DeviceRole) {
        guard let id = Int(channelId) else { return }
        
        let channel = PWMChannel(
            name: name,
            controllerId: controller.id,
            controllerName: controller.name,
            channelId: id,
            deviceRole: deviceRole
        )
        
        registeredChannels.append(channel)
    }
    
    func deleteChannel(_ channel: PWMChannel) {
        registeredChannels.removeAll { $0.id == channel.id }
    }
    
    func setChannelDutyCycle(_ channel: PWMChannel, dutyCycle: Double) {
        guard let index = registeredChannels.firstIndex(where: { $0.id == channel.id }) else { return }
        
        registeredChannels[index].currentDutyCycle = dutyCycle
        registeredChannels[index].isActive = dutyCycle > 0
        registeredChannels[index].lastUpdated = Date()
        
        // Send to HAL service
        Task {
            try await halManager.setChannelDutyCycle(channel.controllerId, channelId: channel.channelId, dutyCycle: dutyCycle)
        }
    }
    
    // MARK: - Validation
    func isValidChannelId(_ channelId: String, for controller: PWMController) -> Bool {
        guard let id = Int(channelId) else { return false }
        return controller.type.channelIds.contains(id)
    }
    
    func validateChannelConfiguration(controller: PWMController, channelId: String, name: String, deviceRole: DeviceRole) -> ValidationResult {
        // Check if channel ID is valid for controller type
        guard isValidChannelId(channelId, for: controller) else {
            return ValidationResult(isValid: false, errorMessage: "Invalid channel ID for \(controller.type.rawValue)")
        }
        
        // Check if channel is already registered
        guard let id = Int(channelId) else {
            return ValidationResult(isValid: false, errorMessage: "Invalid channel ID format")
        }
        
        let existingChannel = registeredChannels.first { channel in
            channel.controllerId == controller.id && channel.channelId == id
        }
        
        if existingChannel != nil {
            return ValidationResult(isValid: false, errorMessage: "Channel \(id) is already registered")
        }
        
        // Check if name is unique
        let existingName = registeredChannels.first { $0.name == name }
        if existingName != nil {
            return ValidationResult(isValid: false, errorMessage: "Channel name '\(name)' is already in use")
        }
        
        return ValidationResult(isValid: true, errorMessage: nil)
    }
    
    // MARK: - Testing
    func startRampTest(channels: [PWMChannel], startDutyCycle: Double, endDutyCycle: Double, duration: Double, rampType: RampType) {
        testModeEnabled = true
        
        Task {
            try await halManager.startRampTest(
                channels: channels,
                startDutyCycle: startDutyCycle,
                endDutyCycle: endDutyCycle,
                duration: duration,
                rampType: rampType
            )
        }
    }
    
    func stopRampTest() {
        testModeEnabled = false
        
        Task {
            try await halManager.stopRampTest()
        }
    }
}

struct ValidationResult {
    let isValid: Bool
    let errorMessage: String?
}
```

## HAL Manager

```swift
class HALPWMManager {
    private let baseURL = "http://192.168.33.126:8003"
    private let networkManager = AuthenticatedNetworkManager.shared
    
    func discoverControllers() async throws -> [PWMController] {
        let url = URL(string: "\(baseURL)/api/controllers/discover")!
        let (data, _) = try await networkManager.authenticatedRequest(url: url)
        
        let response = try JSONDecoder().decode(ControllerDiscoveryResponse.self, from: data)
        return response.controllers
    }
    
    func registerController(_ controller: PWMController) async throws {
        let url = URL(string: "\(baseURL)/api/controllers/register")!
        let request = ControllerRegistrationRequest(controller: controller)
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(request)
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = data
        
        let (_, _) = try await networkManager.authenticatedRequest(request: urlRequest)
    }
    
    func setChannelDutyCycle(_ controllerId: UUID, channelId: Int, dutyCycle: Double) async throws {
        let url = URL(string: "\(baseURL)/api/channels/\(controllerId)/\(channelId)/duty-cycle")!
        
        let request = DutyCycleRequest(dutyCycle: dutyCycle)
        let encoder = JSONEncoder()
        let data = try encoder.encode(request)
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "PUT"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = data
        
        let (_, _) = try await networkManager.authenticatedRequest(request: urlRequest)
    }
    
    func startRampTest(channels: [PWMChannel], startDutyCycle: Double, endDutyCycle: Double, duration: Double, rampType: RampType) async throws {
        let url = URL(string: "\(baseURL)/api/testing/ramp")!
        
        let request = RampTestRequest(
            channels: channels,
            startDutyCycle: startDutyCycle,
            endDutyCycle: endDutyCycle,
            duration: duration,
            rampType: rampType
        )
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(request)
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = data
        
        let (_, _) = try await networkManager.authenticatedRequest(request: urlRequest)
    }
    
    func stopRampTest() async throws {
        let url = URL(string: "\(baseURL)/api/testing/stop")!
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        
        let (_, _) = try await networkManager.authenticatedRequest(request: urlRequest)
    }
}

// MARK: - API Request/Response Models
struct ControllerDiscoveryResponse: Codable {
    let controllers: [PWMController]
}

struct ControllerRegistrationRequest: Codable {
    let controller: PWMController
}

struct DutyCycleRequest: Codable {
    let dutyCycle: Double
}

struct RampTestRequest: Codable {
    let channels: [PWMChannel]
    let startDutyCycle: Double
    let endDutyCycle: Double
    let duration: Double
    let rampType: RampType
}
```

## User Experience Flow

### Settings Flow
1. **Controller Discovery**: User discovers available PWM controllers
2. **Controller Registration**: User registers controllers for use
3. **Channel Configuration**: User adds channels with proper validation
4. **Device Role Assignment**: User assigns appropriate device roles
5. **Testing Interface**: User validates PWM functionality

### Testing Flow
1. **Quick Testing**: Individual channel control with sliders
2. **Ramp Testing**: Multi-channel ramp functions with preview
3. **Test Results**: View test history and results
4. **Real-time Feedback**: Visual feedback for all operations

### Validation Flow
1. **Controller Type Validation**: Ensure proper channel limits
2. **Channel ID Validation**: Validate against controller capabilities
3. **Name Uniqueness**: Ensure unique channel names
4. **Role Assignment**: Proper device role selection

## Accessibility Features

- **VoiceOver Support**: All sliders and controls are properly labeled
- **Dynamic Type**: Text scales with system font size settings
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects system motion preferences
- **Color Blind Support**: Status indicators use both color and shape

## Implementation Checklist

### Settings Tab
- [ ] Controller discovery and registration
- [ ] Channel configuration with validation
- [ ] Device role assignment
- [ ] Controller type-specific validation
- [ ] Channel management interface
- [ ] Settings persistence

### Testing Tab
- [ ] Individual channel testing with sliders
- [ ] Multi-channel ramp testing
- [ ] Ramp type selection (linear, ease-in, ease-out, ease-in-out)
- [ ] Real-time duty cycle display
- [ ] Test results tracking
- [ ] Visual ramp preview

### API Integration
- [ ] Controller discovery endpoints
- [ ] Channel registration and management
- [ ] Duty cycle control
- [ ] Ramp testing functions
- [ ] Real-time status monitoring
- [ ] Error handling and retry mechanisms

### Data Management
- [ ] Controller configuration persistence
- [ ] Channel configuration storage
- [ ] Test results caching
- [ ] Validation logic
- [ ] Real-time updates

### Testing
- [ ] Unit tests for validation logic
- [ ] Integration tests for API calls
- [ ] UI tests for slider interactions
- [ ] Ramp function testing
- [ ] Error scenario testing 