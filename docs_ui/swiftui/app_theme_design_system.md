# Bella's Reef App Theme & Design System

## 🌊 Ocean & Reef-Inspired Design Philosophy

The Bella's Reef iOS app embraces the beauty and tranquility of coral reef ecosystems, creating a design system that evokes the underwater world while maintaining excellent usability and accessibility. The theme celebrates the vibrant colors, organic shapes, and dynamic nature of healthy reef environments.

## 🎨 Color Palette

### Primary Ocean Colors
- **Deep Ocean Blue**: `#1B3B6F` - Primary brand color, deep ocean depths
- **Coral Reef Blue**: `#2E86AB` - Secondary brand color, clear tropical waters
- **Sunlight Gold**: `#F4A261` - Accent color, warm tropical sunlight
- **Coral Pink**: `#E76F51` - Highlight color, vibrant coral tones

### Secondary Reef Colors
- **Seafoam Green**: `#90E0EF` - Light accent, shallow reef waters
- **Deep Teal**: `#023E8A` - Dark accent, deep reef shadows
- **Sand Beige**: `#F8F1E5` - Background, sandy reef floor
- **Coral Orange**: `#FF6B35` - Warning/alert, coral bleaching awareness

### Status Colors (Ocean-Inspired)
- **Healthy Reef Green**: `#2A9D8F` - Success states, healthy coral
- **Storm Warning Orange**: `#E9C46A` - Warning states, storm conditions
- **Deep Sea Red**: `#E76F51` - Error states, coral stress
- **Ocean Gray**: `#6B705C` - Disabled states, murky water

### Gradient Combinations
- **Sunset Over Reef**: `#F4A261` → `#E76F51` → `#2E86AB`
- **Ocean Depths**: `#90E0EF` → `#2E86AB` → `#1B3B6F`
- **Coral Garden**: `#F4A261` → `#E76F51` → `#2A9D8F`
- **Tropical Waters**: `#90E0EF` → `#2A9D8F` → `#023E8A`

## 🔤 Typography

### Font Hierarchy
- **Display Title**: SF Pro Display, 32pt, Bold - "Bella's Reef"
- **Section Headers**: SF Pro Display, 24pt, Semibold - "Temperature System"
- **Body Headers**: SF Pro Display, 20pt, Medium - "System Status"
- **Body Text**: SF Pro Text, 17pt, Regular - Primary content
- **Caption**: SF Pro Text, 13pt, Regular - Secondary information
- **Button Text**: SF Pro Text, 17pt, Semibold - Interactive elements

### Typography Scale
```swift
struct ReefTypography {
    static let displayTitle = Font.system(size: 32, weight: .bold, design: .default)
    static let sectionHeader = Font.system(size: 24, weight: .semibold, design: .default)
    static let bodyHeader = Font.system(size: 20, weight: .medium, design: .default)
    static let bodyText = Font.system(size: 17, weight: .regular, design: .default)
    static let caption = Font.system(size: 13, weight: .regular, design: .default)
    static let buttonText = Font.system(size: 17, weight: .semibold, design: .default)
}
```

## 🐠 Icon System

### Ocean-Themed SF Symbols
- **Navigation**: `fish.fill` - Main navigation
- **Settings**: `gearshape.fill` - System settings
- **Health**: `heart.fill` - System health
- **Temperature**: `thermometer` - Temperature monitoring
- **Lighting**: `lightbulb.fill` - Lighting control
- **Flow**: `drop.fill` - Water flow management
- **Outlets**: `poweroutlet.type.b` - Smart outlets
- **PWM**: `waveform.path` - PWM control
- **Analytics**: `chart.line.uptrend.xyaxis` - Data analytics
- **Notifications**: `bell.fill` - Alerts and notifications

### Custom Ocean Icons
- **Coral**: Organic coral branch shapes
- **Fish**: Tropical fish silhouettes
- **Wave**: Flowing wave patterns
- **Reef**: Coral reef formations
- **Ocean**: Deep ocean patterns
- **Sunlight**: Tropical sun rays

## 🎨 Visual Elements

### Background Patterns
```swift
struct OceanBackground {
    static let coralPattern = LinearGradient(
        colors: [Color("CoralPink"), Color("CoralOrange")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let oceanDepth = LinearGradient(
        colors: [Color("SeafoamGreen"), Color("CoralReefBlue"), Color("DeepOceanBlue")],
        startPoint: .top,
        endPoint: .bottom
    )
    
    static let sunsetWaters = LinearGradient(
        colors: [Color("SunlightGold"), Color("CoralOrange"), Color("CoralPink")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
```

