import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Settings as SettingsIcon, Thermometer, Zap, Cpu, Sun, Droplets, Activity } from 'lucide-react';
import { ApiService } from '../services/api';
import TemperatureSettings from './TemperatureSettings';
import HALSettings from './HALSettings';
import SmartOutletsSettings from './SmartOutletsSettings';

interface SystemInfo {
  model: string;
  kernel_version: string;
  os_name: string;
  release_name: string;
  uptime: string;
}

interface SystemUsage {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  temperature: number;
}

const settingsTabs = [
  { name: 'System', href: '/settings/system', icon: SettingsIcon },
  { name: 'Temperature', href: '/settings/temperature', icon: Thermometer },
  { name: 'Smart Outlets', href: '/settings/outlets', icon: Zap },
  { name: 'HAL', href: '/settings/hal', icon: Cpu },
  { name: 'Lighting', href: '/settings/lighting', icon: Sun },
  { name: 'Flow', href: '/settings/flow', icon: Droplets },
  { name: 'Telemetry', href: '/settings/telemetry', icon: Activity },
];

export default function Settings() {
  const location = useLocation();
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    model: '',
    kernel_version: '',
    os_name: '',
    release_name: '',
    uptime: ''
  });
  const [systemUsage, setSystemUsage] = useState<SystemUsage>({
    cpu_percent: 0,
    memory_percent: 0,
    disk_percent: 0,
    temperature: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch system info from host-info endpoint
        const infoResponse = await ApiService.getSystemInfo();
        const infoData = infoResponse.data;
        
        // Fetch system usage for additional metrics
        const usageResponse = await ApiService.getSystemUsage();
        const usageData = usageResponse.data;
        
        setSystemInfo({
          model: infoData.model || 'Unknown',
          kernel_version: infoData.kernel_version || 'Unknown',
          os_name: infoData.os_name || 'Unknown',
          release_name: infoData.release_name || '',
          uptime: infoData.uptime || 'Unknown'
        });
        
        setSystemUsage({
          cpu_percent: usageData.cpu_percent || 0,
          memory_percent: usageData.memory_percent || 0,
          disk_percent: usageData.disk_percent || 0,
          temperature: usageData.temperature || 0
        });
      } catch (err: any) {
        setError('Failed to load system data');
        console.error('System data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure system preferences and device settings
          </p>
        </div>
        <div className="text-center text-gray-500">Loading system data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure system preferences and device settings
          </p>
        </div>
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-500">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading System Data</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure system preferences and device settings
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {settingsTabs.map((tab) => {
            const isActive = location.pathname === tab.href;
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <Routes>
        <Route index element={<Navigate to="system" replace />} />
        <Route path="system" element={<SystemSettingsTab systemInfo={systemInfo} systemUsage={systemUsage} />} />
        <Route path="temperature" element={<TemperatureSettings />} />
        <Route path="outlets" element={<SmartOutletsSettings />} />
        <Route path="hal" element={<HALSettings />} />
        <Route path="lighting" element={<LightingSettings />} />
        <Route path="flow" element={<FlowSettings />} />
        <Route path="telemetry" element={<TelemetrySettings />} />
      </Routes>
    </div>
  );
}

// System Settings Tab Component
function SystemSettingsTab({ systemInfo, systemUsage }: { systemInfo: SystemInfo; systemUsage: SystemUsage }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* System Information */}
      <div className="card">
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">System Information</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Model</span>
            <span className="text-sm font-medium text-gray-900">{systemInfo.model}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Kernel Version</span>
            <span className="text-sm font-medium text-gray-900">{systemInfo.kernel_version}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Operating System</span>
            <span className="text-sm font-medium text-gray-900">
              {systemInfo.os_name} {systemInfo.release_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Uptime</span>
            <span className="text-sm font-medium text-gray-900">{systemInfo.uptime}</span>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="card">
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">CPU Usage</span>
            <span className="text-sm font-medium text-gray-900">{systemUsage.cpu_percent.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Memory Usage</span>
            <span className="text-sm font-medium text-gray-900">{systemUsage.memory_percent.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Disk Usage</span>
            <span className="text-sm font-medium text-gray-900">{systemUsage.disk_percent.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">System Temperature</span>
            <span className="text-sm font-medium text-gray-900">{systemUsage.temperature.toFixed(1)}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder Settings Components
function LightingSettings() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://192.168.33.126:8001/health');
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        } else {
          setError('Service unavailable');
        }
      } catch (err) {
        setError('Failed to connect to lighting service');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lighting Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure lighting system and behaviors
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading lighting service...</div>
      ) : error ? (
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-500">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lighting Service Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center mb-4">
            <Sun className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Lighting Service Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-green-600">{health?.status || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service</span>
              <span className="text-sm font-medium text-gray-900">{health?.service || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium text-gray-900">{health?.version || 'Unknown'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlowSettings() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://192.168.33.126:8002/health');
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        } else {
          setError('Service unavailable');
        }
      } catch (err) {
        setError('Failed to connect to flow service');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Flow Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure flow control and pump management
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading flow service...</div>
      ) : error ? (
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-500">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Flow Service Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center mb-4">
            <Droplets className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Flow Service Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-green-600">{health?.status || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service</span>
              <span className="text-sm font-medium text-gray-900">{health?.service || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium text-gray-900">{health?.version || 'Unknown'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TelemetrySettings() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://192.168.33.126:8005/health');
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        } else {
          setError('Service unavailable');
        }
      } catch (err) {
        setError('Failed to connect to telemetry service');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Telemetry Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure data collection and monitoring
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading telemetry service...</div>
      ) : error ? (
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-500">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Telemetry Service Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Telemetry Service Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-green-600">{health?.status || 'Unknown'}</span>
              </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service</span>
              <span className="text-sm font-medium text-gray-900">{health?.service || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium text-gray-900">{health?.version || 'Unknown'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 