import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { SystemData } from '../../types/dashboard';
import { ApiService } from '../../services/api';

interface SystemStatusProps {
  systemData: SystemData;
  loading: boolean;
  error: string | null;
}

export default function SystemStatus({ systemData, loading, error }: SystemStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Activity className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getUsageColor = (percent: number) => {
    if (percent < 60) return 'text-green-600';
    if (percent < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageBgColor = (percent: number) => {
    if (percent < 60) return 'bg-green-100';
    if (percent < 80) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-medium text-red-900">System Status Error</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Status Banner */}
      <div className={`card ${getStatusBgColor(systemData.systemStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(systemData.systemStatus)}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                System Status: <span className={getStatusColor(systemData.systemStatus)}>
                  {systemData.systemStatus.charAt(0).toUpperCase() + systemData.systemStatus.slice(1)}
                </span>
              </h3>
              <p className="text-sm text-gray-600">
                Last updated: {new Date(systemData.lastUpdate).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Health</div>
            <div className={`text-2xl font-bold ${getStatusColor(systemData.systemStatus)}`}>
              {systemData.systemStatus === 'healthy' ? '✓' : 
               systemData.systemStatus === 'degraded' ? '⚠' : '✗'}
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Usage */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">CPU Usage</h4>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${getUsageColor(systemData.cpuPercent)}`}>
              {systemData.cpuPercent}%
            </span>
            <span className="text-sm text-gray-500">of total</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageBgColor(systemData.cpuPercent)}`}
                style={{ width: `${systemData.cpuPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Memory Usage</h4>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${getUsageColor(systemData.memoryPercent)}`}>
              {systemData.memoryPercent}%
            </span>
            <span className="text-sm text-gray-500">of total</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageBgColor(systemData.memoryPercent)}`}
                style={{ width: `${systemData.memoryPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Disk Usage */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Disk Usage</h4>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${getUsageColor(systemData.diskPercent)}`}>
              {systemData.diskPercent}%
            </span>
            <span className="text-sm text-gray-500">of total</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageBgColor(systemData.diskPercent)}`}
                style={{ width: `${systemData.diskPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 