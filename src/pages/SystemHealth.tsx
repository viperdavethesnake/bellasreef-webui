import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Database } from 'lucide-react';
import { ApiService } from '../services/api';

interface SystemHealthData {
  status: string;
  services: {
    core: string;
    lighting: string;
    hal: string;
    temperature: string;
    smart_outlets: string;
  };
  alerts: Array<{
    id: string;
    level: string;
    message: string;
    timestamp: string;
  }>;
  uptime: string;
  lastRestart: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
}

export default function SystemHealth() {
  const [healthData, setHealthData] = useState<SystemHealthData>({
    status: 'unknown',
    services: {
      core: 'unknown',
      lighting: 'unknown',
      hal: 'unknown',
      temperature: 'unknown',
      smart_outlets: 'unknown'
    },
    alerts: [],
    uptime: '',
    lastRestart: '',
    cpuPercent: 0,
    memoryPercent: 0,
    diskPercent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemHealth = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get core system health
        const healthResponse = await ApiService.getSystemHealth();
        const healthData = healthResponse.data;
        
        // Get system usage
        const usageResponse = await ApiService.getSystemUsage();
        const usageData = usageResponse.data;
        
        // Get system info
        const infoResponse = await ApiService.getSystemInfo();
        const infoData = infoResponse.data;
        
        // Test other services
        const serviceStatuses = {
          core: 'healthy', // We know core is working
          lighting: 'unknown', // WIP
          hal: 'healthy', // We tested this
          temperature: 'healthy', // We tested this
          smart_outlets: 'healthy' // We tested this
        };
        
        // Test HAL service
        try {
          await ApiService.getHALStatus();
          serviceStatuses.hal = 'healthy';
        } catch (err) {
          serviceStatuses.hal = 'error';
        }
        
        // Test Temperature service
        try {
          await ApiService.getCurrentTemperature();
          serviceStatuses.temperature = 'healthy';
        } catch (err) {
          serviceStatuses.temperature = 'error';
        }
        
        // Test Smart Outlets service
        try {
          await ApiService.getOutletsStatus();
          serviceStatuses.smart_outlets = 'healthy';
        } catch (err) {
          serviceStatuses.smart_outlets = 'error';
        }
        
        setHealthData({
          status: healthData.status || 'unknown',
          services: serviceStatuses,
          alerts: [], // Would come from alerts endpoint
          uptime: infoData.uptime || '',
          lastRestart: 'Unknown', // Would come from separate endpoint
          cpuPercent: usageData.cpu_percent || 0,
          memoryPercent: usageData.memory_percent || 0,
          diskPercent: usageData.disk_percent || 0
        });
      } catch (err: any) {
        setError('Failed to load system health data');
        console.error('System health fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemHealth();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-600';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600';
      case 'error':
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'bg-green-50';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-50';
      case 'error':
      case 'unhealthy':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
      case 'unhealthy':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="mt-2 text-gray-600">
            Monitor system status and service health
          </p>
        </div>
        <div className="text-center text-gray-500">Loading system health data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="mt-2 text-gray-600">
            Monitor system status and service health
          </p>
        </div>
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading System Health</h3>
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
        <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
        <p className="mt-2 text-gray-600">
          Monitor system status and service health
        </p>
      </div>

      {/* Overall System Status */}
      <div className={`card border-l-4 ${
        healthData.status === 'healthy' 
          ? 'border-l-green-500 bg-green-50' 
          : healthData.status === 'degraded'
          ? 'border-l-yellow-500 bg-yellow-50'
          : 'border-l-red-500 bg-red-50'
      }`}>
        <div className="flex items-center">
          {getStatusIcon(healthData.status)}
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${
              healthData.status === 'healthy' 
                ? 'text-green-800' 
                : healthData.status === 'degraded'
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              System Status: {healthData.status.charAt(0).toUpperCase() + healthData.status.slice(1)}
            </h3>
            <p className={`text-sm ${
              healthData.status === 'healthy' 
                ? 'text-green-700' 
                : healthData.status === 'degraded'
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
              {healthData.status === 'healthy' 
                ? 'All systems are operating normally'
                : healthData.status === 'degraded'
                ? 'Some systems may need attention'
                : 'System issues detected'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(healthData.services).map(([service, status]) => (
            <div key={service} className={`p-4 rounded-lg border ${getStatusBgColor(status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {service.replace('_', ' ')}
                  </h4>
                  <p className={`text-sm font-medium ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                </div>
                {getStatusIcon(status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Metrics</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{healthData.cpuPercent.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">CPU Usage</div>
            <div className={`text-xs mt-1 ${
              healthData.cpuPercent > 80 ? 'text-red-600' : 
              healthData.cpuPercent > 60 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {healthData.cpuPercent > 80 ? 'High' : 
               healthData.cpuPercent > 60 ? 'Moderate' : 'Normal'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{healthData.memoryPercent.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Memory Usage</div>
            <div className={`text-xs mt-1 ${
              healthData.memoryPercent > 80 ? 'text-red-600' : 
              healthData.memoryPercent > 60 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {healthData.memoryPercent > 80 ? 'High' : 
               healthData.memoryPercent > 60 ? 'Moderate' : 'Normal'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{healthData.diskPercent.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Disk Usage</div>
            <div className={`text-xs mt-1 ${
              healthData.diskPercent > 80 ? 'text-red-600' : 
              healthData.diskPercent > 60 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {healthData.diskPercent > 80 ? 'High' : 
               healthData.diskPercent > 60 ? 'Moderate' : 'Normal'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              <Clock className="h-6 w-6 mx-auto mb-1" />
            </div>
            <div className="text-sm text-gray-600">Uptime</div>
            <div className="text-xs mt-1 text-gray-500">{healthData.uptime}</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {healthData.alerts.length > 0 ? (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {healthData.alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.level === 'error' ? 'border-l-red-500 bg-red-50' :
                alert.level === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      alert.level === 'error' ? 'text-red-800' :
                      alert.level === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    alert.level === 'error' ? 'bg-red-100 text-red-800' :
                    alert.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.level.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card border-l-4 border-l-green-500 bg-green-50">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">No Active Alerts</h3>
              <p className="text-sm text-green-700">All systems are operating normally</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}