### Card Designs
```swift
struct ReefCardStyle {
    static let primary = RoundedRectangle(cornerRadius: 16)
        .fill(Color.white)
        .shadow(color: Color("DeepOceanBlue").opacity(0.1), radius: 8, x: 0, y: 4)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(
                    LinearGradient(
                        colors: [Color("CoralReefBlue"), Color("SeafoamGreen")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
    
    static let secondary = RoundedRectangle(cornerRadius: 12)
        .fill(Color("SandBeige"))
        .shadow(color: Color("OceanGray").opacity(0.05), radius: 4, x: 0, y: 2)
}
```

### Button Styles
```swift
struct ReefButtonStyle {
    static let primary = ButtonStyle { configuration in
        RoundedRectangle(cornerRadius: 12)
            .fill(
                LinearGradient(
                    colors: [Color("CoralReefBlue"), Color("DeepOceanBlue")],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .frame(height: 50)
            .overlay(
                configuration.label
                    .foregroundColor(.white)
                    .font(.system(size: 17, weight: .semibold))
            )
    }
    
    static let secondary = ButtonStyle { configuration in
        RoundedRectangle(cornerRadius: 12)
            .fill(Color.white)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color("CoralReefBlue"), lineWidth: 2)
            )
            .frame(height: 50)
            .overlay(
                configuration.label
                    .foregroundColor(Color("CoralReefBlue"))
                    .font(.system(size: 17, weight: .semibold))
            )
    }
}
```

## 🌊 App-Wide Theme Implementation

### Main App Structure
```swift
struct BellaReefApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.light) // Optimized for ocean theme
                .accentColor(Color("CoralReefBlue"))
        }
    }
}

struct ContentView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Image(systemName: "fish.fill")
                    Text("Reef")
                }
            
            TemperatureView()
                .tabItem {
                    Image(systemName: "thermometer")
                    Text("Temperature")
                }
            
            LightingView()
                .tabItem {
                    Image(systemName: "lightbulb.fill")
                    Text("Lighting")
                }
            
            FlowView()
                .tabItem {
                    Image(systemName: "drop.fill")
                    Text("Flow")
                }
            
            SettingsView()
                .tabItem {
                    Image(systemName: "gearshape.fill")
                    Text("Settings")
                }
        }
        .accentColor(Color("CoralReefBlue"))
    }
}
```

### Navigation Design
```swift
struct ReefNavigationView: View {
    var body: some View {
        NavigationView {
            VStack {
                // Ocean-themed header
                HStack {
                    Image(systemName: "fish.fill")
                        .foregroundColor(Color("CoralReefBlue"))
                        .font(.title)
                    
                    Text("Bella's Reef")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(Color("DeepOceanBlue"))
                    
                    Spacer()
                }
                .padding()
                .background(
                    LinearGradient(
                        colors: [Color("SeafoamGreen").opacity(0.1), Color("CoralReefBlue").opacity(0.05)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                
                // Content area
                ScrollView {
                    // Your content here
                }
                .background(Color("SandBeige"))
            }
        }
    }
}
```

## 🎯 Component-Specific Themes

### Temperature System
```swift
struct TemperatureTheme {
    static let coldColor = Color("CoralReefBlue") // Cool waters
    static let warmColor = Color("CoralOrange") // Warm tropical waters
    static let hotColor = Color("DeepSeaRed") // Coral stress
    
    static let temperatureGradient = LinearGradient(
        colors: [coldColor, warmColor, hotColor],
        startPoint: .leading,
        endPoint: .trailing
    )
}
```

### Lighting System
```swift
struct LightingTheme {
    static let offColor = Color("OceanGray") // Night time
    static let lowColor = Color("MoonlightBlue") // Moonlight
    static let mediumColor = Color("SunlightGold") // Morning light
    static let highColor = Color("CoralOrange") // Peak sunlight
    
    static let intensityGradient = LinearGradient(
        colors: [offColor, lowColor, mediumColor, highColor],
        startPoint: .leading,
        endPoint: .trailing
    )
}
```

### Flow System
```swift
struct FlowTheme {
    static let calmColor = Color("SeafoamGreen") // Gentle flow
    static let moderateColor = Color("CoralReefBlue") // Moderate flow
    static let strongColor = Color("DeepOceanBlue") // Strong flow
    
    static let flowGradient = LinearGradient(
        colors: [calmColor, moderateColor, strongColor],
        startPoint: .leading,
        endPoint: .trailing
    )
}
```

