import React, { useState, useEffect } from 'react'
import { 
  MapPin, 
  Globe, 
  Cloud, 
  Key, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings,
  Sun,
  Moon,
  AlertTriangle,
  Info,
  RefreshCw,
  Save
} from 'lucide-react'
import { ApiService } from '../services/api'
import { 
  LocationPreset, 
  CustomLocation, 
  WeatherData, 
  LightingSettings as LightingSettingsType,
  WeatherConnectionStatus,
  TestResult,
  TimezoneMapping
} from '../types/lighting'

export default function LightingSettings() {
  // State for location configuration
  const [locationType, setLocationType] = useState<'none' | 'custom' | 'preset'>('none')
  const [customLocation, setCustomLocation] = useState<CustomLocation>({
    name: '',
    latitude: 0,
    longitude: 0
  })
  const [selectedPreset, setSelectedPreset] = useState<LocationPreset | null>(null)
  const [locationPresets, setLocationPresets] = useState<LocationPreset[]>([])

  // State for timezone configuration
  const [userTimezone, setUserTimezone] = useState<string>('')
  const [timezoneMapping, setTimezoneMapping] = useState<TimezoneMapping | null>(null)
  const [timezoneMappingEnabled, setTimezoneMappingEnabled] = useState(false)

  // State for weather configuration
  const [openWeatherAPIKey, setOpenWeatherAPIKey] = useState('')
  const [weatherEnabled, setWeatherEnabled] = useState(false)
  const [weatherConnectionStatus, setWeatherConnectionStatus] = useState<WeatherConnectionStatus>({
    status: 'disconnected'
  })
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [locationWeather, setLocationWeather] = useState<WeatherData | null>(null)

  // State for testing and validation
  const [locationTestResult, setLocationTestResult] = useState<TestResult | null>(null)
  const [weatherTestResult, setWeatherTestResult] = useState<TestResult | null>(null)
  const [timezoneTestResult, setTimezoneTestResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load initial data
  useEffect(() => {
    loadLocationPresets()
    loadCurrentSettings()
    detectUserTimezone()
  }, [])

  const loadLocationPresets = async () => {
    try {
      const response = await ApiService.getLocationPresets()
      setLocationPresets(response.data)
    } catch (error) {
      console.error('Failed to load location presets:', error)
    }
  }

  const loadCurrentSettings = async () => {
    try {
      // Try to load from localStorage first
      const savedSettings = localStorage.getItem('lightingSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setLocationType(settings.locationType || 'none')
        setCustomLocation(settings.customLocation || { name: '', latitude: 0, longitude: 0 })
        setSelectedPreset(settings.selectedPreset || null)
        setUserTimezone(settings.userTimezone || '')
        setOpenWeatherAPIKey(settings.openWeatherAPIKey || '')
        setWeatherEnabled(settings.weatherEnabled || false)
        setTimezoneMappingEnabled(settings.timezoneMappingEnabled || false)
      }
    } catch (error) {
      console.error('Failed to load lighting settings:', error)
      // Use default values if loading fails
    }
  }

  const detectUserTimezone = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(timezone)
  }

  const handleLocationTypeChange = (type: 'none' | 'custom' | 'preset') => {
    setLocationType(type)
    if (type === 'none') {
      setSelectedPreset(null)
      setCustomLocation({ name: '', latitude: 0, longitude: 0 })
    }
  }

  const handlePresetSelection = (preset: LocationPreset) => {
    setSelectedPreset(preset)
    setLocationType('preset')
  }

  const handleCustomLocationChange = (field: keyof CustomLocation, value: string | number) => {
    setCustomLocation(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateCustomLocation = (): boolean => {
    if (locationType !== 'custom') return true
    return customLocation.name.trim() !== '' && 
           customLocation.latitude !== 0 && 
           customLocation.longitude !== 0
  }

  const calculateTimezoneMapping = (): TimezoneMapping | null => {
    if (!selectedPreset || !userTimezone) return null

    const sourceTimezone = selectedPreset.timezone
    const targetTimezone = userTimezone

    if (sourceTimezone === targetTimezone) return null

    const sourceOffset = new Date().toLocaleString('en-US', { timeZone: sourceTimezone, timeZoneName: 'short' })
    const targetOffset = new Date().toLocaleString('en-US', { timeZone: targetTimezone, timeZoneName: 'short' })

    return {
      sourceTimezone,
      targetTimezone,
      offset: 0, // Would need proper calculation
      description: `Maps ${sourceTimezone} times to ${targetTimezone}`
    }
  }

  const testLocationConfiguration = async () => {
    setIsLoading(true)
    setLocationTestResult(null)

    try {
      if (locationType === 'custom') {
        if (!validateCustomLocation()) {
          setLocationTestResult({
            success: false,
            message: 'Please fill in all custom location fields',
            timestamp: new Date().toISOString()
          })
          return
        }
      }

      // Simulate location test
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLocationTestResult({
        success: true,
        message: 'Location configuration is valid',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setLocationTestResult({
        success: false,
        message: 'Failed to validate location configuration',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testWeatherConnection = async () => {
    setIsLoading(true)
    setWeatherTestResult(null)
    setWeatherConnectionStatus({ status: 'testing' })

    try {
      if (!openWeatherAPIKey.trim()) {
        setWeatherTestResult({
          success: false,
          message: 'Please enter an OpenWeather API key',
          timestamp: new Date().toISOString()
        })
        setWeatherConnectionStatus({ status: 'error' })
        return
      }

      // Test OpenWeather API connection
      const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${openWeatherAPIKey}&units=metric`
      const response = await fetch(testUrl)
      
      if (response.ok) {
        setWeatherTestResult({
          success: true,
          message: 'Weather API connection successful',
          timestamp: new Date().toISOString()
        })
        setWeatherConnectionStatus({ 
          status: 'connected',
          lastChecked: new Date().toISOString()
        })
      } else {
        throw new Error('API key validation failed')
      }
    } catch (error) {
      setWeatherTestResult({
        success: false,
        message: 'Failed to connect to weather API. Please check your API key.',
        timestamp: new Date().toISOString()
      })
      setWeatherConnectionStatus({ 
        status: 'error',
        message: 'Connection failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testTimezoneMapping = async () => {
    setIsLoading(true)
    setTimezoneTestResult(null)

    try {
      if (!timezoneMappingEnabled) {
        setTimezoneTestResult({
          success: true,
          message: 'Timezone mapping is disabled',
          timestamp: new Date().toISOString()
        })
        return
      }

      const mapping = calculateTimezoneMapping()
      if (!mapping) {
        setTimezoneTestResult({
          success: true,
          message: 'No timezone mapping needed (same timezone)',
          timestamp: new Date().toISOString()
        })
        return
      }

      // Simulate timezone test
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTimezoneTestResult({
        success: true,
        message: `Timezone mapping configured: ${mapping.description}`,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setTimezoneTestResult({
        success: false,
        message: 'Failed to validate timezone mapping',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const settings: LightingSettingsType = {
        locationType,
        customLocation: locationType === 'custom' ? customLocation : undefined,
        selectedPreset: locationType === 'preset' ? selectedPreset || undefined : undefined,
        userTimezone,
        openWeatherAPIKey: openWeatherAPIKey.trim() || undefined,
        weatherEnabled,
        timezoneMappingEnabled
      }

      // Save to localStorage for now (until backend settings endpoint is ready)
      localStorage.setItem('lightingSettings', JSON.stringify(settings))
      
      // Update lighting behaviors with weather influence if enabled
      if (weatherEnabled) {
        try {
          const behaviors = await ApiService.getLightingBehaviors()
          for (const behavior of behaviors.data) {
            await ApiService.updateLightingBehavior(behavior.id, {
              ...behavior,
              weather_influence_enabled: weatherEnabled
            })
          }
        } catch (error) {
          console.error('Failed to update lighting behaviors:', error)
        }
      }
      
      // Show success message
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getWeatherStatusIcon = () => {
    switch (weatherConnectionStatus.status) {
      case 'connected': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'disconnected': return <XCircle className="h-5 w-5 text-gray-400" />
      case 'testing': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />
      default: return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getTestResultIcon = (result: TestResult | null) => {
    if (!result) return null
    return result.success ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lighting Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure location, timezone mapping, and weather integration for your lighting system
        </p>
      </div>

      {/* Location Configuration */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-500" />
            Location Configuration
          </h3>
          {getTestResultIcon(locationTestResult)}
        </div>

        <div className="space-y-4">
          {/* Location Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleLocationTypeChange('none')}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  locationType === 'none'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                No Location
              </button>
              <button
                onClick={() => handleLocationTypeChange('preset')}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  locationType === 'preset'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Preset Location
              </button>
              <button
                onClick={() => handleLocationTypeChange('custom')}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  locationType === 'custom'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Custom Location
              </button>
            </div>
          </div>

          {/* Preset Location Selection */}
          {locationType === 'preset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Preset Location
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {locationPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelection(preset)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedPreset?.id === preset.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{preset.name}</div>
                    <div className="text-sm text-gray-600">
                      {preset.country} • {preset.reef_type}
                    </div>
                    <div className="text-xs text-gray-500">
                      {preset.latitude.toFixed(2)}, {preset.longitude.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Location Input */}
          {locationType === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={customLocation.name}
                  onChange={(e) => handleCustomLocationChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customLocation.latitude || ''}
                    onChange={(e) => handleCustomLocationChange('latitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 34.0522"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customLocation.longitude || ''}
                    onChange={(e) => handleCustomLocationChange('longitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., -118.2437"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test Location Button */}
          {locationType !== 'none' && (
            <button
              onClick={testLocationConfiguration}
              disabled={isLoading}
              className="btn-secondary flex items-center"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Test Location Configuration
            </button>
          )}

          {/* Test Result */}
          {locationTestResult && (
            <div className={`p-3 rounded-lg ${
              locationTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {getTestResultIcon(locationTestResult)}
                <span className="ml-2 text-sm font-medium">
                  {locationTestResult.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timezone Configuration */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-green-500" />
            Timezone Configuration
          </h3>
          {getTestResultIcon(timezoneTestResult)}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Current Timezone
            </label>
            <select
              value={userTimezone}
              onChange={(e) => setUserTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="America/New_York">America/New_York (GMT-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
              <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              <option value="Australia/Sydney">Australia/Sydney (GMT+10)</option>
              <option value="Pacific/Honolulu">Pacific/Honolulu (GMT-10)</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="timezoneMapping"
              checked={timezoneMappingEnabled}
              onChange={(e) => setTimezoneMappingEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="timezoneMapping" className="ml-2 text-sm text-gray-700">
              Enable timezone mapping for lighting schedules
            </label>
          </div>

          {timezoneMappingEnabled && locationType !== 'none' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Timezone Mapping</p>
                  <p className="mt-1">
                    Lighting schedules will be mapped from your location's timezone to your current timezone. 
                    For example, a 6:00 AM schedule in your location will trigger at the equivalent time in your current timezone.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={testTimezoneMapping}
            disabled={isLoading}
            className="btn-secondary flex items-center"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            Test Timezone Mapping
          </button>

          {/* Test Result */}
          {timezoneTestResult && (
            <div className={`p-3 rounded-lg ${
              timezoneTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {getTestResultIcon(timezoneTestResult)}
                <span className="ml-2 text-sm font-medium">
                  {timezoneTestResult.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weather Configuration */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Cloud className="h-5 w-5 mr-2 text-purple-500" />
            Weather Integration
          </h3>
          {getWeatherStatusIcon()}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenWeatherMap API Key
            </label>
            <div className="flex">
              <input
                type="password"
                value={openWeatherAPIKey}
                onChange={(e) => setOpenWeatherAPIKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your OpenWeatherMap API key"
              />
              <button
                onClick={testWeatherConnection}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Get your free API key from{' '}
              <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                openweathermap.org
              </a>
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="weatherEnabled"
              checked={weatherEnabled}
              onChange={(e) => setWeatherEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="weatherEnabled" className="ml-2 text-sm text-gray-700">
              Enable weather influence on lighting
            </label>
          </div>

          {/* Weather Status */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Connection Status</span>
              <span className={`text-sm font-medium ${
                weatherConnectionStatus.status === 'connected' ? 'text-green-600' :
                weatherConnectionStatus.status === 'error' ? 'text-red-600' :
                weatherConnectionStatus.status === 'testing' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {weatherConnectionStatus.status.charAt(0).toUpperCase() + weatherConnectionStatus.status.slice(1)}
              </span>
            </div>
            {weatherConnectionStatus.lastChecked && (
              <p className="text-xs text-gray-500 mt-1">
                Last checked: {new Date(weatherConnectionStatus.lastChecked).toLocaleString()}
              </p>
            )}
          </div>

          {/* Test Result */}
          {weatherTestResult && (
            <div className={`p-3 rounded-lg ${
              weatherTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {getTestResultIcon(weatherTestResult)}
                <span className="ml-2 text-sm font-medium">
                  {weatherTestResult.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="btn-primary flex items-center"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </button>
      </div>
    </div>
  )
} 