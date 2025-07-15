import { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { ApiService } from '../services/api';

interface FlowHealth {
  status: string;
  version?: string;
  timestamp?: string;
  subsystem?: {
    available: boolean;
    device_count?: number;
    errors?: string[];
  };
}

export default function FlowSettings() {
  const [health, setHealth] = useState<FlowHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getFlowStatus();
      setHealth(response.data);
    } catch (err: any) {
      setError('Failed to load flow service health');
      console.error('Flow health fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Health */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Flow Service Health</h3>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-4">Loading health status...</div>
        )}

        {error && (
          <div className="text-center text-red-500 py-4">{error}</div>
        )}

        {health && (
          <div className="space-y-4">
            {/* Service Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(health.status)}
                <div>
                  <div className="font-medium text-gray-900">Service Status</div>
                  <div className="text-sm text-gray-600">
                    {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(health.status)}`}>
                {health.status.toUpperCase()}
              </div>
            </div>

            {/* Version Info */}
            {health.version && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Version</div>
                  <div className="text-sm text-gray-600">{health.version}</div>
                </div>
              </div>
            )}

            {/* Last Check */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Last Check</div>
                <div className="text-sm text-gray-600">
                  {health.timestamp ? new Date(health.timestamp).toLocaleString() : 'Just now'}
                </div>
              </div>
            </div>

            {/* Subsystem Status */}
            {health.subsystem && (
              <div className="p-4 border rounded-lg">
                <div className="font-medium text-gray-900 mb-3">Subsystem Status</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Available</span>
                    <div className="flex items-center space-x-2">
                      {health.subsystem.available ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {health.subsystem.available ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  
                  {health.subsystem.device_count !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Connected Devices</span>
                      <span className="text-sm font-medium">{health.subsystem.device_count}</span>
                    </div>
                  )}

                  {health.subsystem.errors && health.subsystem.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-800 mb-2">Errors</div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {health.subsystem.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuration Options */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Flow Configuration</h3>
        <div className="text-center text-gray-500 py-8">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Flow configuration options will be available here</p>
          <p className="text-sm mt-2">Pump settings, flow patterns, and automation rules</p>
        </div>
      </div>
    </div>
  );
} 