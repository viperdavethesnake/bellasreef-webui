import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Edit3,
  Clock
} from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { TokenStorage } from '../utils/storage';
import { 
  Modal, 
  Input, 
  Select, 
  Checkbox, 
  FormSection, 
  FormRow, 
  FormActions,
  Button 
} from '../components';

interface TemperatureProbe {
  id: string;
  name: string;
  temperature: number;
  humidity?: number;
  status: 'active' | 'inactive' | 'error';
  last_reading: string;
  registered?: boolean;
  deviceId?: number;
  poll_enabled?: boolean;
  poll_interval?: number;
  unit?: string;
  min_value?: number;
  max_value?: number;
  resolution?: number;
  role?: string;
}

export default function TemperatureSettings() {
  const { isAuthenticated } = useAuth();
  const [serviceHealth, setServiceHealth] = useState<{status: string, version: string, timestamp: string} | null>(null);
  const [subsystemStatus, setSubsystemStatus] = useState<{subsystem_available: boolean, device_count: number, error: string | null, details: string | null} | null>(null);
  const [registeredProbes, setRegisteredProbes] = useState<TemperatureProbe[]>([]);
  const [discoveredProbes, setDiscoveredProbes] = useState<TemperatureProbe[]>([]);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingProbe, setEditingProbe] = useState<TemperatureProbe | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProbeData, setEditingProbeData] = useState<any>(null);
  const [registrationFormData, setRegistrationFormData] = useState({
    name: '',
    role: 'tank_monitor',
    unit: 'F',
    min_value: 68,
    max_value: 86,
    poll_enabled: true,
    poll_interval: 60
  });

  useEffect(() => {
    // Fetch service health on mount
    ApiService.getTemperatureServiceHealth()
      .then(res => setServiceHealth({ status: res.data.status, version: res.data.version, timestamp: res.data.timestamp }))
      .catch(() => setServiceHealth(null));
    
    // Fetch subsystem status (requires auth)
    if (isAuthenticated) {
      ApiService.getTemperatureSubsystemStatus()
        .then(res => setSubsystemStatus(res.data))
        .catch(() => setSubsystemStatus(null));
    } else {
      setSubsystemStatus(null);
    }
    
    loadTemperatureData();
  }, [isAuthenticated]);

  const loadTemperatureData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load registered probes from the correct endpoint
      const response = await ApiService.getCurrentTemperature();
      const data = response.data;
      console.log('Registered probes response:', data);
      
      // Handle different possible response structures
      let probes = [];
      if (Array.isArray(data)) {
        probes = data;
      } else if (data && Array.isArray(data.probes)) {
        probes = data.probes;
      } else if (data && Array.isArray(data.devices)) {
        probes = data.devices;
      } else {
        console.warn('Unexpected registered probes response structure:', data);
        probes = [];
      }
      
      // Map probes and fetch temperature readings for each
      const probesWithReadings = await Promise.all(probes.map(async (probe: any) => {
        // Use the correct integer device ID for API calls
        const deviceId = probe.id || probe.device_id;
        let temperature = 0;
        let lastReading = probe.last_reading || probe.updated_at || new Date().toISOString();
        
        console.log(`Processing probe:`, { 
          name: probe.name, 
          deviceId: deviceId, 
          address: probe.address, 
          hardware_id: probe.hardware_id 
        });
        
        try {
          // Fetch current temperature reading for this registered probe
          if (deviceId && typeof deviceId === 'number') {
            const readingResponse = await ApiService.getRegisteredProbeReading(deviceId, 'F');
            const readingData = readingResponse.data;
            console.log(`Reading for probe ${deviceId}:`, readingData);
            temperature = readingData.temperature || readingData.temp || 0;
            lastReading = readingData.timestamp || readingData.last_reading || lastReading;
          } else {
            console.warn(`Invalid deviceId for probe ${probe.name}:`, deviceId);
          }
        } catch (readingErr) {
          console.warn(`Failed to get reading for probe ${deviceId}:`, readingErr);
          
          // Fallback: try hardware reading endpoint
          try {
            const hardwareId = probe.address || probe.hardware_id;
            if (hardwareId) {
              console.log(`Trying hardware reading for ${hardwareId}`);
              const hardwareResponse = await ApiService.getProbeReading(hardwareId, 'F');
              const hardwareData = hardwareResponse.data;
              console.log(`Hardware reading for ${hardwareId}:`, hardwareData);
              temperature = hardwareData.temperature || hardwareData.temp || 0;
              lastReading = hardwareData.timestamp || hardwareData.last_reading || lastReading;
            }
          } catch (hardwareErr) {
            console.warn(`Failed to get hardware reading for ${probe.address}:`, hardwareErr);
          }
        }
        
        return {
          id: probe.address || probe.id || probe.hardware_id,
          name: probe.name || `Probe ${probe.address || probe.id}`,
          temperature: temperature,
          humidity: probe.humidity,
          status: probe.is_active ? 'active' : 'inactive',
          last_reading: lastReading,
          registered: true,
          deviceId: deviceId,
          poll_enabled: probe.poll_enabled,
          poll_interval: probe.poll_interval,
          unit: probe.unit,
          min_value: probe.min_value,
          max_value: probe.max_value,
          resolution: probe.resolution,
          role: probe.role
        };
      }));
      
      setRegisteredProbes(probesWithReadings);
    } catch (err: any) {
      setError('Failed to load temperature data');
      console.error('Temperature data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const discoverProbes = async () => {
    if (!isAuthenticated) {
      setError('Please log in first to discover probes. Use default credentials: bellas / reefrocks');
      return;
    }
    
    setDiscovering(true);
    setError(null);
    try {
      // Call the real discovery API
      const discoveryResponse = await ApiService.discoverProbes();
      console.log('Discovery response:', discoveryResponse);
      
      // Handle different possible response structures
      let discoveredProbesData = [];
      if (Array.isArray(discoveryResponse.data)) {
        discoveredProbesData = discoveryResponse.data;
      } else if (discoveryResponse.data && Array.isArray(discoveryResponse.data.probes)) {
        discoveredProbesData = discoveryResponse.data.probes;
      } else if (discoveryResponse.data && Array.isArray(discoveryResponse.data.sensors)) {
        discoveredProbesData = discoveryResponse.data.sensors;
      } else if (discoveryResponse.data && Array.isArray(discoveryResponse.data.available_sensors)) {
        discoveredProbesData = discoveryResponse.data.available_sensors;
      } else {
        console.warn('Unexpected discovery response structure:', discoveryResponse.data);
        discoveredProbesData = [];
      }
      
      // Map discovered probes to our interface
      const discovered = discoveredProbesData.map((probe: any, index: number) => {
        // If probe is a string (e.g., '000000bd3685'), treat as hardware ID
        if (typeof probe === 'string') {
          return {
            id: probe,
            name: probe,
            temperature: 0,
            status: 'active',
            last_reading: new Date().toISOString(),
            registered: false
          };
        }
        // If probe is an object, extract ID and show it as name if not registered
        const deviceId = probe.id || probe.hardware_id || probe.sensor_id || `probe_${index}`;
        return {
          id: deviceId,
          name: deviceId,
          temperature: probe.temperature || probe.temp || 0,
          humidity: probe.humidity || probe.humidity_value,
          status: probe.status || 'active',
          last_reading: probe.last_reading || probe.timestamp || new Date().toISOString(),
          registered: false
        };
      });
      
      // Filter out probes that are already registered
      const registeredProbeIds = registeredProbes.map(p => p.id);
      const unregisteredProbes = discovered.filter((probe: TemperatureProbe) => !registeredProbeIds.includes(probe.id));
      
      setDiscoveredProbes(unregisteredProbes);
      
      if (unregisteredProbes.length === 0) {
        if (discovered.length > 0) {
          setSuccess('All discovered probes are already registered');
        } else {
          setSuccess('No new probes found');
        }
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setSuccess(`Found ${unregisteredProbes.length} new probe(s)`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Discovery error:', err);
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in first.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to discover probes.');
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        setError('Network error. Please check your connection to the temperature service.');
      } else {
        setError(`Failed to discover probes: ${err.response?.data?.detail || err.message || 'Unknown error'}`);
      }
    } finally {
      setDiscovering(false);
    }
  };

  const registerProbe = async (probe: TemperatureProbe, customData: any) => {
    try {
      const registrationData = {
        name: customData.name || probe.name,
        device_type: "temperature_sensor",
        address: customData.address || probe.id,
        role: customData.role || "tank_monitor",
        unit: customData.unit || "F",
        min_value: customData.min_value || (customData.unit === "C" ? 20 : 68),
        max_value: customData.max_value || (customData.unit === "C" ? 30 : 86),
        poll_enabled: customData.poll_enabled !== undefined ? customData.poll_enabled : true,
        poll_interval: customData.poll_interval || 60,
        active: true
      };
      
      const response = await ApiService.registerProbe(registrationData);
      console.log('Registration successful:', response.data);
      
      await loadTemperatureData();
      setDiscoveredProbes(prev => prev.filter(p => p.id !== probe.id));
      setShowRegistrationModal(false);
      setEditingProbe(null);
      setSuccess('Probe registered successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to register probe: ${err.response?.data?.detail || err.message}`);
      console.error('Registration error:', err);
    }
  };

  const editProbe = async (probe: TemperatureProbe, updateData: any) => {
    if (!probe.deviceId) {
      setError('Cannot edit probe: missing device ID');
      return;
    }

    try {
      await ApiService.updateProbe(probe.deviceId, updateData);
      
      await loadTemperatureData();
      setShowEditModal(false);
      setEditingProbe(null);
      setEditingProbeData(null);
      setSuccess('Probe updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to update probe: ${err.response?.data?.detail || err.message}`);
      console.error('Update error:', err);
    }
  };

  const deleteProbe = async (probe: TemperatureProbe) => {
    if (!probe.deviceId) {
      setError('Cannot delete probe: missing device ID');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${probe.name}"? This will unregister the probe.`)) {
      return;
    }

    try {
      await ApiService.deleteProbe(probe.deviceId);
      
      await loadTemperatureData();
      setSuccess('Probe deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to delete probe: ${err.response?.data?.detail || err.message}`);
      console.error('Delete error:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTemperatureColor = (temp: number) => {
    // Aquarium temperature ranges (Fahrenheit)
    if (temp < 72 || temp > 84) {
      return 'text-red-600'; // Critical range
    } else if (temp < 74 || temp > 82) {
      return 'text-yellow-600'; // Warning range
    }
    return 'text-green-600'; // Optimal range (74-82°F)
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Temperature Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure temperature probes and monitoring settings
          </p>
        </div>
        <div className="text-center text-gray-500">Loading temperature data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Service Health Indicator */}
      <div className="flex items-center space-x-3 mb-2">
        {serviceHealth ? (
          <>
            {serviceHealth.status === 'healthy' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">Temperature Service:</span>
            <span className={serviceHealth.status === 'healthy' ? 'text-green-700' : 'text-red-700'}>
              {serviceHealth.status.charAt(0).toUpperCase() + serviceHealth.status.slice(1)}
            </span>
            <span className="text-xs text-gray-500 ml-2">v{serviceHealth.version}</span>
            <span className="text-xs text-gray-400 ml-2">{new Date(serviceHealth.timestamp).toLocaleString()}</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-yellow-700">Temperature Service: Unknown</span>
          </>
        )}
      </div>

      {/* Subsystem Status Indicator */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 flex items-center space-x-4">
        {subsystemStatus ? (
          <>
            {subsystemStatus.subsystem_available ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">Subsystem:</span>
            <span className={subsystemStatus.subsystem_available ? 'text-green-700' : 'text-red-700'}>
              {subsystemStatus.subsystem_available ? 'Available' : 'Unavailable'}
            </span>
            <span className="text-xs text-gray-500 ml-2">Devices: {subsystemStatus.device_count}</span>
            {subsystemStatus.error && (
              <span className="text-xs text-red-600 ml-2">Error: {subsystemStatus.error}</span>
            )}
            {subsystemStatus.details && (
              <span className="text-xs text-gray-600 ml-2">{subsystemStatus.details}</span>
            )}
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-700">Subsystem status unavailable</span>
          </>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Temperature Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure temperature probes and monitoring settings
        </p>
      </div>

      {error && (
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="card border-l-4 border-l-green-500 bg-green-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Discover Probes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Discover Probes</h3>
          </div>
          <button
            onClick={discoverProbes}
            disabled={discovering || !isAuthenticated}
            className="btn-primary flex items-center"
          >
            {discovering ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Discovering...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Discover Probes
              </>
            )}
          </button>
        </div>
        
        {discoveredProbes.length > 0 ? (
          <div className="space-y-3">
            {discoveredProbes.map((probe) => (
              <div key={probe.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(probe.status)}
                  <div>
                    <div className="font-medium text-gray-900">{probe.name}</div>
                    <div className="text-xs text-gray-400">
                      ID: {probe.id}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingProbe(probe);
                      setRegistrationFormData({
                        name: probe.name,
                        role: 'tank_monitor',
                        unit: 'F',
                        min_value: 68,
                        max_value: 86,
                        poll_enabled: true,
                        poll_interval: 60
                      });
                      setShowRegistrationModal(true);
                    }}
                    className="btn-secondary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            {!isAuthenticated ? (
              <>
                <p>Authentication required</p>
                <p className="text-sm">Please log in to discover temperature probes</p>
                <Link 
                  to="/login" 
                  className="inline-flex items-center mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </Link>
              </>
            ) : (
              <>
                <p>No unregistered probes found</p>
                <p className="text-sm">Click "Discover Probes" to search for new temperature sensors</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Registered Probes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Thermometer className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Registered Probes</h3>
          </div>
          <button
            onClick={loadTemperatureData}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        {registeredProbes.length > 0 ? (
          <div className="space-y-3">
            {registeredProbes.map((probe) => (
              <div key={probe.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Main probe info row */}
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(probe.status)}
                    <div>
                      <div className="font-medium text-gray-900">{probe.name}</div>
                      <div className="text-xs text-gray-500">
                        Role: {probe.role || 'tank_monitor'} • Unit: {probe.unit || 'F'} • 
                        {probe.poll_enabled ? ` Polling: ${probe.poll_interval}s` : ' Polling: Disabled'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${getTemperatureColor(probe.temperature)}`}>
                      {probe.temperature.toFixed(1)}°{probe.unit || 'F'}
                    </span>
                    {probe.humidity && (
                      <span className="text-sm text-gray-600">
                        {probe.humidity.toFixed(1)}% RH
                      </span>
                    )}
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => {
                          setEditingProbe(probe);
                          setEditingProbeData({
                            name: probe.name,
                            role: probe.role || 'tank_monitor',
                            unit: probe.unit || 'F',
                            min_value: probe.min_value || (probe.unit === 'C' ? 20 : 68),
                            max_value: probe.max_value || (probe.unit === 'C' ? 30 : 86),
                            poll_enabled: probe.poll_enabled !== undefined ? probe.poll_enabled : true,
                            poll_interval: probe.poll_interval || 60,
                            is_active: probe.status === 'active'
                          });
                          setShowEditModal(true);
                        }}
                        className="btn-secondary flex items-center px-2 py-1 text-xs"
                        title="Edit probe settings"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProbe(probe)}
                        className="btn-danger flex items-center px-2 py-1 text-xs"
                        title="Delete probe"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Configuration details row */}
                <div className="px-4 py-2 bg-white border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>
                        <span className="font-medium">Thresholds:</span> 
                        {probe.min_value ? ` ${probe.min_value}°${probe.unit || 'F'}` : ' Not set'} - 
                        {probe.max_value ? ` ${probe.max_value}°${probe.unit || 'F'}` : ' Not set'}
                      </span>
                      <span>
                        <span className="font-medium">Status:</span> 
                        <span className={probe.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                          {probe.status === 'active' ? ' Active' : ' Inactive'}
                        </span>
                      </span>
                    </div>
                    <span className="text-gray-400">
                      Last reading: {formatRelativeTime(probe.last_reading)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No registered probes</p>
            <p className="text-sm">Discover and register probes to start monitoring</p>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          setEditingProbe(null);
        }}
        title="Register Temperature Probe"
        size="lg"
      >
        <FormSection>
          <Input
            label="Probe Name *"
            value={registrationFormData.name}
            onChange={(e) => setRegistrationFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Main Tank, Sump, Display Tank"
            helperText="A friendly name to identify this temperature sensor"
          />
          
          <Input
            label="Device Address"
            value={editingProbe?.id || ''}
            readOnly
            helperText="Hardware address cannot be changed"
          />
          
          <Input
            label="Role *"
            value={registrationFormData.role}
            onChange={(e) => setRegistrationFormData(prev => ({ ...prev, role: e.target.value }))}
            placeholder="e.g., tank_monitor, sump, display"
            helperText="The purpose or location of this sensor in your system"
          />
          
          <Select
            label="Temperature Unit"
            value={registrationFormData.unit}
            onChange={(e) => setRegistrationFormData(prev => ({ ...prev, unit: e.target.value }))}
            options={[
              { value: 'F', label: 'Fahrenheit (°F)' },
              { value: 'C', label: 'Celsius (°C)' }
            ]}
          />
          
          <FormRow>
            <Input
              label="Min Temperature"
              type="number"
              value={registrationFormData.min_value}
              onChange={(e) => setRegistrationFormData(prev => ({ ...prev, min_value: parseFloat(e.target.value) || 68 }))}
              step="0.1"
              min="50"
              max="90"
            />
            <Input
              label="Max Temperature"
              type="number"
              value={registrationFormData.max_value}
              onChange={(e) => setRegistrationFormData(prev => ({ ...prev, max_value: parseFloat(e.target.value) || 86 }))}
              step="0.1"
              min="50"
              max="90"
            />
          </FormRow>
          
          <Checkbox
            label="Enable Polling"
            checked={registrationFormData.poll_enabled}
            onChange={(e) => setRegistrationFormData(prev => ({ ...prev, poll_enabled: e.target.checked }))}
          />
          
          <Select
            label="Poll Interval"
            value={registrationFormData.poll_interval.toString()}
            onChange={(e) => setRegistrationFormData(prev => ({ ...prev, poll_interval: parseInt(e.target.value) || 60 }))}
            options={[
              { value: '30', label: '30 seconds' },
              { value: '60', label: '1 minute' },
              { value: '300', label: '5 minutes' },
              { value: '600', label: '10 minutes' }
            ]}
          />
        </FormSection>
        
        <FormActions>
          <Button
            variant="secondary"
            onClick={() => {
              setShowRegistrationModal(false);
              setEditingProbe(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!registrationFormData.name || !registrationFormData.role) {
                setError('Name and role are required');
                return;
              }

              registerProbe(editingProbe!, registrationFormData);
            }}
          >
            Register Probe
          </Button>
        </FormActions>
      </Modal>

      {/* Edit Modal */}
      {showEditModal && editingProbe && editingProbeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Temperature Probe</h3>
            <div className="space-y-4">
              {/* Probe Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probe Name *
                </label>
                <input
                  type="text"
                  defaultValue={editingProbeData.name}
                  id="edit-probe-name"
                  className="input-field w-full"
                  placeholder="e.g., Main Tank, Sump, Display Tank"
                />
                <p className="text-xs text-gray-500 mt-1">A friendly name to identify this temperature sensor</p>
              </div>

              {/* Device Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Address
                </label>
                <input
                  type="text"
                  value={editingProbe.id}
                  id="edit-probe-address"
                  className="input-field w-full bg-gray-100"
                  placeholder="e.g., 28-0000123456ab"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Hardware address cannot be changed</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <input
                  type="text"
                  defaultValue={editingProbeData.role}
                  id="edit-probe-role"
                  className="input-field w-full"
                  placeholder="e.g., tank_monitor, sump, display"
                />
                <p className="text-xs text-gray-500 mt-1">The purpose or location of this sensor in your system</p>
              </div>

              {/* Temperature Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature Unit
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="edit-temperature-unit"
                      value="F"
                      defaultChecked={editingProbeData.unit === 'F'}
                      id="edit-unit-fahrenheit"
                      className="mr-2"
                    />
                    Fahrenheit (°F)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="edit-temperature-unit"
                      value="C"
                      defaultChecked={editingProbeData.unit === 'C'}
                      id="edit-unit-celsius"
                      className="mr-2"
                    />
                    Celsius (°C)
                  </label>
                </div>
              </div>

              {/* Min/Max Values */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Temperature
                  </label>
                  <input
                    type="number"
                    defaultValue={editingProbeData.min_value}
                    id="edit-probe-min-temp"
                    className="input-field w-full"
                    placeholder="68"
                    step="0.1"
                    min="50"
                    max="90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Temperature
                  </label>
                  <input
                    type="number"
                    defaultValue={editingProbeData.max_value}
                    id="edit-probe-max-temp"
                    className="input-field w-full"
                    placeholder="86"
                    step="0.1"
                    min="50"
                    max="90"
                  />
                </div>
              </div>

              {/* Poll Settings */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={editingProbeData.poll_enabled}
                    id="edit-probe-poll-enabled"
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable Polling
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poll Interval (seconds)
                  </label>
                  <select
                    defaultValue={editingProbeData.poll_interval}
                    id="edit-probe-poll-interval"
                    className="input-field w-full"
                  >
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                    <option value="600">10 minutes</option>
                  </select>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={editingProbeData.is_active}
                  id="edit-probe-is-active"
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Active (Enable monitoring)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProbe(null);
                    setEditingProbeData(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const name = (document.getElementById('edit-probe-name') as HTMLInputElement)?.value;
                    const role = (document.getElementById('edit-probe-role') as HTMLInputElement)?.value;
                    const unit = (document.querySelector('input[name="edit-temperature-unit"]:checked') as HTMLInputElement)?.value || 'F';
                    const minValue = parseFloat((document.getElementById('edit-probe-min-temp') as HTMLInputElement)?.value || '68');
                    const maxValue = parseFloat((document.getElementById('edit-probe-max-temp') as HTMLInputElement)?.value || '86');
                    const pollEnabled = (document.getElementById('edit-probe-poll-enabled') as HTMLInputElement)?.checked;
                    const pollInterval = parseInt((document.getElementById('edit-probe-poll-interval') as HTMLSelectElement)?.value || '60');
                    const isActive = (document.getElementById('edit-probe-is-active') as HTMLInputElement)?.checked;

                    if (!name || !role) {
                      setError('Name and role are required');
                      return;
                    }

                    editProbe(editingProbe, {
                      name,
                      role,
                      unit,
                      min_value: minValue,
                      max_value: maxValue,
                      poll_enabled: pollEnabled,
                      poll_interval: pollInterval,
                      is_active: isActive
                    });
                  }}
                  className="btn-primary"
                >
                  Update Probe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 