## 🌊 Animation & Motion

### Ocean-Inspired Animations
```swift
struct ReefAnimations {
    static let waveMotion = Animation.easeInOut(duration: 2.0).repeatForever(autoreverses: true)
    static let coralSway = Animation.easeInOut(duration: 3.0).repeatForever(autoreverses: true)
    static let fishSwim = Animation.linear(duration: 4.0).repeatForever(autoreverses: false)
    static let bubbleRise = Animation.easeOut(duration: 1.5).repeatForever(autoreverses: false)
}

struct WaveEffect: View {
    @State private var waveOffset: CGFloat = 0
    
    var body: some View {
        Path { path in
            path.move(to: CGPoint(x: 0, y: 50))
            path.addCurve(
                to: CGPoint(x: 400, y: 50),
                control1: CGPoint(x: 100, y: 30 + waveOffset),
                control2: CGPoint(x: 300, y: 70 + waveOffset)
            )
        }
        .stroke(Color("CoralReefBlue"), lineWidth: 2)
        .animation(ReefAnimations.waveMotion, value: waveOffset)
        .onAppear {
            waveOffset = 20
        }
    }
}
```

## 🎨 Accessibility Considerations

### Color Blind Support
- **High Contrast**: All colors tested for color blind accessibility
- **Pattern Support**: Icons use both color and shape for identification
- **Alternative Text**: Comprehensive VoiceOver descriptions
- **Size Options**: Support for larger text sizes

### Ocean Theme Accessibility
```swift
struct AccessibilityTheme {
    static let voiceOverDescriptions = [
        "fish.fill": "Reef navigation, representing the main dashboard",
        "thermometer": "Temperature monitoring, like checking ocean temperature",
        "lightbulb.fill": "Lighting control, like sunlight through water",
        "drop.fill": "Water flow management, like ocean currents"
    ]
}
```

## 🌊 Brand Identity Elements

### Logo Design
- **Primary Logo**: Stylized coral reef with fish silhouette
- **App Icon**: Rounded coral formation with tropical colors
- **Loading Animation**: Bubbles rising through water
- **Success Animation**: Fish swimming through coral

### Brand Voice
- **Friendly & Educational**: Like a marine biologist explaining reef systems
- **Calm & Tranquil**: Evoking the peaceful nature of healthy reefs
- **Professional & Reliable**: Serious about aquarium management
- **Environmental**: Emphasizing reef health and sustainability

## 🎯 Implementation Guidelines

### Color Usage Rules
1. **Primary Actions**: Use Coral Reef Blue for main actions
2. **Success States**: Use Healthy Reef Green for positive feedback
3. **Warning States**: Use Storm Warning Orange for cautions
4. **Error States**: Use Deep Sea Red for critical issues
5. **Backgrounds**: Use Sand Beige for content areas
6. **Accents**: Use Sunlight Gold for highlights and calls-to-action

### Typography Rules
1. **Hierarchy**: Maintain clear visual hierarchy with ocean theme
2. **Readability**: Ensure text is readable over ocean backgrounds
3. **Consistency**: Use consistent font weights and sizes
4. **Accessibility**: Support Dynamic Type and VoiceOver

### Icon Usage Rules
1. **Ocean Context**: Choose icons that relate to reef/ocean themes
2. **Consistency**: Use consistent icon styles throughout
3. **Clarity**: Ensure icons are clear and recognizable
4. **Accessibility**: Provide comprehensive VoiceOver descriptions

## 🌊 Theme Integration Examples

### Dashboard Card
```swift
struct ReefDashboardCard: View {
    let title: String
    let value: String
    let icon: String
    let status: ReefStatus
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(status.color)
                    .font(.title2)
                
                Spacer()
                
                Text(title)
                    .font(ReefTypography.bodyHeader)
                    .foregroundColor(Color("DeepOceanBlue"))
            }
            
            Text(value)
                .font(ReefTypography.displayTitle)
                .fontWeight(.bold)
                .foregroundColor(status.color)
        }
        .padding()
        .background(ReefCardStyle.primary)
    }
}
```

### Ocean-Themed Button
```swift
struct ReefButton: View {
    let title: String
    let action: () -> Void
    let style: ReefButtonStyle
    
    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .buttonStyle(style)
    }
}
```

This comprehensive ocean/reef theme creates a cohesive, beautiful, and functional design system that celebrates the underwater world while maintaining excellent usability and accessibility. The theme evokes the tranquility and beauty of healthy coral reefs while providing a professional interface for aquarium management. 