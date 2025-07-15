# Bella's Reef Web UI - Page Organization

## Overview
This document outlines the reorganized page structure that separates configuration/settings from monitoring and control functionality.

## Page Structure

### 🏠 **Dashboard** (`/dashboard`)
- **Purpose**: Overview and quick status
- **Content**: 
  - System health summary
  - Quick stats and alerts
  - Recent activity feed
  - Daily operations overview

### 📊 **Monitor** (`/monitor/*`)
- **Purpose**: Real-time monitoring and data visualization
- **Sub-pages**:

#### **Probes** (`/monitor/probes`)
- **Purpose**: Monitor all registered probes and sensors
- **Features**:
  - Temperature probes (Main Tank, Sump, Refugium)
  - pH probes with calibration tracking
  - Salinity sensors
  - ORP (Oxidation Reduction Potential)
  - Alkalinity monitoring
  - Calcium and Magnesium levels
- **Display**:
  - Current values with high/low indicators
  - Target values and acceptable ranges
  - Last reading timestamps
  - Probe status (online/offline/error/calibrating)
  - Location information
  - Calibration due dates
- **Actions**:
  - Filter by probe type and status
  - Refresh data
  - Export reports
  - View history

#### **Power** (`/monitor/power`)
- **Purpose**: Monitor smart outlets and power consumption
- **Features**:
  - Outlet status and power consumption
  - Voltage and current readings
  - Power usage history
  - Outlet schedules

#### **System** (`/monitor/system`)
- **Purpose**: System health and performance monitoring
- **Features**:
  - CPU, memory, and disk usage
  - Network status
  - Service health checks
  - System logs and events

#### **Control** (`/monitor/control`)
- **Purpose**: Manual control panels
- **Features**:
  - HAL PWM control
  - Manual device control
  - Emergency controls

### ⚙️ **Settings** (`/settings/*`)
- **Purpose**: Configuration and device registration
- **Sub-pages**:

#### **General Settings** (`/settings`)
- **Purpose**: System configuration
- **Features**:
  - Network settings
  - System preferences
  - User management
  - Backup and restore

#### **Lighting Settings** (`/settings/lighting`)
- **Purpose**: Lighting system configuration
- **Features**:
  - Location and timezone setup
  - Weather integration
  - Lighting schedules
  - Behavior configuration
  - Channel assignments

#### **HAL Settings** (`/settings/hal`)
- **Purpose**: Hardware abstraction layer configuration
- **Features**:
  - Controller discovery and registration
  - Channel configuration
  - Device role assignment
  - HAL system settings

#### **Smart Outlets Settings** (`/settings/outlets`)
- **Purpose**: Smart outlet configuration
- **Features**:
  - Outlet discovery and registration
  - VeSync account integration
  - Network device configuration
  - Power monitoring settings

#### **Temperature Settings** (`/settings/temperature`)
- **Purpose**: Temperature system configuration
- **Features**:
  - Probe calibration
  - Target temperature settings
  - Heating/cooling thresholds
  - Temperature monitoring zones

### 💡 **Lighting** (`/lighting/*`)
- **Purpose**: Lighting control and visualization
- **Features**:
  - Real-time lighting control
  - Schedule visualization
  - Manual override controls
  - Lighting preview

## Key Principles

### 1. **Separation of Concerns**
- **Settings**: Configuration and device registration only
- **Monitor**: Data visualization and status monitoring
- **Control**: Manual control and override functions

### 2. **Monitoring-First Approach**
- **Probes Page**: Comprehensive probe monitoring with:
  - Multiple probe types (temperature, pH, salinity, ORP, etc.)
  - Real-time values with visual indicators
  - Range validation and alerts
  - Status tracking and maintenance reminders

### 3. **User Experience**
- **Clear Navigation**: Tabbed interface for easy switching
- **Visual Indicators**: Color-coded status and alerts
- **Quick Actions**: Refresh, export, and history access
- **Responsive Design**: Works on desktop and mobile

### 4. **Data Organization**
- **Probe Types**: Each probe type has its own icon and color scheme
- **Status Tracking**: Online/offline/error/calibrating states
- **Value Validation**: High/low/normal indicators
- **Time Tracking**: Last reading and calibration due dates

## Probe Types Supported

### **Temperature Probes**
- Main tank temperature
- Sump temperature
- Refugium temperature
- Equipment room temperature

### **Water Quality Probes**
- pH probes (with calibration tracking)
- Salinity sensors
- ORP (Oxidation Reduction Potential)
- Alkalinity monitoring
- Calcium levels
- Magnesium levels

### **Future Probe Types**
- Nitrate sensors
- Phosphate sensors
- Dissolved oxygen
- Conductivity/TDS
- Flow sensors
- Level sensors

## Benefits of New Organization

### 1. **Clearer Purpose**
- Settings pages focus purely on configuration
- Monitor pages focus on data visualization
- Control pages focus on manual operations

### 2. **Better User Experience**
- Users can quickly find monitoring data
- Configuration is separated from daily operations
- Clear visual hierarchy and navigation

### 3. **Scalability**
- Easy to add new probe types
- Modular page structure
- Consistent design patterns

### 4. **Maintenance**
- Easier to maintain and update
- Clear separation of concerns
- Reusable components

## Next Steps

### 1. **Backend Integration**
- Connect probe monitoring to actual backend APIs
- Implement real-time data updates
- Add probe registration and management

### 2. **Enhanced Features**
- Add probe calibration workflows
- Implement data export functionality
- Add historical data visualization
- Create alert and notification system

### 3. **Mobile Optimization**
- Ensure responsive design works well on mobile
- Add touch-friendly controls
- Optimize for mobile monitoring

### 4. **Advanced Monitoring**
- Add trend analysis
- Implement predictive maintenance
- Create automated alerting
- Add data analytics dashboard 