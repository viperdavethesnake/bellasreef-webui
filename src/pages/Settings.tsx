import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Settings as SettingsIcon, Thermometer, Zap, Cpu, Sun, Droplets, Activity, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ApiService } from '../services/api';
import PageHeader from '../components/PageHeader';
import TabNavigation from '../components/TabNavigation';
import TemperatureSettings from './TemperatureSettings';
import HALSettings from './HALSettings';
import SmartOutletsSettings from './SmartOutletsSettings';
import LightingSettings from './LightingSettings';

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
  temperature: number | null; // API doesn't include temperature
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
          temperature: usageData.temperature || null // API doesn't include temperature
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
        <PageHeader
          title="Settings"
          description="Configure system preferences and device settings"
        />
        <div className="text-center text-gray-500">Loading system data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure system preferences and device settings"
        />
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
      <PageHeader
        title="Settings"
        description="Configure system preferences and device settings"
      />

      <TabNavigation tabs={settingsTabs} />

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

// Service Status Grid Component
function ServiceStatusGrid() {
  const [serviceStatuses, setServiceStatuses] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const services = [
    { name: 'Temperature', port: 8004, icon: Thermometer, color: 'text-blue-500' },
    { name: 'Smart Outlets', port: 8002, icon: Zap, color: 'text-yellow-500' },
    { name: 'HAL', port: 8003, icon: Cpu, color: 'text-purple-500' },
    { name: 'Lighting', port: 8001, icon: Sun, color: 'text-orange-500' },
    { name: 'Flow', port: 8005, icon: Droplets, color: 'text-cyan-500' },
    { name: 'Telemetry', port: 8006, icon: Activity, color: 'text-green-500' },
  ];

  const checkAllServices = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    const statuses: {[key: string]: any} = {};
    
    for (const service of services) {
      try {
        const response = await fetch(`http://192.168.33.126:${service.port}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const data = await response.json();
          statuses[service.name] = {
            status: 'healthy',
            data: data,
            timestamp: new Date().toISOString()
          };
        } else {
          statuses[service.name] = {
            status: 'unhealthy',
            error: `HTTP ${response.status}`,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        statuses[service.name] = {
          status: 'unavailable',
          error: 'Connection failed',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    setServiceStatuses(statuses);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    checkAllServices();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'unavailable': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'unhealthy': return 'text-red-600';
      case 'unavailable': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.name} className="border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="mt-2 h-3 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => checkAllServices(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center text-sm"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const status = serviceStatuses[service.name];
        const IconComponent = service.icon;
        
        return (
          <div key={service.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IconComponent className={`h-5 w-5 ${service.color}`} />
                <span className="font-medium text-gray-900">{service.name}</span>
              </div>
              {status && getStatusIcon(status.status)}
            </div>
            
            {status && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${getStatusColor(status.status)}`}>
                    {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                  </span>
                </div>
                
                {status.data && status.data.version && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium text-gray-900">v{status.data.version}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Check:</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(status.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {status.error && (
                  <div className="text-xs text-red-600 mt-1">
                    Error: {status.error}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

// System Settings Tab Component
function SystemSettingsTab({ systemInfo, systemUsage }: { systemInfo: SystemInfo; systemUsage: SystemUsage }) {
  return (
    <div className="space-y-6">
      {/* Service Status Overview */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Service Status Overview</h3>
        </div>
        <ServiceStatusGrid />
      </div>

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
              <span className="text-sm font-medium text-gray-900">
                {systemUsage.temperature !== null ? `${systemUsage.temperature.toFixed(1)}°C` : 'Not available'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder Settings Components for services without dedicated pages

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