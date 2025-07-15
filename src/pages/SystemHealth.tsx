import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Database } from 'lucide-react';
import { ApiService } from '../services/api';
import { 
  PageHeader, 
  Card, 
  StatusCard, 
  MetricCard, 
  Badge,
  DataLoadingWrapper,
  ErrorState
} from '../components';

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



  return (
    <div className="space-y-6">
      <DataLoadingWrapper
        isLoading={loading}
        error={error}
        loadingText="Loading system health data..."
        errorTitle="Failed to load system health"
        errorMessage="Unable to load system health data. Please check your connection and try again."
        errorAction={
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        }
      >
        <PageHeader
          title="System Health"
          description="Monitor system status and service health"
          statusIndicator={{
            status: healthData.status as 'healthy' | 'error' | 'warning' | 'unknown',
            text: healthData.status === 'healthy' ? 'All Systems Operational' : 
                  healthData.status === 'degraded' ? 'Some Systems Degraded' : 'System Issues Detected'
          }}
        />

      {/* Overall System Status */}
      <StatusCard
        status={healthData.status === 'healthy' ? 'success' : 
               healthData.status === 'degraded' ? 'warning' : 'error'}
      >
        <div className="flex items-center">
          {getStatusIcon(healthData.status)}
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              System Status: {healthData.status.charAt(0).toUpperCase() + healthData.status.slice(1)}
            </h3>
            <p className="text-sm text-gray-600">
              {healthData.status === 'healthy' 
                ? 'All systems are operating normally'
                : healthData.status === 'degraded'
                ? 'Some systems may need attention'
                : 'System issues detected'
              }
            </p>
          </div>
        </div>
      </StatusCard>

      {/* Service Status */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(healthData.services).map(([service, status]) => (
            <div key={service} className={`p-4 rounded-lg border ${getStatusBgColor(status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {service.replace('_', ' ')}
                  </h4>
                  <Badge variant={status === 'healthy' ? 'success' : status === 'error' ? 'error' : 'default'}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
                {getStatusIcon(status)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Metrics */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Metrics</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="CPU Usage"
            value={`${healthData.cpuPercent.toFixed(1)}%`}
            subtitle={healthData.cpuPercent > 80 ? 'High' : 
                     healthData.cpuPercent > 60 ? 'Moderate' : 'Normal'}
            trend={healthData.cpuPercent > 80 ? 'down' : 'neutral'}
          />
          
          <MetricCard
            title="Memory Usage"
            value={`${healthData.memoryPercent.toFixed(1)}%`}
            subtitle={healthData.memoryPercent > 80 ? 'High' : 
                     healthData.memoryPercent > 60 ? 'Moderate' : 'Normal'}
            trend={healthData.memoryPercent > 80 ? 'down' : 'neutral'}
          />
          
          <MetricCard
            title="Disk Usage"
            value={`${healthData.diskPercent.toFixed(1)}%`}
            subtitle={healthData.diskPercent > 80 ? 'High' : 
                     healthData.diskPercent > 60 ? 'Moderate' : 'Normal'}
            trend={healthData.diskPercent > 80 ? 'down' : 'neutral'}
          />
          
          <MetricCard
            title="Uptime"
            value={healthData.uptime}
            icon={Clock}
            trend="neutral"
          />
        </div>
      </Card>

      {/* Alerts */}
      {healthData.alerts.length > 0 ? (
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {healthData.alerts.map((alert) => (
              <StatusCard
                key={alert.id}
                status={alert.level === 'error' ? 'error' : 
                       alert.level === 'warning' ? 'warning' : 'info'}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={alert.level === 'error' ? 'error' : 
                                 alert.level === 'warning' ? 'warning' : 'info'}>
                    {alert.level.toUpperCase()}
                  </Badge>
                </div>
              </StatusCard>
            ))}
          </div>
        </Card>
      ) : (
        <StatusCard status="success">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">No Active Alerts</h3>
              <p className="text-sm text-green-700">All systems are operating normally</p>
            </div>
          </div>
        </StatusCard>
      )}
      </DataLoadingWrapper>
    </div>
  );
}